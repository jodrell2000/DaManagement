let roomDefaults = require( '../defaultSettings/roomDefaults.js' );
let botDefaults = require( '../defaultSettings/botDefaults.js' );
let musicDefaults = require( '../defaultSettings/musicDefaults.js' );

let song = null; // info for the currently playing song, so default to null
let previousSong = null; // info for the currently playing song, so default to null
let album = null; // info for the currently playing song, so default to null
let genre = null; // info for the currently playing song, so default to null
let artist = null; // info for the currently playing song, so default to null
let previousArtist = null; // info for the currently playing song, so default to null
let getSong = null; // info for the currently playing song, so default to null
let dj = null; // info for the currently playing song, so default to null
let ytid = null; // youTube ID of the video, used to check the regions

let snagSong = false; //if true causes the bot to add every song that plays to its queue

let upVotes = 0;
let downVotes = 0;
let snagCount = 0;
let voteCountSkip = 0;
let previousSongStats = []; // grab the ending song votes before they're reset
let ALLREADYCALLED = false; //resets votesnagging so that it can be called again
let curSongWatchdog = null; //used to hold the timer for stuck songs
let takedownTimer = null; //used to hold the timer that fires after curSongWatchDog which represents the time a person with a stuck song has left to skip their song
let votesLeft = roomDefaults.HowManyVotesToSkip;

const songFunctions = ( bot ) => {
    return {
        song: () => song,
        album: () => album,
        genre: () => genre,
        artist: () => artist,
        getSong: () => getSong,
        dj: () => dj,
        ytid: () => ytid,

        snagSong: () => snagSong,
        upVotes: () => upVotes,
        downVotes: () => downVotes,
        voteCountSkip: () => voteCountSkip,
        ALLREADYCALLED: () => ALLREADYCALLED,

        votesLeft: () => votesLeft,
        setVotesLeft: function ( value ) { votesLeft = value; },
        decrementVotesLeft: function () { --votesLeft; },

        // ========================================================
        // Playlist Functions
        // ========================================================

        loadPlaylist: function () {
            bot.playlistAll( function ( callback ) {
                botDefaults.botPlaylist = callback.list;
            } );
        },

        randomisePlaylist: function () {
            let ez = 0;
            bot.speak( "Reorder initiated." );
            let reorder = setInterval( function () {
                if ( ez <= botDefaults.botPlaylist.length ) {
                    let nextId = Math.ceil( Math.random() * botDefaults.botPlaylist.length );
                    bot.playlistReorder( ez, nextId );
                    console.log( "Song " + ez + " changed." );
                    ez++;
                } else {
                    clearInterval( reorder );
                    console.log( "Reorder Ended" );
                    bot.speak( "Reorder completed." );
                }
            }, 1000 );
        },

        // ========================================================

        // ========================================================
        // Length Functions
        // ========================================================

        switchLengthLimit: function ( data, songLength, chatFunctions ) {
            let theMessage = "";
            const theSongLength = songLength[ 0 ];

            if ( theSongLength === undefined ) {
                this.swapSongLengthLimit( data, chatFunctions );
            } else if ( isNaN( theSongLength ) ) {
                theMessage = "The max song length must be a number"
                chatFunctions.botSpeak( theMessage, data )
            } else {
                musicDefaults.songLengthLimitOn = true;
                musicDefaults.songLengthLimit = theSongLength;

                this.announceSongLengthLimit( data, chatFunctions );
            }
        },

        swapSongLengthLimit: function ( data, chatFunctions ) {
            if ( musicDefaults.songLengthLimitOn === true ) {
                musicDefaults.songLengthLimitOn = false;
            } else {
                musicDefaults.songLengthLimitOn = true;
                if ( musicDefaults.songLengthLimit === undefined ) {
                    musicDefaults.songLengthLimit = 10;
                }
            }

            this.announceSongLengthLimit( data, chatFunctions );
        },

        announceSongLengthLimit: function ( data, chatFunctions ) {
            let theMessage = "";

            theMessage = "The song length limit is now";
            if ( musicDefaults.songLengthLimitOn ) {
                theMessage += " active, and the length limit is " + musicDefaults.songLengthLimit + " minutes";
            } else {
                theMessage += " inactive";
            }
            chatFunctions.botSpeak( theMessage, data, true )
        },


        // ========================================================


        // ========================================================
        // Snagging Functions
        // ========================================================


        snagCount: () => snagCount,

        incrementSnagCount: function () {
            snagCount += 1;
        },

        resetSnagCount: function () {
            snagCount = 0;
        },

        // ========================================================

        // ========================================================
        // Song Stats Functions
        // ========================================================

        previousUpVotes: () => previousSongStats[ 'upvotes' ],
        previousDownVotes: () => previousSongStats[ 'downvotes' ],
        previousSnags: () => previousSongStats[ 'snags' ],
        previousArtist: () => previousArtist,
        previousTrack: () => previousSong,

        grabSongStats: function () {
            previousSongStats[ 'upvotes' ] = upVotes;
            previousSongStats[ 'downvotes' ] = downVotes;
            previousSongStats[ 'snags' ] = this.snagCount();
        },

        // ========================================================

        getSongTags: function ( current_song ) {
            previousArtist = artist;
            previousSong = song;

            song = current_song.metadata.song;
            album = current_song.metadata.album;
            genre = current_song.metadata.genre;
            artist = current_song.metadata.artist;
            getSong = current_song._id;
            dj = current_song.djname;
            ytid = current_song.metadata.ytid;
        },

        recordUpVotes: function ( data ) {
            upVotes = data.room.metadata.upvotes;
        },

        resetUpVotes: function () {
            upVotes = 0;
        },

        recordDownVotes: function ( data ) {
            downVotes = data.room.metadata.downvotes;
        },

        resetDownVotes: function () {
            downVotes = 0;
        },

        resetVoteCountSkip: function () {
            voteCountSkip = 0;
        },

        addToVoteCountSkip: function () {
            voteCountSkip += 1;
        },

        resetVotesLeft: function ( votesToSkip ) {
            votesLeft = votesToSkip;
        },

        resetVoteSnagging: function () {
            ALLREADYCALLED = false; //resets votesnagging so that it can be called again
        },

        songSnagged: function () {
            ALLREADYCALLED = true; //this makes it so that it can only be called once per song
        },

        clearWatchDogTimer () {
            // If watch dog has been previously set,
            // clear since we've made it to the next song
            if ( curSongWatchdog !== null ) {
                clearTimeout( curSongWatchdog );
                curSongWatchdog = null;
            }
        },

        clearTakedownTimer ( userFunctions, roomFunctions ) {
            // If takedown Timer has been set, clear since we've made it to the next song
            if ( takedownTimer !== null && roomFunctions.lastdj() !== undefined ) {
                clearTimeout( takedownTimer );
                takedownTimer = null;

                if ( typeof userFunctions.theUsersList()[ userFunctions.theUsersList().indexOf( roomFunctions.lastdj() ) + 1 ] !== 'undefined' ) {
                    bot.speak( "@" + userFunctions.theUsersList()[ userFunctions.theUsersList().indexOf( roomFunctions.lastdj() ) + 1 ] + ", Thanks buddy ;-)" );
                } else {
                    bot.speak( 'Thanks buddy ;-)' );
                }
            }
        },

        startSongWatchdog ( data, userFunctions, roomFunctions ) {
            console.group( "startSongWatchdog" );
            console.log( "here:" );
            const length = data.room.metadata.current_song.metadata.length;
            const warnedDJ = userFunctions.getCurrentDJID();
            const nextDJName = userFunctions.getUsername( userFunctions.getNextDJ() );
            console.log( "length:" + length );
            console.log( "warnedDJ:" + warnedDJ );
            console.log( "nextDJName:" + nextDJName );

            bot.speak( "@" + userFunctions.getUsername( warnedDJ ) + ", you have 30 seconds to skip your stuck song before you are removed" );
            if ( userFunctions.getUsername( warnedDJ ) !== nextDJName ) {
                bot.speak( `@${ nextDJName }, make sure you've got something ready ;-)` );
            }

            //START THE 20 TIMER
            takedownTimer = setTimeout( function () {
                takedownTimer = null;
                console.log( "lastDJ:" + warnedDJ );
                console.log( "currentDJ:" + roomFunctions.lastdj() );
                if ( warnedDJ === userFunctions.getCurrentDJID() ) {
                    userFunctions.removeDJ( warnedDJ, 'DJ removed because of a stuck song issue' ); // Remove Saved DJ from last newsong call
                }
            }, 30 * 1000 ); // Current DJ has 30 seconds to skip before they are removed
            console.groupEnd();
        },

        // ========================================================


        // ========================================================
        // Song Info Functions
        // ========================================================

        songInfoCommand ( data, databaseFunctions, mlFunctions, chatFunctions ) {
            let verifiedSong;
            let verifiedArtist;

            const getVerifiedTracks = databaseFunctions.getVerifiedTracksFromName( song )
                .then( ( array ) => {
                    verifiedSong = array[ 0 ].displayName;
                } );

            const getVerifiedArtists = databaseFunctions.getVerifiedArtistsFromName( artist )
                .then( ( array ) => {
                    verifiedArtist = array[ 0 ].displayName;
                } );

            Promise.all( [ getVerifiedTracks, getVerifiedArtists ] )
                .then( () => {
                    if ( verifiedSong && verifiedArtist ) {
                        mlFunctions.searchDiscogs( verifiedSong, verifiedArtist )
                            .then( ( returned ) => {
                                chatFunctions.botSpeak( "This is " + verifiedSong + " by " + verifiedArtist, data );
                                chatFunctions.botSpeak( returned.thumbnail, data );
                                chatFunctions.botSpeak( "Released in " + returned.releaseCountry + " in " + returned.releaseYear, data );
                                chatFunctions.botSpeak( "More info can be found here: " + returned.discogsUrl, data );

                                //console.log( "tracklist:" + returned.tracklist );
                            } )
                            .catch( () => {
                                chatFunctions.botSpeak( "Sorry, I couldn't find that online: " + verifiedSong + " by " + verifiedArtist, data );
                            } )
                    } else {
                        chatFunctions.botSpeak( "Sorry, I couldn't find that in my Database", data );
                    }
                } )
                .catch( ( error ) => {
                    console.log( "Error:", error );
                } );
        },

        searchSpotifyCommand ( data, databaseFunctions, mlFunctions, chatFunctions ) {
            let verifiedSong;
            let verifiedArtist;

            const getVerifiedTracks = databaseFunctions.getVerifiedTracksFromName( song )
                .then( ( array ) => {
                    verifiedSong = array[ 0 ].displayName;
                } );

            const getVerifiedArtists = databaseFunctions.getVerifiedArtistsFromName( artist )
                .then( ( array ) => {
                    verifiedArtist = array[ 0 ].displayName;
                } );

            Promise.all( [ getVerifiedTracks, getVerifiedArtists ] )
                .then( () => {
                    if ( verifiedSong && verifiedArtist ) {
                        mlFunctions.searchSpotify( verifiedSong, verifiedArtist )
                            .then( ( returned ) => {
                                console.log( "Got this:" + returned );
                                // chatFunctions.botSpeak( "This is " + verifiedSong + " by " + verifiedArtist, data );
                                // chatFunctions.botSpeak( returned.thumbnail, data );
                                // chatFunctions.botSpeak( "Released in " + returned.releaseCountry + " in " + returned.releaseYear, data );
                                // chatFunctions.botSpeak( "More info can be found here: " + returned.discogsUrl, data );

                                //console.log( "tracklist:" + returned.tracklist );
                            } )
                            .catch( () => {
                                chatFunctions.botSpeak( "Sorry, I couldn't find that online: " + verifiedSong + " by " + verifiedArtist, data );
                            } )
                    } else {
                        chatFunctions.botSpeak( "Sorry, I couldn't find that in my Database", data );
                    }
                } )
                .catch( ( error ) => {
                    console.log( "Error:", error );
                } );

        },

        searchMusicBrainzCommand ( data, databaseFunctions, mlFunctions, chatFunctions ) {
            let verifiedSong;
            let verifiedArtist;

            const getVerifiedTracks = databaseFunctions.getVerifiedTracksFromName( song )
                .then( ( array ) => {
                    verifiedSong = array[ 0 ].displayName;
                } );

            const getVerifiedArtists = databaseFunctions.getVerifiedArtistsFromName( artist )
                .then( ( array ) => {
                    verifiedArtist = array[ 0 ].displayName;
                } );

            Promise.all( [ getVerifiedTracks, getVerifiedArtists ] )
                .then( () => {
                    if ( verifiedSong && verifiedArtist ) {
                        mlFunctions.searchMusicBrainz( verifiedSong, verifiedArtist )
                            .then( ( returned ) => {
                                console.log( "Got this:" + returned );
                                // chatFunctions.botSpeak( "This is " + verifiedSong + " by " + verifiedArtist, data );
                                // chatFunctions.botSpeak( returned.thumbnail, data );
                                // chatFunctions.botSpeak( "Released in " + returned.releaseCountry + " in " + returned.releaseYear, data );
                                // chatFunctions.botSpeak( "More info can be found here: " + returned.discogsUrl, data );

                                //console.log( "tracklist:" + returned.tracklist );
                            } )
                            .catch( () => {
                                chatFunctions.botSpeak( "Sorry, I couldn't find that online: " + verifiedSong + " by " + verifiedArtist, data );
                            } )
                    } else {
                        chatFunctions.botSpeak( "Sorry, I couldn't find that in my Database", data );
                    }
                } )
                .catch( ( error ) => {
                    console.log( "Error:", error );
                } );

        },

        // ========================================================
    }
}

module.exports = songFunctions;
