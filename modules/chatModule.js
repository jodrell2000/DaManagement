let roomModule = require('../modules/roomModule.js')

module.exports = {
    userGreeting: function (bot, data) {
        let roomjoin = data.user[0];
        if (roomModule.roomJoinMessage !== '') //if your not using the default greeting
        {
            if (roomModule.theme === false) //if theres no theme this is the message.
            {
                if (roomModule.greetThroughPm === false) //if your not sending the message through the pm
                {
                    bot.speak('@' + roomjoin.name + ', ' + roomModule.roomJoinMessage);
                } else {
                    bot.pm(roomModule.roomJoinMessage, roomjoin.userid);
                }
            } else {
                if (this.greetThroughPm === false) {
                    bot.speak('@' + roomjoin.name + ', ' + roomModule.roomJoinMessage + '; The theme is currently set to: ' + roomModule.whatIsTheme);
                } else {
                    bot.pm(roomModule.roomJoinMessage + '; The theme is currently set to: ' + roomModule.whatIsTheme, roomjoin.userid);
                }
            }
        } else {
            if (this.theme === false) //if theres no theme this is the message.
            {
                if (roomModule.greetThroughPm === false) {
                    bot.speak('Welcome to ' + roomModule.roomName + ' @' + roomjoin.name + ', enjoy your stay!');
                } else {
                    bot.pm('Welcome to ' + roomModule.roomName + ' @' + roomjoin.name + ', enjoy your stay!', roomjoin.userid);
                }
            } else {
                if (roomModule.greetThroughPm === false) {
                    bot.speak('Welcome to ' + roomModule.roomName + ' @' + roomjoin.name + ', the theme is currently set to: ' + roomModule.whatIsTheme);
                } else {
                    bot.pm('Welcome to ' + roomModule.roomName + ' @' + roomjoin.name + ', the theme is currently set to: ' + roomModule.whatIsTheme, roomjoin.userid);
                }
            }
        }
    }
}