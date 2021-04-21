let roomDefaults = require('../defaultSettings/roomDefaults.js');

let authModule = require('../auth.js');

const botFunctions = (bot) => {
    function logMe(logLevel, message) {
        if (logLevel==='error') {
            console.log("botFunctions:" + logLevel + "->" + message + "\n");
        } else {
            if (bot.debug) {
                console.log("botFunctions:" + logLevel + "->" + message + "\n");
            }
        }
    }

    return {
        checkActivity: Date.now(),
        skipOn: null, //if true causes the bot to skip every song it plays, toggled on and off by commands
        randomOnce: 0, //a flag used to check if the /randomSong command has already been activated, 0 is no, 1 is yes
        sayOnce: true, //makes it so that the queue timeout can only be used once per per person, stops the bot from spamming
        botStartTime: null, //the current time in milliseconds when the bot has started, used for the /uptime
        uptimeTime: null, //the current time in milliseconds when the /uptime is actually used
        messageCounter: 0, //this is for the array of messages, it lets it know which message it is currently on, resets to 0 after cycling through all of them
        netwatchdogTimer: null, // Used to detect internet connection dropping out
        attemptToReconnect: null, //used for reconnecting to the bots room if its not in there (only works if internet connection is working)
        returnToRoom: true, //used to toggle on and off the bot reconnecting to its room(it toggles off when theres no internet connection because it only works when its connected to turntable.fm)
        wserrorTimeout: null, //this is for the setTimeout in ws error
        autoDjingTimer: null, //governs the timer for the bot's auto djing
        escortMeList: [], //holds the userid of everyone who has used the /escortme command, auto removed when the person leaves the stage

        checkIfConnected: function () {
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
                                    return false;
                                }
                            });
                        }
                    } else //else attempt to reconnect right away
                    {
                        return false;
                    }
                }
            }
            return true;
        },

        reconnect: function () {
            const attemptToReconnect = this.attemptToReconnect;

            this.attemptToReconnect = setInterval(function () {
                let whichMessage;
                if (bot._isAuthenticated) {
                    whichMessage = true;
                    logMe('error', 'it looks like your bot is not in it\'s room. attempting to reconnect now....');
                } else {
                    whichMessage = false;
                    logMe('error', 'connection with turntable lost, waiting for connection to come back...');
                }

                bot.roomRegister(authModule.ROOMID, function (data) {
                    if (data.success === true) {
                        roomDefaults.errorMessage = null;
                        clearInterval(attemptToReconnect);
                        module.exports.attemptToReconnect = null;
                        this.checkActivity = Date.now();

                        if (whichMessage) {
                            logMe('the bot has reconnected to the room ' +
                                'specified by your choosen roomid');
                        } else {
                            logMe('connection with turntable is back!');
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
        },
    }
}

module.exports = botFunctions;