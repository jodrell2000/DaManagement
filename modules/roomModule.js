let afkModule = require('../modules/afkModule.js');
let userModule = require('../modules/userModule.js');
let authModule = require('../auth.js');

module.exports = {
    roomName: null, //the name of the room, example "straight chillin" would be the format for the straight chillin room...

    queue: true, //queue(on by default)
    
    greet: true, //room greeting when someone joins the room(on by default)
    greetThroughPm: false, //choose whether greeting message is through the pm or the chatbox(false = chatbox, true = pm), (only works when greeting message is turned on) (off by default)
    greetingTimer: [], //holds the timeout for people that join the room, if someone rejoins before their timeout completes their timer is reset
    roomJoinMessage: '', //the message users will see when they join the room, leave it empty for the default message (only works when greet is turned on)

    blackList: [], //holds the userid of everyone who is in the command based banned from the room list

    kickTTSTAT: false, //kicks the ttstats bot when it tries to join the room(off by default)

    theme: false, //has a current theme been set? true or false. handled by commands
    whatIsTheme: null, //this holds a string which is set by the /setTheme command


    userJoinsRoom: function (data, bot) {
        //if there are 5 dj's on stage and the queue is turned on when a user enters the room
        if (this.queue === true && userModule.currentDJs.length === 5) {
            bot.pm('The queue is currently active. To add yourself to the queue type /addme. To remove yourself from the queue type /removeme.', data.user[0].userid);
        }
        
        //gets newest user and prints greeting, does not greet the bot or the ttstats bot, or banned users
        let roomjoin = data.user[0];
        let areTheyBanned = this.blackList.indexOf(data.user[0].userid);
        let areTheyBanned2 = userModule.bannedUsers.indexOf(data.user[0].userid);
        if (this.greet === true && data.user[0].userid !== authModule.USERID && !data.user[0].name.match('@ttstat')) {
            if (areTheyBanned === -1 && areTheyBanned2 === -1) {
                if (this.greetingTimer[data.user[0].userid] !== null) {
                    clearTimeout(this.greetingTimer[data.user[0].userid]);
                    this.greetingTimer[data.user[0].userid] = null;
                }
                this.greetingTimer[data.user[0].userid] = setTimeout(function () {
                    this.greetingTimer[data.user[0].userid] = null;
                    if (this.roomJoinMessage !== '') //if your not using the default greeting
                    {
                        if (this.theme === false) //if theres no theme this is the message.
                        {
                            if (this.greetThroughPm === false) //if your not sending the message through the pm
                            {
                                bot.speak('@' + roomjoin.name + ', ' + this.roomJoinMessage);
                            } else {
                                bot.pm(this.roomJoinMessage, roomjoin.userid);
                            }
                        } else {
                            if (this.greetThroughPm === false) {
                                bot.speak('@' + roomjoin.name + ', ' + this.roomJoinMessage + '; The theme is currently set to: ' + this.whatIsTheme);
                            } else {
                                bot.pm(this.roomJoinMessage + '; The theme is currently set to: ' + this.whatIsTheme, roomjoin.userid);
                            }
                        }
                    } else {
                        if (this.theme === false) //if theres no theme this is the message.
                        {
                            if (this.greetThroughPm === false) {
                                bot.speak('Welcome to ' + this.roomName + ' @' + roomjoin.name + ', enjoy your stay!');
                            } else {
                                bot.pm('Welcome to ' + this.roomName + ' @' + roomjoin.name + ', enjoy your stay!', roomjoin.userid);
                            }
                        } else {
                            if (this.greetThroughPm === false) {
                                bot.speak('Welcome to ' + this.roomName + ' @' + roomjoin.name + ', the theme is currently set to: ' + this.whatIsTheme);
                            } else {
                                bot.pm('Welcome to ' + this.roomName + ' @' + roomjoin.name + ', the theme is currently set to: ' + this.whatIsTheme, roomjoin.userid);
                            }
                        }
                    }
                    delete this.greetingTimer[data.user[0].userid];
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
        for (let i = 0; i < this.blackList.length; i++) {
            if (roomjoin.userid === this.blackList[i]) {
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
        if (this.kickTTSTAT === true) {
            if (data.user[0].name.match('@ttstat')) {
                bot.boot(data.user[0].userid);
            }
        }

    }
}