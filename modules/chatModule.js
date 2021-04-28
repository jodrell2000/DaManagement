const chatFunctions = (bot, roomDefaults) => {
    return {
        botMessage: function () {

        },

        botChat: function () {

        },

        userGreeting: function (userID, username) {
            this.message = '';

            if (roomDefaults.roomJoinMessage !== '') //if your not using the default greeting
            {
                if (roomDefaults.theme === false) //if theres no theme this is the message.
                {
                    this.message = roomDefaults.roomJoinMessage;
                } else {
                    this.message = roomDefaults.roomJoinMessage + '; The theme is currently set to: ' + roomDefaults.whatIsTheme;
                }
            } else {
                if (roomDefaults.theme === false) //if theres no theme this is the message.
                {
                    this.message = 'Welcome to ' + roomDefaults.roomName + ' @' + username + ', enjoy your stay!';
                } else {
                    this.message = 'Welcome to ' + roomDefaults.roomName + ' @' + username + ', the theme is currently set to: ' + roomDefaults.whatIsTheme;
                }
            }
            this.greetMessage(userID, username, this.message)
        },

        greetMessage: function (userID, username, message) {
            if (roomDefaults.greetThroughPm === false) //if your not sending the message through the pm
            {
                bot.speak('@' + username + ', ' + message);
            } else {
                bot.pm(message, userID);
            }
        },


        readSongStats: function (songFunctions, roomDefaults) {
            if (roomDefaults.SONGSTATS) {
                bot.speak('Stats for ' + songFunctions.song() + ' by ' + songFunctions.artist + ': ' + ':thumbsup:' + songFunctions.upVotes + ':thumbsdown:' + songFunctions.downVotes + ':heart:' + songFunctions.whoSnagged);
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