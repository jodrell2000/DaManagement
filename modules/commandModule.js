let authModule = require('../auth.js');
let botDefaults = require('../defaultSettings/botDefaults.js');
let roomDefaults = require('../defaultSettings/roomDefaults.js');
let musicDefaults = require('../defaultSettings/musicDefaults.js');

const commandFunctions = (bot) => {
    function logMe(logLevel, message) {
        if (logLevel === 'error') {
            console.log("commandFunctions:" + logLevel + "->" + message + "\n");
        } else {
            if (bot.debug) {
                console.log("commandFunctions:" + logLevel + "->" + message + "\n");
            }
        }
    }

    return {

        parseChat: function (data, userFunctions, botFunctions, roomFunctions, songFunctions, chatFunctions) {
            const text = data.text; //the most recent text in the chatbox on turntable

            if (text.match(/^\/autodj$/) && userFunctions.isModerator() === true) {
                bot.addDj();
            } else if (text.match(/^\/playlist/)) {
                if (botDefaults.botPlaylist !== null) {
                    bot.speak('There are currently ' + botDefaults.botPlaylist.length + ' songs in my playlist.');
                }
            } else if (text.match(/^\/randomSong$/) && userFunctions.isModerator() === true) {
                if (botFunctions.randomOnce() !== 1) {
                    let ez = 0;
                    bot.speak("Reorder initiated.");
                    botFunctions.incrementRandomOnce();
                    let reorder = setInterval(function () {
                        if (ez <= botDefaults.botPlaylist.length) {
                            let nextId = Math.ceil(Math.random() * botDefaults.botPlaylist);
                            bot.playlistReorder(ez, nextId);
                            console.log("Song " + ez + " changed.");
                            ez++;
                        } else {
                            clearInterval(reorder);
                            console.log("Reorder Ended");
                            bot.speak("Reorder completed.");
                            botFunctions.decrementRandomOnce();
                        }
                    }, 1000);
                } else {
                    bot.pm('error, playlist reordering is already in progress', data.userid);
                }
            } else if (text.match('turntable.fm/') && !text.match('turntable.fm/' + roomDefaults.ttRoomName) && !userFunctions.isModerator() && data.userid !== authModule.USERID) {
                bot.boot(data.userid, 'do not advertise other rooms here');
            } else if (text.match('/bumptop') && userFunctions.isModerator() === true) {
                if (roomDefaults.queue === true) {
                    let topOfQueue = data.text.slice(10);
                    let index35 = userFunctions.queueList().indexOf(topOfQueue);
                    let index46 = userFunctions.queueName().indexOf(topOfQueue);
                    let index80 = userFunctions.theUsersList().indexOf(topOfQueue);
                    let index81 = userFunctions.theUsersList()[index80];
                    let index82 = userFunctions.theUsersList()[index80 - 1];
                    if (index35 !== -1 && index80 !== -1) {
                        clearTimeout(roomFunctions.queueTimer());
                        botFunctions.setSayOnce(true);
                        userFunctions.queueList().splice(index35, 2);
                        userFunctions.queueList().unshift(index81, index82);
                        userFunctions.queueName().splice(index46, 1);
                        userFunctions.queueName().unshift(index81);
                        let temp92 = 'The queue is now: ';
                        for (let po = 0; po < userFunctions.queueName().length; po++) {
                            if (po !== (userFunctions.queueName().length - 1)) {
                                temp92 += userFunctions.queueName()[po] + ', ';
                            } else if (po === (userFunctions.queueName().length - 1)) {
                                temp92 += userFunctions.queueName()[po];
                            }
                        }
                        bot.speak(temp92);
                    }
                }
            } else if (text.match(/^\/stalk/) && userFunctions.isModerator() === true) {
                let stalker = text.substring(8);
                bot.getUserId(stalker, function (data6) {
                    bot.stalk(data6.userid, allInformations = true, function (data4) {
                        if (data4.success !== false) {
                            bot.speak('User found in room: http://turntable.fm/' + data4.room.shortcut);
                        } else {
                            bot.speak('User not found, they may be offline or in the lobby, they may also have just joined a room, or they may not exist');
                        }
                    });
                });
            } else if (text.match(/^\/djafk/)) {
                if (userFunctions.AFK() === true) //afk limit turned on?
                {
                    if (userFunctions.currentDJs().length !== 0) //any dj's on stage?
                    {
                        let afkDjs = 'dj afk time: ';

                        for (let ijhp = 0; ijhp < userFunctions.currentDJs().length; ijhp++) {
                            let lastUpdate = Math.floor((Date.now() - userFunctions.lastSeen()[userFunctions.currentDJs()[ijhp]]) / 1000 / 60); //their afk time in minutes
                            let whatIsTheName = userFunctions.theUsersList().indexOf(userFunctions.currentDJs()[ijhp]); //their name

                            if (userFunctions.currentDJs()[ijhp] !== userFunctions.currentDJs()[userFunctions.currentDJs().length - 1]) {
                                afkDjs += userFunctions.theUsersList()[whatIsTheName + 1] + ': ' + lastUpdate + ' mins, ';
                            } else {
                                afkDjs += userFunctions.theUsersList()[whatIsTheName + 1] + ': ' + lastUpdate + ' mins';
                            }
                        }
                        bot.speak(afkDjs);
                    } else {
                        bot.pm('error, there are currently no dj\'s on stage.', data.userid);
                    }
                } else {
                    bot.pm('error, the dj afk timer has to be active for me to report afk time.', data.userid);
                }
            } else if (text.match(/^\/position/)) {
                let checkPosition = userFunctions.queueName().indexOf(data.name);

                if (checkPosition !== -1 && roomDefaults.queue === true) //if person is in the queue and queue is active
                {
                    bot.speak('@' + userFunctions.name() + ' you are currently in position number ' + (checkPosition + 1) + ' in the queue');
                } else if (checkPosition === -1 && roomDefaults.queue === true) {
                    bot.speak('@' + userFunctions.name() + ' i can\'t tell you your position unless you are currently in the queue');
                } else {
                    bot.speak('@' + userFunctions.name() + ' there is currently no queue');
                }
            } else if (text.match(/^\/lengthLimit/) && userFunctions.isModerator() === true) {
                if (musicDefaults.LIMIT === true) {
                    musicDefaults.LIMIT = false;
                    bot.speak('the song length limit is now inactive');
                } else {
                    musicDefaults.LIMIT = true;
                    bot.speak('the song length limit is now active');
                }
            } else if (text.match(/^\/botstatus/) && userFunctions.isModerator() === true) {
                let whatsOn = '';

                if (botDefaults.autoBop === true) {
                    whatsOn += 'autoBop: On, ';
                } else {
                    whatsOn += 'autoBop: Off, ';
                }
                if (roomDefaults.queue === true) {
                    whatsOn += 'queue: On, ';
                } else {
                    whatsOn += 'queue: Off, ';
                }
                if (userFunctions.AFK() === true) {
                    whatsOn += 'dj afk limit: On, ';
                } else {
                    whatsOn += 'dj afk limit: Off, ';
                }
                if (botDefaults.getonstage === true) {
                    whatsOn += 'autodjing: On, ';
                } else {
                    whatsOn += 'autodjing: Off, ';
                }
                if (roomDefaults.EVENTMESSAGE === true) {
                    whatsOn += 'event message: On, ';
                } else {
                    whatsOn += 'event message: Off, ';
                }
                if (roomDefaults.MESSAGE === true) {
                    whatsOn += 'room message: On, ';
                } else {
                    whatsOn += 'room message: Off, ';
                }
                if (roomFunctions.GREET() === true) {
                    whatsOn += 'greeting message: On, ';
                } else {
                    whatsOn += 'greeting message: Off, ';
                }
                if (musicDefaults.voteSkip === true) {
                    whatsOn += 'voteskipping: On, ';
                } else {
                    whatsOn += 'voteskipping: Off, ';
                }
                if (userFunctions.roomAFK() === true) {
                    whatsOn += 'audience afk limit: On, ';
                } else {
                    whatsOn += 'audience afk limit: Off, ';
                }
                if (roomDefaults.SONGSTATS === true) {
                    whatsOn += 'song stats: On, ';
                } else {
                    whatsOn += 'song stats: Off, ';
                }
                if (roomDefaults.kickTTSTAT === true) {
                    whatsOn += 'auto ttstat kick: On, ';
                } else {
                    whatsOn += 'auto ttstat kick: Off, ';
                }
                if (musicDefaults.LIMIT === true) {
                    whatsOn += 'song length limit: On, ';
                } else {
                    whatsOn += 'song length limit: Off, ';
                }
                if (musicDefaults.PLAYLIMIT === true) {
                    whatsOn += 'song play limit: On, ';
                } else {
                    whatsOn += 'song play limit: Off, ';
                }
                if (roomDefaults.isRefreshing === true) {
                    whatsOn += 'refreshing: On, ';
                } else {
                    whatsOn += 'refreshing: Off, ';
                }
                if (botFunctions.skipOn() === true) {
                    whatsOn += 'autoskipping: On, ';
                } else {
                    whatsOn += 'autoskipping: Off, ';
                }
                if (songFunctions.snagSong() === true) {
                    whatsOn += 'every song adding: On, ';
                } else {
                    whatsOn += 'every song adding: Off, ';
                }
                if (botDefaults.autoSnag === true) {
                    whatsOn += 'vote based song adding: On, ';
                } else {
                    whatsOn += 'vote based song adding: Off, ';
                }
                if (botFunctions.randomOnce() === 0) {
                    whatsOn += 'playlist reordering in progress?: No';
                } else {
                    whatsOn += 'playlist reordering in progress?: Yes';
                }

                bot.speak(whatsOn);
            } else if (text.match(/^\/voteskipon/) && userFunctions.isModerator() === true) {
                userFunctions.resetSkipVoteUsers();
                roomDefaults.HowManyVotesToSkip = Number(data.text.slice(12))
                if (isNaN(roomDefaults.HowManyVotesToSkip) || roomDefaults.HowManyVotesToSkip === 0) {
                    bot.speak("error, please enter a valid number");
                }

                if (!isNaN(roomDefaults.HowManyVotesToSkip) && roomDefaults.HowManyVotesToSkip !== 0) {
                    bot.speak("vote skipping is now active, current votes needed to pass " + "the vote is " + roomDefaults.HowManyVotesToSkip);
                    musicDefaults.voteSkip = true;
                    songFunctions.resetVoteCountSkip();
                    songFunctions.setVotesLeft(roomDefaults.HowManyVotesToSkip);
                }
            } else if (text.match(/^\/noTheme/) && userFunctions.isModerator() === true) {
                roomDefaults.THEME = false;
                bot.speak('The theme is now inactive');
            } else if (text.match(/^\/setTheme/) && userFunctions.isModerator() === true) {
                whatIsTheme = data.text.slice(10);
                roomDefaults.THEME = true;
                bot.speak('The theme is now set to: ' + whatIsTheme);
            } else if (text.match(/^\/theme/)) {
                if (roomDefaults.THEME === false) {
                    bot.speak('There is currently no theme, standard rules apply');
                } else {
                    bot.speak('The theme is currently set to: ' + whatIsTheme);
                }
            } else if (text.match(/^\/voteskipoff$/) && userFunctions.isModerator() === true) {
                bot.speak("vote skipping is now inactive");
                musicDefaults.voteSkip = false;
                songFunctions.resetVoteCountSkip();
                songFunctions.setVotesLeft(roomDefaults.HowManyVotesToSkip);
            } else if (text.match(/^\/skip$/) && musicDefaults.voteSkip === true) //if command matches and voteskipping is enabled
            {
                let isMaster = userFunctions.masterIds().includes(data.userid);
                let checkIfOnList = roomFunctions.skipVoteUsers().indexOf(data.userid); //check if the person using the command has already voted
                let checkIfMaster = userFunctions.masterIds().indexOf(roomFunctions.lastdj()); //is the currently playing dj on the master id's list?

                if ((checkIfOnList === -1 || isMaster) && data.userid !== authModule.USERID) //if command user has not voted and command user is not the bot
                {
                    songFunctions.addToVoteCountSkip(); //add one to the total count of votes for the current song to be skipped
                    songFunctions.decrementVotesLeft(); //decrement votes left by one (the votes remaining till the song will be skipped)
                    roomFunctions.skipVoteUsers().unshift(data.userid); //add them to an array to make sure that they can't vote again this song

                    let findLastDj = userFunctions.theUsersList().indexOf(roomFunctions.lastdj()); //the index of the currently playing dj's userid in the theUser's list
                    if (songFunctions.votesLeft() !== 0 && checkIfMaster === -1) //if votesLeft has not reached zero and the current dj is not on the master id's list
                    {
                        //the bot will say the following
                        bot.speak("Current Votes for a song skip: " + songFunctions.voteCountSkip() +
                            " Votes needed to skip the song: " + roomDefaults.HowManyVotesToSkip);
                    }
                    if (songFunctions.votesLeft() === 0 && checkIfMaster === -1 && !isNaN(roomDefaults.HowManyVotesToSkip)) //if there are no votes left and the current dj is not on the master list and the
                    { //the amount of votes set was a valid number
                        bot.speak("@" + userFunctions.theUsersList()[findLastDj + 1] + " you have been voted off stage");
                        bot.remDj(roomFunctions.lastdj()); //remove the current dj and display the above message
                    }
                } else //else the command user has already voted
                {
                    bot.pm('sorry but you have already voted, only one vote per person per song is allowed', data.userid);
                }
            } else if (text.match(/^\/afkon/) && userFunctions.isModerator() === true) {
                userFunctions.enableAFK();
                bot.speak('the afk list is now active.');
                for (let z = 0; z < userFunctions.currentDJs().length; z++) {
                    userFunctions.justSaw(userFunctions.currentDJs()[z], 'justSaw');
                    userFunctions.justSaw(userFunctions.currentDJs()[z], 'justSaw1');
                    userFunctions.justSaw(userFunctions.currentDJs()[z], 'justSaw2');
                }
            } else if (text.match(/^\/afkoff/) && userFunctions.isModerator() === true) {
                userFunctions.disableAFK();
                bot.speak('the afk list is now inactive.');
            } else if (text.match(/^\/roomafkon/) && userFunctions.isModerator() === true) {
                userFunctions.enableRoomAFK();
                bot.speak('the audience afk list is now active.');
                for (let zh = 0; zh < userFunctions.userIDs().length; zh++) {
                    let isDj2 = userFunctions.currentDJs().indexOf(userFunctions.userIDs()[zh])
                    if (isDj2 === -1) {
                        userFunctions.justSaw(userFunctions.userIDs()[zh], 'justSaw3');
                        userFunctions.justSaw(userFunctions.userIDs()[zh], 'justSaw4');
                    }
                }
            } else if (text.match(/^\/roomafkoff/) && userFunctions.isModerator() === true) {
                userFunctions.disableRoomAFK();
                bot.speak('the audience afk list is now inactive.');

            } else if (text.match(/^\/djplays/)) {
                chatFunctions.botSpeak(chatFunctions.buildDJPlaysMessage(userFunctions));
            } else if (text.match(/^\/skipsong/) && userFunctions.isModerator() === true) {
                if (roomFunctions.checkWhoIsDj() === authModule.USERID) {
                    bot.speak("Sorry...I'll play something better next time!");
                    bot.skip();
                } else {
                    bot.pm('error, that command only skips the bots currently playing song', data.userid);
                }
            } else if (text.match(/^\/mytime/)) {
                let msecPerMinute1 = 1000 * 60;
                let msecPerHour1 = msecPerMinute1 * 60;
                let msecPerDay1 = msecPerHour1 * 24;
                let endTime1 = Date.now();
                let currentTime1 = endTime1 - userFunctions.myTime()[data.userid];

                let days1 = Math.floor(currentTime1 / msecPerDay1);
                currentTime1 = currentTime1 - (days1 * msecPerDay1);

                let hours1 = Math.floor(currentTime1 / msecPerHour1);
                currentTime1 = currentTime1 - (hours1 * msecPerHour1);

                let minutes1 = Math.floor(currentTime1 / msecPerMinute1);

                bot.getProfile(data.userid, function (data6) {
                    bot.speak('@' + data6.name + ' you have been in the room for: ' + days1 + ' days, ' + hours1 + ' hours, ' + minutes1 + ' minutes');
                });
            } else if (text.match(/^\/uptime/)) {
                let msecPerMinute = 1000 * 60;
                let msecPerHour = msecPerMinute * 60;
                let msecPerDay = msecPerHour * 24;
                botFunctions.setUptimeTime(Date.now());
                let currentTime = botFunctions.uptimeTime() - botFunctions.botStartTime();

                let days = Math.floor(currentTime / msecPerDay);
                currentTime = currentTime - (days * msecPerDay);

                let hours = Math.floor(currentTime / msecPerHour);
                currentTime = currentTime - (hours * msecPerHour);

                let minutes = Math.floor(currentTime / msecPerMinute);

                bot.speak('bot uptime: ' + days + ' days, ' + hours + ' hours, ' + minutes + ' minutes');
            } else if (text.match(/^\/songstats/) && userFunctions.isModerator() === true) {
                if (roomDefaults.SONGSTATS === true) {
                    roomDefaults.SONGSTATS = false;
                    bot.speak('song stats is now inactive');
                } else if (roomDefaults.SONGSTATS === false) {
                    roomDefaults.SONGSTATS = true;
                    bot.speak('song stats is now active');
                }
            } else if (text.match(/^\/props/)) {
                bot.speak('@' + userFunctions.name() + ' gives ' + '@' + songFunctions.dj() + ' an epic high :hand:');
            } else if (text.match(/^\/whosrefreshing/)) {
                if (userFunctions.refreshList().length !== 0) {
                    let whosRefreshing = 'refreshing: ';
                    let namesOfRefresher;

                    for (let i = 0; i < userFunctions.refreshList().length; i++) {
                        namesOfRefresher = userFunctions.theUsersList().indexOf(data.userid) + 1;

                        if (i < userFunctions.refreshList().length - 1) {
                            whosRefreshing += userFunctions.theUsersList()[namesOfRefresher] + ', ';
                        } else {
                            whosRefreshing += userFunctions.theUsersList()[namesOfRefresher];
                        }
                    }

                    bot.speak(whosRefreshing);
                } else {
                    bot.speak('no one is currently refreshing');
                }
            } else if (text.match(/^\/refreshoff/) && userFunctions.isModerator() === true) {
                bot.speak('refreshing has been disabled');
                roomDefaults.isRefreshing = false;
            } else if (text.match(/^\/refreshon/) && userFunctions.isModerator() === true) {
                bot.speak('refreshing has been enabled');
                roomDefaults.isRefreshing = true;
            } else if (text.match(/^\/refresh/)) {
                if (typeof (data.userid) == 'undefined') {
                    bot.speak('failed to add to refresh list, please try the command again');
                } else {
                    let isRefresherOnStage = userFunctions.currentDJs().indexOf(data.userid); //are they a dj
                    let hasRefreshAlreadyBeenUsed = userFunctions.refreshList().indexOf(data.userid); //are they already being refreshed?
                    let whatIsRefresherName = userFunctions.theUsersList().indexOf(data.userid) + 1;
                    let numberRepresent = (roomDefaults.amountOfTimeToRefresh / 60);

                    if (hasRefreshAlreadyBeenUsed !== -1) //if they are already being refreshed
                    {
                        clearTimeout(userFunctions.refreshTimer[data.userid]); //clear their timeout
                        delete userFunctions.refreshTimer[data.userid];
                        userFunctions.refreshList().splice(hasRefreshAlreadyBeenUsed, 1); //remove them from the refresh list

                        bot.speak('@' + userFunctions.theUsersList()[whatIsRefresherName] + ' you have been removed from the refresh list');
                    } else {
                        if (roomDefaults.isRefreshing) //if /refresh is enabled
                        {
                            if (isRefresherOnStage !== -1) //is the person on stage
                            {
                                userFunctions.refreshList().push(data.userid);
                                userFunctions.refreshTimer[data.userid] = setTimeout(function () {
                                    hasRefreshAlreadyBeenUsed = userFunctions.refreshList().indexOf(data.userid); //recalculate their position

                                    if (hasRefreshAlreadyBeenUsed !== -1) {
                                        userFunctions.refreshList().splice(hasRefreshAlreadyBeenUsed, 1); //remove them from the refresh list
                                        clearTimeout(userFunctions.refreshTimer[data.userid]); //clear their timeout
                                        delete userFunctions.playLimitOfRefresher[data.userid] //delete the copy of their play limit
                                        delete userFunctions.refreshTimer[data.userid];
                                    }
                                }, 1000 * roomDefaults.amountOfTimeToRefresh);

                                if (typeof (userFunctions.djSongCount(data.userid)) == 'object') {
                                    userFunctions.playLimitOfRefresher[data.userid] = userFunctions.djSongCount(data.userid).nbSong; //save a copy of their play limit
                                }

                                if (numberRepresent < 1) {
                                    bot.speak('@' + userFunctions.theUsersList()[whatIsRefresherName] + ' i\'ll hold your spot on stage for the next ' + roomDefaults.amountOfTimeToRefresh + ' seconds');
                                } else if (numberRepresent === 1) {
                                    bot.speak('@' + userFunctions.theUsersList()[whatIsRefresherName] + ' i\'ll hold your spot on stage for the next ' + numberRepresent + ' minute');
                                } else {
                                    bot.speak('@' + userFunctions.theUsersList()[whatIsRefresherName] + ' i\'ll hold your spot on stage for the next ' + numberRepresent + ' minutes');
                                }
                            } else {
                                bot.pm('you have to be on stage to add yourself to the refresh list', data.userid);
                            }
                        } else {
                            bot.pm('refreshing is currently disabled', data.userid);
                        }
                    }
                }
            } else if (text.match(/^\/greeton/) && userFunctions.isModerator() === true) {
                bot.speak('room greeting: On');
                roomFunctions.enableGreet();
            } else if (text.match(/^\/greetoff/) && userFunctions.isModerator() === true) {
                bot.speak('room greeting: Off');
                roomFunctions.disableGreet();
            } else if (text.match(/^\/eventmessageOn/) && userFunctions.isModerator() === true) {
                bot.speak('event message: On');
                roomDefaults.EVENTMESSAGE = true;
            } else if (text.match(/^\/eventmessageOff/) && userFunctions.isModerator() === true) {
                bot.speak('event message: Off');
                roomDefaults.EVENTMESSAGE = false;
            } else if (text.match(/^\/messageOn/) && userFunctions.isModerator() === true) {
                bot.speak('message: On');
                roomDefaults.MESSAGE = true;
            } else if (text.match(/^\/messageOff/) && userFunctions.isModerator() === true) {
                bot.speak('message: Off');
                roomDefaults.MESSAGE = false;
            } else if (text.match(/^\/pmcommands/)) {
                bot.pm('that command only works in the pm', data.userid);
            } else if (text.match(/^\/commands/)) {
                bot.speak('the commands are  /awesome, ' +
                    ' /mom, /cheers, /fanratio @, /whosrefreshing, /refresh, /whatsplaylimit, /warnme, /theme, /up?, /djafk, /mytime, /playlist, /afk, /whosafk, /coinflip, /hello, /escortme, /stopescortme, /fanme, /unfanme, /roominfo, /beer, /dice, /props, /m, /getTags, ' +
                    '/skip, /dive, /dance, /surf, /uptime, /djplays, /admincommands, /queuecommands, /pmcommands');
            } else if (text.match(/^\/queuecommands/)) {
                bot.speak('the commands are /queue, /position, /queuewithnumbers, /removefromqueue @, /removeme, /move, /addme, /queueOn, /queueOff, /bumptop @');
            } else if (text.match(/^\/admincommands/) && userFunctions.isModerator() === true) {
                bot.speak('the mod commands are /ban @, /unban @, /whosinmodpm, /whosrefreshing, /refreshon, /refreshoff, /move, /eventmessageOn, /eventmessageOff, /boot, /playminus @, /skipon, /snagevery, /autosnag, /botstatus, /skipoff, /noTheme, /lengthLimit, /stalk @, /setTheme, /stage @, /randomSong, /messageOn, /messageOff, /afkon, /afkoff, /skipsong, /autodj, /removedj, /lame, ' +
                    '/snag, /removesong, /playLimitOn, /playLimitOff, /voteskipon #, /voteskipoff, /greeton, /greetoff, /getonstage, /banstage @, /unbanstage @, /userid @, /inform, /whobanned, ' +
                    '/whostagebanned, /roomafkon, /roomafkoff, /songstats, /username, /modpm');
            } else if (text.match(/^\/tableflip/)) {
                bot.speak('/tablefix');
            } else if (text.match('/awesome')) {
                bot.vote('up');
            } else if (text.match('/lame') && userFunctions.isModerator() === true) {
                bot.vote('down');
            } else if (text.match(/^\/removedj$/) && userFunctions.isModerator() === true) {
                bot.remDj();
            } else if (text.match(/^\/inform$/) && userFunctions.isModerator() === true) {
                if (roomFunctions.checkWhoIsDj() !== null) {
                    if (userFunctions.informTimer === null) {
                        let checkDjsName = userFunctions.theUsersList().indexOf(roomFunctions.lastdj()) + 1;
                        bot.speak('@' + userFunctions.theUsersList()[checkDjsName] + ' your song is not the appropriate genre for this room, please skip or you will be removed in 20 seconds');
                        userFunctions.informTimer = setTimeout(function () {
                            bot.pm('you took too long to skip your song', roomFunctions.lastdj());
                            bot.remDj(roomFunctions.lastdj());
                            userFunctions.informTimer = null;
                        }, 20 * 1000);
                    } else {
                        bot.pm('the /inform timer has already been activated, it may be used only once per song', data.userid);
                    }
                } else {
                    bot.pm('you must wait one song since the bot has started to use that command', data.userid);
                }
            } else if (text.match('/cheers')) {
                bot.speak('@' + userFunctions.name() + ' raises their glass for a toast');
            } else if (text.match(/^\/mom$/)) {
                let x = Math.round(Math.random() * 3);
                switch (x) {
                    case 0:
                        bot.speak('@' + userFunctions.name() + ' ur mom is fat');
                        break;
                    case 1:
                        bot.speak('@' + userFunctions.name() + ' yo momma sooo fat....');
                        break;
                    case 2:
                        bot.speak('@' + userFunctions.name() + ' damn yo momma fat');
                        break;
                    case 3:
                        bot.speak('@' + userFunctions.name() + ' your mother is an outstanding member of the community ' +
                            'and well liked by all.');
                        break;
                }
            } else if (text.match('/coinflip')) {
                let y = Math.ceil(Math.random() * 2);
                switch (y) {
                    case 1:
                        bot.speak('@' + userFunctions.name() + ' i am flipping a coin... you got... heads');
                        break;
                    case 2:
                        bot.speak('@' + userFunctions.name() + ' i am flipping a coin... you got... tails');
                        break;
                }
            } else if (text.match(/^\/dance$/)) {
                bot.speak('https://media.tenor.com/images/939895eeadd796565d3ef07b7a7169f3/tenor.gif');
            } else if (text.match(/^\/frankie$/)) {
                bot.speak('Relax!');
            } else if (text.match(/^\/hair$/)) {
                bot.speak('Jersey Hair: Engage');
            } else if (text.match(/^\/eddie$/)) {
                bot.speak('PARTY ALL THE TIME!');
            } else if (text.match(/^\/lonely$/)) {
                bot.speak('Dancing with myself...');
            } else if (text.match(/^\/jump$/)) {
                bot.speak('For my love!');
            } else if (text.match(/^\/flirt$/)) {
                bot.speak('How YOU doin’?!');
            } else if (text.match(/^\/rub$/)) {
                bot.speak('It rubs the lotion on its skin or else it gets the hose again');
            } else if (text.match(/^\/wc$/)) {
                bot.speak('Everybody Wang Chung tonight.  Everybody have fun tonight.');
            } else if (text.match(/^\/alice$/)) {
                bot.speak('We’re not worthy! We’re not worthy');
            } else if (text.match(/^\/feart$/)) {
                bot.speak('It STINKS in here!');
            } else if (text.match(/^\/suggestions$/)) {
                bot.speak(':robot: command suggestions: https://bit.ly/80scd');
            } else if (text.match(/^\/rules$/)) {
                bot.speak(':memo: official room rules: https://bit.ly/ilt80s');
            } else if (text.match(/^\/skipon$/) && userFunctions.isModerator() === true) {
                bot.speak('i am now skipping my songs');
                botFunctions.setSkipOn(true);
            } else if (text.match(/^\/skipoff$/) && userFunctions.isModerator() === true) {
                bot.speak('i am no longer skipping my songs');
                botFunctions.setSkipOn(false);
            } else if (text.match(/^\/fanratio/)) //this one courtesy of JenTheInstigator of turntable.fm
            {
                let tmpuser = data.text.substring(11);
                bot.getUserId(tmpuser, function (data1) {
                    let tmpid = data1.userid;
                    bot.getProfile(tmpid, function (data2) {
                        if (typeof (data1.userid) !== 'undefined') {
                            let tmp = tmpuser + " has " + data2.points + " points and " + data2.fans + " fans, for a ratio of " + Math.round(data2.points / data2.fans) + ".";
                            bot.speak(tmp);
                        } else {
                            bot.speak('I\m sorry I don\'t know that one');
                        }
                    });
                });
            } else if (text.match(/^\/getonstage$/) && userFunctions.isModerator() === true) {
                if (botDefaults.getonstage === false) {
                    bot.speak('I am now auto djing');
                    botDefaults.getonstage = true;
                } else if (botDefaults.getonstage === true) {
                    bot.speak('I am no longer auto djing');
                    botDefaults.getonstage = false;
                }
            } else if (text.match('/beer')) {
                let botname = userFunctions.theUsersList().indexOf(authModule.USERID) + 1;
                bot.speak('@' + userFunctions.theUsersList()[botname] + ' hands ' + '@' + userFunctions.name() + ' a nice cold :beer:');
            } else if (data.text === '/escortme') {
                let theUserID = data.userid;
                if ( !userFunctions.escortMeIsEnabled() && userFunctions.isCurrentDJ(theUserID) ) {
                    userFunctions.addEscortMeToUser(theUserID);
                    bot.speak('@' + userFunctions.getUsername(theUserID) + ' you will be escorted after you play your song');
                }
            } else if (data.text === '/stopescortme') {
                bot.speak('@' + userFunctions.name() + ' you will no longer be escorted after you play your song');
                let escortIndex = userFunctions.escortMeList().indexOf(data.userid);
                if (escortIndex !== -1) {
                    userFunctions.escortMeList().splice(escortIndex, 1);
                }
            } else if (data.text === '/roominfo') {
                if (typeof roomDefaults.detail !== 'undefined') {
                    bot.speak(roomDefaults.detail);
                }
            } else if (data.text === '/fanme') {
                bot.speak('@' + userFunctions.name() + ' i am now your fan!');
                userFunctions.myID = data.userid;
                bot.becomeFan(userFunctions.myID);
            } else if (data.text === '/getTags') {
                bot.speak('artist name: ' + songFunctions.artist() + ', song name: ' + songFunctions.song() + ', album: ' + songFunctions.album() + ', genre: ' + songFunctions.genre());
            } else if (data.text === '/dice') {
                let random = Math.floor(Math.random() * 12 + 1);
                bot.speak('@' + userFunctions.name() + ' i am rolling the dice... your number is... ' + random);
            } else if (text.match(/^\/dive/)) {
                let checkDj = userFunctions.currentDJs().indexOf(data.userid);
                if (checkDj !== -1) {
                    bot.remDj(data.userid);
                } else {
                    bot.pm('you must be on stage to use that command.', data.userid);
                }
            } else if (text.match('/surf')) {
                bot.speak('http://25.media.tumblr.com/tumblr_mce8z6jN0d1qbzqexo1_r1_500.gif');
            } else if (data.text === '/unfanme') {
                bot.speak('@' + userFunctions.name() + ' i am no longer your fan.');
                userFunctions.myID = data.userid;
                bot.removeFan(userFunctions.myID);
            } else if (text.match(/^\/move/) && userFunctions.isModerator() === true) {
                let moveName = data.text.slice(5);
                let tempName = moveName.split(" ");

                if (typeof (tempName[1]) !== 'undefined') {
                    let whatIsTheirName = tempName[1].substring(1); //cut the @ off
                }

                let areTheyInTheQueue = userFunctions.queueName().indexOf(whatIsTheirName); //name in queueName
                let areTheyInTheQueueList = userFunctions.queueList().indexOf(whatIsTheirName); //name in queuList
                let whatIsTheirUserid2 = userFunctions.theUsersList().indexOf(whatIsTheirName); //userid

                //if either name or userid is undefined, do not perform a move operation
                if (typeof userFunctions.theUsersList()[whatIsTheirUserid2 - 1] == 'undefined' || typeof tempName[1] == 'undefined') {
                    if (typeof userFunctions.theUsersList()[whatIsTheirUserid2 - 1] != 'undefined') {
                        bot.pm('failed to perform move operation, please try the command again', userFunctions.theUsersList()[whatIsTheirUserid2 - 1]);
                    } else {
                        bot.speak('failed to perform move operation, please try the command again');
                    }
                } else {
                    if (roomDefaults.queue === true) //if queue is turned on
                    {
                        if (tempName.length === 3 && areTheyInTheQueue !== -1) //if three parameters, and name found
                        {
                            if (!isNaN(tempName[2])) {
                                if (tempName[2] <= 1) //if position given lower than 1
                                {
                                    userFunctions.queueName().splice(areTheyInTheQueue, 1); //remove them
                                    userFunctions.queueList().splice(areTheyInTheQueueList, 2); //remove them
                                    userFunctions.queueName().splice(0, 0, whatIsTheirName); //add them to beggining
                                    userFunctions.queueList().splice(0, 0, whatIsTheirName, userFunctions.theUsersList()[whatIsTheirUserid2 - 1]); //add them to beggining
                                    clearTimeout(roomFunctions.queueTimer); //clear timeout because first person has been replaced
                                    botFunctions.setSayOnce(true);
                                    bot.speak(whatIsTheirName + ' has been moved to position 1 in the queue');
                                } else if (tempName[2] >= userFunctions.queueName().length) {
                                    if (userFunctions.queueName()[areTheyInTheQueue] === userFunctions.queueName()[0]) //if position given higher than end
                                    {
                                        clearTimeout(roomFunctions.queueTimer()); //clear timeout because first person has been replaced
                                        botFunctions.setSayOnce(true);
                                    }
                                    userFunctions.queueName().splice(areTheyInTheQueue, 1); //remove them
                                    userFunctions.queueList().splice(areTheyInTheQueueList, 2); //remove them
                                    userFunctions.queueName().splice(userFunctions.queueName().length + 1, 0, whatIsTheirName); //add them to end
                                    userFunctions.queueList().splice(userFunctions.queueName().length + 1, 0, whatIsTheirName, userFunctions.theUsersList()[whatIsTheirUserid2 - 1]); //add them to end

                                    bot.speak(whatIsTheirName + ' has been moved to position ' + userFunctions.queueName().length + ' in the queue');
                                } else {
                                    if (userFunctions.queueName()[areTheyInTheQueue] === userFunctions.queueName()[0]) {
                                        clearTimeout(roomFunctions.queueTimer()); //clear timeout because first person has been replaced
                                        botFunctions.setSayOnce(true);
                                    }

                                    userFunctions.queueName().splice(areTheyInTheQueue, 1); //remove them
                                    userFunctions.queueList().splice(areTheyInTheQueueList, 2); //remove them
                                    userFunctions.queueName().splice((Math.round(tempName[2]) - 1), 0, whatIsTheirName); //add them to given position shift left 1 because array starts at 0
                                    userFunctions.queueList().splice(((Math.round(tempName[2]) - 1) * 2), 0, whatIsTheirName, userFunctions.theUsersList()[whatIsTheirUserid2 - 1]); //same as above


                                    bot.speak(whatIsTheirName + ' has been moved to position ' + Math.round(tempName[2]) + ' in the queue');
                                }
                            } else {
                                bot.pm('error, position parameter passed was not a number, please pass a valid integer arguement', data.userid);
                            }

                        } else if (tempName.length !== 3) //if invalid number of parameters
                        {
                            bot.pm('error, invalid number of parameters, must have /move name #', data.userid);
                        } else if (areTheyInTheQueue === -1) //if name not found
                        {
                            bot.pm('error, name not found', data.userid);
                        }
                    } else {
                        bot.pm('error, queue must turned on to use this command', data.userid);
                    }
                }
            } else if (text.match(/^\/m/) && !text.match(/^\/me/) && userFunctions.isModerator() === true) {
                bot.speak(text.substring(3));
            } else if (text.match(/^\/hello$/)) {
                bot.speak('Hey! How are you @' + userFunctions.getUsername(data.userid) + '?');
            } else if (text.match(/^\/snagevery$/) && userFunctions.isModerator() === true) {
                if (songFunctions.snagSong() === true) {
                    songFunctions.snagSong = false;
                    bot.speak('I am no longer adding every song that plays');
                } else if (songFunctions.snagSong() === false) {
                    songFunctions.snagSong = true; //this is for /snagevery
                    botDefaults.autoSnag = false; //this turns off /autosnag
                    bot.speak('I am now adding every song that plays, /autosnag has been turned off');
                }
            } else if (text.match(/^\/autosnag/) && userFunctions.isModerator() === true) {
                if (botDefaults.autoSnag === false) {
                    botDefaults.autoSnag = true; //this is for /autosnag
                    songFunctions.snagSong = false; //this is for /snagevery
                    bot.speak('I am now adding every song that gets at least (' + botDefaults.howManyVotes + ') awesome\'s, /snagevery has been turned off');
                } else if (botDefaults.autoSnag === true) {
                    botDefaults.autoSnag = false;
                    bot.speak('vote snagging has been turned off');
                }
            } else if (text.match(/^\/snag/) && userFunctions.isModerator() === true) {
                if (songFunctions.getSong() !== null && botDefaults.botPlaylist !== null) {
                    let found = false;
                    for (let igh = 0; igh < botDefaults.botPlaylist.length; igh++) {
                        if (botDefaults.botPlaylist[igh]._id === songFunctions.getSong()) {
                            found = true;
                            bot.speak('I already have that song');
                            break;
                        }
                    }
                    if (!found) {
                        bot.playlistAdd(songFunctions.getSong(), -1); //add song to the end of the playlist
                        bot.speak('song added');
                        let tempSongHolder = {
                            _id: songFunctions.getSong()
                        };
                        botDefaults.botPlaylist.push(tempSongHolder);
                    }
                } else {
                    bot.pm('error, you can\'t snag the song that\'s playing when the bot enters the room', data.userid);
                }
            } else if (text.match(/^\/removesong$/) && userFunctions.isModerator() === true) {
                if (roomFunctions.checkWhoIsDj() === authModule.USERID) {
                    bot.skip();
                    bot.playlistRemove(-1);
                    botDefaults.botPlaylist.splice(botDefaults.botPlaylist.length - 1, 1);
                    bot.speak('the last snagged song has been removed.');
                } else {
                    botDefaults.botPlaylist.splice(botDefaults.botPlaylist.length - 1, 1);
                    bot.playlistRemove(-1);
                    bot.speak('the last snagged song has been removed.');
                }
            } else if (text.match(/^\/queuewithnumbers$/)) {
                if (queue === true && roomDefaults.userFunctions.queueName().length !== 0) {
                    let temp95 = 'The queue is now: ';
                    for (let kl = 0; kl < userFunctions.queueName().length; kl++) {
                        if (kl !== (userFunctions.queueName().length - 1)) {
                            temp95 += userFunctions.queueName()[kl] + ' [' + (kl + 1) + ']' + ', ';
                        } else if (kl === (userFunctions.queueName().length - 1)) {
                            temp95 += userFunctions.queueName()[kl] + ' [' + (kl + 1) + ']';
                        }
                    }
                    bot.speak(temp95);
                } else if (roomDefaults.queue === true) {
                    bot.speak('The queue is currently empty.');
                } else {
                    bot.speak('There is currently no queue.');
                }
            } else if (text.match(/^\/queue$/)) {
                if (roomDefaults.queue === true) {
                    bot.speak( userFunctions.buildQueueMessage() );
                }
            } else if (text.match(/^\/playminus/) && userFunctions.isModerator() === true) {
                if (musicDefaults.PLAYLIMIT === true) //is the play limit on?
                {
                    let playMinus = data.text.slice(12);
                    let areTheyInRoom = userFunctions.theUsersList().indexOf(playMinus);
                    let areTheyDj = userFunctions.currentDJs().indexOf(userFunctions.theUsersList()[areTheyInRoom - 1]);

                    if (areTheyInRoom !== -1) //are they in the room?
                    {
                        if (areTheyDj !== -1) //are they a dj?
                        {
                            if (typeof (userFunctions.djSongCount(userFunctions.theUsersList()[areTheyInRoom - 1])) != 'undefined') {
                                if (!userFunctions.djSongCount(userFunctions.theUsersList()[areTheyInRoom - 1]).nbSong <= 0) //is their play count already 0 or lower?
                                {
                                    userFunctions.decrementDJPlayCount(userFunctions.theUsersList()[areTheyInRoom - 1]);
                                    bot.speak(userFunctions.theUsersList()[areTheyInRoom] + '\'s play count has been reduced by one');
                                } else {
                                    bot.pm('error, that user\'s play count is already at zero', data.userid);
                                }
                            } else {
                                bot.pm('something weird happened!, attemping to recover now', data.userid);
                                if (typeof userFunctions.theUsersList()[areTheyInRoom - 1] != 'undefined') {
                                    //recover here
                                    userFunctions.setDJPlayCount(userFunctions.theUsersList()[areTheyInRoom - 1], 0);
                                }
                            }
                        } else {
                            bot.pm('error, that user is not currently djing', data.userid);
                        }
                    } else {
                        bot.pm('error, that user is not currently in the room', data.userid);
                    }
                } else {
                    bot.pm('error, the play limit must be turned on in order for me to decrement play counts', data.userid);
                }
            } else if (text.match(/^\/whobanned$/) && userFunctions.isModerator() === true) {
                if (roomDefaults.blackList.length !== 0) {
                    bot.speak('ban list: ' + roomDefaults.blackList);
                } else {
                    bot.speak('The ban list is empty.');
                }
            } else if (text.match(/^\/whostagebanned$/) && userFunctions.isModerator() === true) {
                if (roomFunctions.stageBannedList().length !== 0) {
                    bot.speak('banned from stage: ' + roomFunctions.stageBannedList());
                } else {
                    bot.speak('The banned from stage list is currently empty.');
                }
            } else if (text.match('/removefromqueue') && roomDefaults.queue === true) {
                if (userFunctions.isModerator() === true) {
                    let removeFromQueue = data.text.slice(18);
                    let index5 = userFunctions.queueList().indexOf(removeFromQueue);
                    let index6 = userFunctions.queueName().indexOf(removeFromQueue);
                    if (index5 !== -1) {
                        if (userFunctions.queueName()[index6] === userFunctions.queueName()[0]) {
                            clearTimeout(roomFunctions.queueTimer());
                            botFunctions.setSayOnce(true);
                        }
                        userFunctions.queueList().splice(index5, 2);
                        userFunctions.queueName().splice(index6, 1);

                        if (userFunctions.queueName().length !== 0) {
                            let temp89 = 'The queue is now: ';
                            for (let jk = 0; jk < userFunctions.queueName().length; jk++) {
                                if (jk !== (userFunctions.queueName().length - 1)) {
                                    temp89 += userFunctions.queueName()[jk] + ', ';
                                } else if (jk === (userFunctions.queueName().length - 1)) {
                                    temp89 += userFunctions.queueName()[jk];
                                }
                            }
                            bot.speak(temp89);
                        } else {
                            bot.speak('The queue is now empty.');
                        }
                    } else {
                        bot.pm('error, no such person was found to be in the queue', data.userid);
                    }
                }
            } else if (text.match(/^\/removeme$/) && roomDefaults.queue === true) {
                if (typeof data.name == 'undefined') {
                    if (typeof (data.userid) != 'undefined') {
                        bot.pm('failed to remove from queue, please try the command again', data.userid);
                    } else {
                        bot.speak('failed to remove from queue, please try the command again');
                    }
                } else {
                    let list1 = userFunctions.queueList().indexOf(data.name);
                    let list2 = userFunctions.queueName().indexOf(data.name);

                    if (list2 !== -1 && list1 !== -1) {
                        userFunctions.queueList().splice(list1, 2);

                        if (data.name === userFunctions.queueName()[0]) {
                            clearTimeout(roomFunctions.queueTimer());
                            botFunctions.setSayOnce(true);
                        }

                        userFunctions.queueName().splice(list2, 1);

                        roomFunctions.readQueueMembers(userFunctions)
                    } else {
                        bot.pm('error, you have to be in the queue to remove yourself from the queue', data.userid);
                    }
                }
            } else if ( text.match(/^\/addme$/ ) ) {
                if (typeof data.userid == 'undefined') {
                    logMe("debug", "User is undefined");
                    bot.speak('failed to add to queue, please try the command again: undefined userID');
                } else {
                    let theMessage, addedToQueue;
                    [addedToQueue, theMessage] = userFunctions.addUserToQueue(data.userid);
                    bot.speak(userFunctions.buildQueueMessage());

                    if (!addedToQueue) bot.pm(theMessage, data.userid);
                }
            } else if (text.match(/^\/queueOn$/) && userFunctions.isModerator() === true) {
                userFunctions.resetQueueList();
                userFunctions.resetQueueNames();
                bot.speak('the queue is now active.');
                roomDefaults.queue = true;
                clearTimeout(roomFunctions.queueTimer()); //if queue is turned on again while somebody was on timeout to get on stage, then clear it
                botFunctions.setSayOnce(true);
            } else if (text.match(/^\/whatsplaylimit/)) {
                if (musicDefaults.PLAYLIMIT === true) {
                    bot.speak('the play limit is currently set to: ' + roomDefaults.playLimit + ' songs.');
                } else {
                    bot.speak('the play limit is currently turned off');
                }
            } else if (text.match(/^\/playLimitOn/) && userFunctions.isModerator() === true) {
                let playLimitNumber = Number(data.text.slice(13)); //holds given number

                if (playLimitNumber !== '') //if an additional arguement was given
                {
                    if (!isNaN(playLimitNumber) && playLimitNumber > 0) //if parameter given is a number and greater than zero
                    {
                        roomDefaults.playLimit = Math.ceil(playLimitNumber); // round play limit to make sure its not a fraction

                        bot.speak('the play limit is now active and has been set to ' +
                            roomDefaults.playLimit + ' songs. dj song counters have been reset.');

                        //reset song counters
                        for (let ig = 0; ig < userFunctions.currentDJs().length; ig++) {
                            userFunctions.initialiseDJPlayCount(userFunctions.currentDJs()[ig]);
                        }

                        musicDefaults.PLAYLIMIT = true; //mark playlimit as being on
                    } else {
                        bot.pm('invalid arguement given, the play limit must be set to an integer. ' +
                            'it can either be used as /playLimitOn or /playLimitOn #.', data.userid);

                        musicDefaults.PLAYLIMIT = false; // on failure turn it off
                    }
                } else {
                    bot.speak('the play limit is now active and has been set to the default value of ' +
                        roomDefaults.playLimit + ' songs. dj song counters have been reset.');

                    //reset song counters
                    for (let ig = 0; ig < userFunctions.currentDJs().length; ig++) {
                        userFunctions.initialiseDJPlayCount(userFunctions.currentDJs()[ig]);
                    }

                    musicDefaults.PLAYLIMIT = true; //mark playlimit as being on
                }
            } else if (text.match(/^\/playLimitOff$/) && userFunctions.isModerator() === true) {
                musicDefaults.PLAYLIMIT = false;
                bot.speak('the play limit is now inactive.');
            } else if (text.match('/surf')) {
                bot.speak('http://25.media.tumblr.com/tumblr_mce8z6jN0d1qbzqexo1_r1_500.gif');
            } else if (text.match(/^\/queueOff$/) && userFunctions.isModerator() === true) {
                bot.speak('the queue is now inactive.');
                roomDefaults.queue = false;
            } else if (text.match(/^\/warnme/)) {
                let areTheyBeingWarned = userFunctions.warnme().indexOf(data.userid);
                let areTheyDj80 = userFunctions.currentDJs().indexOf(data.userid);
                let Position56 = userFunctions.currentDJs().indexOf(roomFunctions.checkWhoIsDj()); //current djs index

                if (areTheyDj80 !== -1) //are they on stage?
                {
                    if (roomFunctions.checkWhoIsDj() != null) {
                        if (roomFunctions.checkWhoIsDj() === data.userid) {
                            bot.pm('you are currently playing a song!', data.userid);
                        } else if (userFunctions.currentDJs()[Position56] === userFunctions.currentDJs()[userFunctions.currentDJs().length - 1] &&
                            userFunctions.currentDJs()[0] === data.userid ||
                            userFunctions.currentDJs()[Position56 + 1] === data.userid) //if they aren't the next person to play a song
                        {
                            bot.pm('your song is up next!', data.userid);
                        } else {
                            if (areTheyBeingWarned === -1) //are they already being warned? no
                            {
                                userFunctions.warnme().unshift(data.userid);
                                bot.speak('@' + userFunctions.name() + ' you will be warned when your song is up next');
                            } else if (areTheyBeingWarned !== -1) //yes
                            {
                                userFunctions.warnme().splice(areTheyBeingWarned, 1);
                                bot.speak('@' + userFunctions.name() + ' you will no longer be warned');
                            }
                        }
                    } else {
                        bot.pm('you must wait one song since the bot has started up to use this command', data.userid);
                    }
                } else {
                    bot.pm('error, you must be on stage to use that command', data.userid);
                }
            } else if (text.match('/banstage') && userFunctions.isModerator() === true) {
                let ban = data.text.slice(11);
                let checkBan = roomFunctions.stageBannedList().indexOf(ban);
                let checkUser = userFunctions.theUsersList().indexOf(ban);
                if (checkBan === -1 && checkUser !== -1) {
                    roomFunctions.stageBannedList().push(userFunctions.theUsersList()[checkUser - 1], userFunctions.theUsersList()[checkUser]);
                    bot.remDj(userFunctions.theUsersList()[checkUser - 1]);
                    userFunctions.removeAsModerator();
                } else {
                    bot.pm('error, no such person was found, make sure you typed in their name correctly', data.userid);
                }
            } else if (text.match('/unbanstage') && userFunctions.isModerator() === true) {
                let ban2 = data.text.slice(13);
                userFunctions.index = roomFunctions.stageBannedList().indexOf(ban2);
                if (userFunctions.index !== -1) {
                    roomFunctions.stageBannedList().splice(roomFunctions.stageBannedList()[userFunctions.index - 1], 2);
                    userFunctions.removeAsModerator();
                    userFunctions.index = null;
                } else {
                    bot.pm('error, no such person was found, make sure you typed in their name correctly', data.userid);
                }
            } else if (text.match('/ban') && userFunctions.isModerator() === true) {
                let ban3 = data.text.slice(6);
                let checkBan5 = roomDefaults.blackList.indexOf(ban3);
                let checkUser3 = userFunctions.theUsersList().indexOf(ban3);
                if (checkBan5 === -1 && checkUser3 !== -1) {
                    roomDefaults.blackList.push(userFunctions.theUsersList()[checkUser3 - 1], userFunctions.theUsersList()[checkUser3]);
                    bot.boot(userFunctions.theUsersList()[checkUser3 - 1]);
                    userFunctions.removeAsModerator();
                } else {
                    bot.pm('error, no such person was found, make sure you typed in their name correctly', data.userid);
                }
            } else if (text.match('/unban') && userFunctions.isModerator() === true) {
                let ban6 = data.text.slice(8);
                userFunctions.index = roomDefaults.blackList.indexOf(ban6);
                if (userFunctions.index !== -1) {
                    roomDefaults.blackList.splice(roomDefaults.blackList[userFunctions.index - 1], 2);
                    userFunctions.removeAsModerator();
                    userFunctions.index = null;
                } else {
                    bot.pm('error, no such person was found, make sure you typed in their name correctly', data.userid);
                }
            } else if (text.match('/userid') && userFunctions.isModerator() === true) {
                let ban8 = data.text.slice(9);
                let checkUser8 = bot.getUserId(ban8, function (data) {
                    let userid56 = data.userid;
                    if (typeof (userid56) !== 'undefined') {
                        bot.speak(userid56);
                        userFunctions.removeAsModerator();
                    } else {
                        bot.speak('I\'m sorry that userid is undefined');
                    }
                });
            } else if (text.match('/username') && userFunctions.isModerator() === true) {
                let ban50 = data.text.slice(10);
                let tmp94 = bot.getProfile(ban50, function (data) {
                    bot.speak('' + data.name);
                });
            } else if (text.match(/^\/afk/)) {
                let isAlreadyAfk = userFunctions.afkPeople().indexOf(data.name);
                if (isAlreadyAfk === -1) {
                    if (typeof data.name == 'undefined') {
                        bot.pm('failed to add to the afk list, please try the command again', data.userid);
                    } else {
                        bot.speak('@' + userFunctions.name() + ' you are marked as afk');
                        userFunctions.afkPeople().push(data.name);
                    }
                } else if (isAlreadyAfk !== -1) {
                    bot.speak('@' + userFunctions.name() + ' you are no longer afk');
                    userFunctions.afkPeople().splice(isAlreadyAfk, 1);
                }
            } else if (text === '/up?') //works for djs on stage
            {
                let areTheyADj = userFunctions.currentDJs().indexOf(data.userid); //are they a dj?
                if (areTheyADj !== -1) //yes
                {
                    bot.speak('anybody want up?');
                } else {
                    bot.pm('error, you must be on stage to use that command', data.userid);
                }
            } else if (text.match(/^\/whosafk/)) {
                    if (userFunctions.afkPeople().length !== 0) {
                        let whosAfk = 'marked as afk: ';
                        for (let f = 0; f < userFunctions.afkPeople().length; f++) {
                            if (f !== (userFunctions.afkPeople().length - 1)) {
                                whosAfk = whosAfk + userFunctions.afkPeople()[f] + ', ';
                            } else {
                                whosAfk = whosAfk + userFunctions.afkPeople()[f];
                            }
                        }
                        bot.speak(whosAfk);
                    } else {
                        bot.speak('No one is currently marked as afk');
                    }
                }
        },

        parsePM: function (data, userFunctions, botFunctions, roomFunctions, songFunctions, chatFunctions) {

            // ===================================
            // ===================================
            // PUT SOMETHING IN HERE SO THAT YOU CAN ONLY PM COMMANDS TO THE BOT IF YOU"RE ACTUALLY IN THE ROOM
            // ===================================
            // ===================================

            let senderid = data.senderid; //the userid of the person who just pmmed the bot
            let text = data.text; //the text sent to the bot in a pm
            let name1 = userFunctions.theUsersList().indexOf(data.senderid) + 1; //the name of the person who sent the bot a pm
            let isInRoom = userFunctions.isPMerInRoom(senderid); //check to see whether pmmer is in the same room as the bot

            userFunctions.isUserModerator(data.senderid); //check to see if person pming the bot a command is a moderator or not

            //if no commands match, the pmmer is a moderator and theres more than zero people in the modpm chat
            if (userFunctions.modPM.length !== 0 && data.text.charAt(0) !== '/' && userFunctions.isModerator() === true) //if no other commands match, send dpm
            {
                let areTheyInModPm = userFunctions.modPM.indexOf(data.senderid);

                if (areTheyInModPm !== -1) {
                    for (let jhg = 0; jhg < userFunctions.modPM.length; jhg++) {
                        if (userFunctions.modPM[jhg] !== data.senderid && userFunctions.modPM[jhg] !== authModule.USERID) //this will prevent you from messaging yourself
                        {
                            bot.pm(userFunctions.theUsersList()[name1] + ' said: ' + data.text, userFunctions.modPM[jhg]);
                        }
                    }
                }
            } else if (text.match(/^\/modpm/) && userFunctions.isModerator() === true && isInRoom === true) {
                let areTheyInModPm = userFunctions.modPM.indexOf(data.senderid);

                if (areTheyInModPm === -1) //are they already in modpm? no
                {
                    userFunctions.modPM.unshift(data.senderid);
                    bot.pm('you have now entered into modpm mode, your messages ' +
                        'will go to other moderators currently in the modpm', data.senderid);
                    if (userFunctions.modPM.length !== 0) {
                        for (let jk = 0; jk < userFunctions.modPM.length; jk++) {
                            if (userFunctions.modPM[jk] !== data.senderid) {
                                bot.pm(userFunctions.theUsersList()[name1] + ' has entered the modpm chat', userFunctions.modPM[jk]); //declare user has entered chat
                            }
                        }
                    }
                } else if (areTheyInModPm !== -1) //yes
                {
                    userFunctions.modPM.splice(areTheyInModPm, 1);
                    bot.pm('you have now left modpm mode', data.senderid);
                    if (userFunctions.modPM.length !== 0) {
                        for (let jk = 0; jk < userFunctions.modPM.length; jk++) {
                            bot.pm(userFunctions.theUsersList()[name1] + ' has left the modpm chat', userFunctions.modPM[jk]); //declare user has entered chat
                        }
                    }
                }
            } else if (text.match(/^\/whosrefreshing/) && isInRoom === true) {
                if (userFunctions.refreshList().length !== 0) {
                    let whosRefreshing = 'refreshing: ';
                    let namesOfRefresher;

                    for (let i = 0; i < userFunctions.refreshList().length; i++) {
                        namesOfRefresher = userFunctions.theUsersList().indexOf(data.senderid) + 1;

                        if (i < userFunctions.refreshList().length - 1) {
                            whosRefreshing += userFunctions.theUsersList()[namesOfRefresher] + ', ';
                        } else {
                            whosRefreshing += userFunctions.theUsersList()[namesOfRefresher];
                        }
                    }

                    bot.pm(whosRefreshing, data.senderid);
                } else {
                    bot.pm('no one is currently refreshing', data.senderid);
                }
            } else if (text.match(/^\/refreshoff/) && userFunctions.isModerator() === true && isInRoom === true) {
                bot.pm('refreshing has been disabled', data.senderid);
                roomDefaults.isRefreshing = false;
            } else if (text.match(/^\/refreshon/) && userFunctions.isModerator() === true && isInRoom === true) {
                bot.pm('refreshing has been enabled', data.senderid);
                roomDefaults.isRefreshing = true;
            } else if (text.match(/^\/whosinmodpm/) && userFunctions.isModerator() === true && isInRoom === true) {
                if (userFunctions.modPM.length !== 0) {
                    let temper = "Users in modpm: "; //holds names

                    for (let gfh = 0; gfh < userFunctions.modPM.length; gfh++) {
                        let whatAreTheirNames = userFunctions.theUsersList().indexOf(userFunctions.modPM[gfh]) + 1;

                        if (gfh !== (userFunctions.modPM.length - 1)) {
                            temper += userFunctions.theUsersList()[whatAreTheirNames] + ', ';

                        } else {
                            temper += userFunctions.theUsersList()[whatAreTheirNames];
                        }
                    }
                    bot.pm(temper, data.senderid);
                } else {
                    bot.pm('no one is currently in modpm', data.senderid);
                }
            } else if (text.match(/^\/warnme/) && isInRoom === true) {
                let areTheyBeingWarned = userFunctions.warnme().indexOf(data.senderid);
                let areTheyDj80 = userFunctions.currentDJs().indexOf(data.senderid);
                let Position56 = userFunctions.currentDJs().indexOf(roomFunctions.checkWhoIsDj()); //current djs index

                if (areTheyDj80 !== -1) //are they on stage?
                {
                    if (roomFunctions.checkWhoIsDj() != null) {
                        if (roomFunctions.checkWhoIsDj() === data.senderid) {
                            bot.pm('you are currently playing a song!', data.senderid);
                        } else if (userFunctions.currentDJs()[Position56] === userFunctions.currentDJs()[userFunctions.currentDJs().length - 1] &&
                            userFunctions.currentDJs()[0] === data.senderid ||
                            userFunctions.currentDJs()[Position56 + 1] === data.senderid) //if they aren't the next person to play a song
                        {
                            bot.pm('your song is up next!', data.senderid);
                        } else {
                            if (areTheyBeingWarned === -1) //are they already being warned? no
                            {
                                userFunctions.warnme().unshift(data.senderid);
                                bot.pm('you will be warned when your song is up next', data.senderid);
                            } else if (areTheyBeingWarned !== -1) //yes
                            {
                                userFunctions.warnme().splice(areTheyBeingWarned, 1);
                                bot.pm('you will no longer be warned', data.senderid);
                            }
                        }
                    } else {
                        bot.pm('you must wait one song since the bot has started up to use this command', data.senderid);
                    }
                } else {
                    bot.pm('error, you must be on stage to use that command', data.senderid);
                }
            } else if (text.match(/^\/move/) && userFunctions.isModerator() === true && isInRoom === true) {
                let moveName = data.text.slice(5);
                let tempName = moveName.split(" ");
                let areTheyInTheQueue = userFunctions.queueName().indexOf(tempName[1]); //name in queueName
                let areTheyInTheQueueList = userFunctions.queueList().indexOf(tempName[1]); //name in queuList
                let whatIsTheirUserid2 = userFunctions.theUsersList().indexOf(tempName[1]); //userid

                //if either name or userid is undefined, do not perform a move operation
                if (typeof userFunctions.theUsersList()[whatIsTheirUserid2 - 1] == 'undefined' || typeof tempName[1] == 'undefined') {
                    if (typeof userFunctions.theUsersList()[whatIsTheirUserid2 - 1] != 'undefined') {
                        bot.pm('failed to perform move operation, please try the command again', userFunctions.theUsersList()[whatIsTheirUserid2 - 1]);
                    } else {
                        bot.speak('failed to perform move operation, please try the command again');
                    }
                } else {
                    if (roomDefaults.queue === true) //if queue is turned on
                    {
                        if (tempName.length === 3 && areTheyInTheQueue !== -1) //if three parameters, and name found
                        {
                            if (!isNaN(tempName[2])) {
                                if (tempName[2] <= 1) {
                                    userFunctions.queueName().splice(areTheyInTheQueue, 1); //remove them
                                    userFunctions.queueList().splice(areTheyInTheQueueList, 2); //remove them
                                    userFunctions.queueName().splice(0, 0, tempName[1]); //add them to beggining
                                    userFunctions.queueList().splice(0, 0, tempName[1], userFunctions.theUsersList()[whatIsTheirUserid2 - 1]); //add them to beggining
                                    clearTimeout(roomFunctions.queueTimer()); //clear timeout because first person has been replaced
                                    botFunctions.setSayOnce(true);
                                    bot.pm(tempName[1] + ' has been moved to position 1 in the queue', data.senderid);
                                } else if (tempName[2] >= userFunctions.queueName().length) {
                                    if (userFunctions.queueName()[areTheyInTheQueue] === userFunctions.queueName()[0]) {
                                        clearTimeout(roomFunctions.queueTimer()); //clear timeout because first person has been replaced
                                        botFunctions.setSayOnce(true);
                                    }
                                    userFunctions.queueName().splice(areTheyInTheQueue, 1); //remove them
                                    userFunctions.queueList().splice(areTheyInTheQueueList, 2); //remove them
                                    userFunctions.queueName().splice(userFunctions.queueName().length + 1, 0, tempName[1]); //add them to end
                                    userFunctions.queueList().splice(userFunctions.queueName().length + 1, 0, tempName[1], userFunctions.theUsersList()[whatIsTheirUserid2 - 1]); //add them to end

                                    bot.pm(tempName[1] + ' has been moved to position ' + userFunctions.queueName().length + ' in the queue', data.senderid);
                                } else {
                                    if (userFunctions.queueName()[areTheyInTheQueue] === userFunctions.queueName()[0]) {
                                        clearTimeout(roomFunctions.queueTimer()); //clear timeout because first person has been replaced
                                        botFunctions.setSayOnce(true);
                                    }

                                    userFunctions.queueName().splice(areTheyInTheQueue, 1); //remove them
                                    userFunctions.queueList().splice(areTheyInTheQueueList, 2); //remove them
                                    userFunctions.queueName().splice((Math.round(tempName[2]) - 1), 0, tempName[1]); //add them to given position shift left 1 because array starts at 0
                                    userFunctions.queueList().splice(((Math.round(tempName[2]) - 1) * 2), 0, tempName[1], userFunctions.theUsersList()[whatIsTheirUserid2 - 1]); //same as above

                                    bot.pm(tempName[1] + ' has been moved to position ' + Math.round(tempName[2]) + ' in the queue', data.senderid);
                                }
                            } else {
                                bot.pm('error, position parameter passed was not a number, please pass a valid integer arguement', data.senderid);
                            }
                        } else if (tempName.length !== 3) //if invalid number of parameters
                        {
                            bot.pm('error, invalid number of parameters, must have /move name #', data.senderid);
                        } else if (areTheyInTheQueue === -1) //if name not found
                        {
                            bot.pm('error, name not found', data.senderid);
                        }
                    } else {
                        bot.pm('error, queue must turned on to use this command', data.senderid);
                    }
                }
            } else if (text.match(/^\/position/)) //tells you your position in the queue, if there is one
            {
                let checkPosition = userFunctions.queueName().indexOf(userFunctions.theUsersList()[name1]);

                if (checkPosition !== -1 && roomDefaults.queue === true) //if person is in the queue and queue is active
                {
                    bot.pm('you are currently in position number ' + (checkPosition + 1) + ' in the queue', data.senderid);
                } else if (checkPosition === -1 && roomDefaults.queue === true) {
                    bot.pm('i can\'t tell you your position unless you are currently in the queue', data.senderid);
                } else {
                    bot.pm('there is currently no queue', data.senderid);
                }
            } else if (text.match(/^\/djafk/) && isInRoom === true) {
                if (userFunctions.AFK() === true) //afk limit turned on?
                {
                    if (userFunctions.currentDJs().length !== 0) //any dj's on stage?
                    {
                        let afkDjs = 'dj afk time: ';

                        for (let ijhp = 0; ijhp < userFunctions.currentDJs().length; ijhp++) {
                            let lastUpdate = Math.floor((Date.now() - userFunctions.lastSeen()[userFunctions.currentDJs()[ijhp]]) / 1000 / 60); //their afk time in minutes
                            let whatIsTheName = userFunctions.theUsersList().indexOf(userFunctions.currentDJs()[ijhp]); //their name

                            if (userFunctions.currentDJs()[ijhp] !== userFunctions.currentDJs()[userFunctions.currentDJs().length - 1]) {
                                afkDjs += userFunctions.theUsersList()[whatIsTheName + 1] + ': ' + lastUpdate + ' mins, ';
                            } else {
                                afkDjs += userFunctions.theUsersList()[whatIsTheName + 1] + ': ' + lastUpdate + ' mins';
                            }
                        }
                        bot.pm(afkDjs, data.senderid);
                    } else {
                        bot.pm('error, there are currently no dj\'s on stage.', data.senderid);
                    }
                } else {
                    bot.pm('error, the dj afk timer has to be active for me to report afk time.', data.senderid);
                }
            } else if (text.match(/^\/playminus/) && userFunctions.isModerator() === true && isInRoom === true) {
                if (musicDefaults.PLAYLIMIT === true) //is the play limit on?
                {
                    let playMinus = data.text.slice(12);
                    let areTheyInRoom = userFunctions.theUsersList().indexOf(playMinus);
                    let areTheyDj = userFunctions.currentDJs().indexOf(userFunctions.theUsersList()[areTheyInRoom - 1]);
                    if (areTheyInRoom !== -1) //are they in the room?
                    {
                        if (areTheyDj !== -1) //are they a dj?
                        {
                            if (typeof (userFunctions.djSongCount(userFunctions.theUsersList()[areTheyInRoom - 1])) != 'undefined') {

                                if (!userFunctions.djSongCount(userFunctions.theUsersList()[areTheyInRoom - 1]).nbSong <= 0) //is their play count already 0 or lower?
                                {
                                    userFunctions.decrementDJPlayCount(userFunctions.theUsersList()[areTheyInRoom - 1]);
                                    bot.pm(userFunctions.theUsersList()[areTheyInRoom] + '\'s play count has been reduced by one', data.senderid);
                                } else {
                                    bot.pm('error, that user\'s play count is already at zero', data.senderid);
                                }
                            } else {
                                bot.pm('something weird happened!, attemping to recover now', data.senderid);

                                if (userFunctions.theUsersList()[areTheyInRoom - 1] !== 'undefined') //only recover if userid given is not undefined
                                {
                                    //recover here
                                    userFunctions.initialiseDJPlayCount(userFunctions.theUsersList()[areTheyInRoom - 1]);
                                }
                            }
                        } else {
                            bot.pm('error, that user is not currently djing', data.senderid);
                        }
                    } else {
                        bot.pm('error, that user is not currently in the room', data.senderid);
                    }
                } else {
                    bot.pm('error, the play limit must be turned on in order for me to decrement play counts', data.senderid);
                }
            } else if (text.match(/^\/whatsplaylimit/) && isInRoom === true) {
                if (musicDefaults.PLAYLIMIT === true) {
                    bot.pm('the play limit is currently set to: ' + roomDefaults.playLimit + ' songs.', data.senderid);
                } else {
                    bot.pm('the play limit is currently turned off', data.senderid);
                }
            } else if (text.match(/^\/playLimitOn/) && userFunctions.isModerator() === true && isInRoom === true) {
                let playLimitNumber = Number(data.text.slice(13)); //holds given number

                if (playLimitNumber !== '') //if an additional arguement was given
                {
                    if (!isNaN(playLimitNumber) && playLimitNumber > 0) //if parameter given is a number and greater than zero
                    {
                        roomDefaults.playLimit = Math.ceil(playLimitNumber); // round play limit to make sure its not a fraction

                        bot.pm('the play limit is now active and has been set to ' +
                            roomDefaults.playLimit + ' songs. dj song counters have been reset.', data.senderid);

                        //reset song counters
                        for (let ig = 0; ig < userFunctions.currentDJs().length; ig++) {
                            userFunctions.initialiseDJPlayCount(userFunctions.currentDJs()[ig]);
                        }

                        musicDefaults.PLAYLIMIT = true; //mark playlimit as being on
                    } else {
                        bot.pm('invalid arguement given, the play limit must be set to an integer. ' +
                            'it can either be used as /playLimitOn or /playLimitOn #.', data.senderid);

                        musicDefaults.PLAYLIMIT = false; //on failure turn it off
                    }
                } else {
                    bot.pm('the play limit is now active and has been set to the default value of ' +
                        roomDefaults.playLimit + ' songs. dj song counters have been reset.', data.senderid);

                    //reset song counters
                    for (let ig = 0; ig < userFunctions.currentDJs().length; ig++) {
                        userFunctions.initialiseDJPlayCount(userFunctions.currentDJs()[ig]);
                    }

                    musicDefaults.PLAYLIMIT = true; //mark playlimit as being on
                }
            } else if (text.match(/^\/playLimitOff$/) && userFunctions.isModerator() === true && isInRoom === true) {
                musicDefaults.PLAYLIMIT = false;
                bot.pm('the play limit is now inactive.', data.senderid);
            } else if (text.match(/^\/queueOn$/) && userFunctions.isModerator() === true && isInRoom === true) {
                userFunctions.resetQueueList();
                userFunctions.resetQueueNames();
                bot.pm('the queue is now active.', data.senderid);
                roomDefaults.queue = true;
                clearTimeout(roomFunctions.queueTimer()); //if queue is turned on again while somebody was on timeout to get on stage, then clear it
                botFunctions.setSayOnce(true);
            } else if (text.match(/^\/queueOff$/) && userFunctions.isModerator() === true && isInRoom === true) {
                bot.pm('the queue is now inactive.', data.senderid);
                roomDefaults.queue = false;
            } else if (text.match(/^\/addme$/) && roomDefaults.queue === true && isInRoom === true) {
                if (typeof data.senderid == 'undefined' || typeof userFunctions.theUsersList()[name1] == 'undefined') {
                    if (typeof data.senderid != 'undefined') {
                        bot.pm('failed to add to queue, please try the command again', data.senderid);
                    } else {
                        bot.speak('failed to add to queue, please try the command again');
                    }
                } else {
                    let list3 = userFunctions.queueList().indexOf(userFunctions.theUsersList()[name1]);
                    let list10 = userFunctions.currentDJs().indexOf(data.senderid)
                    let checkStageList = roomFunctions.stageBannedList().indexOf(data.senderid);
                    let checkManualStageList = userFunctions.bannedFromStage().indexOf(data.senderid);
                    if (list3 === -1 && list10 === -1 && checkStageList === -1 && checkManualStageList === -1) {
                        userFunctions.queueList().push(userFunctions.theUsersList()[name1], data.senderid);
                        userFunctions.queueName().push(userFunctions.theUsersList()[name1]);
                        let temp91 = 'The queue is now: ';
                        for (let hj = 0; hj < userFunctions.queueName().length; hj++) {
                            if (hj !== (userFunctions.queueName().length - 1)) {
                                temp91 += userFunctions.queueName()[hj] + ', ';
                            } else if (hj === (userFunctions.queueName().length - 1)) {
                                temp91 += userFunctions.queueName()[hj];
                            }
                        }
                        bot.speak(temp91);
                    } else if (list3 !== -1) //if already in queue
                    {
                        bot.pm('sorry i can\'t add you to the queue because you are already in the queue!', data.senderid);
                    } else if (checkStageList !== -1 || checkManualStageList !== -1) //if banned from stage
                    {
                        bot.pm('sorry i can\'t add you to the queue because you are currently banned from djing', data.senderid);
                    } else if (list10 !== -1) //if already on stage
                    {
                        bot.pm('you are already djing!', data.senderid);
                    }
                }
            } else if (text.match(/^\/removeme$/) && roomDefaults.queue === true && isInRoom === true) {
                if (typeof userFunctions.theUsersList()[name1] == 'undefined') {
                    if (typeof data.senderid != 'undefined') {
                        bot.pm('failed to remove from queue, please try the command again', data.senderid);
                    } else {
                        bot.speak('failed to remove from queue, please try the command again');
                    }
                } else {
                    let list1 = userFunctions.queueList().indexOf(userFunctions.theUsersList()[name1]);
                    let list2 = userFunctions.queueName().indexOf(userFunctions.theUsersList()[name1]);

                    if (list2 !== -1 && list1 !== -1) {
                        userFunctions.queueList().splice(list1, 2);

                        if (userFunctions.theUsersList()[name1] === userFunctions.queueName()[0]) {
                            clearTimeout(roomFunctions.queueTimer());
                            botFunctions.setSayOnce(true);
                        }
                        userFunctions.queueName().splice(list2, 1);

                        if (userFunctions.queueName().length !== 0) {
                            let temp90 = 'The queue is now: ';
                            for (let kj = 0; kj < userFunctions.queueName().length; kj++) {
                                if (kj !== (userFunctions.queueName().length - 1)) {
                                    temp90 += userFunctions.queueName()[kj] + ', ';
                                } else if (kj === (userFunctions.queueName().length - 1)) {
                                    temp90 += userFunctions.queueName()[kj];
                                }
                            }
                            bot.speak(temp90);
                        } else {
                            bot.speak('The queue is now empty.');
                        }
                    } else {
                        bot.pm('error, you have to be in the queue to remove yourself from the queue', data.senderid);
                    }
                }
            } else if (text.match('/removefromqueue') && roomDefaults.queue === true && isInRoom === true) {
                if (userFunctions.isModerator() === true) {
                    let removeFromQueue = data.text.slice(18);
                    let index5 = userFunctions.queueList().indexOf(removeFromQueue);
                    let index6 = userFunctions.queueName().indexOf(removeFromQueue);
                    if (index5 !== -1) {
                        if (userFunctions.queueName()[index6] === userFunctions.queueName()[0]) {
                            clearTimeout(roomFunctions.queueTimer());
                            botFunctions.setSayOnce(true);
                        }
                        userFunctions.queueList().splice(index5, 2);
                        userFunctions.queueName().splice(index6, 1);

                        if (userFunctions.queueName().length !== 0) {
                            let temp89 = 'The queue is now: ';
                            for (let jk = 0; jk < userFunctions.queueName().length; jk++) {
                                if (jk !== (userFunctions.queueName().length - 1)) {
                                    temp89 += userFunctions.queueName()[jk] + ', ';
                                } else if (jk === (userFunctions.queueName().length - 1)) {
                                    temp89 += userFunctions.queueName()[jk];
                                }
                            }
                            bot.speak(temp89);
                        } else {
                            bot.speak('The queue is now empty.');
                        }
                    } else {
                        bot.pm('error, no such person was found to be in the queue', data.senderid);
                    }
                }
            } else if (text.match(/^\/snagevery$/) && userFunctions.isModerator() === true && isInRoom === true) {
                if (songFunctions.snagSong() === true) {
                    songFunctions.snagSong = false;
                    bot.pm('I am no longer adding every song that plays', data.senderid);
                } else if (songFunctions.snagSong() === false) {
                    songFunctions.snagSong = true; //this is for /snagevery
                    botDefaults.autoSnag = false; //this turns off /autosnag
                    bot.pm('I am now adding every song that plays, /autosnag has been turned off', data.senderid);
                }
            } else if (text.match(/^\/autosnag/) && userFunctions.isModerator() === true && isInRoom === true) {
                if (botDefaults.autoSnag === false) {
                    botDefaults.autoSnag = true; //this is for /autosnag
                    songFunctions.snagSong = false; //this is for /snagevery
                    bot.pm('I am now adding every song that gets at least (' + botDefaults.howManyVotes + ') awesome\'s, /snagevery has been turned off', data.senderid);
                } else if (botDefaults.autoSnag === true) {
                    botDefaults.autoSnag = false;
                    bot.pm('vote snagging has been turned off', data.senderid);
                }
            } else if (text.match(/^\/dive/) && isInRoom === true) {
                let checkDj = userFunctions.currentDJs().indexOf(data.senderid);
                if (checkDj !== -1) {
                    bot.remDj(data.senderid);
                } else {
                    bot.pm('you must be on stage to use that command.', data.senderid);
                }
            } else if (data.text === '/getTags' && isInRoom === true) {
                bot.pm('artist name: ' + songFunctions.artist() + ', song name: ' + songFunctions.song() + ', album: ' + songFunctions.album() + ', genre: ' + songFunctions.genre(), data.senderid);
            } else if (data.text === '/roominfo' && isInRoom === true) {
                if (typeof roomDefaults.detail !== 'undefined') {
                    bot.pm(roomDefaults.detail, data.senderid);
                }
            } else if (text.match(/^\/getonstage$/) && userFunctions.isModerator() === true && isInRoom === true) {
                if (botDefaults.getonstage === false) {
                    bot.pm('I am now auto djing', data.senderid);
                    botDefaults.getonstage = true;
                } else if (botDefaults.getonstage === true) {
                    bot.pm('I am no longer auto djing', data.senderid);
                    botDefaults.getonstage = false;
                }
            } else if (text.match(/^\/skipoff$/) && userFunctions.isModerator() === true && isInRoom === true) {
                bot.pm('i am no longer skipping my songs', data.senderid);
                botFunctions.setSkipOn(false);
            } else if (text.match(/^\/skipon$/) && userFunctions.isModerator() === true && isInRoom === true) {
                bot.pm('i am now skipping my songs', data.senderid);
                botFunctions.setSkipOn(true);
            } else if (text.match('/awesome') && isInRoom === true) {
                bot.vote('up');
            } else if (text.match('/lame') && userFunctions.isModerator() === true && isInRoom === true) {
                bot.vote('down');
            } else if (text.match(/^\/eventmessageOn/) && userFunctions.isModerator() === true && isInRoom === true) {
                bot.pm('event message: On', data.senderid);
                roomDefaults.EVENTMESSAGE = true;
            } else if (text.match(/^\/eventmessageOff/) && userFunctions.isModerator() === true && isInRoom === true) {
                bot.pm('event message: Off', data.senderid);
                roomDefaults.EVENTMESSAGE = false;
            } else if (text.match(/^\/messageOff/) && userFunctions.isModerator() === true && isInRoom === true) {
                bot.pm('message: Off', data.senderid);
                roomDefaults.MESSAGE = false;
            } else if (text.match(/^\/messageOn/) && userFunctions.isModerator() === true && isInRoom === true) {
                bot.pm('message: On', data.senderid);
                roomDefaults.MESSAGE = true;
            } else if (text.match(/^\/greetoff/) && userFunctions.isModerator() === true && isInRoom === true) {
                bot.pm('room greeting: Off', data.senderid);
                roomFunctions.disableGreet();
            } else if (text.match(/^\/greeton/) && userFunctions.isModerator() === true && isInRoom === true) {
                bot.pm('room greeting: On', data.senderid);
                roomFunctions.enableGreet();
            } else if (text.match(/^\/songstats/) && userFunctions.isModerator() === true && isInRoom === true) {
                if (roomDefaults.SONGSTATS === true) {
                    roomDefaults.SONGSTATS = false;
                    bot.pm('song stats is now inactive', data.senderid);
                } else if (roomDefaults.SONGSTATS === false) {
                    roomDefaults.SONGSTATS = true;
                    bot.pm('song stats is now active', data.senderid);
                }
            } else if (text.match(/^\/playlist/) && userFunctions.isModerator() === true && isInRoom === true) {
                if (botDefaults.botPlaylist !== null) {
                    bot.pm('There are currently ' + botDefaults.botPlaylist.length + ' songs in my playlist.', data.senderid);
                }
            } else if (text.match(/^\/setTheme/) && userFunctions.isModerator() === true && isInRoom === true) {
                whatIsTheme = data.text.slice(10);
                roomDefaults.THEME = true;
                bot.pm('The theme is now set to: ' + whatIsTheme, data.senderid);
            } else if (text.match(/^\/noTheme/) && userFunctions.isModerator() === true && isInRoom === true) {
                roomDefaults.THEME = false;
                bot.pm('The theme is now inactive', data.senderid);
            } else if (text.match(/^\/theme/) && isInRoom === true) {
                if (roomDefaults.THEME === false) {
                    bot.pm('There is currently no theme, standard rules apply', data.senderid);
                } else {
                    bot.pm('The theme is currently set to: ' + whatIsTheme, data.senderid);
                }
            } else if (text.match(/^\/skipsong/) && userFunctions.isModerator() === true && isInRoom === true) {
                if (roomFunctions.checkWhoIsDj() === authModule.USERID) {
                    bot.skip();
                } else {
                    bot.pm('error, that command only skips the bots currently playing song', data.senderid);
                }
            } else if (text.match(/^\/roomafkoff/) && userFunctions.isModerator() === true && isInRoom === true) {
                userFunctions.disableRoomAFK();
                bot.pm('the audience afk list is now inactive.', data.senderid);
            } else if (text.match(/^\/roomafkon/) && userFunctions.isModerator() === true && isInRoom === true) {
                userFunctions.enableRoomAFK();
                bot.pm('the audience afk list is now active.', data.senderid);
                for (let zh = 0; zh < userFunctions.userIDs().length; zh++) {
                    let isDj2 = userFunctions.currentDJs().indexOf(userFunctions.userIDs()[zh])
                    if (isDj2 === -1) {
                        userFunctions.justSaw(userFunctions.userIDs()[zh], 'justSaw3');
                        userFunctions.justSaw(userFunctions.userIDs()[zh], 'justSaw4');
                    }
                }
            } else if (text.match(/^\/afkoff/) && userFunctions.isModerator() === true && isInRoom === true) {
                userFunctions.disableAFK();
                bot.pm('the afk list is now inactive.', data.senderid);
            } else if (text.match(/^\/afkon/) && userFunctions.isModerator() === true && isInRoom === true) {
                userFunctions.enableAFK();
                bot.pm('the afk list is now active.', data.senderid);
                for (let z = 0; z < userFunctions.currentDJs().length; z++) {
                    userFunctions.justSaw(userFunctions.currentDJs()[z], 'justSaw');
                    userFunctions.justSaw(userFunctions.currentDJs()[z], 'justSaw1');
                    userFunctions.justSaw(userFunctions.currentDJs()[z], 'justSaw2');
                }
            } else if (text.match(/^\/autodj$/) && userFunctions.isModerator() === true && isInRoom === true) {
                bot.addDj();
            } else if (text.match(/^\/removedj$/) && userFunctions.isModerator() === true && isInRoom === true) {
                bot.remDj();
            } else if (text.match(/^\/voteskipoff$/) && userFunctions.isModerator() === true && isInRoom === true) {
                bot.pm("vote skipping is now inactive", data.senderid);
                musicDefaults.voteSkip = false;
                songFunctions.resetVoteCountSkip();
                songFunctions.setVotesLeft(roomDefaults.HowManyVotesToSkip);
            } else if (text.match(/^\/mytime/) && isInRoom === true) {
                let msecPerMinute1 = 1000 * 60;
                let msecPerHour1 = msecPerMinute1 * 60;
                let msecPerDay1 = msecPerHour1 * 24;
                let endTime1 = Date.now();
                let currentTime1 = endTime1 - userFunctions.myTime()[data.senderid];

                let days1 = Math.floor(currentTime1 / msecPerDay1);
                currentTime1 = currentTime1 - (days1 * msecPerDay1);

                let hours1 = Math.floor(currentTime1 / msecPerHour1);
                currentTime1 = currentTime1 - (hours1 * msecPerHour1);

                let minutes1 = Math.floor(currentTime1 / msecPerMinute1);


                bot.pm('you have been in the room for: ' + days1 + ' days, ' + hours1 + ' hours, ' + minutes1 + ' minutes', data.senderid);

            } else if (text.match(/^\/uptime/) && isInRoom === true) {
                let msecPerMinute = 1000 * 60;
                let msecPerHour = msecPerMinute * 60;
                let msecPerDay = msecPerHour * 24;
                botFunctions.setUptimeTime(Date.now());
                let currentTime = botFunctions.uptimeTime() - botFunctions.botStartTime();

                let days = Math.floor(currentTime / msecPerDay);
                currentTime = currentTime - (days * msecPerDay);

                let hours = Math.floor(currentTime / msecPerHour);
                currentTime = currentTime - (hours * msecPerHour);

                let minutes = Math.floor(currentTime / msecPerMinute);

                bot.pm('bot uptime: ' + days + ' days, ' + hours + ' hours, ' + minutes + ' minutes', data.senderid);
            } else if (text.match(/^\/voteskipon/) && userFunctions.isModerator() === true && isInRoom === true) {
                userFunctions.resetSkipVoteUsers();
                roomDefaults.HowManyVotesToSkip = Number(data.text.slice(12))
                if (isNaN(roomDefaults.HowManyVotesToSkip) || roomDefaults.HowManyVotesToSkip === 0) {
                    bot.pm("error, please enter a valid number", data.senderid);
                }

                if (!isNaN(roomDefaults.HowManyVotesToSkip) && roomDefaults.HowManyVotesToSkip !== 0) {
                    bot.pm("vote skipping is now active, current votes needed to pass " + "the vote is " + roomDefaults.HowManyVotesToSkip, data.senderid);
                    musicDefaults.voteSkip = true;
                    songFunctions.resetVoteCountSkip();
                    songFunctions.setVotesLeft(roomDefaults.HowManyVotesToSkip);
                }
            } else if (text.match(/^\/queuewithnumbers$/) && isInRoom === true) {
                if (roomDefaults.queue === true && userFunctions.queueName().length !== 0) {
                    let temp95 = 'The queue is now: ';
                    for (let kl = 0; kl < userFunctions.queueName().length; kl++) {
                        if (kl !== (userFunctions.queueName().length - 1)) {
                            temp95 += userFunctions.queueName()[kl] + ' [' + (kl + 1) + ']' + ', ';
                        } else if (kl === (userFunctions.queueName().length - 1)) {
                            temp95 += userFunctions.queueName()[kl] + ' [' + (kl + 1) + ']';
                        }
                    }
                    bot.pm(temp95, data.senderid);

                } else if (roomDefaults.queue === true) {
                    bot.pm('The queue is currently empty.', data.senderid);
                } else {
                    bot.pm('There is currently no queue.', data.senderid);
                }
            } else if (text.match(/^\/queue$/) && isInRoom === true) {
                if (roomDefaults.queue === true && userFunctions.queueName().length !== 0) {
                    let temp95 = 'The queue is now: ';
                    for (let kl = 0; kl < userFunctions.queueName().length; kl++) {
                        if (kl !== (userFunctions.queueName().length - 1)) {
                            temp95 += userFunctions.queueName()[kl] + ', ';
                        } else if (kl === (userFunctions.queueName().length - 1)) {
                            temp95 += userFunctions.queueName()[kl];
                        }
                    }
                    bot.pm(temp95, data.senderid);

                } else if (roomDefaults.queue === true) {
                    bot.pm('The queue is currently empty.', data.senderid);
                } else {
                    bot.pm('There is currently no queue.', data.senderid);
                }
            } else if (text.match(/^\/randomSong$/) && userFunctions.isModerator() === true && isInRoom === true) {
                if (botFunctions.randomOnce() !== 1) {
                    let ez = 0;
                    bot.pm("Reorder initiated.", data.senderid);
                    botFunctions.incrementRandomOnce();
                    let reorder = setInterval(function () {
                        if (ez <= botDefaults.botPlaylist.length) {
                            let nextId = Math.ceil(Math.random() * botDefaults.botPlaylist);
                            bot.playlistReorder(ez, nextId);
                            console.log("Song " + ez + " changed.");
                            ez++;
                        } else {
                            clearInterval(reorder);
                            console.log("Reorder Ended");
                            bot.pm("Reorder completed.", data.senderid);
                            botFunctions.decrementRandomOnce();
                        }
                    }, 1000);
                } else {
                    bot.pm('error, playlist reordering is already in progress', data.senderid);
                }
            } else if (text.match('/bumptop') && userFunctions.isModerator() === true && isInRoom === true) {
                if (roomDefaults.queue === true) {
                    let topOfQueue = data.text.slice(10);
                    let index35 = userFunctions.queueList().indexOf(topOfQueue);
                    let index46 = userFunctions.queueName().indexOf(topOfQueue);
                    let index80 = userFunctions.theUsersList().indexOf(topOfQueue);
                    let index81 = userFunctions.theUsersList()[index80];
                    let index82 = userFunctions.theUsersList()[index80 - 1];
                    if (index35 !== -1 && index80 !== -1) {
                        clearTimeout(roomFunctions.queueTimer());
                        botFunctions.setSayOnce(true);
                        userFunctions.queueList().splice(index35, 2);
                        userFunctions.queueList().unshift(index81, index82);
                        userFunctions.queueName().splice(index46, 1);
                        userFunctions.queueName().unshift(index81);
                        let temp92 = 'The queue is now: ';
                        for (let po = 0; po < userFunctions.queueName().length; po++) {
                            if (po !== (userFunctions.queueName().length - 1)) {
                                temp92 += userFunctions.queueName()[po] + ', ';
                            } else if (po === (userFunctions.queueName().length - 1)) {
                                temp92 += userFunctions.queueName()[po];
                            }
                        }
                        bot.speak(temp92);
                    }
                }
            } else if (text.match(/^\/lengthLimit/) && userFunctions.isModerator() === true && isInRoom === true) {
                if (musicDefaults.LIMIT === true) {
                    musicDefaults.LIMIT = false;
                    bot.pm('the song length limit is now inactive', data.senderid);
                } else {
                    musicDefaults.LIMIT = true;
                    bot.pm('the song length limit is now active', data.senderid);
                }
            } else if (text.match(/^\/m/) && userFunctions.isModerator() === true && isInRoom === true) {
                bot.speak(text.substring(3));
            } else if (text.match(/^\/stage/) && userFunctions.isModerator() === true && isInRoom === true) {
                let ban = data.text.slice(8);
                let checkUser = userFunctions.theUsersList().indexOf(ban) - 1;
                if (checkUser !== -1) {
                    bot.remDj(userFunctions.theUsersList()[checkUser]);
                    userFunctions.setAsModerator();
                }
            } else if (text.match(/^\/botstatus/) && userFunctions.isModerator() === true && isInRoom === true) {
                let whatsOn = '';

                if (roomDefaults.queue === true) {
                    whatsOn += 'queue: On, ';
                } else {
                    whatsOn += 'queue: Off, ';
                }
                if (userFunctions.AFK() === true) {
                    whatsOn += 'dj afk limit: On, ';
                } else {
                    whatsOn += 'dj afk limit: Off, ';
                }
                if (botDefaults.getonstage === true) {
                    whatsOn += 'autodjing: On, ';
                } else {
                    whatsOn += 'autodjing: Off, ';
                }
                if (roomDefaults.EVENTMESSAGE === true) {
                    whatsOn += 'event message: On, ';
                } else {
                    whatsOn += 'event message: Off, ';
                }
                if (roomDefaults.MESSAGE === true) {
                    whatsOn += 'room message: On, ';
                } else {
                    whatsOn += 'room message: Off, ';
                }
                if (roomFunctions.GREET() === true) {
                    whatsOn += 'greeting message: On, ';
                } else {
                    whatsOn += 'greeting message: Off, ';
                }
                if (musicDefaults.voteSkip === true) {
                    whatsOn += 'voteskipping: On, ';
                } else {
                    whatsOn += 'voteskipping: Off, ';
                }
                if (userFunctions.roomAFK() === true) {
                    whatsOn += 'audience afk limit: On, ';
                } else {
                    whatsOn += 'audience afk limit: Off, ';
                }
                if (roomDefaults.SONGSTATS === true) {
                    whatsOn += 'song stats: On, ';
                } else {
                    whatsOn += 'song stats: Off, ';
                }
                if (roomDefaults.kickTTSTAT === true) {
                    whatsOn += 'auto ttstat kick: On, ';
                } else {
                    whatsOn += 'auto ttstat kick: Off, ';
                }
                if (musicDefaults.LIMIT === true) {
                    whatsOn += 'song length limit: On, ';
                } else {
                    whatsOn += 'song length limit: Off, ';
                }
                if (musicDefaults.PLAYLIMIT === true) {
                    whatsOn += 'song play limit: On, ';
                } else {
                    whatsOn += 'song play limit: Off, ';
                }
                if (roomDefaults.isRefreshing === true) {
                    whatsOn += 'refreshing: On, ';
                } else {
                    whatsOn += 'refreshing: Off, ';
                }
                if (botFunctions.skipOn() === true) {
                    whatsOn += 'autoskipping: On, ';
                } else {
                    whatsOn += 'autoskipping: Off, ';
                }
                if (songFunctions.snagSong() === true) {
                    whatsOn += 'every song adding: On, ';
                } else {
                    whatsOn += 'every song adding: Off, ';
                }
                if (botDefaults.autoSnag === true) {
                    whatsOn += 'vote based song adding: On, ';
                } else {
                    whatsOn += 'vote based song adding: Off, ';
                }
                if (botFunctions.randomOnce() === 0) {
                    whatsOn += 'playlist reordering in progress?: No';
                } else {
                    whatsOn += 'playlist reordering in progress?: Yes';
                }

                bot.pm(whatsOn, data.senderid);

            } else if (text.match(/^\/djplays/)) {
                chatFunctions.botSpeak( chatFunctions.buildDJPlaysMessage(userFunctions), data.senderid );

            } else if (text.match('/banstage') && userFunctions.isModerator() === true && isInRoom === true) {
                let ban12 = data.text.slice(11);
                let checkBan = roomFunctions.stageBannedList().indexOf(ban12);
                let checkUser12 = userFunctions.theUsersList().indexOf(ban12);
                if (checkBan === -1 && checkUser12 !== -1) {
                    roomFunctions.stageBannedList().push(userFunctions.theUsersList()[checkUser12 - 1], userFunctions.theUsersList()[checkUser12]);
                    bot.remDj(userFunctions.theUsersList()[checkUser12 - 1]);
                    userFunctions.removeAsModerator();
                }
            } else if (text.match('/unbanstage') && userFunctions.isModerator() === true && isInRoom === true) {
                let ban2 = data.text.slice(13);
                userFunctions.index = roomFunctions.stageBannedList().indexOf(ban2);
                if (userFunctions.index !== -1) {
                    roomFunctions.stageBannedList().splice(roomFunctions.stageBannedList()[userFunctions.index - 1], 2);
                    userFunctions.removeAsModerator();
                    userFunctions.index = null;
                }
            } else if (text.match('/userid') && userFunctions.isModerator() === true && isInRoom === true) {
                let ban86 = data.text.slice(9);
                let checkUser9 = bot.getUserId(ban86, function (data) {
                    let userid59 = data.userid;
                    if (typeof (userid59) !== 'undefined') {
                        bot.pm(userid59, senderid);
                        userFunctions.removeAsModerator();
                    } else {
                        bot.pm('I\'m sorry that userid is undefined', senderid);
                    }
                });
            } else if (text.match('/ban') && userFunctions.isModerator() === true && isInRoom === true) {
                let ban17 = data.text.slice(6);
                let checkBan17 = roomDefaults.blackList.indexOf(ban17);
                let checkUser17 = userFunctions.theUsersList().indexOf(ban17);
                if (checkBan17 === -1 && checkUser17 !== -1) {
                    roomDefaults.blackList.push(userFunctions.theUsersList()[checkUser17 - 1], userFunctions.theUsersList()[checkUser17]);
                    bot.boot(userFunctions.theUsersList()[checkUser17 - 1]);
                    userFunctions.removeAsModerator();
                }
            } else if (text.match('/unban') && userFunctions.isModerator() === true && isInRoom === true) {
                let ban20 = data.text.slice(8);
                userFunctions.index = roomDefaults.blackList.indexOf(ban20);
                if (userFunctions.index !== -1) {
                    roomDefaults.blackList.splice(roomDefaults.blackList[userFunctions.index - 1], 2);
                    userFunctions.removeAsModerator();
                    userFunctions.index = null;
                }
            } else if (text.match(/^\/stalk/) && userFunctions.isModerator() === true && isInRoom === true) {
                let stalker = text.substring(8);
                bot.getUserId(stalker, function (data6) {
                    bot.stalk(data6.userid, allInformations = true, function (data4) {
                        if (data4.success !== false) {
                            bot.pm('User found in room: http://turntable.fm/' + data4.room.shortcut, data.senderid);
                        } else {
                            bot.pm('User not found, they may be offline or in the lobby, they may also have just joined a room, or they may not exist', data.senderid);
                        }
                    });
                });
            } else if (text.match(/^\/whobanned$/) && userFunctions.isModerator() === true && isInRoom === true) {
                if (roomDefaults.blackList.length !== 0) {
                    bot.pm('ban list: ' + roomDefaults.blackList, data.senderid);
                } else {
                    bot.pm('The ban list is empty.', data.senderid);
                }
            } else if (text.match(/^\/whostagebanned$/) && userFunctions.isModerator() === true && isInRoom === true) {
                if (roomFunctions.stageBannedList().length !== 0) {
                    bot.pm('banned from stage: ' + roomFunctions.stageBannedList(), data.senderid);
                } else {
                    bot.pm('The banned from stage list is currently empty.', data.senderid);
                }
            } else if (data.text === '/stopescortme' && isInRoom === true) {
                bot.pm('you will no longer be escorted after you play your song', data.senderid);
                let escortIndex = userFunctions.escortMeList().indexOf(data.senderid);
                if (escortIndex !== -1) {
                    userFunctions.escortMeList().splice(escortIndex, 1);
                }
            } else if (data.text === '/escortme' && isInRoom === true) {
                let djListIndex = userFunctions.currentDJs().indexOf(data.senderid);
                let escortmeIndex = userFunctions.escortMeList().indexOf(data.senderid);
                if (djListIndex !== -1 && escortmeIndex === -1) {
                    userFunctions.escortMeList().push(data.senderid);
                    bot.pm('you will be escorted after you play your song', data.senderid);
                }
            } else if (text.match(/^\/snag/) && userFunctions.isModerator() === true && isInRoom === true) {
                if (songFunctions.getSong() !== null && botDefaults.botPlaylist !== null) {
                    let found = false;
                    for (let igh = 0; igh < botDefaults.botPlaylist.length; igh++) {
                        if (botDefaults.botPlaylist[igh]._id === songFunctions.getSong()) {
                            found = true;
                            bot.pm('I already have that song', data.senderid);
                            break;
                        }
                    }
                    if (!found) {
                        bot.playlistAdd(songFunctions.getSong(), -1); //add song to the end of the playlist
                        bot.pm('song added', data.senderid);
                        let tempSongHolder = {
                            _id: songFunctions.getSong()
                        };
                        botDefaults.botPlaylist.push(tempSongHolder);
                    }
                } else {
                    bot.pm('error, you can\'t snag the song that\'s playing when the bot enters the room', data.senderid);
                }
            } else if (text.match(/^\/inform$/) && userFunctions.isModerator() === true && isInRoom === true) {
                if (roomFunctions.checkWhoIsDj() !== null) {
                    if (userFunctions.informTimer === null) {
                        let checkDjsName = userFunctions.theUsersList().indexOf(roomFunctions.lastdj()) + 1;
                        bot.speak('@' + userFunctions.theUsersList()[checkDjsName] + ' your song is not the appropriate genre for this room, please skip or you will be removed in 20 seconds');
                        userFunctions.informTimer = setTimeout(function () {
                            bot.pm('you took too long to skip your song', roomFunctions.lastdj());
                            bot.remDj(roomFunctions.lastdj());
                            userFunctions.informTimer = null;
                        }, 20 * 1000);
                    } else {
                        bot.pm('the /inform timer has already been activated, it may be used only once per song', data.senderid);
                    }
                } else {
                    bot.pm('you must wait one song since the bot has started to use that command', data.senderid);
                }
            } else if (text.match(/^\/removesong$/) && userFunctions.isModerator() === true && isInRoom === true) {
                if (roomFunctions.checkWhoIsDj() === authModule.USERID) {
                    bot.skip();
                    bot.playlistRemove(-1);
                    botDefaults.botPlaylist.splice(botDefaults.botPlaylist.length - 1, 1);
                    bot.pm('the last snagged song has been removed.', data.senderid);
                } else {
                    botDefaults.botPlaylist.splice(botDefaults.botPlaylist.length - 1, 1);
                    bot.playlistRemove(-1);
                    bot.pm('the last snagged song has been removed.', data.senderid);
                }
            } else if (text.match('/username') && userFunctions.isModerator() === true && isInRoom === true) {
                let ban7 = data.text.slice(10);
                let tmp94 = bot.getProfile(ban7, function (data) {
                    bot.pm(data.name, senderid);
                });
            } else if (text.match(/^\/boot/) && userFunctions.isModerator() === true && isInRoom === true) //admin only
            {
                let bootName = data.text.slice(5); //holds their name
                let tempArray = bootName.split(" ");
                let reason = "";
                let whatIsTheirUserid = userFunctions.theUsersList().indexOf(tempArray[1]);
                let theirName = ""; //holds the person's name
                let isNameValid; //if second param is int value this is used to hold name index


                //if second arg is a number and that number is not a name of someone in the room
                //then that number represents the word length of the name given, which means
                //that they are going to print a message with the boot command
                if (!isNaN(tempArray[1]) && whatIsTheirUserid === -1) {
                    //if arg given will not produce index of bounds error
                    if (tempArray[1] < tempArray.length - 1) {
                        for (let gj = 2; gj <= (2 + Math.round(tempArray[1])) - 1; gj++) {
                            theirName += tempArray[gj] + " ";
                        }

                        isNameValid = userFunctions.theUsersList().indexOf(theirName.trim()); //find the index

                        //if the name you provided was valid
                        if (isNameValid !== -1) {
                            //get the message
                            for (let gyj = 2 + Math.round(tempArray[1]); gyj < tempArray.length; gyj++) {
                                reason += tempArray[gyj] + " ";
                            }


                            //if their name is multi word, then a number must be given in order
                            //to know when their name ends and their message begins, however
                            //this command can be used with a multi name word and no message
                            //in which case there would be no reason parameter
                            if (reason !== "") {
                                bot.boot(userFunctions.theUsersList()[isNameValid - 1], reason);
                            } else {
                                bot.boot(userFunctions.theUsersList()[isNameValid - 1]);
                            }
                        } else {
                            bot.pm('sorry but the name you provided was not found in the room', data.senderid);
                        }
                    } else {
                        bot.pm('error, the number provided must be the number of words that make up the person\'s name', data.senderid);
                    }
                } //if their name is just 1 single word and a message is given
                //it comes to here
                else if (tempArray.length > 2 && whatIsTheirUserid !== -1) {
                    for (let ikp = 2; ikp < tempArray.length; ikp++) {
                        reason += tempArray[ikp] + " ";
                    }

                    bot.boot(userFunctions.theUsersList()[whatIsTheirUserid - 1], reason);
                }
                //if their name is a single word and no message is given it comes to here
                else if (whatIsTheirUserid !== -1) {
                    bot.boot(userFunctions.theUsersList()[whatIsTheirUserid - 1]);
                } else {
                    bot.pm('error, that user was not found in the room. multi word names must be specified in the command usage, example: /boot 3 first middle last.' +
                        ' if the name is only one word long then you do not need to specify its length', data.senderid);
                }
            } else if (text.match(/^\/afk/) && isInRoom === true) {
                let isUserAfk = userFunctions.theUsersList().indexOf(data.senderid) + 1;
                let isAlreadyAfk = userFunctions.afkPeople().indexOf(userFunctions.theUsersList()[isUserAfk]);
                if (isAlreadyAfk === -1) {
                    if (typeof userFunctions.theUsersList()[isUserAfk] == 'undefined') {
                        bot.pm('failed to add to the afk list, please try the command again', data.senderid);
                    } else {
                        bot.pm('you are marked as afk', data.senderid);
                        userFunctions.afkPeople().push(userFunctions.theUsersList()[isUserAfk]);
                    }
                } else if (isAlreadyAfk !== -1) {
                    bot.pm('you are no longer afk', data.senderid);
                    userFunctions.afkPeople().splice(isAlreadyAfk, 1);
                }
            } else if (text.match(/^\/whosafk/) && isInRoom === true) {
                if (userFunctions.afkPeople().length !== 0) {
                    let whosAfk = 'marked as afk: ';
                    for (let f = 0; f < userFunctions.afkPeople().length; f++) {
                        if (f !== (userFunctions.afkPeople().length - 1)) {
                            whosAfk = whosAfk + userFunctions.afkPeople()[f] + ', ';
                        } else {
                            whosAfk = whosAfk + userFunctions.afkPeople()[f];
                        }
                    }
                    bot.pm(whosAfk, data.senderid);
                } else {
                    bot.pm('No one is currently marked as afk', data.senderid);
                }
            } else if (text.match(/^\/commands/) && isInRoom === true) {
                bot.pm('the commands are  /awesome, ' +
                    '/frankie, /hair, /eddie, /lonely, /jump, /flirt, /rub, /wc, /alice, /feart, /rules, /suggestions, /mom, /cheers, /fanratio @, /whosrefreshing, /refresh, /whatsplaylimit, /warnme, /theme, /up?, /djafk, /mytime, /playlist, /afk, /whosafk, /coinflip, /moon, /hello, /escortme, /stopescortme, /fanme, /unfanme, /roominfo, /beer, /dice, /props, /m, /getTags, ' +
                    '/skip, /dive, /dance, /surf, /uptime, /djplays, /admincommands, /queuecommands, /pmcommands', data.senderid);
            } else if (text.match(/^\/queuecommands/) && isInRoom === true) {
                bot.pm('the commands are /queue, /queuewithnumbers, /position, /removefromqueue @, /removeme, /addme, /move, /queueOn, /queueOff, /bumptop @', data.senderid);
            } else if (text.match(/^\/pmcommands/) && userFunctions.isModerator() === true && isInRoom === true) //the moderators see this
            {
                bot.pm('/modpm, /whatsplaylimit, /whosrefreshing, /refreshon, /refreshoff, /warnme, /whosinmodpm, /playlist, /move, /eventmessageOn, /eventmessageOff, /boot, /roominfo, /djafk, /playminus @, /snagevery, /autosnag, /position, /theme, /mytime, /uptime, /m, /stage @, /botstatus, /djplays, /banstage @, /unbanstage @, ' +
                    '/userid @, /ban @, /unban @, /stalk @, /whobanned, /whostagebanned, /stopescortme, /escortme, /snag, /inform, ' +
                    '/removesong, /username, /afk, /whosafk, /commands, /admincommands', data.senderid);
            } else if (text.match(/^\/pmcommands/) && !userFunctions.isModerator() === true && isInRoom === true) //non - moderators see this
            {
                bot.pm('/addme, /whosrefreshing, /whatsplaylimit, /warnme, /removeme, /djafk, /position, /dive, /getTags, /roominfo, /awesome, ' + '/theme, /mytime, /uptime, /queue, /djplays, /stopescortme, /escortme, /afk, ' + '/whosafk, /commands, /queuecommands', data.senderid);
            } else if (text.match(/^\/admincommands/) && userFunctions.isModerator() === true && isInRoom === true) {
                bot.pm('the mod commands are /ban @, /whosinmodpm, /refreshon, /refreshoff, /unban @, /eventmessageOn, /eventmessageOff, /boot, /move, /playminus @, /snagevery, /autosnag, /skipon, /playLimitOn, /playLimitOff, /skipoff, /stalk @, /lengthLimit, /setTheme, /noTheme, /stage @, /randomSong, /messageOn, /messageOff, /afkon, /afkoff, /skipsong, /autodj, /removedj, /lame, ' +
                    '/snag, /botstatus, /removesong, /voteskipon #, /voteskipoff, /greeton, /greetoff, /getonstage, /banstage @, /unbanstage @, /userid @, /inform, ' +
                    '/whobanned, /whostagebanned, /roomafkon, /roomafkoff, /songstats, /username, /modpm', data.senderid);
                userFunctions.removeAsModerator();
            }
        }

    }
}

module.exports = commandFunctions;
