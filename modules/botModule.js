let roomDefaults = require('../defaultSettings/roomDefaults.js');
let botDefaults     = require('../defaultSettings/botDefaults.js');

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

        botSpeak: function (pm, user, message) {
            if (pm === true) {
                this.botPM(user, message);
            } else {
                this.botChat(message);
            }
        },

        botChat: function (message) {
            bot.speak(message);
        },

        botPM: function (user, message) {
            bot.speak(user, message);
        },

        isBotOnStage: function (userFunctions) {
            logMe("debug", "Check if the bot is already on stage")
            let isBotAlreadyOnStage = userFunctions.currentDJs.indexOf(authModule.USERID);
            return isBotAlreadyOnStage !== -1;
        },

        shouldTheBotDJ: function (userFunctions, roomFunctions) {
            logMe("debug", "Check if the bot should DJ or not")
            if (userFunctions.currentDJs.length >= 1 && // is there at least one DJ on stage
                userFunctions.currentDJs.length <= botDefaults.whenToGetOnStage && // are there fewer than the limit of DJs on stage
                roomFunctions.queueList.length === 0 && // is the queue empty
                userFunctions.vipList.length === 0 && // there no VIPs
                userFunctions.refreshList.length === 0) { // are we waiting for someone who used the refresh command
                return true; // start the Bot DJing
            } else {
                return false
            }
        },

        shouldStopBotDJing: function (userFunctions, roomFunctions) {
            logMe("debug", "Check if the bot stop DJing")
            if (userFunctions.currentDJs.length >= botDefaults.whenToGetOffStage && // are there enough DJs onstage
                roomFunctions.checkWhoIsDj !== authModule.USERID) { // is the bot the current DJ
                return true; // remove the Bot from stage
            } else {
                return false;
            }
        },

        checkAutoDJing: function (userFunctions, roomFunctions) {
            logMe("debug", "Check if the bot should DJ and start it, or remove if required")
            if (this.autoDjingTimer != null)
            {
                clearTimeout(this.autoDjingTimer);
                this.autoDjingTimer = null;
            }

            if (botDefaults.getonstage === true) {

                this.autoDjingTimer = setTimeout(function () {
                    if (!this.isBotOnStage) { //if the bot is not already on stage
                        if (this.shouldTheBotDJ(userFunctions, roomFunctions)) {
                            this.startBotDJing();
                        }
                    } else { //else it is on stage
                        if (this.shouldStopBotDJing(userFunctions, roomFunctions)) {
                            this.removeDJ(authModule.USERID); // remove the Bot from stage
                        }
                    }
                }, 1000 * 10); //delay for 10 seconds
            }
        },

        removeDJ: function (userID) {
            logMe("debug", "Remove a DJ:" + userID)
            bot.remDj(userID); // remove the Bot from stage
        },

        startBotDJing: function () {
            logMe("debug", "Start the bot DJing")
            bot.addDj(); // start the Bot DJing
        },

        isSongInBotPlaylist: function (thisSong) {
            let foundSong = false;
            for (let listLoop = 0; listLoop < botDefaults.botPlaylist.length; listLoop++) {
                if (botDefaults.botPlaylist[listLoop]._id === thisSong) {
                    foundSong = true;
                }
            }

            return foundSong;
        },

        addToBotPlaylist: function (thisSong) {
            bot.playlistAdd(thisSong, -1); //add song to the end of the playlist
            botDefaults.botPlaylist.push(thisSong);

            if (botDefaults.feart) { //whether the bot will show the heart animation or not
                bot.snag();
            }
        },

        checkAndAddToPlaylist: function (songFunctions) {
            const thisSong = songFunctions.getSong;

            if (botDefaults.botPlaylist !== null && thisSong !== null) {
                if (!this.isSongInBotPlaylist(thisSong)) {
                    this.addToBotPlaylist(thisSong);
                }
            }
        },

    }
}

module.exports = botFunctions;