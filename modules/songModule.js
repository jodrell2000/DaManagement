let roomDefaults = require('../defaultSettings/roomDefaults.js');

const songFunctions = (bot) => {
    return {
        song: null, // info for the currently playing song, so default to null
        album: null, // info for the currently playing song, so default to null
        genre: null, // info for the currently playing song, so default to null
        artist: null, // info for the currently playing song, so default to null
        getSong: null, // info for the currently playing song, so default to null
        dj: null, // info for the currently playing song, so default to null

        snagSong: false, //if true causes the bot to add every song that plays to its queue

        upVotes: 0,
        downVotes: 0,
        whoSnagged: 0,
        checkVotes: [],
        voteCountSkip: 0,
        votesLeft: roomDefaults.HowManyVotesToSkip,
        ALLREADYCALLED: false, //resets votesnagging so that it can be called again
        curSongWatchdog: null, //used to hold the timer for stuck songs
        takedownTimer: null, //used to hold the timer that fires after curSongWatchDog which represents the time a person with a stuck song has left to skip their song

        getSongTags: function (current_song) {
            this.song = current_song.metadata.song;
            this.album = current_song.metadata.album;
            this.genre = current_song.metadata.genre;
            this.artist = current_song.metadata.artist;
            this.getSong = current_song._id;
            this.dj = current_song.djname;
        },

        recordUpVotes: function (data) {
            this.upVotes = data.room.metadata.upvotes;
        },

        resetUpVotes: function () {
            this.upVotes = 0;
        },

        recordDownVotes: function (data) {
            this.downVotes = data.room.metadata.downvotes;
        },

        resetDownVotes: function () {
            this.downVotes = 0;
        },

        voteSnagged: function () {
            this.whoSnagged += 1;
        },

        resetWhoSnagged: function () {
            this.whoSnagged = 0;
        },

        resetCheckVotes: function () {
            this.checkVotes = [];
        },

        resetVoteCountSkip: function () {
            this.voteCountSkip = 0;
        },

        addToVoteCountSkip: function () {
            this.voteCountSkip += 1;
        },

        resetVotesLeft: function (votesToSkip) {
            this.votesLeft = votesToSkip;
        },

        resetVoteSnagging: function () {
            this.ALLREADYCALLED = false; //resets votesnagging so that it can be called again
        },

        voteSnagged: function () {
            this.ALLREADYCALLED = true; //this makes it so that it can only be called once per song
        },

        clearWatchDogTimer() {
            // If watch dog has been previously set,
            // clear since we've made it to the next song
            if (this.curSongWatchdog !== null)
            {
                clearTimeout(this.curSongWatchdog);
                this.curSongWatchdog = null;
            }
        },

        clearTakedownTimer(userFunctions, roomFunctions) {
            // If takedown Timer has been set, clear since we've made it to the next song
            if (this.takedownTimer !== null) {
                clearTimeout(this.takedownTimer);
                this.takedownTimer = null;

                if (typeof userFunctions.theUsersList[userFunctions.theUsersList.indexOf(roomFunctions.lastdj) + 1] !== 'undefined') {
                    bot.speak("@" + userFunctions.theUsersList[userFunctions.theUsersList.indexOf(roomFunctions.lastdj) + 1] + ", Thanks buddy ;-)");
                } else {
                    bot.speak('Thanks buddy ;-)');
                }
            }
        },

        startSongWatchdog(data, userFunctions, roomFunctions) {
            const length = data.room.metadata.current_song.metadata.length;
            // Set a new watchdog timer for the current song.
            this.curSongWatchdog = setTimeout(function () {
                this.curSongWatchdog = null;

                if (typeof userFunctions.theUsersList[userFunctions.theUsersList.indexOf(roomFunctions.lastdj) + 1] !== 'undefined') {
                    bot.speak("@" + userFunctions.theUsersList[userFunctions.theUsersList.indexOf(roomFunctions.lastdj) + 1] + ", you have 20 seconds to skip your stuck song before you are removed");
                } else {
                    bot.speak("current dj, you have 20 seconds to skip your stuck song before you are removed");
                }

                //START THE 20 SEC TIMER
                this.takedownTimer = setTimeout(function () {
                    this.takedownTimer = null;
                    bot.remDj(roomFunctions.lastdj); // Remove Saved DJ from last newsong call
                }, 20 * 1000); // Current DJ has 20 seconds to skip before they are removed
            }, (length + 10) * 1000); //Timer expires 10 seconds after the end of the song, if not cleared by a newsong
        }
    }
}

module.exports = songFunctions;
