let userModule = require('../modules/userModule.js');
let roomDefaults = require('../defaultSettings/roomDefaults.js');
let authModule = require('../auth.js');
let roomModule = require('../modules/roomModule.js');
let moderatorModule = require('../modules/moderatorModule.js');

module.exports = {
    afkLimit: 20, //set the afk limit in minutes here
    roomAFK: false, //audience afk limit(off by default)
    roomafkLimit: 30, //set the afk limit for the audience here(in minutes), this feature is off by default
    AFK: true, //afk limit(on by default), this is for the dj's on stage

    lastSeen: {}, //holds a date object to be used for the dj afk timer, there are different ones because they have different timeouts
    lastSeen1: {}, //holds a date object to be used for the dj afk timer
    lastSeen2: {}, //holds a date object to be used for the dj afk timer
    lastSeen3: {}, //holds a date object to be used for the audience afk limit
    lastSeen4: {}, //holds a date object to be used for the audience afk limit

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
    afkCheck: function (bot) {
        let afker;
        for (let i = 0; i < userModule.currentDJs.length; i++) {
            afker = userModule.currentDJs[i]; //Pick a DJ
            let isAfkMaster = userModule.masterIds.indexOf(afker); //master ids check
            let whatIsAfkerName = userModule.theUsersList.indexOf(afker) + 1;
            if ((this.isAFK(afker, (this.afkLimit - 5), 'isAfk1')) && this.AFK === true) {
                if (afker !== authModule.USERID && isAfkMaster === -1) {
                    if (roomDefaults.afkThroughPm === false) {
                        bot.speak('@' + userModule.theUsersList[whatIsAfkerName] + ' you have 5 minutes left of afk, chat or awesome please.');
                    } else {
                        bot.pm('you have 5 minutes left of afk, chat or awesome please.', afker);
                    }
                    this.justSaw(afker, 'justSaw1');
                }
            }
            if ((this.isAFK(afker, (this.afkLimit - 1), 'isAfk2')) && this.AFK === true) {
                if (afker !== authModule.USERID && isAfkMaster === -1) {
                    if (roomDefaults.afkThroughPm === false) {
                        bot.speak('@' + userModule.theUsersList[whatIsAfkerName] + ' you have 1 minute left of afk, chat or awesome please.');
                    } else {
                        bot.pm('you have 1 minute left of afk, chat or awesome please.', afker);
                    }
                    this.justSaw(afker, 'justSaw2');
                }
            }
            if ((this.isAFK(afker, this.afkLimit, 'isAfk')) && this.AFK === true) { //if Dj is afk then
                if (afker !== authModule.USERID && isAfkMaster === -1) //checks to see if afker is a mod or a bot or the current dj, if they are is does not kick them.
                {
                    if (afker !== roomModule.checkWhoIsDj) {
                        if (roomDefaults.afkThroughPm === false) {
                            bot.speak('@' + userModule.theUsersList[whatIsAfkerName] + ' you are over the afk limit of ' + this.afkLimit + ' minutes.');
                        } else {
                            bot.pm('you are over the afk limit of ' + this.afkLimit + ' minutes.', afker);
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
    roomAFKCheck: function (bot) {
        for (let i = 0; i < userModule.userIDs.length; i++) {
            let afker2 = userModule.userIDs[i]; //Pick a DJ
            let isAfkMod = moderatorModule.modList.indexOf(afker2);
            let isDj = userModule.currentDJs.indexOf(afker2);
            if ((this.isAFK(afker2, ( this.roomafkLimit - 1), 'isAfk3')) && this.roomAFK === true)
            {

                if (afker2 !== authModule.USERID && isDj === -1 && isAfkMod === -1)
                {
                    bot.pm('you have 1 minute left of afk, chat or awesome please.', afker2);
                    this.justSaw(afker2, 'justSaw3');
                }
            }
            if ((this.isAFK(afker2,  this.roomafkLimit, 'isAfk4')) && this.roomAFK === true)
            { //if person is afk then
                if (afker2 !== authModule.USERID && isAfkMod === -1) //checks to see if afker is a mod or a bot or a dj, if they are is does not kick them.
                {
                    if (isDj === -1)
                    {
                        bot.pm('you are over the afk limit of ' +  this.roomafkLimit + ' minutes.', afker2);
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

}