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
let musicDefaults = require('./defaultSettings/musicDefaults.js');

let botModule = require('./modules/botModule.js');
let afkModule = require('./modules/afkModule.js');
let moderatorModule = require('./modules/moderatorModule.js');
let userModule = require('./modules/userModule.js');
let roomModule = require('./modules/roomModule.js');
let chatModule = require('./modules/chatModule.js');
let songModule = require('./modules/songModule.js');
/************************************EndSetUp**********************************************************************/

//do not change the values of any of the global variables below unless you know what you are doing, the discriptions given are for reference only

let spamLimit = 3; //number of times a user can spam being kicked off the stage within 10 secs
let myId = null; //the userid of the person using the /fanme command, speak event only
let detail = null; //the discription given in the "room" tab of the room that the bot is in
let current = null; //the number of dj's on stage, gets reset every song
let name = null; //the name of the person using the person who activated the speak event
let condition = null; //is the person using a command a moderator? true or false
let index = null; //the index returned when using unban commands
let skipOn = null; //if true causes the bot to skip every song it plays, toggled on and off by commands
let checkWhoIsDj = null; //the userid of the currently playing dj
let randomOnce = 0; //a flag used to check if the /randomSong command has already been activated, 0 is no, 1 is yes
let sayOnce = true; //makes it so that the queue timeout can only be used once per per person, stops the bot from spamming
let informTimer = null; //holds the timeout for the /inform command, null lets it know that it hasn't already been set
let beginTime = null; //the current time in milliseconds when the bot has started, used for the /uptime
let endTime = null; //the current time in milliseconds when the /uptime is actually used
let messageCounter = 0; //this is for the array of messages, it lets it know which message it is currently on, resets to 0 after cycling through all of them
let netwatchdogTimer = null; // Used to detect internet connection dropping out
let attemptToReconnect = null; //used for reconnecting to the bots room if its not in there (only works if internet connection is working)
let returnToRoom = true; //used to toggle on and off the bot reconnecting to its room(it toggles off when theres no internet connection because it only works when its connected to turntable.fm)
let wserrorTimeout = null; //this is for the setTimeout in ws error
let bannedArtistsMatcher; //holds the regular expression for banned artist / song matching
let autoDjingTimer = null; //governs the timer for the bot's auto djing

global.playLimitOfRefresher = []; //holds a copy of the number of plays for people who have used the /refresh command
global.refreshList = []; //this holds the userid's of people who have used the /refresh command
global.refreshTimer = []; //this holds the timers of people who have used the /refresh command
global.warnme = []; //holds the userid's of everyone using the /warnme feature
global.djs20 = []; //holds the song count that each of the dj's on stage have played
global.stageList = []; //holds the userid of everyone who is in the command based banned from stage list
global.checkVotes = []; //holds the userid's of everyone who has voted for the currently playing song to be skipped, is cleared every song
global.escortList = []; //holds the userid of everyone who has used the /escortme command, auto removed when the person leaves the stage
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

setInterval(botModule.checkIfConnected(bot), 5000);

//whichFunction represents which justSaw object do you want to access
//num is the time in minutes till afk timeout
//userid is the person's userid
global.isAfk = function (userId, num, whichFunction)
{
    let last;
//which last seen object to use?
    switch (whichFunction)
    {
    case 'isAfk':
        last = userModule.lastSeen[userId];
        break;
    case 'isAfk1':
        last = userModule.lastSeen1[userId];
        break;
    case 'isAfk2':
        last = userModule.lastSeen2[userId];
        break;
    case 'isAfk3':
        last = userModule.lastSeen3[userId];
        break;
    case 'isAfk4':
        last = userModule.lastSeen4[userId];
        break;
    }

    let age_ms = Date.now() - last;
    let age_m = Math.floor(age_ms / 1000 / 60);
    return age_m >= num;

};



//removes afk dj's after roomDefaultsModule.afkLimit is up.
global.afkCheck = function ()
{
    for (let i = 0; i < userModule.currentDJs.length; i++)
    {
        afker = userModule.currentDJs[i]; //Pick a DJ
        let isAfkMaster = userModule.masterIds.indexOf(afker); //master ids check
        let whatIsAfkerName = userModule.theUsersList.indexOf(afker) + 1;
        if ((isAfk(afker, (afkModule.afkLimit - 5), 'isAfk1')) && afkModule.AFK === true)
        {
            if (afker !== authModule.USERID && isAfkMaster === -1)
            {
                if (roomDefaults.afkThroughPm === false)
                {
                    bot.speak('@' + userModule.theUsersList[whatIsAfkerName] + ' you have 5 minutes left of afk, chat or awesome please.');
                }
                else
                {
                    bot.pm('you have 5 minutes left of afk, chat or awesome please.', afker);
                }
                afkModule.justSaw(afker, 'justSaw1');
            }
        }
        if ((isAfk(afker, (afkModule.afkLimit - 1), 'isAfk2')) && afkModule.AFK === true)
        {
            if (afker !== authModule.USERID && isAfkMaster === -1)
            {
                if (roomDefaults.afkThroughPm === false)
                {
                    bot.speak('@' + theUsersList[whatIsAfkerName] + ' you have 1 minute left of afk, chat or awesome please.');
                }
                else
                {
                    bot.pm('you have 1 minute left of afk, chat or awesome please.', afker);
                }
                afkModule.justSaw(afker, 'justSaw2');
            }
        }
        if ((isAfk(afker, afkModule.afkLimit, 'isAfk')) && afkModule.AFK === true)
        { //if Dj is afk then
            if (afker !== authModule.USERID && isAfkMaster === -1) //checks to see if afker is a mod or a bot or the current dj, if they are is does not kick them.
            {
                if (afker !== checkWhoIsDj)
                {
                    if (roomDefaults.afkThroughPm === false)
                    {
                        bot.speak('@' + theUsersList[whatIsAfkerName] + ' you are over the afk limit of ' + afkModule.afkLimit + ' minutes.');
                    }
                    else
                    {
                        bot.pm('you are over the afk limit of ' + afkModule.afkLimit + ' minutes.', afker);
                    }
                    afkModule.justSaw(afker, 'justSaw1');
                    afkModule.justSaw(afker, 'justSaw2');
                    afkModule.justSaw(afker, 'justSaw');
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
    for (let i = 0; i < userModule.userIDs.length; i++)
    {
        let afker2 = userModule.userIDs[i]; //Pick a DJ
        let isAfkMod = moderatorModule.modList.indexOf(afker2);
        let isDj = userModule.currentDJs.indexOf(afker2);
        if ((isAfk(afker2, ( afkModule.roomafkLimit - 1), 'isAfk3')) && afkModule.roomAFK === true)
        {

            if (afker2 !== authModule.USERID && isDj === -1 && isAfkMod === -1)
            {
                bot.pm('you have 1 minute left of afk, chat or awesome please.', afker2);
                afkModule.justSaw(afker2, 'justSaw3');
            }
        }
        if ((isAfk(afker2,  afkModule.roomafkLimit, 'isAfk4')) && afkModule.roomAFK === true)
        { //if person is afk then
            if (afker2 !== authModule.USERID && isAfkMod === -1) //checks to see if afker is a mod or a bot or a dj, if they are is does not kick them.
            {
                if (isDj === -1)
                {
                    bot.pm('you are over the afk limit of ' +  afkModule.roomafkLimit + ' minutes.', afker2);
                    bot.boot(afker2, 'you are over the afk limit');
                    afkModule.justSaw(afker2, 'justSaw3');
                    afkModule.justSaw(afker2, 'justSaw4');
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
    if (roomDefaults.queue === true && userModule.queueList.length !== 0)
    {
        if (sayOnce === true && (refreshList.length + userModule.currentDJs.length) < 5)
        {
            sayOnce = false;
            if (( botDefaults.howLongStage / 60) < 1) //is it seconds
            {
                bot.speak('@' + userModule.queueName[0] + ' you have ' +  botDefaults.howLongStage + ' seconds to get on stage.');
            }
            else if (( botDefaults.howLongStage / 60) === 1) //is it one minute
            {
                let minute = Math.floor(( botDefaults.howLongStage / 60));
                bot.speak('@' + userModule.queueName[0] + ' you have ' + minute + ' minute to get on stage.');
            }
            else if (( botDefaults.howLongStage / 60) > 1) //is it more than one minute
            {
                let minutes = Math.floor(( botDefaults.howLongStage / 60));
                bot.speak('@' + userModule.queueName[0] + ' you have ' + minutes + ' minutes to get on stage.');
            }
            beginTimer = setTimeout(function ()
            {
                userModule.queueList.splice(0, 2);
                userModule.queueName.splice(0, 1);
                sayOnce = true;
            },  botDefaults.howLongStage * 1000); //timeout variably set
        }
    }
}

setInterval(queueCheck15, 5000) //repeats the check every five seconds.



vipListCheck = function ()
{
    //this kicks all users off stage when the vip list is not empty
    if (userModule.vipList.length !== 0 && userModule.currentDJs.length !== userModule.vipList.length)
    {
        for (let p = 0; p < userModule.currentDJs.length; p++)
        {
            let checkIfVip = userModule.vipList.indexOf(userModule.currentDJs[p]);
            if (checkIfVip === -1 && userModule.currentDJs[p] !== authModule.USERID)
            {
                bot.remDj(userModule.currentDJs[p]);
            }
        }
    }
}

setInterval(vipListCheck, 5000) //repeats the check every five seconds.



//this is for the event messages array
global.eventMessagesIterator = function ()
{
    if (roomDefaults.EVENTMESSAGE === true && roomDefaults.eventMessages.length !== 0)
    {
        if (messageCounter === roomDefaults.eventMessages.length)
        {
            messageCounter = 0; //if end of event messages array reached, reset counter
        }

        if (roomDefaults.eventMessageThroughPm === false) //if set to send messages through chatbox, do so
        {
            bot.speak(roomDefaults.eventMessages[messageCounter] + "");
        }
        else //else send message through pm
        {
            for (let jio = 0; jio < userModule.userIDs.length; jio++)
            {
                bot.pm(roomDefaults.eventMessages[messageCounter] + "", userModule.userIDs[jio]);
            }
        }

        ++messageCounter; //increment message counter
    }
}

setInterval(eventMessagesIterator, roomDefaults.eventMessageRepeatTime * 60 * 1000) //repeats check



repeatMessage = function ()
{
    if (roomDefaults.MESSAGE === true && typeof detail !== 'undefined')
    {
        if (roomDefaults.repeatMessageThroughPm === false) //if not doing through the pm
        {
            if (roomDefaults.defaultMessage === true) //if using default message
            {
                bot.speak('Welcome to ' + roomDefaults.roomName + ', ' + detail); //set the message you wish the bot to repeat here i.e rules and such.
            }
            else
            {
                bot.speak('' + detail);
            }
        }
        else
        {
            if (roomDefaults.defaultMessage === true)
            {
                for (let jkl = 0; jkl < userModule.userIDs.length; jkl++)
                {
                    bot.pm('Welcome to ' + roomDefaults.roomName + ', ' + detail, userModule.userIDs[jkl]); //set the message you wish the bot to repeat here i.e rules and such.
                }
            }
            else
            {
                for (let lkj = 0; lkj < userModule.userIDs.length; lkj++)
                {
                    bot.pm('' + detail, userModule.userIDs[lkj]); //set the message you wish the bot to repeat here i.e rules and such.
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
                if (userModule.theUsersList.length !== (data.users.length * 2))
                {
                    theUsersListOkay = false;
                }

                //only run this test if it passed the first one
                if (theUsersListOkay)
                {
                    //if any undefined values are found
                    for (let i = 0; i < userModule.theUsersList.length; i++)
                    {
                        if (typeof userModule.theUsersList[i] === 'undefined')
                        {
                            theUsersListOkay = false;
                            break;
                        }
                    }
                }

                //if data got corrupted then rebuild theUsersList array
                if (!theUsersListOkay)
                {
                    userModule.theUsersList = [];

                    for (let i = 0; i < data.users.length; i++)
                    {
                        if (typeof data.users[i] !== 'undefined')
                        {
                            //userid then the name
                            userModule.theUsersList.push(data.users[i].userid, data.users[i].name);
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
        let isBotAlreadyOnStage = userModule.currentDJs.indexOf(authModule.USERID);

        if (isBotAlreadyOnStage === -1) //if the bot is not already on stage
        {
            if (userModule.currentDJs.length >= 1 && userModule.currentDJs.length <=  botDefaults.whenToGetOnStage && userModule.queueList.length === 0)
            {
                if (botDefaults.getonstage === true && userModule.vipList.length === 0 && refreshList.length === 0)
                {
                    bot.addDj();
                }
            }
        }
        else //else it is on stage
        {
            if (userModule.currentDJs.length >=  botDefaults.whenToGetOffStage && botDefaults.getonstage === true && checkWhoIsDj !== authModule.USERID)
            {
                bot.remDj();
            }
        }
    }, 1000 * 10); //delay for 10 seconds
};



//adds a song to the end of the bots queue if it is not already contained in the bots queue
global.addSongIfNotAlreadyInPlaylist = function (bool)
{
    if (roomDefaults.thisHoldsThePlaylist !== null && songModule.getSong !== null)
    {
        let found = false;
        for (let igh = 0; igh < roomDefaults.thisHoldsThePlaylist.length; igh++)
        {
            if (roomDefaults.thisHoldsThePlaylist[igh]._id === songModule.getSong)
            {
                found = true;
                break;
            }
        }
        if (!found)
        {
            bot.playlistAdd(songModule.getSong, -1); //add song to the end of the playlist
            let tempSongHolder = {
                _id: songModule.getSong
            };
            roomDefaults.thisHoldsThePlaylist.push(tempSongHolder);

            if (bool) //whether the bot will show the heart animation or not
            {
                bot.snag();
            }
        }
    }
};



global.warnMeCall = function ()
{
    if (warnme.length !== 0) //is there anyone in the warnme?
    {
        let whatIsPosition = userModule.currentDJs.indexOf(checkWhoIsDj); //what position are they

        if (whatIsPosition === userModule.currentDJs.length - 1) //if 5th dj is playing, check guy on the left
        {
            let areTheyNext = warnme.indexOf(userModule.currentDJs[0]);
            if (areTheyNext !== -1) //is the next dj up in the warnme?
            {
                bot.pm('your song is up next!', userModule.currentDJs[0]);
                warnme.splice(areTheyNext, 1);

            }
        }
        else
        {
            let areTheyNext = warnme.indexOf(userModule.currentDJs[whatIsPosition + 1]);
            if (areTheyNext !== -1) //is the next dj up in the warnme?
            {
                bot.pm('your song is up next!', userModule.currentDJs[whatIsPosition + 1]);
                warnme.splice(areTheyNext, 1);

            }
        }
    }
}



//checks to see if a command user is contained within the moderator list or not
global.checkIfUserIsMod = function (userid)
{
    let modIndex = moderatorModule.modList.indexOf(userid);

    condition = modIndex !== -1;
};



//makes sure the person who pmmed the bot a command is in the room
global.checkToseeIfPmmerIsInRoom = function (userid)
{
    let isInRoom = userModule.theUsersList.indexOf(userid);

    isInRoom = isInRoom !== -1;

    return isInRoom;
};



//increments a persons spam counter when they get kicked off stage for some reason
//after 10 seconds if it has not just been incremented then the counter is reset
global.incrementSpamCounter = function (userid)
{
    if (typeof userModule.people[userid] != 'undefined')
    {
        ++userModule.people[userid].spamCount;
    }

    if (userModule.timer[userid] !== null)
    {
        clearTimeout(userModule.timer[userid]);
        userModule.timer[userid] = null;
    }

    userModule.timer[userid] = setTimeout(function ()
    {
        userModule.people[userid] = {
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
            tempArray.push(musicDefaults.bannedArtists[i].replace(/([-[\]{}()*^=!:+?.,\\$|#\s])/g, "\\$1"));
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

        if (typeof userModule.theUsersList[userModule.theUsersList.indexOf(lastdj) + 1] !== 'undefined')
        {
            bot.speak("@" + userModule.theUsersList[userModule.theUsersList.indexOf(lastdj) + 1] + ", Thanks buddy ;-)");
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

        if (typeof userModule.theUsersList[userModule.theUsersList.indexOf(lastdj) + 1] !== 'undefined')
        {
            bot.speak("@" + userModule.theUsersList[userModule.theUsersList.indexOf(lastdj) + 1] + ", Thanks buddy ;-)");
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

        if (typeof userModule.theUsersList[userModule.theUsersList.indexOf(lastdj) + 1] !== 'undefined')
        {
            bot.speak("@" + userModule.theUsersList[userModule.theUsersList.indexOf(lastdj) + 1] + ", Thanks buddy ;-)");
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
    masterIndex = userModule.masterIds.indexOf(lastdj); //master id's check


    // Set a new watchdog timer for the current song.
    curSongWatchdog = setTimeout(function ()
    {
        curSongWatchdog = null;

        if (typeof userModule.theUsersList[userModule.theUsersList.indexOf(lastdj) + 1] !== 'undefined')
        {
            bot.speak("@" + userModule.theUsersList[userModule.theUsersList.indexOf(lastdj) + 1] + ", you have 20 seconds to skip your stuck song before you are removed");
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
        if (lastdj === authModule.USERID || masterIndex === -1) //if dj is the bot or not a master
        {
            if (musicDefaults.LIMIT === true)
            {
                if (typeof userModule.theUsersList[userModule.theUsersList.indexOf(lastdj) + 1] !== 'undefined')
                {
                    bot.speak("@" + userModule.theUsersList[userModule.theUsersList.indexOf(lastdj) + 1] + ", your song is over " + roomDefaults.songLengthLimit + " mins long, you have 20 seconds to skip before being removed.");
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
    // bot.speak("entered newsong");

    //resets counters and array for vote skipping
    songModule.resetCheckVotes();
    songModule.resetVoteCountSkip();
    songModule.resetVotesLeft(roomDefaults.HowManyVotesToSkip);
    songModule.resetWhoSnagged();
    songModule.resetUpVotes();
    songModule.resetDownVotes();
    songModule.resetVoteSnagging();


    //procedure for getting song tags
    songModule.getSongTags(data.room.metadata.current_song)

    //set information
    current = data.room.metadata.djcount; //the number of dj's on stage
    detail = data.room.description; //set room description again in case it was changed
    checkWhoIsDj = data.room.metadata.current_dj; //used to check who the currently playing dj is.


    //adds a song to the end of your bots queue
    if (songModule.snagSong === true)
    {
        addSongIfNotAlreadyInPlaylist(false);
    }


    //if true causes the bot to start bopping to the currently playing song
    if (botDefaults.autoBop === true)
    {
        // bot.speak('autoBop: ' + botDefaults.autoBop);
        bot.bop();
    }


    //check to see if conditions are met for bot's autodjing feature
    autoDjing();


    //if the bot is the only one on stage and they are skipping their songs
    //they will stop skipping
    if (current === 1 && checkWhoIsDj === authModule.USERID && skipOn === true)
    {
        skipOn = false;
    }


    //used to have the bot skip its song if its the current player and skipOn command was used
    if (authModule.USERID === checkWhoIsDj && skipOn === true)
    {
        bot.skip();
    }


    //this is for /warnme
    warnMeCall();


    //removes current dj from stage if they play a banned song or artist.
    if (musicDefaults.bannedArtists.length !== 0 && typeof songModule.artist !== 'undefined' && typeof songModule.song !== 'undefined')
    {
        let checkIfAdmin = userModule.masterIds.indexOf(checkWhoIsDj); //is user an exempt admin?
        let nameDj = userModule.theUsersList.indexOf(checkWhoIsDj) + 1; //the currently playing dj's name

        if (checkIfAdmin === -1)
        {
            //if matching is enabled for both songs and artists
            if (musicDefaults.matchArtists && musicDefaults.matchSongs)
            {
                if (songModule.artist.match(bannedArtistsMatcher) || song.match(bannedArtistsMatcher))
                {
                    bot.remDj(checkWhoIsDj);

                    if (typeof userModule.theUsersList[nameDj] !== 'undefined')
                    {
                        bot.speak('@' + userModule.theUsersList[nameDj] + ' you have played a banned track or artist.');
                    }
                    else
                    {
                        bot.speak('current dj, you have played a banned track or artist.');
                    }
                }
            }
            else if (musicDefaults.matchArtists) //if just artist matching is enabled
            {
                if (songModule.artist.match(bannedArtistsMatcher))
                {
                    bot.remDj(checkWhoIsDj);

                    if (typeof userModule.theUsersList[nameDj] !== 'undefined')
                    {
                        bot.speak('@' + userModule.theUsersList[nameDj] + ' you have played a banned artist.');
                    }
                    else
                    {
                        bot.speak('current dj, you have played a banned artist.');
                    }
                }
            }
            else if (musicDefaults.matchSongs) //if just song matching is enabled
            {
                if (songModule.song.match(bannedArtistsMatcher))
                {
                    bot.remDj(checkWhoIsDj);

                    if (typeof userModule.theUsersList[nameDj] !== 'undefined')
                    {
                        bot.speak('@' + userModule.theUsersList[nameDj] + ' you have played a banned track.');
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
    if (data.room.metadata.djcount !== userModule.currentDJs.length)
    {
        userModule.currentDJs = []; //reset current djs array

        for (let hjg = 0; hjg < data.room.metadata.djcount; hjg++)
        {
            if (typeof data.room.metadata.djs[hjg] !== 'undefined')
            {
                userModule.currentDJs.push(data.room.metadata.djs[hjg]);
            }
        }
    }
});



//bot gets on stage and starts djing if no song is playing.
bot.on('nosong', function (data)
{
    if (botDefaults.getonstage === true && userModule.vipList.length === 0 && userModule.queueList.length === 0 && refreshList.length === 0)
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
    botModule.recordActivity();

    checkIfUserIsMod(data.userid); //check to see if speaker is a moderator or not

    afkModule.updateAfkPostionOfUser(data.userid); //update the afk position of the speaker

    if (text.match(/^\/autodj$/) && condition === true)
    {
        bot.addDj();
    }
    else if (text.match(/^\/playlist/))
    {
        if (roomDefaults.thisHoldsThePlaylist !== null)
        {
            bot.speak('There are currently ' + roomDefaults.thisHoldsThePlaylist.length + ' songs in my playlist.');
        }
    }
    else if (text.match(/^\/randomSong$/) && condition === true)
    {
        if (randomOnce !== 1)
        {
            let ez = 0;
            bot.speak("Reorder initiated.");
            ++randomOnce;
            let reorder = setInterval(function ()
            {
                if (ez <= roomDefaults.thisHoldsThePlaylist.length)
                {
                    let nextId = Math.ceil(Math.random() * roomDefaults.thisHoldsThePlaylist);
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
    else if (text.match('turntable.fm/') && !text.match('turntable.fm/' + roomDefaults.ttRoomName) && !condition && data.userid !== authModule.USERID)
    {
        bot.boot(data.userid, 'do not advertise other rooms here');
    }
    else if (text.match('/bumptop') && condition === true)
    {
        if (roomDefaults.queue === true)
        {
            let topOfQueue = data.text.slice(10);
            let index35 = userModule.queueList.indexOf(topOfQueue);
            let index46 = userModule.queueName.indexOf(topOfQueue);
            let index80 = userModule.theUsersList.indexOf(topOfQueue);
            let index81 = userModule.theUsersList[index80];
            let index82 = userModule.theUsersList[index80 - 1];
            if (index35 !== -1 && index80 !== -1)
            {
                clearTimeout(beginTimer);
                sayOnce = true;
                userModule.queueList.splice(index35, 2);
                userModule.queueList.unshift(index81, index82);
                userModule.queueName.splice(index46, 1);
                userModule.queueName.unshift(index81);
                let temp92 = 'The queue is now: ';
                for (let po = 0; po < userModule.queueName.length; po++)
                {
                    if (po !== (userModule.queueName.length - 1))
                    {
                        temp92 += userModule.queueName[po] + ', ';
                    }
                    else if (po === (userModule.queueName.length - 1))
                    {
                        temp92 += userModule.queueName[po];
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
        if (afkModule.AFK === true) //afk limit turned on?
        {
            if (userModule.currentDJs.length !== 0) //any dj's on stage?
            {
                let afkDjs = 'dj afk time: ';

                for (let ijhp = 0; ijhp < userModule.currentDJs.length; ijhp++)
                {
                    let lastUpdate = Math.floor((Date.now() - userModule.lastSeen[userModule.currentDJs[ijhp]]) / 1000 / 60); //their afk time in minutes
                    let whatIsTheName = userModule.theUsersList.indexOf(userModule.currentDJs[ijhp]); //their name

                    if (userModule.currentDJs[ijhp] !== userModule.currentDJs[userModule.currentDJs.length - 1])
                    {
                        afkDjs += userModule.theUsersList[whatIsTheName + 1] + ': ' + lastUpdate + ' mins, ';
                    }
                    else
                    {
                        afkDjs += userModule.theUsersList[whatIsTheName + 1] + ': ' + lastUpdate + ' mins';
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
        let checkPosition = userModule.queueName.indexOf(data.name);

        if (checkPosition !== -1 && roomDefaults.queue === true) //if person is in the queue and queue is active
        {
            bot.speak('@' + name + ' you are currently in position number ' + (checkPosition + 1) + ' in the queue');
        }
        else if (checkPosition === -1 && roomDefaults.queue === true)
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
        if (musicDefaults.LIMIT === true)
        {
            musicDefaults.LIMIT = false;
            bot.speak('the song length limit is now inactive');
        }
        else
        {
            musicDefaults.LIMIT = true;
            bot.speak('the song length limit is now active');
        }
    }
    else if (text.match(/^\/botstatus/) && condition === true)
    {
        let whatsOn = '';

        if (botDefaults.autoBop === true)
        {
            whatsOn += 'autoBop: On, ';
        }
        else
        {
            whatsOn += 'autoBop: Off, ';
        }
        if (roomDefaults.queue === true)
        {
            whatsOn += 'queue: On, ';
        }
        else
        {
            whatsOn += 'queue: Off, ';
        }
        if (afkModule.AFK === true)
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
        if (roomDefaults.EVENTMESSAGE === true)
        {
            whatsOn += 'event message: On, ';
        }
        else
        {
            whatsOn += 'event message: Off, ';
        }
        if (roomDefaults.MESSAGE === true)
        {
            whatsOn += 'room message: On, ';
        }
        else
        {
            whatsOn += 'room message: Off, ';
        }
        if (roomModule.GREET === true)
        {
            whatsOn += 'greeting message: On, ';
        }
        else
        {
            whatsOn += 'greeting message: Off, ';
        }
        if (musicDefaults.voteSkip === true)
        {
            whatsOn += 'voteskipping: On, ';
        }
        else
        {
            whatsOn += 'voteskipping: Off, ';
        }
        if (afkModule.roomAFK === true)
        {
            whatsOn += 'audience afk limit: On, ';
        }
        else
        {
            whatsOn += 'audience afk limit: Off, ';
        }
        if (roomDefaults.SONGSTATS === true)
        {
            whatsOn += 'song stats: On, ';
        }
        else
        {
            whatsOn += 'song stats: Off, ';
        }
        if (roomDefaults.kickTTSTAT === true)
        {
            whatsOn += 'auto ttstat kick: On, ';
        }
        else
        {
            whatsOn += 'auto ttstat kick: Off, ';
        }
        if (musicDefaults.LIMIT === true)
        {
            whatsOn += 'song length limit: On, ';
        }
        else
        {
            whatsOn += 'song length limit: Off, ';
        }
        if (musicDefaults.PLAYLIMIT === true)
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
        if (songModule.snagSong === true)
        {
            whatsOn += 'every song adding: On, ';
        }
        else
        {
            whatsOn += 'every song adding: Off, ';
        }
        if (botDefaults.autoSnag === true)
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
            musicDefaults.voteSkip = true;
            songModule.resetVoteCountSkip();
            songModule.votesLeft = roomDefaults.HowManyVotesToSkip;
        }
    }
    else if (text.match(/^\/noTheme/) && condition === true)
    {
        roomDefaults.THEME = false;
        bot.speak('The theme is now inactive');
    }
    else if (text.match(/^\/setTheme/) && condition === true)
    {
        whatIsTheme = data.text.slice(10);
        roomDefaults.THEME = true;
        bot.speak('The theme is now set to: ' + whatIsTheme);
    }
    else if (text.match(/^\/theme/))
    {
        if (roomDefaults.THEME === false)
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
        musicDefaults.voteSkip = false;
        songModule.resetVoteCountSkip();
        songModule.votesLeft = roomDefaults.HowManyVotesToSkip;
    }
    else if (text.match(/^\/skip$/) && musicDefaults.voteSkip === true) //if command matches and voteskipping is enabled
    {
        let isMaster = userModule.masterIds.includes(data.userid);
        let checkIfOnList = checkVotes.indexOf(data.userid); //check if the person using the command has already voted
        let checkIfMaster = userModule.masterIds.indexOf(lastdj); //is the currently playing dj on the master id's list?

        if ((checkIfOnList === -1 || isMaster) && data.userid !== authModule.USERID) //if command user has not voted and command user is not the bot
        {
            songModule.addToVoteCountSkip(); //add one to the total count of votes for the current song to be skipped
            songModule.votesLeft -= 1; //decrement votes left by one (the votes remaining till the song will be skipped)
            checkVotes.unshift(data.userid); //add them to an array to make sure that they can't vote again this song

            let findLastDj = userModule.theUsersList.indexOf(lastdj); //the index of the currently playing dj's userid in the theUser's list
            if (songModule.votesLeft !== 0 && checkIfMaster === -1) //if votesLeft has not reached zero and the current dj is not on the master id's list
            {
                //the bot will say the following
                bot.speak("Current Votes for a song skip: " + songModule.voteCountSkip +
                    " Votes needed to skip the song: " + roomDefaults.HowManyVotesToSkip);
            }
            if (songModule.votesLeft === 0 && checkIfMaster === -1 && !isNaN(roomDefaults.HowManyVotesToSkip)) //if there are no votes left and the current dj is not on the master list and the
            { //the amount of votes set was a valid number
                bot.speak("@" + userModule.theUsersList[findLastDj + 1] + " you have been voted off stage");
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
        afkModule.AFK = true;
        bot.speak('the afk list is now active.');
        for (let z = 0; z < userModule.currentDJs.length; z++)
        {
            afkModule.justSaw(userModule.currentDJs[z], 'justSaw');
            afkModule.justSaw(userModule.currentDJs[z], 'justSaw1');
            afkModule.justSaw(userModule.currentDJs[z], 'justSaw2');
        }
    }
    else if (text.match(/^\/afkoff/) && condition === true)
    {
        afkModule.AFK = false;
        bot.speak('the afk list is now inactive.');
    }
    else if (text.match(/^\/roomafkon/) && condition === true)
    {
        afkModule.roomAFK = true;
        bot.speak('the audience afk list is now active.');
        for (let zh = 0; zh < userModule.userIDs.length; zh++)
        {
            let isDj2 = userModule.currentDJs.indexOf(userModule.userIDs[zh])
            if (isDj2 === -1)
            {
                afkModule.justSaw(userModule.userIDs[zh], 'justSaw3');
                afkModule.justSaw(userModule.userIDs[zh], 'justSaw4');
            }
        }
    }
    else if (text.match(/^\/roomafkoff/) && condition === true)
    {
        afkModule.roomAFK = false;
        bot.speak('the audience afk list is now inactive.');
    }
    else if (text.match(/^\/djplays/))
    {
        if (userModule.currentDJs.length !== 0)
        {
            let djsnames = [];
            let djplays = 'dj plays: ';
            for (let i = 0; i < userModule.currentDJs.length; i++)
            {
                let djname = userModule.theUsersList.indexOf(userModule.currentDJs[i]) + 1;
                djsnames.push(userModule.theUsersList[djname]);

                if (typeof djs20[userModule.currentDJs[i]] == 'undefined' && typeof userModule.currentDJs[i] != 'undefined') //if doesn't exist at this point, create it
                {
                    djs20[userModule.currentDJs[i]] = {
                        nbSong: 0
                    };
                }

                if (userModule.currentDJs[i] !== userModule.currentDJs[(userModule.currentDJs.length - 1)])
                {
                    if (typeof djs20[userModule.currentDJs[i]] != 'undefined' && typeof userModule.currentDJs[i] != 'undefined') //if doesn't exist at this point, create it
                    {
                        djplays = djplays + djsnames[i] + ': ' + djs20[userModule.currentDJs[i]].nbSong + ', ';
                    }
                }
                else
                {
                    if (typeof djs20[userModule.currentDJs[i]] != 'undefined' && typeof userModule.currentDJs[i] != 'undefined') //if doesn't exist at this point, create it
                    {
                        djplays = djplays + djsnames[i] + ': ' + djs20[userModule.currentDJs[i]].nbSong;
                    }
                }
            }
            bot.speak(djplays);
        }
        else if (userModule.currentDJs.length === 0)
        {
            bot.speak('There are no dj\'s on stage.');
        }
    }
    else if (text.match(/^\/skipsong/) && condition === true)
    {
        if (checkWhoIsDj === authModule.USERID)
        {
            bot.speak("Sorry...I'll play something better next time!");
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
        let currentTime1 = endTime1 - userModule.myTime[data.userid];

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
        if (roomDefaults.SONGSTATS === true)
        {
            roomDefaults.SONGSTATS = false;
            bot.speak('song stats is now inactive');
        }
        else if (roomDefaults.SONGSTATS === false)
        {
            roomDefaults.SONGSTATS = true;
            bot.speak('song stats is now active');
        }
    }
    else if (text.match(/^\/props/))
    {
        bot.speak('@' + name + ' gives ' + '@' + songModule.dj + ' an epic high :hand:');
    }
    else if (text.match(/^\/whosrefreshing/))
    {
        if (refreshList.length !== 0)
        {
            let whosRefreshing = 'refreshing: ';
            let namesOfRefresher;

            for (let i = 0; i < refreshList.length; i++)
            {
                namesOfRefresher = userModule.theUsersList.indexOf(data.userid) + 1;

                if (i < refreshList.length - 1)
                {
                    whosRefreshing += userModule.theUsersList[namesOfRefresher] + ', ';
                }
                else
                {
                    whosRefreshing += userModule.theUsersList[namesOfRefresher];
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
            let isRefresherOnStage = userModule.currentDJs.indexOf(data.userid); //are they a dj
            let hasRefreshAlreadyBeenUsed = refreshList.indexOf(data.userid); //are they already being refreshed?
            let whatIsRefresherName = userModule.theUsersList.indexOf(data.userid) + 1;
            let numberRepresent = (roomDefaults.amountOfTimeToRefresh / 60);

            if (hasRefreshAlreadyBeenUsed !== -1) //if they are already being refreshed
            {
                clearTimeout(refreshTimer[data.userid]); //clear their timeout
                delete refreshTimer[data.userid];
                refreshList.splice(hasRefreshAlreadyBeenUsed, 1); //remove them from the refresh list

                bot.speak('@' + userModule.theUsersList[whatIsRefresherName] + ' you have been removed from the refresh list');
            }
            else
            {
                if (roomDefaults.isRefreshing) //if /refresh is enabled
                {
                    if (isRefresherOnStage !== -1) //is the person on stage
                    {
                        refreshList.push(data.userid);
                        refreshTimer[data.userid] = setTimeout(function ()
                        {
                            hasRefreshAlreadyBeenUsed = refreshList.indexOf(data.userid); //recalculate their position

                            if (hasRefreshAlreadyBeenUsed !== -1)
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
                            bot.speak('@' + userModule.theUsersList[whatIsRefresherName] + ' i\'ll hold your spot on stage for the next ' + roomDefaults.amountOfTimeToRefresh + ' seconds');
                        }
                        else if (numberRepresent === 1)
                        {
                            bot.speak('@' + userModule.theUsersList[whatIsRefresherName] + ' i\'ll hold your spot on stage for the next ' + numberRepresent + ' minute');
                        }
                        else
                        {
                            bot.speak('@' + userModule.theUsersList[whatIsRefresherName] + ' i\'ll hold your spot on stage for the next ' + numberRepresent + ' minutes');
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
        roomModule.GREET = true;
    }
    else if (text.match(/^\/greetoff/) && condition === true)
    {
        bot.speak('room greeting: Off');
        roomModule.GREET = false;
    }
    else if (text.match(/^\/eventmessageOn/) && condition === true)
    {
        bot.speak('event message: On');
        roomDefaults.EVENTMESSAGE = true;
    }
    else if (text.match(/^\/eventmessageOff/) && condition === true)
    {
        bot.speak('event message: Off');
        roomDefaults.EVENTMESSAGE = false;
    }
    else if (text.match(/^\/messageOn/) && condition === true)
    {
        bot.speak('message: On');
        roomDefaults.MESSAGE = true;
    }
    else if (text.match(/^\/messageOff/) && condition === true)
    {
        bot.speak('message: Off');
        roomDefaults.MESSAGE = false;
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
                let checkDjsName = userModule.theUsersList.indexOf(lastdj) + 1;
                bot.speak('@' + userModule.theUsersList[checkDjsName] + ' your song is not the appropriate genre for this room, please skip or you will be removed in 20 seconds');
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
        let botname = userModule.theUsersList.indexOf(authModule.USERID) + 1;
        bot.speak('@' + userModule.theUsersList[botname] + ' hands ' + '@' + name + ' a nice cold :beer:');
    }
    else if (data.text === '/escortme')
    {
        let djListIndex = userModule.currentDJs.indexOf(data.userid);
        let escortmeIndex = escortList.indexOf(data.userid);
        if (djListIndex !== -1 && escortmeIndex === -1)
        {
            escortList.push(data.userid);
            bot.speak('@' + name + ' you will be escorted after you play your song');
        }
    }
    else if (data.text === '/stopescortme')
    {
        bot.speak('@' + name + ' you will no longer be escorted after you play your song');
        let escortIndex = escortList.indexOf(data.userid);
        if (escortIndex !== -1)
        {
            escortList.splice(escortIndex, 1);
        }
    }
    else if (data.text === '/roominfo')
    {
        if (typeof detail !== 'undefined')
        {
            bot.speak(detail);
        }
    }
    else if (data.text === '/fanme')
    {
        bot.speak('@' + name + ' i am now your fan!');
        myId = data.userid;
        bot.becomeFan(myId);
    }
    else if (data.text === '/getTags')
    {
        bot.speak('artist name: ' + songModule.artist + ', song name: ' + songModule.song + ', album: ' + songModule.album + ', genre: ' + songModule.genre);
    }
    else if (data.text === '/dice')
    {
        let random = Math.floor(Math.random() * 12 + 1);
        bot.speak('@' + name + ' i am rolling the dice... your number is... ' + random);
    }
    else if (text.match(/^\/dive/))
    {
        let checkDj = userModule.currentDJs.indexOf(data.userid);
        if (checkDj !== -1)
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
    else if (data.text === '/unfanme')
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

        let areTheyInTheQueue = userModule.queueName.indexOf(whatIsTheirName); //name in queueName
        let areTheyInTheQueueList = userModule.queueList.indexOf(whatIsTheirName); //name in queuList
        let whatIsTheirUserid2 = userModule.theUsersList.indexOf(whatIsTheirName); //userid

        //if either name or userid is undefined, do not perform a move operation
        if (typeof userModule.theUsersList[whatIsTheirUserid2 - 1] == 'undefined' || typeof tempName[1] == 'undefined')
        {
            if (typeof userModule.theUsersList[whatIsTheirUserid2 - 1] != 'undefined')
            {
                bot.pm('failed to perform move operation, please try the command again', userModule.theUsersList[whatIsTheirUserid2 - 1]);
            }
            else
            {
                bot.speak('failed to perform move operation, please try the command again');
            }
        }
        else
        {
            if (roomDefaults.queue === true) //if queue is turned on
            {
                if (tempName.length === 3 && areTheyInTheQueue !== -1) //if three parameters, and name found
                {
                    if (!isNaN(tempName[2]))
                    {
                        if (tempName[2] <= 1) //if position given lower than 1
                        {
                            userModule.queueName.splice(areTheyInTheQueue, 1); //remove them
                            userModule.queueList.splice(areTheyInTheQueueList, 2); //remove them
                            userModule.queueName.splice(0, 0, whatIsTheirName); //add them to beggining
                            userModule.queueList.splice(0, 0, whatIsTheirName, userModule.theUsersList[whatIsTheirUserid2 - 1]); //add them to beggining
                            clearTimeout(beginTimer); //clear timeout because first person has been replaced
                            sayOnce = true;
                            bot.speak(whatIsTheirName + ' has been moved to position 1 in the queue');
                        }
                        else if (tempName[2] >= userModule.queueName.length)
                        {
                            if (userModule.queueName[areTheyInTheQueue] === userModule.queueName[0]) //if position given higher than end
                            {
                                clearTimeout(beginTimer); //clear timeout because first person has been replaced
                                sayOnce = true;
                            }
                            userModule.queueName.splice(areTheyInTheQueue, 1); //remove them
                            userModule.queueList.splice(areTheyInTheQueueList, 2); //remove them
                            userModule.queueName.splice(userModule.queueName.length + 1, 0, whatIsTheirName); //add them to end
                            userModule.queueList.splice(userModule.queueName.length + 1, 0, whatIsTheirName, userModule.theUsersList[whatIsTheirUserid2 - 1]); //add them to end

                            bot.speak(whatIsTheirName + ' has been moved to position ' + userModule.queueName.length + ' in the queue');
                        }
                        else
                        {
                            if (userModule.queueName[areTheyInTheQueue] === userModule.queueName[0])
                            {
                                clearTimeout(beginTimer); //clear timeout because first person has been replaced
                                sayOnce = true;
                            }

                            userModule.queueName.splice(areTheyInTheQueue, 1); //remove them
                            userModule.queueList.splice(areTheyInTheQueueList, 2); //remove them
                            userModule.queueName.splice((Math.round(tempName[2]) - 1), 0, whatIsTheirName); //add them to given position shift left 1 because array starts at 0
                            userModule.queueList.splice(((Math.round(tempName[2]) - 1) * 2), 0, whatIsTheirName, userModule.theUsersList[whatIsTheirUserid2 - 1]); //same as above


                            bot.speak(whatIsTheirName + ' has been moved to position ' + Math.round(tempName[2]) + ' in the queue');
                        }
                    }
                    else
                    {
                        bot.pm('error, position parameter passed was not a number, please pass a valid integer arguement', data.userid);
                    }

                }
                else if (tempName.length !== 3) //if invalid number of parameters
                {
                    bot.pm('error, invalid number of parameters, must have /move name #', data.userid);
                }
                else if (areTheyInTheQueue === -1) //if name not found
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
        if (songModule.snagSong === true)
        {
            songModule.snagSong = false;
            bot.speak('I am no longer adding every song that plays');
        }
        else if (songModule.snagSong === false)
        {
            songModule.snagSong = true; //this is for /snagevery
            botDefaults.autoSnag = false; //this turns off /autosnag
            bot.speak('I am now adding every song that plays, /autosnag has been turned off');
        }
    }
    else if (text.match(/^\/autosnag/) && condition === true)
    {
        if (botDefaults.autoSnag === false)
        {
            botDefaults.autoSnag = true; //this is for /autosnag
            songModule.snagSong = false; //this is for /snagevery
            bot.speak('I am now adding every song that gets at least (' +  botDefaults.howManyVotes + ') awesome\'s, /snagevery has been turned off');
        }
        else if (botDefaults.autoSnag === true)
        {
            botDefaults.autoSnag = false;
            bot.speak('vote snagging has been turned off');
        }
    }
    else if (text.match(/^\/snag/) && condition === true)
    {
        if (songModule.getSong !== null && roomDefaults.thisHoldsThePlaylist !== null)
        {
            let found = false;
            for (let igh = 0; igh < roomDefaults.thisHoldsThePlaylist.length; igh++)
            {
                if (roomDefaults.thisHoldsThePlaylist[igh]._id === songModule.getSong)
                {
                    found = true;
                    bot.speak('I already have that song');
                    break;
                }
            }
            if (!found)
            {
                bot.playlistAdd(songModule.getSong, -1); //add song to the end of the playlist
                bot.speak('song added');
                let tempSongHolder = {
                    _id: songModule.getSong
                };
                roomDefaults.thisHoldsThePlaylist.push(tempSongHolder);
            }
        }
        else
        {
            bot.pm('error, you can\'t snag the song that\'s playing when the bot enters the room', data.userid);
        }
    }
    else if (text.match(/^\/removesong$/) && condition === true)
    {
        if (checkWhoIsDj === authModule.USERID)
        {
            bot.skip();
            bot.playlistRemove(-1);
            roomDefaults.thisHoldsThePlaylist.splice(roomDefaults.thisHoldsThePlaylist.length - 1, 1);
            bot.speak('the last snagged song has been removed.');
        }
        else
        {
            roomDefaults.thisHoldsThePlaylist.splice(roomDefaults.thisHoldsThePlaylist.length - 1, 1);
            bot.playlistRemove(-1);
            bot.speak('the last snagged song has been removed.');
        }
    }
    else if (text.match(/^\/queuewithnumbers$/))
    {
        if (queue === true && roomDefaults.userModule.queueName.length !== 0)
        {
            let temp95 = 'The queue is now: ';
            for (let kl = 0; kl < userModule.queueName.length; kl++)
            {
                if (kl !== (userModule.queueName.length - 1))
                {
                    temp95 += userModule.queueName[kl] + ' [' + (kl + 1) + ']' + ', ';
                }
                else if (kl === (userModule.queueName.length - 1))
                {
                    temp95 += userModule.queueName[kl] + ' [' + (kl + 1) + ']';
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
        if (roomDefaults.queue === true && userModule.queueName.length !== 0)
        {
            let temp95 = 'The queue is now: ';
            for (let kl = 0; kl < userModule.queueName.length; kl++)
            {
                if (kl !== (userModule.queueName.length - 1))
                {
                    temp95 += userModule.queueName[kl] + ', ';
                }
                else if (kl === (userModule.queueName.length - 1))
                {
                    temp95 += userModule.queueName[kl];
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
        if (musicDefaults.PLAYLIMIT === true) //is the play limit on?
        {
            let playMinus = data.text.slice(12);
            let areTheyInRoom = userModule.theUsersList.indexOf(playMinus);
            let areTheyDj = userModule.currentDJs.indexOf(userModule.theUsersList[areTheyInRoom - 1]);

            if (areTheyInRoom !== -1) //are they in the room?
            {
                if (areTheyDj !== -1) //are they a dj?
                {
                    if (typeof djs20[userModule.theUsersList[areTheyInRoom - 1]] != 'undefined')
                    {
                        if (!djs20[userModule.theUsersList[areTheyInRoom - 1]].nbSong <= 0) //is their play count already 0 or lower?
                        {
                            --djs20[userModule.theUsersList[areTheyInRoom - 1]].nbSong;
                            bot.speak(userModule.theUsersList[areTheyInRoom] + '\'s play count has been reduced by one');
                        }
                        else
                        {
                            bot.pm('error, that user\'s play count is already at zero', data.userid);
                        }
                    }
                    else
                    {
                        bot.pm('something weird happened!, attemping to recover now', data.userid);
                        if (typeof userModule.theUsersList[areTheyInRoom - 1] != 'undefined')
                        {
                            //recover here
                            djs20[userModule.theUsersList[areTheyInRoom - 1]] = {
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
        if (roomDefaults.blackList.length !== 0)
        {
            bot.speak('ban list: ' + roomDefaults.blackList);
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
            let index5 = userModule.queueList.indexOf(removeFromQueue);
            let index6 = userModule.queueName.indexOf(removeFromQueue);
            if (index5 !== -1)
            {
                if (userModule.queueName[index6] === userModule.queueName[0])
                {
                    clearTimeout(beginTimer);
                    sayOnce = true;
                }
                userModule.queueList.splice(index5, 2);
                userModule.queueName.splice(index6, 1);

                if (userModule.queueName.length !== 0)
                {
                    let temp89 = 'The queue is now: ';
                    for (let jk = 0; jk < userModule.queueName.length; jk++)
                    {
                        if (jk !== (userModule.queueName.length - 1))
                        {
                            temp89 += userModule.queueName[jk] + ', ';
                        }
                        else if (jk === (userModule.queueName.length - 1))
                        {
                            temp89 += userModule.queueName[jk];
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
    else if (text.match(/^\/removeme$/) && roomDefaults.queue === true)
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
            let list1 = userModule.queueList.indexOf(data.name);
            let list2 = userModule.queueName.indexOf(data.name);

            if (list2 !== -1 && list1 !== -1)
            {
                userModule.queueList.splice(list1, 2);

                if (data.name === userModule.queueName[0])
                {
                    clearTimeout(beginTimer);
                    sayOnce = true;
                }

                userModule.queueName.splice(list2, 1);

                if (userModule.queueName.length !== 0)
                {
                    let temp90 = 'The queue is now: ';
                    for (let kj = 0; kj < userModule.queueName.length; kj++)
                    {
                        if (kj !== (userModule.queueName.length - 1))
                        {
                            temp90 += userModule.queueName[kj] + ', ';
                        }
                        else if (kj === (userModule.queueName.length - 1))
                        {
                            temp90 += userModule.queueName[kj];
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
            let indexInUsersList = userModule.theUsersList.indexOf(data.userid) + 1;

            if (typeof userModule.theUsersList[indexInUsersList] == 'undefined')
            {
                bot.pm('failed to add to queue, please try the command again', data.userid);
            }
            else
            {
                let list3 = userModule.queueList.indexOf(userModule.theUsersList[indexInUsersList]);
                let list10 = userModule.currentDJs.indexOf(data.userid)
                let checkStageList = stageList.indexOf(data.userid);
                let checkManualStageList = userModule.bannedFromStage.indexOf(data.userid);
                //if not in the queue already, not already a dj, not banned from stage
                if (list3 === -1 && list10 === -1 && checkStageList === -1 && checkManualStageList === -1)
                {
                    userModule.queueList.push(userModule.theUsersList[indexInUsersList], data.userid);
                    userModule.queueName.push(userModule.theUsersList[indexInUsersList]);
                    let temp91 = 'The queue is now: ';
                    for (let hj = 0; hj < userModule.queueName.length; hj++)
                    {
                        if (hj !== (userModule.queueName.length - 1))
                        {
                            temp91 += userModule.queueName[hj] + ', ';
                        }
                        else if (hj === (userModule.queueName.length - 1))
                        {
                            temp91 += userModule.queueName[hj];
                        }
                    }
                    bot.speak(temp91);
                }
                else if (list3 !== -1) //if already in queue
                {
                    bot.pm('sorry i can\'t add you to the queue because you are already in the queue!', data.userid);
                }
                else if (checkStageList !== -1 || checkManualStageList !== -1) //if banned from stage
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
        userModule.resetQueueList(bot);
        userModule.resetQueueNames(bot);
        bot.speak('the queue is now active.');
        roomDefaults.queue = true;
        clearTimeout(beginTimer); //if queue is turned on again while somebody was on timeout to get on stage, then clear it
        sayOnce = true;
    }
    else if (text.match(/^\/whatsplaylimit/))
    {
        if (musicDefaults.PLAYLIMIT === true)
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

        if (playLimitNumber !== '') //if an additional arguement was given
        {
            if (!isNaN(playLimitNumber) && playLimitNumber > 0) //if parameter given is a number and greater than zero
            {
                roomDefaults.playLimit = Math.ceil(playLimitNumber); // round play limit to make sure its not a fraction

                bot.speak('the play limit is now active and has been set to ' +
                    roomDefaults.playLimit + ' songs. dj song counters have been reset.');

                //reset song counters
                for (let ig = 0; ig < userModule.currentDJs.length; ig++)
                {
                    djs20[userModule.currentDJs[ig]] = {
                        nbSong: 0
                    };
                }

                musicDefaults.PLAYLIMIT = true; //mark playlimit as being on
            }
            else
            {
                bot.pm('invalid arguement given, the play limit must be set to an integer. ' +
                    'it can either be used as /playLimitOn or /playLimitOn #.', data.userid);

                musicDefaults.PLAYLIMIT = false; // on failure turn it off
            }
        }
        else
        {
            bot.speak('the play limit is now active and has been set to the default value of ' +
                roomDefaults.playLimit + ' songs. dj song counters have been reset.');

            //reset song counters
            for (let ig = 0; ig < userModule.currentDJs.length; ig++)
            {
                djs20[userModule.currentDJs[ig]] = {
                    nbSong: 0
                };
            }

            musicDefaults.PLAYLIMIT = true; //mark playlimit as being on
        }
    }
    else if (text.match(/^\/playLimitOff$/) && condition === true)
    {
        musicDefaults.PLAYLIMIT = false;
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
        let areTheyDj80 = userModule.currentDJs.indexOf(data.userid);
        let Position56 = userModule.currentDJs.indexOf(checkWhoIsDj); //current djs index

        if (areTheyDj80 !== -1) //are they on stage?
        {
            if (checkWhoIsDj != null)
            {
                if (checkWhoIsDj === data.userid)
                {
                    bot.pm('you are currently playing a song!', data.userid);
                }
                else if (userModule.currentDJs[Position56] === userModule.currentDJs[userModule.currentDJs.length - 1] &&
                    userModule.currentDJs[0] === data.userid ||
                    userModule.currentDJs[Position56 + 1] === data.userid) //if they aren't the next person to play a song
                {
                    bot.pm('your song is up next!', data.userid);
                }
                else
                {
                    if (areTheyBeingWarned === -1) //are they already being warned? no
                    {
                        warnme.unshift(data.userid);
                        bot.speak('@' + name + ' you will be warned when your song is up next');
                    }
                    else if (areTheyBeingWarned !== -1) //yes
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
        let checkUser = userModule.theUsersList.indexOf(ban);
        if (checkBan === -1 && checkUser !== -1)
        {
            stageList.push(userModule.theUsersList[checkUser - 1], userModule.theUsersList[checkUser]);
            bot.remDj(userModule.theUsersList[checkUser - 1]);
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
        if (index !== -1)
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
        let checkBan5 = roomDefaults.blackList.indexOf(ban3);
        let checkUser3 = userModule.theUsersList.indexOf(ban3);
        if (checkBan5 === -1 && checkUser3 !== -1)
        {
            roomDefaults.blackList.push(userModule.theUsersList[checkUser3 - 1], userModule.theUsersList[checkUser3]);
            bot.boot(userModule.theUsersList[checkUser3 - 1]);
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
        index = roomDefaults.blackList.indexOf(ban6);
        if (index !== -1)
        {
            roomDefaults.blackList.splice(roomDefaults.blackList[index - 1], 2);
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
        let isAlreadyAfk = userModule.afkPeople.indexOf(data.name);
        if (isAlreadyAfk === -1)
        {
            if (typeof data.name == 'undefined')
            {
                bot.pm('failed to add to the afk list, please try the command again', data.userid);
            }
            else
            {
                bot.speak('@' + name + ' you are marked as afk');
                userModule.afkPeople.push(data.name);
            }
        }
        else if (isAlreadyAfk !== -1)
        {
            bot.speak('@' + name + ' you are no longer afk');
            userModule.afkPeople.splice(isAlreadyAfk, 1);
        }
    }
    else if (text === '/up?') //works for djs on stage
    {
        let areTheyADj = userModule.currentDJs.indexOf(data.userid); //are they a dj?
        if (areTheyADj !== -1) //yes
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
        if (userModule.afkPeople.length !== 0)
        {
            let whosAfk = 'marked as afk: ';
            for (let f = 0; f < userModule.afkPeople.length; f++)
            {
                if (f !== (userModule.afkPeople.length - 1))
                {
                    whosAfk = whosAfk + userModule.afkPeople[f] + ', ';
                }
                else
                {
                    whosAfk = whosAfk + userModule.afkPeople[f];
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
    if (userModule.afkPeople.length !== 0 && data.userid !== authModule.USERID)
    {
        for (let j = 0; j < userModule.afkPeople.length; j++) //loop through afk people array
        {
            if (typeof (userModule.afkPeople[j] !== 'undefined'))
            {
                let areTheyAfk56 = data.text.toLowerCase().indexOf(userModule.afkPeople[j].toLowerCase()); //is an afk persons name being called

                if (areTheyAfk56 !== -1)
                {
                    bot.speak(userModule.afkPeople[j] + ' is afk');
                }
            }
        }
    }
});

//checks who voted and updates their position on the afk list.
bot.on('update_votes', function (data)
{
    songModule.recordUpVotes(data);
    songModule.recordDownVotes(data);
    afkModule.updateAfkPostionOfUser(data.room.metadata.votelog[0][0]); //update the afk position of people who vote for a song

    //this is for /autosnag, automatically adds songs that get over the awesome threshold
    if (botDefaults.autoSnag === true && songModule.snagSong === false && songModule.upVotes >=  botDefaults.howManyVotes && songModule.ALLREADYCALLED === false)
    {
        songModule.voteSnagged();
        addSongIfNotAlreadyInPlaylist(true);
    }
})

//checks who added a song and updates their position on the afk list.
bot.on('snagged', function (data)
{
    songModule.voteSnagged();
    afkModule.updateAfkPostionOfUser(data.userid); //update the afk position of people who add a song to their queue
})



//this activates when a user joins the stage.
bot.on('add_dj', function (data)
{
    //removes dj when they try to join the stage if the vip list has members in it.
    //does not remove the bot
    let checkVip = userModule.vipList.indexOf(data.user[0].userid);
    if (userModule.vipList.length !== 0 && checkVip === -1 && data.user[0].userid !== authModule.USERID)
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
    afkModule.updateAfkPostionOfUser(data.user[0].userid);



    //adds a user to the current Djs list when they join the stage.
    let check89 = userModule.currentDJs.indexOf(data.user[0].userid);
    if (check89 === -1 && typeof data.user[0] != 'undefined')
    {
        userModule.currentDJs.push(data.user[0].userid);
    }



    if ((refreshList.length + userModule.currentDJs.length) <= 5) //if there are still seats left to give out, then give them(but reserve for refreshers)
    {
        if (refreshList.indexOf(data.user[0].userid) === -1) //don't show these messages to people on the refresh list
        {
            //tells a dj trying to get on stage how to add themselves to the queuelist
            let ifUser2 = userModule.queueList.indexOf(data.user[0].userid);
            if (roomDefaults.queue === true && ifUser2 === -1)
            {
                if (userModule.queueList.length !== 0)
                {
                    bot.pm('The queue is currently active. To add yourself to the queue type /addme. To remove yourself from the queue type /removeme.', data.user[0].userid);
                }
            }
            else if (roomDefaults.queue === true && ifUser2 !== -1 && data.user[0].name !== userModule.queueName[0])
            {
                bot.pm('sorry, but you are not first in queue. please wait your turn.', data.user[0].userid);
            }
        }
    }
    else if (refreshList.length !== 0 && refreshList.indexOf(data.user[0].userid) === -1) //if there are people in the refresh list
    { //and the person who just joined the stage is not one of them
        bot.pm('sorry, but i\m holding that spot for someone in the refresh list', data.user[0].userid);
    }



    //escorting for the queue will not apply to people who are on the refresh list
    if (refreshList.indexOf(data.user[0].userid) === -1)
    {
        if ((refreshList.length + userModule.currentDJs.length) <= 5) //if there are still seats left to give out, then give them(but reserve for refreshers)
        {
            //removes a user from the queue list when they join the stage.
            if (roomDefaults.queue === true)
            {
                let firstOnly = userModule.queueList.indexOf(data.user[0].userid);
                let queueListLength = userModule.queueList.length;
                if (firstOnly !== 1 && queueListLength !== 0)
                {
                    bot.remDj(data.user[0].userid);

                    incrementSpamCounter(data.user[0].userid);
                }
            }
            if (roomDefaults.queue === true)
            {
                let checkQueue = userModule.queueList.indexOf(data.user[0].name);
                let checkName2 = userModule.queueName.indexOf(data.user[0].name);
                if (checkQueue !== -1 && checkQueue === 0)
                {
                    clearTimeout(beginTimer);
                    sayOnce = true;
                    userModule.queueList.splice(checkQueue, 2);
                    userModule.queueName.splice(checkName2, 1);
                }
            }
        }
    }



    //if when adding up the number of people in the refresh list with the number of dj's on stage
    //it exceeds the number of seats available (this assumes a 5 seater room
    if ((refreshList.length + userModule.currentDJs.length) > 5)
    {
        if (refreshList.indexOf(data.user[0].userid) === -1) //if person joining is not in refresh list
        {
            bot.remDj(data.user[0].userid);

            incrementSpamCounter(data.user[0].userid);
        }
    }



    //if user is still in refresh list when they get on stage, remove them
    let areTheyStillInRefreshList = refreshList.indexOf(data.user[0].userid);
    if (areTheyStillInRefreshList !== -1)
    {
        clearTimeout(refreshTimer[data.user[0].userid]); //clear their timeout
        delete refreshTimer[data.user[0].userid];
        refreshList.splice(areTheyStillInRefreshList, 1); //remove them from the refresh list
    }



    //checks to see if user is on the banned from stage list, if they are they are removed from stage
    for (let g = 0; g < stageList.length; g++)
    {
        if (data.user[0].userid === stageList[g])
        {
            bot.remDj(data.user[0].userid);
            bot.speak('@' + data.user[0].name + ' you are banned from djing');

            incrementSpamCounter(data.user[0].userid);
            break;
        }
    }



    //checks to see if user is on the manually added banned from stage list, if they are they are removed from stage
    for (let z = 0; z < userModule.bannedFromStage.length; z++)
    {
        if (userModule.bannedFromStage[z].match(data.user[0].userid)) //== userModule.bannedFromStage[z])
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
    if (typeof userModule.people[data.user[0].userid] != 'undefined' && userModule.people[data.user[0].userid].spamCount >= spamLimit)
    {
        bot.boot(data.user[0].userid, 'stop spamming');
    }
    else if (typeof userModule.people[data.user[0].userid] == 'undefined') //if something weird happened, recover here
    {
        userModule.people[data.user[0].userid] = {
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
    if (typeof playLimitOfRefresher[data.user[0].userid] == 'number' && refreshList.indexOf(data.user[0].userid) === -1)
    {
        delete playLimitOfRefresher[data.user[0].userid]
    }


    //updates the current dj's list.
    let check30 = userModule.currentDJs.indexOf(data.user[0].userid);
    if (check30 !== -1)
    {
        userModule.currentDJs.splice(check30, 1);
    }


    //this is for /warnme
    if (warnme.length !== 0)
    {
        let areTheyBeingWarned = warnme.indexOf(data.user[0].userid);

        if (areTheyBeingWarned !== -1) //if theyre on /warnme and they leave the stage
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
    if (checkEscort !== -1)
    {
        escortList.splice(checkEscort, 1);
    }
})



//checks when the bot recieves a pm
bot.on('pmmed', function (data)
{
    let senderid = data.senderid; //the userid of the person who just pmmed the bot
    let text = data.text; //the text sent to the bot in a pm
    let name1 = userModule.theUsersList.indexOf(data.senderid) + 1; //the name of the person who sent the bot a pm
    let isInRoom = checkToseeIfPmmerIsInRoom(senderid); //check to see whether pmmer is in the same room as the bot

    checkIfUserIsMod(data.senderid); //check to see if person pming the bot a command is a moderator or not

    //if no commands match, the pmmer is a moderator and theres more than zero people in the modpm chat
    if (userModule.modpm.length !== 0 && data.text.charAt(0) !== '/' && condition === true) //if no other commands match, send modpm
    {
        let areTheyInModPm = userModule.modpm.indexOf(data.senderid);

        if (areTheyInModPm !== -1)
        {
            for (let jhg = 0; jhg < userModule.modpm.length; jhg++)
            {
                if (modpm[jhg] !== data.senderid && modpm[jhg] !== authModule.USERID) //this will prevent you from messaging yourself
                {
                    bot.pm(userModule.theUsersList[name1] + ' said: ' + data.text, modpm[jhg]);
                }
            }
        }
    }
    else if (text.match(/^\/modpm/) && condition === true && isInRoom === true)
    {
        let areTheyInModPm = userModule.modpm.indexOf(data.senderid);

        if (areTheyInModPm === -1) //are they already in modpm? no
        {
            userModule.modpm.unshift(data.senderid);
            bot.pm('you have now entered into modpm mode, your messages ' +
                'will go to other moderators currently in the modpm', data.senderid);
            if (userModule.modpm.length !== 0)
            {
                for (let jk = 0; jk < userModule.modpm.length; jk++)
                {
                    if (modpm[jk] !== data.senderid)
                    {
                        bot.pm(userModule.theUsersList[name1] + ' has entered the modpm chat', modpm[jk]); //declare user has entered chat
                    }
                }
            }
        }
        else if (areTheyInModPm !== -1) //yes
        {
            userModule.modpm.splice(areTheyInModPm, 1);
            bot.pm('you have now left modpm mode', data.senderid);
            if (userModule.modpm.length !== 0)
            {
                for (let jk = 0; jk < userModule.modpm.length; jk++)
                {
                    bot.pm(userModule.theUsersList[name1] + ' has left the modpm chat', modpm[jk]); //declare user has entered chat
                }
            }
        }
    }
    else if (text.match(/^\/whosrefreshing/) && isInRoom === true)
    {
        if (refreshList.length !== 0)
        {
            let whosRefreshing = 'refreshing: ';
            let namesOfRefresher;

            for (let i = 0; i < refreshList.length; i++)
            {
                namesOfRefresher = userModule.theUsersList.indexOf(data.senderid) + 1;

                if (i < refreshList.length - 1)
                {
                    whosRefreshing += userModule.theUsersList[namesOfRefresher] + ', ';
                }
                else
                {
                    whosRefreshing += userModule.theUsersList[namesOfRefresher];
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
        if (userModule.modpm.length !== 0)
        {
            let temper = "Users in modpm: "; //holds names

            for (let gfh = 0; gfh < userModule.modpm.length; gfh++)
            {
                let whatAreTheirNames = userModule.theUsersList.indexOf(modpm[gfh]) + 1;

                if (gfh !== (userModule.modpm.length - 1))
                {
                    temper += userModule.theUsersList[whatAreTheirNames] + ', ';

                }
                else
                {
                    temper += userModule.theUsersList[whatAreTheirNames];
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
        let areTheyDj80 = userModule.currentDJs.indexOf(data.senderid);
        let Position56 = userModule.currentDJs.indexOf(checkWhoIsDj); //current djs index

        if (areTheyDj80 !== -1) //are they on stage?
        {
            if (checkWhoIsDj != null)
            {
                if (checkWhoIsDj === data.senderid)
                {
                    bot.pm('you are currently playing a song!', data.senderid);
                }
                else if (userModule.currentDJs[Position56] === userModule.currentDJs[userModule.currentDJs.length - 1] &&
                    userModule.currentDJs[0] === data.senderid ||
                    userModule.currentDJs[Position56 + 1] === data.senderid) //if they aren't the next person to play a song
                {
                    bot.pm('your song is up next!', data.senderid);
                }
                else
                {
                    if (areTheyBeingWarned === -1) //are they already being warned? no
                    {
                        warnme.unshift(data.senderid);
                        bot.pm('you will be warned when your song is up next', data.senderid);
                    }
                    else if (areTheyBeingWarned !== -1) //yes
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
        let areTheyInTheQueue = userModule.queueName.indexOf(tempName[1]); //name in queueName
        let areTheyInTheQueueList = userModule.queueList.indexOf(tempName[1]); //name in queuList
        let whatIsTheirUserid2 = userModule.theUsersList.indexOf(tempName[1]); //userid

        //if either name or userid is undefined, do not perform a move operation
        if (typeof userModule.theUsersList[whatIsTheirUserid2 - 1] == 'undefined' || typeof tempName[1] == 'undefined')
        {
            if (typeof userModule.theUsersList[whatIsTheirUserid2 - 1] != 'undefined')
            {
                bot.pm('failed to perform move operation, please try the command again', userModule.theUsersList[whatIsTheirUserid2 - 1]);
            }
            else
            {
                bot.speak('failed to perform move operation, please try the command again');
            }
        }
        else
        {
            if (roomDefaults.queue === true) //if queue is turned on
            {
                if (tempName.length === 3 && areTheyInTheQueue !== -1) //if three parameters, and name found
                {
                    if (!isNaN(tempName[2]))
                    {
                        if (tempName[2] <= 1)
                        {
                            userModule.queueName.splice(areTheyInTheQueue, 1); //remove them
                            userModule.queueList.splice(areTheyInTheQueueList, 2); //remove them
                            userModule.queueName.splice(0, 0, tempName[1]); //add them to beggining
                            userModule.queueList.splice(0, 0, tempName[1], userModule.theUsersList[whatIsTheirUserid2 - 1]); //add them to beggining
                            clearTimeout(beginTimer); //clear timeout because first person has been replaced
                            sayOnce = true;
                            bot.pm(tempName[1] + ' has been moved to position 1 in the queue', data.senderid);
                        }
                        else if (tempName[2] >= userModule.queueName.length)
                        {
                            if (userModule.queueName[areTheyInTheQueue] === userModule.queueName[0])
                            {
                                clearTimeout(beginTimer); //clear timeout because first person has been replaced
                                sayOnce = true;
                            }
                            userModule.queueName.splice(areTheyInTheQueue, 1); //remove them
                            userModule.queueList.splice(areTheyInTheQueueList, 2); //remove them
                            userModule.queueName.splice(userModule.queueName.length + 1, 0, tempName[1]); //add them to end
                            userModule.queueList.splice(userModule.queueName.length + 1, 0, tempName[1], userModule.theUsersList[whatIsTheirUserid2 - 1]); //add them to end

                            bot.pm(tempName[1] + ' has been moved to position ' + userModule.queueName.length + ' in the queue', data.senderid);
                        }
                        else
                        {
                            if (userModule.queueName[areTheyInTheQueue] === userModule.queueName[0])
                            {
                                clearTimeout(beginTimer); //clear timeout because first person has been replaced
                                sayOnce = true;
                            }

                            userModule.queueName.splice(areTheyInTheQueue, 1); //remove them
                            userModule.queueList.splice(areTheyInTheQueueList, 2); //remove them
                            userModule.queueName.splice((Math.round(tempName[2]) - 1), 0, tempName[1]); //add them to given position shift left 1 because array starts at 0
                            userModule.queueList.splice(((Math.round(tempName[2]) - 1) * 2), 0, tempName[1], userModule.theUsersList[whatIsTheirUserid2 - 1]); //same as above

                            bot.pm(tempName[1] + ' has been moved to position ' + Math.round(tempName[2]) + ' in the queue', data.senderid);
                        }
                    }
                    else
                    {
                        bot.pm('error, position parameter passed was not a number, please pass a valid integer arguement', data.senderid);
                    }
                }
                else if (tempName.length !== 3) //if invalid number of parameters
                {
                    bot.pm('error, invalid number of parameters, must have /move name #', data.senderid);
                }
                else if (areTheyInTheQueue === -1) //if name not found
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
        let checkPosition = userModule.queueName.indexOf(userModule.theUsersList[name1]);

        if (checkPosition !== -1 && roomDefaults.queue === true) //if person is in the queue and queue is active
        {
            bot.pm('you are currently in position number ' + (checkPosition + 1) + ' in the queue', data.senderid);
        }
        else if (checkPosition === -1 && roomDefaults.queue === true)
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
        if (afkModule.AFK === true) //afk limit turned on?
        {
            if (userModule.currentDJs.length !== 0) //any dj's on stage?
            {
                let afkDjs = 'dj afk time: ';

                for (let ijhp = 0; ijhp < userModule.currentDJs.length; ijhp++)
                {
                    let lastUpdate = Math.floor((Date.now() - userModule.lastSeen[userModule.currentDJs[ijhp]]) / 1000 / 60); //their afk time in minutes
                    let whatIsTheName = userModule.theUsersList.indexOf(userModule.currentDJs[ijhp]); //their name

                    if (userModule.currentDJs[ijhp] !== userModule.currentDJs[userModule.currentDJs.length - 1])
                    {
                        afkDjs += userModule.theUsersList[whatIsTheName + 1] + ': ' + lastUpdate + ' mins, ';
                    }
                    else
                    {
                        afkDjs += userModule.theUsersList[whatIsTheName + 1] + ': ' + lastUpdate + ' mins';
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
        if (musicDefaults.PLAYLIMIT === true) //is the play limit on?
        {
            let playMinus = data.text.slice(12);
            let areTheyInRoom = userModule.theUsersList.indexOf(playMinus);
            let areTheyDj = userModule.currentDJs.indexOf(userModule.theUsersList[areTheyInRoom - 1]);
            if (areTheyInRoom !== -1) //are they in the room?
            {
                if (areTheyDj !== -1) //are they a dj?
                {
                    if (typeof djs20[userModule.theUsersList[areTheyInRoom - 1]] != 'undefined')
                    {

                        if (!djs20[userModule.theUsersList[areTheyInRoom - 1]].nbSong <= 0) //is their play count already 0 or lower?
                        {
                            --djs20[userModule.theUsersList[areTheyInRoom - 1]].nbSong;
                            bot.pm(userModule.theUsersList[areTheyInRoom] + '\'s play count has been reduced by one', data.senderid);
                        }
                        else
                        {
                            bot.pm('error, that user\'s play count is already at zero', data.senderid);
                        }
                    }
                    else
                    {
                        bot.pm('something weird happened!, attemping to recover now', data.senderid);

                        if (userModule.theUsersList[areTheyInRoom - 1] !== 'undefined') //only recover if userid given is not undefined
                        {
                            //recover here
                            djs20[userModule.theUsersList[areTheyInRoom - 1]] = {
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
        if (musicDefaults.PLAYLIMIT === true)
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

        if (playLimitNumber !== '') //if an additional arguement was given
        {
            if (!isNaN(playLimitNumber) && playLimitNumber > 0) //if parameter given is a number and greater than zero
            {
                roomDefaults.playLimit = Math.ceil(playLimitNumber); // round play limit to make sure its not a fraction

                bot.pm('the play limit is now active and has been set to ' +
                    roomDefaults.playLimit + ' songs. dj song counters have been reset.', data.senderid);

                //reset song counters
                for (let ig = 0; ig < userModule.currentDJs.length; ig++)
                {
                    djs20[userModule.currentDJs[ig]] = {
                        nbSong: 0
                    };
                }

                musicDefaults.PLAYLIMIT = true; //mark playlimit as being on
            }
            else
            {
                bot.pm('invalid arguement given, the play limit must be set to an integer. ' +
                    'it can either be used as /playLimitOn or /playLimitOn #.', data.senderid);

                musicDefaults.PLAYLIMIT = false; //on failure turn it off
            }
        }
        else
        {
            bot.pm('the play limit is now active and has been set to the default value of ' +
                roomDefaults.playLimit + ' songs. dj song counters have been reset.', data.senderid);

            //reset song counters
            for (let ig = 0; ig < userModule.currentDJs.length; ig++)
            {
                djs20[userModule.currentDJs[ig]] = {
                    nbSong: 0
                };
            }

            musicDefaults.PLAYLIMIT = true; //mark playlimit as being on
        }
    }
    else if (text.match(/^\/playLimitOff$/) && condition === true && isInRoom === true)
    {
        musicDefaults.PLAYLIMIT = false;
        bot.pm('the play limit is now inactive.', data.senderid);
    }
    else if (text.match(/^\/queueOn$/) && condition === true && isInRoom === true)
    {
        userModule.resetQueueList(bot);
        userModule.resetQueueNames(bot);
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
        if (typeof data.senderid == 'undefined' || typeof userModule.theUsersList[name1] == 'undefined')
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
            let list3 = userModule.queueList.indexOf(userModule.theUsersList[name1]);
            let list10 = userModule.currentDJs.indexOf(data.senderid)
            let checkStageList = stageList.indexOf(data.senderid);
            let checkManualStageList = userModule.bannedFromStage.indexOf(data.senderid);
            if (list3 === -1 && list10 === -1 && checkStageList === -1 && checkManualStageList === -1)
            {
                userModule.queueList.push(userModule.theUsersList[name1], data.senderid);
                userModule.queueName.push(userModule.theUsersList[name1]);
                let temp91 = 'The queue is now: ';
                for (let hj = 0; hj < userModule.queueName.length; hj++)
                {
                    if (hj !== (userModule.queueName.length - 1))
                    {
                        temp91 += userModule.queueName[hj] + ', ';
                    }
                    else if (hj === (userModule.queueName.length - 1))
                    {
                        temp91 += userModule.queueName[hj];
                    }
                }
                bot.speak(temp91);
            }
            else if (list3 !== -1) //if already in queue
            {
                bot.pm('sorry i can\'t add you to the queue because you are already in the queue!', data.senderid);
            }
            else if (checkStageList !== -1 || checkManualStageList !== -1) //if banned from stage
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
        if (typeof userModule.theUsersList[name1] == 'undefined')
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
            let list1 = userModule.queueList.indexOf(userModule.theUsersList[name1]);
            let list2 = userModule.queueName.indexOf(userModule.theUsersList[name1]);

            if (list2 !== -1 && list1 !== -1)
            {
                userModule.queueList.splice(list1, 2);

                if (userModule.theUsersList[name1] === userModule.queueName[0])
                {
                    clearTimeout(beginTimer);
                    sayOnce = true;
                }
                userModule.queueName.splice(list2, 1);

                if (userModule.queueName.length !== 0)
                {
                    let temp90 = 'The queue is now: ';
                    for (let kj = 0; kj < userModule.queueName.length; kj++)
                    {
                        if (kj !== (userModule.queueName.length - 1))
                        {
                            temp90 += userModule.queueName[kj] + ', ';
                        }
                        else if (kj === (userModule.queueName.length - 1))
                        {
                            temp90 += userModule.queueName[kj];
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
            let index5 = userModule.queueList.indexOf(removeFromQueue);
            let index6 = userModule.queueName.indexOf(removeFromQueue);
            if (index5 !== -1)
            {
                if (userModule.queueName[index6] === userModule.queueName[0])
                {
                    clearTimeout(beginTimer);
                    sayOnce = true;
                }
                userModule.queueList.splice(index5, 2);
                userModule.queueName.splice(index6, 1);

                if (userModule.queueName.length !== 0)
                {
                    let temp89 = 'The queue is now: ';
                    for (let jk = 0; jk < userModule.queueName.length; jk++)
                    {
                        if (jk !== (userModule.queueName.length - 1))
                        {
                            temp89 += userModule.queueName[jk] + ', ';
                        }
                        else if (jk === (userModule.queueName.length - 1))
                        {
                            temp89 += userModule.queueName[jk];
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
        if (songModule.snagSong === true)
        {
            songModule.snagSong = false;
            bot.pm('I am no longer adding every song that plays', data.senderid);
        }
        else if (songModule.snagSong === false)
        {
            songModule.snagSong = true; //this is for /snagevery
            botDefaults.autoSnag = false; //this turns off /autosnag
            bot.pm('I am now adding every song that plays, /autosnag has been turned off', data.senderid);
        }
    }
    else if (text.match(/^\/autosnag/) && condition === true && isInRoom === true)
    {
        if (botDefaults.autoSnag === false)
        {
            botDefaults.autoSnag = true; //this is for /autosnag
            songModule.snagSong = false; //this is for /snagevery
            bot.pm('I am now adding every song that gets at least (' +  botDefaults.howManyVotes + ') awesome\'s, /snagevery has been turned off', data.senderid);
        }
        else if (botDefaults.autoSnag === true)
        {
            botDefaults.autoSnag = false;
            bot.pm('vote snagging has been turned off', data.senderid);
        }
    }
    else if (text.match(/^\/dive/) && isInRoom === true)
    {
        let checkDj = userModule.currentDJs.indexOf(data.senderid);
        if (checkDj !== -1)
        {
            bot.remDj(data.senderid);
        }
        else
        {
            bot.pm('you must be on stage to use that command.', data.senderid);
        }
    }
    else if (data.text === '/getTags' && isInRoom === true)
    {
        bot.pm('artist name: ' + songModule.artist + ', song name: ' + songModule.song + ', album: ' + songModule.album + ', genre: ' + songModule.genre, data.senderid);
    }
    else if (data.text === '/roominfo' && isInRoom === true)
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
        roomDefaults.EVENTMESSAGE = true;
    }
    else if (text.match(/^\/eventmessageOff/) && condition === true && isInRoom === true)
    {
        bot.pm('event message: Off', data.senderid);
        roomDefaults.EVENTMESSAGE = false;
    }
    else if (text.match(/^\/messageOff/) && condition === true && isInRoom === true)
    {
        bot.pm('message: Off', data.senderid);
        roomDefaults.MESSAGE = false;
    }
    else if (text.match(/^\/messageOn/) && condition === true && isInRoom === true)
    {
        bot.pm('message: On', data.senderid);
        roomDefaults.MESSAGE = true;
    }
    else if (text.match(/^\/greetoff/) && condition === true && isInRoom === true)
    {
        bot.pm('room greeting: Off', data.senderid);
        roomModule.GREET = false;
    }
    else if (text.match(/^\/greeton/) && condition === true && isInRoom === true)
    {
        bot.pm('room greeting: On', data.senderid);
        roomModule.GREET = true;
    }
    else if (text.match(/^\/songstats/) && condition === true && isInRoom === true)
    {
        if (roomDefaults.SONGSTATS === true)
        {
            roomDefaults.SONGSTATS = false;
            bot.pm('song stats is now inactive', data.senderid);
        }
        else if (roomDefaults.SONGSTATS === false)
        {
            roomDefaults.SONGSTATS = true;
            bot.pm('song stats is now active', data.senderid);
        }
    }
    else if (text.match(/^\/playlist/) && condition === true && isInRoom === true)
    {
        if (roomDefaults.thisHoldsThePlaylist !== null)
        {
            bot.pm('There are currently ' + roomDefaults.thisHoldsThePlaylist.length + ' songs in my playlist.', data.senderid);
        }
    }
    else if (text.match(/^\/setTheme/) && condition === true && isInRoom === true)
    {
        whatIsTheme = data.text.slice(10);
        roomDefaults.THEME = true;
        bot.pm('The theme is now set to: ' + whatIsTheme, data.senderid);
    }
    else if (text.match(/^\/noTheme/) && condition === true && isInRoom === true)
    {
        roomDefaults.THEME = false;
        bot.pm('The theme is now inactive', data.senderid);
    }
    else if (text.match(/^\/theme/) && isInRoom === true)
    {
        if (roomDefaults.THEME === false)
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
        if (checkWhoIsDj === authModule.USERID)
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
        afkModule.roomAFK = false;
        bot.pm('the audience afk list is now inactive.', data.senderid);
    }
    else if (text.match(/^\/roomafkon/) && condition === true && isInRoom === true)
    {
        afkModule.roomAFK = true;
        bot.pm('the audience afk list is now active.', data.senderid);
        for (let zh = 0; zh < userModule.userIDs.length; zh++)
        {
            let isDj2 = userModule.currentDJs.indexOf(userModule.userIDs[zh])
            if (isDj2 === -1)
            {
                afkModule.justSaw(userModule.userIDs[zh], 'justSaw3');
                afkModule.justSaw(userModule.userIDs[zh], 'justSaw4');
            }
        }
    }
    else if (text.match(/^\/afkoff/) && condition === true && isInRoom === true)
    {
        afkModule.AFK = false;
        bot.pm('the afk list is now inactive.', data.senderid);
    }
    else if (text.match(/^\/afkon/) && condition === true && isInRoom === true)
    {
        afkModule.AFK = true;
        bot.pm('the afk list is now active.', data.senderid);
        for (let z = 0; z < userModule.currentDJs.length; z++)
        {
            afkModule.justSaw(userModule.currentDJs[z], 'justSaw');
            afkModule.justSaw(userModule.currentDJs[z], 'justSaw1');
            afkModule.justSaw(userModule.currentDJs[z], 'justSaw2');
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
        musicDefaults.voteSkip = false;
        songModule.resetVoteCountSkip();
        songModule.votesLeft = roomDefaults.HowManyVotesToSkip;
    }
    else if (text.match(/^\/mytime/) && isInRoom === true)
    {
        let msecPerMinute1 = 1000 * 60;
        let msecPerHour1 = msecPerMinute1 * 60;
        let msecPerDay1 = msecPerHour1 * 24;
        let endTime1 = Date.now();
        let currentTime1 = endTime1 - userModule.myTime[data.senderid];

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
            musicDefaults.voteSkip = true;
            songModule.resetVoteCountSkip();
            songModule.votesLeft = roomDefaults.HowManyVotesToSkip;
        }
    }
    else if (text.match(/^\/queuewithnumbers$/) && isInRoom === true)
    {
        if (roomDefaults.queue === true && userModule.queueName.length !== 0)
        {
            let temp95 = 'The queue is now: ';
            for (let kl = 0; kl < userModule.queueName.length; kl++)
            {
                if (kl !== (userModule.queueName.length - 1))
                {
                    temp95 += userModule.queueName[kl] + ' [' + (kl + 1) + ']' + ', ';
                }
                else if (kl === (userModule.queueName.length - 1))
                {
                    temp95 += userModule.queueName[kl] + ' [' + (kl + 1) + ']';
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
        if (roomDefaults.queue === true && userModule.queueName.length !== 0)
        {
            let temp95 = 'The queue is now: ';
            for (let kl = 0; kl < userModule.queueName.length; kl++)
            {
                if (kl !== (userModule.queueName.length - 1))
                {
                    temp95 += userModule.queueName[kl] + ', ';
                }
                else if (kl === (userModule.queueName.length - 1))
                {
                    temp95 += userModule.queueName[kl];
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
        if (randomOnce !== 1)
        {
            let ez = 0;
            bot.pm("Reorder initiated.", data.senderid);
            ++randomOnce;
            let reorder = setInterval(function ()
            {
                if (ez <= roomDefaults.thisHoldsThePlaylist.length)
                {
                    let nextId = Math.ceil(Math.random() * roomDefaults.thisHoldsThePlaylist);
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
            let index35 = userModule.queueList.indexOf(topOfQueue);
            let index46 = userModule.queueName.indexOf(topOfQueue);
            let index80 = userModule.theUsersList.indexOf(topOfQueue);
            let index81 = userModule.theUsersList[index80];
            let index82 = userModule.theUsersList[index80 - 1];
            if (index35 !== -1 && index80 !== -1)
            {
                clearTimeout(beginTimer);
                sayOnce = true;
                userModule.queueList.splice(index35, 2);
                userModule.queueList.unshift(index81, index82);
                userModule.queueName.splice(index46, 1);
                userModule.queueName.unshift(index81);
                let temp92 = 'The queue is now: ';
                for (let po = 0; po < userModule.queueName.length; po++)
                {
                    if (po !== (userModule.queueName.length - 1))
                    {
                        temp92 += userModule.queueName[po] + ', ';
                    }
                    else if (po === (userModule.queueName.length - 1))
                    {
                        temp92 += userModule.queueName[po];
                    }
                }
                bot.speak(temp92);
            }
        }
    }
    else if (text.match(/^\/lengthLimit/) && condition === true && isInRoom === true)
    {
        if (musicDefaults.LIMIT === true)
        {
            musicDefaults.LIMIT = false;
            bot.pm('the song length limit is now inactive', data.senderid);
        }
        else
        {
            musicDefaults.LIMIT = true;
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
        let checkUser = userModule.theUsersList.indexOf(ban) - 1;
        if (checkUser !== -1)
        {
            bot.remDj(userModule.theUsersList[checkUser]);
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
        if (afkModule.AFK === true)
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
        if (roomDefaults.EVENTMESSAGE === true)
        {
            whatsOn += 'event message: On, ';
        }
        else
        {
            whatsOn += 'event message: Off, ';
        }
        if (roomDefaults.MESSAGE === true)
        {
            whatsOn += 'room message: On, ';
        }
        else
        {
            whatsOn += 'room message: Off, ';
        }
        if (roomModule.GREET === true)
        {
            whatsOn += 'greeting message: On, ';
        }
        else
        {
            whatsOn += 'greeting message: Off, ';
        }
        if (musicDefaults.voteSkip === true)
        {
            whatsOn += 'voteskipping: On, ';
        }
        else
        {
            whatsOn += 'voteskipping: Off, ';
        }
        if (afkModule.roomAFK === true)
        {
            whatsOn += 'audience afk limit: On, ';
        }
        else
        {
            whatsOn += 'audience afk limit: Off, ';
        }
        if (roomDefaults.SONGSTATS === true)
        {
            whatsOn += 'song stats: On, ';
        }
        else
        {
            whatsOn += 'song stats: Off, ';
        }
        if (roomDefaults.kickTTSTAT === true)
        {
            whatsOn += 'auto ttstat kick: On, ';
        }
        else
        {
            whatsOn += 'auto ttstat kick: Off, ';
        }
        if (musicDefaults.LIMIT === true)
        {
            whatsOn += 'song length limit: On, ';
        }
        else
        {
            whatsOn += 'song length limit: Off, ';
        }
        if (musicDefaults.PLAYLIMIT === true)
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
        if (songModule.snagSong === true)
        {
            whatsOn += 'every song adding: On, ';
        }
        else
        {
            whatsOn += 'every song adding: Off, ';
        }
        if (botDefaults.autoSnag === true)
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
        if (userModule.currentDJs.length !== 0)
        {
            let djsnames = [];
            let djplays = 'dj plays: ';
            for (let i = 0; i < userModule.currentDJs.length; i++)
            {
                let djname = userModule.theUsersList.indexOf(userModule.currentDJs[i]) + 1;
                djsnames.push(userModule.theUsersList[djname]);

                if (typeof djs20[userModule.currentDJs[i]] == 'undefined' && typeof userModule.currentDJs[i] != 'undefined') //if doesn't exist at this point, create it
                {
                    djs20[userModule.currentDJs[i]] = {
                        nbSong: 0
                    };
                }

                if (userModule.currentDJs[i] !== userModule.currentDJs[(userModule.currentDJs.length - 1)])
                {
                    if (typeof djs20[userModule.currentDJs[i]] != 'undefined' && typeof userModule.currentDJs[i] != 'undefined') //if doesn't exist at this point, create it
                    {
                        djplays = djplays + djsnames[i] + ': ' + djs20[userModule.currentDJs[i]].nbSong + ', ';
                    }
                }
                else
                {
                    if (typeof djs20[userModule.currentDJs[i]] != 'undefined' && typeof userModule.currentDJs[i] != 'undefined') //if doesn't exist at this point, create it
                    {
                        djplays = djplays + djsnames[i] + ': ' + djs20[userModule.currentDJs[i]].nbSong;
                    }
                }
            }

            bot.pm(djplays, data.senderid);
        }
        else if (userModule.currentDJs.length === 0)
        {
            bot.pm('There are no dj\'s on stage.', data.senderid);
        }
    }
    else if (text.match('/banstage') && condition === true && isInRoom === true)
    {
        let ban12 = data.text.slice(11);
        let checkBan = stageList.indexOf(ban12);
        let checkUser12 = userModule.theUsersList.indexOf(ban12);
        if (checkBan === -1 && checkUser12 !== -1)
        {
            stageList.push(userModule.theUsersList[checkUser12 - 1], userModule.theUsersList[checkUser12]);
            bot.remDj(userModule.theUsersList[checkUser12 - 1]);
            condition = false;
        }
    }
    else if (text.match('/unbanstage') && condition === true && isInRoom === true)
    {
        let ban2 = data.text.slice(13);
        index = stageList.indexOf(ban2);
        if (index !== -1)
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
        let checkBan17 = roomDefaults.blackList.indexOf(ban17);
        let checkUser17 = userModule.theUsersList.indexOf(ban17);
        if (checkBan17 === -1 && checkUser17 !== -1)
        {
            roomDefaults.blackList.push(userModule.theUsersList[checkUser17 - 1], userModule.theUsersList[checkUser17]);
            bot.boot(userModule.theUsersList[checkUser17 - 1]);
            condition = false;
        }
    }
    else if (text.match('/unban') && condition === true && isInRoom === true)
    {
        let ban20 = data.text.slice(8);
        index = roomDefaults.blackList.indexOf(ban20);
        if (index !== -1)
        {
            roomDefaults.blackList.splice(roomDefaults.blackList[index - 1], 2);
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
        if (roomDefaults.blackList.length !== 0)
        {
            bot.pm('ban list: ' + roomDefaults.blackList, data.senderid);
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
    else if (data.text === '/stopescortme' && isInRoom === true)
    {
        bot.pm('you will no longer be escorted after you play your song', data.senderid);
        let escortIndex = escortList.indexOf(data.senderid);
        if (escortIndex !== -1)
        {
            escortList.splice(escortIndex, 1);
        }
    }
    else if (data.text === '/escortme' && isInRoom === true)
    {
        let djListIndex = userModule.currentDJs.indexOf(data.senderid);
        let escortmeIndex = escortList.indexOf(data.senderid);
        if (djListIndex !== -1 && escortmeIndex === -1)
        {
            escortList.push(data.senderid);
            bot.pm('you will be escorted after you play your song', data.senderid);
        }
    }
    else if (text.match(/^\/snag/) && condition === true && isInRoom === true)
    {
        if (songModule.getSong !== null && roomDefaults.thisHoldsThePlaylist !== null)
        {
            let found = false;
            for (let igh = 0; igh < roomDefaults.thisHoldsThePlaylist.length; igh++)
            {
                if (roomDefaults.thisHoldsThePlaylist[igh]._id === songModule.getSong)
                {
                    found = true;
                    bot.pm('I already have that song', data.senderid);
                    break;
                }
            }
            if (!found)
            {
                bot.playlistAdd(songModule.getSong, -1); //add song to the end of the playlist
                bot.pm('song added', data.senderid);
                let tempSongHolder = {
                    _id: songModule.getSong
                };
                roomDefaults.thisHoldsThePlaylist.push(tempSongHolder);
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
                let checkDjsName = userModule.theUsersList.indexOf(lastdj) + 1;
                bot.speak('@' + userModule.theUsersList[checkDjsName] + ' your song is not the appropriate genre for this room, please skip or you will be removed in 20 seconds');
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
        if (checkWhoIsDj === authModule.USERID)
        {
            bot.skip();
            bot.playlistRemove(-1);
            roomDefaults.thisHoldsThePlaylist.splice(roomDefaults.thisHoldsThePlaylist.length - 1, 1);
            bot.pm('the last snagged song has been removed.', data.senderid);
        }
        else
        {
            roomDefaults.thisHoldsThePlaylist.splice(roomDefaults.thisHoldsThePlaylist.length - 1, 1);
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
        let whatIsTheirUserid = userModule.theUsersList.indexOf(tempArray[1]);
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

                isNameValid = userModule.theUsersList.indexOf(theirName.trim()); //find the index

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
                        bot.boot(userModule.theUsersList[isNameValid - 1], reason);
                    }
                    else
                    {
                        bot.boot(userModule.theUsersList[isNameValid - 1]);
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

            bot.boot(userModule.theUsersList[whatIsTheirUserid - 1], reason);
        }
        //if their name is a single word and no message is given it comes to here
        else if (whatIsTheirUserid !== -1)
        {
            bot.boot(userModule.theUsersList[whatIsTheirUserid - 1]);
        }
        else
        {
            bot.pm('error, that user was not found in the room. multi word names must be specified in the command usage, example: /boot 3 first middle last.' +
                ' if the name is only one word long then you do not need to specify its length', data.senderid);
        }
    }
    else if (text.match(/^\/afk/) && isInRoom === true)
    {
        let isUserAfk = userModule.theUsersList.indexOf(data.senderid) + 1;
        let isAlreadyAfk = userModule.afkPeople.indexOf(userModule.theUsersList[isUserAfk]);
        if (isAlreadyAfk === -1)
        {
            if (typeof userModule.theUsersList[isUserAfk] == 'undefined')
            {
                bot.pm('failed to add to the afk list, please try the command again', data.senderid);
            }
            else
            {
                bot.pm('you are marked as afk', data.senderid);
                userModule.afkPeople.push(userModule.theUsersList[isUserAfk]);
            }
        }
        else if (isAlreadyAfk !== -1)
        {
            bot.pm('you are no longer afk', data.senderid);
            userModule.afkPeople.splice(isAlreadyAfk, 1);
        }
    }
    else if (text.match(/^\/whosafk/) && isInRoom === true)
    {
        if (userModule.afkPeople.length !== 0)
        {
            let whosAfk = 'marked as afk: ';
            for (let f = 0; f < userModule.afkPeople.length; f++)
            {
                if (f !== (userModule.afkPeople.length - 1))
                {
                    whosAfk = whosAfk + userModule.afkPeople[f] + ', ';
                }
                else
                {
                    whosAfk = whosAfk + userModule.afkPeople[f];
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
        userModule.resetUsersList(bot);
        moderatorModule.resetModList(bot);
        userModule.resetCurrentDJs(bot);
        userModule.resetUserIDs(bot);
        userModule.resetQueueList(bot);
        userModule.resetQueueNames(bot);
        userModule.resetPeople(bot);
        userModule.resetMyTime(bot);
        userModule.resetAFKPeople(bot);
        userModule.resetLastSeen();
        djs20 = [];
        warnme = [];
        userModule.resetModPM(bot);


        //set information
        detail = data.room.description; //used to get room description
        roomDefaults.roomName = data.room.name; //gets your rooms name
        roomDefaults.ttRoomName = data.room.shortcut; //gets room shortcut


        //load the playlist into memory
        bot.playlistAll(function (callback)
        {
            roomDefaults.thisHoldsThePlaylist = callback.list;
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
                userModule.currentDJs.push(data.room.metadata.djs[iop]);
                djs20[data.room.metadata.djs[iop]] = { //set dj song play count to zero
                    nbSong: 0
                };
                afkModule.justSaw(data.room.metadata.djs[iop], 'justSaw'); //initialize dj afk count
                afkModule.justSaw(data.room.metadata.djs[iop], 'justSaw1');
                afkModule.justSaw(data.room.metadata.djs[iop], 'justSaw2');
            }
        }


        //set modlist to list of moderators
        //modList = data.room.metadata.moderator_id;
        for (let ihp = 0; ihp < data.room.metadata.moderator_id.length; ihp++)
        {
            moderatorModule.modList.push(data.room.metadata.moderator_id[ihp]);
        }


        //used to get user names and user id's
        for (let i = 0; i < data.users.length; i++)
        {
            if (typeof data.users[i] !== 'undefined')
            {
                userModule.theUsersList.push(data.users[i].userid, data.users[i].name);
                userModule.userIDs.push(data.users[i].userid);
            }
        }


        //sets everyones spam count to zero
        //puts people on the global afk list when it joins the room
        for (let z = 0; z < userModule.userIDs.length; z++)
        {
            if (typeof userModule.userIDs[z] !== 'undefined')
            {
                userModule.people[userModule.userIDs[z]] = {
                    spamCount: 0
                };
                afkModule.justSaw(userModule.userIDs[z], 'justSaw3');
                afkModule.justSaw(userModule.userIDs[z], 'justSaw4');
            }
        }


        //starts time in room for everyone currently in the room
        for (let zy = 0; zy < userModule.userIDs.length; zy++)
        {
            if (typeof userModule.userIDs[zy] !== 'undefined')
            {
                userModule.myTime[userModule.userIDs[zy]] = Date.now();
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
bot.on('registered', function (data) {
    roomModule.userJoinsRoom(data, bot)
});


bot.on('update_user', function (data) {
    userModule.updateUser(data);
})

//updates the moderator list when a moderator is added.
bot.on('new_moderator', function (data)
{
    moderatorModule.newModerator(data, bot)
})

//updates the moderator list when a moderator is removed.
bot.on('rem_moderator', function (data)
{
    moderatorModule.updateModeratorList(data, bot)
})

//starts up when a user leaves the room
bot.on('deregistered', function (data)
{
    userModule.deregisterUser(data, bot)
})



//activates at the end of a song.
bot.on('endsong', function (data)
{
    //bot says song stats for each song
    chatModule.readSongStats(bot)


    //iterates through the dj list incrementing dj song counts and
    //removing them if they are over the limit.
    let djId = data.room.metadata.current_dj;

    if (typeof (djs20[djId]) !== 'undefined' && typeof djId != 'undefined')
    {
        if (++djs20[djId].nbSong >= roomDefaults.playLimit)
        {
            if (musicDefaults.PLAYLIMIT === true) //is playlimit on?
            {
                if (djId === userModule.currentDJs[0] && roomDefaults.playLimit === 1) //if person is in the far left seat and limit is set to one
                {
                    let checklist33 = userModule.theUsersList.indexOf(djId) + 1;

                    if (checklist33 !== -1)
                    {
                        chatModule.overPlayLimit(userModule.theUsersList[checklist33], roomDefaults.playLimit)
                        bot.speak('@' + userModule.theUsersList[checklist33] + ' you are over the playlimit of ' + roomDefaults.playLimit + ' song');
                    }

                    bot.remDj(djId);
                }
                else if (djId !== authModule.USERID && roomDefaults.playLimit !== 1) //if limit is more than one
                {
                    let checklist33 = userModule.theUsersList.indexOf(djId) + 1;

                    if (checklist33 !== -1)
                    {
                        bot.speak('@' + userModule.theUsersList[checklist33] + ' you are over the playlimit of ' + roomDefaults.playLimit + ' songs');
                    }

                    bot.remDj(djId);
                }
            }
        }
    }


    //iterates through the escort list and escorts all djs on the list off the stage.
    for (let i = 0; i < escortList.length; i++)
    {
        if (typeof escortList[i] !== 'undefined' && data.room.metadata.current_dj === escortList[i])
        {
            let lookname = userModule.theUsersList.indexOf(data.room.metadata.current_dj) + 1;
            bot.remDj(escortList[i]);

            if (lookname !== -1)
            {
                bot.speak('@' + userModule.theUsersList[lookname] + ' had enabled escortme');
            }

            let removeFromList = escortList.indexOf(escortList[i]);

            if (removeFromList !== -1)
            {
                escortList.splice(removeFromList, 1);
            }
        }
    }
});
