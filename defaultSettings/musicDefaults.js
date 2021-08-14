//these variables are for enabling / disabling the banned artist / song matching
//they correspond to the bannedArtist array below which is where you put both artists and songs regardless or which you are attempting to match for
//if they are both set to false no attempt to match will occur

module.exports = {
    matchArtists: true, //set this true to enable banned artist matching
    matchSongs: true, //set this true to enable banned song matching

    //banned artist / song list
    bannedArtists: ['dj tiesto', 'skrillex', 'lil wayne', 't-pain', 'tpain', 'katy perry', 'eminem', 'porter robinson', 'gorgoroth', 'justin bieber', 'deadmau5', 'nosia', 'infected mushroom', 'spongebob squarepants', 'usher'],

    voteSkip: false, //voteskipping(off by default)

    songLengthLimit: 10,// holds the current song limit in minutes
    songLengthLimitOn: true, //song length limit (on by default)
    songLengthLimitDefault: 10.0, //set song limit default in minutes

    DJPlaysLimited: false, //song play limit, this is for the playLimit variable up above(off by default)
    DJsPlayLimit: 3, //set the playlimit here (default 4 songs)

    alertIfRegionBlocked: [ 'GB', 'US' ], // default list of regions that, if the video is blocked, will alert the DJ
}
