let roomDefaults = require('../defaultSettings/roomDefaults.js');

module.exports = {
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
    }

}