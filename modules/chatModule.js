let botDefaults = require( '../defaultSettings/botDefaults.js' );
let userMessages = require( '../defaultSettings/customGreetings.js' );
const { dirname } = require( "path" );
const Storage = require( "node-storage" );
const chatDataFileName = process.env.CHATDATA;


const chatFunctions = ( bot, roomDefaults ) => {

    return {
        botSpeak: function ( message, data, publicChat, recipient ) {
            let pmCommand;

            if ( recipient === undefined && data !== null ) {
                if ( data.command === "pmmed" ) {
                    pmCommand = true;
                    recipient = data.senderid;
                }
            }

            if ( pmCommand === true && publicChat === undefined ) {
                this.botPM( message, recipient );
            } else {
                this.botChat( message );
            }
        },

        botChat: function ( message ) {
            bot.speak( message );
        },

        botPM: function ( message, user ) {
            bot.pm( message, user );
        },

        buildUserToUserRandomMessage: function ( userFunctions, senderID, theMessage, receiverID ) {
            const senderUsername = userFunctions.getUsername( senderID );
            if ( senderUsername ) {
                theMessage = theMessage.replace( "@senderUsername", "@" + senderUsername );
            }

            const receiverUsername = userFunctions.getUsername( receiverID );
            if ( receiverUsername ) {
                theMessage = theMessage.replace( "@receiverUsername", "@" + receiverUsername );
            }

            return theMessage
        },

        // ========================================================

        // ========================================================
        // Misc chat functions
        // ========================================================

        isThereADJ: function ( userFunctions, data ) {
            const receiverID = userFunctions.getCurrentDJID();
            const senderID = userFunctions.whoSentTheCommand( data );

            if ( receiverID === null ) {
                this.botSpeak( "@" + userFunctions.getUsername( senderID ) + " you can't send the DJ a message if there's no DJ?!?", data, true );
                return false;
            } else {
                return true;
            }
        },

        textMessageTheDJ: function ( senderID, receiverID, messageArray, data, userFunctions ) {
            if ( this.isThereADJ( userFunctions, data ) ) {
                const randomMessage = messageArray[ Math.floor( Math.random() * messageArray.length ) ];
                const thisMessage = this.buildUserToUserRandomMessage( userFunctions, senderID, randomMessage, receiverID );

                this.botSpeak( thisMessage, data, true );
            }
        },

        pictureMessageTheDJ: function ( senderID, receiverID, messageArray, pictureArray, data, userFunctions ) {
            if ( this.isThereADJ( userFunctions, data ) ) {
                const randomMessage = messageArray[ Math.floor( Math.random() * messageArray.length ) ];
                const randomPic = pictureArray[ Math.floor( Math.random() * pictureArray.length ) ];
                const thisMessage = this.buildUserToUserRandomMessage( userFunctions, senderID, randomMessage, receiverID );

                this.botSpeak( thisMessage, data, true );
                this.botSpeak( randomPic, data, true );
            }
        },

        dynamicChatCommand: function ( data, userFunctions, theCommand, databaseFunctions ) {
            if ( this.isThereADJ( userFunctions, data ) ) {
                const receiverID = userFunctions.getCurrentDJID();
                const senderID = userFunctions.whoSentTheCommand( data );

                let thePictures = this.getDynamicChatPictures( theCommand );
                let theMessages = this.getDynamicChatMessages( theCommand );
                if ( thePictures === undefined || thePictures.length === 0 ) {
                    this.textMessageTheDJ( senderID, receiverID, theMessages, data, userFunctions )
                } else {
                    this.pictureMessageTheDJ( senderID, receiverID, theMessages, thePictures, data, userFunctions )
                }

                this.countThisCommand( databaseFunctions, theCommand )
                    .then( ( countThisCommand ) => {
                        if ( countThisCommand !== -1 && receiverID !== senderID ) {
                            userFunctions.updateCommandCount( receiverID, theCommand, databaseFunctions );
                        }
                    } )
            }
        },

        countThisCommand: function ( databaseFunctions, theCommand ) {
            return databaseFunctions.commandsToCount()
                .then( ( commands ) => {
                    return commands.indexOf( theCommand );
                } )
        },

        getDynamicChatMessages: function ( theCommand ) {
            const store = this.getChatCommandData();
            return store.get( `chatMessages.${ theCommand }.messages` );
        },

        getDynamicChatPictures: function ( theCommand ) {
            const store = this.getChatCommandData();
            return store.get( `chatMessages.${ theCommand }.pictures` );
        },

        getDynamicChatCommands: function () {
            const store = this.getChatCommandData();
            return store.get( 'chatMessages' );
        },

        getChatCommandData: function () {
            return this.returnStore( chatDataFileName );
        },

        returnStore: function ( filename ) {
            const dataFilePath = `${ dirname( require.main.filename ) }/data/${ filename }`;
            return new Storage( dataFilePath );
        },

        // ========================================================

        // ========================================================
        // Chat command functions
        // ========================================================

        multilineChatCommand: function ( data, messageVariable, pictureVariable ) {
            const sleep = ( delay ) => new Promise( ( resolve ) => setTimeout( resolve, delay ) )
            let randomMessageNumber = Math.ceil( Math.random() * messageVariable.length ) - 1;

            const readInOrder = async () => {
                for ( let messageLoop = 0; messageLoop < messageVariable[ randomMessageNumber ].length; messageLoop++ ) {
                    this.botSpeak( messageVariable[ randomMessageNumber ][ messageLoop ][ 0 ], data );
                    await sleep( messageVariable[ randomMessageNumber ][ messageLoop ][ 1 ] )
                }

                const randomPic = pictureVariable[ Math.floor( Math.random() * pictureVariable.length ) ];
                this.botSpeak( randomPic, data );
            }
            readInOrder();
        },

        coinflip: function ( data, userFunctions ) {
            const theUsername = userFunctions.getUsername( data.userid )
            let randomNumber = Math.random();
            if ( randomNumber === 0.5 ) {
                this.botSpeak( '@' + theUsername + ' I am flipping a coin. You got...an edge?!?', data, true );
            } else {
                let y = Math.ceil( randomNumber * 2 );
                switch ( y ) {
                    case 1:
                        this.botSpeak( '@' + theUsername + ' I am flipping a coin. You got...heads', data, true );
                        break;
                    case 2:
                        this.botSpeak( '@' + theUsername + ' I am flipping a coin. You got...tails', data, true );
                        break;
                }
            }
        },

        dice: function ( data, args, userFunctions ) {
            if ( args.length < 2 ) {
                this.botSpeak( `You didn't tell me how many dice to roll and how many sides they have. Check "/help dice" for more info`, data );
                return;
            }

            const theUsername = userFunctions.getUsername( data.userid );
            const diceCount = args[ 0 ];
            const diceType = args[ 1 ].split( "d" )[ 1 ];

            if ( !diceType ) {
                this.botSpeak( `The 2nd number must have a "d" before it. Check "/help dice" for more info`, data );
                return;
            }

            if ( !+diceCount || !+diceType ) {
                this.botSpeak( `Unable to read non-numeric values`, data );
                return;
            }

            if ( diceCount < 1 ) {
                this.botSpeak( `You must roll at least 1 die`, data );
                return;
            }

            if ( diceCount > 100 ) {
                this.botSpeak( `There's a max of 100 dice`, data );
                return;
            }

            if ( diceType < 3 ) {
                this.botSpeak( `These dice need at least 3 sides, otherwise, use coinflip`, data );
                return;
            }

            if ( diceType > 100 ) {
                this.botSpeak( `These dice have a max of 100 sides`, data );
                return;
            }

            let theMessage = "@" + theUsername + ", you rolled";
            let theCount = 0;
            let thisDice;

            for ( let diceLoop = 0; diceLoop < diceCount; diceLoop++ ) {
                thisDice = Math.ceil( Math.random() * diceType );
                theMessage = theMessage + " a " + thisDice + ", ";
                theCount = theCount + thisDice;
            }

            theMessage = theMessage.substring( 0, theMessage.length - 2 );
            theMessage = theMessage + " for a total of " + theCount;
            this.botSpeak( theMessage, data );
        },

        ventriloquistCommand: function ( data, args ) {
            let theMessage = '';
            for ( let wordLoop = 0; wordLoop < args.length; wordLoop++ ) {
                theMessage += args[ wordLoop ] + ' ';
            }
            theMessage = theMessage.substring( 0, theMessage.length - 1 );

            this.botSpeak( theMessage, data, true );
        },

        // ========================================================

        userGreeting: function ( data, userID, theUsername, roomFunctions, userFunctions, databaseFunctions ) {
            console.group( "userGreeting" );
            console.log( "theUsername:" + theUsername );
            console.log( "userID:" + userID );
            console.log( "isUsersWelcomeTimerActive:" + userFunctions.isUsersWelcomeTimerActive( userID ) );
            console.log( "is bot?:" + JSON.stringify( userFunctions.isThisTheBot( userID ) ) );
            if ( theUsername !== "Guest" && !userFunctions.isThisTheBot( userID ) ) {
                const customGreeting = userMessages.userGreetings.find( ( { id } ) => id === userID );
                console.log( "customGreeting:" + customGreeting );
                let theMessage;

                if ( customGreeting !== undefined ) {
                    theMessage = customGreeting.message;
                } else {
                    theMessage = roomFunctions.roomJoinMessage();
                }

                if ( roomFunctions.theme() !== false ) {
                    theMessage += '; The theme is currently set to ' + roomFunctions.theme();
                }

                if ( !userFunctions.isUsersWelcomeTimerActive( userID ) ) {
                    userFunctions.activateUsersWelcomeTimer( userID, databaseFunctions );

                    if ( roomDefaults.queueActive === true && userFunctions.howManyDJs() === 5 ) {
                        theMessage += "\nThe queue is currently active. To add yourself to the queue type /addme. To remove yourself from the queue type /removeme.";
                    }
                    if ( !roomFunctions.isRulesTimerRunning() && roomFunctions.rulesMessageOn() ) {
                        theMessage += "\n" + roomFunctions.additionalJoinMessage();
                        roomFunctions.startRulesTimer();
                    }

                    theMessage = theMessage.replace( "@username", "@" + theUsername );
                    theMessage = theMessage.replace( "@roomName", roomFunctions.roomName() );
                    console.log( "theMessage:" + theMessage );

                    this.botSpeak( theMessage, data, roomFunctions.greetInPublic(), userID );
                }
            }
            console.groupEnd();
        },

        readSongStats: function ( data, songFunctions, botFunctions ) {
            if ( botFunctions.readSongStats() ) {
                const readInOrder = async () => {
                    this.botSpeak( 'Stats for ' + songFunctions.song() + ' by ' + songFunctions.artist() + '\n:thumbsup:' + songFunctions.previousUpVotes() + ':thumbsdown:' + songFunctions.previousDownVotes() + ':heart:' + songFunctions.previousSnags(), data );
                }
                readInOrder();
            }
        },

        readPlaylistStats: function ( data ) {
            if ( botDefaults.botPlaylist !== null ) {
                this.botSpeak( 'There are currently ' + botDefaults.botPlaylist.length + ' songs in my playlist.', data );
            }
        },

        overPlayLimit: function ( data, username, playLimit ) {
            this.botSpeak( '@' + username + ' the  playlimit is currently ' + playLimit + '. Time for another DJ.', data );
        },

        eventMessageIterator: function ( botFunctions, userFunctions ) {
            if ( roomDefaults.EVENTMESSAGE === true && roomDefaults.eventMessages.length !== 0 ) {
                if ( botFunctions.messageCounter === roomDefaults.eventMessages.length ) {
                    botFunctions.messageCounter = 0; //if end of event messages array reached, reset counter
                }

                if ( roomDefaults.eventMessageThroughPm === false ) //if set to send messages through chatbox, do so
                {
                    bot.speak( roomDefaults.eventMessages[ botFunctions.messageCounter ] + "" );
                }
                else //else send message through pm
                {
                    for ( let jio = 0; jio < userFunctions.userIDs.length; jio++ ) {
                        bot.pm( roomDefaults.eventMessages[ botFunctions.messageCounter ] + "", userFunctions.userIDs[ jio ] );
                    }
                }

                ++botFunctions.messageCounter; //increment message counter
            }
        },

    }
}

module.exports = chatFunctions;