module.exports = {
    // chat and messages stuff
    roomJoinMessage: '', //the message users will see when they join the room, leave it empty for the default message (only works when greet is turned on)
    MESSAGE: true, //room message(on by default), the bot says your room info in intervals of whatever the howOftenToRepeatMessage variable is set to in minutes
    howOftenToRepeatMessage: 15, //how often (in minutes) to repeat the room message (only works when MESSAGE = true;)
    defaultMessage: true,
    /*  This corresponds to the MESSAGE variable directly above, if true it will give you the default repeat message along with your room info, if false it will only say your room info.
        (only works when MESSAGE = true) (this feature is on by default)
    */
    GREET: true, //room greeting when someone joins the room(on by default)

    SONGSTATS: true, //song stats after each song(on by default)


    afkThroughPm: true, //choose whether afk warnings(for dj's on stage) will be given through the pm or the chatbox (false = chatbox, true = pm message)
    greetThroughPm: false, //choose whether greeting message is through the pm or the chatbox(false = chatbox, true = pm), (only works when greeting message is turned on) (off by default)
    repeatMessageThroughPm: false,
    /*choose whether the repeating room message(the one corresponding to MESSAGE up above) will be through the chatbox or the pm,
                                          (false = through the chatbox, true = through the pm) (MESSAGE must equal true for this to work) (this feature is off by default)
                                        */

    //this is for the event messages
    //This cycles through all the different messages that you enter into this array. one message per time cycle, once it gets to the end of your messages it starts over again
    eventMessageRepeatTime: 15, //how long in minutes between event messages(must have EVENTMESSAGE = true to see any messages)
    eventMessageThroughPm: false, //determines whether event message will be pmmed or said in chat, false = chatbox, true = pm box
    EVENTMESSAGE: false, //this disables / enables event message on startup - true = enabled, false = disabled
    //the messages in here are examples, it is recommended that you clear them before using
    eventMessages: ['hello there', //enter your different event messages here, any messages that you want repeated

        'message 2' +
        ' this is an example message, multiple lines should be separate strings added together',

        'this is a test'
    ],

    // other stuff
    playLimit: 3, //set the playlimit here (default 4 songs)
    songLengthLimit: 10.0, //set song limit in minutes

    isRefreshing: true, //whether or not /refresh can be used or not (true = yes, false = no)
    amountOfTimeToRefresh: 30, //the amount of seconds someone has to use the refresh command(if enabled)

    HowManyVotesToSkip: 2, //how many votes for a song to get skipped(default value, only works if voteSkip = true)

    queue: true, //queue(on by default)

    AFK: true, //afk limit(on by default), this is for the dj's on stage

    kickTTSTAT: false, //kicks the ttstats bot when it tries to join the room(off by default)

    // declarations, DO NOT SET
    roomName: null, //the name of the room, example "straight chillin" would be the format for the straight chillin room...
    ttRoomName: null, //the url extension of the room name, example "straight_chillin16" would be the format
    THEME: false, //has a current theme been set? true or false. handled by commands
    thisHoldsThePlaylist: null, //holds a copy of the playlist

}
