let authModule = require('../auth.js');

const userFunctions = (bot, roomDefaults) => {
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
        theUsersList: [], //holds the name and userid of everyone in the room
        afkPeople: [], //holds the userid of everyone who has used the /afk command
        modPM: [], //holds the userid's of everyone in the /modpm feature
        currentDJs: [], //holds the userid of all the dj's who are on stage currently
        userIDs: [], //holds the userid's of everyone who is in the room
        people: [], //holds the userid's of everyone who is kicked off stage for the spam limit
        myTime: [], //holds a date object for everyone in the room, which represents the time when they joined the room, resets every time the person rejoins
        timer: [], //holds the timeout of everyone who has been spamming the stage, resets their spam count if their timer completes
        myID: null, //the userid of the person using the /fanme command, speak event only

        bannedUsers: ['636473737373', 'bob', '535253533353', 'joe'], //banned users list, put userids in string form here for permanent banning(put their name after their userid to tell who is banned).
        bannedFromStage: ['636473737373', 'bob', '535253533353', 'joe'], //put userids in here to ban from djing permanently(put their name after their userid to tell who is banned)
        vipList: [],
        /* this is the vip list, it accepts userids as input, this is for when you have a special guest or guests in your room and you only
           want to hear them dj, leave this empty unless you want everyone other than the people whos userids are in the vip list to be automatically kicked from stage.
        */

        masterIds: ['6040a0333f4bfc001be4cf39'], //example (clear this before using)
        /*  This is the master id list, userid's that are put in here will not be affected by the song length limit, artist / song banning, the /skip command, or the dj afk limit.
            This is meant to explicitly give extra privileges to yourself and anyone else you want to put in here. It takes userid's as input in string format separated by commas.
            You can put the person's name in the array either before or after a userid to tell who it belongs to, it will not affect its ability to function.
        */

        name: null, //the name of the person using the person who activated the speak event
        isModerator: null, //is the person using a command a moderator? true or false
        index: null, //the index returned when using unban commands
        informTimer: null, //holds the timeout for the /inform command, null lets it know that it hasn't already been set
        playLimitOfRefresher: [], //holds a copy of the number of plays for people who have used the /refresh command
        refreshList: [], //this holds the userid's of people who have used the /refresh command
        refreshTimer: [], //this holds the timers of people who have used the /refresh command
        warnme: [], //holds the userid's of everyone using the /warnme feature

        djSongCount: [], //holds the song count that each of the dj's on stage have played

        roomAFK: false, //audience afk limit(off by default)
        roomafkLimit: 30, //set the afk limit for the audience here(in minutes), this feature is off by default
        AFK: true, //afk limit(on by default), this is for the dj's on stage

        lastSeen: {}, //holds a date object to be used for the dj afk timer, there are different ones because they have different timeouts
        lastSeen1: {}, //holds a date object to be used for the dj afk timer
        lastSeen2: {}, //holds a date object to be used for the dj afk timer
        lastSeen3: {}, //holds a date object to be used for the audience afk limit
        lastSeen4: {}, //holds a date object to be used for the audience afk limit

        modList: [], //set the afk limit in minutes here

        botStartReset: function () {
            userFunctions.resetEscortMeList(bot);
            userFunctions.resetUsersList();
            userFunctions.resetModList(bot);
            userFunctions.resetCurrentDJs();
            userFunctions.resetUserIDs();
            userFunctions.resetQueueList();
            userFunctions.resetQueueNames();
            userFunctions.resetPeople();
            userFunctions.resetMyTime();
            userFunctions.resetAFKPeople();
            userFunctions.resetLastSeen();
            userFunctions.resetDJSongCount();
            userFunctions.resetWarnMe();
            userFunctions.resetModPM();
        },

        resetUsersList: function () {
            this.theUsersList = []
            logMe("debug", "resetUsersList: I've reset the Users list")
        },

        resetEscortMeList: function () {
            this.escortMeList = []
            logMe("debug", "resetEscortMeList: I've reset the Escort Users list")
        },

        resetQueueNames: function () {
            this.queueName = []
            logMe("debug", "resetQueueNames: I've reset the Queue Names")
        },

        resetQueueList: function () {
            this.queueList = []
            logMe("debug", "resetQueueList: I've reset the Queue List")
        },

        resetAFKPeople: function () {
            this.afkPeople = []
            logMe("debug", "resetAFKPeople: I've reset the AFK List")
        },

        resetModPM: function () {
            this.modPM = []
            logMe("debug", "resetModPM: I've reset the ModPM List")
        },

        resetCurrentDJs: function () {
            this.currentDJs = []
            logMe("debug", "resetCurrentDJs: I've reset the Current DJs List")
        },

        resetUserIDs: function () {
            this.userIDs = []
            logMe("debug", "resetUserIDs: I've reset the UserIDs")
        },

        resetMyTime: function () {
            this.myTime = []
            logMe("debug", "resetMyTime: I've reset My Time")
        },

        resetPeople: function () {
            this.people = []
            logMe("debug", "resetPeople: I've reset the People")
        },

        resetWarnMe: function () {
            this.warnme = [];
            logMe("debug", "resetWarnMe: I've reset the Warn Me list")
        },

        resetDJSongCount: function () {
            this.djSongCount = [];
            logMe("debug", "resetDJSongCount: I've reset the DJ Song count")
        },

        resetSkipVoteUsers: function () {
            this.skipVoteUsers = []
            logMe("debug", "resetSkipVoteUsers: I've reset the Users who skipped")
        },

        resetModList: function () {
            this.modList = []
            // bot.speak("I've reset the Mod list: " + this.modList);
        },

        updateUser: function () {
            if (typeof bot.data.name === 'string') {
                let oldname = ''; //holds users old name if exists
                let queueNamePosition;
                let queueListPosition;
                let afkPeoplePosition;

                //when when person updates their profile
                //and their name is not found in the users list then they must have changed
                //their name
                if (this.theUsersList.indexOf(bot.data.name) === -1) {
                    let nameIndex = this.theUsersList.indexOf(bot.data.userid);
                    if (nameIndex !== -1) //if their userid was found in theUsersList
                    {
                        oldname = this.theUsersList[nameIndex + 1];
                        this.theUsersList[nameIndex + 1] = bot.data.name;

                        if (typeof oldname !== 'undefined') {
                            queueNamePosition = this.queueName.indexOf(oldname);
                            queueListPosition = this.queueList.indexOf(oldname);
                            afkPeoplePosition = this.afkPeople.indexOf(oldname);


                            if (queueNamePosition !== -1) //if they were in the queue when they changed their name, then replace their name
                            {
                                this.queueName[queueNamePosition] = bot.data.name;
                            }

                            if (queueListPosition !== -1) //this is also for the queue
                            {
                                this.queueList[queueListPosition] = bot.data.name;
                            }

                            if (afkPeoplePosition !== -1) //this checks the afk list
                            {
                                this.afkPeople[afkPeoplePosition] = bot.data.name;
                            }
                        }
                    }
                }
            }
        },

        deregisterUser: function (userID) {
            //removes dj's from the lastSeen object when they leave the room
            delete this.lastSeen[userID];
            delete this.lastSeen1[userID];
            delete this.lastSeen2[userID];
            delete this.lastSeen3[userID];
            delete this.lastSeen4[userID];
            delete this.people[userID];
            delete this.timer[userID];
            delete this.myTime[userID];


            //double check to make sure that if someone is on stage and they disconnect, that they are being removed
            //from the current Dj's array
            let checkIfStillInDjArray = this.currentDJs.indexOf(userID);
            if (checkIfStillInDjArray !== -1) {
                this.currentDJs.splice(checkIfStillInDjArray, 1);
            }

            //removes people who leave the room from the afk list
            if (this.afkPeople.length !== 0) {
                let checkUserName = this.afkPeople.indexOf(bot.data.user[0].name);
                if (checkUserName !== -1) {
                    this.afkPeople.splice(checkUserName, 1);
                }
            }

            //removes people leaving the room in modpm still
            if (this.modPM.length !== 0) {
                let areTheyStillInModpm = this.modPM.indexOf(userID);

                if (areTheyStillInModpm !== -1) {
                    let whatIsTheirName = this.theUsersList.indexOf(userID);
                    this.modPM.splice(areTheyStillInModpm, 1);

                    if (whatIsTheirName !== -1) {
                        for (let hg = 0; hg < this.modPM.length; hg++) {
                            if (typeof this.modPM[hg] !== 'undefined' && this.modPM[hg] !== userID) {
                                bot.pm(this.theUsersList[whatIsTheirName + 1] + ' has left the modpm chat', this.modPM[hg]);
                            }
                        }
                    }
                }
            }

            //updates the users list when a user leaves the room.
            let checkLeave = this.theUsersList.indexOf(userID);
            let checkUserIds = this.userIDs.indexOf(userID);

            if (checkLeave !== -1 && checkUserIds !== -1) {
                this.theUsersList.splice(checkLeave, 2);
                this.userIDs.splice(checkUserIds, 1);
            }
        },

        bootNewUserCheck: function () {
            let bootUser = false;
            let bootMessage = null;
            const user = bot.data.user[0];

            if (roomDefaults.kickTTSTAT === true && user.name.match('@ttstat')) {
                bootUser = true;
            }

            //checks to see if user is on the blacklist, if they are they are booted from the room.
            for (let i = 0; i < roomDefaults.blackList.length; i++) {
                if (user.userid === roomDefaults.blackList[i]) {
                    bootUser = true;
                    bootMessage = 'You are on the user banned list.';
                    break;
                }
            }

            //checks if user is on the banned list
            for (let z = 0; z < this.bannedUsers.length; z++) {
                if (this.bannedUsers[z].match(user.userid)) {
                    bootUser = true;
                    bootMessage = 'You are on the banned user list.';
                    break;
                }
            }

            // don't let the bot boot itself!
            if (user.userid === authModule.USERID) {
                bootUser = false;
            }

            return [bootUser, bootMessage];
        },

        bootThisUser: function (userID, bootMessage) {
            if (bootMessage == null) {
                logMe("debug","Boot userID: ====" + userID + "++++++")
                bot.boot(userID)
            } else {
                logMe("debug","Boot userID: ====" + userID + "++++++ with message ====" + bootMessage + "+++++++")
                bot.bootUser(userID, bootMessage);
            }
        },

        greetNewuser: function (userID, username) {
            //gets newest user and prints greeting, does not greet the bot or the ttstats bot, or banned users
            if (roomDefaults.greet === true && userID !== authModule.USERID && !username.match('@ttstat')) {
                const greetingTimers = roomDefaults.greetingTimer;

                // if there's a timeout function waiting to be called for
                // this user, cancel it.
                if (greetingTimers[userID] !== null) {
                    clearTimeout(greetingTimers[userID]);
                    delete greetingTimers[userID];
                }

                return true;
            }
        },

        userJoinsRoom: function (userID, username) {

            //starts time for everyone that joins the room
            this.myTime[userID] = Date.now();

            //sets new persons spam count to zero
            this.people[userID] = {
                spamCount: 0
            };

            //adds users who join the room to the user list if their not already on the list
            let checkList = this.theUsersList.indexOf(userID);
            if (checkList === -1) {
                this.theUsersList.push(userID, username);
            }

            //puts people who join the room on the global afk list
            if (this.roomAFK === true) {
                this.justSaw(userID, 'justSaw3');
                this.justSaw(userID, 'justSaw4');
            }
        },


        //whichFunction represents which justSaw object do you want to access
        //num is the time in minutes till afk timeout
        //userid is the person's userid
        isAFK: function (userId, num, whichFunction) {
            let last;
            //which last seen object to use?
            switch (whichFunction) {
                case 'isAfk':
                    last = this.lastSeen[userId];
                    break;
                case 'isAfk1':
                    last = this.lastSeen1[userId];
                    break;
                case 'isAfk2':
                    last = this.lastSeen2[userId];
                    break;
                case 'isAfk3':
                    last = this.lastSeen3[userId];
                    break;
                case 'isAfk4':
                    last = this.lastSeen4[userId];
                    break;
            }

            let age_ms = Date.now() - last;
            let age_m = Math.floor(age_ms / 1000 / 60);
            return age_m >= num;
        },

        //removes afk dj's after roomDefaultsModule.afkLimit is up.
        afkCheck: function (roomFunctions, roomDefaults) {
            let afker;
            for (let i = 0; i < this.currentDJs.length; i++) {
                afker = this.currentDJs[i]; //Pick a DJ
                let isAfkMaster = this.masterIds.indexOf(afker); //master ids check
                let whatIsAfkerName = this.theUsersList.indexOf(afker) + 1;
                if ((this.isAFK(afker, (roomDefaults.afkLimit - 5), 'isAfk1')) && this.AFK === true) {
                    if (afker !== authModule.USERID && isAfkMaster === -1) {
                        if (roomDefaults.afkThroughPm === false) {
                            bot.speak('@' + this.theUsersList[whatIsAfkerName] + ' you have 5 minutes left of afk, chat or awesome please.');
                        } else {
                            bot.pm('you have 5 minutes left of afk, chat or awesome please.', afker);
                        }
                        this.justSaw(afker, 'justSaw1');
                    }
                }
                if ((this.isAFK(afker, (roomDefaults.afkLimit - 1), 'isAfk2')) && this.AFK === true) {
                    if (afker !== authModule.USERID && isAfkMaster === -1) {
                        if (roomDefaults.afkThroughPm === false) {
                            bot.speak('@' + this.theUsersList[whatIsAfkerName] + ' you have 1 minute left of afk, chat or awesome please.');
                        } else {
                            bot.pm('you have 1 minute left of afk, chat or awesome please.', afker);
                        }
                        this.justSaw(afker, 'justSaw2');
                    }
                }
                if ((this.isAFK(afker, roomDefaults.afkLimit, 'isAfk')) && this.AFK === true) { //if Dj is afk then
                    if (afker !== authModule.USERID && isAfkMaster === -1) //checks to see if afker is a mod or a bot or the current dj, if they are is does not kick them.
                    {
                        if (afker !== roomFunctions.checkWhoIsDj) {
                            if (roomDefaults.afkThroughPm === false) {
                                bot.speak('@' + this.theUsersList[whatIsAfkerName] + ' you are over the afk limit of ' + roomDefaults.afkLimit + ' minutes.');
                            } else {
                                bot.pm('you are over the afk limit of ' + roomDefaults.afkLimit + ' minutes.', afker);
                            }
                            this.justSaw(afker, 'justSaw1');
                            this.justSaw(afker, 'justSaw2');
                            this.justSaw(afker, 'justSaw');
                            bot.remDj(afker); //remove them
                        }
                    }
                }
            }
        },

        //this removes people on the floor, not the djs
        roomAFKCheck: function () {
            for (let i = 0; i < this.userIDs.length; i++) {
                let afker2 = this.userIDs[i]; //Pick a DJ
                let isAfkMod = this.modList.indexOf(afker2);
                let isDj = this.currentDJs.indexOf(afker2);
                if ((this.isAFK(afker2, (this.roomafkLimit - 1), 'isAfk3')) && this.roomAFK === true) {
                    if (afker2 !== authModule.USERID && isDj === -1 && isAfkMod === -1) {
                        bot.pm('you have 1 minute left of afk, chat or awesome please.', afker2);
                        this.justSaw(afker2, 'justSaw3');
                    }
                }
                if ((this.isAFK(afker2, this.roomafkLimit, 'isAfk4')) && this.roomAFK === true) { //if person is afk then
                    if (afker2 !== authModule.USERID && isAfkMod === -1) //checks to see if afker is a mod or this, if they are is does not kick them.
                    {
                        if (isDj === -1) {
                            bot.pm('you are over the afk limit of ' + this.roomafkLimit + ' minutes.', afker2);
                            bot.boot(afker2, 'you are over the afk limit');
                            this.justSaw(afker2, 'justSaw3');
                            this.justSaw(afker2, 'justSaw4');
                        }
                    }
                }
            }
        },

        updateAfkPostionOfUser: function (userid) {
            //updates the afk position of the speaker.
            if (this.AFK === true || this.roomAFK === true) {
                this.justSaw(userid, 'justSaw');
                this.justSaw(userid, 'justSaw1');
                this.justSaw(userid, 'justSaw2');
                this.justSaw(userid, 'justSaw3');
                this.justSaw(userid, 'justSaw4');
            }
        },

        justSaw: function (uid, whichFunction) {
            switch (whichFunction) {
                case 'justSaw':
                    return this.lastSeen[uid] = Date.now();
                case 'justSaw1':
                    return this.lastSeen1[uid] = Date.now();
                case 'justSaw2':
                    return this.lastSeen2[uid] = Date.now();
                case 'justSaw3':
                    return this.lastSeen3[uid] = Date.now();
                case 'justSaw4':
                    return this.lastSeen4[uid] = Date.now();
            }
        },

        resetLastSeen: function () {
            this.lastSeen = {};
            this.lastSeen1 = {};
            this.lastSeen2 = {};
            this.lastSeen3 = {};
            this.lastSeen4 = {};
        },

        verifyUsersList: function () {
            logMe("debug", "verifyUsersList: Started verifying the user list")

            //only execute when not disconnected
            if (bot._isAuthenticated) {
                bot.roomInfo(false, function (data) {
                    let theUsersListOkay;
                    if (data.user === 'object') {
                        theUsersListOkay = true; //assume it will not need to be rebuilt

                        //if the length of the users list does not match
                        //the amount of people in the room
                        if (this.theUsersList.length !== (data.users.length * 2)) {
                            theUsersListOkay = false;
                        }

                        //only run this test if it passed the first one
                        theUsersListOkay = this.allusersAreDefined();

                        //if data got corrupted then rebuild theUsersList array
                        if (!theUsersListOkay) {
                            logMe("debug", "verifyUsersList: need to rebuild the user list")
                            this.rebuildUserList(data);
                        }
                    }
                });
            }
        },

        allusersAreDefined: function () {
            logMe("debug", "allusersAreDefined: checking users are all defined correctly")
            let allUsersOK = true;
            for (let i = 0; i < this.theUsersList.length; i++) {
                if (typeof this.theUsersList[i] === 'undefined') {
                    allUsersOK = false;
                }
            }
            return allUsersOK
        },

        rebuildUserList: function (data) {
            this.theUsersList = [];

            for (let i = 0; i < data.users.length; i++) {
                if (typeof data.users[i] !== 'undefined') {
                    //userid then the name
                    this.theUsersList.push(data.users[i].userid, data.users[i].name);
                }
            }
        },

        newModerator:function (data, bot) {
            if (this.modList.indexOf(data.userid) === -1)
            {
                this.modList.push(data.userid);
                // bot.speak("I've reset the Mod list: " + this.modList);
            }
        },

        updateModeratorList: function (data, bot) {
            this.modList.splice(this.modList.indexOf(data.userid), 1);
            // bot.speak("I've reset the Mod list: " + this.modList);
        },

    }
}

module.exports = userFunctions;
