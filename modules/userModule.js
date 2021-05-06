let musicDefaults = require('../defaultSettings/musicDefaults.js');
let roomDefaults = require('../defaultSettings/roomDefaults.js');

let authModule = require('../auth.js');

let theUsersList = []; // object array of everyone in the room
let afkPeople = []; //holds the userid of everyone who has used the /afk command
let modPM = []; //holds the userid's of everyone in the /modpm feature
let currentDJs = []; //holds the userid of all the dj's who are on stage currently
let people = []; //holds the userid's of everyone who is kicked off stage for the spam limit
let myTime = []; //holds a date object for everyone in the room, which represents the time when they joined the room, resets every time the person rejoins
let timer = []; //holds the timeout of everyone who has been spamming the stage, resets their spam count if their timer completes
let myID = null; //the userid of the person using the /fanme command, speak event only

let bannedUsers = {'636473737373': {username: 'bob'}, '535253533353': {username: 'joe'}}; //banned users list, put userids in string form here for permanent banning(put their name after their userid to tell who is banned).
let bannedFromStage = {'636473737373': {username: 'bob'}, '535253533353': {username: 'joe'}}; //put userids in here to ban from djing permanently(put their name after their userid to tell who is banned)
let vipList = [];
/* this is the vip list, it accepts userids as input, this is for when you have a special guest or guests in your room and you only
   want to hear them dj, leave this empty unless you want everyone other than the people whos userids are in the vip list to be automatically kicked from stage. */

let masterIds = ['6040a0333f4bfc001be4cf39']; //example (clear this before using)
/*  This is the master id list, userid's that are put in here will not be affected by the song length limit, artist / song banning, the /skip command, or the dj afk limit.
    This is meant to explicitly give extra privileges to yourself and anyone else you want to put in here. It takes userid's as input in string format separated by commas.
    You can put the person's name in the array either before or after a userid to tell who it belongs to, it will not affect its ability to function. */

let name = null; //the name of the person using the person who activated the speak event
let isModerator = null; //is the person using a command a moderator? true or false
let index = null; //the index returned when using unban commands
let informTimer = null; //holds the timeout for the /inform command, null lets it know that it hasn't already been set
let playLimitOfRefresher = []; //holds a copy of the number of plays for people who have used the /refresh command
let refreshList = []; //this holds the userid's of people who have used the /refresh command
let refreshTimer = []; //this holds the timers of people who have used the /refresh command
let warnme = []; //holds the userid's of everyone using the /warnme feature

let djSongCount = []; //holds the song count that each of the dj's on stage have played

let roomAFK = false; //audience afk limit(off by default)
let roomafkLimit = 30; //set the afk limit for the audience here(in minutes), this feature is off by default
let AFK = true; //afk limit(on by default), this is for the dj's on stage

let lastSeen = {}; //holds a date object to be used for the dj afk timer, there are different ones because they have different timeouts
let lastSeen1 = {}; //holds a date object to be used for the dj afk timer
let lastSeen2 = {}; //holds a date object to be used for the dj afk timer
let lastSeen3 = {}; //holds a date object to be used for the audience afk limit
let lastSeen4 = {}; //holds a date object to be used for the audience afk limit
let escortMeList = []; //holds the userid of everyone who has used the /escortme command, auto removed when the person leaves the stage
let modList = []; //set the afk limit in minutes here
let queueList = []; //holds the userid of everyone in the queue

const userFunctions = (bot, roomDefaults) => {
    function logMe(logLevel, message) {
        if (logLevel === 'error') {
            console.log("botFunctions:" + logLevel + "->" + message + "\n");
        } else {
            if (bot.debug) {
                console.log("botFunctions:" + logLevel + "->" + message + "\n");
            }
        }
    }

    return {
        theUsersList: () => theUsersList,
        afkPeople: () => afkPeople,
        modPM: () => modPM,
        currentDJs: () => currentDJs,
        userIDs: () => userIDs,
        people: () => people,
        myTime: () => myTime,
        timer: () => timer,
        myID: () => myID,

        bannedUsers: () => bannedUsers,
        bannedFromStage: () => bannedFromStage,
        vipList: () => vipList,

        masterIds: () => masterIds,

        name: () => name,
        index: () => index,
        informTimer: () => informTimer,
        playLimitOfRefresher: () => playLimitOfRefresher,
        refreshList: () => refreshList,
        refreshTimer: () => refreshTimer,
        warnme: () => warnme,

        djSongCount: (djID) => djSongCount[djID],

        roomafkLimit: () => roomafkLimit,
        escortMeList: () => escortMeList,

        lastSeen: () => lastSeen,
        lastSeen1: () => lastSeen1,
        lastSeen2: () => lastSeen2,
        lastSeen3: () => lastSeen3,
        lastSeen4: () => lastSeen4,

        modList: () => modList,

        isModerator: () => isModerator,
        setAsModerator: function () {
            isModerator = true;
        },
        removeAsModerator: function () {
            isModerator = false;
        },

        AFK: () => AFK,
        enableAFK: function () {
            AFK = true;
        },
        disableAFK: function () {
            AFK = false;
        },

        roomAFK: () => roomAFK,
        enableRoomAFK: function () {
            roomAFK = true;
        },
        disableRoomAFK: function () {
            roomAFK = false;
        },

        queueList: () => queueList,

        buildQueueMessage: function () {
            let message;

            return message;
        },

        addUserToQueue: function (userID) {
            if (!roomDefaults.queue) {
                return [ false, "the queue is disabled." ];
            }

            if (!this.isUserIDInQueue(userID)) {
                return [ false, "you are already in queue." ];
            }

            if (this.isUserIDOnStage()) {
                return [ false, "you are already on stage!" ];
            }

            if (this.isUserIDStageBanned()) {
                return [ false, "sorry, you are banned from the stage." ];
            }

            queueList.push( { id:userID} );
            return [ true, '' ];
        },

        removeUserFromQueue: function (userID) {
            if (!this.isUserIDInQueue(userID)) {
                return [ false, "not in queue" ];
            } else {
                const queuePosition = queueList.findIndex( ({ id }) => id === userID );
                queueList.splice(queuePosition, 1);
                return [ true, '' ];
            }
        },

        isUserIDInQueue: function (userID) {
            const inQueue = queueList.findIndex(({id}) => id === userID);
            return inQueue !== -1;
        },

        isUserIDOnStage: function (userID) {
            const onStage = currentDJs.findIndex(({id}) => id === userID);
            return onStage !== -1;
        },

        isUserIDStageBanned: function (userID) {
            const stageBanned = bannedFromStage.findIndex(({id}) => id === userID);
            return stageBanned !== -1;
        },

        isUserBannedFromRoom: function (userID) {
            const banned = bannedUsers.findIndex(({id}) => id === userID);
            return banned !== -1;
        },

        resetUsersList: function () {
            theUsersList = []
            logMe("debug", "resetUsersList: I've reset the Users list")
        },

        resetEscortMeList: function () {
            escortMeList = []
            logMe("debug", "resetEscortMeList: I've reset the Escort Users list")
        },

        resetQueueList: function () {
            queueList = []
            logMe("debug", "resetQueueList: I've reset the Queue List")
        },

        resetAFKPeople: function () {
            afkPeople = []
            logMe("debug", "resetAFKPeople: I've reset the AFK List")
        },

        resetModPM: function () {
            modPM = []
            logMe("debug", "resetModPM: I've reset the ModPM List")
        },

        resetCurrentDJs: function () {
            currentDJs = []
            logMe("debug", "resetCurrentDJs: I've reset the Current DJs List")
        },

        resetUserIDs: function () {
            userIDs = []
            logMe("debug", "resetUserIDs: I've reset the UserIDs")
        },

        resetMyTime: function () {
            myTime = []
            logMe("debug", "resetMyTime: I've reset My Time")
        },

        resetPeople: function () {
            people = []
            logMe("debug", "resetPeople: I've reset the People")
        },

        resetWarnMe: function () {
            warnme = [];
            logMe("debug", "resetWarnMe: I've reset the Warn Me list")
        },

        resetDJSongCount: function () {
            djSongCount = [];
            logMe("debug", "resetDJSongCount: I've reset the DJ Song count")
        },

        resetModList: function () {
            modList = []
            logMe("debug", "resetModList: I've reset the Mod list: ");
        },

        botStartReset: function (botFunctions) {
            this.resetEscortMeList(bot);
            this.resetUsersList();
            this.resetModList(bot);
            this.resetCurrentDJs();
            this.resetUserIDs();
            this.resetQueueList();
            this.resetQueueNames();
            this.resetPeople();
            this.resetMyTime();
            this.resetAFKPeople();
            this.resetLastSeen();
            this.resetDJSongCount();
            this.resetWarnMe();
            this.resetModPM();

            //only set begintime if it has not already been set
            if (botFunctions.botStartTime === null) {
                botFunctions.botStartTime = Date.now(); //the time the bot entered the room at
            }
        },


        updateUser: function (data, roomFunctions) {
            if (typeof data.name === 'string') {
                let oldname = ''; //holds users old name if exists
                let queueNamePosition;
                let queueListPosition;
                let afkPeoplePosition;

                //when when person updates their profile
                //and their name is not found in the users list then they must have changed
                //their name
                if (theUsersList.indexOf(data.name) === -1) {
                    let nameIndex = theUsersList.indexOf(data.userid);
                    if (nameIndex !== -1) //if their userid was found in theUsersList
                    {
                        oldname = theUsersList[nameIndex + 1];
                        theUsersList[nameIndex + 1] = data.name;

                        if (typeof oldname !== 'undefined') {
                            queueNamePosition = userFunctions.queueName().indexOf(oldname);
                            queueListPosition = userFunctions.queueList().indexOf(oldname);
                            afkPeoplePosition = afkPeople.indexOf(oldname);


                            if (queueNamePosition !== -1) //if they were in the queue when they changed their name, then replace their name
                            {
                                userFunctions.queueName()[queueNamePosition] = data.name;
                            }

                            if (queueListPosition !== -1) //this is also for the queue
                            {
                                userFunctions.queueList()[queueListPosition] = data.name;
                            }

                            if (afkPeoplePosition !== -1) //this checks the afk list
                            {
                                afkPeople[afkPeoplePosition] = data.name;
                            }
                        }
                    }
                }
            }
        },

        deregisterUser: function (userID) {
            //removes dj's from the lastSeen object when they leave the room
            delete lastSeen[userID];
            delete lastSeen1[userID];
            delete lastSeen2[userID];
            delete lastSeen3[userID];
            delete lastSeen4[userID];
            delete people[userID];
            delete timer[userID];
            delete myTime[userID];


            //double check to make sure that if someone is on stage and they disconnect, that they are being removed
            //from the current Dj's array
            let checkIfStillInDjArray = currentDJs.indexOf(userID);
            if (checkIfStillInDjArray !== -1) {
                currentDJs.splice(checkIfStillInDjArray, 1);
            }

            //removes people who leave the room from the afk list
            if (afkPeople.length !== 0) {
                let checkUserName = afkPeople.indexOf(bot.data.user[0].name);
                if (checkUserName !== -1) {
                    afkPeople.splice(checkUserName, 1);
                }
            }

            //removes people leaving the room in modpm still
            if (modPM.length !== 0) {
                let areTheyStillInModpm = modPM.indexOf(userID);

                if (areTheyStillInModpm !== -1) {
                    let whatIsTheirName = theUsersList.indexOf(userID);
                    modPM.splice(areTheyStillInModpm, 1);

                    if (whatIsTheirName !== -1) {
                        for (let hg = 0; hg < modPM.length; hg++) {
                            if (typeof modPM[hg] !== 'undefined' && modPM[hg] !== userID) {
                                bot.pm(theUsersList[whatIsTheirName + 1] + ' has left the modpm chat', modPM[hg]);
                            }
                        }
                    }
                }
            }

            //updates the users list when a user leaves the room.
            let checkLeave = theUsersList.indexOf(userID);
            let checkUserIds = userIDs.indexOf(userID);

            if (checkLeave !== -1 && checkUserIds !== -1) {
                theUsersList.splice(checkLeave, 2);
                userIDs.splice(checkUserIds, 1);
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
            if (this.isUserBannedFromRoom(user.userid)) {
                bootUser = true;
                bootMessage = 'You are on the banned user list.';
            }

            // don't let the bot boot itself!
            if (user.userid === authModule.USERID) {
                bootUser = false;
            }

            return [bootUser, bootMessage];
        },

        bootThisUser: function (userID, bootMessage) {
            if (bootMessage == null) {
                logMe("debug", "Boot userID: ====" + userID + "++++++")
                bot.boot(userID)
            } else {
                logMe("debug", "Boot userID: ====" + userID + "++++++ with message ====" + bootMessage + "+++++++")
                bot.bootUser(userID, bootMessage);
            }
        },

        greetNewuser: function (userID, username, roomFunctions) {
            //gets newest user and prints greeting, does not greet the bot or the ttstats bot, or banned users
            if (roomFunctions.greet() === true && userID !== authModule.USERID && !username.match('@ttstat')) {
                const greetingTimers = roomFunctions.greetingTimer();

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
            myTime[userID] = Date.now();

            //sets new persons spam count to zero
            people[userID] = {
                spamCount: 0
            };

            //adds users who join the room to the user list if their not already on the list
            let checkList = theUsersList.indexOf(userID);
            if (checkList === -1) {
                theUsersList.push(userID, username);
            }

            //puts people who join the room on the global afk list
            if (roomAFK === true) {
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
                    last = lastSeen[userId];
                    break;
                case 'isAfk1':
                    last = lastSeen1[userId];
                    break;
                case 'isAfk2':
                    last = lastSeen2[userId];
                    break;
                case 'isAfk3':
                    last = lastSeen3[userId];
                    break;
                case 'isAfk4':
                    last = lastSeen4[userId];
                    break;
            }

            let age_ms = Date.now() - last;
            let age_m = Math.floor(age_ms / 1000 / 60);
            return age_m >= num;
        },

        //removes afk dj's after roomDefaultsModule.afkLimit is up.
        afkCheck: function (roomFunctions, roomDefaults) {
            let afker;
            for (let i = 0; i < currentDJs.length; i++) {
                afker = currentDJs[i]; //Pick a DJ
                let isAfkMaster = masterIds.indexOf(afker); //master ids check
                let whatIsAfkerName = theUsersList.indexOf(afker) + 1;
                if ((this.isAFK(afker, (roomDefaults.afkLimit - 5), 'isAfk1')) && AFK === true) {
                    if (afker !== authModule.USERID && isAfkMaster === -1) {
                        if (roomDefaults.afkThroughPm === false) {
                            bot.speak('@' + theUsersList[whatIsAfkerName] + ' you have 5 minutes left of afk, chat or awesome please.');
                        } else {
                            bot.pm('you have 5 minutes left of afk, chat or awesome please.', afker);
                        }
                        this.justSaw(afker, 'justSaw1');
                    }
                }
                if ((this.isAFK(afker, (roomDefaults.afkLimit - 1), 'isAfk2')) && AFK === true) {
                    if (afker !== authModule.USERID && isAfkMaster === -1) {
                        if (roomDefaults.afkThroughPm === false) {
                            bot.speak('@' + theUsersList[whatIsAfkerName] + ' you have 1 minute left of afk, chat or awesome please.');
                        } else {
                            bot.pm('you have 1 minute left of afk, chat or awesome please.', afker);
                        }
                        this.justSaw(afker, 'justSaw2');
                    }
                }
                if ((this.isAFK(afker, roomDefaults.afkLimit, 'isAfk')) && AFK === true) { //if Dj is afk then
                    if (afker !== authModule.USERID && isAfkMaster === -1) //checks to see if afker is a mod or a bot or the current dj, if they are is does not kick them.
                    {
                        if (afker !== roomFunctions.checkWhoIsDj()) {
                            if (roomDefaults.afkThroughPm === false) {
                                bot.speak('@' + theUsersList[whatIsAfkerName] + ' you are over the afk limit of ' + roomDefaults.afkLimit + ' minutes.');
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
            for (let i = 0; i < userIDs.length; i++) {
                let afker2 = userIDs[i]; //Pick a DJ
                let isAfkMod = modList.indexOf(afker2);
                let isDj = currentDJs.indexOf(afker2);
                if ((this.isAFK(afker2, (roomafkLimit - 1), 'isAfk3')) && roomAFK === true) {
                    if (afker2 !== authModule.USERID && isDj === -1 && isAfkMod === -1) {
                        bot.pm('you have 1 minute left of afk, chat or awesome please.', afker2);
                        this.justSaw(afker2, 'justSaw3');
                    }
                }
                if ((this.isAFK(afker2, roomafkLimit, 'isAfk4')) && roomAFK === true) { //if person is afk then
                    if (afker2 !== authModule.USERID && isAfkMod === -1) //checks to see if afker is a mod or this, if they are is does not kick them.
                    {
                        if (isDj === -1) {
                            bot.pm('you are over the afk limit of ' + roomafkLimit + ' minutes.', afker2);
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
            if (AFK === true || roomAFK === true) {
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
                    return lastSeen[uid] = Date.now();
                case 'justSaw1':
                    return lastSeen1[uid] = Date.now();
                case 'justSaw2':
                    return lastSeen2[uid] = Date.now();
                case 'justSaw3':
                    return lastSeen3[uid] = Date.now();
                case 'justSaw4':
                    return lastSeen4[uid] = Date.now();
            }
        },

        resetLastSeen: function () {
            lastSeen = {};
            lastSeen1 = {};
            lastSeen2 = {};
            lastSeen3 = {};
            lastSeen4 = {};
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
                        if (theUsersList.length !== (data.users.length * 2)) {
                            theUsersListOkay = false;
                        }

                        //only run this test if it passed the first one
                        theUsersListOkay = allusersAreDefined();

                        //if data got corrupted then rebuild theUsersList array
                        if (!theUsersListOkay) {
                            logMe("debug", "verifyUsersList: need to rebuild the user list")
                            rebuildUserList(data);
                        }
                    }
                });
            }
        },

        allusersAreDefined: function () {
            logMe("debug", "allusersAreDefined: checking users are all defined correctly")
            let allUsersOK = true;
            for (let i = 0; i < theUsersList.length; i++) {
                if (typeof theUsersList[i] === 'undefined') {
                    allUsersOK = false;
                }
            }
            return allUsersOK
        },

        rebuildUserList: function (data) {
            theUsersList = [];

            for (let i = 0; i < data.users.length; i++) {
                if (typeof data.users[i] !== 'undefined') {
                    //userid then the name
                    theUsersList.push(data.users[i].userid, data.users[i].name);
                }
            }
        },

        newModerator: function (data) {
            if (modList.indexOf(data.userid) === -1) {
                modList.push(data.userid);
                logMe("debug", "I've reset the Mod list: " + modList);
            }
        },

        updateModeratorList: function (data) {
            modList.splice(modList.indexOf(data.userid), 1);
            logMe("debug", "I've reset the Mod list: " + modList);
        },

        initialiseDJPlayCount: function (djID) {
            logMe('debug', 'Initialise playcount for:' + djID);
            djSongCount[djID] = {
                nbSong: 0
            };
        },

        incrementDJPlayCount: function (djID) {
            logMe('debug', 'Song Count before:' + djSongCount[djID].nbSong);
            ++djSongCount[djID].nbSong;
            logMe('debug', 'Song Count after:' + djSongCount[djID].nbSong);
        },

        decrementDJPlayCount: function (djID) {
            logMe('debug', 'Song Count before:' + djSongCount[djID].nbSong);
            --djSongCount[djID].nbSong;
            logMe('debug', 'Song Count after:' + djSongCount[djID].nbSong);
        },

        setDJPlayCount: function (djID, theCount) {
            djSongCount[djID].nbSong = theCount;
        },

        deleteDJPlayCount: function (djID) {
            delete djSongCount[djID];
        },

        removeDJsOverPlaylimit: function (chatFunctions, djID) {
            if (musicDefaults.PLAYLIMIT === true) //is playlimit on?
            {
                if (djID !== authModule.USERID && djID === currentDJs[0] && roomDefaults.playLimit === 1) //if person is in the far left seat and limit is set to one
                {
                    let checklist33 = theUsersList.indexOf(djID) + 1;

                    logMe("debug", "checkList33:" + checklist33);

                    if (checklist33 !== -1) {
                        chatFunctions.overPlayLimit(theUsersList[checklist33], roomDefaults.playLimit)
                    }

                    bot.remDj(djID);
                }
            }
        },

        startAllUserTimers: function () {
            //starts time in room for everyone currently in the room
            for (let zy = 0; zy < userIDs.length; zy++) {
                if (typeof userIDs[zy] !== 'undefined') {
                    myTime[userIDs[zy]] = Date.now();
                }
            }
        },

        buildUserLists: function (data) {
            //used to get user names and user id's
            for (let i = 0; i < data.users.length; i++) {
                if (typeof data.users[i] !== 'undefined') {
                    theUsersList.push(data.users[i].userid, data.users[i].name);
                    userIDs.push(data.users[i].userid);
                }
            }
        },

        buildModList: function (data) {
            //set modlist to list of moderators
            //modList = data.room.metadata.moderator_id;
            logMe('debug', 'Moderator count ->' + data.room.metadata.moderator_id.length + '<-');
            for (let ihp = 0; ihp < data.room.metadata.moderator_id.length; ihp++) {
                modList.push(data.room.metadata.moderator_id[ihp]);
            }
            logMe('debug', 'Build Mod List ->' + modList + '<-');
        },

        resetAllSpamCounts: function () {
            //sets everyones spam count to zero
            //puts people on the global afk list when it joins the room
            for (let z = 0; z < userIDs.length; z++) {
                if (typeof userIDs[z] !== 'undefined') {
                    people[userIDs[z]] = {
                        spamCount: 0
                    };
                    this.justSaw(userIDs[z], 'justSaw3');
                    this.justSaw(userIDs[z], 'justSaw4');
                }
            }
        },

        initializeDJAFKCount: function (data, dj) {
            this.justSaw(data.room.metadata.djs[dj], 'justSaw'); //initialize dj afk count
            this.justSaw(data.room.metadata.djs[dj], 'justSaw1');
            this.justSaw(data.room.metadata.djs[dj], 'justSaw2');
        },

        checkIfUserIsMod: function (userID) {
            let modIndex = modList.indexOf(userID);
            isModerator = modIndex !== -1;
        },

        isPMerInRoom: function (userID) {
            let isInRoom = theUsersList.indexOf(userID);
            isInRoom = isInRoom !== -1;
            return isInRoom;
        },

        incrementSpamCounter: function (userID) {
            if (typeof people[userID] != 'undefined') {
                ++people[userID].spamCount;
            }

            if (timer[userID] !== null) {
                clearTimeout(timer[userID]);
                timer[userID] = null;
            }

            timer[userID] = setTimeout(function () {
                people[userID] = {
                    spamCount: 0
                };
            }, 10 * 1000);
        },

        clearInformTimer: function (roomFunctions) {
            //this is for the /inform command
            if (informTimer !== null) {
                clearTimeout(informTimer);
                informTimer = null;

                if (typeof theUsersList[theUsersList.indexOf(roomFunctions.lastdj()) + 1] !== 'undefined') {
                    bot.speak("@" + theUsersList[theUsersList.indexOf(roomFunctions.lastdj()) + 1] + ", Thanks buddy ;-)");
                } else {
                    bot.speak('Thanks buddy ;-)');
                }
            }
        },

        warnMeCall: function (roomFunctions) {
            if (warnme.length !== 0) //is there anyone in the warnme?
            {
                let whatIsPosition = currentDJs.indexOf(roomFunctions.checkWhoIsDj()); //what position are they

                if (whatIsPosition === currentDJs.length - 1) //if 5th dj is playing, check guy on the left
                {
                    let areTheyNext = warnme.indexOf(currentDJs[0]);
                    if (areTheyNext !== -1) //is the next dj up in the warnme?
                    {
                        bot.pm('your song is up next!', currentDJs[0]);
                        warnme.splice(areTheyNext, 1);

                    }
                } else {
                    let areTheyNext = warnme.indexOf(currentDJs[whatIsPosition + 1]);
                    if (areTheyNext !== -1) //is the next dj up in the warnme?
                    {
                        bot.pm('your song is up next!', currentDJs[whatIsPosition + 1]);
                        warnme.splice(areTheyNext, 1);

                    }
                }
            }
        },

        buildDJList(data) {
            //finds out who the currently playing dj's are.
            for (let iop = 0; iop < data.room.metadata.djs.length; iop++) {
                if (typeof data.room.metadata.djs[iop] !== 'undefined') {
                    this.currentDJs().push(data.room.metadata.djs[iop]);
                    logMe("debug", "data iop:" + data.room.metadata.djs[iop]);
                    logMe("debug", "current DJs:" + this.currentDJs());
                    this.initialiseDJPlayCount(data.room.metadata.djs[iop]);
                    this.initializeDJAFKCount(data, iop);
                }
            }
        },
    }
}

module.exports = userFunctions;
