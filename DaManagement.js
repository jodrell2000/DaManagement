/** The Management, Turntable.fm bot
    Adam Reynolds 2021
    version 0.1 (forked from Mr. Roboto by Jake Smith)
    version 1.0 (forked from chillybot)
*/

/*******************************BeginSetUp*****************************************************************************/
/* load the ttapi */
let Bot = require( 'ttapi' );

let authModule = require( './auth.js' );
let botDefaults = require( './defaultSettings/botDefaults.js' );
let roomDefaults = require( './defaultSettings/roomDefaults.js' );
let musicDefaults = require( './defaultSettings/musicDefaults.js' );

let botModule = require( './modules/botModule.js' );
let userModule = require( './modules/userModule.js' );
let roomModule = require( './modules/roomModule.js' );
let chatModule = require( './modules/chatModule.js' );
let songModule = require( './modules/songModule.js' );
let commandModule = require( './modules/commandModule.js' );
let videoModule = require( './modules/videoModule.js' );
/************************************EndSetUp**********************************************************************/

let bot = new Bot( authModule.AUTH, authModule.USERID, authModule.ROOMID ); //initializes the bot
bot.debug = false;
bot.listen( process.env.PORT, process.env.IP ); //needed for running the bot on a server

const botFunctions = botModule( bot );
const userFunctions = userModule( bot );
const chatFunctions = chatModule( bot, roomDefaults );
const songFunctions = songModule( bot );
const roomFunctions = roomModule( bot );
const commandFunctions = commandModule( bot );
const videoFunctions = videoModule( bot );

function logMe ( logLevel, message ) {
    let theFile = "Main file";
    switch ( logLevel ) {
        case "error":
            console.log( "!!!!!!!!!!! " + theFile +  ":" + logLevel + "->" + message + "\n" );
            break;
        case "warn":
            console.log( "+++++++++++ " + theFile +  ":" + logLevel + "->" + message + "\n" );
            break;
        case "info":
            console.log( "----------- " + theFile +  ":" + logLevel + "->" + message + "\n" );
            break;
        default:
            if ( bot.debug ) {
                console.log( "" + theFile +  ":" + logLevel + "->" + message + "\n" );
            }
            break;
    }
}

// do something when the bot disconnects?
bot.on( 'disconnected', function ( data ) { } );

// check if the bot is still connected every 5 seconds
setInterval( function () {
    if ( !botFunctions.checkIfConnected() ) {
        botFunctions.reconnect();
    }
}, 5 * 1000 );

// check if DJs are idle every minute
setInterval( function () {
    if ( userFunctions.removeIdleDJs() === true ) {
        userFunctions.idledOutDJCheck( roomDefaults, chatFunctions );
    }
}, 10 * 1000 );

// check if the users are idle every minute
setInterval( function () { userFunctions.roomIdleCheck( roomDefaults, chatFunctions ) }, 60 * 1000 )

// every 5 seconds, check if the there's an empty DJ slot, and promt the next in the queue to join the decks, remove them if they don't
setInterval( function () {
    if ( roomDefaults.queueActive === true && userFunctions.queueList().length !== 0 && ( userFunctions.refreshDJCount() + userFunctions.howManyDJs() ) < 5 ) {
        userFunctions.setDJToNotify( userFunctions.headOfQueue() );
        if ( botFunctions.sayOnce() === true ) {
            botFunctions.setSayOnce( false );

            roomFunctions.queuePromptToDJ( chatFunctions, userFunctions );

            // start a timer to remove the DJ from the queue if they don't DJ
            roomFunctions.queueTimer = setTimeout( function () {
                if ( userFunctions.notifyThisDJ() !== null ) {
                    userFunctions.removeNotifyDJFromQueue( botFunctions, userFunctions );
                }
            }, roomDefaults.queueWaitTime * 1000 );
        }
    }
}, 5 * 1000 )

//this kicks all users off stage when the vip list is not empty...runs every 5 seconds
setInterval( function () { roomFunctions.clearDecksForVIPs( userFunctions, authModule ) }, 5 * 1000 )

// checks every 60 seconds, and sends event messages if there is one
setInterval( function () {
    chatFunctions.eventMessageIterator( botFunctions, userFunctions );
}, roomDefaults.eventMessageRepeatTime * 60 * 1000 ); //repeats check


//repeats the Welcome message every 15 mins if /messageOn has been used.
// setInterval( function() {
//     chatFunctions.repeatWelcomeMessage(userFunctions);
// },  roomDefaults.howOftenToRepeatMessage * 60 * 1000)

bot.on( 'ready', function () {
    userFunctions.botStartReset( botFunctions, songFunctions );

    //format the musicDefaults.bannedArtists list at runtime
    roomFunctions.formatBannedArtists();
} );

//starts up when a new person joins the room
bot.on( 'registered', function ( data ) {
    const theUserID = data.user[ 0 ].userid;
    const username = data.user[ 0 ].name;

    userFunctions.userJoinsRoom( theUserID, username );

    const bootThisUser = userFunctions.bootNewUserCheck[ 0 ];
    const bootMessage = userFunctions.bootNewUserCheck[ 1 ];

    if ( bootThisUser ) {
        userFunctions.bootThisUser( theUserID, bootMessage );
    } else {
        //if there are 5 dj's on stage and the queue is turned on when a user enters the room
        if ( roomDefaults.queueActive === true && userFunctions.howManyDJs() === 5 ) {
            bot.pm( 'The queue is currently active. To add yourself to the queue type /addme. To remove yourself from the queue type /removeme.', userFunctions.getUsername( theUserID ) );
        }

        if ( userFunctions.greetNewuser( theUserID, username, roomFunctions ) ) {
            const greetingTimers = roomFunctions.greetingTimer();

            greetingTimers[ theUserID ] = setTimeout( function () {
                chatFunctions.userGreeting( theUserID, username, roomFunctions )

                // remove timeout function from the list of timeout functions
                delete greetingTimers[ theUserID ];
            }, 3 * 1000 );
        }
    }
} );

//starts up when bot first enters the room
bot.on( 'roomChanged', function ( data ) {
    try {
        //reset arrays in case this was triggered by the bot restarting
        userFunctions.botStartReset( botFunctions, songFunctions );

        userFunctions.resetAllWarnMe( data );

        //get & set information
        roomFunctions.setRoomDefaults( data );

        userFunctions.rebuildUserList( data );
        userFunctions.resetModerators( data );

        userFunctions.resetAllSpamCounts();

        userFunctions.startAllUserTimers();

        userFunctions.resetDJs( data );

        // set user as current DJ
        userFunctions.setCurrentDJ( data.room.metadata.current_dj );

    }
    catch ( err ) {
        logMe( 'error', 'unable to join the room the room due to err: ' + err.toString() );
    }
} );

//checks at the beggining of the song
bot.on( 'newsong', function ( data ) {
    //resets counters and array for vote skipping
    songFunctions.resetCheckVotes();
    songFunctions.resetVoteCountSkip();
    songFunctions.resetVotesLeft( roomDefaults.HowManyVotesToSkip );
    songFunctions.resetUpVotes();
    songFunctions.resetDownVotes();
    songFunctions.resetSnagCount();
    songFunctions.resetVoteSnagging();

    //procedure for getting song tags
    songFunctions.getSongTags( data.room.metadata.current_song )

    //set information
    roomFunctions.setDJCount( data.room.metadata.djs.length ); //the number of dj's on stage
    roomDefaults.detail = data.room.description; //set room description again in case it was changed

    // set user as current DJ
    userFunctions.setCurrentDJ( data.room.metadata.current_dj );

    if ( songFunctions.ytid() !== undefined ) {
        videoFunctions.checkVideoRegionAlert( data, songFunctions.ytid(), userFunctions, chatFunctions, botFunctions );
    }

    //adds a song to the end of your bots queue
    if ( songFunctions.snagSong() === true ) {
        botFunctions.checkAndAddToPlaylist( songFunctions );
    }

    //if true causes the bot to start bopping to the currently playing song
    if ( botDefaults.autoBop === true ) {
        bot.bop();
    }

    //check to see if conditions are met for bot's autodjing feature
    botFunctions.checkAutoDJing( userFunctions, roomFunctions );

    //if the bot is the only one on stage and they are skipping their songs
    //they will stop skipping
    if ( roomFunctions.djCount() === 1 && userFunctions.getCurrentDJID() === authModule.USERID && botFunctions.skipOn === true ) {
        botFunctions.setSkipOn( false );
    }

    //used to have the bot skip its song if its the current player and skipOn command was used
    if ( authModule.USERID === userFunctions.getCurrentDJID() && botFunctions.skipOn() === true ) {
        bot.skip();
    }

    //this is for /warnme
    userFunctions.warnMeCall( roomFunctions );

    //removes current dj from stage if they play a banned song or artist.
    if ( musicDefaults.bannedArtists.length !== 0 && typeof songFunctions.artist() !== 'undefined' && typeof songFunctions.song() !== 'undefined' ) {
        const djCheck = userFunctions.getCurrentDJID();
        let checkIfAdmin = userFunctions.masterIds().indexOf( djCheck ); //is user an exempt admin?
        let nameDj = userFunctions.theUsersList().indexOf( djCheck ) + 1; //the currently playing dj's name

        if ( checkIfAdmin === -1 ) {
            //if matching is enabled for both songs and artists
            if ( musicDefaults.matchArtists && musicDefaults.matchSongs ) {
                if ( songFunctions.artist().match( roomFunctions.bannedArtistsMatcher() ) || songFunctions.song().match( roomFunctions.bannedArtistsMatcher() ) ) {
                    bot.remDj( djCheck );

                    if ( typeof userFunctions.theUsersList()[ nameDj ] !== 'undefined' ) {
                        bot.speak( '@' + userFunctions.theUsersList()[ nameDj ] + ' you have played a banned track or artist.' );
                    }
                    else {
                        bot.speak( 'current dj, you have played a banned track or artist.' );
                    }
                }
            }
            else if ( musicDefaults.matchArtists ) //if just artist matching is enabled
            {
                if ( songFunctions.artist().match( roomFunctions.bannedArtistsMatcher() ) ) {
                    bot.remDj( userFunctions.getCurrentDJID() );

                    if ( typeof userFunctions.theUsersList()[ nameDj ] !== 'undefined' ) {
                        bot.speak( '@' + userFunctions.theUsersList()[ nameDj ] + ' you have played a banned artist.' );
                    }
                    else {
                        bot.speak( 'current dj, you have played a banned artist.' );
                    }
                }
            }
            else if ( musicDefaults.matchSongs ) //if just song matching is enabled
            {
                if ( songFunctions.song().match( roomFunctions.bannedArtistsMatcher() ) ) {
                    bot.remDj( djCheck );

                    if ( typeof userFunctions.theUsersList()[ nameDj ] !== 'undefined' ) {
                        bot.speak( '@' + userFunctions.theUsersList()[ nameDj ] + ' you have played a banned track.' );
                    }
                    else {
                        bot.speak( 'current dj, you have played a banned track.' );
                    }
                }
            }
        }
    }

    //look at function above, /inform, song length limit,stuck song detection
    botFunctions.checkOnNewSong( data, roomFunctions, songFunctions, userFunctions );

    //quality control check, if current dj's information is somehow wrong because
    //of some event not firing, remake currentDj's array
    // data.room.metadata.djs.length is index 0 so add 1 to compare
    if ( data.room.metadata.djs.length !== userFunctions.howManyDJs() ) {
        logMe( 'error', Date.now() + ' The DJ counts don\'t match...resetting them. Count from data is ' + data.room.metadata.djs.length + ', count from Bot is ' + userFunctions.howManyDJs() );
        userFunctions.resetDJs( data ); //reset current djs array
    }
} );

//bot gets on stage and starts djing if no song is playing.
bot.on( 'nosong', function () {
    if ( botFunctions.autoDJEnabled() === true &&
        userFunctions.vipList().length === 0 &&
        userFunctions.queueList().length === 0 &&
        userFunctions.refreshDJCount() === 0 ) {
        bot.addDj();
    }

    botFunctions.setSkipOn( false );
    botFunctions.clearAllTimers( userFunctions, roomFunctions, songFunctions );
} )

//checks when the bot speaks
bot.on( 'speak', function ( data ) {
    let text = data.text; //the most recent text in the chatbox on turntable
    let theUserID = data.userid;
    userFunctions.name = data.name; //name of latest person to say something
    botFunctions.recordActivity();

    userFunctions.updateUserLastSpoke( theUserID ); //update the afk position of the speaker

    if ( commandFunctions.wasThisACommand( data ) ) {
        commandFunctions.parseCommands( data, userFunctions, botFunctions, roomFunctions, songFunctions, chatFunctions, videoFunctions );
    }

    //checks to see if someone is trying to speak to an afk person or not.
    const foundUsernames = userFunctions.checkTextForUsernames( text );

    let thisAFKUser;
    for ( userLoop = 0; userLoop < foundUsernames.length; userLoop++ ) {
        thisAFKUserID = userFunctions.getUserIDFromUsername( foundUsernames[ userLoop ] );
        if ( userFunctions.isUserAFK( thisAFKUserID ) && !userFunctions.isThisTheBot( theUserID ) === true ) {
            userFunctions.sendUserIsAFKMessage( data, thisAFKUserID, chatFunctions );
        }
    }
} );

//checks when the bot recieves a pm
bot.on( 'pmmed', function ( data ) {
    if ( commandFunctions.wasThisACommand( data ) ) {
        commandFunctions.parseCommands( data, userFunctions, botFunctions, roomFunctions, songFunctions, chatFunctions, videoFunctions );
    }
} );

//checks who voted and updates their position on the afk list.
bot.on( 'update_votes', function ( data ) {
    songFunctions.recordUpVotes( data );
    songFunctions.recordDownVotes( data );
    userFunctions.updateUserLastVoted( data.room.metadata.votelog[ 0 ][ 0 ] ); //update the afk position of people who vote for a song

    //this is for /autosnag, automatically adds songs that get over the awesome threshold
    if ( botDefaults.autoSnag === true && songFunctions.snagSong() === false && songFunctions.upVotes() >= botDefaults.howManyVotes && songFunctions.ALLREADYCALLED() === false ) {
        songFunctions.songSnagged();
        botFunctions.checkAndAddToPlaylist( songFunctions );
    }
} )

//checks who added a song and updates their position on the afk list.
bot.on( 'snagged', function ( data ) {
    logMe('info', '++++++++++++++++++++++++++++++++++++++++ snagged...');
    songFunctions.incrementSnagCount();
    userFunctions.updateUserLastSnagged( data.userid ); //update the afk position of people who add a song to their queue
} )

//this activates when a user joins the stage.
bot.on( 'add_dj', function ( data ) {
    let OKToDJ;
    let theMessage;
    const theUserID = data.user[ 0 ].userid;

    [ OKToDJ, theMessage ] = userFunctions.checkOKToDJ( theUserID, roomFunctions );

    if ( !OKToDJ ) {
        bot.remDj( theUserID );
        userFunctions.incrementSpamCounter( theUserID );
        chatFunctions.botSpeak( data, theMessage );
    }

    //sets dj's current songcount to zero when they enter the stage.
    //unless they used the refresh command, in which case its set to
    //what it was before they left the room
    userFunctions.setDJCurrentPlayCount( theUserID, userFunctions.getUsersRefreshCurrentPlayCount[ theUserID ] );
    userFunctions.setDJTotalPlayCount( theUserID, userFunctions.getUsersRefreshTotalPlayCount[ theUserID ] );

    //updates the afk position of the person who joins the stage.
    userFunctions.updateUserJoinedStage( theUserID );

    //adds a user to the Djs list when they join the stage.
    userFunctions.addDJToList( theUserID );

    if ( userFunctions.isUserIDInQueue( theUserID ) ) {
        userFunctions.removeUserFromQueue( theUserID, botFunctions );
        userFunctions.clearDJToNotify();
    }

    if ( userFunctions.isUserInRefreshList( theUserID ) ) {
        userFunctions.removeRefreshFromUser( theUserID );
    }

    //check to see if conditions are met for bot's autodjing feature
    botFunctions.checkAutoDJing( userFunctions, roomFunctions );
} );

//checks when a dj leaves the stage
bot.on( 'rem_dj', function ( data ) {
    let theUserID = data.user[ 0 ].userid;
    //removes user from the dj list when they leave the stage
    userFunctions.resetDJFlags( theUserID );

    //gives them one chance to get off stage then after that theyre play limit is treated as normal
    if ( typeof userFunctions.getUsersRefreshCurrentPlayCount[ theUserID ] == 'number' && userFunctions.isUserInRefreshList( theUserID ) === -1 ) {
        delete userFunctions.getUsersRefreshCurrentPlayCount[ theUserID ]
    }

    //remove from the current dj's list.
    userFunctions.removeDJFromList( theUserID )

    //this is for /warnme
    if ( userFunctions.warnme().length !== 0 ) {
        let areTheyBeingWarned = userFunctions.warnme().indexOf( theUserID );

        if ( areTheyBeingWarned !== -1 ) //if theyre on /warnme and they leave the stage
        {
            userFunctions.warnme().splice( areTheyBeingWarned, 1 );
        }
    }

    //checks if when someone gets off the stage, if the person
    //on the left is now the next dj
    userFunctions.warnMeCall( roomFunctions );

    //check to see if conditions are met for bot's autodjing feature
    botFunctions.checkAutoDJing( userFunctions, roomFunctions );

    //takes a user off the escort list if they leave the stage.
    userFunctions.removeEscortMeFromUser( theUserID );
} );

bot.on( 'update_user', function ( data ) {
    userFunctions.updateUser( data, roomFunctions );
} )

//updates the moderator list when a moderator is added.
bot.on( 'new_moderator', function ( data ) {
    const theUserID = data.userid;
    userFunctions.addModerator( theUserID )
} )

//updates the moderator list when a moderator is removed.
bot.on( 'rem_moderator', function ( data ) {
    const theUserID = data.userid;
    userFunctions.removeModerator( theUserID )
} )

//starts up when a user leaves the room
bot.on( 'deregistered', function ( data ) {
    let theUserID = data.user[ 0 ].userid;
    userFunctions.deregisterUser( theUserID )
} )

//activates at the end of a song.
bot.on( 'endsong', function ( data ) {
    songFunctions.grabSongStats();
    const djID = data.room.metadata.current_dj;

    //bot says song stats for each song
    chatFunctions.readSongStats( data, songFunctions, botFunctions )

    userFunctions.incrementDJPlayCount( djID );

    // check the playlimit and remove the current DJ if they've reached it
    userFunctions.removeDJsOverPlaylimit( data, chatFunctions, djID );

    roomFunctions.escortDJsDown( data, djID, botFunctions, userFunctions, chatFunctions );
} );
