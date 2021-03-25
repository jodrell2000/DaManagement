let roomDefaults = require('../defaultSettings/roomDefaults.js');

let afkModule = require('../modules/afkModule.js');
let userModule = require('../modules/userModule.js');
let authModule = require('../auth.js');
let chatModule = require('../modules/chatModule.js');

module.exports = {
    userJoinsRoom: function (data, bot) {
        //if there are 5 dj's on stage and the queue is turned on when a user enters the room
        if (roomDefaults.queue === true && userModule.currentDJs.length === 5) {
            bot.pm('The queue is currently active. To add yourself to the queue type /addme. To remove yourself from the queue type /removeme.', data.user[0].userid);
        }
        
        //gets newest user and prints greeting, does not greet the bot or the ttstats bot, or banned users
        let roomjoin = data.user[0];
        let areTheyBanned = roomDefaults.blackList.indexOf(data.user[0].userid);
        let areTheyBanned2 = userModule.bannedUsers.indexOf(data.user[0].userid);
        if (roomDefaults.greet === true && data.user[0].userid !== authModule.USERID && !data.user[0].name.match('@ttstat')) {
            if (areTheyBanned === -1 && areTheyBanned2 === -1) {
                const greetingTimers = roomDefaults.greetingTimer;
                const userId = data.user[0].userid;

                // if there's a timeout function waiting to be called for
                // this user, cancel it.
                if (greetingTimers[userId] !== null) {
                    clearTimeout(greetingTimers[userId]);
                    delete greetingTimers[userId];
                }

                greetingTimers[userId] = setTimeout(function() {
                    chatModule.userGreeting(bot, data)

                    // remove timeout function from the list of timeout functions
                    delete greetingTimers[userId];
                }, 3 * 1000);
            }
        }

        //starts time for everyone that joins the room
        userModule.myTime[data.user[0].userid] = Date.now();
        
        //sets new persons spam count to zero
        userModule.people[data.user[0].userid] = {
            spamCount: 0
        };

        //adds users who join the room to the user list if their not already on the list
        let checkList = userModule.theUsersList.indexOf(data.user[0].userid);
        if (checkList === -1) {
            if (typeof data.user[0] !== 'undefined') {
                userModule.theUsersList.push(data.user[0].userid, data.user[0].name);
            }
        }
        
        //checks to see if user is on the banlist, if they are they are booted from the room.
        for (let i = 0; i < roomDefaults.blackList.length; i++) {
            if (roomjoin.userid === roomDefaults.blackList[i]) {
                bot.bootUser(roomjoin.userid, 'You are on the banlist.');
                break;
            }
        }

        //checks manually added users
        for (let z = 0; z < userModule.bannedUsers.length; z++) {
            if (userModule.bannedUsers[z].match(roomjoin.userid)) {
                bot.bootUser(roomjoin.userid, 'You are on the banlist.');
                break;
            }
        }
        
        //puts people who join the room on the global afk list
        if (afkModule.roomAFK === true) {
            afkModule.justSaw(data.user[0].userid, 'justSaw3');
            afkModule.justSaw(data.user[0].userid, 'justSaw4');
        }
        
        //this kicks the ttstats bot
        if (roomDefaults.kickTTSTAT === true) {
            if (data.user[0].name.match('@ttstat')) {
                bot.boot(data.user[0].userid);
            }
        }

    }
}