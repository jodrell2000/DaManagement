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
        botSpeak: function ( data, message, public ) {
            let pmResponse;
            let senderID;
            if ( data !== null ) {
                if ( data.command === "pmmed" ) {
                    pmResponse = true;
                    senderID = data.senderid
                }
            }

            if ( pmResponse === true && public === undefined ) {
                this.botPM( senderID, message );
            } else {
                this.botChat( message );
            }
        },

        botChat: function ( message ) {
            bot.speak( message );
        },

        botPM: function ( user, message ) {
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

                this.botSpeak( data, thisMessage, true );
            } else {
                this.botSpeak( data, "@" + userFunctions.getUsername( senderID ) + " you can't send that message if there's no DJ?!?", true );
            }
        },

        pictureMessageTheDJ: function ( data, messageVariable, pictureVariable, userFunctions ) {
            const receiverID = userFunctions.getCurrentDJID();
            const senderID = userFunctions.whoSentTheCommand( data );


            if ( receiverID !== null ) {
                const randomMessage = messageVariable[ Math.floor( Math.random() * messageVariable.length ) ];
                const randomPic = pictureVariable[ Math.floor( Math.random() * pictureVariable.length ) ];
                const thisMessage = this.buildUserToUserRandomMessage( userFunctions, senderID, randomMessage, receiverID );

                this.botSpeak( data, thisMessage, true );
                this.botSpeak( data, randomPic, true );
            } else {
                this.botSpeak( data, "@" + userFunctions.getUsername( senderID ) + " you can't send that message if there's no DJ?!?", true );
            }
        },

        // ========================================================

        // ========================================================
        // Chat command functions
        // ========================================================

        martikaCommand: function ( data, pictureVariable ) {
            const sleep = ( delay ) => new Promise( ( resolve ) => setTimeout( resolve, delay ) )
            const readInOrder = async () => {
                this.botSpeak( data, 'M' );
                await sleep( 1000 )

                this.botSpeak( data, 'A' );
                await sleep( 1000 )

                this.botSpeak( data, 'R' );
                await sleep( 1000 )

                this.botSpeak( data, 'T' );
                await sleep( 1000 )

                this.botSpeak( data, 'I' );
                await sleep( 1000 )

                this.botSpeak( data, 'K' );
                await sleep( 1000 )

                this.botSpeak( data, 'A' );
                await sleep( 1000 )

                const randomPic = pictureVariable[ Math.floor( Math.random() * pictureVariable.length ) ];
                this.botSpeak( data, randomPic, true );
            }
            readInOrder();
        },

        coinflip: function ( data, userFunctions ) {
            const theUsername = userFunctions.getUsername( data.userid )
            let randomNumber = Math.random();
            if ( randomNumber === 0.5 ) {
                this.botSpeak( data, '@' + theUsername + ' I am flipping a coin. You got...an edge?!?', true );
            } else {
                let y = Math.ceil( randomNumber * 2 );
                switch ( y ) {
                    case 1:
                        this.botSpeak( data, '@' + theUsername + ' I am flipping a coin. You got...heads', true );
                        break;
                    case 2:
                        this.botSpeak( data, '@' + theUsername + ' I am flipping a coin. You got...tails', true );
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
            this.botSpeak( data, theMessage );
        },

        ventriloquistCommand: function ( data, args ) {
            let theMessage = '';
            for ( let wordLoop = 0; wordLoop < args.length; wordLoop++ ) {
                theMessage += args[ wordLoop ] + ' ';
            }
            theMessage = theMessage.substring( 0, theMessage.length - 1 );

            this.botSpeak( data, theMessage, true );
        },

        // ========================================================

        userGreeting: function ( userID, username, roomFunctions ) {
            const customGreeting = userMessages.userGreetings.find( ({ id }) => id === userID );

            if ( customGreeting !== undefined ) {
                this.greetMessage( userID, customGreeting.message, roomFunctions );
            } else {
                this.message = '';
                if ( roomFunctions.roomJoinMessage() !== '' ) //if your not using the default greeting
                {
                    if ( roomDefaults.theme === false ) //if theres no theme this is the message.
                    {
                        this.message = roomFunctions.roomJoinMessage();
                    } else {
                        this.message = roomFunctions.roomJoinMessage() + '; The theme is currently set to: ' + roomDefaults.whatIsTheme;
                    }
                } else {
                    if ( roomDefaults.theme === false ) //if theres no theme this is the message.
                    {
                        this.message = 'Welcome to ' + roomDefaults.roomName + ' @' + username + ', enjoy your stay!';
                    } else {
                        this.message = 'Welcome to ' + roomDefaults.roomName + ' @' + username + ', the theme is currently set to: ' + roomDefaults.whatIsTheme;
                    }
                }
                this.greetMessage( userID, this.message, roomFunctions )
            }
        },

        greetMessage: function ( userID, message, roomFunctions ) {
            if ( roomFunctions.greetThroughPm() === false ) //if your not sending the message through the pm
            {
                bot.speak( message );
            } else {
                bot.pm( message, userID );
            }
        },

        readSongStats: function ( data, songFunctions, botFunctions ) {
            if ( botFunctions.readSongStats() ) {
                const sleep = ( delay ) => new Promise( ( resolve ) => setTimeout( resolve, delay ) )
                const readInOrder = async () => {
                    this.botSpeak( data, 'Stats for ' + songFunctions.song() + ' by ' + songFunctions.artist() + ':' );
                    await sleep( 10 )
                    this.botSpeak( data, ':thumbsup:' + songFunctions.previousUpVotes() + ':thumbsdown:' + songFunctions.previousDownVotes() + ':heart:' + songFunctions.previousSnags() );
                }
                readInOrder();
            }
        },

        readPlaylistStats: function ( data ) {
            if ( botDefaults.botPlaylist !== null ) {
                this.botSpeak( data, 'There are currently ' + botDefaults.botPlaylist.length + ' songs in my playlist.' );
            }
        },

        overPlayLimit: function ( data, username, playLimit ) {
            this.botSpeak( data, '@' + username + ' the  playlimit is currently ' + playLimit + '. Time for another DJ.' );
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