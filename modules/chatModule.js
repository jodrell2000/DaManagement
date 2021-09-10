let botDefaults = require( '../defaultSettings/botDefaults.js' );
let userMessages = require( '../defaultSettings/customGreetings.js');

const chatFunctions = ( bot, roomDefaults ) => {
    function logMe ( logLevel, message ) {
        if ( logLevel === 'error' || logLevel === 'info' ) {
            console.log( "chatFunctions:" + logLevel + "->" + message + "\n" );
        } else {
            if ( bot.debug ) {
                console.log( "chatFunctions:" + logLevel + "->" + message + "\n" );
            }
        }
    }

    return {
        botSpeak: function ( message, data, publicChat, recipient ) {
            console.group('botSpeak' );
            console.info( 'message:' + message );
            console.info( 'data:' + data );
            console.info( 'publicChat:' + publicChat );
            console.info( 'recipient:' + recipient );
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
            console.groupEnd();
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
        // Misc chat functions
        // ========================================================

        textMessageTheDJ: function ( data, messageVariable, userFunctions ) {
            const receiverID = userFunctions.getCurrentDJID();
            const senderID = userFunctions.whoSentTheCommand( data );

            if ( receiverID !== null ) {
                const randomMessage = messageVariable[ Math.floor( Math.random() * messageVariable.length ) ];
                const thisMessage = this.buildUserToUserRandomMessage( userFunctions, senderID, randomMessage, receiverID );

                this.botSpeak( thisMessage, data, true );
            } else {
                this.botSpeak( "@" + userFunctions.getUsername( senderID ) + " you can't send that message if there's no DJ?!?", data, true );
            }
        },

        pictureMessageTheDJ: function ( data, messageVariable, pictureVariable, userFunctions ) {
            const receiverID = userFunctions.getCurrentDJID();
            const senderID = userFunctions.whoSentTheCommand( data );


            if ( receiverID !== null ) {
                const randomMessage = messageVariable[ Math.floor( Math.random() * messageVariable.length ) ];
                const randomPic = pictureVariable[ Math.floor( Math.random() * pictureVariable.length ) ];
                const thisMessage = this.buildUserToUserRandomMessage( userFunctions, senderID, randomMessage, receiverID );

                this.botSpeak( thisMessage, data, true );
                this.botSpeak( randomPic, data, true );
            } else {
                this.botSpeak( "@" + userFunctions.getUsername( senderID ) + " you can't send that message if there's no DJ?!?", data, true );
            }
        },

        // ========================================================

        // ========================================================
        // Chat command functions
        // ========================================================

        martikaCommand: function ( data, pictureVariable ) {
            const sleep = ( delay ) => new Promise( ( resolve ) => setTimeout( resolve, delay ) )
            const readInOrder = async () => {
                this.botSpeak( 'M', data );
                await sleep( 1000 )

                this.botSpeak( 'A', data );
                await sleep( 1000 )

                this.botSpeak( 'R', data );
                await sleep( 1000 )

                this.botSpeak( 'T', data );
                await sleep( 1000 )

                this.botSpeak( 'I', data );
                await sleep( 1000 )

                this.botSpeak( 'K', data );
                await sleep( 1000 )

                this.botSpeak( 'A', data );
                await sleep( 1000 )

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
            logMe( 'info', 'dice, command:' + JSON.stringify( args ) );
            const theUsername = userFunctions.getUsername( data.userid );
            const diceCount = args[ 0 ];
            const diceType = args[ 1 ].split( "d" )[ 1 ];

            let theMessage = "@" + theUsername + ", you rolled";
            let theCount = 0;
            let thisDice;

            for ( let diceLoop = 0; diceLoop < diceCount; diceLoop++ ) {
                thisDice = Math.floor( Math.random() * diceType );
                theMessage = theMessage + " a " + thisDice + ", ";
                theCount = theCount + thisDice;
            }

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

        userGreeting: function( data, userID, theUsername, roomFunctions, userFunctions ) {
            console.group('userGreeting')
            const customGreeting = userMessages.userGreetings.find( ( { id } ) => id === userID );
            let theMessage;

            if ( customGreeting !== undefined ) {
                theMessage = customGreeting.message;
            } else {
                theMessage = roomFunctions.roomJoinMessage();
            }

            if ( roomFunctions.theme() !== false ) {
                    theMessage += '; The theme is currently set to ' + roomFunctions.theme();
            }

            theMessage = theMessage.replace( "@username", "@" + theUsername );
            theMessage = theMessage.replace( "@roomName", roomFunctions.roomName() );

            console.info( 'theMessage:' + theMessage );
            console.info( 'roomFunctions.greetInPublic():' + roomFunctions.greetInPublic() );
            console.info( 'userID:' + userID );

            const sleep = ( delay ) => new Promise( ( resolve ) => setTimeout( resolve, delay ) )
            const readInOrder = async () => {
                await sleep( 1000 )
                this.botSpeak( theMessage, null, roomFunctions.greetInPublic(), userID );
                await sleep( 10 )
                if ( roomDefaults.queueActive === true && userFunctions.howManyDJs() === 5 ) {
                    this.botSpeak( 'The queue is currently active. To add yourself to the queue type /addme. To remove yourself from the queue type /removeme.', data, roomFunctions.greetInPublic() );
                }
            }
            readInOrder();

            console.groupEnd();
        },

        readSongStats: function ( data, songFunctions, botFunctions ) {
            if ( botFunctions.readSongStats() ) {
                const sleep = ( delay ) => new Promise( ( resolve ) => setTimeout( resolve, delay ) )
                const readInOrder = async () => {
                    this.botSpeak( 'Stats for ' + songFunctions.song() + ' by ' + songFunctions.artist() + ':', data );
                    await sleep( 10 )
                    this.botSpeak( ':thumbsup:' + songFunctions.previousUpVotes() + ':thumbsdown:' + songFunctions.previousDownVotes() + ':heart:' + songFunctions.previousSnags(), data );
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

        repeatWelcomeMessage: function ( userFunctions ) {
            if ( roomDefaults.MESSAGE === true && typeof roomDefaults.detail !== 'undefined' ) {
                if ( roomDefaults.repeatMessageThroughPm === false ) //if not doing through the pm
                {
                    if ( roomDefaults.defaultMessage === true ) //if using default message
                    {
                        bot.speak( 'Welcome to ' + roomDefaults.roomName + ', ' + roomDefaults.detail ); //set the message you wish the bot to repeat here i.e rules and such.
                    }
                    else {
                        bot.speak( '' + roomDefaults.detail );
                    }
                }
                else {
                    if ( roomDefaults.defaultMessage === true ) {
                        for ( let jkl = 0; jkl < userFunctions.userIDs.length; jkl++ ) {
                            bot.pm( 'Welcome to ' + roomDefaults.roomName + ', ' + roomDefaults.detail, userFunctions.userIDs[ jkl ] ); //set the message you wish the bot to repeat here i.e rules and such.
                        }
                    }
                    else {
                        for ( let lkj = 0; lkj < userFunctions.userIDs.length; lkj++ ) {
                            bot.pm( '' + roomDefaults.detail, userFunctions.userIDs[ lkj ] ); //set the message you wish the bot to repeat here i.e rules and such.
                        }
                    }
                }
            }

        }
    }
}

module.exports = chatFunctions;