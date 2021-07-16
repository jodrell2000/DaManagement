let botDefaults         = require('../defaultSettings/botDefaults.js');
let chatCommandItems    = require('../defaultSettings/chatCommandItems.js');

const chatFunctions = (bot, roomDefaults) => {
    function logMe(logLevel, message) {
        if (logLevel === 'error') {
            console.log("chatFunctions:" + logLevel + "->" + message + "\n");
        } else {
            if (bot.debug) {
                console.log("chatFunctions:" + logLevel + "->" + message + "\n");
            }
        }
    }

    return {
        botSpeak: function (data, message, public) {
            let pmResponse;
            let senderID;
            if ( data.command === "pmmed" ) {
                pmResponse = true;
                senderID = data.senderid
            }

            if ( pmResponse === true && public === undefined ) {
                this.botPM( senderID, message);
            } else {
                this.botChat( message );
            }

        },


        botChat: function (message) {
            bot.speak(message);
        },

        botPM: function (user, message) {
            bot.pm(message, user);
        },

        // ========================================================
        // Misc chat functions
        // ========================================================

        props: function (data, userFunctions) {
            logMe('debug', 'chatModule:props...here!' );

            const currentDJID = userFunctions.getUsername(userFunctions.getCurrentDJID());
            logMe('debug', '' + currentDJID);

            const senderUsername = userFunctions.getUsername(data.userid);
            logMe('debug', '' + senderUsername);

            if ( currentDJID !== null ) {
                const receiverUsername = userFunctions.getUsername(currentDJID);

                this.botSpeak(data, '@' + senderUsername + ' gives the props to @' + receiverUsername, true);
                const randomPic = Math.floor(Math.random() * chatCommandItems.propsPics.length);
                this.botSpeak(data, chatCommandItems.propsPics[randomPic], true);
            } else {
                this.botSpeak(data, "@" + senderUsername + " you can't give props if there's no DJ?!?", true);
            }
        },

        yomamma: function (data, userFunctions) {
            const theUsername = userFunctions.getUsername(data.userid)
            let x = Math.round(Math.random() * 3);
            switch (x) {
                case 0:
                    this.botSpeak( data, '@' + theUsername + ' ur mom is fat', true);
                    break;
                case 1:
                    this.botSpeak( data,'@' + theUsername + ' yo momma sooo fat....', true);
                    break;
                case 2:
                    this.botSpeak( data,'@' + theUsername + ' damn yo momma fat', true);
                    break;
                case 3:
                    this.botSpeak( data,'@' + theUsername + ' your mother is an outstanding member of the community ' +
                        'and well liked by all.', true);
                    break;
            }
        },

        coinflip: function ( data, userFunctions ) {
            const theUsername = userFunctions.getUsername(data.userid)
            let randomNumber = Math.random();
            if ( randomNumber === 0.5 ) {
                this.botSpeak(data, '@' + theUsername + ' I am flipping a coin. You got...an edge?!?', true);
            } else {
                let y = Math.ceil(randomNumber * 2);
                switch (y) {
                    case 1:
                        this.botSpeak(data, '@' + theUsername + ' I am flipping a coin. You got...heads', true);
                        break;
                    case 2:
                        this.botSpeak(data, '@' + theUsername + ' I am flipping a coin. you got...tails', true);
                        break;
                }
            }
        },

        // ========================================================

        userGreeting: function (userID, username, roomFunctions) {
            this.message = '';

            if (roomFunctions.roomJoinMessage()  !== '') //if your not using the default greeting
            {
                if (roomDefaults.theme === false) //if theres no theme this is the message.
                {
                    this.message = roomFunctions.roomJoinMessage() ;
                } else {
                    this.message = roomFunctions.roomJoinMessage()  + '; The theme is currently set to: ' + roomDefaults.whatIsTheme;
                }
            } else {
                if (roomDefaults.theme === false) //if theres no theme this is the message.
                {
                    this.message = 'Welcome to ' + roomDefaults.roomName + ' @' + username + ', enjoy your stay!';
                } else {
                    this.message = 'Welcome to ' + roomDefaults.roomName + ' @' + username + ', the theme is currently set to: ' + roomDefaults.whatIsTheme;
                }
            }
            this.greetMessage(userID, username, this.message, roomFunctions)
        },

        greetMessage: function (userID, username, message, roomFunctions) {
            if (roomFunctions.greetThroughPm()  === false) //if your not sending the message through the pm
            {
                bot.speak('@' + username + ', ' + message);
            } else {
                bot.pm(message, userID);
            }
        },

        buildDJPlaysMessage: function (userFunctions) {
            if (userFunctions.djList().length === 0) {
                return 'There are no dj\'s on stage.';
            } else {
                let theMessage = '';
                let theUserID;
                let theUserPosition;
                let theUsername;
                for (let djLoop = 0; djLoop < userFunctions.djList().length; djLoop++) {
                    theUserID = userFunctions.djList()[djLoop];
                    theUsername = userFunctions.getUsername(theUserID);
                    theUserPosition = userFunctions.getPositionOnUsersList(theUserID);
                    theMessage = theMessage +
                        userFunctions.getUsername(userFunctions.djList()[djLoop]) +
                        ': ' +
                        userFunctions.theUsersList()[theUserPosition]['songCount'] +
                        ', ';
                }

                theMessage = 'The play counts are now ' + theMessage.substring(0, theMessage.length - 2);;
                return theMessage;
            }
        },

        readSongStats: function (songFunctions, roomDefaults) {
            if (roomDefaults.SONGSTATS) {
                bot.speak('Stats for ' + songFunctions.song() + ' by ' + songFunctions.artist() + ': ' + ':thumbsup:' + songFunctions.upVotes() + ':thumbsdown:' + songFunctions.downVotes() + ':heart:' + songFunctions.whoSnagged());
            }
        },

        readPlaylistStats: function (data) {
            if (botDefaults.botPlaylist !== null) {
                this.botSpeak(data, 'There are currently ' + botDefaults.botPlaylist.length + ' songs in my playlist.');
            }
        },

        overPlayLimit: function (username, playLimit) {
            bot.speak('@' + username + ' the  playlimit is currently ' + playLimit + '. Time for another DJ.');
        },

        eventMessageIterator: function (botFunctions, userFunctions) {
            if (roomDefaults.EVENTMESSAGE === true && roomDefaults.eventMessages.length !== 0)
            {
                if (botFunctions.messageCounter === roomDefaults.eventMessages.length)
                {
                    botFunctions.messageCounter = 0; //if end of event messages array reached, reset counter
                }

                if (roomDefaults.eventMessageThroughPm === false) //if set to send messages through chatbox, do so
                {
                    bot.speak(roomDefaults.eventMessages[botFunctions.messageCounter] + "");
                }
                else //else send message through pm
                {
                    for (let jio = 0; jio < userFunctions.userIDs.length; jio++)
                    {
                        bot.pm(roomDefaults.eventMessages[botFunctions.messageCounter] + "", userFunctions.userIDs[jio]);
                    }
                }

                ++botFunctions.messageCounter; //increment message counter
            }
        },

        repeatWelcomeMessage: function (userFunctions) {
            if (roomDefaults.MESSAGE === true && typeof roomDefaults.detail !== 'undefined')
            {
                if (roomDefaults.repeatMessageThroughPm === false) //if not doing through the pm
                {
                    if (roomDefaults.defaultMessage === true) //if using default message
                    {
                        bot.speak('Welcome to ' + roomDefaults.roomName + ', ' + roomDefaults.detail); //set the message you wish the bot to repeat here i.e rules and such.
                    }
                    else
                    {
                        bot.speak('' + roomDefaults.detail);
                    }
                }
                else
                {
                    if (roomDefaults.defaultMessage === true)
                    {
                        for (let jkl = 0; jkl < userFunctions.userIDs.length; jkl++)
                        {
                            bot.pm('Welcome to ' + roomDefaults.roomName + ', ' + roomDefaults.detail, userFunctions.userIDs[jkl]); //set the message you wish the bot to repeat here i.e rules and such.
                        }
                    }
                    else
                    {
                        for (let lkj = 0; lkj < userFunctions.userIDs.length; lkj++)
                        {
                            bot.pm('' + roomDefaults.detail, userFunctions.userIDs[lkj]); //set the message you wish the bot to repeat here i.e rules and such.
                        }
                    }
                }
            }

        }
    }
}

module.exports = chatFunctions;