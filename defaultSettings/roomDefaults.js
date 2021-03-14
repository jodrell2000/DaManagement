module.exports = {
    roomJoinMessage: 'elo', //the message users will see when they join the room, leave it empty for the default message (only works when greet is turned on)
    MESSAGE: true, //room message(on by default), the bot says your room info in intervals of whatever the howOftenToRepeatMessage variable is set to in minutes
    howOftenToRepeatMessage: 15, //how often (in minutes) to repeat the room message (only works when MESSAGE = true;)
    defaultMessage: true,
    /*  This corresponds to the MESSAGE variable directly above, if true it will give you the default repeat message along with your room info, if false it will only say your room info.
        (only works when MESSAGE = true) (this feature is on by default)
    */

    playLimit: 3, //set the playlimit here (default 4 songs)
    songLengthLimit: 10.0, //set song limit in minutes
    afkLimit: 20, //set the afk limit in minutes here
    roomafkLimit: 30, //set the afk limit for the audience here(in minutes), this feature is off by default

    isRefreshing: true, //whether or not /refresh can be used or not (true = yes, false = no)
    amountOfTimeToRefresh: 30, //the amount of seconds someone has to use the refresh command(if enabled)

    HowManyVotesToSkip: 2, //how many votes for a song to get skipped(default value, only works if voteSkip = true)

    queue: true, //queue(on by default)

    AFK: true, //afk limit(on by default), this is for the dj's on stage

}
