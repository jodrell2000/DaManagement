let musicDefaults = require('../defaultSettings/musicDefaults.js');
let roomDefaults = require('../defaultSettings/roomDefaults.js');

let authModule = require('../auth.js');
const auth = require('../auth.js');

let theUsersList = []; // object array of everyone in the room
let afkPeople = []; //holds the userid of everyone who has used the /afk command
let modPM = []; //holds the userid's of everyone in the /modpm feature
let djList = []; //holds the userid of all the dj's who are on stage currently
let people = []; //holds the userid's of everyone who is kicked off stage for the spam limit
let myTime = []; //holds a date object for everyone in the room, which represents the time when they joined the room, resets every time the person rejoins
let timer = []; //holds the timeout of everyone who has been spamming the stage, resets their spam count if their timer completes
let myID = null; //the userid of the person using the /fanme command, speak event only

let bannedUsers = [ { id:636473737373 }, { id:535253533353 } ]; //banned users list, put userids in string form here for permanent banning(put their name after their userid to tell who is banned).
let permanentStageBan = [ { id:636473737373 }, { id:535253533353 } ]; //put userids in here to ban from djing permanently(put their name after their userid to tell who is banned)
let vipList = [];
/* this is the vip list, it accepts userids as input, this is for when you have a special guest or guests in your room and you only
   want to hear them dj, leave this empty unless you want everyone other than the people whos userids are in the vip list to be automatically kicked from stage. */

let masterIds = ['6040a0333f4bfc001be4cf39']; //example (clear this before using)
/*  This is the master id list, userid's that are put in here will not be affected by the song length limit, artist / song banning, the /skip command, or the dj afk limit.
    This is meant to explicitly give extra privileges to yourself and anyone else you want to put in here. It takes userid's as input in string format separated by commas.
    You can put the person's name in the array either before or after a userid to tell who it belongs to, it will not affect its ability to function. */

let index = null; //the index returned when using unban commands
let informTimer = null; //holds the timeout for the /inform command, null lets it know that it hasn't already been set
let playLimitOfRefresher = []; //holds a copy of the number of plays for people who have used the /refresh command
let refreshDJCount = 0; // how many people are currently using the refresh command
let warnme = []; //holds the userid's of everyone using the /warnme feature

let queueList = []; //holds the userid of everyone in the queue

const userFunctions = (bot, roomDefaults) => {
    function logMe(logLevel, message) {
        if (logLevel === 'error') {
            console.log("userFunctions:" + logLevel + "->" + message + "\n");
        } else {
            if (bot.debug) {
                console.log("userFunctions:" + logLevel + "->" + message + "\n");
            }
        }
    }

    return {
        debugPrintTheUsersList: function () {
            console.log("Full theUsersList: " + JSON.stringify(theUsersList));
        },

        theUsersList: () => theUsersList,
        modPM: () => modPM,

        bannedUsers: () => bannedUsers,
        permanentStageBan: () => permanentStageBan,

        masterIds: () => masterIds,

        index: () => index,
        informTimer: () => informTimer,
        warnme: () => warnme,

        isUserIDOnStage: function (userID) {
            const onStage = djList.findIndex(({id}) => id === userID);
            return onStage !== -1;
        },

        isUserIDStageBanned: function (userID) {
            const stageBanned = permanentStageBan.findIndex(({id}) => id === userID);
            return stageBanned !== -1;
        },

        isUserBannedFromRoom: function (userID) {
            const banned = bannedUsers.findIndex(({id}) => id === userID);
            return banned !== -1;
        },

        resetModPM: function () {
            modPM = []
        },

        resetPeople: function () {
            people = []
        },

        botStartReset: function (botFunctions, songFunctions) {
            this.resetAllEscortMe(bot);
            this.resetUsersList();
            this.resetQueueList();
            this.resetPeople();
            this.resetAFKPeople();
            this.deleteAllDJsPlayCount();
            this.resetModPM();

            songFunctions.loadPlaylist();

            const theStartTime = botFunctions.botStartTime();
            if ( !theStartTime ) {
                botFunctions.setBotStartTime();
            }
        },

        removeDJsOverPlaylimit: function (chatFunctions, djID) {
            if (musicDefaults.PLAYLIMIT === true) //is playlimit on?
            {
                if (djID !== authModule.USERID && djID === djList[0] && roomDefaults.playLimit === 1) //if person is in the far left seat and limit is set to one
                {
                    let checklist33 = theUsersList.indexOf(djID) + 1;

                    if (checklist33 !== -1) {
                        chatFunctions.overPlayLimit(theUsersList[checklist33], roomDefaults.playLimit)
                    }

                    bot.remDj(djID);
                }
            }
        },

        isPMerInRoom: function (userID) {
            let isInRoom = theUsersList.indexOf(userID);
            isInRoom = isInRoom !== -1;
            return isInRoom;
        },

        // ========================================================
        // Basic User Functions
        // ========================================================

        isThisTheBot: function ( userID ) {
            if ( userID === auth.USERID ) {
                return true;
            } else {
                return false;
            }
        },

        getUsername: function ( userID ) {
            theUsersList.forEach(function(theUser) {
            });
            let theUser = theUsersList.find(({id}) => id === userID);
            return theUser.username;
        },

        getUserIDFromData: function ( data ) {
            return data.userid;
        },

        getUserIDFromUsername: function ( theUsername ) {
            for ( userLoop = 0; userLoop < theUsersList.length; userLoop++ ){
                if ( theUsersList[userLoop].username === theUsername ) {
                    return theUsersList[userLoop].id;
                }
            }
        },

        // ========================================================

        // ========================================================
        // Moderator Management Functions
        // ========================================================

        resetModerators: function (data) {
            let userPosition;
            let theUserID;
            if ( data.room !== undefined ) {
                for (let modLoop = 0; modLoop < data.room.metadata.moderator_id.length; modLoop++) {
                    theUserID = data.room.metadata.moderator_id[modLoop];
                    userPosition = this.getPositionOnUsersList(theUserID)
                    if ( userPosition !== -1 ) {
                        theUsersList[userPosition]['moderator'] = true;
                    }
                }
            }
        },

        addModerator: function (theUserID) {
            let userPosition = this.getPositionOnUsersList(theUserID);
            theUsersList[userPosition]['moderator'] = true;
        },

        removeModerator: function (theUserID) {
            let userPosition = this.getPositionOnUsersList(theUserID);
            theUsersList[userPosition]['moderator'] = false;
        },

        isUserModerator: function (theUserID) {
            logMe( 'debug', '====================== isUserModerator, theUserID:' + theUserID + ':');
            let userPosition = this.getPositionOnUsersList(theUserID);
            logMe( 'debug', '====================== isUserModerator, userPosition:' + userPosition + ':');
            if ( theUsersList[userPosition]['moderator'] !== undefined ) {
                logMe( 'debug', '====================== isUserModerator -> User:' + JSON.stringify(theUsersList[userPosition]));
                logMe( 'debug', '====================== isUserModerator -> User is a Mod');
                return true;
            } else {
                logMe( 'debug', '====================== isUserModerator -> User:' + JSON.stringify(theUsersList[userPosition]));
                logMe( 'debug', '====================== isUserModerator -> User is not a Mod');
                return false;
            }
        },

        // ========================================================

        // ========================================================
        // VIP Functions
        // ========================================================

        vipList: () => vipList,

        isUserVIP: function (userID) {
            return this.vipList().indexOf(userID) !== -1;
        },

        // ========================================================

        // ========================================================
        // User SPAM Functions
        // ========================================================

        resetAllSpamCounts: function () {
            //sets everyones spam count to zero
            //puts people on the global afk list when it joins the room
            for (let userLoop = 0; userLoop < theUsersList.length; userLoop++) {
                theUsersList[userLoop]['spamCount'] = 0;
            }
        },

        incrementSpamCounter: function (userID) {
            if(this.isUserInUsersList(userID)) {
                ++theUsersList[this.getPositionOnUsersList(userID)]['spamCount'];
            }

            if (theUsersList[this.getPositionOnUsersList(userID)]['spamTimer'] !== null) {
                clearTimeout(theUsersList[this.getPositionOnUsersList(userID)]['spamTimer']);
                theUsersList[this.getPositionOnUsersList(userID)]['spamTimer'] = null;
            }

            theUsersList[this.getPositionOnUsersList(userID)]['spamTimer'] = setTimeout( function(userID) {
                this.resetUsersSpamCount(userID);
            }.bind(this), 10 * 1000);
        },

        resetUsersSpamCount: function (userID) {
            if(this.isUserInUsersList(userID)) {
                theUsersList[this.getPositionOnUsersList(userID)]['spamCount'] = 0;
            }
        },

        getUserSpamCount: function (userID) {
            if(this.isUserInUsersList(userID)) {
                return theUsersList[this.getPositionOnUsersList(userID)]['spamCount'];
            }
        },


        // ========================================================

        // ========================================================
        // Refresh Functions
        // ========================================================

        refreshDJCount: () => refreshDJCount,

        addRefreshToUser: function (userID) {
            if ( roomDefaults.refreshingEnabled ) {
                if (this.isUserInUsersList(userID)) {
                    if (this.isCurrentDJ(userID)) {
                        if (!this.isUserInRefreshList(userID)) {
                            let listPosition = this.getPositionOnUsersList(userID);
                            theUsersList[listPosition]['Refresh'] = Date.now();
                            ++theUsersList[listPosition]['RefreshCount'];
                            theUsersList[listPosition]['RefreshPlayCount'] = this.getDJPlayCount(userID);
                            theUsersList[listPosition]['RefreshTimer'] = setTimeout(function (userID) {
                                this.removeRefreshFromUser(userID);
                            }.bind(this), 60 * 1000);

                            ++refreshDJCount;

                            let message = '@' + this.getUsername(userID) + ' i\'ll hold your spot on stage for the next ' + roomDefaults.amountOfTimeToRefresh + ' minutes';
                            return [ true, message ]
                        } else {
                            return [false, "You're already using the refresh command"];
                        }
                    } else {
                        return [false, "You're not currently DJing...so you don't need the refresh command"];
                    }
                } else {
                    return [false, "You seem not to exist. Please tell a Moderator! (err: userFunctions.addRefreshToUser)"];
                }
            } else {
                return [ false, "Use of the /refresh command is currently disabled" ]
            }
        },

        removeRefreshFromUser: function (userID) {
            if (this.isUserInUsersList(userID)) {
                let listPosition = this.getPositionOnUsersList(userID);
                delete theUsersList[listPosition]['Refresh'];
                delete theUsersList[listPosition]['RefreshPlayCount']
                delete theUsersList[listPosition]['RefreshTimer']
                --refreshDJCount;
            }
        },

        isUserInRefreshList: function (userID) {
            if(this.isUserInUsersList(userID)) {
                return theUsersList[this.getPositionOnUsersList(userID)]['Refresh'] !== undefined;
            }
        },

        getUsersRefreshPlayCount: function (userID) {
            if(this.isUserInUsersList(userID)) {
                let listPosition = this.getPositionOnUsersList(userID);
                if ( theUsersList[listPosition]['RefreshPlayCount'] !== undefined ) {
                    return theUsersList[listPosition]['RefreshPlayCount'];
                } else {
                    return 0;
                }
            }
        },

        // ========================================================

        // ========================================================
        // Idle Functions (have people just gone away)
        // ========================================================

        roomIdle: () => roomDefaults.roomIdle,
        enableRoomIdle: function () { roomDefaults.roomIdle = true; },
        disableRoomIdle: function () { roomDefaults.roomIdle = false; },

        djIdleLimit: () => roomDefaults.djIdleLimit,
        enableDJIdle: function () { roomDefaults.djIdleLimit = true; },
        disableDJIdle: function () { roomDefaults.djIdleLimit = false; },

        updateUserLastSpoke: function (userID) {
            theUsersList[this.getPositionOnUsersList(userID)]['lastSpoke'] = Date.now();
        },

        updateUserLastVoted: function (userID) {
            logMe( 'debug', 'updateUserLastVoted, userID:' + userID );
            theUsersList[this.getPositionOnUsersList(userID)]['lastVoted'] = Date.now();
        },

        updateUserLastSnagged: function (userID) {
            theUsersList[this.getPositionOnUsersList(userID)]['lastSnagged'] = Date.now();
        },

        updateUserJoinedStage: function (userID) {
            theUsersList[this.getPositionOnUsersList(userID)]['joinedStage'] = Date.now();
        },

        getIdleTime: function (userID) {
            let userPosition = this.getPositionOnUsersList(userID);
            if (userPosition) {
                let userLastActive = theUsersList[userPosition]['joinTime'];

                if (roomDefaults.voteMeansActive) {
                    if (theUsersList[userPosition]['lastVoted'] > userLastActive) {
                        userLastActive = theUsersList[userPosition]['lastVoted'];
                    }
                }

                if (roomDefaults.speechMeansActive) {
                    if (theUsersList[userPosition]['lastSpoke'] > userLastActive) {
                        userLastActive = theUsersList[userPosition]['lastSpoke'];
                    }
                }

                if (roomDefaults.snagMeansActive) {
                    if (theUsersList[userPosition]['lastSnagged'] > userLastActive) {
                        userLastActive = theUsersList[userPosition]['lastSnagged'];
                    }
                }

                if (roomDefaults.djingMeansActive) {
                    if (theUsersList[userPosition]['joinedStage'] > userLastActive) {
                        userLastActive = theUsersList[userPosition]['joinedStage'];
                    }
                }

                return (Date.now() - userLastActive) / 1000; // return usersAFK time in seconds
            } else {
                return null;
            }
        },

        idleWarning: function (userID, minutesRemaining, idleLimit, chatFunctions) {
            let theMessage;

            if (minutesRemaining !== 0) {
                theMessage = 'you have ' + minutesRemaining + ' minutes left of idle, chat or awesome please.';
            } else {
                theMessage = 'you are over the idle limit of ' + idleLimit + ' minutes.';
            }

            if (roomDefaults.warnIdlePM === false) {
                chatFunctions.botChat('@' + this.getUsername(userID) + ' ' + theMessage);
            } else {
                chatFunctions.botPM(userID, theMessage);
            }
        },

        checkHasUserIdledOut: function ( userID, idleLimit, threshold ) {
            return this.getIdleTime(userID) / 60 > idleLimit - threshold;
        },

        //removes idle dj's after roomDefaultsModule.djIdleLimit is up.
        idledOutDJCheck: function ( roomDefaults, chatFunctions ) {
            let djID;
            for (let i = 0; i < djList.length; i++) {
                djID = djList[i]; //Pick a DJ
                if (djID !== authModule.USERID) {

                    if ( this.checkHasUserIdledOut( djID, roomDefaults.djIdleLimit, 5 ) ) {
                        this.idleWarning(djID, 5, roomDefaults.djIdleLimit, chatFunctions);
                    }

                    if ( this.checkHasUserIdledOut( djID, roomDefaults.djIdleLimit, 1 ) ) {
                        this.idleWarning(djID, 1, roomDefaults.djIdleLimit, chatFunctions);
                    }

                    if ( this.checkHasUserIdledOut( djID, roomDefaults.djIdleLimit, 0 ) ) {
                        this.idleWarning(djID, 0, roomDefaults.djIdleLimit, chatFunctions);
                        bot.remDj(djID); //remove them
                    }
                }
            }
        },

        //this removes people on the floor, not the djs
        roomIdleCheck: function ( roomDefaults, chatFunctions ) {
            let theUserID;
            for (let userLoop = 0; userLoop < theUsersList.length; userLoop++) {
                theUserID = theUsersList[userLoop].id;

                if ( roomDefaults.roomIdle === true && theUserID !== authModule.USERID ) {

                    if ( this.checkHasUserIdledOut( theUserID, roomDefaults.roomIdleLimit, 5 ) ) {
                        this.idleWarning(theUserID, 5, roomDefaults.roomIdleLimit, chatFunctions)
                    }

                    if ( this.checkHasUserIdledOut( theUserID, roomDefaults.roomIdleLimit, 1 ) ) {
                        this.idleWarning(theUserID, 1, roomDefaults.roomIdleLimit, chatFunctions)
                    }

                    if ( this.checkHasUserIdledOut( theUserID, roomDefaults.roomIdleLimit, 0 ) ) {
                        this.idleWarning(theUserID, 0, roomDefaults.roomIdleLimit, chatFunctions)
                        bot.boot(theUserID, 'you are over the idle limit');
                    }
                }
            }
        },

        // ========================================================

        // ========================================================
        // AFK Functions (for the afk command)
        // ========================================================

        afkPeople: () => afkPeople,
        resetAFKPeople: function () {
            afkPeople = []
        },

        isUserAFK: function ( userID ) {
            let isAlreadyAfk = afkPeople.indexOf( userID );
            return isAlreadyAfk !== -1;
        },

        switchUserAFK: function ( data, chatFunctions ) {
            const userID = this.getUserIDFromData( data );
            if ( this.isUserAFK( userID ) === true ) {
                this.removeUserFromAFKList( data, chatFunctions );
            } else {
                this.addToAFKList( data, chatFunctions );
            }
        },

        addToAFKList: function ( data, chatFunctions) {
            const userID = this.getUserIDFromData( data );

            afkPeople.push( userID );
            chatFunctions.botSpeak( data, '@' + this.getUsername( userID ) + ' you are marked as afk')
        },

        removeUserFromAFKList: function ( data, chatFunctions ) {
            const userID = this.getUserIDFromData( data );
            const listPosition = afkPeople.indexOf( userID );

            afkPeople.splice(listPosition, 1);

            chatFunctions.botSpeak( data, '@' + this.getUsername( userID ) + ' you are no longer afk')
        },

        howManyAFKUsers: function () {
            return afkPeople.length;
        },

        sendUserIsAFKMessage: function ( data, userID, chatFunctions ) {
            chatFunctions.botSpeak( data, '@' + this.getUsername( userID ) + ' is currently AFK, sorry')
        },


        // ========================================================

        // ========================================================
        // DJ Core Functions
        // ========================================================

        djList: () => djList,

        clearDJList: function () {
            djList = []
        },

        addDJToList: function (userID) {
            djList.push( userID );
        },

        removeDJFromList: function (userID) {
            const findDJ = ( dj ) => dj === userID;
            const listPosition = djList.findIndex( findDJ )

            djList.splice(listPosition, 1);
        },

        howManyDJs: function () {
            return djList.length;
        },

        clearCurrentDJFlags: function () {
            for (let userLoop = 0; userLoop < theUsersList.length; userLoop++) {
                theUsersList[userLoop]['currentDJ'] = false;
            }
        },

        setCurrentDJ: function (userID) {
            this.clearCurrentDJFlags()
            theUsersList[this.getPositionOnUsersList(userID)]['currentDJ'] = true;
        },

        getCurrentDJID: function () {
            this.debugPrintTheUsersList();

            for (let userLoop = 0; userLoop < theUsersList.length; userLoop++) {
                if ( theUsersList[userLoop]['currentDJ'] === true ) {
                    return theUsersList[userLoop]['id'];
                }
            }

            return null;
        },

        // ========================================================

        // ========================================================
        // DJ Helper Functions
        // ========================================================

        isCurrentDJ: function (userID) {
            const findDJ = ( dj ) => dj === userID;
            const listPosition = djList.findIndex( findDJ );

            return listPosition !== -1;
        },

        resetDJs: function (data) {
            let djID;
            if ( data.room !== undefined ) {
                for (let djLoop = 0; djLoop < data.room.metadata.djs.length; djLoop++) {
                    djID = data.room.metadata.djs[djLoop];
                    if (typeof djID !== 'undefined') {
                        this.initialiseDJPlayCount(djID);
                        this.addDJToList(djID);
                    }
                }
            }
        },

        checkOKToDJ: function (theUserID, roomFunctions) {
            if ( theUserID === authModule.USERID ) {
                return [ true, '' ];
            }

            if ( !this.isUserVIP(theUserID) && roomDefaults.vipsOnly ) {
                return [ false, "The VIP list is active...and you're not on the list. Sorry!" ];
            }

            if ( roomDefaults.queueActive ) {
                if ( this.isUserInRefreshList(theUserID) ) {
                    return [ true, '' ];
                }

                if ( this.isUserIDInQueue(theUserID) ) {
                    if ( theUserID !== this.headOfQueue() ) {
                        return [false, 'Sorry, but you are not first in queue. please wait your turn.'];
                    } else {
                        return [ true, '' ];
                    }
                } else {
                    return [ false, 'The queue is currently active. To add yourself to the queue type /addme. To remove yourself from the queue type /removeme.' ];
                }
            }

            if ( this.refreshDJCount() + this.djList().length >= 5 ) {
                return [ false, 'Sorry, but i\m holding that spot for someone in the refresh list' ];
            }

            for ( let banLoop = 0; banLoop < roomFunctions.tempBanList().length; banLoop++ ) {
                if (theUserID === roomFunctions.tempBanList()[banLoop]) {
                    return [ false, 'You are banned from djing. Please speak to a Mod to find out why' ];
                }
            }

            if (this.isUserIDStageBanned(theUserID)) {
                return [ false, 'You are banned from djing. Please speak to a Mod to find out why' ];
            }

            if ( this.getUserSpamCount(theUserID) >= roomDefaults.spamLimit ) {
                return [ false, 'You been SPAMming too much...please want a few minutes before trying again' ];
            }

            return [ true, '' ];
        },

        // ========================================================

        // ========================================================
        // DJ Play Count Functions
        // ========================================================

        deleteAllDJsPlayCount: function () {
            for (let userLoop = 0; userLoop < theUsersList.length; userLoop++) {
                this.deleteDJPlayCount(theUsersList[userLoop]['id']);
            }
        },

        initialiseDJPlayCount: function (userID) {
            if(this.isUserInUsersList(userID)) {
                this.setDJPlayCount(userID, 0);
            }
        },

        incrementDJPlayCount: function (userID) {
            ++theUsersList[this.getPositionOnUsersList(userID)]['songCount'];

        },

        decrementDJPlayCount: function (userID) {
            --theUsersList[this.getPositionOnUsersList(userID)]['songCount']
        },

        setDJPlayCount: function (userID, theCount) {
            if(this.isUserInUsersList(userID)) {
                theUsersList[this.getPositionOnUsersList(userID)]['songCount'] = theCount;
            }
        },

        deleteDJPlayCount: function (userID) {
            if(this.isUserInUsersList(userID)) {
                delete theUsersList[this.getPositionOnUsersList(userID)]['songCount'];
            }
        },

        getDJPlayCount: function (userID) {
            if(this.isUserInUsersList(userID)) {
                return theUsersList[this.getPositionOnUsersList(userID)]['songCount'];
            }
        },

        // ========================================================

        // ========================================================
        // DJ Queue Core Functions
        // ========================================================

        queueList: () => queueList,

        resetQueueList: function () {
            queueList = []
        },

        addUserToQueue: function (userID) {
            if (!roomDefaults.queueActive) {
                return [ false, "the queue is disabled." ];
            }

            if (this.isUserIDInQueue(userID)) {
                return [ false, "you are already in queue." ];
            }

            if (this.isUserIDOnStage(userID)) {
                return [ false, "you are already on stage!" ];
            }

            if (this.isUserIDStageBanned(userID)) {
                return [ false, "sorry, you are banned from the stage." ];
            }

            queueList.push( userID );
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
            const inQueue = queueList.indexOf(userID);
            return inQueue !== -1;
        },

        headOfQueue: function () {
            return queueList[0];
        },

        // ========================================================

        // ========================================================
        // DJ Queue Helper Functions
        // ========================================================

        enableQueue: function ( data, chatFunctions ) {
            roomDefaults.queueActive = true;
            chatFunctions.botSpeak( data, "The queue is now on" );
        },

        disableQueue: function ( data, chatFunctions ) {
            roomDefaults.queueActive = false;
            chatFunctions.botSpeak( data, "The queue is now off" );
        },

        readQueue: function ( data, chatFunctions ) {
            if (roomDefaults.queueActive === true) {
                chatFunctions.botSpeak( data, this.buildQueueMessage() );
            } else {
                chatFunctions.botSpeak( data, "The queue is not active" );
            }
        },

        buildQueueMessage: function () {
            let listOfUsers = '';
            let message;

            queueList.forEach(function(userID){
                if (listOfUsers==='') {
                    listOfUsers = this.getUsername(userID);

                } else {
                    listOfUsers = listOfUsers + ", " + this.getUsername(userID);

                }
            }.bind(this));

            if ( listOfUsers !== '' ) {
                message = "The queue is now: " + listOfUsers;
            } else {
                message = "The queue is empty...";
            }

            return message;
        },

        // ========================================================

        // ========================================================
        // User Object Functions
        // ========================================================

        resetUsersList: function () {
            theUsersList = []
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

        removeUserFromTheUsersList: function (userID) {
            let listPosition = this.getPositionOnUsersList(userID);
            if ( listPosition !== -1 ) {
                theUsersList.splice( listPosition, 1);
            }
        },

        deregisterUser: function (userID) {
            //double check to make sure that if someone is on stage and they disconnect, that they are being removed
            //from the current Dj's array
            let checkIfStillInDjArray = djList.indexOf(userID);
            if (checkIfStillInDjArray !== -1) {
                djList.splice(checkIfStillInDjArray, 1);
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

            this.removeUserFromTheUsersList(userID);
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
                bot.boot(userID)
            } else {
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

        addUserJoinedTime: function (userID) {
            if(this.isUserInUsersList(userID)) {
                theUsersList[this.getPositionOnUsersList(userID)]['joinTime'] = Date.now();
            }
        },

        getPositionOnUsersList: function (userID) {
            let listPosition = theUsersList.findIndex( ( { id } ) => id === userID)
            return listPosition;
        },

        userJoinsRoom: function (userID, username) {
            //adds users who join the room to the user list if their not already on the list
            this.addUserToTheUsersList(userID, username);

            //starts time for everyone that joins the room
            this.addUserJoinedTime(userID);

            //sets new persons spam count to zero
            this.resetUsersSpamCount(userID);
        },

        checkForEmptyUsersList: function (data) {
            if(theUsersList.length === 0) {
                this.rebuildUserList(data);
            }
        },

        isUserInUsersList: function (userID) {
            // if the userID is in the userList return true, else false
            return theUsersList.find(({id}) => id === userID) !== undefined;
        },

        addUserToTheUsersList: function (userID, username) {
            if (!this.isUserInUsersList(userID)) {
                theUsersList.push( { id: userID, username: username } );
            }
        },

        removeUserFromTheUsersList: function (userID) {
            let listLocation = theUsersList.find( ({ id }) => id === userID );
            theUsersList.splice(listLocation, 1);
        },

        rebuildUserList: function (data) {
            this.resetUsersList();
            let thisUserID;

            for (let i = 0; i < data.users.length; i++) {
                if (typeof data.users[i] !== 'undefined') {
                    thisUserID = data.users[i].userid;
                    this.addUserToTheUsersList(thisUserID, data.users[i].name);
                }
            }

        },

        startAllUserTimers: function () {
            //starts time in room for everyone currently in the room
            for (let userLoop = 0; userLoop < theUsersList.length; userLoop++) {
                if (typeof theUsersList[userLoop].id !== 'undefined') {
                    this.addUserJoinedTime(theUsersList[userLoop].id);
                }
            }
        },

        // ========================================================

        // ========================================================
        // Other User Functions
        // ========================================================

        checkTextForUsernames: function ( theText ) {
            let loopUsername;
            let mentions = [];

            if ( theText.indexOf('@') !== -1 ) {
                for ( afkPeopleLoop = 0; afkPeopleLoop < afkPeople.length; afkPeopleLoop++ ) {
                    loopUsername = this.getUsername( afkPeople[afkPeopleLoop] );
                    if ( theText.indexOf( '@' + loopUsername ) !== -1 ) {
                        mentions.push( loopUsername );
                    }
                }
            }

            return mentions;
        },

        // ========================================================

        // ========================================================
        // Inform Functions
        // ========================================================

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

        // ========================================================

        // ========================================================
        // Warn Me Functions
        // ========================================================

        warnMeCall: function (roomFunctions) {
            if (warnme.length !== 0) //is there anyone in the warnme?
            {
                let whatIsPosition = djList.indexOf(roomFunctions.checkWhoIsDj()); //what position are they

                if (whatIsPosition === djList.length - 1) //if 5th dj is playing, check guy on the left
                {
                    let areTheyNext = warnme.indexOf(djList[0]);
                    if (areTheyNext !== -1) //is the next dj up in the warnme?
                    {
                        bot.pm('your song is up next!', djList[0]);
                        warnme.splice(areTheyNext, 1);

                    }
                } else {
                    let areTheyNext = warnme.indexOf(djList[whatIsPosition + 1]);
                    if (areTheyNext !== -1) //is the next dj up in the warnme?
                    {
                        bot.pm('your song is up next!', djList[whatIsPosition + 1]);
                        warnme.splice(areTheyNext, 1);

                    }
                }
            }
        },

        resetAllWarnMe: function (data) {
            let theUserID;
            if ( data.room !== undefined ) {
                for (let userLoop = 0; userLoop < data.users.length; userLoop++) {
                    theUserID = data.users[userLoop];
                    if (typeof theUserID !== 'undefined') {
                        this.removeWarnMeFromUser(theUserID);
                    }
                }
            }
        },

        addWarnMeToUser(userID) {
            if(this.isUserInUsersList(userID)) {
                theUsersList[this.getPositionOnUsersList(userID)]['WarnMe'] = true;
            }
        },

        removeWarnMeFromUser(userID) {
            if(this.isUserInUsersList(userID)) {
                delete theUsersList[this.getPositionOnUsersList(userID)]['WarnMe'];
            }
        },

        // ========================================================

        // ========================================================
        // Escort Me Functions
        // ========================================================

        resetAllEscortMe: function (data) {
            let theUserID;
            if ( data.room !== undefined ) {
                for (let userLoop = 0; userLoop < data.users.length; userLoop++) {
                    theUserID = data.users[userLoop];
                    if (typeof theUserID !== 'undefined') {
                        this.removeEscortMeFromUser(theUserID);
                    }
                }
            }
        },

        addEscortMeToUser: function (userID) {
            if(this.isUserInUsersList(userID)) {
                theUsersList[this.getPositionOnUsersList(userID)]['EscortMe'] = true;
            }
        },

        removeEscortMeFromUser: function (userID) {
            if(this.isUserInUsersList(userID)) {
                delete theUsersList[this.getPositionOnUsersList(userID)]['EscortMe'];
            }
        },

        escortMeIsEnabled: function (userID) {
            if(this.isUserInUsersList(userID)) {
                if ( theUsersList[this.getPositionOnUsersList(userID)]['EscortMe'] === true ) {
                    return true;
                } else {
                    return false;
                }
            }
        },


        // ========================================================

    }
}

module.exports = userFunctions;
