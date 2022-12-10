let roomDefaults = require( '../defaultSettings/roomDefaults.js' );
let botDefaults = require( '../defaultSettings/botDefaults.js' );
let musicDefaults = require( '../defaultSettings/musicDefaults.js' );

let song = null; // info for the currently playing song, so default to null
let album = null; // info for the currently playing song, so default to null
let genre = null; // info for the currently playing song, so default to null
let artist = null; // info for the currently playing song, so default to null
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
        // Playlist Functions
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

        grabSongStats: function () {
            previousSongStats[ 'upvotes' ] = upVotes;
            previousSongStats[ 'downvotes' ] = downVotes;
            previousSongStats[ 'snags' ] = this.snagCount();
        },

        // ========================================================

        getSongTags: function ( current_song ) {
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

        resetCheckVotes: function () {
            checkVotes = [];
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
            const length = data.room.metadata.current_song.metadata.length;
            const lastDJ = roomFunctions.lastdj();

            // Set a new watchdog timer for the current song.
            curSongWatchdog = setTimeout( function () {
                curSongWatchdog = null;

                if ( lastDJ !== undefined ) {
                    if ( typeof userFunctions.theUsersList()[ userFunctions.theUsersList().indexOf( lastDJ ) + 1 ] !== 'undefined' ) {
                        bot.speak( "@" + userFunctions.theUsersList()[ userFunctions.theUsersList().indexOf( lastDJ ) + 1 ] + ", you have 20 seconds to skip your stuck song before you are removed" );
                    } else {
                        bot.speak( "current dj, you have 20 seconds to skip your stuck song before you are removed" );
                    }
                }

                //START THE 20 SEC TIMER
                takedownTimer = setTimeout( function () {
                    takedownTimer = null;
                    userFunctions.removeDJ( lastDJ, 'DJ removed because of a stuck song issue' ); // Remove Saved DJ from last newsong call
                }, 20 * 1000 ); // Current DJ has 20 seconds to skip before they are removed
            }, ( length + 10 ) * 1000 ); //Timer expires 10 seconds after the end of the song, if not cleared by a newsong
        }
    }
}

module.exports = songFunctions;
