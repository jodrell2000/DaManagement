let roomDefaults = require('../defaultSettings/roomDefaults.js');
let botDefaults     = require('../defaultSettings/botDefaults.js');
let musicDefaults   = require('../defaultSettings/musicDefaults.js');

let authModule = require('../auth.js');

let checkActivity = Date.now();
let skipOn = null; //if true causes the bot to skip every song it plays, toggled on and off by commands
let sayOnce = true; //makes it so that the queue timeout can only be used once per per person, stops the bot from spamming
let botStartTime = null; //the current time in milliseconds when the bot has started, used for the /uptime
let uptimeTime = null; //the current time in milliseconds when the /uptime is actually used
let messageCounter = 0; //this is for the array of messages, it lets it know which message it is currently on, resets to 0 after cycling through all of them
let netwatchdogTimer = null; // Used to detect internet connection dropping out
let attemptToReconnect = null; //used for reconnecting to the bots room if its not in there (only works if internet connection is working)
let returnToRoom = true; //used to toggle on and off the bot reconnecting to its room(it toggles off when theres no internet connection because it only works when its connected to turntable.fm)
let wserrorTimeout = null; //this is for the setTimeout in ws error
let autoDjingTimer = null; //governs the timer for the bot's auto djing

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
        checkActivity: () => checkActivity,
        messageCounter: () => messageCounter,
        netwatchdogTimer: () => netwatchdogTimer,
        attemptToReconnect: () => attemptToReconnect,
        returnToRoom: () => returnToRoom,
        wserrorTimeout: () => wserrorTimeout,
        autoDjingTimer: () => autoDjingTimer,

        botStartTime: () => botStartTime,
        setBotStartTime:  function () {
            botStartTime = Date.now()
            logMe('debug', 'setBotStartTime: Setting bot start time to ' + botStartTime );
        },

        skipOn: () => skipOn,
        setSkipOn: function (value) { skipOn = value; },

        sayOnce: () => sayOnce,
        setSayOnce: function (value) { sayOnce = value; },

        uptimeTime: () => uptimeTime,
        setUptimeTime: function (value) { uptimeTime = value; },

        uptime: function (data, chatFunctions) {
            logMe('debug', 'botCommands.uptime')
            let msecPerMinute = 1000 * 60;
            let msecPerHour = msecPerMinute * 60;
            let msecPerDay = msecPerHour * 24;
            this.setUptimeTime(Date.now());
            let currentTime = this.uptimeTime() - this.botStartTime();
            logMe('debug', 'botCommands.uptime, uptimeTime:' + this.uptimeTime() )
            logMe('debug', 'botCommands.uptime, botStartTime:' + this.botStartTime() )
            logMe('debug', 'botCommands.uptime, currentTime:' + currentTime )

            let days = Math.floor(currentTime / msecPerDay);
            currentTime = currentTime - (days * msecPerDay);

            let hours = Math.floor(currentTime / msecPerHour);
            currentTime = currentTime - (hours * msecPerHour);

            let minutes = Math.floor(currentTime / msecPerMinute);

            chatFunctions.botSpeak(data, 'bot uptime: ' + days + ' days, ' + hours + ' hours, ' + minutes + ' minutes');
        },

        checkIfConnected: function () {
            {
                if (attemptToReconnect === null) //if a reconnection attempt is already in progress, do not attempt it
                {
                    if (bot._isAuthenticated) // if bot is actually connected to turntable use the speaking method
                    {
                        let currentActivity = (Date.now() - checkActivity) / 1000 / 60;

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
            attemptToReconnect = setInterval(function () {
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
                        checkActivity = Date.now();

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
            checkActivity = Date.now(); //update when someone says something
        },

        isBotOnStage: function (userFunctions) {
            logMe("debug", "Check if the bot is already on stage")
            let isBotAlreadyOnStage = userFunctions.djList().indexOf(authModule.USERID);
            return isBotAlreadyOnStage !== -1;
        },

        shouldTheBotDJ: function (userFunctions, roomFunctions) {
            logMe("debug", "Check if the bot should DJ or not")
            return userFunctions.djList().length >= 1 && // is there at least one DJ on stage
                userFunctions.djList().length <= botDefaults.whenToGetOnStage && // are there fewer than the limit of DJs on stage
                userFunctions.queueList().length === 0 && // is the queue empty
                userFunctions.vipList.length === 0 && // there no VIPs
                userFunctions.refreshList().length === 0; // is there someone currently using the refresh command
        },

        shouldStopBotDJing: function (userFunctions, roomFunctions) {
            logMe("debug", "Check if the bot stop DJing")
            return userFunctions.djList().length >= botDefaults.whenToGetOffStage && // are there enough DJs onstage
                roomFunctions.checkWhoIsDj() !== authModule.USERID; // check the Bot isn't currently DJing
        },

        checkAutoDJing: function (userFunctions, roomFunctions) {
            logMe("debug", "Check if the bot should DJ and start it, or remove if required")
            if (autoDjingTimer != null)
            {
                clearTimeout(autoDjingTimer);
                autoDjingTimer = null;
            }

            if (botDefaults.getonstage === true) {

                autoDjingTimer = setTimeout(function () {
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
            const thisSong = songFunctions.getSong();

            if (botDefaults.botPlaylist !== null && thisSong !== null) {
                if (!this.isSongInBotPlaylist(thisSong)) {
                    this.addToBotPlaylist(thisSong);
                }
            }
        },

        clearAllTimers: function (userFunctions, roomFunctions, songFunctions) {
            userFunctions.clearInformTimer(roomFunctions);
            roomFunctions.clearSongLimitTimer(userFunctions, roomFunctions);
            songFunctions.clearWatchDogTimer();
            songFunctions.clearTakedownTimer(userFunctions, roomFunctions);
        },

        checkOnNewSong: function (data, roomFunctions, songFunctions, userFunctions) {
            let length = data.room.metadata.current_song.metadata.length;
            let masterIndex; //used to tell whether current dj is on the master id's list or not

            //clears timers if previously set
            this.clearAllTimers(userFunctions, roomFunctions, songFunctions);

            // Set this after processing things from last timer calls
            roomFunctions.lastdj = data.room.metadata.current_dj;
            masterIndex = userFunctions.masterIds().indexOf(roomFunctions.lastdj); //master id's check

            songFunctions.startSongWatchdog(data, userFunctions, roomFunctions);

            //this boots the user if their song is over the length limit
            if ((length / 60) >=  roomDefaults.songLengthLimit )
            {
                if (roomFunctions.lastdj() === authModule.USERID || masterIndex === -1) //if dj is the bot or not a master
                {
                    if (musicDefaults.LIMIT === true)
                    {
                        if (typeof userFunctions.theUsersList()[userFunctions.theUsersList().indexOf(roomFunctions.lastdj) + 1] !== 'undefined')
                        {
                            bot.speak("@" + userFunctions.theUsersList()[userFunctions.theUsersList().indexOf(roomFunctions.lastdj) + 1] + ", your song is over " + roomDefaults.songLengthLimit + " mins long, you have 20 seconds to skip before being removed.");
                        }
                        else
                        {
                            bot.speak('current dj, your song is over ' + roomDefaults.songLengthLimit + ' mins long, you have 20 seconds to skip before being removed.');
                        }

                        //START THE 20 SEC TIMER
                        roomFunctions.songLimitTimer = setTimeout(function ()
                        {
                            roomFunctions.songLimitTimer = null;
                            bot.remDj(roomFunctions.lastdj()); // Remove Saved DJ from last newsong call
                        }, 20 * 1000); // Current DJ has 20 seconds to skip before they are removed
                    }
                }
            }
        },
    }
}

module.exports = botFunctions;