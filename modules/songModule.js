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

    resetUpVotes: function (data) {
        this.upVotes = 0;
    },

    recordDownVotes: function (data) {
        this.downVotes = data.room.metadata.downvotes;
    },

    resetDownVotes: function (data) {
        this.downVotes = 0;
    },

    voteSnagged: function (data) {
        this.whoSnagged += 1;
    },

    resetWhoSnagged: function (data) {
        this.whoSnagged = 0;
    },

}