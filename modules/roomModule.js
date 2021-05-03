let roomDefaults = require('../defaultSettings/roomDefaults.js');
let musicDefaults = require('../defaultSettings/musicDefaults.js');
let botDefaults = require('../defaultSettings/botDefaults.js');

let djCount = null; //the number of dj's on stage, gets reset every song
let checkWhoIsDj = null; //the userid of the currently playing dj
let bannedArtistsMatcher = ''; //holds the regular expression for banned artist / song matching
let stageBannedList = []; //holds the userid of everyone who is in the command based banned from stage list
let skipVoteUsers = []; //holds the userid's of everyone who has voted for the currently playing song to be skipped, is cleared every song
let lastdj = null; //holds the userid of the currently playing dj
let songLimitTimer = null; //holds the timer used to remove a dj off stage if they don't skip their song in time, and their song has exceeded the max allowed song time
let queueTimer = null; //holds the timer the auto removes dj's from the queue if they do not get on stage within the allowed time period

let greet = true //room greeting when someone joins the room(on by default)
let greetThroughPm = false; //choose whether greeting message is through the pm or the chatbox(false = chatbox, true = pm), (only works when greeting message is turned on) (off by default)
let greetingTimer = []; //holds the timeout for people that join the room, if someone rejoins before their timeout completes their timer is reset
let roomJoinMessage = ''; //the message users will see when they join the room, leave it empty for the default message (only works when greet is turned on)

const roomFunctions = (bot) => {
    function logMe(logLevel, message) {
        if (logLevel === 'error') {
            console.log("roomFunctions:" + logLevel + "->" + message + "\n");
        } else {
            if (bot.debug) {
                console.log("roomFunctions:" + logLevel + "->" + message + "\n");
            }
        }
    }
    
    return {
        djCount: () => djCount, setDJCount: function (theCount) { djCount = theCount; },
        checkWhoIsDj: () => checkWhoIsDj, setCheckWhoIsDj: function (currentDJ) { checkWhoIsDj = currentDJ; },
        bannedArtistsMatcher: () => bannedArtistsMatcher,
        stageBannedList: () => stageBannedList,
        skipVoteUsers: () => skipVoteUsers,
        lastdj: () => lastdj,
        songLimitTimer: () => songLimitTimer,
        queueTimer: () => queueTimer,

        greet: () => greet,
        enableGreet: function () { greet = true; },
        disableGreet: function () { greet = false; },

        greetThroughPm: () => greetThroughPm,
        greetingTimer: () => greetingTimer,
        roomJoinMessage: () => roomJoinMessage,

        resetSkipVoteUsers: function () {
            skipVoteUsers = []
            logMe("debug", "resetSkipVoteUsers: I've reset the Users who skipped")
        },

        queuePromptToDJ: function (userFunctions) {
            let thisMessage;
            if ((roomDefaults.queueWaitTime / 60) < 1) { //is it seconds
                thisMessage = ' you have ' + roomDefaults.queueWaitTime + ' seconds to get on stage.';
            } else if ((roomDefaults.queueWaitTime / 60) === 1) { //is it one minute
                let minute = Math.floor((roomDefaults.queueWaitTime / 60));
                thisMessage = ' you have ' + minute + ' minute to get on stage.';
            } else if ((roomDefaults.queueWaitTime / 60) > 1) { //is it more than one minute
                let minutes = Math.floor((roomDefaults.queueWaitTime / 60));
                thisMessage = ' you have ' + minutes + ' minutes to get on stage.';
            }

            bot.speak('@' + userFunctions.queueName[0] + thisMessage);
        },

        removeFirstDJFromQueue: function (botFunctions, userFunctions) {
            bot.speak('Sorry @' + userFunctions.queueName[0] + ' you have run out of time.');
            userFunctions.queueList().splice(0, 2);
            userFunctions.queueName().splice(0, 1);
            botFunctions.sayOnce = true;
        },

        readQueueMembers: function (userFunctions) {
            let queueMessage = '';
            if (userFunctions.queueName.length !== 0) {
                let queueMessage = 'The queue is now: ';
                for (let kj = 0; kj < userFunctions.queueName.length; kj++) {
                    if (kj !== (userFunctions.queueName.length - 1)) {
                        queueMessage += userFunctions.queueName[kj] + ', ';
                    } else if (kj === (userFunctions.queueName.length - 1)) {
                        queueMessage += userFunctions.queueName[kj];
                    }
                }
            } else {
                queueMessage = 'The queue is now empty.';
            }
            bot.speak(queueMessage);
        },

        clearDecksForVIPs: function (userFunctions, authModule) {
            if (userFunctions.vipList.length !== 0 && userFunctions.currentDJs().length !== userFunctions.vipList.length)
            {
                for (let p = 0; p < userFunctions.currentDJs().length; p++)
                {
                    let checkIfVip = userFunctions.vipList.indexOf(userFunctions.currentDJs()[p]);
                    if (checkIfVip === -1 && userFunctions.currentDJs()[p] !== authModule.USERID)
                    {
                        bot.remDj(userFunctions.currentDJs()[p]);
                    }
                }
            }
        },


        formatBannedArtists: function () {
            if (musicDefaults.bannedArtists.length !== 0) {
                let tempArray = [];
                let tempString = '(';

                //add a backslash in front of all special characters
                for (let i = 0; i < musicDefaults.bannedArtists.length; i++) {
                    tempArray.push(musicDefaults.bannedArtists[i].replace(/([-[\]{}()*^=!:+?.,\\$|#\s])/g, "\\$1"));
                }

                //join everything into one string
                for (let i = 0; i < musicDefaults.bannedArtists.length; i++) {
                    if (i < musicDefaults.bannedArtists.length - 1) {
                        tempString += tempArray[i] + '|';
                    } else {
                        tempString += tempArray[i] + ')';
                    }
                }

                //create regular expression
                bannedArtistsMatcher = new RegExp('\\b' + tempString + '\\b', 'i');
            }
        },

        escortDJsDown: function (currentDJ, botFunctions, userFunctions) {
            //iterates through the escort list and escorts all djs on the list off the stage.
            for (let i = 0; i < userFunctions.escortMeList().length; i++) {
                logMe("debug", "DJ to be escorted:" + currentDJ);
                if (typeof userFunctions.escortMeList()[i] !== 'undefined' && currentDJ === userFunctions.escortMeList()[i]) {
                    let lookname = userFunctions.theUsersList().indexOf(currentDJ) + 1;
                    bot.remDj(userFunctions.escortMeList()[i]);

                    if (lookname !== -1) {
                        const theMessage = '@' + userFunctions.theUsersList()[lookname] + ' had enabled escortme';
                        botFunctions.botSpeak(false, null, theMessage);
                    }

                    let removeFromList = userFunctions.escortMeList().indexOf(userFunctions.escortMeList()[i]);

                    if (removeFromList !== -1) {
                        userFunctions.escortMeList().splice(removeFromList, 1);
                    }
                }
            }
        },

        setRoomDefaults: function (data) {
            roomDefaults.detail = data.room.description; //used to get room description
            roomDefaults.roomName = data.room.name; //gets your rooms name
            roomDefaults.ttRoomName = data.room.shortcut; //gets room shortcut

            bot.playlistAll(function (callback) {
                botDefaults.botPlaylist = callback.list;
            });

        },

        clearSongLimitTimer(userFunctions, roomFunctions) {
            //this is for the song length limit
            if (songLimitTimer !== null) {
                clearTimeout(songLimitTimer);
                songLimitTimer = null;

                if (typeof userFunctions.theUsersList()[userFunctions.theUsersList().indexOf(roomFunctions.lastdj()) + 1] !== 'undefined') {
                    bot.speak("@" + userFunctions.theUsersList()[userFunctions.theUsersList().indexOf(roomFunctions.lastdj()) + 1] + ", Thanks buddy ;-)");
                } else {
                    bot.speak('Thanks buddy ;-)');
                }
            }
        }
    }
}

module.exports = roomFunctions;
