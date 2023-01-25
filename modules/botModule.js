let roomDefaults = require( '../defaultSettings/roomDefaults.js' );
let botDefaults = require( '../defaultSettings/botDefaults.js' );
let musicDefaults = require( '../defaultSettings/musicDefaults.js' );
let chatDefaults = require( '../defaultSettings/chatDefaults.js' );

let authModule = require( '../auth.js' );

let checkActivity = Date.now();
let skipOn = null; //if true causes the bot to skip every song it plays, toggled on and off by commands
let sayOnce = true; //makes it so that the queue timeout can only be used once per per person, stops the bot from spamming
let botStartTime = null; //the current time in milliseconds when the bot has started, used for the /uptime
let uptimeTime = null; //the current time in milliseconds when the /uptime is actually used
let messageCounter = 0; //this is for the array of messages, it lets it know which message it is currently on, resets to 0 after cycling through all of them
let netwatchdogTimer = null; // Used to detect internet connection dropping out
let attemptToReconnect = null; //used for reconnecting to the bots room if its not in there (only works if internet connection is working)
let returnToRoom = true; //used to toggle on and off the bot reconnecting to its room(it toggles off when theres no internet connection because it only works when its connected to turntable.fm)
let wserrorTimeout = null; //this is for the setTimeout in ws error
let autoDjingTimer = null; //governs the timer for the bot's auto djing
let readSongStats = roomDefaults.SONGSTATS;
let autoDJEnabled = botDefaults.autoDJEnabled; //autodjing(on by default)
let whenToGetOnStage = botDefaults.whenToGetOnStage; //when this many or less people djing the bot will get on stage(only if autodjing is enabled)
let whenToGetOffStage = botDefaults.whenToGetOffStage;
let checkVideoRegions = musicDefaults.alertIfRegionBlocked;
let refreshingEnabled = roomDefaults.refreshingEnabled;


const botFunctions = ( bot ) => {

    return {
        checkActivity: () => checkActivity,
        messageCounter: () => messageCounter,
        netwatchdogTimer: () => netwatchdogTimer,
        attemptToReconnect: () => attemptToReconnect,
        returnToRoom: () => returnToRoom,
        wserrorTimeout: () => wserrorTimeout,
        autoDjingTimer: () => autoDjingTimer,

        botStartTime: () => botStartTime,
        setBotStartTime: function () {
            botStartTime = Date.now()
        },

        skipOn: () => skipOn,
        setSkipOn: function ( value ) { skipOn = value; },

        sayOnce: () => sayOnce,
        setSayOnce: function ( value ) { sayOnce = value; },

        uptimeTime: () => uptimeTime,
        setUptimeTime: function ( value ) { uptimeTime = value; },

        // ========================================================
        // Bot Command Functions
        // ========================================================

        sarahConner: function ( data, theMessage, userFunctions, chatFunctions ) {
            const sleep = ( delay ) => new Promise( ( resolve ) => setTimeout( resolve( "done" ), delay ) )

            const shutMeDown = async () => {
                chatFunctions.botSpeak( "I'll be back...", data, true );
                await sleep( 100 )
                userFunctions.debugPrintTheUsersList();
                await sleep( 100 )
                this.logCommandUsage( userFunctions, 'sarahConner', data, theMessage )
                process.exit( 1 );
            }
            shutMeDown();
        },

        changeAvatar: function ( data, args, chatFunctions ) {
            const theID = args[ 0 ];
            if ( isNaN( theID ) ) {
                chatFunctions.botSpeak( "That's not a valid AvatarID...it needs to be a number", data );
            } else {
                if ( theID === "8" || theID === "4" || theID === "227" || theID === "2022" ) {
                    chatFunctions.botSpeak( "NOPE! No Gingers here...", data );
                } else {
                    chatFunctions.botSpeak( "Changing...", data );
                    bot.setAvatar( theID );
                }
            }
        },

        getUptime: function () {
            this.setUptimeTime( Date.now() );
            return this.uptimeTime() - this.botStartTime();
        },

        reportUptime: function ( data, userFunctions, chatFunctions ) {
            let msecPerMinute = 1000 * 60;
            let msecPerHour = msecPerMinute * 60;
            let msecPerDay = msecPerHour * 24;
            let currentTime = this.getUptime();

            let days = Math.floor( currentTime / msecPerDay );
            currentTime = currentTime - ( days * msecPerDay );

            let hours = Math.floor( currentTime / msecPerHour );
            currentTime = currentTime - ( hours * msecPerHour );

            let minutes = Math.floor( currentTime / msecPerMinute );

            chatFunctions.botSpeak( userFunctions.getUsername( authModule.USERID ) + ' has been up for: ' + days + ' days, ' + hours + ' hours, ' + minutes + ' minutes', data );
        },

        songStatsCommand: function ( data, chatFunctions ) {
            if ( this.readSongStats() ) {
                this.disableReadSongStats( data, chatFunctions );
            } else {
                this.enableReadSongStats( data, chatFunctions );
            }
        },

        autoDJCommand: function ( data, chatFunctions ) {
            if ( this.autoDJEnabled() ) {
                this.disableAutoDJ( data, chatFunctions );
            } else {
                this.enableAutoDJ( data, chatFunctions );
            }
        },

        removeIdleDJsCommand: function ( data, userFunctions, chatFunctions ) {
            if ( userFunctions.removeIdleDJs() ) {
                userFunctions.disableDJIdle( data, chatFunctions );
            } else {
                userFunctions.enableDJIdle( data, chatFunctions );
            }
        },

        reportRoomStatus: function ( data, chatFunctions, userFunctions, videoFunctions ) {
            const sleep = ( delay ) => new Promise( ( resolve ) => setTimeout( resolve, delay ) )
            const doInOrder = async () => {
                this.reportUptime( data, userFunctions, chatFunctions ); await sleep( 100 );
                this.reportAutoDJStatus( data, chatFunctions ); await sleep( 100 );
                this.reportSongStats( data, chatFunctions ); await sleep( 100 );
                userFunctions.readQueue( data, chatFunctions ); await sleep( 100 );
                userFunctions.whatsPlayLimit( data, chatFunctions ); await sleep( 100 );
                userFunctions.reportDJIdleStatus( data, chatFunctions ); await sleep( 100 );
                this.reportRefreshStatus( data, chatFunctions ); await sleep( 100 );
                this.reportRegionCheckStatus( data, videoFunctions, chatFunctions ); await sleep( 100 );
            }
            doInOrder();
        },

        checkVideoRegionsCommand: function ( data, videoFunctions, chatFunctions ) {
            if ( this.checkVideoRegions() ) {
                this.disablecheckVideoRegions( data, videoFunctions, chatFunctions );
            } else {
                this.enablecheckVideoRegions( data, videoFunctions, chatFunctions );
            }
        },

        addAlertRegionCommand: function ( data, args, videoFunctions, chatFunctions ) {
            const sleep = ( delay ) => new Promise( ( resolve ) => setTimeout( resolve, delay ) )
            const doInOrder = async () => {
                console.log( "args:" + args );
                videoFunctions.addAlertRegion( data, args[ 0 ], chatFunctions );
                await sleep( 1000 )

                this.reportRegionCheckStatus( data, videoFunctions, chatFunctions );
                await sleep( 1000 )
            }
            doInOrder();
        },

        removeAlertRegionCommand: function ( data, args, videoFunctions, chatFunctions ) {
            const sleep = ( delay ) => new Promise( ( resolve ) => setTimeout( resolve, delay ) )
            const doInOrder = async () => {
                videoFunctions.removeAlertRegion( data, args[ 0 ], chatFunctions )
                await sleep( 1000 )

                this.reportRegionCheckStatus( data, videoFunctions, chatFunctions );
                await sleep( 1000 )
            }
            doInOrder();
        },

        stageDiveCommand: function ( data, chatFunctions, userFunctions, messageVariable ) {
            const userID = userFunctions.whoSentTheCommand( data );
            const receiverID = userFunctions.getCurrentDJID();

            if ( userFunctions.isUserIDOnStage( userID ) ) {
                const randomMessage = messageVariable[ Math.floor( Math.random() * messageVariable.length ) ];
                const thisMessage = chatFunctions.buildUserToUserRandomMessage( userFunctions, userID, randomMessage, receiverID );
                chatFunctions.botSpeak( thisMessage, data );
                userFunctions.removeDJ( userID, 'DJ used the /dive command' );
            } else {
                chatFunctions.botSpeak( 'You can\'t leave the stage if you\'re not on stage...', data )
            }
        },

        refreshOnCommand: function ( data, chatFunctions ) {
            if ( this.refreshingEnabled() ) {
                chatFunctions.botSpeak( 'The ' + chatDefaults.commandIdentifier + 'refresh command is already enabled', data );
            } else {
                this.enableRefreshing( data, chatFunctions );
            }
        },

        refreshOffCommand: function ( data, chatFunctions ) {
            if ( !this.refreshingEnabled() ) {
                chatFunctions.botSpeak( 'The ' + chatDefaults.commandIdentifier + 'refresh command is already disabled', data );
            } else {
                this.disableRefreshing( data, chatFunctions );
            }
        },

        logCommandUsage: function ( userFunctions, command, data, theMessage ) {
            console.group( command );
            console.info( 'The ' + command + ' command was issued by @' + userFunctions.getUsername( userFunctions.whoSentTheCommand( data ) ) + ' at ' + Date() );
            console.info( theMessage );
            console.groupEnd();
        },

        removeDJCommand: function ( data, theMessage, userFunctions, chatFunctions ) {
            const djID = userFunctions.getCurrentDJID();

            if ( theMessage !== '' ) {
                const djName = userFunctions.getUsername( djID );
                theMessage = '@' + djName + ', ' + theMessage;

                chatFunctions.botSpeak( theMessage, data, true );
                this.logCommandUsage( userFunctions, 'removeDJ', data, theMessage )
            }
            userFunctions.removeDJ( djID, 'The removeDJ command had been issued: ' + theMessage );
        },

        informDJCommand: function ( data, theMessage, userFunctions, chatFunctions ) {
            const djID = userFunctions.getCurrentDJID();

            if ( theMessage !== '' ) {
                theMessage = '@' + userFunctions.getUsername( djID ) + ', ' + theMessage
                chatFunctions.botSpeak( theMessage, data, true );
                this.logCommandUsage( userFunctions, 'informDJ', data, theMessage )
            } else {
                chatFunctions.botSpeak( 'You didn\'t ask me to send the DJ any message?!?', data );
            }
        },

        awesomeCommand: function () {
            bot.vote( 'up' );
        },

        lameCommand: function () {
            bot.vote( 'down' );
        },

        // ========================================================

        getFormattedDate: function () {
            var dateobj = new Date();
            var date = dateobj.getDate(), month = dateobj.getMonth() + 1, year = dateobj.getFullYear();
            return `${ date }/${ month }/${ year }`;
        },

        checkVideoRegions: () => checkVideoRegions,
        enablecheckVideoRegions: function ( data, videoFunctions, chatFunctions ) {
            checkVideoRegions = true;
            this.reportRegionCheckStatus( data, videoFunctions, chatFunctions );
        },
        disablecheckVideoRegions: function ( data, videoFunctions, chatFunctions ) {
            checkVideoRegions = false;
            this.reportRegionCheckStatus( data, videoFunctions, chatFunctions );
        },

        reportRegionCheckStatus: function ( data, videoFunctions, chatFunctions ) {
            if ( this.checkVideoRegions() ) {
                videoFunctions.listAlertRegions( data, chatFunctions );
            } else {
                chatFunctions.botSpeak( 'Video Region checking is disabled', data );
            }
        },


        refreshingEnabled: () => refreshingEnabled,
        enableRefreshing: function ( data, chatFunctions ) {
            refreshingEnabled = true;
            this.reportRefreshStatus( data, chatFunctions );
        },
        disableRefreshing: function ( data, chatFunctions ) {
            refreshingEnabled = false;
            this.reportRefreshStatus( data, chatFunctions );
        },

        reportRefreshStatus: function ( data, chatFunctions ) {
            if ( this.refreshingEnabled() ) {
                chatFunctions.botSpeak( 'The ' + chatDefaults.commandIdentifier + 'refresh command is enabled', data );
            } else {
                chatFunctions.botSpeak( 'The ' + chatDefaults.commandIdentifier + 'refresh command is disabled', data );
            }
        },

        autoDJEnabled: () => autoDJEnabled,
        enableAutoDJ: function ( data, chatFunctions ) {
            autoDJEnabled = true;
            this.reportAutoDJStatus( data, chatFunctions );
        },
        disableAutoDJ: function ( data, chatFunctions ) {
            autoDJEnabled = false;
            this.reportAutoDJStatus( data, chatFunctions );
        },

        whenToGetOnStage: () => whenToGetOnStage,
        setWhenToGetOnStage: function ( data, args, chatFunctions ) {
            const numberOfDJs = args[ 0 ];
            if ( isNaN( numberOfDJs ) ) {
                chatFunctions.botSpeak( 'Don\'t be silly. I can\'t set the auto-DJing start value to ' + numberOfDJs, data );
            } else {
                whenToGetOnStage = numberOfDJs;
                this.reportAutoDJStatus( data, chatFunctions )
            }
        },

        whenToGetOffStage: () => whenToGetOffStage,
        setWhenToGetOffStage: function ( data, args, chatFunctions ) {
            const numberOfDJs = args[ 0 ];
            if ( isNaN( numberOfDJs ) ) {
                chatFunctions.botSpeak( 'Don\'t be silly. I can\'t set the auto-DJing stop value to ' + numberOfDJs, data );
            } else {
                whenToGetOffStage = numberOfDJs;
                this.reportAutoDJStatus( data, chatFunctions )
            }
        },

        reportAutoDJStatus: function ( data, chatFunctions ) {
            if ( this.autoDJEnabled() ) {
                chatFunctions.botSpeak( 'Auto-DJing is enabled and will start at ' + this.whenToGetOnStage() + ' and stop at ' + this.whenToGetOffStage(), data );
            } else {
                chatFunctions.botSpeak( 'Auto DJing is disabled', data )
            }
        },

        readSongStats: () => readSongStats,
        enableReadSongStats: function ( data, chatFunctions ) {
            readSongStats = true;
            this.reportSongStats( data, chatFunctions );
        },
        disableReadSongStats: function ( data, chatFunctions ) {
            readSongStats = false;
            this.reportSongStats( data, chatFunctions );
        },
        reportSongStats: function ( data, chatFunctions ) {
            if ( this.readSongStats() ) {
                chatFunctions.botSpeak( 'Song stat reporting is enabled', data );
            } else {
                chatFunctions.botSpeak( 'Song stats reporting is disabled', data );
            }
        },

        checkIfConnected: function () {
            {
                if ( attemptToReconnect === null ) //if a reconnection attempt is already in progress, do not attempt it
                {
                    if ( bot._isAuthenticated ) // if bot is actually connected to turntable use the speaking method
                    {
                        let currentActivity = ( Date.now() - checkActivity ) / 1000 / 60;

                        if ( currentActivity > 30 ) //if greater than 30 minutes of no talking
                        {
                            bot.speak( 'ping', function ( callback ) //attempt to talk
                            {
                                if ( callback.success === false ) //if it fails
                                {
                                    return false;
                                }
                            } );
                        }
                    } else //else attempt to reconnect right away
                    {
                        return false;
                    }
                }
            }
            return true;
        },

        reconnect: function () {
            console.group( 'botModule: reconnect' );
            attemptToReconnect = setInterval( function () {
                if ( bot._isAuthenticated ) {
                    console.error( '+++++++++++++++++++++++++ BotModule Error: it looks like your bot is not in it\'s room. attempting to reconnect now....' );
                } else {
                    console.error( '+++++++++++++++++++++++++ BotModule Error: connection with turntable lost, waiting for connection to come back...' );
                }

                bot.roomRegister( authModule.ROOMID, function ( data ) {
                    if ( data.success === true ) {
                        roomDefaults.errorMessage = null;
                        clearInterval( attemptToReconnect );
                        module.exports.attemptToReconnect = null;
                        checkActivity = Date.now();
                    } else {
                        if ( roomDefaults.errorMessage === null && typeof data.err === 'string' ) {
                            roomDefaults.errorMessage = data.err;
                        }
                    }
                } );
            }, 1000 * 10 );
            console.groupEnd()
        },

        recordActivity: function () {
            checkActivity = Date.now(); //update when someone says something
        },

        isBotOnStage: function ( userFunctions ) {
            return userFunctions.isUserIDOnStage( authModule.USERID );
        },

        shouldTheBotDJ: function ( userFunctions ) {
            return userFunctions.howManyDJs() >= 1 && // is there at least one DJ on stage
                userFunctions.howManyDJs() <= this.whenToGetOnStage() && // are there fewer than the limit of DJs on stage
                userFunctions.queueList().length === 0 && // is the queue empty
                userFunctions.vipList.length === 0 && // there no VIPs
                userFunctions.refreshDJCount() === 0; // is there someone currently using the refresh command
        },

        shouldStopBotDJing: function ( userFunctions ) {
            return userFunctions.howManyDJs() >= this.whenToGetOffStage() && // are there enough DJs onstage
                userFunctions.getCurrentDJID() !== authModule.USERID; // check the Bot isn't currently DJing
        },

        checkAutoDJing: function ( userFunctions ) {
            if ( autoDjingTimer != null ) {
                clearTimeout( autoDjingTimer );
                autoDjingTimer = null;
            }

            if ( this.autoDJEnabled() === true ) {

                autoDjingTimer = setTimeout( function () {
                    if ( !this.isBotOnStage( userFunctions ) ) { //if the bot is not already on stage
                        if ( this.shouldTheBotDJ( userFunctions ) ) {
                            this.startBotDJing();
                        }
                    } else { //else it is on stage
                        if ( this.shouldStopBotDJing( userFunctions ) ) {
                            this.removeBotFromStage(); // remove the Bot from stage
                        }
                    }
                }.bind( this ), 1000 * 10 ); //delay for 10 seconds
            }
        },

        removeBotFromStage: function () {
            bot.remDj( authModule.USERID ); // remove the Bot from stage
        },

        startBotDJing: function () {
            console.log( "Start DJing" );
            bot.addDj(); // start the Bot DJing
        },

        isSongInBotPlaylist: function ( thisSong ) {
            let foundSong = false;
            for ( let listLoop = 0; listLoop < botDefaults.botPlaylist.length; listLoop++ ) {
                if ( botDefaults.botPlaylist[ listLoop ]._id === thisSong ) {
                    foundSong = true;
                }
            }

            return foundSong;
        },

        getPlaylistCount: function () {
            return botDefaults.botPlaylist.length;
        },

        addToBotPlaylist: function ( thisSong ) {
            bot.playlistAdd( thisSong, -1 ); //add song to the end of the playlist
            botDefaults.botPlaylist.push( thisSong );

            if ( botDefaults.feart ) { //whether the bot will show the heart animation or not
                bot.snag();
            }
        },

        checkAndAddToPlaylist: function ( songFunctions ) {
            const thisSong = songFunctions.getSong();

            if ( botDefaults.botPlaylist !== null && thisSong !== null ) {
                if ( !this.isSongInBotPlaylist( thisSong ) ) {
                    this.addToBotPlaylist( thisSong );
                }
            }
        },

        isBotCurrentDJ: function ( userFunctions ) {
            if ( userFunctions.getCurrentDJID() === authModule.USERID ) {
                return true;
            } else {
                return false;
            }
        },

        deleteCurrentTrackFromBotPlaylist: function ( data, userFunctions, chatFunctions, songFunctions ) {
            if ( this.isBotCurrentDJ( userFunctions ) !== true ) {
                chatFunctions.botSpeak( "I can't delete anything if I'm not playing anything?!?", data, true );
            } else {
                chatFunctions.botSpeak( "OK, I'll delete that", data, true );

                const senderID = userFunctions.whoSentTheCommand( data );
                const senderUsername = userFunctions.getUsername( senderID );
                let currentDateTime = require( 'moment' );

                console.group( '! delete track ===============================' );
                console.log( "The deletetrack command was issued by " + senderUsername + " at " + currentDateTime().format( 'DD/MM/yyyy HH:mm:ss' ) );
                console.log( "The track removed was " + songFunctions.song() + " by " + songFunctions.artist() );
                console.log( '========================================' );
                console.groupEnd();

                bot.playlistRemove( this.getPlaylistCount() - 1 );
                bot.skip();
            }
        },

        clearAllTimers: function ( userFunctions, roomFunctions, songFunctions ) {
            userFunctions.clearInformTimer( roomFunctions );
            roomFunctions.clearSongLimitTimer( userFunctions, roomFunctions );
            songFunctions.clearWatchDogTimer();
            songFunctions.clearTakedownTimer( userFunctions, roomFunctions );
        },

        checkOnNewSong: function ( data, roomFunctions, songFunctions, userFunctions ) {
            const length = data.room.metadata.current_song.metadata.length;
            const theDJID = data.room.metadata.current_dj;
            const masterIndex = userFunctions.masterIds().indexOf( theDJID ); //used to tell whether current dj is on the master id's list or not
            const djName = userFunctions.getUsername( theDJID );

            //clears timers if previously set
            this.clearAllTimers( userFunctions, roomFunctions, songFunctions );

            songFunctions.startSongWatchdog( data, userFunctions, roomFunctions );

            //this removes the user from the stage if their song is over the length limit and the don't skip
            let theTimeout = 60;
            if ( ( length / theTimeout ) >= musicDefaults.songLengthLimit ) {
                if ( theDJID === authModule.USERID || masterIndex === -1 ) //if dj is the bot or not a master
                {
                    if ( musicDefaults.songLengthLimitOn === true ) {
                        const nextDJName = userFunctions.getUsername( userFunctions.getNextDJ() );
                        bot.speak( `@${ djName }, your song is over ${ musicDefaults.songLengthLimit } mins long, you have 60 seconds to skip before being removed.` );
                        bot.speak( `@${ nextDJName }, make sure you've got something ready ;-)` );

                        // start the timer
                        roomFunctions.songLimitTimer = setTimeout( function () {
                            roomFunctions.songLimitTimer = null;
                            userFunctions.removeDJ( theDJID, `DJ @${ djName } was removed because their song was over the length limit` ); // Remove Saved DJ from last newsong call
                        }, theTimeout * 1000 ); // Current DJ has 20 seconds to skip before they are removed
                    }
                }
            }
        },
    }
}

module.exports = botFunctions;