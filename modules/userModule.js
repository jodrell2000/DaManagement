module.exports = {
    theUsersList: [], //holds the name and userid of everyone in the room
    queueName: [], //holds just the name of everyone who is in the queue
    queueList: [], //holds the name and userid of everyone in the queue
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


    resetUsersList: function (bot) {
        this.theUsersList = []
        bot.speak("I've reset the Users list");
    },

    resetQueueNames: function (bot) {
        this.queueName = []
        bot.speak("I've reset the Queue Names");
    },

    resetQueueList: function (bot) {
        this.queueList = []
        bot.speak("I've reset the Queue List");
    },

    resetAFKPeople: function (bot) {
        this.afkPeople = []
        bot.speak("I've reset the AFK List");
    },

    resetModPM: function (bot) {
        this.modPM = []
        bot.speak("I've reset the ModPM List");
    },

    resetCurrentDJs: function (bot) {
        this.currentDJs = []
        bot.speak("I've reset the Current DJs List");
    },

    resetUserIDs: function (bot) {
        this.userIDs = []
        bot.speak("I've reset the UserIDs");
    },

    resetMyTime: function (bot) {
        this.myTime = []
        bot.speak("I've reset My Time");
    },

    resetPeople: function (bot) {
        this.people = []
        bot.speak("I've reset the People");
    },

    resetWarnMe: function (bot) {
        this.warnme = [];
        bot.speak("I've reset the Warn Me list");
    },

    resetDJSongCount: function (bot) {
        this.djSongCount = [];
        bot.speak("I've reset the DJ Song count");
    },

    updateUser: function (data) {
        if (typeof data.name === 'string') {
            let oldname = ''; //holds users old name if exists
            let queueNamePosition;
            let queueListPosition;
            let afkPeoplePosition;

            //when when person updates their profile
            //and their name is not found in the users list then they must have changed
            //their name
            if (this.theUsersList.indexOf(data.name) === -1) {
                let nameIndex = this.theUsersList.indexOf(data.userid);
                if (nameIndex !== -1) //if their userid was found in theUsersList
                {
                    oldname = this.theUsersList[nameIndex + 1];
                    this.theUsersList[nameIndex + 1] = data.name;

                    if (typeof oldname !== 'undefined') {
                        queueNamePosition = this.queueName.indexOf(oldname);
                        queueListPosition = this.queueList.indexOf(oldname);
                        afkPeoplePosition = this.afkPeople.indexOf(oldname);


                        if (queueNamePosition !== -1) //if they were in the queue when they changed their name, then replace their name
                        {
                            this.queueName[queueNamePosition] = data.name;
                        }

                        if (queueListPosition !== -1) //this is also for the queue
                        {
                            this.queueList[queueListPosition] = data.name;
                        }

                        if (afkPeoplePosition !== -1) //this checks the afk list
                        {
                            this.afkPeople[afkPeoplePosition] = data.name;
                        }
                    }
                }
            }
        }
    },

    deregisterUser: function (data, bot) {
        //removes dj's from the lastSeen object when they leave the room
        delete this.lastSeen[data.user[0].userid];
        delete this.lastSeen1[data.user[0].userid];
        delete this.lastSeen2[data.user[0].userid];
        delete this.lastSeen3[data.user[0].userid];
        delete this.lastSeen4[data.user[0].userid];
        delete this.people[data.user[0].userid];
        delete this.timer[data.user[0].userid];
        delete this.myTime[data.user[0].userid];


        //double check to make sure that if someone is on stage and they disconnect, that they are being removed
        //from the current Dj's array
        let checkIfStillInDjArray = this.currentDJs.indexOf(data.user[0].userid);
        if (checkIfStillInDjArray !== -1)
        {
            this.currentDJs.splice(checkIfStillInDjArray, 1);
        }

        //removes people who leave the room from the afk list
        if (this.afkPeople.length !== 0)
        {
            let checkUserName = this.afkPeople.indexOf(data.user[0].name);
            if (checkUserName !== -1)
            {
                this.afkPeople.splice(checkUserName, 1);
            }
        }

        //removes people leaving the room in modpm still
        if (this.modPM.length !== 0)
        {
            let areTheyStillInModpm = this.modPM.indexOf(data.user[0].userid);

            if (areTheyStillInModpm !== -1)
            {
                let whatIsTheirName = this.theUsersList.indexOf(data.user[0].userid);
                this.modPM.splice(areTheyStillInModpm, 1);

                if (whatIsTheirName !== -1)
                {
                    for (let hg = 0; hg < this.modPM.length; hg++)
                    {
                        if (typeof this.modPM[hg] !== 'undefined' && this.modPM[hg] !== data.user[0].userid)
                        {
                            bot.pm(this.theUsersList[whatIsTheirName + 1] + ' has left the modpm chat', this.modPM[hg]);
                        }
                    }
                }
            }
        }

        //updates the users list when a user leaves the room.
        let checkLeave = this.theUsersList.indexOf(data.user[0].userid);
        let checkUserIds = this.userIDs.indexOf(data.user[0].userid);

        if (checkLeave !== -1 && checkUserIds !== -1)
        {
            this.theUsersList.splice(checkLeave, 2);
            this.userIDs.splice(checkUserIds, 1);
        }
    },
}