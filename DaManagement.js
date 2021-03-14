/** Da Management Turntable.fm bot
    Adam Reynolds 2021
    version 0.1 (forked from Mr. Roboto by Jake Smith)
    version 1.0 (forked from chillybot)
*/


/*******************************BeginSetUp*****************************************************************************/
let Bot = require('ttapi');
let authModule = require('./auth.js');
let botDefaults = require('./defaultSettings/botDefaults.js');
let roomDefaults = require('./defaultSettings/roomDefaults.js');
let userDefaults = require('./defaultSettings/userDefaults.js');
let musicDefaults = require('./defaultSettings/musicDefaults.js');

let AFK = true; //afk limit(on by default), this is for the dj's on stage
let MESSAGE = true; //room message(on by default), the bot says your room info in intervals of whatever the  roomDefaultsModule.howOftenToRepeatMessage variable above is set to in minutes
let defaultMessage = true;
/*This corresponds to the MESSAGE variable directly above, if true it will give you the default repeat message along with your room info, if false it will only say your room info.
                              (only works when MESSAGE = true) (this feature is on by default)
                            */
let GREET = true; //room greeting when someone joins the room(on by default)
let voteSkip = false; //voteskipping(off by default)
let roomAFK = false; //audience afk limit(off by default)
let SONGSTATS = true; //song stats after each song(on by default)
let kickTTSTAT = false; //kicks the ttstats bot when it tries to join the room(off by default)
let LIMIT = true; //song length limit (on by default)
let PLAYLIMIT = false; //song play limit, this is for the playLimit variable up above(off by default)
let autoSnag = true; //auto song adding(different from every song adding), tied to  botDefaultsModule.howManyVotes up above, (off by default)
let autoBop = true; //choose whether the bot will autobop for each song or not(against the rules but i leave it up to you) (off by default)
let afkThroughPm = true; //choose whether afk warnings(for dj's on stage) will be given through the pm or the chatbox (false = chatbox, true = pm message)
let greetThroughPm = false; //choose whether greeting message is through the pm or the chatbox(false = chatbox, true = pm), (only works when greeting message is turned on) (off by default)
let repeatMessageThroughPm = false;
/*choose whether the repeating room message(the one corresponding to MESSAGE up above) will be through the chatbox or the pm,
                                      (false = through the chatbox, true = through the pm) (MESSAGE must equal true for this to work) (this feature is off by default)                                      
                                    */
//this is for the event messages
//This cycles through all the different messages that you enter into this array. one message per time cycle, once it gets to the end of your messages it starts over again
let eventMessageRepeatTime = 15; //how long in minutes between event messages(must have EVENTMESSAGE = true to see any messages)
let eventMessageThroughPm = false; //determines whether event message will be pmmed or said in chat, false = chatbox, true = pm box
let EVENTMESSAGE = false; //this disables / enables event message on startup - true = enabled, false = disabled                                 

//the messages in here are examples, it is recommended that you clear them before using
global.eventMessages = ['hello there', //enter your different event messages here, any messages that you want repeated

    'message 2' +
    ' this is an example message, multiple lines should be separate strings added together',

    'this is a test'
];


/************************************EndSetUp**********************************************************************/

//do not change the values of any of the global variables below unless you know what you are doing, the discriptions given are for reference only

let defaultPlayLimit = roomDefaults.playLimit; //saves the default value for the play limit
let spamLimit = 3; //number of times a user can spam being kicked off the stage within 10 secs
let myId = null; //the userid of the person using the /fanme command, speak event only
let detail = null; //the discription given in the "room" tab of the room that the bot is in
let current = null; //the number of dj's on stage, gets reset every song
let name = null; //the name of the person using the person who activated the speak event
let dj = null; //the name of the currently playing dj
let condition = null; //is the person using a command a moderator? true or false
let index = null; //the index returned when using unban commands
let song = null; //the name of the current song
let album = null; //the album name of the current song
let genre = null; //the genre of the current song
let skipOn = null; //if true causes the bot to skip every song it plays, toggled on and off by commands
let snagSong = false; //if true causes the bot to add every song that plays to its queue
let checkWhoIsDj = null; //the userid of the currently playing dj
let randomOnce = 0; //a flag used to check if the /randomSong command has already been activated, 0 is no, 1 is yes
let voteCountSkip = 0; //the current amount of votes for a song skip, gets reset every song
let votesLeft = roomDefaults.HowManyVotesToSkip; //a countdown of the amount of votes needed till a song gets skipped
let sayOnce = true; //makes it so that the queue timeout can only be used once per per person, stops the bot from spamming
let artist = null; //the artist name of the currently playing song
let getSong = null; //the id3 tag id of the currently playing song
let informTimer = null; //holds the timeout for the /inform command, null lets it know that it hasn't already been set
let upVotes = null; //the amount of upvotes or "awesome's" that the currently playing song has recieved
let downVotes = null; //the amount of downvotes or "lame's" that the currently playing song has recieved
let whoSnagged = 0; //the amount of people who have added the currently playing song to their dj queue
let beginTime = null; //the current time in milliseconds when the bot has started, used for the /uptime
let endTime = null; //the current time in milliseconds when the /uptime is actually used
let roomName = null; //the name of the room, example "straight chillin" would be the format for the straight chillin room...
let ttRoomName = null; //the url extension of the room name, example "straight_chillin16" would be the format
let THEME = false; //has a current theme been set? true or false. handled by commands
let whatIsTheme = null; //this holds a string which is set by the /setTheme command
let messageCounter = 0; //this is for the array of messages, it lets it know which message it is currently on, resets to 0 after cycling through all of them
let ALLREADYCALLED = false; //resets votesnagging so that it can be called again
let thisHoldsThePlaylist = null; //holds a copy of the playlist
let netwatchdogTimer = null; // Used to detect internet connection dropping out
let checkActivity = Date.now();
let attemptToReconnect = null; //used for reconnecting to the bots room if its not in there (only works if internet connection is working)
let returnToRoom = true; //used to toggle on and off the bot reconnecting to its room(it toggles off when theres no internet connection because it only works when its connected to turntable.fm)
let wserrorTimeout = null; //this is for the setTimeout in ws error
let errorMessage = null; //the error message you get when trying to connect to the room
let bannedArtistsMatcher; //holds the regular expression for banned artist / song matching
let autoDjingTimer = null; //governs the timer for the bot's auto djing

global.playLimitOfRefresher = []; //holds a copy of the number of plays for people who have used the /refresh command
global.refreshList = []; //this holds the userid's of people who have used the /refresh command
global.refreshTimer = []; //this holds the timers of people who have used the /refresh command
global.modpm = []; //holds the userid's of everyone in the /modpm feature
global.warnme = []; //holds the userid's of everyone using the /warnme feature
global.timer = []; //holds the timeout of everyone who has been spamming the stage, resets their spam count if their timer completes
global.greetingTimer = []; //holds the timeout for people that join the room, if someone rejoins before their timeout completes their timer is reset
global.djs20 = []; //holds the song count that each of the dj's on stage have played
global.people = []; //holds the userid's of everyone who is kicked off stage for the spam limit
global.lastSeen = {}; //holds a date object to be used for the dj afk timer, there are different ones because they have different timeouts
global.lastSeen1 = {}; //holds a date object to be used for the dj afk timer
global.lastSeen2 = {}; //holds a date object to be used for the dj afk timer
global.lastSeen3 = {}; //holds a date object to be used for the audience afk limit
global.lastSeen4 = {}; //holds a date object to be used for the audience afk limit
global.afkPeople = []; //holds the userid of everyone who has used the /afk command
global.blackList = []; //holds the userid of everyone who is in the command based banned from the room list
global.stageList = []; //holds the userid of everyone who is in the command based banned from stage list
global.userIds = []; //holds the userid's of everyone who is in the room
global.checkVotes = []; //holds the userid's of everyone who has voted for the currently playing song to be skipped, is cleared every song
global.theUsersList = []; //holds the name and userid of everyone in the room
global.modList = []; //holds the userid of everyone who is a moderator in the room
global.escortList = []; //holds the userid of everyone who has used the /escortme command, auto removed when the person leaves the stage
global.currentDjs = []; //holds the userid of all the dj's who are on stage currently
global.queueList = []; //holds the name and userid of everyone in the queue
global.queueName = []; //holds just the name of everyone who is in the queue
global.myTime = []; //holds a date object for everyone in the room, which represents the time when they joined the room, resets every time the person rejoins
global.curSongWatchdog = null; //used to hold the timer for stuck songs
global.takedownTimer = null; //used to hold the timer that fires after curSongWatchDog which represents the time a person with a stuck song has left to skip their song
global.lastdj = null; //holds the userid of the currently playing dj
global.songLimitTimer = null; //holds the timer used to remove a dj off stage if they don't skip their song in time, and their song has exceeded the max allowed song time
global.beginTimer = null; //holds the timer the auto removes dj's from the queue if they do not get on stage within the allowed time period

let bot = new Bot(authModule.AUTH, authModule.USERID, authModule.ROOMID); //initializes the bot
bot.debug = true;

bot.listen(process.env.PORT,process.env.IP); //needed for running the bot on a server

bot.on('disconnected', function (data) {

});



let checkIfConnected = function ()
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
                            attempToReconnect();
                        }
                    });
            }
        }
        else //else attempt to reconnect right away
        {
            attempToReconnect();
        }
    }
};

setInterval(checkIfConnected, 5000);



//makes the bot attempt to reconnect to the room

function attempToReconnect()
{
    attemptToReconnect = setInterval(function ()
    {
        if (bot._isAuthenticated)
        {
            whichMessage = true;
            console.log('it looks like your bot is not in it\'s room. attempting to reconnect now....');
        }
        else
        {
            whichMessage = false;
            console.log('connection with turntable lost, waiting for connection to come back...');
        }

        bot.roomRegister(authModule.ROOMID, function (data)
        {
            if (data.success === true)
            {
                errorMessage = null;
                clearInterval(attemptToReconnect);
                attemptToReconnect = null;
                checkActivity = Date.now();

                if (whichMessage)
                {
                    console.log('the bot has reconnected to the room ' +
                        'specified by your choosen roomid');
                }
                else
                {
                    console.log('connection with turntable is back!');
                }
            }
            else
            {
                if (errorMessage === null && typeof data.err === 'string')
                {
                    errorMessage = data.err;
                }
            }
        });
    }, 1000 * 10);
};



//whichFunction represents which justSaw object do you want to access
global.justSaw = function (uid, whichFunction)
{
    switch (whichFunction)
    {
    case 'justSaw':
        return lastSeen[uid] = Date.now();
        break;
    case 'justSaw1':
        return lastSeen1[uid] = Date.now();
        break;
    case 'justSaw2':
        return lastSeen2[uid] = Date.now();
        break;
    case 'justSaw3':
        return lastSeen3[uid] = Date.now();
        break;
    case 'justSaw4':
        return lastSeen4[uid] = Date.now();
        break;
    }
}



//whichFunction represents which justSaw object do you want to access
//num is the time in minutes till afk timeout
//userid is the person's userid
global.isAfk = function (userId, num, whichFunction)
{
    //which last seen object to use?
    switch (whichFunction)
    {
    case 'isAfk':
        var last = lastSeen[userId];
        break;
    case 'isAfk1':
        var last = lastSeen1[userId];
        break;
    case 'isAfk2':
        var last = lastSeen2[userId];
        break;
    case 'isAfk3':
        var last = lastSeen3[userId];
        break;
    case 'isAfk4':
        var last = lastSeen4[userId];
        break;
    }

    let age_ms = Date.now() - last;
    let age_m = Math.floor(age_ms / 1000 / 60);
    if (age_m >= num)
    {
        return true;
    }
    return false;
};



global.updateAfkPostionOfUser = function (userid)
{
    //updates the afk position of the speaker.
    if (AFK === true || roomAFK === true)
    {
        justSaw(userid, 'justSaw');
        justSaw(userid, 'justSaw1');
        justSaw(userid, 'justSaw2');
        justSaw(userid, 'justSaw3');
        justSaw(userid, 'justSaw4');
    }
};



//removes afk dj's after roomDefaultsModule.afkLimit is up.
global.afkCheck = function ()
{
    for (let i = 0; i < currentDjs.length; i++)
    {
        afker = currentDjs[i]; //Pick a DJ
        let isAfkMaster = userDefaults.masterIds.indexOf(afker); //master ids check
        let whatIsAfkerName = theUsersList.indexOf(afker) + 1;
        if ((isAfk(afker, (roomDefaults.afkLimit - 5), 'isAfk1')) && AFK === true)
        {
            if (afker != authModule.USERID && isAfkMaster == -1)
            {
                if (afkThroughPm === false)
                {
                    bot.speak('@' + theUsersList[whatIsAfkerName] + ' you have 5 minutes left of afk, chat or awesome please.');
                }
                else
                {
                    bot.pm('you have 5 minutes left of afk, chat or awesome please.', afker);
                }
                justSaw(afker, 'justSaw1');
            }
        }
        if ((isAfk(afker, (roomDefaults.afkLimit - 1), 'isAfk2')) && AFK === true)
        {
            if (afker != authModule.USERID && isAfkMaster == -1)
            {
                if (afkThroughPm === false)
                {
                    bot.speak('@' + theUsersList[whatIsAfkerName] + ' you have 1 minute left of afk, chat or awesome please.');
                }
                else
                {
                    bot.pm('you have 1 minute left of afk, chat or awesome please.', afker);
                }
                justSaw(afker, 'justSaw2');
            }
        }
        if ((isAfk(afker, roomDefaults.afkLimit, 'isAfk')) && AFK === true)
        { //if Dj is afk then      
            if (afker != authModule.USERID && isAfkMaster == -1) //checks to see if afker is a mod or a bot or the current dj, if they are is does not kick them.
            {
                if (afker != checkWhoIsDj)
                {
                    if (afkThroughPm === false)
                    {
                        bot.speak('@' + theUsersList[whatIsAfkerName] + ' you are over the afk limit of ' + roomDefaults.afkLimit + ' minutes.');
                    }
                    else
                    {
                        bot.pm('you are over the afk limit of ' + roomDefaults.afkLimit + ' minutes.', afker);
                    }
                    justSaw(afker, 'justSaw1');
                    justSaw(afker, 'justSaw2');
                    justSaw(afker, 'justSaw');
                    bot.remDj(afker); //remove them 
                }
            }
        }
    }
};

setInterval(afkCheck, 5000); //This repeats the check every five seconds.



//this removes people on the floor, not the djs
roomAfkCheck = function ()
{
    for (let i = 0; i < userIds.length; i++)
    {
        let afker2 = userIds[i]; //Pick a DJ
        let isAfkMod = modList.indexOf(afker2);
        let isDj = currentDjs.indexOf(afker2);
        if ((isAfk(afker2, ( roomDefaults.roomafkLimit - 1), 'isAfk3')) && roomAFK === true)
        {

            if (afker2 != authModule.USERID && isDj == -1 && isAfkMod == -1)
            {
                bot.pm('you have 1 minute left of afk, chat or awesome please.', afker2);
                justSaw(afker2, 'justSaw3');
            }
        }
        if ((isAfk(afker2,  roomDefaults.roomafkLimit, 'isAfk4')) && roomAFK === true)
        { //if person is afk then      
            if (afker2 != authModule.USERID && isAfkMod == -1) //checks to see if afker is a mod or a bot or a dj, if they are is does not kick them.
            {
                if (isDj == -1)
                {
                    bot.pm('you are over the afk limit of ' +  roomDefaults.roomafkLimit + ' minutes.', afker2);
                    bot.boot(afker2, 'you are over the afk limit');
                    justSaw(afker2, 'justSaw3');
                    justSaw(afker2, 'justSaw4');
                }
            }
        }
    }
};

setInterval(roomAfkCheck, 5000) //This repeats the check every five seconds.



//this function handles removing people from the queue after holding their spot open for a certain amount of time
queueCheck15 = function ()
{
    //if queue is turned on once someone leaves the stage the first person
    //in line has 60 seconds to get on stage before being remove from the queue
    if (roomDefaults.queue === true && queueList.length !== 0)
    {
        if (sayOnce === true && (refreshList.length + currentDjs.length) < 5)
        {
            sayOnce = false;
            if (( botDefaults.howLongStage / 60) < 1) //is it seconds
            {
                bot.speak('@' + queueName[0] + ' you have ' +  botDefaults.howLongStage + ' seconds to get on stage.');
            }
            else if (( botDefaults.howLongStage / 60) == 1) //is it one minute
            {
                let minute = Math.floor(( botDefaults.howLongStage / 60));
                bot.speak('@' + queueName[0] + ' you have ' + minute + ' minute to get on stage.');
            }
            else if (( botDefaults.howLongStage / 60) > 1) //is it more than one minute
            {
                let minutes = Math.floor(( botDefaults.howLongStage / 60));
                bot.speak('@' + queueName[0] + ' you have ' + minutes + ' minutes to get on stage.');
            }
            beginTimer = setTimeout(function ()
            {
                queueList.splice(0, 2);
                queueName.splice(0, 1);
                sayOnce = true;
            },  botDefaults.howLongStage * 1000); //timeout variably set
        }
    }
}

setInterval(queueCheck15, 5000) //repeats the check every five seconds. 



vipListCheck = function ()
{
    //this kicks all users off stage when the vip list is not empty
    if (userDefaults.vipList.length !== 0 && currentDjs.length != userDefaults.vipList.length)
    {
        for (let p = 0; p < currentDjs.length; p++)
        {
            let checkIfVip = userDefaults.vipList.indexOf(currentDjs[p]);
            if (checkIfVip == -1 && currentDjs[p] != authModule.USERID)
            {
                bot.remDj(currentDjs[p]);
            }
        }
    }
}

setInterval(vipListCheck, 5000) //repeats the check every five seconds. 



//this is for the event messages array
global.eventMessagesIterator = function ()
{
    if (EVENTMESSAGE == true && eventMessages.length !== 0)
    {
        if (messageCounter == eventMessages.length)
        {
            messageCounter = 0; //if end of event messages array reached, reset counter
        }

        if (eventMessageThroughPm == false) //if set to send messages through chatbox, do so
        {
            bot.speak(eventMessages[messageCounter] + "");
        }
        else //else send message through pm
        {
            for (let jio = 0; jio < userIds.length; jio++)
            {
                bot.pm(eventMessages[messageCounter] + "", userIds[jio]);
            }
        }

        ++messageCounter; //increment message counter
    }
}

setInterval(eventMessagesIterator, eventMessageRepeatTime * 60 * 1000) //repeats check



repeatMessage = function ()
{
    if (MESSAGE === true && typeof detail !== 'undefined')
    {
        if (repeatMessageThroughPm === false) //if not doing through the pm
        {
            if (defaultMessage === true) //if using default message
            {
                bot.speak('Welcome to ' + roomName + ', ' + detail); //set the message you wish the bot to repeat here i.e rules and such.
            }
            else
            {
                bot.speak('' + detail);
            }
        }
        else
        {
            if (defaultMessage === true)
            {
                for (let jkl = 0; jkl < userIds.length; jkl++)
                {
                    bot.pm('Welcome to ' + roomName + ', ' + detail, userIds[jkl]); //set the message you wish the bot to repeat here i.e rules and such.
                }
            }
            else
            {
                for (let lkj = 0; lkj < userIds.length; lkj++)
                {
                    bot.pm('' + detail, userIds[lkj]); //set the message you wish the bot to repeat here i.e rules and such.
                }
            }
        }
    }
};

setInterval(repeatMessage,  roomDefaults.howOftenToRepeatMessage * 60 * 1000) //repeats this message every 15 mins if /messageOn has been used.



//verifies the integrity of the users list every 15 minutes
global.verifyUsersList = function ()
{
    //only execute when not disconnected
    if (bot._isAuthenticated)
    {
        bot.roomInfo(false, function (data)
        {
            if (typeof data.users === 'object')
            {
                let theUsersListOkay = true; //assume it will not need to be rebuilt

                //if the length of the users list does not match
                //the amount of people in the room
                if (theUsersList.length != (data.users.length * 2))
                {
                    theUsersListOkay = false;
                }

                //only run this test if it passed the first one
                if (theUsersListOkay)
                {
                    //if any undefined values are found
                    for (let i = 0; i < theUsersList.length; i++)
                    {
                        if (typeof theUsersList[i] === 'undefined')
                        {
                            theUsersListOkay = false;
                            break;
                        }
                    }
                }

                //if data got corrupted then rebuild theUsersList array
                if (!theUsersListOkay)
                {
                    theUsersList = [];

                    for (let i = 0; i < data.users.length; i++)
                    {
                        if (typeof data.users[i] !== 'undefined')
                        {
                            //userid then the name
                            theUsersList.push(data.users[i].userid, data.users[i].name);
                        }
                    }
                }
            }
        });
    }
}

setInterval(verifyUsersList, 1000 * 60 * 15); //check every 15 minutes



//governs whether the bot gets on or off the stage automatically (autodjing)
global.autoDjing = function ()
{
    if (autoDjingTimer != null)
    {
        clearTimeout(autoDjingTimer);
        autoDjingTimer = null;
    }

    autoDjingTimer = setTimeout(function ()
    {
        let isBotAlreadyOnStage = currentDjs.indexOf(authModule.USERID);

        if (isBotAlreadyOnStage == -1) //if the bot is not already on stage
        {
            if (currentDjs.length >= 1 && currentDjs.length <=  botDefaults.whenToGetOnStage && queueList.length === 0)
            {
                if (botDefaults.getonstage === true && userDefaults.vipList.length === 0 && refreshList.length === 0)
                {
                    bot.addDj();
                }
            }
        }
        else //else it is on stage
        {
            if (currentDjs.length >=  botDefaults.whenToGetOffStage && botDefaults.getonstage === true && checkWhoIsDj != authModule.USERID)
            {
                bot.remDj();
            }
        }
    }, 1000 * 10); //delay for 10 seconds        
};



//adds a song to the end of the bots queue if it is not already contained in the bots queue
global.addSongIfNotAlreadyInPlaylist = function (bool)
{
    if (thisHoldsThePlaylist !== null && getSong !== null)
    {
        let found = false;
        for (let igh = 0; igh < thisHoldsThePlaylist.length; igh++)
        {
            if (thisHoldsThePlaylist[igh]._id == getSong)
            {
                found = true;
                break;
            }
        }
        if (!found)
        {
            bot.playlistAdd(getSong, -1); //add song to the end of the playlist                    
            let tempSongHolder = {
                _id: getSong
            };
            thisHoldsThePlaylist.push(tempSongHolder);

            if (bool) //whether the bot will show the heart animation or not
            {
                bot.snag();
            }
        }
    }
};



global.warnMeCall = function ()
{
    if (warnme.length != 0) //is there anyone in the warnme?
    {
        let whatIsPosition = currentDjs.indexOf(checkWhoIsDj); //what position are they

        if (whatIsPosition == currentDjs.length - 1) //if 5th dj is playing, check guy on the left
        {
            let areTheyNext = warnme.indexOf(currentDjs[0]);
            if (areTheyNext != -1) //is the next dj up in the warnme?
            {
                bot.pm('your song is up next!', currentDjs[0]);
                warnme.splice(areTheyNext, 1);

            }
        }
        else
        {
            let areTheyNext = warnme.indexOf(currentDjs[whatIsPosition + 1]);
            if (areTheyNext != -1) //is the next dj up in the warnme?
            {
                bot.pm('your song is up next!', currentDjs[whatIsPosition + 1]);
                warnme.splice(areTheyNext, 1);

            }
        }
    }
}



//checks to see if a command user is contained within the moderator list or not
global.checkIfUserIsMod = function (userid)
{
    let modIndex = modList.indexOf(userid);

    if (modIndex != -1)
    {
        condition = true;
    }
    else
    {
        condition = false;
    }
};



//makes sure the person who pmmed the bot a command is in the room
global.checkToseeIfPmmerIsInRoom = function (userid)
{
    let isInRoom = theUsersList.indexOf(userid);

    if (isInRoom != -1)
    {
        isInRoom = true;
    }
    else
    {
        isInRoom = false;
    }

    return isInRoom;
};



//increments a persons spam counter when they get kicked off stage for some reason
//after 10 seconds if it has not just been incremented then the counter is reset
global.incrementSpamCounter = function (userid)
{
    if (typeof people[userid] != 'undefined')
    {
        ++people[userid].spamCount;
    }

    if (timer[userid] !== null)
    {
        clearTimeout(timer[userid]);
        timer[userid] = null;
    }

    timer[userid] = setTimeout(function ()
    {
        people[userid] = {
            spamCount: 0
        };
    }, 10 * 1000);
};



//formats the banned artist array to be used in a regex expression
global.formatBannedArtists = function ()
{
    if (musicDefaults.bannedArtists.length !== 0)
    {
        let tempArray = [];
        let tempString = '(';

        //add a backslash in front of all special characters
        for (let i = 0; i < musicDefaults.bannedArtists.length; i++)
        {
            tempArray.push(musicDefaults.bannedArtists[i].replace(/([-[\]{}()*^=!:+?.,\\^$|#\s])/g, "\\$1"));
        }

        //join everything into one string
        for (let i = 0; i < musicDefaults.bannedArtists.length; i++)
        {
            if (i < musicDefaults.bannedArtists.length - 1)
            {
                tempString += tempArray[i] + '|';
            }
            else
            {
                tempString += tempArray[i] + ')';
            }
        }

        //create regular expression
        bannedArtistsMatcher = new RegExp('\\b' + tempString + '\\b', 'i');
    }
}



global.clearTimers = function ()
{
    //this is for the /inform command
    if (informTimer !== null)
    {
        clearTimeout(informTimer);
        informTimer = null;

        if (typeof theUsersList[theUsersList.indexOf(lastdj) + 1] !== 'undefined')
        {
            bot.speak("@" + theUsersList[theUsersList.indexOf(lastdj) + 1] + ", Thanks buddy ;-)");
        }
        else
        {
            bot.speak('Thanks buddy ;-)');
        }
    }


    //this is for the song length limit
    if (songLimitTimer !== null)
    {
        clearTimeout(songLimitTimer);
        songLimitTimer = null;

        if (typeof theUsersList[theUsersList.indexOf(lastdj) + 1] !== 'undefined')
        {
            bot.speak("@" + theUsersList[theUsersList.indexOf(lastdj) + 1] + ", Thanks buddy ;-)");
        }
        else
        {
            bot.speak('Thanks buddy ;-)');
        }
    }


    // If watch dog has been previously set, 
    // clear since we've made it to the next song
    if (curSongWatchdog !== null)
    {
        clearTimeout(curSongWatchdog);
        curSongWatchdog = null;
    }


    // If takedown Timer has been set, 
    // clear since we've made it to the next song
    if (takedownTimer !== null)
    {
        clearTimeout(takedownTimer);
        takedownTimer = null;

        if (typeof theUsersList[theUsersList.indexOf(lastdj) + 1] !== 'undefined')
        {
            bot.speak("@" + theUsersList[theUsersList.indexOf(lastdj) + 1] + ", Thanks buddy ;-)");
        }
        else
        {
            bot.speak('Thanks buddy ;-)');
        }
    }
};



//stuck song detection, song length limit, /inform command
global.checkOnNewSong = function (data)
{
    let length = data.room.metadata.current_song.metadata.length;
    let masterIndex; //used to tell whether current dj is on the master id's list or not


    //clears timers if previously set
    clearTimers();


    // Set this after processing things from last timer calls
    lastdj = data.room.metadata.current_dj;
    masterIndex = userDefaults.masterIds.indexOf(lastdj); //master id's check


    // Set a new watchdog timer for the current song.
    curSongWatchdog = setTimeout(function ()
    {
        curSongWatchdog = null;

        if (typeof theUsersList[theUsersList.indexOf(lastdj) + 1] !== 'undefined')
        {
            bot.speak("@" + theUsersList[theUsersList.indexOf(lastdj) + 1] + ", you have 20 seconds to skip your stuck song before you are removed");
        }
        else
        {
            bot.speak("current dj, you have 20 seconds to skip your stuck song before you are removed");
        }

        //START THE 20 SEC TIMER
        takedownTimer = setTimeout(function ()
        {
            takedownTimer = null;
            bot.remDj(lastdj); // Remove Saved DJ from last newsong call
        }, 20 * 1000); // Current DJ has 20 seconds to skip before they are removed
    }, (length + 10) * 1000); //Timer expires 10 seconds after the end of the song, if not cleared by a newsong


    //this boots the user if their song is over the length limit
    if ((length / 60) >=  roomDefaults.songLengthLimit )
    {
        if (lastdj == authModule.USERID || masterIndex == -1) //if dj is the bot or not a master
        {
            if (LIMIT === true)
            {
                if (typeof theUsersList[theUsersList.indexOf(lastdj) + 1] !== 'undefined')
                {
                    bot.speak("@" + theUsersList[theUsersList.indexOf(lastdj) + 1] + ", your song is over " + roomDefaults.songLengthLimit + " mins long, you have 20 seconds to skip before being removed.");
                }
                else
                {
                    bot.speak('current dj, your song is over ' + roomDefaults.songLengthLimit + ' mins long, you have 20 seconds to skip before being removed.');
                }

                //START THE 20 SEC TIMER
                songLimitTimer = setTimeout(function ()
                {
                    songLimitTimer = null;
                    bot.remDj(lastdj); // Remove Saved DJ from last newsong call
                }, 20 * 1000); // Current DJ has 20 seconds to skip before they are removed
            }
        }
    }
}



bot.on('ready', function (data)
{
    //format the musicDefaults.bannedArtists list at runtime
    formatBannedArtists();
});



//checks at the beggining of the song
bot.on('newsong', function (data)
{
    //resets counters and array for vote skipping
    checkVotes = [];
    voteCountSkip = 0;
    votesLeft = roomDefaults.HowManyVotesToSkip;
    whoSnagged = 0;
    upVotes = 0;
    downVotes = 0;
    ALLREADYCALLED = false; //resets votesnagging so that it can be called again


    //procedure for getting song tags
    song = data.room.metadata.current_song.metadata.song;
    album = data.room.metadata.current_song.metadata.album;
    genre = data.room.metadata.current_song.metadata.genre;
    artist = data.room.metadata.current_song.metadata.artist;
    getSong = data.room.metadata.current_song._id;


    //set information
    current = data.room.metadata.djcount; //the number of dj's on stage
    detail = data.room.description; //set room description again in case it was changed
    checkWhoIsDj = data.room.metadata.current_dj; //used to check who the currently playing dj is.    
    dj = data.room.metadata.current_song.djname; //used to get current dj's name.


    //adds a song to the end of your bots queue
    if (snagSong === true)
    {
        addSongIfNotAlreadyInPlaylist(false);
    }


    //if true causes the bot to start bopping to the currently playing song
    if (autoBop === true)
    {
        bot.bop();
    }


    //check to see if conditions are met for bot's autodjing feature
    autoDjing();


    //if the bot is the only one on stage and they are skipping their songs
    //they will stop skipping
    if (current == 1 && checkWhoIsDj == authModule.USERID && skipOn === true)
    {
        skipOn = false;
    }


    //used to have the bot skip its song if its the current player and skipOn command was used
    if (authModule.USERID == checkWhoIsDj && skipOn === true)
    {
        bot.skip();
    }


    //this is for /warnme
    warnMeCall();


    //removes current dj from stage if they play a banned song or artist.
    if (musicDefaults.bannedArtists.length !== 0 && typeof artist !== 'undefined' && typeof song !== 'undefined')
    {
        let checkIfAdmin = userDefaults.masterIds.indexOf(checkWhoIsDj); //is user an exempt admin?
        let nameDj = theUsersList.indexOf(checkWhoIsDj) + 1; //the currently playing dj's name

        if (checkIfAdmin == -1)
        {
            //if matching is enabled for both songs and artists
            if (musicDefaults.matchArtists && musicDefaults.matchSongs)
            {
                if (artist.match(bannedArtistsMatcher) || song.match(bannedArtistsMatcher))
                {
                    bot.remDj(checkWhoIsDj);

                    if (typeof theUsersList[nameDj] !== 'undefined')
                    {
                        bot.speak('@' + theUsersList[nameDj] + ' you have played a banned track or artist.');
                    }
                    else
                    {
                        bot.speak('current dj, you have played a banned track or artist.');
                    }
                }
            }
            else if (musicDefaults.matchArtists) //if just artist matching is enabled
            {
                if (artist.match(bannedArtistsMatcher))
                {
                    bot.remDj(checkWhoIsDj);

                    if (typeof theUsersList[nameDj] !== 'undefined')
                    {
                        bot.speak('@' + theUsersList[nameDj] + ' you have played a banned artist.');
                    }
                    else
                    {
                        bot.speak('current dj, you have played a banned artist.');
                    }
                }
            }
            else if (musicDefaults.matchSongs) //if just song matching is enabled
            {
                if (song.match(bannedArtistsMatcher))
                {
                    bot.remDj(checkWhoIsDj);

                    if (typeof theUsersList[nameDj] !== 'undefined')
                    {
                        bot.speak('@' + theUsersList[nameDj] + ' you have played a banned track.');
                    }
                    else
                    {
                        bot.speak('current dj, you have played a banned track.');
                    }
                }
            }
        }
    }


    //look at function above, /inform, song length limit,stuck song detection
    checkOnNewSong(data);


    //quality control check, if current dj's information is somehow wrong because
    //of some event not firing, remake currentDj's array
    if (data.room.metadata.djcount !== currentDjs.length)
    {
        currentDjs = []; //reset current djs array

        for (let hjg = 0; hjg < data.room.metadata.djcount; hjg++)
        {
            if (typeof data.room.metadata.djs[hjg] !== 'undefined')
            {
                currentDjs.push(data.room.metadata.djs[hjg]);
            }
        }
    }
});



//bot gets on stage and starts djing if no song is playing.
bot.on('nosong', function (data)
{
    if (botDefaults.getonstage === true && userDefaults.vipList.length === 0 && queueList.length === 0 && refreshList.length === 0)
    {
        bot.addDj();
    }

    skipOn = false;
    clearTimers();
})



//checks when the bot speaks
bot.on('speak', function (data)
{
    let text = data.text; //the most recent text in the chatbox on turntable    
    name = data.name; //name of latest person to say something
    checkActivity = Date.now(); //update when someone says something   

    checkIfUserIsMod(data.userid); //check to see if speaker is a moderator or not

    updateAfkPostionOfUser(data.userid); //update the afk position of the speaker    

    if (text.match(/^\/autodj$/) && condition === true)
    {
        bot.addDj();
    }
    else if (text.match(/^\/playlist/))
    {
        if (thisHoldsThePlaylist !== null)
        {
            bot.speak('There are currently ' + thisHoldsThePlaylist.length + ' songs in my playlist.');
        }
    }
    else if (text.match(/^\/randomSong$/) && condition === true)
    {
        if (randomOnce != 1)
        {
            let ez = 0;
            bot.speak("Reorder initiated.");
            ++randomOnce;
            let reorder = setInterval(function ()
            {
                if (ez <= thisHoldsThePlaylist.length)
                {
                    let nextId = Math.ceil(Math.random() * thisHoldsThePlaylist);
                    bot.playlistReorder(ez, nextId);
                    console.log("Song " + ez + " changed.");
                    ez++;
                }
                else
                {
                    clearInterval(reorder);
                    console.log("Reorder Ended");
                    bot.speak("Reorder completed.");
                    --randomOnce;
                }
            }, 1000);
        }
        else
        {
            bot.pm('error, playlist reordering is already in progress', data.userid);
        }
    }
    else if (text.match('turntable.fm/') && !text.match('turntable.fm/' + ttRoomName) && !condition && data.userid != authModule.USERID)
    {
        bot.boot(data.userid, 'do not advertise other rooms here');
    }
    else if (text.match('/bumptop') && condition === true)
    {
        if (roomDefaults.queue === true)
        {
            let topOfQueue = data.text.slice(10);
            let index35 = queueList.indexOf(topOfQueue);
            let index46 = queueName.indexOf(topOfQueue);
            let index80 = theUsersList.indexOf(topOfQueue);
            let index81 = theUsersList[index80];
            let index82 = theUsersList[index80 - 1];
            if (index35 != -1 && index80 != -1)
            {
                clearTimeout(beginTimer);
                sayOnce = true;
                queueList.splice(index35, 2);
                queueList.unshift(index81, index82);
                queueName.splice(index46, 1);
                queueName.unshift(index81);
                let temp92 = 'The queue is now: ';
                for (let po = 0; po < queueName.length; po++)
                {
                    if (po != (queueName.length - 1))
                    {
                        temp92 += queueName[po] + ', ';
                    }
                    else if (po == (queueName.length - 1))
                    {
                        temp92 += queueName[po];
                    }
                }
                bot.speak(temp92);
            }
        }
    }
    else if (text.match(/^\/stalk/) && condition === true)
    {
        let stalker = text.substring(8);
        bot.getUserId(stalker, function (data6)
        {
            bot.stalk(data6.userid, allInformations = true, function (data4)
            {
                if (data4.success !== false)
                {
                    bot.speak('User found in room: http://turntable.fm/' + data4.room.shortcut);
                }
                else
                {
                    bot.speak('User not found, they may be offline or in the lobby, they may also have just joined a room, or they may not exist');
                }
            });
        });
    }
    else if (text.match(/^\/djafk/))
    {
        if (AFK === true) //afk limit turned on?
        {
            if (currentDjs.length !== 0) //any dj's on stage?
            {
                let afkDjs = 'dj afk time: ';

                for (let ijhp = 0; ijhp < currentDjs.length; ijhp++)
                {
                    let lastUpdate = Math.floor((Date.now() - lastSeen[currentDjs[ijhp]]) / 1000 / 60); //their afk time in minutes
                    let whatIsTheName = theUsersList.indexOf(currentDjs[ijhp]); //their name

                    if (currentDjs[ijhp] != currentDjs[currentDjs.length - 1])
                    {
                        afkDjs += theUsersList[whatIsTheName + 1] + ': ' + lastUpdate + ' mins, ';
                    }
                    else
                    {
                        afkDjs += theUsersList[whatIsTheName + 1] + ': ' + lastUpdate + ' mins';
                    }
                }
                bot.speak(afkDjs);
            }
            else
            {
                bot.pm('error, there are currently no dj\'s on stage.', data.userid);
            }
        }
        else
        {
            bot.pm('error, the dj afk timer has to be active for me to report afk time.', data.userid);
        }
    }
    else if (text.match(/^\/position/))
    {
        let checkPosition = queueName.indexOf(data.name);

        if (checkPosition != -1 && roomDefaults.queue === true) //if person is in the queue and queue is active
        {
            bot.speak('@' + name + ' you are currently in position number ' + (checkPosition + 1) + ' in the queue');
        }
        else if (checkPosition == -1 && roomDefaults.queue === true)
        {
            bot.speak('@' + name + ' i can\'t tell you your position unless you are currently in the queue');
        }
        else
        {
            bot.speak('@' + name + ' there is currently no queue');
        }
    }
    else if (text.match(/^\/lengthLimit/) && condition === true)
    {
        if (LIMIT === true)
        {
            LIMIT = false;
            bot.speak('the song length limit is now inactive');
        }
        else
        {
            LIMIT = true;
            bot.speak('the song length limit is now active');
        }
    }
    else if (text.match(/^\/botstatus/) && condition === true)
    {
        let whatsOn = '';

        if (roomDefaults.queue === true)
        {
            whatsOn += 'queue: On, ';
        }
        else
        {
            whatsOn += 'queue: Off, ';
        }
        if (AFK === true)
        {
            whatsOn += 'dj afk limit: On, ';
        }
        else
        {
            whatsOn += 'dj afk limit: Off, ';
        }
        if (botDefaults.getonstage === true)
        {
            whatsOn += 'autodjing: On, ';
        }
        else
        {
            whatsOn += 'autodjing: Off, ';
        }
        if (EVENTMESSAGE === true)
        {
            whatsOn += 'event message: On, ';
        }
        else
        {
            whatsOn += 'event message: Off, ';
        }
        if (MESSAGE === true)
        {
            whatsOn += 'room message: On, ';
        }
        else
        {
            whatsOn += 'room message: Off, ';
        }
        if (GREET === true)
        {
            whatsOn += 'greeting message: On, ';
        }
        else
        {
            whatsOn += 'greeting message: Off, ';
        }
        if (voteSkip === true)
        {
            whatsOn += 'voteskipping: On, ';
        }
        else
        {
            whatsOn += 'voteskipping: Off, ';
        }
        if (roomAFK === true)
        {
            whatsOn += 'audience afk limit: On, ';
        }
        else
        {
            whatsOn += 'audience afk limit: Off, ';
        }
        if (SONGSTATS === true)
        {
            whatsOn += 'song stats: On, ';
        }
        else
        {
            whatsOn += 'song stats: Off, ';
        }
        if (kickTTSTAT === true)
        {
            whatsOn += 'auto ttstat kick: On, ';
        }
        else
        {
            whatsOn += 'auto ttstat kick: Off, ';
        }
        if (LIMIT === true)
        {
            whatsOn += 'song length limit: On, ';
        }
        else
        {
            whatsOn += 'song length limit: Off, ';
        }
        if (PLAYLIMIT === true)
        {
            whatsOn += 'song play limit: On, ';
        }
        else
        {
            whatsOn += 'song play limit: Off, ';
        }
        if (roomDefaults.isRefreshing === true)
        {
            whatsOn += 'refreshing: On, ';
        }
        else
        {
            whatsOn += 'refreshing: Off, ';
        }
        if (skipOn === true)
        {
            whatsOn += 'autoskipping: On, ';
        }
        else
        {
            whatsOn += 'autoskipping: Off, ';
        }
        if (snagSong === true)
        {
            whatsOn += 'every song adding: On, ';
        }
        else
        {
            whatsOn += 'every song adding: Off, ';
        }
        if (autoSnag === true)
        {
            whatsOn += 'vote based song adding: On, ';
        }
        else
        {
            whatsOn += 'vote based song adding: Off, ';
        }
        if (randomOnce === 0)
        {
            whatsOn += 'playlist reordering in progress?: No';
        }
        else
        {
            whatsOn += 'playlist reordering in progress?: Yes';
        }

        bot.speak(whatsOn);
    }
    else if (text.match(/^\/voteskipon/) && condition === true)
    {
        checkVotes = [];
        roomDefaults.HowManyVotesToSkip = Number(data.text.slice(12))
        if (isNaN(roomDefaults.HowManyVotesToSkip) || roomDefaults.HowManyVotesToSkip === 0)
        {
            bot.speak("error, please enter a valid number");
        }

        if (!isNaN(roomDefaults.HowManyVotesToSkip) && roomDefaults.HowManyVotesToSkip !== 0)
        {
            bot.speak("vote skipping is now active, current votes needed to pass " + "the vote is " + roomDefaults.HowManyVotesToSkip);
            voteSkip = true;
            voteCountSkip = 0;
            votesLeft = roomDefaults.HowManyVotesToSkip;
        }
    }
    else if (text.match(/^\/noTheme/) && condition === true)
    {
        THEME = false;
        bot.speak('The theme is now inactive');
    }
    else if (text.match(/^\/setTheme/) && condition === true)
    {
        whatIsTheme = data.text.slice(10);
        THEME = true;
        bot.speak('The theme is now set to: ' + whatIsTheme);
    }
    else if (text.match(/^\/theme/))
    {
        if (THEME === false)
        {
            bot.speak('There is currently no theme, standard rules apply');
        }
        else
        {
            bot.speak('The theme is currently set to: ' + whatIsTheme);
        }
    }
    else if (text.match(/^\/voteskipoff$/) && condition === true)
    {
        bot.speak("vote skipping is now inactive");
        voteSkip = false;
        voteCountSkip = 0;
        votesLeft = roomDefaults.HowManyVotesToSkip;
    }
    else if (text.match(/^\/skip$/) && voteSkip === true) //if command matches and voteskipping is enabled
    {
        let isMaster = userDefaults.masterIds.includes(data.userid);
        let checkIfOnList = checkVotes.indexOf(data.userid); //check if the person using the command has already voted
        let checkIfMaster = userDefaults.masterIds.indexOf(lastdj); //is the currently playing dj on the master id's list?

        if ((checkIfOnList == -1 || isMaster) && data.userid != authModule.USERID) //if command user has not voted and command user is not the bot
        {
            voteCountSkip += 1; //add one to the total count of votes for the current song to be skipped
            votesLeft -= 1; //decrement votes left by one (the votes remaining till the song will be skipped)
            checkVotes.unshift(data.userid); //add them to an array to make sure that they can't vote again this song

            let findLastDj = theUsersList.indexOf(lastdj); //the index of the currently playing dj's userid in the theUser's list
            if (votesLeft !== 0 && checkIfMaster == -1) //if votesLeft has not reached zero and the current dj is not on the master id's list
            {
                //the bot will say the following
                bot.speak("Current Votes for a song skip: " + voteCountSkip +
                    " Votes needed to skip the song: " + roomDefaults.HowManyVotesToSkip);
            }
            if (votesLeft === 0 && checkIfMaster == -1 && !isNaN(roomDefaults.HowManyVotesToSkip)) //if there are no votes left and the current dj is not on the master list and the
            { //the amount of votes set was a valid number
                bot.speak("@" + theUsersList[findLastDj + 1] + " you have been voted off stage");
                bot.remDj(lastdj); //remove the current dj and display the above message
            }
        }
        else //else the command user has already voted
        {
            bot.pm('sorry but you have already voted, only one vote per person per song is allowed', data.userid);
        }
    }
    else if (text.match(/^\/afkon/) && condition === true)
    {
        AFK = true;
        bot.speak('the afk list is now active.');
        for (let z = 0; z < currentDjs.length; z++)
        {
            justSaw(currentDjs[z], 'justSaw');
            justSaw(currentDjs[z], 'justSaw1');
            justSaw(currentDjs[z], 'justSaw2');
        }
    }
    else if (text.match(/^\/afkoff/) && condition === true)
    {
        AFK = false;
        bot.speak('the afk list is now inactive.');
    }
    else if (text.match(/^\/roomafkon/) && condition === true)
    {
        roomAFK = true;
        bot.speak('the audience afk list is now active.');
        for (let zh = 0; zh < userIds.length; zh++)
        {
            let isDj2 = currentDjs.indexOf(userIds[zh])
            if (isDj2 == -1)
            {
                justSaw(userIds[zh], 'justSaw3');
                justSaw(userIds[zh], 'justSaw4');
            }
        }
    }
    else if (text.match(/^\/roomafkoff/) && condition === true)
    {
        roomAFK = false;
        bot.speak('the audience afk list is now inactive.');
    }
    else if (text.match(/^\/djplays/))
    {
        if (currentDjs.length !== 0)
        {
            let djsnames = [];
            let djplays = 'dj plays: ';
            for (let i = 0; i < currentDjs.length; i++)
            {
                let djname = theUsersList.indexOf(currentDjs[i]) + 1;
                djsnames.push(theUsersList[djname]);

                if (typeof djs20[currentDjs[i]] == 'undefined' && typeof currentDjs[i] != 'undefined') //if doesn't exist at this point, create it
                {
                    djs20[currentDjs[i]] = {
                        nbSong: 0
                    };
                }

                if (currentDjs[i] != currentDjs[(currentDjs.length - 1)])
                {
                    if (typeof djs20[currentDjs[i]] != 'undefined' && typeof currentDjs[i] != 'undefined') //if doesn't exist at this point, create it
                    {
                        djplays = djplays + djsnames[i] + ': ' + djs20[currentDjs[i]].nbSong + ', ';
                    }
                }
                else
                {
                    if (typeof djs20[currentDjs[i]] != 'undefined' && typeof currentDjs[i] != 'undefined') //if doesn't exist at this point, create it
                    {
                        djplays = djplays + djsnames[i] + ': ' + djs20[currentDjs[i]].nbSong;
                    }
                }
            }
            bot.speak(djplays);
        }
        else if (currentDjs.length === 0)
        {
            bot.speak('There are no dj\'s on stage.');
        }
    }
    else if (text.match(/^\/skipsong/) && condition === true)
    {
        if (checkWhoIsDj == authModule.USERID)
        {
            bot.skip();
        }
        else
        {
            bot.pm('error, that command only skips the bots currently playing song', data.userid);
        }
    }
    else if (text.match(/^\/mytime/))
    {
        let msecPerMinute1 = 1000 * 60;
        let msecPerHour1 = msecPerMinute1 * 60;
        let msecPerDay1 = msecPerHour1 * 24;
        let endTime1 = Date.now();
        let currentTime1 = endTime1 - myTime[data.userid];

        let days1 = Math.floor(currentTime1 / msecPerDay1);
        currentTime1 = currentTime1 - (days1 * msecPerDay1);

        let hours1 = Math.floor(currentTime1 / msecPerHour1);
        currentTime1 = currentTime1 - (hours1 * msecPerHour1);

        let minutes1 = Math.floor(currentTime1 / msecPerMinute1);

        bot.getProfile(data.userid, function (data6)
        {
            bot.speak('@' + data6.name + ' you have been in the room for: ' + days1 + ' days, ' + hours1 + ' hours, ' + minutes1 + ' minutes');
        });
    }
    else if (text.match(/^\/uptime/))
    {
        let msecPerMinute = 1000 * 60;
        let msecPerHour = msecPerMinute * 60;
        let msecPerDay = msecPerHour * 24;
        endTime = Date.now();
        let currentTime = endTime - beginTime;

        let days = Math.floor(currentTime / msecPerDay);
        currentTime = currentTime - (days * msecPerDay);

        let hours = Math.floor(currentTime / msecPerHour);
        currentTime = currentTime - (hours * msecPerHour);

        let minutes = Math.floor(currentTime / msecPerMinute);

        bot.speak('bot uptime: ' + days + ' days, ' + hours + ' hours, ' + minutes + ' minutes');
    }
    else if (text.match(/^\/songstats/) && condition === true)
    {
        if (SONGSTATS === true)
        {
            SONGSTATS = false;
            bot.speak('song stats is now inactive');
        }
        else if (SONGSTATS === false)
        {
            SONGSTATS = true;
            bot.speak('song stats is now active');
        }
    }
    else if (text.match(/^\/props/))
    {
        bot.speak('@' + name + ' gives ' + '@' + dj + ' an epic high :hand:');
    }
    else if (text.match(/^\/whosrefreshing/))
    {
        if (refreshList.length != 0)
        {
            let whosRefreshing = 'refreshing: ';
            let namesOfRefresher;

            for (let i = 0; i < refreshList.length; i++)
            {
                namesOfRefresher = theUsersList.indexOf(data.userid) + 1;

                if (i < refreshList.length - 1)
                {
                    whosRefreshing += theUsersList[namesOfRefresher] + ', ';
                }
                else
                {
                    whosRefreshing += theUsersList[namesOfRefresher];
                }
            }

            bot.speak(whosRefreshing);
        }
        else
        {
            bot.speak('no one is currently refreshing');
        }
    }
    else if (text.match(/^\/refreshoff/) && condition === true)
    {
        bot.speak('refreshing has been disabled');
        roomDefaults.isRefreshing = false;
    }
    else if (text.match(/^\/refreshon/) && condition === true)
    {
        bot.speak('refreshing has been enabled');
        roomDefaults.isRefreshing = true;
    }
    else if (text.match(/^\/refresh/))
    {
        if (typeof (data.userid) == 'undefined')
        {
            bot.speak('failed to add to refresh list, please try the command again');
        }
        else
        {
            let isRefresherOnStage = currentDjs.indexOf(data.userid); //are they a dj
            let hasRefreshAlreadyBeenUsed = refreshList.indexOf(data.userid); //are they already being refreshed?
            let whatIsRefresherName = theUsersList.indexOf(data.userid) + 1;
            let numberRepresent = (roomDefaults.amountOfTimeToRefresh / 60);

            if (hasRefreshAlreadyBeenUsed != -1) //if they are already being refreshed
            {
                clearTimeout(refreshTimer[data.userid]); //clear their timeout
                delete refreshTimer[data.userid];
                refreshList.splice(hasRefreshAlreadyBeenUsed, 1); //remove them from the refresh list       

                bot.speak('@' + theUsersList[whatIsRefresherName] + ' you have been removed from the refresh list');
            }
            else
            {
                if (roomDefaults.isRefreshing) //if /refresh is enabled
                {
                    if (isRefresherOnStage != -1) //is the person on stage
                    {
                        refreshList.push(data.userid);
                        refreshTimer[data.userid] = setTimeout(function ()
                        {
                            hasRefreshAlreadyBeenUsed = refreshList.indexOf(data.userid); //recalculate their position

                            if (hasRefreshAlreadyBeenUsed != -1)
                            {
                                refreshList.splice(hasRefreshAlreadyBeenUsed, 1); //remove them from the refresh list
                                clearTimeout(refreshTimer[data.userid]); //clear their timeout
                                delete playLimitOfRefresher[data.userid] //delete the copy of their play limit
                                delete refreshTimer[data.userid];
                            }
                        }, 1000 * roomDefaults.amountOfTimeToRefresh);

                        if (typeof djs20[data.userid] == 'object')
                        {
                            playLimitOfRefresher[data.userid] = djs20[data.userid].nbSong; //save a copy of their play limit
                        }

                        if (numberRepresent < 1)
                        {
                            bot.speak('@' + theUsersList[whatIsRefresherName] + ' i\'ll hold your spot on stage for the next ' + roomDefaults.amountOfTimeToRefresh + ' seconds');
                        }
                        else if (numberRepresent == 1)
                        {
                            bot.speak('@' + theUsersList[whatIsRefresherName] + ' i\'ll hold your spot on stage for the next ' + numberRepresent + ' minute');
                        }
                        else
                        {
                            bot.speak('@' + theUsersList[whatIsRefresherName] + ' i\'ll hold your spot on stage for the next ' + numberRepresent + ' minutes');
                        }
                    }
                    else
                    {
                        bot.pm('you have to be on stage to add yourself to the refresh list', data.userid);
                    }
                }
                else
                {
                    bot.pm('refreshing is currently disabled', data.userid);
                }
            }
        }
    }
    else if (text.match(/^\/greeton/) && condition === true)
    {
        bot.speak('room greeting: On');
        GREET = true;
    }
    else if (text.match(/^\/greetoff/) && condition === true)
    {
        bot.speak('room greeting: Off');
        GREET = false;
    }
    else if (text.match(/^\/eventmessageOn/) && condition === true)
    {
        bot.speak('event message: On');
        EVENTMESSAGE = true;
    }
    else if (text.match(/^\/eventmessageOff/) && condition === true)
    {
        bot.speak('event message: Off');
        EVENTMESSAGE = false;
    }
    else if (text.match(/^\/messageOn/) && condition === true)
    {
        bot.speak('message: On');
        MESSAGE = true;
    }
    else if (text.match(/^\/messageOff/) && condition === true)
    {
        bot.speak('message: Off');
        MESSAGE = false;
    }
    else if (text.match(/^\/pmcommands/))
    {
        bot.pm('that command only works in the pm', data.userid);
    }
    else if (text.match(/^\/commands/))
    {
        bot.speak('the commands are  /awesome, ' +
            ' /mom, /cheers, /fanratio @, /whosrefreshing, /refresh, /whatsplaylimit, /warnme, /theme, /up?, /djafk, /mytime, /playlist, /afk, /whosafk, /coinflip, /hello, /escortme, /stopescortme, /fanme, /unfanme, /roominfo, /beer, /dice, /props, /m, /getTags, ' +
            '/skip, /dive, /dance, /surf, /uptime, /djplays, /admincommands, /queuecommands, /pmcommands');
    }
    else if (text.match(/^\/queuecommands/))
    {
        bot.speak('the commands are /queue, /position, /queuewithnumbers, /removefromqueue @, /removeme, /move, /addme, /queueOn, /queueOff, /bumptop @');
    }
    else if (text.match(/^\/admincommands/) && condition === true)
    {
        bot.speak('the mod commands are /ban @, /unban @, /whosinmodpm, /whosrefreshing, /refreshon, /refreshoff, /move, /eventmessageOn, /eventmessageOff, /boot, /playminus @, /skipon, /snagevery, /autosnag, /botstatus, /skipoff, /noTheme, /lengthLimit, /stalk @, /setTheme, /stage @, /randomSong, /messageOn, /messageOff, /afkon, /afkoff, /skipsong, /autodj, /removedj, /lame, ' +
            '/snag, /removesong, /playLimitOn, /playLimitOff, /voteskipon #, /voteskipoff, /greeton, /greetoff, /getonstage, /banstage @, /unbanstage @, /userid @, /inform, /whobanned, ' +
            '/whostagebanned, /roomafkon, /roomafkoff, /songstats, /username, /modpm');
        condition = false;
    }
    else if (text.match(/^\/tableflip/))
    {
        bot.speak('/tablefix');
    }
    else if (text.match('/awesome'))
    {
        bot.vote('up');
    }
    else if (text.match('/lame') && condition === true)
    {
        bot.vote('down');
    }
    else if (text.match(/^\/removedj$/) && condition === true)
    {
        bot.remDj();
    }
    else if (text.match(/^\/inform$/) && condition === true)
    {
        if (checkWhoIsDj !== null)
        {
            if (informTimer === null)
            {
                let checkDjsName = theUsersList.indexOf(lastdj) + 1;
                bot.speak('@' + theUsersList[checkDjsName] + ' your song is not the appropriate genre for this room, please skip or you will be removed in 20 seconds');
                informTimer = setTimeout(function ()
                {
                    bot.pm('you took too long to skip your song', lastdj);
                    bot.remDj(lastdj);
                    informTimer = null;
                }, 20 * 1000);
            }
            else
            {
                bot.pm('the /inform timer has already been activated, it may be used only once per song', data.userid);
            }
        }
        else
        {
            bot.pm('you must wait one song since the bot has started to use that command', data.userid);
        }
    }
    else if (text.match('/cheers'))
    {
        bot.speak('@' + name + ' raises their glass for a toast');
    }
    else if (text.match(/^\/mom$/))
    {
        let x = Math.round(Math.random() * 3);
        switch (x)
        {
        case 0:
            bot.speak('@' + name + ' ur mom is fat');
            break;
        case 1:
            bot.speak('@' + name + ' yo momma sooo fat....');
            break;
        case 2:
            bot.speak('@' + name + ' damn yo momma fat');
            break;
        case 3:
            bot.speak('@' + name + ' your mother is an outstanding member of the community ' +
                'and well liked by all.');
            break;
        }
    }
    else if (text.match('/coinflip'))
    {
        let y = Math.ceil(Math.random() * 2);
        switch (y)
        {
        case 1:
            bot.speak('@' + name + ' i am flipping a coin... you got... heads');
            break;
        case 2:
            bot.speak('@' + name + ' i am flipping a coin... you got... tails');
            break;
        }
    }
    else if (text.match(/^\/dance$/))
    {
        bot.speak('https://media.tenor.com/images/939895eeadd796565d3ef07b7a7169f3/tenor.gif');
    }
    else if (text.match(/^\/frankie$/))
    {
        bot.speak('Relax!');
    }
    else if (text.match(/^\/hair$/))
    {
        bot.speak('Jersey Hair: Engage');
    }
    else if (text.match(/^\/eddie$/))
    {
        bot.speak('PARTY ALL THE TIME!');
    }
    else if (text.match(/^\/lonely$/))
    {
        bot.speak('Dancing with myself...');
    }
    else if (text.match(/^\/jump$/))
    {
        bot.speak('For my love!');
    }
    else if (text.match(/^\/flirt$/))
    {
        bot.speak('How YOU doin’?!');
    }
    else if (text.match(/^\/rub$/))
    {
        bot.speak('It rubs the lotion on its skin or else it gets the hose again');
    }
    else if (text.match(/^\/wc$/))
    {
        bot.speak('Everybody Wang Chung tonight.  Everybody have fun tonight.');
    }
    else if (text.match(/^\/alice$/))
    {
        bot.speak('We’re not worthy! We’re not worthy');
    }
    else if (text.match(/^\/feart$/))
    {
        bot.speak('It STINKS in here!');
    }
    else if (text.match(/^\/suggestions$/))
    {
        bot.speak(':robot: command suggestions: https://bit.ly/80scd');
    }
    else if (text.match(/^\/rules$/))
    {
        bot.speak(':memo: official room rules: https://bit.ly/ilt80s');
    }
    else if (text.match(/^\/skipon$/) && condition === true)
    {
        bot.speak('i am now skipping my songs');
        skipOn = true;
    }
    else if (text.match(/^\/skipoff$/) && condition === true)
    {
        bot.speak('i am no longer skipping my songs');
        skipOn = false;
    }
    else if (text.match(/^\/fanratio/)) //this one courtesy of JenTheInstigator of turntable.fm
    {
        let tmpuser = data.text.substring(11);
        bot.getUserId(tmpuser, function (data1)
        {
            let tmpid = data1.userid;
            bot.getProfile(tmpid, function (data2)
            {
                if (typeof (data1.userid) !== 'undefined')
                {
                    let tmp = tmpuser + " has " + data2.points + " points and " + data2.fans + " fans, for a ratio of " + Math.round(data2.points / data2.fans) + ".";
                    bot.speak(tmp);
                }
                else
                {
                    bot.speak('I\m sorry I don\'t know that one');
                }
            });
        });
    }
    else if (text.match(/^\/getonstage$/) && condition === true)
    {
        if (botDefaults.getonstage === false)
        {
            bot.speak('I am now auto djing');
            botDefaults.getonstage = true;
        }
        else if (botDefaults.getonstage === true)
        {
            bot.speak('I am no longer auto djing');
            botDefaults.getonstage = false;
        }
    }
    else if (text.match('/beer'))
    {
        let botname = theUsersList.indexOf(authModule.USERID) + 1;
        bot.speak('@' + theUsersList[botname] + ' hands ' + '@' + name + ' a nice cold :beer:');
    }
    else if (data.text == '/escortme')
    {
        let djListIndex = currentDjs.indexOf(data.userid);
        let escortmeIndex = escortList.indexOf(data.userid);
        if (djListIndex != -1 && escortmeIndex == -1)
        {
            escortList.push(data.userid);
            bot.speak('@' + name + ' you will be escorted after you play your song');
        }
    }
    else if (data.text == '/stopescortme')
    {
        bot.speak('@' + name + ' you will no longer be escorted after you play your song');
        let escortIndex = escortList.indexOf(data.userid);
        if (escortIndex != -1)
        {
            escortList.splice(escortIndex, 1);
        }
    }
    else if (data.text == '/roominfo')
    {
        if (typeof detail !== 'undefined')
        {
            bot.speak(detail);
        }
    }
    else if (data.text == '/fanme')
    {
        bot.speak('@' + name + ' i am now your fan!');
        myId = data.userid;
        bot.becomeFan(myId);
    }
    else if (data.text == '/getTags')
    {
        bot.speak('artist name: ' + artist + ', song name: ' + song + ', album: ' + album + ', genre: ' + genre);
    }
    else if (data.text == '/dice')
    {
        let random = Math.floor(Math.random() * 12 + 1);
        bot.speak('@' + name + ' i am rolling the dice... your number is... ' + random);
    }
    else if (text.match(/^\/dive/))
    {
        let checkDj = currentDjs.indexOf(data.userid);
        if (checkDj != -1)
        {
            bot.remDj(data.userid);
        }
        else
        {
            bot.pm('you must be on stage to use that command.', data.userid);
        }
    }
    else if (text.match('/surf'))
    {
        bot.speak('http://25.media.tumblr.com/tumblr_mce8z6jN0d1qbzqexo1_r1_500.gif');
    }
    else if (data.text == '/unfanme')
    {
        bot.speak('@' + name + ' i am no longer your fan.');
        myId = data.userid;
        bot.removeFan(myId);
    }
    else if (text.match(/^\/move/) && condition === true)
    {
        let moveName = data.text.slice(5);
        let tempName = moveName.split(" ");

        if (typeof (tempName[1]) !== 'undefined')
        {
            let whatIsTheirName = tempName[1].substring(1); //cut the @ off
        }

        let areTheyInTheQueue = queueName.indexOf(whatIsTheirName); //name in queueName
        let areTheyInTheQueueList = queueList.indexOf(whatIsTheirName); //name in queuList
        let whatIsTheirUserid2 = theUsersList.indexOf(whatIsTheirName); //userid    

        //if either name or userid is undefined, do not perform a move operation        
        if (typeof theUsersList[whatIsTheirUserid2 - 1] == 'undefined' || typeof tempName[1] == 'undefined')
        {
            if (typeof theUsersList[whatIsTheirUserid2 - 1] != 'undefined')
            {
                bot.pm('failed to perform move operation, please try the command again', theUsersList[whatIsTheirUserid2 - 1]);
            }
            else
            {
                bot.speak('failed to perform move operation, please try the command again');
            }
        }
        else
        {
            if (roomDefaults.queue == true) //if queue is turned on
            {
                if (tempName.length == 3 && areTheyInTheQueue != -1) //if three parameters, and name found
                {
                    if (!isNaN(tempName[2]))
                    {
                        if (tempName[2] <= 1) //if position given lower than 1
                        {
                            queueName.splice(areTheyInTheQueue, 1); //remove them
                            queueList.splice(areTheyInTheQueueList, 2); //remove them
                            queueName.splice(0, 0, whatIsTheirName); //add them to beggining
                            queueList.splice(0, 0, whatIsTheirName, theUsersList[whatIsTheirUserid2 - 1]); //add them to beggining
                            clearTimeout(beginTimer); //clear timeout because first person has been replaced
                            sayOnce = true;
                            bot.speak(whatIsTheirName + ' has been moved to position 1 in the queue');
                        }
                        else if (tempName[2] >= queueName.length)
                        {
                            if (queueName[areTheyInTheQueue] == queueName[0]) //if position given higher than end
                            {
                                clearTimeout(beginTimer); //clear timeout because first person has been replaced
                                sayOnce = true;
                            }
                            queueName.splice(areTheyInTheQueue, 1); //remove them
                            queueList.splice(areTheyInTheQueueList, 2); //remove them
                            queueName.splice(queueName.length + 1, 0, whatIsTheirName); //add them to end
                            queueList.splice(queueName.length + 1, 0, whatIsTheirName, theUsersList[whatIsTheirUserid2 - 1]); //add them to end

                            bot.speak(whatIsTheirName + ' has been moved to position ' + queueName.length + ' in the queue');
                        }
                        else
                        {
                            if (queueName[areTheyInTheQueue] == queueName[0])
                            {
                                clearTimeout(beginTimer); //clear timeout because first person has been replaced
                                sayOnce = true;
                            }

                            queueName.splice(areTheyInTheQueue, 1); //remove them
                            queueList.splice(areTheyInTheQueueList, 2); //remove them                       
                            queueName.splice((Math.round(tempName[2]) - 1), 0, whatIsTheirName); //add them to given position shift left 1 because array starts at 0
                            queueList.splice(((Math.round(tempName[2]) - 1) * 2), 0, whatIsTheirName, theUsersList[whatIsTheirUserid2 - 1]); //same as above


                            bot.speak(whatIsTheirName + ' has been moved to position ' + Math.round(tempName[2]) + ' in the queue');
                        }
                    }
                    else
                    {
                        bot.pm('error, position parameter passed was not a number, please pass a valid integer arguement', data.userid);
                    }

                }
                else if (tempName.length != 3) //if invalid number of parameters
                {
                    bot.pm('error, invalid number of parameters, must have /move name #', data.userid);
                }
                else if (areTheyInTheQueue == -1) //if name not found
                {
                    bot.pm('error, name not found', data.userid);
                }
            }
            else
            {
                bot.pm('error, queue must turned on to use this command', data.userid);
            }
        }
    }
    else if (text.match(/^\/m/) && !text.match(/^\/me/) && condition === true)
    {
        bot.speak(text.substring(3));
    }
    else if (text.match(/^\/hello$/))
    {
        bot.speak('Hey! How are you @' + name + '?');
    }
    else if (text.match(/^\/snagevery$/) && condition === true)
    {
        if (snagSong === true)
        {
            snagSong = false;
            bot.speak('I am no longer adding every song that plays');
        }
        else if (snagSong === false)
        {
            snagSong = true; //this is for /snagevery
            autoSnag = false; //this turns off /autosnag
            bot.speak('I am now adding every song that plays, /autosnag has been turned off');
        }
    }
    else if (text.match(/^\/autosnag/) && condition === true)
    {
        if (autoSnag === false)
        {
            autoSnag = true; //this is for /autosnag
            snagSong = false; //this is for /snagevery          
            bot.speak('I am now adding every song that gets at least (' +  botDefaults.howManyVotes + ') awesome\'s, /snagevery has been turned off');
        }
        else if (autoSnag === true)
        {
            autoSnag = false;
            bot.speak('vote snagging has been turned off');
        }
    }
    else if (text.match(/^\/snag/) && condition === true)
    {
        if (getSong !== null && thisHoldsThePlaylist !== null)
        {
            let found = false;
            for (let igh = 0; igh < thisHoldsThePlaylist.length; igh++)
            {
                if (thisHoldsThePlaylist[igh]._id == getSong)
                {
                    found = true;
                    bot.speak('I already have that song');
                    break;
                }
            }
            if (!found)
            {
                bot.playlistAdd(getSong, -1); //add song to the end of the playlist
                bot.speak('song added');
                let tempSongHolder = {
                    _id: getSong
                };
                thisHoldsThePlaylist.push(tempSongHolder);
            }
        }
        else
        {
            bot.pm('error, you can\'t snag the song that\'s playing when the bot enters the room', data.userid);
        }
    }
    else if (text.match(/^\/removesong$/) && condition === true)
    {
        if (checkWhoIsDj == authModule.USERID)
        {
            bot.skip();
            bot.playlistRemove(-1);
            thisHoldsThePlaylist.splice(thisHoldsThePlaylist.length - 1, 1);
            bot.speak('the last snagged song has been removed.');
        }
        else
        {
            thisHoldsThePlaylist.splice(thisHoldsThePlaylist.length - 1, 1);
            bot.playlistRemove(-1);
            bot.speak('the last snagged song has been removed.');
        }
    }
    else if (text.match(/^\/queuewithnumbers$/))
    {
        if (queue === true && roomDefaults.queueName.length !== 0)
        {
            let temp95 = 'The queue is now: ';
            for (let kl = 0; kl < queueName.length; kl++)
            {
                if (kl != (queueName.length - 1))
                {
                    temp95 += queueName[kl] + ' [' + (kl + 1) + ']' + ', ';
                }
                else if (kl == (queueName.length - 1))
                {
                    temp95 += queueName[kl] + ' [' + (kl + 1) + ']';
                }
            }
            bot.speak(temp95);
        }
        else if (roomDefaults.queue === true)
        {
            bot.speak('The queue is currently empty.');
        }
        else
        {
            bot.speak('There is currently no queue.');
        }
    }
    else if (text.match(/^\/queue$/))
    {
        if (roomDefaults.queue === true && queueName.length !== 0)
        {
            let temp95 = 'The queue is now: ';
            for (let kl = 0; kl < queueName.length; kl++)
            {
                if (kl != (queueName.length - 1))
                {
                    temp95 += queueName[kl] + ', ';
                }
                else if (kl == (queueName.length - 1))
                {
                    temp95 += queueName[kl];
                }
            }
            bot.speak(temp95);

        }
        else if (roomDefaults.queue === true)
        {
            bot.speak('The queue is currently empty.');
        }
        else
        {
            bot.speak('There is currently no queue.');
        }
    }
    else if (text.match(/^\/playminus/) && condition === true)
    {
        if (PLAYLIMIT === true) //is the play limit on?
        {
            let playMinus = data.text.slice(12);
            let areTheyInRoom = theUsersList.indexOf(playMinus);
            let areTheyDj = currentDjs.indexOf(theUsersList[areTheyInRoom - 1]);

            if (areTheyInRoom != -1) //are they in the room?
            {
                if (areTheyDj != -1) //are they a dj?
                {
                    if (typeof djs20[theUsersList[areTheyInRoom - 1]] != 'undefined')
                    {
                        if (!djs20[theUsersList[areTheyInRoom - 1]].nbSong <= 0) //is their play count already 0 or lower?
                        {
                            --djs20[theUsersList[areTheyInRoom - 1]].nbSong;
                            bot.speak(theUsersList[areTheyInRoom] + '\'s play count has been reduced by one');
                        }
                        else
                        {
                            bot.pm('error, that user\'s play count is already at zero', data.userid);
                        }
                    }
                    else
                    {
                        bot.pm('something weird happened!, attemping to recover now', data.userid);
                        if (typeof theUsersList[areTheyInRoom - 1] != 'undefined')
                        {
                            //recover here
                            djs20[theUsersList[areTheyInRoom - 1]] = {
                                nbSong: 0
                            };
                        }
                    }
                }
                else
                {
                    bot.pm('error, that user is not currently djing', data.userid);
                }
            }
            else
            {
                bot.pm('error, that user is not currently in the room', data.userid);
            }
        }
        else
        {
            bot.pm('error, the play limit must be turned on in order for me to decrement play counts', data.userid);
        }
    }
    else if (text.match(/^\/whobanned$/) && condition === true)
    {
        if (blackList.length !== 0)
        {
            bot.speak('ban list: ' + blackList);
        }
        else
        {
            bot.speak('The ban list is empty.');
        }
    }
    else if (text.match(/^\/whostagebanned$/) && condition === true)
    {
        if (stageList.length !== 0)
        {
            bot.speak('banned from stage: ' + stageList);
        }
        else
        {
            bot.speak('The banned from stage list is currently empty.');
        }
    }
    else if (text.match('/removefromqueue') && roomDefaults.queue === true)
    {
        if (condition === true)
        {
            let removeFromQueue = data.text.slice(18);
            let index5 = queueList.indexOf(removeFromQueue);
            let index6 = queueName.indexOf(removeFromQueue);
            if (index5 != -1)
            {
                if (queueName[index6] == queueName[0])
                {
                    clearTimeout(beginTimer);
                    sayOnce = true;
                }
                queueList.splice(index5, 2);
                queueName.splice(index6, 1);

                if (queueName.length !== 0)
                {
                    let temp89 = 'The queue is now: ';
                    for (let jk = 0; jk < queueName.length; jk++)
                    {
                        if (jk != (queueName.length - 1))
                        {
                            temp89 += queueName[jk] + ', ';
                        }
                        else if (jk == (queueName.length - 1))
                        {
                            temp89 += queueName[jk];
                        }
                    }
                    bot.speak(temp89);
                }
                else
                {
                    bot.speak('The queue is now empty.');
                }
            }
            else
            {
                bot.pm('error, no such person was found to be in the queue', data.userid);
            }
        }
    }
    else if (text.match(/^\/removeme$/) && queue === true)
    {
        if (typeof data.name == 'undefined')
        {
            if (typeof (data.userid) != 'undefined')
            {
                bot.pm('failed to remove from queue, please try the command again', data.userid);
            }
            else
            {
                bot.speak('failed to remove from queue, please try the command again');
            }
        }
        else
        {
            let list1 = queueList.indexOf(data.name);
            let list2 = queueName.indexOf(data.name);

            if (list2 != -1 && list1 != -1)
            {
                queueList.splice(list1, 2);

                if (data.name == queueName[0])
                {
                    clearTimeout(beginTimer);
                    sayOnce = true;
                }

                queueName.splice(list2, 1);

                if (queueName.length !== 0)
                {
                    let temp90 = 'The queue is now: ';
                    for (let kj = 0; kj < queueName.length; kj++)
                    {
                        if (kj != (queueName.length - 1))
                        {
                            temp90 += queueName[kj] + ', ';
                        }
                        else if (kj == (queueName.length - 1))
                        {
                            temp90 += queueName[kj];
                        }
                    }
                    bot.speak(temp90);
                }
                else
                {
                    bot.speak('The queue is now empty.');
                }
            }
            else
            {
                bot.pm('error, you have to be in the queue to remove yourself from the queue', data.userid);
            }
        }
    }
    else if (text.match(/^\/addme$/) && roomDefaults.queue === true)
    {
        if (typeof data.userid == 'undefined')
        {
            bot.speak('failed to add to queue, please try the command again');
        }
        else
        {
            let indexInUsersList = theUsersList.indexOf(data.userid) + 1;

            if (typeof theUsersList[indexInUsersList] == 'undefined')
            {
                bot.pm('failed to add to queue, please try the command again', data.userid);
            }
            else
            {
                let list3 = queueList.indexOf(theUsersList[indexInUsersList]);
                let list10 = currentDjs.indexOf(data.userid)
                let checkStageList = stageList.indexOf(data.userid);
                let checkManualStageList = userDefaults.bannedFromStage.indexOf(data.userid);
                //if not in the queue already, not already a dj, not banned from stage
                if (list3 == -1 && list10 == -1 && checkStageList == -1 && checkManualStageList == -1)
                {
                    queueList.push(theUsersList[indexInUsersList], data.userid);
                    queueName.push(theUsersList[indexInUsersList]);
                    let temp91 = 'The queue is now: ';
                    for (let hj = 0; hj < queueName.length; hj++)
                    {
                        if (hj != (queueName.length - 1))
                        {
                            temp91 += queueName[hj] + ', ';
                        }
                        else if (hj == (queueName.length - 1))
                        {
                            temp91 += queueName[hj];
                        }
                    }
                    bot.speak(temp91);
                }
                else if (list3 != -1) //if already in queue
                {
                    bot.pm('sorry i can\'t add you to the queue because you are already in the queue!', data.userid);
                }
                else if (checkStageList != -1 || checkManualStageList != -1) //if banned from stage
                {
                    bot.pm('sorry i can\'t add you to the queue because you are currently banned from djing', data.userid);
                }
                else if (list10 !== -1) //if already on stage
                {
                    bot.pm('you are already djing!', data.userid);
                }
            }
        }
    }
    else if (text.match(/^\/queueOn$/) && condition === true)
    {
        queueList = [];
        queueName = [];
        bot.speak('the queue is now active.');
        roomDefaults.queue = true;
        clearTimeout(beginTimer); //if queue is turned on again while somebody was on timeout to get on stage, then clear it
        sayOnce = true;
    }
    else if (text.match(/^\/whatsplaylimit/))
    {
        if (PLAYLIMIT === true)
        {
            bot.speak('the play limit is currently set to: ' + roomDefaults.playLimit + ' songs.');
        }
        else
        {
            bot.speak('the play limit is currently turned off');
        }
    }
    else if (text.match(/^\/playLimitOn/) && condition === true)
    {
        let playLimitNumber = Number(data.text.slice(13)); //holds given number

        if (playLimitNumber != '') //if an additional arguement was given
        {
            if (!isNaN(playLimitNumber) && playLimitNumber > 0) //if parameter given is a number and greater than zero
            {
                roomDefaults.playLimit = Math.ceil(playLimitNumber); // round play limit to make sure its not a fraction

                bot.speak('the play limit is now active and has been set to ' +
                    roomDefaults.playLimit + ' songs. dj song counters have been reset.');

                //reset song counters
                for (let ig = 0; ig < currentDjs.length; ig++)
                {
                    djs20[currentDjs[ig]] = {
                        nbSong: 0
                    };
                }

                PLAYLIMIT = true; //mark playlimit as being on               
            }
            else
            {
                bot.pm('invalid arguement given, the play limit must be set to an integer. ' +
                    'it can either be used as /playLimitOn or /playLimitOn #.', data.userid);

                PLAYLIMIT = false; // on failure turn it off
            }
        }
        else
        {
            bot.speak('the play limit is now active and has been set to the default value of ' +
                defaultPlayLimit + ' songs. dj song counters have been reset.');

            roomDefaults.playLimit = defaultPlayLimit; //set playlimit to default

            //reset song counters
            for (let ig = 0; ig < currentDjs.length; ig++)
            {
                djs20[currentDjs[ig]] = {
                    nbSong: 0
                };
            }

            PLAYLIMIT = true; //mark playlimit as being on    
        }
    }
    else if (text.match(/^\/playLimitOff$/) && condition === true)
    {
        PLAYLIMIT = false;
        bot.speak('the play limit is now inactive.');
    }
    else if (text.match('/surf'))
    {
        bot.speak('http://25.media.tumblr.com/tumblr_mce8z6jN0d1qbzqexo1_r1_500.gif');
    }
    else if (text.match(/^\/queueOff$/) && condition === true)
    {
        bot.speak('the queue is now inactive.');
        roomDefaults.queue = false;
    }
    else if (text.match(/^\/warnme/))
    {
        let areTheyBeingWarned = warnme.indexOf(data.userid);
        let areTheyDj80 = currentDjs.indexOf(data.userid);
        let Position56 = currentDjs.indexOf(checkWhoIsDj); //current djs index

        if (areTheyDj80 != -1) //are they on stage?
        {
            if (checkWhoIsDj != null)
            {
                if (checkWhoIsDj == data.userid)
                {
                    bot.pm('you are currently playing a song!', data.userid);
                }
                else if (currentDjs[Position56] == currentDjs[currentDjs.length - 1] &&
                    currentDjs[0] == data.userid ||
                    currentDjs[Position56 + 1] == data.userid) //if they aren't the next person to play a song
                {
                    bot.pm('your song is up next!', data.userid);
                }
                else
                {
                    if (areTheyBeingWarned == -1) //are they already being warned? no
                    {
                        warnme.unshift(data.userid);
                        bot.speak('@' + name + ' you will be warned when your song is up next');
                    }
                    else if (areTheyBeingWarned != -1) //yes
                    {
                        warnme.splice(areTheyBeingWarned, 1);
                        bot.speak('@' + name + ' you will no longer be warned');
                    }
                }
            }
            else
            {
                bot.pm('you must wait one song since the bot has started up to use this command', data.userid);
            }
        }
        else
        {
            bot.pm('error, you must be on stage to use that command', data.userid);
        }
    }
    else if (text.match('/banstage') && condition === true)
    {
        let ban = data.text.slice(11);
        let checkBan = stageList.indexOf(ban);
        let checkUser = theUsersList.indexOf(ban);
        if (checkBan == -1 && checkUser != -1)
        {
            stageList.push(theUsersList[checkUser - 1], theUsersList[checkUser]);
            bot.remDj(theUsersList[checkUser - 1]);
            condition = false;
        }
        else
        {
            bot.pm('error, no such person was found, make sure you typed in their name correctly', data.userid);
        }
    }
    else if (text.match('/unbanstage') && condition === true)
    {
        let ban2 = data.text.slice(13);
        index = stageList.indexOf(ban2);
        if (index != -1)
        {
            stageList.splice(stageList[index - 1], 2);
            condition = false;
            index = null;
        }
        else
        {
            bot.pm('error, no such person was found, make sure you typed in their name correctly', data.userid);
        }
    }
    else if (text.match('/ban') && condition === true)
    {
        let ban3 = data.text.slice(6);
        let checkBan5 = blackList.indexOf(ban3);
        let checkUser3 = theUsersList.indexOf(ban3);
        if (checkBan5 == -1 && checkUser3 != -1)
        {
            blackList.push(theUsersList[checkUser3 - 1], theUsersList[checkUser3]);
            bot.boot(theUsersList[checkUser3 - 1]);
            condition = false;
        }
        else
        {
            bot.pm('error, no such person was found, make sure you typed in their name correctly', data.userid);
        }
    }
    else if (text.match('/unban') && condition === true)
    {
        let ban6 = data.text.slice(8);
        index = blackList.indexOf(ban6);
        if (index != -1)
        {
            blackList.splice(blackList[index - 1], 2);
            condition = false;
            index = null;
        }
        else
        {
            bot.pm('error, no such person was found, make sure you typed in their name correctly', data.userid);
        }
    }
    else if (text.match('/userid') && condition === true)
    {
        let ban8 = data.text.slice(9);
        let checkUser8 = bot.getUserId(ban8, function (data)
        {
            let userid56 = data.userid;
            if (typeof (userid56) !== 'undefined')
            {
                bot.speak(userid56);
                condition = false;
            }
            else
            {
                bot.speak('I\'m sorry that userid is undefined');
            }
        });
    }
    else if (text.match('/username') && condition === true)
    {
        let ban50 = data.text.slice(10);
        let tmp94 = bot.getProfile(ban50, function (data)
        {
            bot.speak(''+data.name);
        });
    }
    else if (text.match(/^\/afk/))
    {
        let isAlreadyAfk = afkPeople.indexOf(data.name);
        if (isAlreadyAfk == -1)
        {
            if (typeof data.name == 'undefined')
            {
                bot.pm('failed to add to the afk list, please try the command again', data.userid);
            }
            else
            {
                bot.speak('@' + name + ' you are marked as afk');
                afkPeople.push(data.name);
            }
        }
        else if (isAlreadyAfk != -1)
        {
            bot.speak('@' + name + ' you are no longer afk');
            afkPeople.splice(isAlreadyAfk, 1);
        }
    }
    else if (text == '/up?') //works for djs on stage
    {
        let areTheyADj = currentDjs.indexOf(data.userid); //are they a dj?
        if (areTheyADj != -1) //yes
        {
            bot.speak('anybody want up?');
        }
        else
        {
            bot.pm('error, you must be on stage to use that command', data.userid);
        }
    }
    else if (text.match(/^\/whosafk/))
    {
        if (afkPeople.length !== 0)
        {
            let whosAfk = 'marked as afk: ';
            for (let f = 0; f < afkPeople.length; f++)
            {
                if (f != (afkPeople.length - 1))
                {
                    whosAfk = whosAfk + afkPeople[f] + ', ';
                }
                else
                {
                    whosAfk = whosAfk + afkPeople[f];
                }
            }
            bot.speak(whosAfk);
        }
        else
        {
            bot.speak('No one is currently marked as afk');
        }
    }


    //checks to see if someone is trying to speak to an afk person or not.  
    if (afkPeople.length !== 0 && data.userid != authModule.USERID)
    {
        for (let j = 0; j < afkPeople.length; j++) //loop through afk people array
        {
            if (typeof (afkPeople[j] !== 'undefined'))
            {
                let areTheyAfk56 = data.text.toLowerCase().indexOf(afkPeople[j].toLowerCase()); //is an afk persons name being called   

                if (areTheyAfk56 !== -1)
                {
                    bot.speak(afkPeople[j] + ' is afk');
                }
            }
        }
    }
});



//checks who voted and updates their position on the afk list.
bot.on('update_votes', function (data)
{
    //this is for keeping track of the upvotes and downvotes on the bot
    upVotes = data.room.metadata.upvotes;
    downVotes = data.room.metadata.downvotes;


    updateAfkPostionOfUser(data.room.metadata.votelog[0][0]); //update the afk position of people who vote for a song    


    //this is for /autosnag, automatically adds songs that get over the awesome threshold
    //thanks to alain gilbert for playlist pre - testing, snag animation only when song not
    //already in playlist
    if (autoSnag === true && snagSong === false && upVotes >=  botDefaults.howManyVotes && ALLREADYCALLED === false)
    {
        ALLREADYCALLED = true; //this makes it so that it can only be called once per song

        addSongIfNotAlreadyInPlaylist(true);
    }
})



//checks who added a song and updates their position on the afk list. 
bot.on('snagged', function (data)
{
    updateAfkPostionOfUser(data.userid); //update the afk position of people who add a song to their queue    

    whoSnagged += 1; //add one to the count of people who have snagged the currently playing song
})



//this activates when a user joins the stage.
bot.on('add_dj', function (data)
{
    //removes dj when they try to join the stage if the vip list has members in it.
    //does not remove the bot
    let checkVip = userDefaults.vipList.indexOf(data.user[0].userid);
    if (userDefaults.vipList.length !== 0 && checkVip == -1 && data.user[0].userid != authModule.USERID)
    {
        bot.remDj(data.user[0].userid);
        bot.pm('The vip list is currently active, only the vips may dj at this time', data.user[0].userid);

        incrementSpamCounter(data.user[0].userid);
    }



    //sets dj's songcount to zero when they enter the stage.
    //unless they used the refresh command, in which case its set to 
    //what it was before they left the room
    if (typeof playLimitOfRefresher[data.user[0].userid] == 'number')
    {
        djs20[data.user[0].userid] = {
            nbSong: playLimitOfRefresher[data.user[0].userid]
        };
    }
    else
    {
        djs20[data.user[0].userid] = {
            nbSong: 0
        };
    }



    //updates the afk position of the person who joins the stage.
    updateAfkPostionOfUser(data.user[0].userid);



    //adds a user to the current Djs list when they join the stage.
    let check89 = currentDjs.indexOf(data.user[0].userid);
    if (check89 == -1 && typeof data.user[0] != 'undefined')
    {
        currentDjs.push(data.user[0].userid);
    }



    if ((refreshList.length + currentDjs.length) <= 5) //if there are still seats left to give out, then give them(but reserve for refreshers)
    {
        if (refreshList.indexOf(data.user[0].userid) == -1) //don't show these messages to people on the refresh list
        {
            //tells a dj trying to get on stage how to add themselves to the queuelist
            let ifUser2 = queueList.indexOf(data.user[0].userid);
            if (roomDefaults.queue === true && ifUser2 == -1)
            {
                if (queueList.length !== 0)
                {
                    bot.pm('The queue is currently active. To add yourself to the queue type /addme. To remove yourself from the queue type /removeme.', data.user[0].userid);
                }
            }
            else if (roomDefaults.queue === true && ifUser2 !== -1 && data.user[0].name !== queueName[0])
            {
                bot.pm('sorry, but you are not first in queue. please wait your turn.', data.user[0].userid);
            }
        }
    }
    else if (refreshList.length != 0 && refreshList.indexOf(data.user[0].userid) == -1) //if there are people in the refresh list
    { //and the person who just joined the stage is not one of them
        bot.pm('sorry, but i\m holding that spot for someone in the refresh list', data.user[0].userid);
    }



    //escorting for the queue will not apply to people who are on the refresh list
    if (refreshList.indexOf(data.user[0].userid) == -1)
    {
        if ((refreshList.length + currentDjs.length) <= 5) //if there are still seats left to give out, then give them(but reserve for refreshers)
        {
            //removes a user from the queue list when they join the stage.
            if (roomDefaults.queue === true)
            {
                let firstOnly = queueList.indexOf(data.user[0].userid);
                let queueListLength = queueList.length;
                if (firstOnly != 1 && queueListLength !== 0)
                {
                    bot.remDj(data.user[0].userid);

                    incrementSpamCounter(data.user[0].userid);
                }
            }
            if (roomDefaults.queue === true)
            {
                let checkQueue = queueList.indexOf(data.user[0].name);
                let checkName2 = queueName.indexOf(data.user[0].name);
                if (checkQueue != -1 && checkQueue === 0)
                {
                    clearTimeout(beginTimer);
                    sayOnce = true;
                    queueList.splice(checkQueue, 2);
                    queueName.splice(checkName2, 1);
                }
            }
        }
    }



    //if when adding up the number of people in the refresh list with the number of dj's on stage
    //it exceeds the number of seats available (this assumes a 5 seater room
    if ((refreshList.length + currentDjs.length) > 5)
    {
        if (refreshList.indexOf(data.user[0].userid) == -1) //if person joining is not in refresh list
        {
            bot.remDj(data.user[0].userid);

            incrementSpamCounter(data.user[0].userid);
        }
    }



    //if user is still in refresh list when they get on stage, remove them
    let areTheyStillInRefreshList = refreshList.indexOf(data.user[0].userid);
    if (areTheyStillInRefreshList != -1)
    {
        clearTimeout(refreshTimer[data.user[0].userid]); //clear their timeout
        delete refreshTimer[data.user[0].userid];
        refreshList.splice(areTheyStillInRefreshList, 1); //remove them from the refresh list        
    }



    //checks to see if user is on the banned from stage list, if they are they are removed from stage
    for (let g = 0; g < stageList.length; g++)
    {
        if (data.user[0].userid == stageList[g])
        {
            bot.remDj(data.user[0].userid);
            bot.speak('@' + data.user[0].name + ' you are banned from djing');

            incrementSpamCounter(data.user[0].userid);
            break;
        }
    }



    //checks to see if user is on the manually added banned from stage list, if they are they are removed from stage
    for (let z = 0; z < userDefaults.bannedFromStage.length; z++)
    {
        if (userDefaults.bannedFromStage[z].match(data.user[0].userid)) //== userDefaults.bannedFromStage[z])
        {
            bot.remDj(data.user[0].userid);
            bot.speak('@' + data.user[0].name + ' you are banned from djing');

            incrementSpamCounter(data.user[0].userid);
            break;
        }
    }



    //check to see if conditions are met for bot's autodjing feature
    autoDjing();



    //if person exceeds spam count within 10 seconds they are kicked
    if (typeof people[data.user[0].userid] != 'undefined' && people[data.user[0].userid].spamCount >= spamLimit)
    {
        bot.boot(data.user[0].userid, 'stop spamming');
    }
    else if (typeof people[data.user[0].userid] == 'undefined') //if something weird happened, recover here
    {
        people[data.user[0].userid] = {
            spamCount: 0
        };
    }
})



//checks when a dj leaves the stage
bot.on('rem_dj', function (data)
{
    //removes user from the dj list when they leave the stage
    delete djs20[data.user[0].userid];


    //gives them one chance to get off stage then after that theyre play limit is treated as normal
    if (typeof playLimitOfRefresher[data.user[0].userid] == 'number' && refreshList.indexOf(data.user[0].userid) == -1)
    {
        delete playLimitOfRefresher[data.user[0].userid]
    }


    //updates the current dj's list.
    let check30 = currentDjs.indexOf(data.user[0].userid);
    if (check30 != -1)
    {
        currentDjs.splice(check30, 1);
    }


    //this is for /warnme
    if (warnme.length != 0)
    {
        let areTheyBeingWarned = warnme.indexOf(data.user[0].userid);

        if (areTheyBeingWarned != -1) //if theyre on /warnme and they leave the stage
        {
            warnme.splice(areTheyBeingWarned, 1);
        }
    }


    //checks if when someone gets off the stage, if the person
    //on the left is now the next dj
    warnMeCall();


    //check to see if conditions are met for bot's autodjing feature    
    autoDjing();


    //takes a user off the escort list if they leave the stage.
    let checkEscort = escortList.indexOf(data.user[0].userid);
    if (checkEscort != -1)
    {
        escortList.splice(checkEscort, 1);
    }
})



//checks when the bot recieves a pm
bot.on('pmmed', function (data)
{
    let senderid = data.senderid; //the userid of the person who just pmmed the bot
    let text = data.text; //the text sent to the bot in a pm    
    let name1 = theUsersList.indexOf(data.senderid) + 1; //the name of the person who sent the bot a pm
    let isInRoom = checkToseeIfPmmerIsInRoom(senderid); //check to see whether pmmer is in the same room as the bot

    checkIfUserIsMod(data.senderid); //check to see if person pming the bot a command is a moderator or not

    //if no commands match, the pmmer is a moderator and theres more than zero people in the modpm chat
    if (modpm.length != 0 && data.text.charAt(0) != '/' && condition === true) //if no other commands match, send modpm
    {
        let areTheyInModPm = modpm.indexOf(data.senderid);

        if (areTheyInModPm != -1)
        {
            for (let jhg = 0; jhg < modpm.length; jhg++)
            {
                if (modpm[jhg] != data.senderid && modpm[jhg] != authModule.USERID) //this will prevent you from messaging yourself
                {
                    bot.pm(theUsersList[name1] + ' said: ' + data.text, modpm[jhg]);
                }
            }
        }
    }
    else if (text.match(/^\/modpm/) && condition === true && isInRoom === true)
    {
        let areTheyInModPm = modpm.indexOf(data.senderid);

        if (areTheyInModPm == -1) //are they already in modpm? no
        {
            modpm.unshift(data.senderid);
            bot.pm('you have now entered into modpm mode, your messages ' +
                'will go to other moderators currently in the modpm', data.senderid);
            if (modpm.length != 0)
            {
                for (let jk = 0; jk < modpm.length; jk++)
                {
                    if (modpm[jk] != data.senderid)
                    {
                        bot.pm(theUsersList[name1] + ' has entered the modpm chat', modpm[jk]); //declare user has entered chat
                    }
                }
            }
        }
        else if (areTheyInModPm != -1) //yes
        {
            modpm.splice(areTheyInModPm, 1);
            bot.pm('you have now left modpm mode', data.senderid);
            if (modpm.length != 0)
            {
                for (let jk = 0; jk < modpm.length; jk++)
                {
                    bot.pm(theUsersList[name1] + ' has left the modpm chat', modpm[jk]); //declare user has entered chat
                }
            }
        }
    }
    else if (text.match(/^\/whosrefreshing/) && isInRoom === true)
    {
        if (refreshList.length != 0)
        {
            let whosRefreshing = 'refreshing: ';
            let namesOfRefresher;

            for (let i = 0; i < refreshList.length; i++)
            {
                namesOfRefresher = theUsersList.indexOf(data.senderid) + 1;

                if (i < refreshList.length - 1)
                {
                    whosRefreshing += theUsersList[namesOfRefresher] + ', ';
                }
                else
                {
                    whosRefreshing += theUsersList[namesOfRefresher];
                }
            }

            bot.pm(whosRefreshing, data.senderid);
        }
        else
        {
            bot.pm('no one is currently refreshing', data.senderid);
        }
    }
    else if (text.match(/^\/refreshoff/) && condition === true && isInRoom === true)
    {
        bot.pm('refreshing has been disabled', data.senderid);
        roomDefaults.isRefreshing = false;
    }
    else if (text.match(/^\/refreshon/) && condition === true && isInRoom === true)
    {
        bot.pm('refreshing has been enabled', data.senderid);
        roomDefaults.isRefreshing = true;
    }
    else if (text.match(/^\/whosinmodpm/) && condition === true && isInRoom === true)
    {
        if (modpm.length != 0)
        {
            let temper = "Users in modpm: "; //holds names

            for (let gfh = 0; gfh < modpm.length; gfh++)
            {
                let whatAreTheirNames = theUsersList.indexOf(modpm[gfh]) + 1;

                if (gfh != (modpm.length - 1))
                {
                    temper += theUsersList[whatAreTheirNames] + ', ';

                }
                else
                {
                    temper += theUsersList[whatAreTheirNames];
                }
            }
            bot.pm(temper, data.senderid);
        }
        else
        {
            bot.pm('no one is currently in modpm', data.senderid);
        }
    }
    else if (text.match(/^\/warnme/) && isInRoom === true)
    {
        let areTheyBeingWarned = warnme.indexOf(data.senderid);
        let areTheyDj80 = currentDjs.indexOf(data.senderid);
        let Position56 = currentDjs.indexOf(checkWhoIsDj); //current djs index

        if (areTheyDj80 != -1) //are they on stage?
        {
            if (checkWhoIsDj != null)
            {
                if (checkWhoIsDj == data.senderid)
                {
                    bot.pm('you are currently playing a song!', data.senderid);
                }
                else if (currentDjs[Position56] == currentDjs[currentDjs.length - 1] &&
                    currentDjs[0] == data.senderid ||
                    currentDjs[Position56 + 1] == data.senderid) //if they aren't the next person to play a song
                {
                    bot.pm('your song is up next!', data.senderid);
                }
                else
                {
                    if (areTheyBeingWarned == -1) //are they already being warned? no
                    {
                        warnme.unshift(data.senderid);
                        bot.pm('you will be warned when your song is up next', data.senderid);
                    }
                    else if (areTheyBeingWarned != -1) //yes
                    {
                        warnme.splice(areTheyBeingWarned, 1);
                        bot.pm('you will no longer be warned', data.senderid);
                    }
                }
            }
            else
            {
                bot.pm('you must wait one song since the bot has started up to use this command', data.senderid);
            }
        }
        else
        {
            bot.pm('error, you must be on stage to use that command', data.senderid);
        }
    }
    else if (text.match(/^\/move/) && condition === true && isInRoom === true)
    {
        let moveName = data.text.slice(5);
        let tempName = moveName.split(" ");
        let areTheyInTheQueue = queueName.indexOf(tempName[1]); //name in queueName
        let areTheyInTheQueueList = queueList.indexOf(tempName[1]); //name in queuList
        let whatIsTheirUserid2 = theUsersList.indexOf(tempName[1]); //userid

        //if either name or userid is undefined, do not perform a move operation        
        if (typeof theUsersList[whatIsTheirUserid2 - 1] == 'undefined' || typeof tempName[1] == 'undefined')
        {
            if (typeof theUsersList[whatIsTheirUserid2 - 1] != 'undefined')
            {
                bot.pm('failed to perform move operation, please try the command again', theUsersList[whatIsTheirUserid2 - 1]);
            }
            else
            {
                bot.speak('failed to perform move operation, please try the command again');
            }
        }
        else
        {
            if (roomDefaults.queue == true) //if queue is turned on
            {
                if (tempName.length == 3 && areTheyInTheQueue != -1) //if three parameters, and name found
                {
                    if (!isNaN(tempName[2]))
                    {
                        if (tempName[2] <= 1)
                        {
                            queueName.splice(areTheyInTheQueue, 1); //remove them
                            queueList.splice(areTheyInTheQueueList, 2); //remove them
                            queueName.splice(0, 0, tempName[1]); //add them to beggining
                            queueList.splice(0, 0, tempName[1], theUsersList[whatIsTheirUserid2 - 1]); //add them to beggining
                            clearTimeout(beginTimer); //clear timeout because first person has been replaced
                            sayOnce = true;
                            bot.pm(tempName[1] + ' has been moved to position 1 in the queue', data.senderid);
                        }
                        else if (tempName[2] >= queueName.length)
                        {
                            if (queueName[areTheyInTheQueue] == queueName[0])
                            {
                                clearTimeout(beginTimer); //clear timeout because first person has been replaced
                                sayOnce = true;
                            }
                            queueName.splice(areTheyInTheQueue, 1); //remove them
                            queueList.splice(areTheyInTheQueueList, 2); //remove them
                            queueName.splice(queueName.length + 1, 0, tempName[1]); //add them to end
                            queueList.splice(queueName.length + 1, 0, tempName[1], theUsersList[whatIsTheirUserid2 - 1]); //add them to end

                            bot.pm(tempName[1] + ' has been moved to position ' + queueName.length + ' in the queue', data.senderid);
                        }
                        else
                        {
                            if (queueName[areTheyInTheQueue] == queueName[0])
                            {
                                clearTimeout(beginTimer); //clear timeout because first person has been replaced
                                sayOnce = true;
                            }

                            queueName.splice(areTheyInTheQueue, 1); //remove them
                            queueList.splice(areTheyInTheQueueList, 2); //remove them                      
                            queueName.splice((Math.round(tempName[2]) - 1), 0, tempName[1]); //add them to given position shift left 1 because array starts at 0
                            queueList.splice(((Math.round(tempName[2]) - 1) * 2), 0, tempName[1], theUsersList[whatIsTheirUserid2 - 1]); //same as above                        

                            bot.pm(tempName[1] + ' has been moved to position ' + Math.round(tempName[2]) + ' in the queue', data.senderid);
                        }
                    }
                    else
                    {
                        bot.pm('error, position parameter passed was not a number, please pass a valid integer arguement', data.senderid);
                    }
                }
                else if (tempName.length != 3) //if invalid number of parameters
                {
                    bot.pm('error, invalid number of parameters, must have /move name #', data.senderid);
                }
                else if (areTheyInTheQueue == -1) //if name not found
                {
                    bot.pm('error, name not found', data.senderid);
                }
            }
            else
            {
                bot.pm('error, queue must turned on to use this command', data.senderid);
            }
        }
    }
    else if (text.match(/^\/position/)) //tells you your position in the queue, if there is one
    {
        let checkPosition = queueName.indexOf(theUsersList[name1]);

        if (checkPosition != -1 && roomDefaults.queue === true) //if person is in the queue and queue is active
        {
            bot.pm('you are currently in position number ' + (checkPosition + 1) + ' in the queue', data.senderid);
        }
        else if (checkPosition == -1 && roomDefaults.queue === true)
        {
            bot.pm('i can\'t tell you your position unless you are currently in the queue', data.senderid);
        }
        else
        {
            bot.pm('there is currently no queue', data.senderid);
        }
    }
    else if (text.match(/^\/djafk/) && isInRoom === true)
    {
        if (AFK === true) //afk limit turned on?
        {
            if (currentDjs.length !== 0) //any dj's on stage?
            {
                let afkDjs = 'dj afk time: ';

                for (let ijhp = 0; ijhp < currentDjs.length; ijhp++)
                {
                    let lastUpdate = Math.floor((Date.now() - lastSeen[currentDjs[ijhp]]) / 1000 / 60); //their afk time in minutes
                    let whatIsTheName = theUsersList.indexOf(currentDjs[ijhp]); //their name

                    if (currentDjs[ijhp] != currentDjs[currentDjs.length - 1])
                    {
                        afkDjs += theUsersList[whatIsTheName + 1] + ': ' + lastUpdate + ' mins, ';
                    }
                    else
                    {
                        afkDjs += theUsersList[whatIsTheName + 1] + ': ' + lastUpdate + ' mins';
                    }
                }
                bot.pm(afkDjs, data.senderid);
            }
            else
            {
                bot.pm('error, there are currently no dj\'s on stage.', data.senderid);
            }
        }
        else
        {
            bot.pm('error, the dj afk timer has to be active for me to report afk time.', data.senderid);
        }
    }
    else if (text.match(/^\/playminus/) && condition === true && isInRoom === true)
    {
        if (PLAYLIMIT === true) //is the play limit on?
        {
            let playMinus = data.text.slice(12);
            let areTheyInRoom = theUsersList.indexOf(playMinus);
            let areTheyDj = currentDjs.indexOf(theUsersList[areTheyInRoom - 1]);
            if (areTheyInRoom != -1) //are they in the room?
            {
                if (areTheyDj != -1) //are they a dj?
                {
                    if (typeof djs20[theUsersList[areTheyInRoom - 1]] != 'undefined')
                    {

                        if (!djs20[theUsersList[areTheyInRoom - 1]].nbSong <= 0) //is their play count already 0 or lower?
                        {
                            --djs20[theUsersList[areTheyInRoom - 1]].nbSong;
                            bot.pm(theUsersList[areTheyInRoom] + '\'s play count has been reduced by one', data.senderid);
                        }
                        else
                        {
                            bot.pm('error, that user\'s play count is already at zero', data.senderid);
                        }
                    }
                    else
                    {
                        bot.pm('something weird happened!, attemping to recover now', data.senderid);

                        if (theUsersList[areTheyInRoom - 1] != 'undefined') //only recover if userid given is not undefined
                        {
                            //recover here
                            djs20[theUsersList[areTheyInRoom - 1]] = {
                                nbSong: 0
                            };
                        }
                    }
                }
                else
                {
                    bot.pm('error, that user is not currently djing', data.senderid);
                }
            }
            else
            {
                bot.pm('error, that user is not currently in the room', data.senderid);
            }
        }
        else
        {
            bot.pm('error, the play limit must be turned on in order for me to decrement play counts', data.senderid);
        }
    }
    else if (text.match(/^\/whatsplaylimit/) && isInRoom === true)
    {
        if (PLAYLIMIT === true)
        {
            bot.pm('the play limit is currently set to: ' + roomDefaults.playLimit + ' songs.', data.senderid);
        }
        else
        {
            bot.pm('the play limit is currently turned off', data.senderid);
        }
    }
    else if (text.match(/^\/playLimitOn/) && condition === true && isInRoom === true)
    {
        let playLimitNumber = Number(data.text.slice(13)); //holds given number

        if (playLimitNumber != '') //if an additional arguement was given
        {
            if (!isNaN(playLimitNumber) && playLimitNumber > 0) //if parameter given is a number and greater than zero
            {
                roomDefaults.playLimit = Math.ceil(playLimitNumber); // round play limit to make sure its not a fraction

                bot.pm('the play limit is now active and has been set to ' +
                    roomDefaults.playLimit + ' songs. dj song counters have been reset.', data.senderid);

                //reset song counters
                for (let ig = 0; ig < currentDjs.length; ig++)
                {
                    djs20[currentDjs[ig]] = {
                        nbSong: 0
                    };
                }

                PLAYLIMIT = true; //mark playlimit as being on               
            }
            else
            {
                bot.pm('invalid arguement given, the play limit must be set to an integer. ' +
                    'it can either be used as /playLimitOn or /playLimitOn #.', data.senderid);

                PLAYLIMIT = false; //on failure turn it off
            }
        }
        else
        {
            bot.pm('the play limit is now active and has been set to the default value of ' +
                defaultPlayLimit + ' songs. dj song counters have been reset.', data.senderid);

            roomDefaults.playLimit = defaultPlayLimit; //set playlimit to default

            //reset song counters
            for (let ig = 0; ig < currentDjs.length; ig++)
            {
                djs20[currentDjs[ig]] = {
                    nbSong: 0
                };
            }

            PLAYLIMIT = true; //mark playlimit as being on    
        }
    }
    else if (text.match(/^\/playLimitOff$/) && condition === true && isInRoom === true)
    {
        PLAYLIMIT = false;
        bot.pm('the play limit is now inactive.', data.senderid);
    }
    else if (text.match(/^\/queueOn$/) && condition === true && isInRoom === true)
    {
        queueList = [];
        queueName = [];
        bot.pm('the queue is now active.', data.senderid);
        roomDefaults.queue = true;
        clearTimeout(beginTimer); //if queue is turned on again while somebody was on timeout to get on stage, then clear it
        sayOnce = true;
    }
    else if (text.match(/^\/queueOff$/) && condition === true && isInRoom === true)
    {
        bot.pm('the queue is now inactive.', data.senderid);
        roomDefaults.queue = false;
    }
    else if (text.match(/^\/addme$/) && roomDefaults.queue === true && isInRoom === true)
    {
        if (typeof data.senderid == 'undefined' || typeof theUsersList[name1] == 'undefined')
        {
            if (typeof data.senderid != 'undefined')
            {
                bot.pm('failed to add to queue, please try the command again', data.senderid);
            }
            else
            {
                bot.speak('failed to add to queue, please try the command again');
            }
        }
        else
        {
            let list3 = queueList.indexOf(theUsersList[name1]);
            let list10 = currentDjs.indexOf(data.senderid)
            let checkStageList = stageList.indexOf(data.senderid);
            let checkManualStageList = userDefaults.bannedFromStage.indexOf(data.senderid);
            if (list3 == -1 && list10 == -1 && checkStageList == -1 && checkManualStageList == -1)
            {
                queueList.push(theUsersList[name1], data.senderid);
                queueName.push(theUsersList[name1]);
                let temp91 = 'The queue is now: ';
                for (let hj = 0; hj < queueName.length; hj++)
                {
                    if (hj != (queueName.length - 1))
                    {
                        temp91 += queueName[hj] + ', ';
                    }
                    else if (hj == (queueName.length - 1))
                    {
                        temp91 += queueName[hj];
                    }
                }
                bot.speak(temp91);
            }
            else if (list3 != -1) //if already in queue
            {
                bot.pm('sorry i can\'t add you to the queue because you are already in the queue!', data.senderid);
            }
            else if (checkStageList != -1 || checkManualStageList != -1) //if banned from stage
            {
                bot.pm('sorry i can\'t add you to the queue because you are currently banned from djing', data.senderid);
            }
            else if (list10 !== -1) //if already on stage
            {
                bot.pm('you are already djing!', data.senderid);
            }
        }
    }
    else if (text.match(/^\/removeme$/) && roomDefaults.queue === true && isInRoom === true)
    {
        if (typeof theUsersList[name1] == 'undefined')
        {
            if (typeof data.senderid != 'undefined')
            {
                bot.pm('failed to remove from queue, please try the command again', data.senderid);
            }
            else
            {
                bot.speak('failed to remove from queue, please try the command again');
            }
        }
        else
        {
            let list1 = queueList.indexOf(theUsersList[name1]);
            let list2 = queueName.indexOf(theUsersList[name1]);

            if (list2 != -1 && list1 != -1)
            {
                queueList.splice(list1, 2);

                if (theUsersList[name1] == queueName[0])
                {
                    clearTimeout(beginTimer);
                    sayOnce = true;
                }
                queueName.splice(list2, 1);

                if (queueName.length !== 0)
                {
                    let temp90 = 'The queue is now: ';
                    for (let kj = 0; kj < queueName.length; kj++)
                    {
                        if (kj != (queueName.length - 1))
                        {
                            temp90 += queueName[kj] + ', ';
                        }
                        else if (kj == (queueName.length - 1))
                        {
                            temp90 += queueName[kj];
                        }
                    }
                    bot.speak(temp90);
                }
                else
                {
                    bot.speak('The queue is now empty.');
                }
            }
            else
            {
                bot.pm('error, you have to be in the queue to remove yourself from the queue', data.senderid);
            }
        }
    }
    else if (text.match('/removefromqueue') && roomDefaults.queue === true && isInRoom === true)
    {
        if (condition === true)
        {
            let removeFromQueue = data.text.slice(18);
            let index5 = queueList.indexOf(removeFromQueue);
            let index6 = queueName.indexOf(removeFromQueue);
            if (index5 != -1)
            {
                if (queueName[index6] == queueName[0])
                {
                    clearTimeout(beginTimer);
                    sayOnce = true;
                }
                queueList.splice(index5, 2);
                queueName.splice(index6, 1);

                if (queueName.length !== 0)
                {
                    let temp89 = 'The queue is now: ';
                    for (let jk = 0; jk < queueName.length; jk++)
                    {
                        if (jk != (queueName.length - 1))
                        {
                            temp89 += queueName[jk] + ', ';
                        }
                        else if (jk == (queueName.length - 1))
                        {
                            temp89 += queueName[jk];
                        }
                    }
                    bot.speak(temp89);
                }
                else
                {
                    bot.speak('The queue is now empty.');
                }
            }
            else
            {
                bot.pm('error, no such person was found to be in the queue', data.senderid);
            }
        }
    }
    else if (text.match(/^\/snagevery$/) && condition === true && isInRoom === true)
    {
        if (snagSong === true)
        {
            snagSong = false;
            bot.pm('I am no longer adding every song that plays', data.senderid);
        }
        else if (snagSong === false)
        {
            snagSong = true; //this is for /snagevery
            autoSnag = false; //this turns off /autosnag
            bot.pm('I am now adding every song that plays, /autosnag has been turned off', data.senderid);
        }
    }
    else if (text.match(/^\/autosnag/) && condition === true && isInRoom === true)
    {
        if (autoSnag === false)
        {
            autoSnag = true; //this is for /autosnag
            snagSong = false; //this is for /snagevery          
            bot.pm('I am now adding every song that gets at least (' +  botDefaults.howManyVotes + ') awesome\'s, /snagevery has been turned off', data.senderid);
        }
        else if (autoSnag === true)
        {
            autoSnag = false;
            bot.pm('vote snagging has been turned off', data.senderid);
        }
    }
    else if (text.match(/^\/dive/) && isInRoom === true)
    {
        let checkDj = currentDjs.indexOf(data.senderid);
        if (checkDj != -1)
        {
            bot.remDj(data.senderid);
        }
        else
        {
            bot.pm('you must be on stage to use that command.', data.senderid);
        }
    }
    else if (data.text == '/getTags' && isInRoom === true)
    {
        bot.pm('artist name: ' + artist + ', song name: ' + song + ', album: ' + album + ', genre: ' + genre, data.senderid);
    }
    else if (data.text == '/roominfo' && isInRoom === true)
    {
        if (typeof detail !== 'undefined')
        {
            bot.pm(detail, data.senderid);
        }
    }
    else if (text.match(/^\/getonstage$/) && condition === true && isInRoom === true)
    {
        if (botDefaults.getonstage === false)
        {
            bot.pm('I am now auto djing', data.senderid);
            botDefaults.getonstage = true;
        }
        else if (botDefaults.getonstage === true)
        {
            bot.pm('I am no longer auto djing', data.senderid);
            botDefaults.getonstage = false;
        }
    }
    else if (text.match(/^\/skipoff$/) && condition === true && isInRoom === true)
    {
        bot.pm('i am no longer skipping my songs', data.senderid);
        skipOn = false;
    }
    else if (text.match(/^\/skipon$/) && condition === true && isInRoom === true)
    {
        bot.pm('i am now skipping my songs', data.senderid);
        skipOn = true;
    }
    else if (text.match('/awesome') && isInRoom === true)
    {
        bot.vote('up');
    }
    else if (text.match('/lame') && condition === true && isInRoom === true)
    {
        bot.vote('down');
    }
    else if (text.match(/^\/eventmessageOn/) && condition === true && isInRoom === true)
    {
        bot.pm('event message: On', data.senderid);
        EVENTMESSAGE = true;
    }
    else if (text.match(/^\/eventmessageOff/) && condition === true && isInRoom === true)
    {
        bot.pm('event message: Off', data.senderid);
        EVENTMESSAGE = false;
    }
    else if (text.match(/^\/messageOff/) && condition === true && isInRoom === true)
    {
        bot.pm('message: Off', data.senderid);
        MESSAGE = false;
    }
    else if (text.match(/^\/messageOn/) && condition === true && isInRoom === true)
    {
        bot.pm('message: On', data.senderid);
        MESSAGE = true;
    }
    else if (text.match(/^\/greetoff/) && condition === true && isInRoom === true)
    {
        bot.pm('room greeting: Off', data.senderid);
        GREET = false;
    }
    else if (text.match(/^\/greeton/) && condition === true && isInRoom === true)
    {
        bot.pm('room greeting: On', data.senderid);
        GREET = true;
    }
    else if (text.match(/^\/songstats/) && condition === true && isInRoom === true)
    {
        if (SONGSTATS === true)
        {
            SONGSTATS = false;
            bot.pm('song stats is now inactive', data.senderid);
        }
        else if (SONGSTATS === false)
        {
            SONGSTATS = true;
            bot.pm('song stats is now active', data.senderid);
        }
    }
    else if (text.match(/^\/playlist/) && condition === true && isInRoom === true)
    {
        if (thisHoldsThePlaylist !== null)
        {
            bot.pm('There are currently ' + thisHoldsThePlaylist.length + ' songs in my playlist.', data.senderid);
        }
    }
    else if (text.match(/^\/setTheme/) && condition === true && isInRoom === true)
    {
        whatIsTheme = data.text.slice(10);
        THEME = true;
        bot.pm('The theme is now set to: ' + whatIsTheme, data.senderid);
    }
    else if (text.match(/^\/noTheme/) && condition === true && isInRoom === true)
    {
        THEME = false;
        bot.pm('The theme is now inactive', data.senderid);
    }
    else if (text.match(/^\/theme/) && isInRoom === true)
    {
        if (THEME === false)
        {
            bot.pm('There is currently no theme, standard rules apply', data.senderid);
        }
        else
        {
            bot.pm('The theme is currently set to: ' + whatIsTheme, data.senderid);
        }
    }
    else if (text.match(/^\/skipsong/) && condition === true && isInRoom === true)
    {
        if (checkWhoIsDj == authModule.USERID)
        {
            bot.skip();
        }
        else
        {
            bot.pm('error, that command only skips the bots currently playing song', data.senderid);
        }
    }
    else if (text.match(/^\/roomafkoff/) && condition === true && isInRoom === true)
    {
        roomAFK = false;
        bot.pm('the audience afk list is now inactive.', data.senderid);
    }
    else if (text.match(/^\/roomafkon/) && condition === true && isInRoom === true)
    {
        roomAFK = true;
        bot.pm('the audience afk list is now active.', data.senderid);
        for (let zh = 0; zh < userIds.length; zh++)
        {
            let isDj2 = currentDjs.indexOf(userIds[zh])
            if (isDj2 == -1)
            {
                justSaw(userIds[zh], 'justSaw3');
                justSaw(userIds[zh], 'justSaw4');
            }
        }
    }
    else if (text.match(/^\/afkoff/) && condition === true && isInRoom === true)
    {
        AFK = false;
        bot.pm('the afk list is now inactive.', data.senderid);
    }
    else if (text.match(/^\/afkon/) && condition === true && isInRoom === true)
    {
        AFK = true;
        bot.pm('the afk list is now active.', data.senderid);
        for (let z = 0; z < currentDjs.length; z++)
        {
            justSaw(currentDjs[z], 'justSaw');
            justSaw(currentDjs[z], 'justSaw1');
            justSaw(currentDjs[z], 'justSaw2');
        }
    }
    else if (text.match(/^\/autodj$/) && condition === true && isInRoom === true)
    {
        bot.addDj();
    }
    else if (text.match(/^\/removedj$/) && condition === true && isInRoom === true)
    {
        bot.remDj();
    }
    else if (text.match(/^\/voteskipoff$/) && condition === true && isInRoom === true)
    {
        bot.pm("vote skipping is now inactive", data.senderid);
        voteSkip = false;
        voteCountSkip = 0;
        votesLeft = roomDefaults.HowManyVotesToSkip;
    }
    else if (text.match(/^\/mytime/) && isInRoom === true)
    {
        let msecPerMinute1 = 1000 * 60;
        let msecPerHour1 = msecPerMinute1 * 60;
        let msecPerDay1 = msecPerHour1 * 24;
        let endTime1 = Date.now();
        let currentTime1 = endTime1 - myTime[data.senderid];

        let days1 = Math.floor(currentTime1 / msecPerDay1);
        currentTime1 = currentTime1 - (days1 * msecPerDay1);

        let hours1 = Math.floor(currentTime1 / msecPerHour1);
        currentTime1 = currentTime1 - (hours1 * msecPerHour1);

        let minutes1 = Math.floor(currentTime1 / msecPerMinute1);


        bot.pm('you have been in the room for: ' + days1 + ' days, ' + hours1 + ' hours, ' + minutes1 + ' minutes', data.senderid);

    }
    else if (text.match(/^\/uptime/) && isInRoom === true)
    {
        let msecPerMinute = 1000 * 60;
        let msecPerHour = msecPerMinute * 60;
        let msecPerDay = msecPerHour * 24;
        endTime = Date.now();
        let currentTime = endTime - beginTime;

        let days = Math.floor(currentTime / msecPerDay);
        currentTime = currentTime - (days * msecPerDay);

        let hours = Math.floor(currentTime / msecPerHour);
        currentTime = currentTime - (hours * msecPerHour);

        let minutes = Math.floor(currentTime / msecPerMinute);

        bot.pm('bot uptime: ' + days + ' days, ' + hours + ' hours, ' + minutes + ' minutes', data.senderid);
    }
    else if (text.match(/^\/voteskipon/) && condition === true && isInRoom === true)
    {
        checkVotes = [];
        roomDefaults.HowManyVotesToSkip = Number(data.text.slice(12))
        if (isNaN(roomDefaults.HowManyVotesToSkip) || roomDefaults.HowManyVotesToSkip === 0)
        {
            bot.pm("error, please enter a valid number", data.senderid);
        }

        if (!isNaN(roomDefaults.HowManyVotesToSkip) && roomDefaults.HowManyVotesToSkip !== 0)
        {
            bot.pm("vote skipping is now active, current votes needed to pass " + "the vote is " + roomDefaults.HowManyVotesToSkip, data.senderid);
            voteSkip = true;
            voteCountSkip = 0;
            votesLeft = roomDefaults.HowManyVotesToSkip;
        }
    }
    else if (text.match(/^\/queuewithnumbers$/) && isInRoom === true)
    {
        if (roomDefaults.queue === true && queueName.length !== 0)
        {
            let temp95 = 'The queue is now: ';
            for (let kl = 0; kl < queueName.length; kl++)
            {
                if (kl != (queueName.length - 1))
                {
                    temp95 += queueName[kl] + ' [' + (kl + 1) + ']' + ', ';
                }
                else if (kl == (queueName.length - 1))
                {
                    temp95 += queueName[kl] + ' [' + (kl + 1) + ']';
                }
            }
            bot.pm(temp95, data.senderid);

        }
        else if (roomDefaults.queue === true)
        {
            bot.pm('The queue is currently empty.', data.senderid);
        }
        else
        {
            bot.pm('There is currently no queue.', data.senderid);
        }
    }
    else if (text.match(/^\/queue$/) && isInRoom === true)
    {
        if (roomDefaults.queue === true && queueName.length !== 0)
        {
            let temp95 = 'The queue is now: ';
            for (let kl = 0; kl < queueName.length; kl++)
            {
                if (kl != (queueName.length - 1))
                {
                    temp95 += queueName[kl] + ', ';
                }
                else if (kl == (queueName.length - 1))
                {
                    temp95 += queueName[kl];
                }
            }
            bot.pm(temp95, data.senderid);

        }
        else if (roomDefaults.queue === true)
        {
            bot.pm('The queue is currently empty.', data.senderid);
        }
        else
        {
            bot.pm('There is currently no queue.', data.senderid);
        }
    }
    else if (text.match(/^\/randomSong$/) && condition === true && isInRoom === true)
    {
        if (randomOnce != 1)
        {
            let ez = 0;
            bot.pm("Reorder initiated.", data.senderid);
            ++randomOnce;
            let reorder = setInterval(function ()
            {
                if (ez <= thisHoldsThePlaylist.length)
                {
                    let nextId = Math.ceil(Math.random() * thisHoldsThePlaylist);
                    bot.playlistReorder(ez, nextId);
                    console.log("Song " + ez + " changed.");
                    ez++;
                }
                else
                {
                    clearInterval(reorder);
                    console.log("Reorder Ended");
                    bot.pm("Reorder completed.", data.senderid);
                    --randomOnce;
                }
            }, 1000);
        }
        else
        {
            bot.pm('error, playlist reordering is already in progress', data.senderid);
        }
    }
    else if (text.match('/bumptop') && condition === true && isInRoom === true)
    {
        if (roomDefaults.queue === true)
        {
            let topOfQueue = data.text.slice(10);
            let index35 = queueList.indexOf(topOfQueue);
            let index46 = queueName.indexOf(topOfQueue);
            let index80 = theUsersList.indexOf(topOfQueue);
            let index81 = theUsersList[index80];
            let index82 = theUsersList[index80 - 1];
            if (index35 != -1 && index80 != -1)
            {
                clearTimeout(beginTimer);
                sayOnce = true;
                queueList.splice(index35, 2);
                queueList.unshift(index81, index82);
                queueName.splice(index46, 1);
                queueName.unshift(index81);
                let temp92 = 'The queue is now: ';
                for (let po = 0; po < queueName.length; po++)
                {
                    if (po != (queueName.length - 1))
                    {
                        temp92 += queueName[po] + ', ';
                    }
                    else if (po == (queueName.length - 1))
                    {
                        temp92 += queueName[po];
                    }
                }
                bot.speak(temp92);
            }
        }
    }
    else if (text.match(/^\/lengthLimit/) && condition === true && isInRoom === true)
    {
        if (LIMIT === true)
        {
            LIMIT = false;
            bot.pm('the song length limit is now inactive', data.senderid);
        }
        else
        {
            LIMIT = true;
            bot.pm('the song length limit is now active', data.senderid);
        }
    }
    else if (text.match(/^\/m/) && condition === true && isInRoom === true)
    {
        bot.speak(text.substring(3));
    }
    else if (text.match(/^\/stage/) && condition === true && isInRoom === true)
    {
        let ban = data.text.slice(8);
        let checkUser = theUsersList.indexOf(ban) - 1;
        if (checkUser != -1)
        {
            bot.remDj(theUsersList[checkUser]);
            condition = false;
        }
    }
    else if (text.match(/^\/botstatus/) && condition === true && isInRoom === true)
    {
        let whatsOn = '';

        if (roomDefaults.queue === true)
        {
            whatsOn += 'queue: On, ';
        }
        else
        {
            whatsOn += 'queue: Off, ';
        }
        if (AFK === true)
        {
            whatsOn += 'dj afk limit: On, ';
        }
        else
        {
            whatsOn += 'dj afk limit: Off, ';
        }
        if (botDefaults.getonstage === true)
        {
            whatsOn += 'autodjing: On, ';
        }
        else
        {
            whatsOn += 'autodjing: Off, ';
        }
        if (EVENTMESSAGE === true)
        {
            whatsOn += 'event message: On, ';
        }
        else
        {
            whatsOn += 'event message: Off, ';
        }
        if (MESSAGE === true)
        {
            whatsOn += 'room message: On, ';
        }
        else
        {
            whatsOn += 'room message: Off, ';
        }
        if (GREET === true)
        {
            whatsOn += 'greeting message: On, ';
        }
        else
        {
            whatsOn += 'greeting message: Off, ';
        }
        if (voteSkip === true)
        {
            whatsOn += 'voteskipping: On, ';
        }
        else
        {
            whatsOn += 'voteskipping: Off, ';
        }
        if (roomAFK === true)
        {
            whatsOn += 'audience afk limit: On, ';
        }
        else
        {
            whatsOn += 'audience afk limit: Off, ';
        }
        if (SONGSTATS === true)
        {
            whatsOn += 'song stats: On, ';
        }
        else
        {
            whatsOn += 'song stats: Off, ';
        }
        if (kickTTSTAT === true)
        {
            whatsOn += 'auto ttstat kick: On, ';
        }
        else
        {
            whatsOn += 'auto ttstat kick: Off, ';
        }
        if (LIMIT === true)
        {
            whatsOn += 'song length limit: On, ';
        }
        else
        {
            whatsOn += 'song length limit: Off, ';
        }
        if (PLAYLIMIT === true)
        {
            whatsOn += 'song play limit: On, ';
        }
        else
        {
            whatsOn += 'song play limit: Off, ';
        }
        if (roomDefaults.isRefreshing === true)
        {
            whatsOn += 'refreshing: On, ';
        }
        else
        {
            whatsOn += 'refreshing: Off, ';
        }
        if (skipOn === true)
        {
            whatsOn += 'autoskipping: On, ';
        }
        else
        {
            whatsOn += 'autoskipping: Off, ';
        }
        if (snagSong === true)
        {
            whatsOn += 'every song adding: On, ';
        }
        else
        {
            whatsOn += 'every song adding: Off, ';
        }
        if (autoSnag === true)
        {
            whatsOn += 'vote based song adding: On, ';
        }
        else
        {
            whatsOn += 'vote based song adding: Off, ';
        }
        if (randomOnce === 0)
        {
            whatsOn += 'playlist reordering in progress?: No';
        }
        else
        {
            whatsOn += 'playlist reordering in progress?: Yes';
        }

        bot.pm(whatsOn, data.senderid);
    }
    else if (text.match(/^\/djplays/) && isInRoom === true)
    {
        if (currentDjs.length !== 0)
        {
            let djsnames = [];
            let djplays = 'dj plays: ';
            for (let i = 0; i < currentDjs.length; i++)
            {
                let djname = theUsersList.indexOf(currentDjs[i]) + 1;
                djsnames.push(theUsersList[djname]);

                if (typeof djs20[currentDjs[i]] == 'undefined' && typeof currentDjs[i] != 'undefined') //if doesn't exist at this point, create it
                {
                    djs20[currentDjs[i]] = {
                        nbSong: 0
                    };
                }

                if (currentDjs[i] != currentDjs[(currentDjs.length - 1)])
                {
                    if (typeof djs20[currentDjs[i]] != 'undefined' && typeof currentDjs[i] != 'undefined') //if doesn't exist at this point, create it
                    {
                        djplays = djplays + djsnames[i] + ': ' + djs20[currentDjs[i]].nbSong + ', ';
                    }
                }
                else
                {
                    if (typeof djs20[currentDjs[i]] != 'undefined' && typeof currentDjs[i] != 'undefined') //if doesn't exist at this point, create it
                    {
                        djplays = djplays + djsnames[i] + ': ' + djs20[currentDjs[i]].nbSong;
                    }
                }
            }

            bot.pm(djplays, data.senderid);
        }
        else if (currentDjs.length === 0)
        {
            bot.pm('There are no dj\'s on stage.', data.senderid);
        }
    }
    else if (text.match('/banstage') && condition === true && isInRoom === true)
    {
        let ban12 = data.text.slice(11);
        let checkBan = stageList.indexOf(ban12);
        let checkUser12 = theUsersList.indexOf(ban12);
        if (checkBan == -1 && checkUser12 != -1)
        {
            stageList.push(theUsersList[checkUser12 - 1], theUsersList[checkUser12]);
            bot.remDj(theUsersList[checkUser12 - 1]);
            condition = false;
        }
    }
    else if (text.match('/unbanstage') && condition === true && isInRoom === true)
    {
        let ban2 = data.text.slice(13);
        index = stageList.indexOf(ban2);
        if (index != -1)
        {
            stageList.splice(stageList[index - 1], 2);
            condition = false;
            index = null;
        }
    }
    else if (text.match('/userid') && condition === true && isInRoom === true)
    {
        let ban86 = data.text.slice(9);
        let checkUser9 = bot.getUserId(ban86, function (data)
        {
            let userid59 = data.userid;
            if (typeof (userid59) !== 'undefined')
            {
                bot.pm(userid59, senderid);
                condition = false;
            }
            else
            {
                bot.pm('I\'m sorry that userid is undefined', senderid);
            }
        });
    }
    else if (text.match('/ban') && condition === true && isInRoom === true)
    {
        let ban17 = data.text.slice(6);
        let checkBan17 = blackList.indexOf(ban17);
        let checkUser17 = theUsersList.indexOf(ban17);
        if (checkBan17 == -1 && checkUser17 != -1)
        {
            blackList.push(theUsersList[checkUser17 - 1], theUsersList[checkUser17]);
            bot.boot(theUsersList[checkUser17 - 1]);
            condition = false;
        }
    }
    else if (text.match('/unban') && condition === true && isInRoom === true)
    {
        let ban20 = data.text.slice(8);
        index = blackList.indexOf(ban20);
        if (index != -1)
        {
            blackList.splice(blackList[index - 1], 2);
            condition = false;
            index = null;
        }
    }
    else if (text.match(/^\/stalk/) && condition === true && isInRoom === true)
    {
        let stalker = text.substring(8);
        bot.getUserId(stalker, function (data6)
        {
            bot.stalk(data6.userid, allInformations = true, function (data4)
            {
                if (data4.success !== false)
                {
                    bot.pm('User found in room: http://turntable.fm/' + data4.room.shortcut, data.senderid);
                }
                else
                {
                    bot.pm('User not found, they may be offline or in the lobby, they may also have just joined a room, or they may not exist', data.senderid);
                }
            });
        });
    }
    else if (text.match(/^\/whobanned$/) && condition === true && isInRoom === true)
    {
        if (blackList.length !== 0)
        {
            bot.pm('ban list: ' + blackList, data.senderid);
        }
        else
        {
            bot.pm('The ban list is empty.', data.senderid);
        }
    }
    else if (text.match(/^\/whostagebanned$/) && condition === true && isInRoom === true)
    {
        if (stageList.length !== 0)
        {
            bot.pm('banned from stage: ' + stageList, data.senderid);
        }
        else
        {
            bot.pm('The banned from stage list is currently empty.', data.senderid);
        }
    }
    else if (data.text == '/stopescortme' && isInRoom === true)
    {
        bot.pm('you will no longer be escorted after you play your song', data.senderid);
        let escortIndex = escortList.indexOf(data.senderid);
        if (escortIndex != -1)
        {
            escortList.splice(escortIndex, 1);
        }
    }
    else if (data.text == '/escortme' && isInRoom === true)
    {
        let djListIndex = currentDjs.indexOf(data.senderid);
        let escortmeIndex = escortList.indexOf(data.senderid);
        if (djListIndex != -1 && escortmeIndex == -1)
        {
            escortList.push(data.senderid);
            bot.pm('you will be escorted after you play your song', data.senderid);
        }
    }
    else if (text.match(/^\/snag/) && condition === true && isInRoom === true)
    {
        if (getSong !== null && thisHoldsThePlaylist !== null)
        {
            let found = false;
            for (let igh = 0; igh < thisHoldsThePlaylist.length; igh++)
            {
                if (thisHoldsThePlaylist[igh]._id == getSong)
                {
                    found = true;
                    bot.pm('I already have that song', data.senderid);
                    break;
                }
            }
            if (!found)
            {
                bot.playlistAdd(getSong, -1); //add song to the end of the playlist
                bot.pm('song added', data.senderid);
                let tempSongHolder = {
                    _id: getSong
                };
                thisHoldsThePlaylist.push(tempSongHolder);
            }
        }
        else
        {
            bot.pm('error, you can\'t snag the song that\'s playing when the bot enters the room', data.senderid);
        }
    }
    else if (text.match(/^\/inform$/) && condition === true && isInRoom === true)
    {
        if (checkWhoIsDj !== null)
        {
            if (informTimer === null)
            {
                let checkDjsName = theUsersList.indexOf(lastdj) + 1;
                bot.speak('@' + theUsersList[checkDjsName] + ' your song is not the appropriate genre for this room, please skip or you will be removed in 20 seconds');
                informTimer = setTimeout(function ()
                {
                    bot.pm('you took too long to skip your song', lastdj);
                    bot.remDj(lastdj);
                    informTimer = null;
                }, 20 * 1000);
            }
            else
            {
                bot.pm('the /inform timer has already been activated, it may be used only once per song', data.senderid);
            }
        }
        else
        {
            bot.pm('you must wait one song since the bot has started to use that command', data.senderid);
        }
    }
    else if (text.match(/^\/removesong$/) && condition === true && isInRoom === true)
    {
        if (checkWhoIsDj == authModule.USERID)
        {
            bot.skip();
            bot.playlistRemove(-1);
            thisHoldsThePlaylist.splice(thisHoldsThePlaylist.length - 1, 1);
            bot.pm('the last snagged song has been removed.', data.senderid);
        }
        else
        {
            thisHoldsThePlaylist.splice(thisHoldsThePlaylist.length - 1, 1);
            bot.playlistRemove(-1);
            bot.pm('the last snagged song has been removed.', data.senderid);
        }
    }
    else if (text.match('/username') && condition === true && isInRoom === true)
    {
        let ban7 = data.text.slice(10);
        let tmp94 = bot.getProfile(ban7, function (data)
        {
            bot.pm(data.name, senderid);
        });
    }
    else if (text.match(/^\/boot/) && condition === true && isInRoom === true) //admin only
    {
        let bootName = data.text.slice(5); //holds their name
        let tempArray = bootName.split(" ");
        let reason = "";
        let whatIsTheirUserid = theUsersList.indexOf(tempArray[1]);
        let theirName = ""; //holds the person's name
        let isNameValid; //if second param is int value this is used to hold name index        


        //if second arg is a number and that number is not a name of someone in the room
        //then that number represents the word length of the name given, which means
        //that they are going to print a message with the boot command
        if (!isNaN(tempArray[1]) && whatIsTheirUserid === -1)
        {
            //if arg given will not produce index of bounds error
            if (tempArray[1] < tempArray.length - 1)
            {
                for (let gj = 2; gj <= (2 + Math.round(tempArray[1])) - 1; gj++)
                {
                    theirName += tempArray[gj] + " ";
                }

                isNameValid = theUsersList.indexOf(theirName.trim()); //find the index

                //if the name you provided was valid
                if (isNameValid !== -1)
                {
                    //get the message                
                    for (let gyj = 2 + Math.round(tempArray[1]); gyj < tempArray.length; gyj++)
                    {
                        reason += tempArray[gyj] + " ";
                    }


                    //if their name is multi word, then a number must be given in order
                    //to know when their name ends and their message begins, however
                    //this command can be used with a multi name word and no message
                    //in which case there would be no reason parameter                   
                    if (reason !== "")
                    {
                        bot.boot(theUsersList[isNameValid - 1], reason);
                    }
                    else
                    {
                        bot.boot(theUsersList[isNameValid - 1]);
                    }
                }
                else
                {
                    bot.pm('sorry but the name you provided was not found in the room', data.senderid);
                }
            }
            else
            {
                bot.pm('error, the number provided must be the number of words that make up the person\'s name', data.senderid);
            }
        } //if their name is just 1 single word and a message is given
        //it comes to here
        else if (tempArray.length > 2 && whatIsTheirUserid !== -1)
        {
            for (let ikp = 2; ikp < tempArray.length; ikp++)
            {
                reason += tempArray[ikp] + " ";
            }

            bot.boot(theUsersList[whatIsTheirUserid - 1], reason);
        }
        //if their name is a single word and no message is given it comes to here
        else if (whatIsTheirUserid !== -1)
        {
            bot.boot(theUsersList[whatIsTheirUserid - 1]);
        }
        else
        {
            bot.pm('error, that user was not found in the room. multi word names must be specified in the command usage, example: /boot 3 first middle last.' +
                ' if the name is only one word long then you do not need to specify its length', data.senderid);
        }
    }
    else if (text.match(/^\/afk/) && isInRoom === true)
    {
        let isUserAfk = theUsersList.indexOf(data.senderid) + 1;
        let isAlreadyAfk = afkPeople.indexOf(theUsersList[isUserAfk]);
        if (isAlreadyAfk == -1)
        {
            if (typeof theUsersList[isUserAfk] == 'undefined')
            {
                bot.pm('failed to add to the afk list, please try the command again', data.senderid);
            }
            else
            {
                bot.pm('you are marked as afk', data.senderid);
                afkPeople.push(theUsersList[isUserAfk]);
            }
        }
        else if (isAlreadyAfk != -1)
        {
            bot.pm('you are no longer afk', data.senderid);
            afkPeople.splice(isAlreadyAfk, 1);
        }
    }
    else if (text.match(/^\/whosafk/) && isInRoom === true)
    {
        if (afkPeople.length !== 0)
        {
            let whosAfk = 'marked as afk: ';
            for (let f = 0; f < afkPeople.length; f++)
            {
                if (f != (afkPeople.length - 1))
                {
                    whosAfk = whosAfk + afkPeople[f] + ', ';
                }
                else
                {
                    whosAfk = whosAfk + afkPeople[f];
                }
            }
            bot.pm(whosAfk, data.senderid);
        }
        else
        {
            bot.pm('No one is currently marked as afk', data.senderid);
        }
    }
    else if (text.match(/^\/commands/) && isInRoom === true)
    {
        bot.pm('the commands are  /awesome, ' +
            '/frankie, /hair, /eddie, /lonely, /jump, /flirt, /rub, /wc, /alice, /feart, /rules, /suggestions, /mom, /cheers, /fanratio @, /whosrefreshing, /refresh, /whatsplaylimit, /warnme, /theme, /up?, /djafk, /mytime, /playlist, /afk, /whosafk, /coinflip, /moon, /hello, /escortme, /stopescortme, /fanme, /unfanme, /roominfo, /beer, /dice, /props, /m, /getTags, ' +
            '/skip, /dive, /dance, /surf, /uptime, /djplays, /admincommands, /queuecommands, /pmcommands', data.senderid);
    }
    else if (text.match(/^\/queuecommands/) && isInRoom === true)
    {
        bot.pm('the commands are /queue, /queuewithnumbers, /position, /removefromqueue @, /removeme, /addme, /move, /queueOn, /queueOff, /bumptop @', data.senderid);
    }
    else if (text.match(/^\/pmcommands/) && condition === true && isInRoom === true) //the moderators see this
    {
        bot.pm('/modpm, /whatsplaylimit, /whosrefreshing, /refreshon, /refreshoff, /warnme, /whosinmodpm, /playlist, /move, /eventmessageOn, /eventmessageOff, /boot, /roominfo, /djafk, /playminus @, /snagevery, /autosnag, /position, /theme, /mytime, /uptime, /m, /stage @, /botstatus, /djplays, /banstage @, /unbanstage @, ' +
            '/userid @, /ban @, /unban @, /stalk @, /whobanned, /whostagebanned, /stopescortme, /escortme, /snag, /inform, ' +
            '/removesong, /username, /afk, /whosafk, /commands, /admincommands', data.senderid);
    }
    else if (text.match(/^\/pmcommands/) && !condition === true && isInRoom === true) //non - moderators see this
    {
        bot.pm('/addme, /whosrefreshing, /whatsplaylimit, /warnme, /removeme, /djafk, /position, /dive, /getTags, /roominfo, /awesome, ' + '/theme, /mytime, /uptime, /queue, /djplays, /stopescortme, /escortme, /afk, ' + '/whosafk, /commands, /queuecommands', data.senderid);
    }
    else if (text.match(/^\/admincommands/) && condition === true && isInRoom === true)
    {
        bot.pm('the mod commands are /ban @, /whosinmodpm, /refreshon, /refreshoff, /unban @, /eventmessageOn, /eventmessageOff, /boot, /move, /playminus @, /snagevery, /autosnag, /skipon, /playLimitOn, /playLimitOff, /skipoff, /stalk @, /lengthLimit, /setTheme, /noTheme, /stage @, /randomSong, /messageOn, /messageOff, /afkon, /afkoff, /skipsong, /autodj, /removedj, /lame, ' +
            '/snag, /botstatus, /removesong, /voteskipon #, /voteskipoff, /greeton, /greetoff, /getonstage, /banstage @, /unbanstage @, /userid @, /inform, ' +
            '/whobanned, /whostagebanned, /roomafkon, /roomafkoff, /songstats, /username, /modpm', data.senderid);
        condition = false;
    }
});



//starts up when bot first enters the room
bot.on('roomChanged', function (data)
{
    try
    {
        //reset arrays in case this was triggered by the bot restarting   
        escortList = [];
        theUsersList = [];
        modList = [];
        currentDjs = [];
        userIds = [];
        queueList = [];
        queueName = [];
        people = [];
        myTime = [];
        afkPeople = [];
        lastSeen = {};
        lastSeen1 = {};
        lastSeen2 = {};
        lastSeen3 = {};
        lastSeen4 = {};
        djs20 = [];
        warnme = [];
        modpm = [];


        //set information 
        detail = data.room.description; //used to get room description
        roomName = data.room.name; //gets your rooms name
        ttRoomName = data.room.shortcut; //gets room shortcut


        //load the playlist into memory
        bot.playlistAll(function (callback)
        {
            thisHoldsThePlaylist = callback.list;
        });


        //only set begintime if it has not already been set
        if (beginTime === null)
        {
            beginTime = Date.now(); //the time the bot entered the room at
        }


        //finds out who the currently playing dj's are.    
        for (let iop = 0; iop < data.room.metadata.djs.length; iop++)
        {
            if (typeof data.room.metadata.djs[iop] !== 'undefined')
            {
                currentDjs.push(data.room.metadata.djs[iop]);
                djs20[data.room.metadata.djs[iop]] = { //set dj song play count to zero
                    nbSong: 0
                };
                justSaw(data.room.metadata.djs[iop], 'justSaw'); //initialize dj afk count
                justSaw(data.room.metadata.djs[iop], 'justSaw1');
                justSaw(data.room.metadata.djs[iop], 'justSaw2');
            }
        }


        //set modlist to list of moderators
        //modList = data.room.metadata.moderator_id;
        for (let ihp = 0; ihp < data.room.metadata.moderator_id.length; ihp++)
        {
            modList.push(data.room.metadata.moderator_id[ihp]);
        }


        //used to get user names and user id's      
        for (let i = 0; i < data.users.length; i++)
        {
            if (typeof data.users[i] !== 'undefined')
            {
                theUsersList.push(data.users[i].userid, data.users[i].name);
                userIds.push(data.users[i].userid);
            }
        }


        //sets everyones spam count to zero 
        //puts people on the global afk list when it joins the room 
        for (let z = 0; z < userIds.length; z++)
        {
            if (typeof userIds[z] !== 'undefined')
            {
                people[userIds[z]] = {
                    spamCount: 0
                };
                justSaw(userIds[z], 'justSaw3');
                justSaw(userIds[z], 'justSaw4');
            }
        }


        //starts time in room for everyone currently in the room
        for (let zy = 0; zy < userIds.length; zy++)
        {
            if (typeof userIds[zy] !== 'undefined')
            {
                myTime[userIds[zy]] = Date.now();
            }
        }
    }
    catch (err)
    {
        if (typeof errorMessage === 'string')
        {
            console.log('unable to join the room the room due to: ' + errorMessage);
        }
        else
        {
            console.log('unable to join the room the room due to: ' + err);
        }
    }
});



//starts up when a new person joins the room
bot.on('registered', function (data)
{
    //if there are 5 dj's on stage and the queue is turned on when a user enters the room
    if (roomDefaults.queue === true && currentDjs.length == 5)
    {
        bot.pm('The queue is currently active. To add yourself to the queue type /addme. To remove yourself from the queue type /removeme.', data.user[0].userid);
    }


    //gets newest user and prints greeting, does not greet the bot or the ttstats bot, or banned users
    let roomjoin = data.user[0];
    let areTheyBanned = blackList.indexOf(data.user[0].userid);
    let areTheyBanned2 = userDefaults.bannedUsers.indexOf(data.user[0].userid);
    if (GREET === true && data.user[0].userid != authModule.USERID && !data.user[0].name.match('@ttstat'))
    {
        if (areTheyBanned == -1 && areTheyBanned2 == -1)
        {
            if (greetingTimer[data.user[0].userid] !== null)
            {
                clearTimeout(greetingTimer[data.user[0].userid]);
                greetingTimer[data.user[0].userid] = null;
            }
            greetingTimer[data.user[0].userid] = setTimeout(function ()
            {
                greetingTimer[data.user[0].userid] = null;
                if ( roomDefaults.roomJoinMessage !== '') //if your not using the default greeting
                {
                    if (THEME === false) //if theres no theme this is the message.
                    {
                        if (greetThroughPm === false) //if your not sending the message through the pm
                        {
                            bot.speak('@' + roomjoin.name + ', ' +  roomDefaults.roomJoinMessage);
                        }
                        else
                        {
                            bot.pm( roomDefaults.roomJoinMessage, roomjoin.userid);
                        }
                    }
                    else
                    {
                        if (greetThroughPm === false)
                        {
                            bot.speak('@' + roomjoin.name + ', ' +  roomDefaults.roomJoinMessage + '; The theme is currently set to: ' + whatIsTheme);
                        }
                        else
                        {
                            bot.pm( roomDefaults.roomJoinMessage + '; The theme is currently set to: ' + whatIsTheme, roomjoin.userid);
                        }
                    }
                }
                else
                {
                    if (THEME === false) //if theres no theme this is the message.
                    {
                        if (greetThroughPm === false)
                        {
                            bot.speak('Welcome to ' + roomName + ' @' + roomjoin.name + ', enjoy your stay!');
                        }
                        else
                        {
                            bot.pm('Welcome to ' + roomName + ' @' + roomjoin.name + ', enjoy your stay!', roomjoin.userid);
                        }
                    }
                    else
                    {
                        if (greetThroughPm === false)
                        {
                            bot.speak('Welcome to ' + roomName + ' @' + roomjoin.name + ', the theme is currently set to: ' + whatIsTheme);
                        }
                        else
                        {
                            bot.pm('Welcome to ' + roomName + ' @' + roomjoin.name + ', the theme is currently set to: ' + whatIsTheme, roomjoin.userid);
                        }
                    }
                }
                delete greetingTimer[data.user[0].userid];
            }, 3 * 1000);
        }
    }


    //starts time for everyone that joins the room
    myTime[data.user[0].userid] = Date.now();


    //sets new persons spam count to zero
    people[data.user[0].userid] = {
        spamCount: 0
    };


    //adds users who join the room to the user list if their not already on the list
    let checkList = theUsersList.indexOf(data.user[0].userid);
    if (checkList == -1)
    {
        if (typeof data.user[0] !== 'undefined')
        {
            theUsersList.push(data.user[0].userid, data.user[0].name);
        }
    }


    //checks to see if user is on the banlist, if they are they are booted from the room.
    for (let i = 0; i < blackList.length; i++)
    {
        if (roomjoin.userid == blackList[i])
        {
            bot.bootUser(roomjoin.userid, 'You are on the banlist.');
            break;
        }
    }


    //checks manually added users
    for (let z = 0; z < userDefaults.bannedUsers.length; z++)
    {
        if (userDefaults.bannedUsers[z].match(roomjoin.userid))
        {
            bot.bootUser(roomjoin.userid, 'You are on the banlist.');
            break;
        }
    }


    //puts people who join the room on the global afk list
    if (roomAFK === true)
    {
        justSaw(data.user[0].userid, 'justSaw3');
        justSaw(data.user[0].userid, 'justSaw4');
    }


    //this kicks the ttstats bot
    if (kickTTSTAT === true)
    {
        if (data.user[0].name.match('@ttstat'))
        {
            bot.boot(data.user[0].userid);
        }
    }
});



bot.on('update_user', function (data)
{
    if (typeof data.name === 'string')
    {
        let oldname = ''; //holds users old name if exists
        let queueNamePosition;
        let queueListPosition;
        let afkPeoplePosition;

        //when when person updates their profile
        //and their name is not found in the users list then they must have changed
        //their name   
        if (theUsersList.indexOf(data.name) === -1)
        {
            let nameIndex = theUsersList.indexOf(data.userid);
            if (nameIndex !== -1) //if their userid was found in theUsersList
            {
                oldname = theUsersList[nameIndex + 1];
                theUsersList[nameIndex + 1] = data.name;

                if (typeof oldname !== 'undefined')
                {
                    queueNamePosition = queueName.indexOf(oldname);
                    queueListPosition = queueList.indexOf(oldname);
                    afkPeoplePosition = afkPeople.indexOf(oldname);


                    if (queueNamePosition !== -1) //if they were in the queue when they changed their name, then replace their name
                    {
                        queueName[queueNamePosition] = data.name;
                    }

                    if (queueListPosition !== -1) //this is also for the queue
                    {
                        queueList[queueListPosition] = data.name;
                    }

                    if (afkPeoplePosition !== -1) //this checks the afk list
                    {
                        afkPeople[afkPeoplePosition] = data.name;
                    }
                }
            }
        }
    }
})



//updates the moderator list when a moderator is added.
bot.on('new_moderator', function (data)
{
    let test50 = modList.indexOf(data.userid);
    if (test50 == -1)
    {
        modList.push(data.userid);
    }
})



//updates the moderator list when a moderator is removed.
bot.on('rem_moderator', function (data)
{
    let test51 = modList.indexOf(data.userid);
    modList.splice(test51, 1);
})



//starts up when a user leaves the room
bot.on('deregistered', function (data)
{
    //removes dj's from the lastSeen object when they leave the room
    delete lastSeen[data.user[0].userid];
    delete lastSeen1[data.user[0].userid];
    delete lastSeen2[data.user[0].userid];
    delete lastSeen3[data.user[0].userid];
    delete lastSeen4[data.user[0].userid];
    delete people[data.user[0].userid];
    delete timer[data.user[0].userid];
    delete myTime[data.user[0].userid];


    //double check to make sure that if someone is on stage and they disconnect, that they are being removed
    //from the current Dj's array
    let checkIfStillInDjArray = currentDjs.indexOf(data.user[0].userid);
    if (checkIfStillInDjArray != -1)
    {
        currentDjs.splice(checkIfStillInDjArray, 1);
    }


    //removes people who leave the room from the afk list
    if (afkPeople.length !== 0)
    {
        let userName = data.user[0].name;
        let checkUserName = afkPeople.indexOf(data.user[0].name);
        if (checkUserName != -1)
        {
            afkPeople.splice(checkUserName, 1);
        }
    }


    //removes people leaving the room in modpm still
    if (modpm.length !== 0)
    {
        let areTheyStillInModpm = modpm.indexOf(data.user[0].userid);

        if (areTheyStillInModpm != -1)
        {
            let whatIsTheirName = theUsersList.indexOf(data.user[0].userid);
            modpm.splice(areTheyStillInModpm, 1);

            if (whatIsTheirName !== -1)
            {
                for (let hg = 0; hg < modpm.length; hg++)
                {
                    if (typeof modpm[hg] !== 'undefined' && modpm[hg] != data.user[0].userid)
                    {
                        bot.pm(theUsersList[whatIsTheirName + 1] + ' has left the modpm chat', modpm[hg]);
                    }
                }
            }
        }
    }


    //updates the users list when a user leaves the room.
    let user = data.user[0].userid;
    let checkLeave = theUsersList.indexOf(data.user[0].userid);
    let checkUserIds = userIds.indexOf(data.user[0].userid);

    if (checkLeave != -1 && checkUserIds != -1)
    {
        theUsersList.splice(checkLeave, 2);
        userIds.splice(checkUserIds, 1);
    }
})



//activates at the end of a song.
bot.on('endsong', function (data)
{
    //bot says song stats for each song
    if (SONGSTATS === true)
    {
        bot.speak('Stats for ' + song + ' by ' + artist + ': ' + ':thumbsup:' + upVotes + ':thumbsdown:' + downVotes + ':heart:' + whoSnagged);
    }


    //iterates through the dj list incrementing dj song counts and
    //removing them if they are over the limit.
    let djId = data.room.metadata.current_dj;

    if (typeof (djs20[djId]) !== 'undefined' && typeof djId != 'undefined')
    {
        if (++djs20[djId].nbSong >= roomDefaults.playLimit)
        {
            if (PLAYLIMIT === true) //is playlimit on?
            {
                if (djId == currentDjs[0] && roomDefaults.playLimit === 1) //if person is in the far left seat and limit is set to one
                {
                    let checklist33 = theUsersList.indexOf(djId) + 1;

                    if (checklist33 !== -1)
                    {
                        bot.speak('@' + theUsersList[checklist33] + ' you are over the playlimit of ' + roomDefaults.playLimit + ' song');
                    }

                    bot.remDj(djId);
                }
                else if (djId != authModule.USERID && roomDefaults.playLimit !== 1) //if limit is more than one
                {
                    let checklist33 = theUsersList.indexOf(djId) + 1;

                    if (checklist33 !== -1)
                    {
                        bot.speak('@' + theUsersList[checklist33] + ' you are over the playlimit of ' + roomDefaults.playLimit + ' songs');
                    }

                    bot.remDj(djId);
                }
            }
        }
    }


    //iterates through the escort list and escorts all djs on the list off the stage.     
    for (let i = 0; i < escortList.length; i++)
    {
        if (typeof escortList[i] !== 'undefined' && data.room.metadata.current_dj == escortList[i])
        {
            let lookname = theUsersList.indexOf(data.room.metadata.current_dj) + 1;
            bot.remDj(escortList[i]);

            if (lookname !== -1)
            {
                bot.speak('@' + theUsersList[lookname] + ' had enabled escortme');
            }

            let removeFromList = escortList.indexOf(escortList[i]);

            if (removeFromList !== -1)
            {
                escortList.splice(removeFromList, 1);
            }
        }
    }
});
