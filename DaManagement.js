/** The Management, Turntable.fm bot
    Adam Reynolds 2021-2022
    version 0.1 (forked from chillybot)
    version 0.2 (forked from Mr. Roboto by Jake Smith)
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

const express = require( 'express' )
const app = express();
const pug = require( 'pug' );

// client authentication
app.use( authentication )

app.use( express.json() );

app.use( `/scripts`, express.static( './scripts' ) );
app.use( `/modules`, express.static( './node_modules' ) );
app.use( `/styles`, express.static( './styles' ) );
app.use( express.json() );
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
    if ( userFunctions.removeIdleDJs() === true ) {
        userFunctions.idledOutDJCheck( roomDefaults, chatFunctions );
    }
}, 10 * 1000 );

// check if the users are idle every minute
setInterval( function () { userFunctions.roomIdleCheck( roomDefaults, chatFunctions ) }, 60 * 1000 )

// every 5 seconds, check if the there's an empty DJ slot, and prompt the next in the queue to join the decks, remove them if they don't
setInterval( function ( data ) {
    if ( roomDefaults.queueActive !== true && userFunctions.howManyDJs() === roomDefaults.maxDJs ) {
        roomDefaults.queueActive = true;
        chatFunctions.botSpeak( "The Queue is now active", null, true, null );
    }

    if ( roomDefaults.queueActive === true && ( userFunctions.refreshDJCount() + userFunctions.howManyDJs() ) < roomDefaults.maxDJs ) {
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
    const userID = data.user[ 0 ].userid;
    const username = data.user[ 0 ].name;

    userFunctions.userJoinsRoom( userID, username );

    const bootThisUser = userFunctions.bootNewUserCheck[ 0 ];
    const bootMessage = userFunctions.bootNewUserCheck[ 1 ];

    if ( bootThisUser ) {
        userFunctions.bootThisUser( userID, bootMessage );
    } else {
        chatFunctions.userGreeting( data, userID, username, roomFunctions, userFunctions )
    }

    userFunctions.askUserToSetRegion( userID, chatFunctions );
    userFunctions.updateRegionAlertsFromUsers( data, videoFunctions, chatFunctions );
} );

//starts up when a user leaves the room
bot.on( 'deregistered', function ( data ) {
    let theUserID = data.user[ 0 ].userid;
    userFunctions.deregisterUser( theUserID );
    userFunctions.updateRegionAlertsFromUsers( data, videoFunctions, chatFunctions );
} )

//starts up when bot first enters the room
bot.on( 'roomChanged', function ( data ) {
    try {
        userFunctions.resetUsersList();

        // load in and user data on disk first
        userFunctions.readAllUserDataFromDisk();

        console.log( "================= Finished reading ===============" );
        //reset arrays in case this was triggered by the bot restarting
        userFunctions.resetAllWarnMe( data );

        //get & set information
        roomFunctions.setRoomDefaults( data );

        // build in the users in the room, skip any already loaded from disk
        userFunctions.rebuildUserList( data );

        userFunctions.resetModerators( data );
        userFunctions.startAllUserTimers();
        userFunctions.resetDJs( data );

        // set user as current DJ
        userFunctions.setCurrentDJ( data.room.metadata.current_dj );

        // ask users for their regions if we don't have them
        userFunctions.checkUsersHaveRegions( data, chatFunctions );
        userFunctions.updateRegionAlertsFromUsers( data, videoFunctions, chatFunctions );
    }
    catch ( err ) {
        console.log( 'error', 'unable to join the room the room due to err: ' + err.toString() );
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
    //console.info( "data.room.metadata.current_song:" + JSON.stringify( data.room.metadata.current_song ) );
    songFunctions.getSongTags( data.room.metadata.current_song )

    //set information
    roomFunctions.setDJCount( data.room.metadata.djs.length ); //the number of dj's on stage
    roomDefaults.detail = data.room.description; //set room description again in case it was changed

    // set user as current DJ
    let djID = data.room.metadata.current_dj;
    userFunctions.setCurrentDJ( djID );

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
    botFunctions.checkAutoDJing( userFunctions );

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

        if ( checkIfAdmin === -1 ) {
            //if matching is enabled for both songs and artists
            if ( musicDefaults.matchArtists && musicDefaults.matchSongs ) {
                if ( songFunctions.artist().match( roomFunctions.bannedArtistsMatcher() ) || songFunctions.song().match( roomFunctions.bannedArtistsMatcher() ) ) {
                    userFunctions.removeDJ( djCheck, 'DJ has played a banned song or artist' );

                    if ( typeof userFunctions.getUsername( djCheck ) !== 'undefined' ) {
                        bot.speak( '@' + userFunctions.getUsername( djCheck ) + ' you have played a banned track or artist.' );
                    }
                    else {
                        bot.speak( 'current dj, you have played a banned track or artist.' );
                    }
                }
            }
            else if ( musicDefaults.matchArtists ) //if just artist matching is enabled
            {
                if ( songFunctions.artist().match( roomFunctions.bannedArtistsMatcher() ) ) {
                    userFunctions.removeDJ( djCheck, 'DJ has played a banned song or artist' );

                    if ( typeof userFunctions.getUsername( djCheck ) !== 'undefined' ) {
                        bot.speak( '@' + userFunctions.getUsername( djCheck ) + ' you have played a banned artist.' );
                    }
                    else {
                        bot.speak( 'current dj, you have played a banned artist.' );
                    }
                }
            }
            else if ( musicDefaults.matchSongs ) //if just song matching is enabled
            {
                if ( songFunctions.song().match( roomFunctions.bannedArtistsMatcher() ) ) {
                    userFunctions.removeDJ( djCheck, 'DJ has played a banned song or artist' );

                    if ( typeof userFunctions.getUsername( djCheck ) !== 'undefined' ) {
                        bot.speak( '@' + userFunctions.getUsername( djCheck ) + ' you have played a banned track.' );
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
        console.warn( botFunctions.getFormattedDate() + ' The DJ counts don\'t match...resetting them. Count from data is ' + data.room.metadata.djs.length + ', count from Bot is ' + userFunctions.howManyDJs() );
        userFunctions.resetDJs( data ); //reset current djs array
    }
    console.groupEnd();
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

    for ( let userLoop = 0; userLoop < foundUsernames.length; userLoop++ ) {
        let thisAFKUserID = userFunctions.getUserIDFromUsername( foundUsernames[ userLoop ] );
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
    songFunctions.incrementSnagCount();
    userFunctions.updateUserLastSnagged( data.userid ); //update the afk position of people who add a song to their queue
} )

//this activates when a user joins the stage.
bot.on( 'add_dj', function ( data ) {
    let OKToDJ;
    let theMessage;
    const theUserID = data.user[ 0 ].userid;
    const totalPlayCount = userFunctions.getDJTotalPlayCount( theUserID );

    [ OKToDJ, theMessage ] = userFunctions.checkOKToDJ( theUserID, roomFunctions );

    if ( !OKToDJ ) {
        userFunctions.removeDJ( theUserID, 'User is not allowed to DJ so was removed' );
        userFunctions.incrementSpamCounter( theUserID );
        chatFunctions.botSpeak( theMessage, data );
    }

    //sets dj's current songcount to zero when they enter the stage.
    //unless they used the refresh command, in which case its set to
    //what it was before they left the room
    userFunctions.setDJCurrentPlayCount( theUserID, userFunctions.getUsersRefreshCurrentPlayCount[ theUserID ] );

    //keep the total playcount as it is, unless they've refreshed
    if ( totalPlayCount !== undefined ) {
        userFunctions.setDJTotalPlayCount( theUserID, totalPlayCount );
    } else {
        userFunctions.setDJTotalPlayCount( theUserID, userFunctions.getUsersRefreshTotalPlayCount[ theUserID ] );
    }
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
    botFunctions.checkAutoDJing( userFunctions );
} );

//checks when a dj leaves the stage
bot.on( 'rem_dj', function ( data ) {
    let theUserID = data.user[ 0 ].userid;
    //removes user from the dj list when they leave the stage
    userFunctions.resetDJFlags( theUserID );

    //gives them one chance to get off stage, then after that they're play limit is treated as normal
    if ( typeof userFunctions.getUsersRefreshCurrentPlayCount[ theUserID ] == 'number' && userFunctions.isUserInRefreshList( theUserID ) === false ) {
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
    botFunctions.checkAutoDJing( userFunctions );

    //takes a user off the escort list if they leave the stage.
    userFunctions.removeEscortMeFromUser( theUserID );
} );

bot.on( 'update_user', function ( data ) {
    userFunctions.updateUser( data );
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

function authentication ( req, res, next ) {
    let authheader = req.headers.authorization;
    // console.log(req.headers);

    if ( !authheader ) {
        let err = new Error( 'You are not authenticated!' );
        res.setHeader( 'WWW-Authenticate', 'Basic' );
        err.status = 401;
        return next( err )
    }

    let auth = new Buffer.from( authheader.split( ' ' )[ 1 ],
        'base64' ).toString().split( ':' );
    let user = auth[ 0 ];
    let pass = auth[ 1 ];

    if ( user === process.env.PLAYLIST_USERNAME && pass === process.env.PLAYLIST_PASSWORD ) {

        // If Authorized user
        next();
    } else {
        let err = new Error( 'You are not authenticated to access the playlist controls!' );
        res.setHeader( 'WWW-Authenticate', 'Basic' );
        err.status = 401;
        return next( err );
    }

}

app.listen( ( 8585 ), () => {
    console.log( "Server is Running " );
} )