let roomDefaults = require( '../defaultSettings/roomDefaults.js' );
let botDefaults = require( '../defaultSettings/botDefaults.js' );
let musicDefaults = require( '../defaultSettings/musicDefaults.js' );

let authModule = require( '../auth.js' );
const userFunctions = require( './userModule.js' );

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

const botFunctions = ( bot ) => {
    function logMe ( logLevel, message ) {
        switch ( logLevel ) {
            case "error":
                console.log( "!!!!!!!!!!! botFunctions:" + logLevel + "->" + message + "\n" );
                break;
            case "warn":
                console.log( "+++++++++++ botFunctions:" + logLevel + "->" + message + "\n" );
                break;
            case "info":
                console.log( "----------- botFunctions:" + logLevel + "->" + message + "\n" );
                break;
            default:
                if ( bot.debug ) {
                    console.log( "botFunctions:" + logLevel + "->" + message + "\n" );
                }
                break;
        }
    }

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

        sarahConner: function ( data, userFunctions, chatFunctions ) {
            const sleep = ( delay ) => new Promise( ( resolve ) => setTimeout( resolve( "done" ), delay ) )

            const shutMeDown = async () => {
                // chatFunctions.botSpeak( data, "Going away now...", true );
                await sleep( 100 )
                logMe( 'error', 'The !sarahConner command was issued by @' + userFunctions.getUsername( userFunctions.whoSentTheCommand( data ) ) + ' at ' + Date() );
                await sleep( 100 )
                userFunctions.debugPrintTheUsersList();
                await sleep( 100 )
                logMe( 'error', 'Users:' + JSON.stringify( data ) );
                await sleep( 100 )
                process.exit( 1 );
            }
            shutMeDown();
        },

        reportUptime: function ( data, userFunctions, chatFunctions ) {
            let msecPerMinute = 1000 * 60;
            let msecPerHour = msecPerMinute * 60;
            let msecPerDay = msecPerHour * 24;
            this.setUptimeTime( Date.now() );
            let currentTime = this.uptimeTime() - this.botStartTime();

            let days = Math.floor( currentTime / msecPerDay );
            currentTime = currentTime - ( days * msecPerDay );

            let hours = Math.floor( currentTime / msecPerHour );
            currentTime = currentTime - ( hours * msecPerHour );

            let minutes = Math.floor( currentTime / msecPerMinute );

            chatFunctions.botSpeak( data, userFunctions.getUsername( authModule.USERID ) + ' has been up for: ' + days + ' days, ' + hours + ' hours, ' + minutes + ' minutes' );
        },

        songStatsCommand: function ( data, chatFunctions ) {
            if ( this.readSongStats() ) {
                this.disableReadSongStats( data, chatFunctions );
            } else  {
                this.enableReadSongStats( data, chatFunctions );
            }
        },

        autoDJCommand: function ( data, chatFunctions ) {
            if ( this.autoDJEnabled() ) {
                this.disableAutoDJ( data, chatFunctions );
            } else  {
                this.enableAutoDJ( data, chatFunctions );
            }
        },

        removeIdleDJsCommand: function ( data, userFunctions, chatFunctions ) {
            if ( userFunctions.removeIdleDJs() ) {
                userFunctions.disableDJIdle( data, chatFunctions );
            } else  {
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
                userFunctions.reportRefreshStatus( data, chatFunctions ); await sleep( 100 );
                this.reportRegionCheckStatus( data, videoFunctions, chatFunctions ); await sleep( 100 );
            }
            doInOrder();
        },

        checkVideoRegionsCommand: function ( data, videoFunctions, chatFunctions ) {
            logMe('info', 'checkVideoRegionsCommand, this.checkVideoRegions():' + this.checkVideoRegions() );
            if ( this.checkVideoRegions() ) {
                this.disablecheckVideoRegions( data, videoFunctions, chatFunctions );
            } else {
                this.enablecheckVideoRegions( data, videoFunctions, chatFunctions );
            }
        },

        addAlertRegionCommand: function ( data, args, videoFunctions, chatFunctions ) {
            const sleep = ( delay ) => new Promise( ( resolve ) => setTimeout( resolve, delay ) )
            const doInOrder = async () => {
                videoFunctions.addAlertRegion( data, args, chatFunctions );
                await sleep( 1000 )

                this.reportRegionCheckStatus( data, videoFunctions, chatFunctions );
                await sleep( 1000 )
            }
            doInOrder();
        },

        removeAlertRegionCommand: function (  data, args, videoFunctions, chatFunctions ) {
            const sleep = ( delay ) => new Promise( ( resolve ) => setTimeout( resolve, delay ) )
            const doInOrder = async () => {
                videoFunctions.removeAlertRegion( data, args, chatFunctions )
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
                chatFunctions.botSpeak( data, thisMessage );
                bot.remDj( userID );
            } else {
                chatFunctions.botSpeak( data, 'You can\'t leave the stage if you\'re not on stage...' )
            }
        },

        // ========================================================

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
                chatFunctions.botSpeak( data, 'Video Region checking is disabled' );
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
            const numberOfDJs = args[0];
            if ( isNaN(numberOfDJs) ) {
                chatFunctions.botSpeak( data, 'Don\'t be silly. I can\'t set the auto-DJing start value to ' + numberOfDJs );
            } else {
                whenToGetOnStage = numberOfDJs;
                this.reportAutoDJStatus( data, chatFunctions )
            }
        },

        whenToGetOffStage: () =>  whenToGetOffStage,
        setWhenToGetOffStage: function ( data, args, chatFunctions ) {
            const numberOfDJs = args[0];
            if ( isNaN(numberOfDJs) ) {
                chatFunctions.botSpeak( data, 'Don\'t be silly. I can\'t set the auto-DJing stop value to ' + numberOfDJs );
            } else {
                whenToGetOffStage = numberOfDJs;
                this.reportAutoDJStatus( data, chatFunctions )
            }
        },

        reportAutoDJStatus: function ( data, chatFunctions ) {
            if ( this.autoDJEnabled() ) {
                chatFunctions.botSpeak( data, 'Auto-DJing is enabled and will start at ' + this.whenToGetOnStage() + ' and stop at ' + this.whenToGetOffStage() );
            } else {
                chatFunctions.botSpeak( data, 'Auto DJing is disabled' )
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
                chatFunctions.botSpeak( data, 'Song stat reporting is enabled' );
            } else {
                chatFunctions.botSpeak( data, 'Song stats reporting is disabled' );
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
            attemptToReconnect = setInterval( function () {
                let whichMessage;
                if ( bot._isAuthenticated ) {
                    whichMessage = true;
                    logMe( 'error', '+++++++++++++++++++++++++ BotModule Error: it looks like your bot is not in it\'s room. attempting to reconnect now....' );
                } else {
                    whichMessage = false;
                    logMe( 'error', '+++++++++++++++++++++++++ BotModule Error: connection with turntable lost, waiting for connection to come back...' );
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
        },

        recordActivity: function () {
            checkActivity = Date.now(); //update when someone says something
        },

        isBotOnStage: function ( userFunctions ) {
            let isBotAlreadyOnStage = userFunctions.isUserIDOnStage( authModule.USERID );
            return isBotAlreadyOnStage;
        },

        shouldTheBotDJ: function ( userFunctions, roomFunctions ) {
            return userFunctions.howManyDJs() >= 1 && // is there at least one DJ on stage
                userFunctions.howManyDJs() <= this.whenToGetOnStage() && // are there fewer than the limit of DJs on stage
                userFunctions.queueList().length === 0 && // is the queue empty
                userFunctions.vipList.length === 0 && // there no VIPs
                userFunctions.refreshDJCount() === 0; // is there someone currently using the refresh command
        },

        shouldStopBotDJing: function ( userFunctions, roomFunctions ) {
            return userFunctions.howManyDJs() >= this.whenToGetOffStage() && // are there enough DJs onstage
                userFunctions.getCurrentDJID() !== authModule.USERID; // check the Bot isn't currently DJing
        },

        checkAutoDJing: function ( userFunctions, roomFunctions ) {
            if ( autoDjingTimer != null ) {
                clearTimeout( autoDjingTimer );
                autoDjingTimer = null;
            }

            if ( this.autoDJEnabled() === true ) {

                autoDjingTimer = setTimeout( function () {
                    if ( !this.isBotOnStage( userFunctions ) ) { //if the bot is not already on stage
                        if ( this.shouldTheBotDJ( userFunctions, roomFunctions ) ) {
                            this.startBotDJing();
                        }
                    } else { //else it is on stage
                        if ( this.shouldStopBotDJing( userFunctions, roomFunctions ) ) {
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

        clearAllTimers: function ( userFunctions, roomFunctions, songFunctions ) {
            userFunctions.clearInformTimer( roomFunctions );
            roomFunctions.clearSongLimitTimer( userFunctions, roomFunctions );
            songFunctions.clearWatchDogTimer();
            songFunctions.clearTakedownTimer( userFunctions, roomFunctions );
        },

        checkOnNewSong: function ( data, roomFunctions, songFunctions, userFunctions ) {
            let length = data.room.metadata.current_song.metadata.length;
            let masterIndex; //used to tell whether current dj is on the master id's list or not

            //clears timers if previously set
            this.clearAllTimers( userFunctions, roomFunctions, songFunctions );

            // Set this after processing things from last timer calls
            roomFunctions.lastdj = data.room.metadata.current_dj;
            masterIndex = userFunctions.masterIds().indexOf( roomFunctions.lastdj ); //master id's check

            songFunctions.startSongWatchdog( data, userFunctions, roomFunctions );

            //this boots the user if their song is over the length limit
            if ( ( length / 60 ) >= musicDefaults.songLengthLimit ) {
                if ( roomFunctions.lastdj() === authModule.USERID || masterIndex === -1 ) //if dj is the bot or not a master
                {
                    if ( musicDefaults.songLengthLimitOn === true ) {
                        if ( typeof userFunctions.theUsersList()[ userFunctions.theUsersList().indexOf( roomFunctions.lastdj ) + 1 ] !== 'undefined' ) {
                            bot.speak( "@" + userFunctions.theUsersList()[ userFunctions.theUsersList().indexOf( roomFunctions.lastdj ) + 1 ] + ", your song is over " + roomDefaults.songLengthLimit + " mins long, you have 20 seconds to skip before being removed." );
                        }
                        else {
                            bot.speak( 'current dj, your song is over ' + musicDefaults.songLengthLimit + ' mins long, you have 20 seconds to skip before being removed.' );
                        }

                        //START THE 20 SEC TIMER
                        roomFunctions.songLimitTimer = setTimeout( function () {
                            roomFunctions.songLimitTimer = null;
                            bot.remDj( roomFunctions.lastdj() ); // Remove Saved DJ from last newsong call
                        }, 20 * 1000 ); // Current DJ has 20 seconds to skip before they are removed
                    }
                }
            }
        },
    }
}

module.exports = botFunctions;