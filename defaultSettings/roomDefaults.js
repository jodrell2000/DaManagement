module.exports = {
    // chat and messages stuff
    MESSAGE: true, //room message(on by default), the bot says your room info in intervals of whatever the howOftenToRepeatMessage variable is set to in minutes
    howOftenToRepeatMessage: 15, //how often (in minutes) to repeat the room message (only works when MESSAGE = true;)
    defaultMessage: true,
    /*  This corresponds to the MESSAGE variable directly above, if true it will give you the default repeat message along with your room info, if false it will only say your room info.
        (only works when MESSAGE = true) (this feature is on by default)
    */

    SONGSTATS: true, //song stats after each song(on by default)

    repeatMessageThroughPm: false,
    /*choose whether the repeating room message(the one corresponding to MESSAGE up above) will be through the chatbox or the pm,
                                          (false = through the chatbox, true = through the pm) (MESSAGE must equal true for this to work) (this feature is off by default)
                                        */

    greetUsers: true, //room greeting when someone joins the room(on by default)
    greetInPublic: true, //choose whether greeting message is through the pm or the chatbox(false = chatbox, true = pm), (only works when greeting message is turned on) (off by default)

    //this is for the event messages
    //This cycles through all the different messages that you enter into this array. one message per time cycle, once it gets to the end of your messages it starts over again
    eventMessageRepeatTime: 15, //how long in minutes between event messages(must have EVENTMESSAGE = true to see any messages)
    eventMessageThroughPm: false, //determines whether event message will be pmmed or said in chat, false = chatbox, true = pm box
    EVENTMESSAGE: false, //this disables / enables event message on startup - true = enabled, false = disabled
    //the messages in here are examples, it is recommended that you clear them before using
    eventMessages: [ 'hello there', //enter your different event messages here, any messages that you want repeated

        'message 2' +
        ' this is an example message, multiple lines should be separate strings added together',

        'this is a test'
    ],

    // other stuff
    refreshingEnabled: true, //whether or not /refresh can be used or not (true = yes, false = no)
    amountOfTimeToRefresh: 120, //the amount of seconds someone has to use the refresh command(if enabled)

    HowManyVotesToSkip: 2, //how many votes for a song to get skipped(default value, only works if voteSkip = true)


    // declarations, DO NOT SET
    ttRoomName: null, //the url extension of the room name, example "straight_chillin16" would be the format

    roomName: null, //the name of the room, example "straight chillin" would be the format for the straight chillin room...

    blackList: [], //holds the userid of everyone who is in the command based banned from the room list

    kickTTSTAT: false, //kicks the ttstats bot when it tries to join the room(off by default)

    errorMessage: null, //the error message you get when trying to connect to the room

    spamLimit: 3, //number of times a user can spam being kicked off the stage within 10 secs

    detail: null, //the discription given in the "room" tab of the room that the bot is in

    roomIdle: false, //audience afk limit(off by default)
    roomIdleLimit: 60, // idle (minutes) limit for DJs

    removeIdleDJs: true, // are the DJ idle checks active, this is for the dj's on stage
    djIdleLimitThresholds: [ 20, 15, 19 ], /* Total idle allowed, first warnign time then second warning time for DJs idling out
                                        [ 20, 15, 19 ] would be 20 minutes idle allowed with the first warning at 15 minutes and the second at 19 minutes */
    warnIdlePublic: true, //choose whether idle warnings(for dj's on stage) will be given through the pm or the chatbox (false = chatbox, true = pm message)
    voteMeansActive: true, // does voting/bopping count as user being active (too many user autoBop)
    speechMeansActive: true, // does chatting count as user being active
    snagMeansActive: true, // does snagging a track count as user being active
    djingMeansActive: true, // does starting to DJ mean someone is active...disable if you think people are scripting a lot

    queueActive: false, //queue(on by default)
    queueWaitTime: 60, /*how many second's does a dj have to get on stage when it's their turn to dj after waiting in the queue.
						 The value must be entered in seconds in order to display the correct message, i.e 3 mins = 180 seconds.
						 Note that people are not removed from the queue when they leave the room so a lower number is preferable in high pop rooms to avoid backup.
						 (only work when queue = true)
						*/

    vipsOnly: false, // is true ONLY users on the VIP list will be able to play, otherwise a space will be reserved for everyone on the list but others will be allowed to play

}
