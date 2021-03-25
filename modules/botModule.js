let roomDefaults = require('../defaultSettings/roomDefaults.js');
let authModule = require('../auth.js');

module.exports = {
    attemptToReconnect: null, //used for reconnecting to the bots room if its not in there (only works if internet connection is working)
    checkActivity: Date.now(),

    checkIfConnected: function (bot) {
        {
            if (this.attemptToReconnect === null) //if a reconnection attempt is already in progress, do not attempt it
            {
                if (bot._isAuthenticated) // if bot is actually connected to turntable use the speaking method
                {
                    let currentActivity = (Date.now() - this.checkActivity) / 1000 / 60;

                    if (currentActivity > 30) //if greater than 30 minutes of no talking
                    {
                        bot.speak('ping', function (callback) //attempt to talk
                        {
                            if (callback.success === false) //if it fails
                            {
                                module.exports.reconnect(bot);
                            }
                        });
                    }
                } else //else attempt to reconnect right away
                {
                    module.exports.reconnect(bot);
                }
            }
        }
    },

    reconnect: function (bot) {
        const attemptToReconnect = this.attemptToReconnect;

        this.attemptToReconnect = setInterval(function () {
            let whichMessage;
            if (bot._isAuthenticated) {
                whichMessage = true;
                console.log('it looks like your bot is not in it\'s room. attempting to reconnect now....');
            } else {
                whichMessage = false;
                console.log('connection with turntable lost, waiting for connection to come back...');
            }

            bot.roomRegister(authModule.ROOMID, function (data) {
                if (data.success === true) {
                    roomDefaults.errorMessage = null;
                    clearInterval(attemptToReconnect);
                    module.exports.attemptToReconnect = null;
                    this.checkActivity = Date.now();

                    if (whichMessage) {
                        console.log('the bot has reconnected to the room ' +
                            'specified by your choosen roomid');
                    } else {
                        console.log('connection with turntable is back!');
                    }
                } else {
                    if (roomDefaults.errorMessage === null && typeof data.err === 'string') {
                        roomDefaults.errorMessage = data.err;
                    }
                }
            });
        }, 1000 * 10);
    },

    recordActivity: function () {
        this.checkActivity = Date.now(); //update when someone says something
    }

}