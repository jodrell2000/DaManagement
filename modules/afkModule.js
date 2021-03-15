//whichFunction represents which justSaw object do you want to access
let lastSeen = {}; //holds a date object to be used for the dj afk timer, there are different ones because they have different timeouts
let lastSeen1 = {}; //holds a date object to be used for the dj afk timer
let lastSeen2 = {}; //holds a date object to be used for the dj afk timer
let lastSeen3 = {}; //holds a date object to be used for the audience afk limit
let lastSeen4 = {}; //holds a date object to be used for the audience afk limit

module.exports = {
    afkLimit: 20, //set the afk limit in minutes here
    roomAFK: false, //audience afk limit(off by default)
    roomafkLimit: 30, //set the afk limit for the audience here(in minutes), this feature is off by default
    AFK : true, //afk limit(on by default), this is for the dj's on stage

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
    }
}