let roomDefaults = require('../defaultSettings/roomDefaults.js');

module.exports = {
    userGreeting: function (bot, data) {
        let roomjoin = data.user[0];
        if (roomDefaults.roomJoinMessage !== '') //if your not using the default greeting
        {
            if (roomDefaults.theme === false) //if theres no theme this is the message.
            {
                if (roomDefaults.greetThroughPm === false) //if your not sending the message through the pm
                {
                    bot.speak('@' + roomjoin.name + ', ' + roomDefaults.roomJoinMessage);
                } else {
                    bot.pm(roomDefaults.roomJoinMessage, roomjoin.userid);
                }
            } else {
                if (this.greetThroughPm === false) {
                    bot.speak('@' + roomjoin.name + ', ' + roomDefaults.roomJoinMessage + '; The theme is currently set to: ' + roomDefaults.whatIsTheme);
                } else {
                    bot.pm(roomDefaults.roomJoinMessage + '; The theme is currently set to: ' + roomDefaults.whatIsTheme, roomjoin.userid);
                }
            }
        } else {
            if (this.theme === false) //if theres no theme this is the message.
            {
                if (roomDefaults.greetThroughPm === false) {
                    bot.speak('Welcome to ' + roomDefaults.roomName + ' @' + roomjoin.name + ', enjoy your stay!');
                } else {
                    bot.pm('Welcome to ' + roomDefaults.roomName + ' @' + roomjoin.name + ', enjoy your stay!', roomjoin.userid);
                }
            } else {
                if (roomDefaults.greetThroughPm === false) {
                    bot.speak('Welcome to ' + roomDefaults.roomName + ' @' + roomjoin.name + ', the theme is currently set to: ' + roomDefaults.whatIsTheme);
                } else {
                    bot.pm('Welcome to ' + roomDefaults.roomName + ' @' + roomjoin.name + ', the theme is currently set to: ' + roomDefaults.whatIsTheme, roomjoin.userid);
                }
            }
        }
    }
}