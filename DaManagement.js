/** The Management, Turntable.fm bot
 Adam Reynolds 2021-2022
 version 0.1 (forked from chillybot)
 version 0.2 (forked from Mr. Roboto by Jake Smith)
 version 0.3 (bears very little resemblance to the original now)
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
let documentationModule = require( './modules/documentationModule.js' );
let databaseModule = require( './modules/databaseModule.js' );
let dateModule = require( './modules/dateModule.js' );
// let mlModule = require( './modules/mlModule.js' );

const express = require( 'express' );
const path = require( 'path' );
const app = express();
const pug = require( 'pug' );
const bodyParser = require( 'body-parser' );
const dayjs = require( 'dayjs' );
const utc = require( 'dayjs/plugin/utc' );
dayjs.extend( utc )
const bcrypt = require( 'bcrypt' );

// Use Morgan middleware for logging
// const morgan = require( 'morgan' );
// app.use( morgan( 'dev' ) );

// serve static files from teh images folder
app.use( '/images', express.static( path.join( __dirname, 'images' ) ) );

// client authentication
app.use( ( req, res, next ) => {
    if ( req.originalUrl === '/signup' || req.originalUrl === '/instructions' || req.originalUrl === '/images' ) {
        return next();
    }
    authentication( req, res, next );
} );

app.use( `/scripts`, express.static( './scripts' ) );
app.use( `/modules`, express.static( './node_modules' ) );
app.use( `/styles`, express.static( './styles' ) );
app.use( express.json() );
app.use( bodyParser.urlencoded( { extended: false } ) );

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
const documentationFunctions = documentationModule();
const databaseFunctions = databaseModule();
const dateFunctions = dateModule();
// const mlFunctions = mlModule();

// do something when the bot disconnects?
// eslint-disable-next-line no-unused-vars
bot.on( 'disconnected', function ( data ) { } );

// check if the bot is still connected every 5 seconds
setInterval( function () {
    if ( !botFunctions.checkIfConnected() ) {
        botFunctions.reconnect();
    }
}, 5 * 1000 );

// check if DJs are idle every minute
setInterval( function () {
    // only check for idle DJs if the bot has been up for more than a minute
    if ( botFunctions.getUptime() > 60000 ) {
        if ( userFunctions.removeIdleDJs() === true ) {
            userFunctions.idledOutDJCheck( roomDefaults, chatFunctions, databaseFunctions );
        }
    }
}, 10 * 1000 );

// check if the users are idle every minute
setInterval( function () { userFunctions.roomIdleCheck( roomDefaults, chatFunctions ) }, 60 * 1000 )

// every 5 seconds, check if the there's an empty DJ slot, and prompt the next in the queue to join the decks, remove them if they don't
setInterval( function () {
    if ( roomDefaults.queueActive !== true && ( userFunctions.howManyDJs() >= roomFunctions.maxDJs() ) ) {
        roomDefaults.queueActive = true;
        chatFunctions.botSpeak( "The Queue is now active", null, true, null );
    }

    if ( roomDefaults.queueActive === true && ( userFunctions.refreshDJCount() + userFunctions.howManyDJs() ) < roomFunctions.maxDJs() ) {
        if ( userFunctions.queueList().length > 0 ) {
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
        } else {
            roomDefaults.queueActive = false;
            chatFunctions.botSpeak( "The Queue is now disabled", null, true, null );
        }
    }
}, 5 * 1000 )

//this kicks all users off-stage when the vip list is not empty...runs every 5 seconds
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
bot.on( 'registered', async function ( data ) {
    const username = data.user[ 0 ].name;
    if ( username !== "Guest" ) {
        const userID = data.user[ 0 ].userid;

        userFunctions.userJoinsRoom( userID, username, databaseFunctions );

        const bootThisUser = userFunctions.bootNewUserCheck( userID, username );
        const bootUser = bootThisUser[ 0 ];
        const bootUserMessage = bootThisUser[ 1 ];

        if ( bootUser !== false ) {
            userFunctions.bootThisUser( userID, bootUserMessage );
        } else {
            chatFunctions.userGreeting( data, userID, username, roomFunctions, userFunctions, databaseFunctions )
        }

        if ( !( await databaseFunctions.hasUserHadInitialRoboCoinGift( userID ) ) ) {
            await userFunctions.giveInitialRoboCoinGift( data, userID, databaseFunctions, chatFunctions, roomFunctions );
        }

        userFunctions.askUserToSetRegion( userID, chatFunctions );
        userFunctions.updateRegionAlertsFromUsers( data, videoFunctions, chatFunctions );
    }
} );

//starts up when a user leaves the room
bot.on( 'deregistered', function ( data ) {
    const username = data.user[ 0 ].name;
    if ( username !== "Guest" ) {
        let theUserID = data.user[ 0 ].userid;
        userFunctions.deregisterUser( theUserID, databaseFunctions );
        userFunctions.updateRegionAlertsFromUsers( data, videoFunctions, chatFunctions );
    }
} );

//starts up when bot first enters the room
bot.on( 'roomChanged', async function ( data ) {
    try {
        userFunctions.resetUsersList();

        // load in and user data on disk first
        userFunctions.initialUserDataLoad( databaseFunctions );

        // reset arrays in case this was triggered by the bot restarting
        userFunctions.resetAllWarnMe( data, databaseFunctions );

        // get & set information
        roomFunctions.setRoomDefaults( data );

        // build in the users in the room, skip any already loaded from disk
        userFunctions.rebuildUserList( data );

        userFunctions.resetModerators( data, databaseFunctions );
        userFunctions.startAllUserTimers( databaseFunctions );
        userFunctions.resetDJs( data );

        if ( data.room.metadata.current_dj !== null ) {
            userFunctions.setCurrentDJ( data.room.metadata.current_dj, databaseFunctions );
        }
        if ( data.room.metadata.current_song !== null ) {
            songFunctions.getSongTags( data.room.metadata.current_song );
        }
        // ask users for their regions if we don't have them
        userFunctions.checkUsersHaveRegions( data, chatFunctions );
        userFunctions.updateRegionAlertsFromUsers( data, videoFunctions, chatFunctions );

        chatFunctions.botSpeak( "System online...", data );
    } catch ( err ) {
        console.error( 'Error in roomChanged event:', err );
        console.log( 'error', 'Unable to join the room due to an error: ' + err.toString() );
    }
} );

//checks at the beginning of the song
bot.on( 'newsong', function ( data ) {
    //resets counters and array for vote skipping
    songFunctions.resetVoteCountSkip();
    songFunctions.resetVotesLeft( roomDefaults.HowManyVotesToSkip );
    songFunctions.resetUpVotes();
    songFunctions.resetDownVotes();
    songFunctions.resetSnagCount();
    songFunctions.resetVoteSnagging();
    botFunctions.clearAllTimers( userFunctions, roomFunctions, songFunctions );

    //procedure for getting song tags
    //console.info( "data.room.metadata.current_song:" + JSON.stringify( data.room.metadata.current_song ) );
    songFunctions.getSongTags( data.room.metadata.current_song )
    databaseFunctions.saveLastSongStats( songFunctions );

    //set information
    roomFunctions.setDJCount( data.room.metadata.djs.length ); //the number of djs on stage
    roomDefaults.detail = data.room.description; //set room description again in case it was changed

    // set user as current DJ
    let djID = data.room.metadata.current_dj;
    userFunctions.setCurrentDJ( djID, databaseFunctions );

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

    //check to see if conditions are met for bots autodjing feature
    botFunctions.checkAutoDJing( userFunctions );

    //if the bot is the only one on stage, and they are skipping their songs
    //they will stop skipping
    if ( roomFunctions.djCount() === 1 && userFunctions.getCurrentDJID() === authModule.USERID && botFunctions.skipOn === true ) {
        botFunctions.setSkipOn( false );
    }

    //used to have the bot skip its song if it's the current player and skipOn command was used
    if ( authModule.USERID === userFunctions.getCurrentDJID() && botFunctions.skipOn() === true ) {
        bot.skip();
    }

    //this is for /warnme
    userFunctions.warnMeCall( roomFunctions );

    botFunctions.isFavouriteArtist( databaseFunctions, data.room.metadata.current_song.metadata.artist )
        .then( ( result ) => {
            if ( result !== false ) {
                chatFunctions.botSpeak( "/props", data );
                chatFunctions.botSpeak( "Awesome play..." + result + " is my favourite!", data );
            }
        } )
        .then( () => {
            chatFunctions.botSpeak( "Have 10 RoboCoin as a thank you", data );
            userFunctions.addRoboCoins( djID, 10, "Played Robo's favourite artist", 3, databaseFunctions );
        } )
        .then( () => {
            botFunctions.chooseNewFavourite( databaseFunctions );
        } )
        .catch( ( error ) => {
            console.error( error );
        } );


    //removes current dj from stage if they play a banned song or artist.
    if ( musicDefaults.bannedArtists.length !== 0 && typeof songFunctions.artist() !== 'undefined' && typeof songFunctions.song() !== 'undefined' ) {
        const djCheck = userFunctions.getCurrentDJID();
        let checkIfAdmin = userFunctions.masterIds().indexOf( djCheck ); //is user an exempt admin?

        if ( checkIfAdmin === -1 ) {
            //if matching is enabled for both songs and artists
            if ( musicDefaults.matchArtists && musicDefaults.matchSongs ) {
                if ( songFunctions.artist().match( roomFunctions.bannedArtistsMatcher() ) || songFunctions.song().match( roomFunctions.bannedArtistsMatcher() ) ) {
                    userFunctions.removeDJ( djCheck, 'DJ has played a banned song or artist' );

                    if ( typeof userFunctions.getUsername( djCheck ) !== 'undefined' ) {
                        bot.speak( '@' + userFunctions.getUsername( djCheck ) + ' you have played a banned track or artist.' );
                    } else {
                        bot.speak( 'current dj, you have played a banned track or artist.' );
                    }
                }
            } else if ( musicDefaults.matchArtists ) //if just artist matching is enabled
            {
                if ( songFunctions.artist().match( roomFunctions.bannedArtistsMatcher() ) ) {
                    userFunctions.removeDJ( djCheck, 'DJ has played a banned song or artist' );

                    if ( typeof userFunctions.getUsername( djCheck ) !== 'undefined' ) {
                        bot.speak( '@' + userFunctions.getUsername( djCheck ) + ' you have played a banned artist.' );
                    } else {
                        bot.speak( 'current dj, you have played a banned artist.' );
                    }
                }
            } else if ( musicDefaults.matchSongs ) //if just song matching is enabled
            {
                if ( songFunctions.song().match( roomFunctions.bannedArtistsMatcher() ) ) {
                    userFunctions.removeDJ( djCheck, 'DJ has played a banned song or artist' );

                    if ( typeof userFunctions.getUsername( djCheck ) !== 'undefined' ) {
                        bot.speak( '@' + userFunctions.getUsername( djCheck ) + ' you have played a banned track.' );
                    } else {
                        bot.speak( 'current dj, you have played a banned track.' );
                    }
                }
            }
        }
    }

    //look at function above, /inform, song length limit,stuck song detection
    botFunctions.checkOnNewSong( data, roomFunctions, songFunctions, userFunctions );

    //quality control check, if current djs information is somehow wrong because
    //of some event not firing, remake currentDjs array
    // data.room.metadata.djs.length is index 0 so add 1 to compare
    if ( data.room.metadata.djs.length !== userFunctions.howManyDJs() ) {
        console.warn( botFunctions.getFormattedDate() + ' The DJ counts don\'t match...resetting them. Count from data is ' + data.room.metadata.djs.length + ', count from Bot is ' + userFunctions.howManyDJs() );
        userFunctions.resetDJs( data ); //reset current djs array
    }

    if ( roomFunctions.themeRandomizerEnabled() === true && userFunctions.lastDJPlaying() ) {
        roomFunctions.announceNewRandomThene( data, chatFunctions );
    }

    databaseFunctions.saveTrackData( djID, data.room.metadata.current_song );
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

    userFunctions.updateUserLastSpoke( theUserID, databaseFunctions ); //update the afk position of the speaker

    if ( commandFunctions.wasThisACommand( data ) ) {
        // commandFunctions.parseCommands( data, userFunctions, botFunctions, roomFunctions, songFunctions, chatFunctions, videoFunctions, documentationFunctions, databaseFunctions, dateFunctions, mlFunctions );
        commandFunctions.parseCommands( data, userFunctions, botFunctions, roomFunctions, songFunctions, chatFunctions, videoFunctions, documentationFunctions, databaseFunctions, dateFunctions );
    }

    //checks to see if someone is trying to speak to an afk person or not.
    const foundUsernames = userFunctions.checkTextForUsernames( text );

    for ( let userLoop = 0; userLoop < foundUsernames.length; userLoop++ ) {
        let thisAFKUserID = userFunctions.getUserIDFromUsername( foundUsernames[ userLoop ] );
        if ( userFunctions.isUserAFK( thisAFKUserID ) && !userFunctions.isThisTheBot( theUserID ) === true ) {
            userFunctions.sendUserIsAFKMessage( data, thisAFKUserID, chatFunctions );
        }
    }
} );

//checks when the bot receives a pm
bot.on( 'pmmed', function ( data ) {
    if ( commandFunctions.wasThisACommand( data ) ) {
        // commandFunctions.parseCommands( data, userFunctions, botFunctions, roomFunctions, songFunctions, chatFunctions, videoFunctions, documentationFunctions, databaseFunctions, dateFunctions, mlFunctions );
        commandFunctions.parseCommands( data, userFunctions, botFunctions, roomFunctions, songFunctions, chatFunctions, videoFunctions, documentationFunctions, databaseFunctions, dateFunctions );
    }
} );

//checks who voted and updates their position on the afk list.
bot.on( 'update_votes', function ( data ) {
    songFunctions.recordUpVotes( data );
    songFunctions.recordDownVotes( data );
    userFunctions.updateUserLastVoted( data.room.metadata.votelog[ 0 ][ 0 ], databaseFunctions ); //update the afk position of people who vote for a song

    //this is for /autosnag, automatically adds songs that get over the awesome threshold
    if ( botDefaults.autoSnag === true && songFunctions.snagSong() === false && songFunctions.upVotes() >= botDefaults.howManyVotes && songFunctions.ALLREADYCALLED() === false ) {
        songFunctions.songSnagged();
        botFunctions.checkAndAddToPlaylist( songFunctions );
    }
} )

//checks who added a song and updates their position on the afk list.
bot.on( 'snagged', function ( data ) {
    songFunctions.incrementSnagCount();
    userFunctions.updateUserLastSnagged( data.userid, databaseFunctions ); //update the afk position of people who add a song to their queue
} )

//this activates when a user joins the stage
bot.on( 'add_dj', function ( data ) {
    let OKToDJ;
    let theMessage;
    const theUserID = data.user[ 0 ].userid;
    const totalPlayCount = userFunctions.getDJTotalPlayCount( theUserID );

    [ OKToDJ, theMessage ] = userFunctions.checkOKToDJ( theUserID, roomFunctions );

    if ( !OKToDJ ) {
        userFunctions.removeDJ( theUserID, 'User is not allowed to DJ so was removed' );
        userFunctions.incrementSpamCounter( theUserID, databaseFunctions );
        chatFunctions.botSpeak( theMessage, data );
    }

    //sets djs current song count to zero when they enter the stage.
    //unless they used the refresh command, in which case its set to
    //what it was before they left the room
    userFunctions.setDJCurrentPlayCount( theUserID, userFunctions.getUsersRefreshCurrentPlayCount[ theUserID ], databaseFunctions );

    //keep the total play count as it is, unless they've refreshed
    if ( totalPlayCount !== undefined ) {
        userFunctions.setDJTotalPlayCount( theUserID, totalPlayCount, databaseFunctions );
    } else {
        userFunctions.setDJTotalPlayCount( theUserID, userFunctions.getUsersRefreshTotalPlayCount[ theUserID ], databaseFunctions );
    }
    //updates the afk position of the person who joins the stage.
    userFunctions.updateUserJoinedStage( theUserID, databaseFunctions );

    //adds a user to the Djs list when they join the stage.
    userFunctions.addDJToList( theUserID );

    if ( userFunctions.isUserIDInQueue( theUserID ) ) {
        userFunctions.removeUserFromQueue( theUserID, botFunctions );
        userFunctions.clearDJToNotify();
    }

    if ( userFunctions.isUserInRefreshList( theUserID ) ) {
        userFunctions.removeRefreshFromUser( theUserID, databaseFunctions );
    }

    //check to see if conditions are met for bots autodjing feature
    botFunctions.checkAutoDJing( userFunctions );
} );

//checks when a dj leaves the stage
bot.on( 'rem_dj', function ( data ) {
    let theUserID = data.user[ 0 ].userid;
    //removes user from the dj list when they leave the stage
    userFunctions.resetDJFlags( theUserID, databaseFunctions );

    //gives them one chance to get off-stage, then after that they're play limit is treated as normal
    if ( typeof userFunctions.getUsersRefreshCurrentPlayCount[ theUserID ] == 'number' && userFunctions.isUserInRefreshList( theUserID ) === false ) {
        delete userFunctions.getUsersRefreshCurrentPlayCount[ theUserID ]
    }

    //remove from the current djs list.
    userFunctions.removeDJFromList( theUserID )

    //this is for /warnme
    if ( userFunctions.warnme().length !== 0 ) {
        let areTheyBeingWarned = userFunctions.warnme().indexOf( theUserID );

        if ( areTheyBeingWarned !== -1 ) //if they're on /warnme and they leave the stage
        {
            userFunctions.warnme().splice( areTheyBeingWarned, 1 );
        }
    }

    //checks if when someone gets off the stage, if the person
    //on the left is now the next dj
    userFunctions.warnMeCall( roomFunctions );

    //check to see if conditions are met for bots autodjing feature
    botFunctions.checkAutoDJing( userFunctions );

    //takes a user off the escort list if they leave the stage.
    userFunctions.removeEscortMeFromUser( theUserID, databaseFunctions );
} );

bot.on( 'update_user', function ( data ) {
    userFunctions.updateUser( data, databaseFunctions );
} )

//updates the moderator list when a moderator is added.
bot.on( 'new_moderator', function ( data ) {
    const theUserID = data.userid;
    userFunctions.addModerator( theUserID, databaseFunctions )
} )

//updates the moderator list when a moderator is removed.
bot.on( 'rem_moderator', function ( data ) {
    const theUserID = data.userid;
    userFunctions.removeModerator( theUserID, databaseFunctions )
} )

//activates at the end of a song.
bot.on( 'endsong', function ( data ) {
    songFunctions.grabSongStats();
    const djID = data.room.metadata.current_dj;
    roomFunctions.setLastDJ( djID );

    //bot says song stats for each song
    chatFunctions.readSongStats( data, songFunctions, botFunctions, databaseFunctions );

    userFunctions.incrementDJPlayCount( djID, databaseFunctions );

    // check the play limit and remove the current DJ if they've reached it
    userFunctions.removeDJsOverPlaylimit( data, chatFunctions, djID );

    roomFunctions.escortDJsDown( data, djID, botFunctions, userFunctions, chatFunctions, databaseFunctions );
} );

// ########################################################################
// DB Song Editor
// ########################################################################

app.get( '/listunverified', async ( req, res ) => {
    try {
        const sortParam = req.body.sort || req.query.sort || '';
        const whereParam = req.body.where || req.query.where || '';
        const searchParam = req.body.searchTerm || req.query.searchTerm || '';
        const dbSearchArgs = req.query || req.body;

        const songList = await databaseFunctions.getUnverifiedSongList( dbSearchArgs );
        const dbStats = await databaseFunctions.getVerifiedStats();
        const djStatsObject = await databaseFunctions.getVerificationDJStats();
        const unfixedCount = djStatsObject[ 'Unfixed' ];
        console.log( "unfixedCount:" + unfixedCount );
        const availableRoboCoins = songFunctions.fixTrackPayments() * unfixedCount;
        console.log( "availableRoboCoins:" + availableRoboCoins );
        const djStats = Object.entries( djStatsObject ).slice( 0, 10 );

        let html = pug.renderFile( './templates/listUnverifiedSongs.pug', {
            songList,
            sort: sortParam,
            where: whereParam,
            searchTerm: searchParam,
            dbStats,
            djStats,
            availableRoboCoins
        } );
        res.send( html );
    } catch ( error ) {
        console.error( error );
        res.sendStatus( 500 );
    }
} );

app.post( '/updateArtistDisplayName', async ( req, res ) => {
    try {
        const username = req.username;
        const videoData_id = req.body.videoData_id;
        const artistDisplayName = req.body.artistDisplayName;
        const sortParam = req.body.sort || req.query.sort || '';
        const whereParam = req.body.where || req.query.where || '';
        const searchParam = req.body.searchTerm || req.query.searchTerm || '';

        await databaseFunctions.updateArtistDisplayName( videoData_id, artistDisplayName );

        const userID = userFunctions.getUserIDFromUsername( username );
        const numCoins = songFunctions.fixTrackPayments();
        const changeReason = "Fixed artist name for " + videoData_id;
        const changeID = 5;
        await userFunctions.addRoboCoins( userID, numCoins, changeReason, changeID, databaseFunctions );

        const queryParams = new URLSearchParams( { sort: sortParam, where: whereParam, searchTerm: searchParam } );
        const redirectUrl = '/listunverified?' + queryParams.toString();
        res.redirect( redirectUrl );
    } catch ( error ) {
        console.error( 'Error in updateArtistDisplayName:', error );
        res.status( 500 ).send( 'Internal server error' );
    }
} );
app.post( '/updateTrackDisplayName', async ( req, res ) => {
    try {
        const username = req.username;
        const videoData_id = req.body.videoData_id;
        const trackDisplayName = req.body.trackDisplayName;
        const sortParam = req.body.sort || req.query.sort || '';
        const whereParam = req.body.where || req.query.where || '';
        const searchParam = req.body.searchTerm || req.query.searchTerm || '';

        await databaseFunctions.updateTrackDisplayName( videoData_id, trackDisplayName );

        const userID = userFunctions.getUserIDFromUsername( username );
        const numCoins = songFunctions.fixTrackPayments();
        const changeReason = "Fixed track name for " + videoData_id;
        const changeID = 5;
        await userFunctions.addRoboCoins( userID, numCoins, changeReason, changeID, databaseFunctions );

        const queryParams = new URLSearchParams( { sort: sortParam, where: whereParam, searchTerm: searchParam } );
        const redirectUrl = '/listunverified?' + queryParams.toString();
        res.redirect( redirectUrl );
    } catch ( error ) {
        console.error( 'Error in updateArtistDisplayName:', error );
        res.status( 500 ).send( 'Internal server error' );
    }
} );

// ########################################################################
// Top 10 Countdown Data
// ########################################################################

async function getTop10( req, res, functionName, templateFile ) {
    try {
        const { startDate, endDate } = req.query;
        const [ formStartDate, formEndDate, linkStartDate, linkEndDate ] = [
            dateFunctions.formStartDate( dayjs, startDate ),
            dateFunctions.formEndDate( dayjs, endDate ),
            dateFunctions.linkStartDate( dayjs, startDate ),
            dateFunctions.linkEndDate( dayjs, endDate ),
        ];
        const [ top10SongList, top1080sSongList, top10WednesdaySongList, top10FridaySongList ] = await Promise.all( [
            databaseFunctions[ functionName ]( dateFunctions.dbStartDate( dayjs, startDate ), dateFunctions.dbEndDate( dayjs, endDate ) ),
            databaseFunctions[ functionName ]( dateFunctions.dbStartDate( dayjs, startDate ), dateFunctions.dbEndDate( dayjs, endDate ), [ 0, 1, 2, 3, 5 ] ),
            databaseFunctions[ functionName ]( dateFunctions.dbStartDate( dayjs, startDate ), dateFunctions.dbEndDate( dayjs, endDate ), [ 4 ] ),
            databaseFunctions[ functionName ]( dateFunctions.dbStartDate( dayjs, startDate ), dateFunctions.dbEndDate( dayjs, endDate ), [ 6 ] ),
        ] );
        const html = pug.renderFile( `./templates/${ templateFile }.pug`, {
            top10SongList,
            top1080sSongList,
            top10WednesdaySongList,
            top10FridaySongList,
            formStartDate,
            formEndDate,
            linkStartDate,
            linkEndDate,
        } );
        res.send( html );
    } catch ( error ) {
        console.error( error );
        res.sendStatus( 500 );
    }
}

async function getSummary( req, res, templateFile ) {
    try {
        const { startDate, endDate } = req.query;
        const [ formStartDate, formEndDate, linkStartDate, linkEndDate ] = [
            dateFunctions.formStartDate( dayjs, startDate ),
            dateFunctions.formEndDate( dayjs, endDate ),
            dateFunctions.linkStartDate( dayjs, startDate ),
            dateFunctions.linkEndDate( dayjs, endDate ),
        ];
        const [ summary, top10DJs ] = await Promise.all( [
            databaseFunctions.roomSummaryResults( dateFunctions.dbStartDate( dayjs, startDate ), dateFunctions.dbEndDate( dayjs, endDate ) ),
            databaseFunctions.top10DJResults( dateFunctions.dbStartDate( dayjs, startDate ), dateFunctions.dbEndDate( dayjs, endDate ) ),
        ] );
        const html = pug.renderFile( `./templates/${ templateFile }.pug`, {
            summary,
            top10DJs,
            formStartDate,
            formEndDate,
            linkStartDate,
            linkEndDate,
        } );
        res.send( html );
    } catch ( error ) {
        console.error( error );
        res.sendStatus( 500 );
    }
}

app.get( '/fulltop10', async ( req, res ) => {
    await getTop10( req, res, "fullTop10Results", "fullTop10" );
} );

app.get( '/likesTop10', async ( req, res ) => {
    await getTop10( req, res, "top10ByLikesResults", "likesTop10" );
} );

app.get( '/mostplayedtracks', async ( req, res ) => {
    await getTop10( req, res, "mostPlayedTracksResults", "mostplayedtracks" );
} );

app.get( '/mostplayedartists', async ( req, res ) => {
    await getTop10( req, res, "mostPlayedArtistsResults", "mostplayedartists" );
} );

app.get( '/summary', async ( req, res ) => {
    await getSummary( req, res, "summary" );
} );


// ########################################################################
// Bot Playlist Editor
// ########################################################################

app.get( '/', function ( req, res ) {
    bot.playlistAll( ( playlistData ) => {
        let html = pug.renderFile( './templates/index.pug', { playlistData: playlistData.list } );
        res.send( html );
    } );
} );

app.post( '/songstatus', async function ( req, res ) {
    let videoStatus = await videoFunctions.checkVideoStatus( req.body.videoIDs )
    res.send( videoStatus );
} );

app.post( '/movesong', ( req, res ) => {
    bot.playlistReorder( Number.parseInt( req.body.indexFrom ), Number.parseInt( req.body.indexTo ) );
    res.json( `refresh` );
} );

app.get( '/findsong', ( req, res ) => {
    bot.searchSong( req.query.term, ( data ) => {
        let html = pug.renderFile( './templates/search.pug', { playlistData: data.docs } );
        res.send( html );
    } );
} );

app.get( '/addsong', ( req, res ) => {
    bot.playlistAdd( req.query.songid );
    res.json( `refresh` );
} );

app.get( '/deletesong', ( req, res ) => {
    bot.playlistRemove( Number.parseInt( req.query.songindex ) );
    res.json( `refresh` );
} );

// ########################################################################
// General functions
// ########################################################################

app.get( '/instructions', ( req, res ) => {
    let html = pug.renderFile( './templates/instructions.pug' );
    res.send( html );

} );

app.get( '/signup', ( req, res ) => {
    let html = pug.renderFile( './templates/signup.pug' );
    res.send( html );

} );

app.post( '/signup', async ( req, res, next ) => {
    console.group( "signup" );
    const { email, username, password, confirmPassword } = req.body;
    console.log( "email:" + email );
    console.log( "username:" + username );
    const userID = userFunctions.getUserIDFromUsername( username );

    // Check if the passwords match
    if ( password !== confirmPassword ) {
        return res.status( 400 ).send( 'Passwords do not match' );
    }

    // Check if the user exists
    const user = userFunctions.userExists( userID );
    if ( !user ) {
        return res.status( 400 ).send( 'User does not exist' );
    }

    userFunctions.verifyUsersEmail( userID, email, databaseFunctions )
        .then( verify => {
            if ( !verify ) {
                return res.status( 400 ).send( 'User\'s email does not match' );
            }
            bcrypt.hash( password, 10 )
                .then( passwordHash => {
                    setPassword( { req, res, next, username, passwordHash } )
                        .then( () => {
                            // Redirect after successful password setting
                            res.redirect( '/listunverified' );
                        } )
                        .catch( error => {
                            console.error( 'Error setting password:', error );
                            return res.status( 500 ).send( 'Internal server error' );
                        } );
                } )
                .catch( error => {
                    console.error( 'Error hashing password:', error );
                    return res.status( 500 ).send( 'Internal server error' );
                } );
        } )
        .catch( error => {
            console.error( 'Error verifying user email:', error );
            return res.status( 500 ).send( 'Internal server error' );
        } );
    console.groupEnd();
} );

async function authentication( req, res, next ) {
    const authHeader = req.headers.authorization;

    if ( !authHeader ) {
        const err = new Error( 'You are not authenticated!' );
        res.setHeader( 'WWW-Authenticate', 'Basic' );
        res.status( 401 ).send( err );
        return;
    }

    const auth = Buffer.from( authHeader.split( ' ' )[ 1 ], 'base64' ).toString().split( ':' );
    const username = auth[ 0 ];
    const password = auth[ 1 ];

    try {
        // Retrieve hashed password from the database based on the username
        const hashedPassword = await databaseFunctions.retrieveHashedPassword( username );

        if ( !hashedPassword ) {
            // If the user doesn't have a password set, redirect to the signup page
            if ( req.originalUrl !== '/signup' ) {
                return res.redirect( '/signup' );
            }
            return next();
        }

        // Compare hashed password from the database with the provided password
        const match = await bcrypt.compare( password, hashedPassword );

        if ( match ) {
            // If the passwords match, the user is authenticated
            req.username = username;
            return next();
        } else {
            const err = new Error( 'Incorrect username or password' );
            res.setHeader( 'WWW-Authenticate', 'Basic' );
            err.status = 401;
            return next( err );
        }
    } catch ( error ) {
        console.error( 'Error during authentication:', error );
        const err = new Error( 'Internal server error' );
        err.status = 500;
        return next( err );
    }
}

async function setPassword( { req, res, next, username, passwordHash } ) {
    try {
        const userID = userFunctions.getUserIDFromUsername( username );
        await userFunctions.storeUserData( userID, "password_hash", passwordHash, databaseFunctions );

        // Proceed to the next middleware or route
        return next();
    } catch ( error ) {
        console.error( 'Error setting password:', error );
        throw new Error( 'Internal server error' );
    }
}

app.listen( ( 8585 ), () => {
    console.log( "Server is Running" );
} )