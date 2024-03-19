let chatDefaults = require( '../defaultSettings/chatDefaults.js' );
let chatCommandItems = require( '../defaultSettings/chatCommandItems.js' );
const Storage = require( 'node-storage' );
const { dirname } = require( 'path' );

let databaseModule = require( '../modules/databaseModule.js' );
const databaseFunctions = databaseModule();

const generalCommands = {};
const userCommands = {};
const chatCommands = {};
const botCommands = {};
const userQueueCommands = {};
const moderatorQueueCommands = {};
const moderatorWelcomeCommands = {};
const moderatorChatCommands = {};
const moderatorCommands = {};

const aliasDataFileName = process.env.ALIASDATA;
const chatDataFileName = process.env.CHATDATA;

const ignoreCommands = [ '/me ', '/love' ];

const commandFunctions = ( bot ) => {
    // #############################################
    // These commands are confirmed as fully working
    // #############################################

    // #############################################
    // General commands
    // #############################################

    generalCommands.list = ( { data, args, chatFunctions } ) => {
        listCommands( data, args, chatFunctions )
    }
    generalCommands.list.argumentCount = 1;
    generalCommands.list.help = "Lists all available commands";
    generalCommands.list.sampleArguments = [ "[command type]" ]

    generalCommands.help = ( { data, args, chatFunctions } ) => {
        displayHelp( data, args, chatFunctions );
    }
    generalCommands.help.argumentCount = 1;
    generalCommands.help.help = "Display how to use an individual command";
    generalCommands.help.sampleArguments = [ "[command]" ];

    generalCommands.djplays = ( { data, userFunctions, chatFunctions } ) => {
        userFunctions.djPlaysCommand( data, chatFunctions );
    }
    generalCommands.djplays.help = "How many track has each DJ played = current(total if different)";

    generalCommands.escortme = ( { data, userFunctions, chatFunctions, databaseFunctions } ) => {
        userFunctions.enableEscortMe( data, chatFunctions, databaseFunctions );
    }
    generalCommands.escortme.help = "Have yourself removed from the decks after your track finishes playing";

    generalCommands.stopescortme = ( { data, userFunctions, chatFunctions, databaseFunctions } ) => {
        userFunctions.disableEscortMe( data, chatFunctions, databaseFunctions );
    }
    generalCommands.stopescortme.help = "Stop yourself from being removed from the decks after your track finishes playing";

    generalCommands.whatsplaylimit = ( { data, userFunctions, chatFunctions } ) => {
        userFunctions.whatsPlayLimit( data, chatFunctions );
    }
    generalCommands.whatsplaylimit.help = "Is the DJ Play Limit enabled, and if so what it's set to";

    generalCommands.refresh = ( { data, botFunctions, userFunctions, chatFunctions, databaseFunctions } ) => {
        userFunctions.refreshCommand( data, chatFunctions, botFunctions, databaseFunctions );
    }
    generalCommands.refresh.help = "Hold your spot on stage for one minute if you need to refresh your browser";

    generalCommands.regionalerts = ( { data, botFunctions, videoFunctions, chatFunctions } ) => {
        botFunctions.reportRegionCheckStatus( data, videoFunctions, chatFunctions );
    }
    generalCommands.regionalerts.help = "Show the list of regions that DJs are alerted about ";

    generalCommands.roomstatus = ( { data, botFunctions, chatFunctions, userFunctions, videoFunctions } ) => {
        botFunctions.reportRoomStatus( data, chatFunctions, userFunctions, videoFunctions );
    }
    generalCommands.roomstatus.help = "Show the list of regions that DJs are alerted about ";

    generalCommands.dive = ( { data, botFunctions, chatFunctions, userFunctions } ) => {
        botFunctions.stageDiveCommand( data, chatFunctions, userFunctions, chatCommandItems.stageDiveMessages );
    }
    generalCommands.dive.help = "Leave the DJ booth with style...stagedive tho' init!";

    generalCommands.mystats = ( { data, userFunctions, chatFunctions } ) => {
        userFunctions.readSingleUserStatus( data, chatFunctions );
    }
    generalCommands.mystats.help = "What info does the Bot currently hold about you...handy for knowing how much time you've been wasting on here today!";

    generalCommands.theme = ( { data, roomFunctions, chatFunctions } ) => {
        roomFunctions.readTheme( data, chatFunctions );
    }
    generalCommands.theme.help = "Tells you what the current teme is, if there is one";

    generalCommands.myregion = ( { data, args, userFunctions, chatFunctions, videoFunctions, databaseFunctions } ) => {
        userFunctions.myRegionCommand( data, args, chatFunctions, videoFunctions, databaseFunctions );
    }
    generalCommands.myregion.argumentCount = 1;
    generalCommands.myregion.help = "Set the region you're in so that video regions can be checked automatically";
    generalCommands.myregion.sampleArguments = [ "GB" ];

    generalCommands.noregion = ( { data, userFunctions, chatFunctions, videoFunctions, databaseFunctions } ) => {
        userFunctions.storeNoRegion( data, chatFunctions, videoFunctions, databaseFunctions );
    }
    generalCommands.noregion.help = "Your regions will be removed and you won't be asked again to set one";

    generalCommands.deletetrack = ( { data, botFunctions, userFunctions, chatFunctions, songFunctions } ) => {
        botFunctions.deleteCurrentTrackFromBotPlaylist( data, userFunctions, chatFunctions, songFunctions );
    }
    generalCommands.deletetrack.help = "Delete whatever track Robo is currently playing";

    // generalCommands.bbboot = ( { data, userFunctions, chatFunctions, databaseFunctions } ) => { userFunctions.bbBoot( data, chatFunctions, databaseFunctions ); }
    // generalCommands.bbboot.help = "BBBoot @Bukkake. If it's been more than 24hrs since the last boot, BB gets booted. If it's been less, you do! ;-)";

    generalCommands.robocoin = ( { data, userFunctions, chatFunctions } ) => {
        userFunctions.readMyRoboCoin( data, chatFunctions );
    }
    generalCommands.robocoin.help = "How many Robo points do you have?";

    generalCommands.songinfo = ( { songFunctions, data, databaseFunctions, chatFunctions } ) => {
        songFunctions.songInfoCommand( data, databaseFunctions, chatFunctions );
    }
    generalCommands.songinfo.help = "Lookup song info from the DB";

    generalCommands.searchspotify = ( { songFunctions, data, databaseFunctions, mlFunctions, chatFunctions } ) => {
        songFunctions.searchSpotifyCommand( data, databaseFunctions, mlFunctions, chatFunctions );
    }
    generalCommands.searchspotify.help = "Lookup song info from Spotify";

    generalCommands.searchmusicbrainz = ( { songFunctions, data, databaseFunctions, mlFunctions, chatFunctions } ) => {
        songFunctions.searchMusicBrainzCommand( data, databaseFunctions, mlFunctions, chatFunctions );
    }
    generalCommands.searchmusicbrainz.help = "Lookup song info from Music Brainz";

    // #############################################
    // RoboCoin commands
    // #############################################

    generalCommands.confirm = ( { data, userFunctions, chatFunctions } ) => {
        userFunctions.confirmCommand( data, chatFunctions )
    }
    generalCommands.confirm.help = "Confirm a command if requested";

    generalCommands.giverc = ( { data, args, userFunctions, chatFunctions, databaseFunctions } ) => {
        userFunctions.giveRoboCoinCommand( data, args, chatFunctions, databaseFunctions )
    }
    generalCommands.giverc.argumentCount = 2;
    generalCommands.giverc.help = "Give someone RoboCoin";
    generalCommands.giverc.sampleArguments = [ "jodrell", "10" ];

    // #############################################
    // General user Queue commands
    // #############################################

    userQueueCommands.q = ( { data, userFunctions, chatFunctions } ) => {
        userFunctions.readQueue( data, chatFunctions );
    }
    userQueueCommands.q.help = "Tells you who's in the queue";

    userQueueCommands.addme = ( { data, userFunctions, chatFunctions } ) => {
        userFunctions.addme( data, chatFunctions );
    }
    userQueueCommands.addme.help = "Join the queue for the decks";

    userQueueCommands.removeme = ( { data, userFunctions, chatFunctions, botFunctions } ) => {
        userFunctions.removeme( data, chatFunctions, botFunctions );
    }
    userQueueCommands.removeme.help = "Remove yourself from the queue";

    userQueueCommands.position = ( { data, userFunctions, chatFunctions } ) => {
        userFunctions.whatsMyQueuePosition( data, chatFunctions );
    }
    userQueueCommands.position.help = "Tells a user where they are in the queue";

    // ######################################################
    // Advanced chat commands...more than just basic messages
    // ######################################################

    chatCommands.martika = ( { data, chatFunctions } ) => {
        chatFunctions.multilineChatCommand( data, chatCommandItems.martikaMessages, chatCommandItems.martikaPics );
    }
    chatCommands.martika.help = "M A R T I K A";

    chatCommands.monkey = ( { data, chatFunctions } ) => {
        chatFunctions.multilineChatCommand( data, chatCommandItems.monkeyMessages, chatCommandItems.monkeyPics );
    }
    chatCommands.monkey.help = "Schock den Affen!";

    chatCommands.coinflip = ( { data, userFunctions, chatFunctions } ) => {
        chatFunctions.coinflip( data, userFunctions );
    }
    chatCommands.coinflip.help = "Flip a coin and return heads or tails?";

    chatCommands.dice = ( { data, args, userFunctions, chatFunctions } ) => {
        chatFunctions.dice( data, args, userFunctions );
    }
    chatCommands.dice.argumentCount = 2;
    chatCommands.dice.help = "Roll some dice";
    chatCommands.dice.sampleArguments = [ "1", "d20" ]

    chatCommands.listalias = ( { data, chatFunctions } ) => {
        listAlias( data, chatFunctions );
    }
    chatCommands.listalias.argumentCount = 1;
    chatCommands.listalias.help = "List aliases for a command";
    chatCommands.listalias.sampleArguments = [ "alias" ];

    // #############################################
    // Bot control commands
    // #############################################

    botCommands.uptime = ( { data, botFunctions, userFunctions, chatFunctions } ) => {
        botFunctions.reportUptime( data, userFunctions, chatFunctions );
    }
    botCommands.uptime.help = "Tells you how long the bot has been running for";

    botCommands.playlist = ( { data, chatFunctions } ) => {
        chatFunctions.readPlaylistStats( data );
    }
    botCommands.playlist.help = "Tells you how many songs are in the Bot playlist";

    moderatorCommands.avatar = ( { data, args, botFunctions, chatFunctions } ) => {
        botFunctions.changeAvatar( data, args, chatFunctions )
    }
    moderatorCommands.avatar.argumentCount = 1;
    moderatorCommands.avatar.help = "Change Robo's avatar";
    moderatorCommands.avatar.sampleArguments = [ "13" ];

    // #############################################
    // User commands
    // #############################################

    userCommands.afk = ( { data, userFunctions, chatFunctions } ) => {
        userFunctions.switchUserAFK( data, chatFunctions );
    }
    userCommands.afk.help = "Switches the senders AFK state";

    userCommands.whosafk = ( { data, userFunctions, chatFunctions } ) => {
        userFunctions.whosAFK( data, chatFunctions );
    }
    userCommands.whosafk.help = "Tells you which users have enabled AFK";

    // #############################################
    // Testing commands
    // #############################################

    generalCommands.wibble = ( { data, userFunctions, chatFunctions, databaseFunctions } ) => {
        userFunctions.chargeMe( 220, data, chatFunctions, databaseFunctions, () => userFunctions.wibble( data, chatFunctions ) );
    };
    generalCommands.wibble.help = "Just testing";

    // #############################################
    // Moderator Only commands
    // #############################################

    moderatorCommands.randomiseplaylist = ( { songFunctions } ) => {
        songFunctions.randomisePlaylist()
    }
    moderatorCommands.randomiseplaylist.help = "Shuffle Robos playlist";

    moderatorCommands.autodj = () => {
        bot.addDj();
    }
    moderatorCommands.autodj.help = "Starts the Bot DJing";

    moderatorCommands.lengthlimit = ( { data, args, songFunctions, chatFunctions } ) => {
        songFunctions.switchLengthLimit( data, args, chatFunctions )
    }
    moderatorCommands.lengthlimit.argumentCount = 1;
    moderatorCommands.lengthlimit.help = "Switch the song length limit on or off. Sent with a number it changes the limit";
    moderatorCommands.lengthlimit.sampleArguments = [ "20" ];

    moderatorCommands.userstatus = ( { data, args, userFunctions, chatFunctions } ) => {
        userFunctions.readUserStatus( data, args, chatFunctions )
    }
    moderatorCommands.userstatus.argumentCount = 1;
    moderatorCommands.userstatus.help = "Read out the activity summary of a specified user";
    moderatorCommands.userstatus.sampleArguments = [ "Jodrell" ];

    moderatorCommands.playlimiton = ( { data, args, userFunctions, chatFunctions } ) => {
        userFunctions.playLimitOnCommand( data, args, chatFunctions )
    }
    moderatorCommands.playlimiton.argumentCount = 1;
    moderatorCommands.playlimiton.help = "Enable the DJ play limits";
    moderatorCommands.playlimiton.sampleArguments = [ "10" ];

    moderatorCommands.playlimitoff = ( { data, userFunctions, chatFunctions } ) => {
        userFunctions.playLimitOffCommand( data, chatFunctions )
    }
    moderatorCommands.playlimitoff.help = "Disable the DJ play limits";

    moderatorCommands.songstats = ( { data, botFunctions, chatFunctions } ) => {
        botFunctions.songStatsCommand( data, chatFunctions )
    }
    moderatorCommands.songstats.help = "Switch the readout of the song stats on or off";

    moderatorCommands.autodj = ( { data, botFunctions, chatFunctions } ) => {
        botFunctions.autoDJCommand( data, chatFunctions )
    }
    moderatorCommands.autodj.help = "Enables or Disables the auto DJing function";

    moderatorCommands.autodjstart = ( { data, args, botFunctions, chatFunctions } ) => {
        botFunctions.setWhenToGetOnStage( data, args, chatFunctions )
    }
    moderatorCommands.autodjstart.help = "Set the number of DJs that need to be on stage for the Bot to start DJing";

    moderatorCommands.autodjstop = ( { data, args, botFunctions, chatFunctions } ) => {
        botFunctions.setWhenToGetOffStage( data, args, chatFunctions )
    }
    moderatorCommands.autodjstop.help = "Set the number of DJs that need to be on stage for the Bot to stop DJing";

    moderatorCommands.removeidledjs = ( { data, userFunctions, botFunctions, chatFunctions } ) => {
        botFunctions.removeIdleDJsCommand( data, userFunctions, chatFunctions )
    }
    moderatorCommands.removeidledjs.help = "Enable/Disable the auto removal of DJs who've idled out";

    moderatorCommands.idlewarning1 = ( { data, args, userFunctions, chatFunctions } ) => {
        userFunctions.setIdleFirstWarningTime( data, args, chatFunctions )
    }
    moderatorCommands.idlewarning1.help = "Time in minutes for the first Idle warning to be sent";

    moderatorCommands.idlewarning2 = ( { data, args, userFunctions, chatFunctions } ) => {
        userFunctions.setIdleSecondWarningTime( data, args, chatFunctions )
    }
    moderatorCommands.idlewarning2.help = "Time in minutes for the first Idle warning to be sent";

    moderatorCommands.parsevideo = ( { data, args, videoFunctions, userFunctions, chatFunctions, botFunctions } ) => {
        videoFunctions.checkVideoRegionAlert( data, args, userFunctions, chatFunctions, botFunctions )
    }
    moderatorCommands.parsevideo.help = "Test the video region checker";

    moderatorCommands.addalertregion = ( { data, args, videoFunctions, chatFunctions, botFunctions } ) => {
        botFunctions.addAlertRegionCommand( data, args, videoFunctions, chatFunctions )
    }
    moderatorCommands.addalertregion.argumentCount = 1;
    moderatorCommands.addalertregion.help = "Add a new region to the list of places that DJs will be alerted about if their video is blocked from";
    moderatorCommands.addalertregion.sampleArguments = [ "CA" ];

    moderatorCommands.removealertregion = ( { data, args, videoFunctions, chatFunctions, botFunctions } ) => {
        botFunctions.removeAlertRegionCommand( data, args, videoFunctions, chatFunctions )
    }
    moderatorCommands.removealertregion.argumentCount = 1;
    moderatorCommands.removealertregion.help = "Remove a region from the list of places that DJs will be alerted about if their video is blocked from";
    moderatorCommands.removealertregion.sampleArguments = [ "CA" ];

    moderatorCommands.checkvideoregions = ( { data, botFunctions, chatFunctions, videoFunctions } ) => {
        botFunctions.checkVideoRegionsCommand( data, videoFunctions, chatFunctions );
    }
    moderatorCommands.checkvideoregions.help = "Switch the region alerts on/off";

    moderatorCommands.m = ( { data, args, chatFunctions } ) => {
        chatFunctions.ventriloquistCommand( data, args );
    }
    moderatorCommands.m.help = "Make your Bot say whatever you want it to!";

    moderatorCommands.refreshon = ( { data, botFunctions, chatFunctions } ) => {
        botFunctions.refreshOnCommand( data, chatFunctions );
    }
    moderatorCommands.refreshon.help = "Enable the " + chatDefaults.commandIdentifier + "refresh command";

    moderatorCommands.refreshoff = ( { data, botFunctions, chatFunctions } ) => {
        botFunctions.refreshOffCommand( data, chatFunctions );
    }
    moderatorCommands.refreshoff.help = "Disable the " + chatDefaults.commandIdentifier + "refresh command";

    moderatorCommands.whosrefreshing = ( { data, userFunctions, chatFunctions } ) => {
        userFunctions.whosRefreshingCommand( data, chatFunctions );
    }
    moderatorCommands.whosrefreshing.help = "List of users currently using the refresh command";

    moderatorCommands.sarahconner = ( { data, args, botFunctions, userFunctions, chatFunctions } ) => {
        botFunctions.sarahConner( data, reassembleArgs( args ), userFunctions, chatFunctions );
    }
    moderatorCommands.sarahconner.argumentCount = 1;
    moderatorCommands.sarahconner.help = "Shut down the Bot if it's causing problems";
    moderatorCommands.sarahconner.sampleArguments = [ "He started booting everyone!" ];

    moderatorCommands.removedj = ( { data, args, botFunctions, userFunctions, chatFunctions } ) => {
        botFunctions.removeDJCommand( data, reassembleArgs( args ), userFunctions, chatFunctions );
    }
    moderatorCommands.removedj.help = "Remove the current DJ from the decks. Add a message after the command to have it sent direct to the DJ (in public)";

    moderatorCommands.informdj = ( { data, args, botFunctions, userFunctions, chatFunctions } ) => {
        botFunctions.informDJCommand( data, reassembleArgs( args ), userFunctions, chatFunctions );
    }
    moderatorCommands.informdj.help = "Have the Bot send the current DJ a message";

    moderatorCommands.awesome = ( { botFunctions } ) => {
        botFunctions.awesomeCommand();
    }
    moderatorCommands.awesome.help = "Have the Bot upvote";

    moderatorCommands.lame = ( { botFunctions } ) => {
        botFunctions.lameCommand();
    }
    moderatorCommands.lame.help = "Have the Bot downvote";

    moderatorCommands.alias = ( { data, chatFunctions } ) => {
        addAlias( data, chatFunctions );
    }
    moderatorCommands.alias.argumentCount = 2;
    moderatorCommands.alias.help = "Add or edit an alias command, will repoint an alias to a different command if it already exists";
    moderatorCommands.alias.sampleArguments = [ "alias", "command" ];

    moderatorCommands.removealias = ( { data, chatFunctions } ) => {
        removeAlias( data, chatFunctions );
    }
    moderatorCommands.removealias.argumentCount = 2;
    moderatorCommands.removealias.help = "Remove an alias from a command";
    moderatorCommands.removealias.sampleArguments = [ "alias", "command" ];

    moderatorCommands.settheme = ( { data, args, chatFunctions, roomFunctions } ) => {
        roomFunctions.setThemeCommand( data, reassembleArgs( args ), chatFunctions );
    }
    moderatorCommands.settheme.help = "Set a theme for the room";

    moderatorCommands.notheme = ( { data, chatFunctions, roomFunctions } ) => {
        roomFunctions.removeThemeCommand( data, chatFunctions );
    }
    moderatorCommands.notheme.help = "Set a theme for the room";

    moderatorCommands.randomtheme = ( { data, chatFunctions, roomFunctions } ) => {
        roomFunctions.themeRandomizer( data, chatFunctions );
    }
    moderatorCommands.randomtheme.help = "Enable/Disable the theme randomizer";

    moderatorCommands.readrandomthemes = ( { data, chatFunctions, roomFunctions } ) => {
        roomFunctions.readRandomThemes( data, chatFunctions );
    }
    moderatorCommands.randomtheme.help = "Enable/Disable the theme randomizer";

    moderatorCommands.randomthemeadd = ( { data, args, chatFunctions, roomFunctions, documentationFunctions } ) => {
        roomFunctions.randomThemeAdd( data, reassembleArgs( args ), chatFunctions, documentationFunctions );
    }
    moderatorCommands.randomthemeadd.argumentCount = 1;
    moderatorCommands.randomthemeadd.help = "Add a theme to the randomizer";
    moderatorCommands.randomthemeadd.sampleArguments = [ "The Weather" ];

    moderatorCommands.randomthemeremove = ( { data, args, chatFunctions, roomFunctions, documentationFunctions } ) => {
        roomFunctions.randomThemeRemove( data, reassembleArgs( args ), chatFunctions, documentationFunctions );
    }
    moderatorCommands.randomthemeremove.argumentCount = 1;
    moderatorCommands.randomthemeremove.help = "Remove a theme from the randomizer";
    moderatorCommands.randomthemeremove.sampleArguments = [ "The Weather" ];

    moderatorCommands.setemailaddress = ( { data, args, chatFunctions, userFunctions, databaseFunctions } ) => {
        userFunctions.setEmailAddress( data, args, chatFunctions, databaseFunctions ).then();
    }
    moderatorCommands.setemailaddress.argumentCount = 2;
    moderatorCommands.setemailaddress.help = "Set a users email address for secondary authentication";
    moderatorCommands.setemailaddress.sampleArguments = [ "username", "email@address" ];

    moderatorCommands.readfavouriteartist = ( { data, chatFunctions, botFunctions, databaseFunctions } ) => {
        botFunctions.readFavouriteArtist( data, chatFunctions, databaseFunctions );
    }
    moderatorCommands.readfavouriteartist.help = "Read Robos favourite artist";

    moderatorCommands.choosenewfavourite = ( { botFunctions, databaseFunctions } ) => {
        botFunctions.chooseNewFavourite( databaseFunctions );
    }
    moderatorCommands.choosenewfavourite.help = "Pick a new favourite artist";

    // moderatorCommands.askbard = ( { botFunctions, data, args, chatFunctions, mlFunctions } ) => {
    //     botFunctions.askBardCommand( data, reassembleArgs( args ), chatFunctions, mlFunctions );
    // }
    // moderatorCommands.askbard.help = "Talk to Robo via Bard";

    // moderatorCommands.askchatgpt = ( { botFunctions, data, args, chatFunctions, mlFunctions } ) => {
    //     botFunctions.askChatGPTCommand( data, reassembleArgs( args ), chatFunctions, mlFunctions );
    // }
    // moderatorCommands.askchatgpt.help = "Talk to Robo via Bard";

    // #############################################
    // Moderator Greeting commands
    // #############################################

    moderatorWelcomeCommands.greeton = ( { data, chatFunctions, roomFunctions } ) => {
        roomFunctions.greetOnCommand( data, chatFunctions );
    }
    moderatorWelcomeCommands.greeton.help = "Enable user greetings";

    moderatorWelcomeCommands.greetoff = ( { data, chatFunctions, roomFunctions } ) => {
        roomFunctions.greetOffCommand( data, chatFunctions );
    }
    moderatorWelcomeCommands.greetoff.help = "Disable user greetings";

    moderatorWelcomeCommands.enablerules = ( { data, chatFunctions, roomFunctions } ) => {
        roomFunctions.enableRulesMessageCommand( data, chatFunctions );
    }
    moderatorWelcomeCommands.enablerules.help = "Have the room rules etc read out with the room greeting";

    moderatorWelcomeCommands.disablerules = ( { data, chatFunctions, roomFunctions } ) => {
        roomFunctions.disableRulesMessageCommand( data, chatFunctions );
    }
    moderatorWelcomeCommands.disablerules.help = "Stop the room rules being read out with the room greeting";

    moderatorWelcomeCommands.rulesinterval = ( { data, args, chatFunctions, roomFunctions } ) => {
        roomFunctions.setRulesIntervalCommand( data, args, chatFunctions );
    }
    moderatorWelcomeCommands.rulesinterval.argumentCount = 1;
    moderatorWelcomeCommands.rulesinterval.help = "Set the interval, in minutes, for how often the room rules will be read out with the room greeting";
    moderatorWelcomeCommands.rulesinterval.sampleArguments = [ 15 ];


    // #############################################
    // Moderator Only Queue commands
    // #############################################

    moderatorQueueCommands.move = ( { data, args, userFunctions, chatFunctions } ) => {
        userFunctions.changeUsersQueuePosition( data, args, chatFunctions )
    };
    moderatorQueueCommands.move.argumentCount = 2;
    moderatorQueueCommands.move.help = "Change a users position in the queue";
    moderatorQueueCommands.move.sampleArguments = [ 'jodrell', 1 ];

    moderatorQueueCommands.bumptop = ( { data, args, userFunctions, chatFunctions, botFunctions } ) => {
        userFunctions.moveUserToHeadOfQueue( data, args, chatFunctions, botFunctions )
    };
    moderatorQueueCommands.bumptop.argumentCount = 1;
    moderatorQueueCommands.bumptop.help = "Move a user to the head of the queue";
    moderatorQueueCommands.bumptop.sampleArguments = [ 'jodrell' ];

    moderatorQueueCommands.queueon = ( { data, userFunctions, chatFunctions } ) => {
        userFunctions.enableQueue( data, chatFunctions )
    }
    moderatorQueueCommands.queueon.help = "Enables the queue";

    moderatorQueueCommands.queueoff = ( { data, userFunctions, chatFunctions } ) => {
        userFunctions.disableQueue( data, chatFunctions )
    }
    moderatorQueueCommands.queueoff.help = "Disables the queue";

    moderatorQueueCommands.setdjplaycount = ( { data, args, userFunctions, chatFunctions, databaseFunctions } ) => {
        userFunctions.setDJCurrentPlaycountCommand( data, args[ 0 ], reassembleArgs( args, 1 ), chatFunctions, databaseFunctions )
    }
    moderatorQueueCommands.setdjplaycount.argumentCount = 2;
    moderatorQueueCommands.setdjplaycount.help = "Sets a DJs current playcount. This will let you give a DJ extra plays, or fewer, if the playLimit is set";
    moderatorQueueCommands.setdjplaycount.sampleArguments = [ 2, 'jodrell' ];

    moderatorQueueCommands.setmaxdjs = ( { data, args, chatFunctions, roomFunctions } ) => {
        roomFunctions.setMaxDJs( args[ 0 ], data, chatFunctions )
    }
    moderatorQueueCommands.setmaxdjs.argumentCount = 1;
    moderatorQueueCommands.setmaxdjs.help = "Sets the max number of DJs allowed on stage";
    moderatorQueueCommands.setmaxdjs.sampleArguments = [ 2 ];

    moderatorQueueCommands.addsuperdj = ( { data, args, chatFunctions, userFunctions } ) => {
        userFunctions.addSuperDJ( reassembleArgs( args, 0 ), data, chatFunctions )
    }
    moderatorQueueCommands.addsuperdj.argumentCount = 1;
    moderatorQueueCommands.addsuperdj.help = "Add a DJ to the SuperDJs list";
    moderatorQueueCommands.addsuperdj.sampleArguments = [ "Jodrell" ];

    moderatorQueueCommands.removesuperdj = ( { data, args, chatFunctions, userFunctions } ) => {
        userFunctions.removeSuperDJ( reassembleArgs( args, 0 ), data, chatFunctions )
    }
    moderatorQueueCommands.removesuperdj.argumentCount = 1;
    moderatorQueueCommands.removesuperdj.help = "Remove a DJ from the SuperDJs list";
    moderatorQueueCommands.removesuperdj.sampleArguments = [ "Jodrell" ];

    moderatorQueueCommands.listsuperdjs = ( { data, chatFunctions, userFunctions } ) => {
        userFunctions.readSuperDJs( data, chatFunctions )
    }
    moderatorQueueCommands.listsuperdjs.help = "List the SuperDJs";

    moderatorQueueCommands.clearsuperdjs = ( { data, chatFunctions, userFunctions } ) => {
        userFunctions.clearSuperDJs( data, chatFunctions )
    }
    moderatorQueueCommands.clearsuperdjs.help = "Remove all SuperDJs";


    // #############################################
    // Moderator Only Dynamic Chat commands
    // #############################################

    moderatorChatCommands.addchatcommand = ( { data, chatFunctions, documentationFunctions } ) => {
        addChatCommandWithMessage( data, chatFunctions, documentationFunctions );
    }
    moderatorChatCommands.addchatcommand.argumentCount = 2;
    moderatorChatCommands.addchatcommand.help = "Add a new chat/picture command. You must add a message with the new command";
    moderatorChatCommands.addchatcommand.sampleArguments = [ "command", "message" ];

    moderatorChatCommands.addmessagetochatcommand = ( { data, chatFunctions, documentationFunctions } ) => {
        addMessageToChatCommand( data, chatFunctions, documentationFunctions );
    }
    moderatorChatCommands.addmessagetochatcommand.argumentCount = 2;
    moderatorChatCommands.addmessagetochatcommand.help = "Add a new message to a chat command.";
    moderatorChatCommands.addmessagetochatcommand.sampleArguments = [ "command", "message" ];

    moderatorChatCommands.addpicturetochatcommand = ( { data, chatFunctions, documentationFunctions } ) => {
        addPictureToChatCommand( data, chatFunctions, documentationFunctions );
    }
    moderatorChatCommands.addpicturetochatcommand.argumentCount = 2;
    moderatorChatCommands.addpicturetochatcommand.help = "Add a new picture to a chat command. It must be the full URL for a gif. Please paste it in the chat first to make sure it works!";
    moderatorChatCommands.addpicturetochatcommand.sampleArguments = [ "command", "http://url.link/image.gif" ];

    moderatorChatCommands.removechatcommand = ( { data, chatFunctions, documentationFunctions } ) => {
        removeChatCommand( data, chatFunctions, documentationFunctions );
    }
    moderatorChatCommands.removechatcommand.argumentCount = 1;
    moderatorChatCommands.removechatcommand.help = "Delete a chat command, including any messages/pictures. Careful, this is not reversible";
    moderatorChatCommands.removechatcommand.sampleArguments = [ "command" ];

    moderatorChatCommands.removechatcommandmessage = ( { data, chatFunctions, documentationFunctions } ) => {
        removeChatCommandMessage( data, chatFunctions, documentationFunctions );
    }
    moderatorChatCommands.removechatcommandmessage.argumentCount = 2;
    moderatorChatCommands.removechatcommandmessage.help = "Remove a message from a dynamic chat command. The message must match exactly and be surrounded by double quotes";
    moderatorChatCommands.removechatcommandmessage.sampleArguments = [ "command", "\"Remove this message\"" ];

    moderatorChatCommands.removechatcommandpicture = ( { data, chatFunctions, documentationFunctions } ) => {
        removeChatCommandPicture( data, chatFunctions, documentationFunctions );
    }
    moderatorChatCommands.removechatcommandpicture.argumentCount = 2;
    moderatorChatCommands.removechatcommandpicture.help = "Remove a picture from a dynamic chat command. The URL must match exactly and be surrounded by double quotes";
    moderatorChatCommands.removechatcommandpicture.sampleArguments = [ "command", "http://url.link/image.gif" ];

    // #############################
    // end of fully checked commands
    // #############################

    const allModeratorCommands = {
        ...moderatorCommands,
        ...moderatorWelcomeCommands,
        ...moderatorQueueCommands,
        ...moderatorChatCommands
    }

    const allQueueCommands = {
        ...moderatorQueueCommands,
        ...userQueueCommands
    }

    const allGeneralCommands = {
        ...generalCommands,
        ...userQueueCommands
    }

    const allCommands = {
        ...allGeneralCommands,
        ...allModeratorCommands,
        ...botCommands,
        ...chatCommands,
        ...userCommands
    }

    function listCommands( data, commandGroup, chatFunctions ) {
        let theCommand = commandGroup[ 0 ];
        let theMessage;

        switch ( theCommand ) {
            case "generalCommands":
                theMessage = "The General Commands are " + buildListFromObject( Object.keys( allGeneralCommands ) );
                break;
            case "modCommands":
                theMessage = "The Moderator Commands are " + buildListFromObject( Object.keys( moderatorCommands ) );
                break;
            case "modChatCommands":
                theMessage = "The Dynamic Chat Commands are " + buildListFromObject( Object.keys( moderatorChatCommands ) );
                break;
            case "modWelcomeCommands":
                theMessage = "The Moderator Welcome Commands are " + buildListFromObject( Object.keys( moderatorWelcomeCommands ) );
                break;
            case "modQueueCommands":
                theMessage = "The Moderator Queue Commands are " + buildListFromObject( Object.keys( moderatorQueueCommands ) );
                break;
            case "botCommands":
                theMessage = "The Bot Commands are " + buildListFromObject( Object.keys( botCommands ) );
                break;
            case "chatCommands":
                theMessage = "The Chat Commands are " + buildListFromObject( Object.keys( chatCommands ) );
                break;
            case "userCommands":
                theMessage = "The User Commands are " + buildListFromObject( Object.keys( userCommands ) );
                break;
            case "queueCommands":
                theMessage = "The User Commands are " + buildListFromObject( Object.keys( allQueueCommands ) );
                break;
            default:
                theMessage = 'Top level command groups are: generalCommands, chatCommands, queueCommands, botCommands, userCommands, modCommands, modChatCommands, modWelcomeCommands, modQueueCommands. Please use ' + chatDefaults.commandIdentifier + 'list [commandGroup] for the individual commands';
                break;
        }

        theMessage = theMessage.replace( ',', ', ' );
        chatFunctions.botSpeak( theMessage, data );
    }

    function buildListFromObject( commandObject ) {
        let theList = '';
        for ( let i in commandObject ) {
            theList += chatDefaults.commandIdentifier + commandObject[ i ] + ", ";
        }
        return theList.substring( 0, theList.length - 2 );
    }

    function displayHelp( data, command, chatFunctions ) {
        let theMessage = "";

        if ( command[ 0 ] === undefined ) {
            command[ 0 ] = "help"
        }

        if ( allCommands[ command ] === undefined ) {
            chatFunctions.botSpeak( 'That command doesn\'t exist. Try ' + chatDefaults.commandIdentifier + 'list to find the available commands', data );
        } else {
            theMessage = theMessage + "'" + chatDefaults.commandIdentifier + command;

            if ( allCommands[ command ].argumentCount !== undefined ) {
                for ( let argumentLoop = 0; argumentLoop < allCommands[ command ].argumentCount; argumentLoop++ ) {
                    theMessage = theMessage + ' ' + allCommands[ command ].sampleArguments[ argumentLoop ]
                }
            }
            theMessage = theMessage + "': " + allCommands[ command ].help;
            chatFunctions.botSpeak( theMessage, data );
        }
    }

    function reassembleArgs( args, startFrom ) {
        let theString = '';
        if ( startFrom === undefined ) {
            startFrom = 0;
        }
        for ( let argLoop = startFrom; argLoop < args.length; argLoop++ ) {
            theString += args[ argLoop ] + ' ';
        }
        theString = theString.substring( 0, theString.length - 1 );

        return theString;
    }

    return {

        wasThisACommand: function ( data ) {
            let text = data.text;

            // was this on the ignore list
            for ( let ignoreLoop = 0; ignoreLoop < ignoreCommands.length; ignoreLoop++ ) {
                if ( text.match( ignoreCommands[ ignoreLoop ] ) ) {
                    return false;
                }
            }

            // check if this was formatted as a command
            const commandString = "^" + chatDefaults.commandIdentifier;
            return !!text.match( commandString );
        },

        getCommandAndArguments: function ( text, allCommands ) {
            const [ sentCommand, ...args ] = text.split( " " );
            let dynamic = false;

            let theCommand = sentCommand.substring( 1, sentCommand.length )
            theCommand = theCommand.toLowerCase();

            // Check if command exists
            let commandObj = allCommands[ theCommand ];

            // If the command doesn't exist, check aliases and switch the sent alias for the returned command
            if ( !commandObj ) {
                const aliasCommand = this.checkForAlias( theCommand );
                if ( aliasCommand !== undefined ) {
                    if ( this.isChatCommand( aliasCommand ) ) {
                        dynamic = true;
                        theCommand = aliasCommand;
                    } else {
                        commandObj = allCommands[ aliasCommand ];
                    }
                }
            }

            // If the command doesn't exist, check the dynamic chat commands
            if ( !commandObj ) {
                if ( this.isChatCommand( theCommand ) ) {
                    dynamic = true;
                }
            }

            if ( commandObj ) {
                const moderatorOnly = !!allModeratorCommands[ theCommand ];
                return [ commandObj, args, moderatorOnly ];
            } else if ( dynamic === true ) {
                return [ theCommand, 'dynamicChat', null ];
            } else {
                return [ null, null ];
            }
        },

        // parseCommands: function ( data, userFunctions, botFunctions, roomFunctions, songFunctions, chatFunctions, videoFunctions, documentationFunctions, databaseFunctions, dateFunctions, mlFunctions ) {
        parseCommands: function ( data, userFunctions, botFunctions, roomFunctions, songFunctions, chatFunctions, videoFunctions, documentationFunctions, databaseFunctions, dateFunctions ) {
            let senderID;

            if ( data.command === "pmmed" ) {
                senderID = data.senderid;
            } else {
                senderID = data.userid;
            }

            const [ command, args, moderatorOnly ] = this.getCommandAndArguments( data.text, allCommands );
            if ( moderatorOnly && !userFunctions.isUserModerator( senderID ) ) {
                chatFunctions.botSpeak( "Sorry, that function is only available to moderators", data );
            } else if ( args === 'dynamicChat' ) {
                chatFunctions.dynamicChatCommand( data, userFunctions, command, databaseFunctions );
            } else if ( command ) {
                command.call( null, {
                    data,
                    args,
                    userFunctions,
                    botFunctions,
                    roomFunctions,
                    songFunctions,
                    chatFunctions,
                    videoFunctions,
                    documentationFunctions,
                    databaseFunctions,
                    dateFunctions,
                    // mlFunctions,
                } );
            } else {
                chatFunctions.botSpeak( "Sorry, that's not a command I recognise. Try " + chatDefaults.commandIdentifier + "list to find out more.", data );
            }
        },


        isCoreCommand: function ( command ) {
            return !!allCommands[ command ];
        },

        isChatCommand: function ( command ) {
            const dataFilePath = `${ dirname( require.main.filename ) }/data/${ chatDataFileName }`;
            const store = new Storage( dataFilePath );

            const theCommands = store.get( 'chatMessages' );

            const findCommand = theCommands[ command ];

            return findCommand !== undefined;
        },

        canCommandBeAdded: function ( theCommand ) {
            const alias = this.checkForAlias( theCommand );

            const messageHeader = "The command " + theCommand + " can't be added as ";
            // Check if the command is an existing alias
            if ( alias ) {
                return messageHeader + " the alias " + chatDefaults.commandIdentifier + theCommand + " already exists. Remove it if you want to add this as a command";
            }

            // Check if the command is an existing command
            if ( this.isCoreCommand( theCommand ) || this.isChatCommand( theCommand ) ) {
                return messageHeader + "it already exists.";
            }

            return true;
        },

        parseCommandElements: function ( theMessage ) {
            const splitData = [];
            const regex = new RegExp( '"[^"]+"|[\\S]+', 'g' );
            theMessage.match( regex ).forEach( element => {
                if ( !element ) return;
                return splitData.push( element.replace( /"/g, '' ) );
            } );

            return splitData;
        },

        checkForAlias: async function ( passedArgument ) {
            console.group( "checkForAlias" );
            console.log( "passedArgument:" + passedArgument );

            const dataFilePath = `${ dirname( require.main.filename ) }/data/${ aliasDataFileName }`;
            const store = new Storage( dataFilePath );

            const theAliases = store.get( 'aliases' );

            const isAlias = await databaseFunctions.isAlias( passedArgument )
            console.log( "DB Check: " + isAlias );

            let findAlias = theAliases[ passedArgument ];
            console.groupEnd();
            return findAlias ? findAlias.command : undefined;
        }
    }
}

const listAlias = ( data, chatFunctions ) => {
    const dataFilePath = `${ dirname( require.main.filename ) }/data/${ aliasDataFileName }`;
    const store = new Storage( dataFilePath );
    const commandModule = commandFunctions();

    const strippedCommand = data.text.slice( 1 ).toLowerCase().split( " " );
    const passedArgument = strippedCommand[ 1 ];
    const alias = commandModule.checkForAlias( passedArgument );

    const aliasLookup = alias ? `commands.${ alias }` : `commands.${ passedArgument }`;

    const aliases = store.get( aliasLookup );

    chatFunctions.botSpeak( getAliasReturnText( aliases, alias, passedArgument ), data );
}

const getAliasReturnText = ( aliases, alias, command ) => {
    let returnText;

    if ( alias ) {
        returnText = `${ command } is an alias for the command ${ chatDefaults.commandIdentifier }${ alias }`;

        if ( aliases?.length > 1 ) {
            returnText += ` which has the following aliases ${ chatDefaults.commandIdentifier }${ aliases.join( ` and ${ chatDefaults.commandIdentifier }` ) }`;
        }
    } else {
        returnText = `The command ${ chatDefaults.commandIdentifier }${ command } has no aliases`;

        if ( aliases?.length ) {
            returnText = `The command ${ chatDefaults.commandIdentifier }${ command } now has aliases ${ chatDefaults.commandIdentifier }${ aliases.join( ` and ${ chatDefaults.commandIdentifier }` ) }`;
        }
    }

    return returnText;
}

const addAlias = ( data, chatFunctions ) => {
    const dataFilePath = `${ dirname( require.main.filename ) }/data/${ aliasDataFileName }`;
    const store = new Storage( dataFilePath );
    const commandModule = commandFunctions();

    const strippedCommand = data.text.slice( 1 ).toLowerCase().split( " " );
    const newAlias = strippedCommand[ 1 ];
    const currentAlias = commandModule.checkForAlias( newAlias );

    // does the command we're aliasing actually exist
    const commandToLink = strippedCommand[ 2 ];
    if ( !commandModule.isCoreCommand( commandToLink ) && !commandModule.isChatCommand( commandToLink ) ) {
        chatFunctions.botSpeak( `The command ${ chatDefaults.commandIdentifier }${ commandToLink } doesn't exist to be aliased.`, data );
        return;
    }

    // Check if new alias already exists
    if ( currentAlias ) {
        chatFunctions.botSpeak( `The alias ${ chatDefaults.commandIdentifier }${ newAlias } already exists.`, data );
        return;
    }

    // Check if new alias is a command
    if ( commandModule.isCoreCommand( newAlias ) || commandModule.isChatCommand( newAlias ) ) {
        chatFunctions.botSpeak( `Alias not added. ${ chatDefaults.commandIdentifier }${ newAlias } is already a command.`, data );
        return;
    }

    store.put( `aliases.${ newAlias }`, { command: commandToLink } );

    let newCommandWithAlias = [ newAlias ];

    let commandList = store.get( `commands.${ commandToLink }` );

    if ( commandList ) {
        commandList.push( newAlias );
        newCommandWithAlias = commandList;
    }

    store.put( `commands.${ commandToLink }`, newCommandWithAlias );

    chatFunctions.botSpeak( "Update successful.", data );
}

const removeAlias = ( data, chatFunctions ) => {
    const dataFilePath = `${ dirname( require.main.filename ) }/data/${ aliasDataFileName }`;
    const store = new Storage( dataFilePath );
    const commandModule = commandFunctions();

    const strippedCommand = data.text.slice( 1 ).toLowerCase().split( " " );

    const aliasBeingRemoved = strippedCommand[ 1 ];
    const rootCommand = commandModule.checkForAlias( `${ strippedCommand[ 1 ] }` );

    store.remove( `aliases.${ aliasBeingRemoved }` );

    let commandList = store.get( `commands.${ rootCommand }` );

    if ( commandList ) {
        const updatedCommandList = commandList.filter( function ( value, index, arr ) {
            return value !== aliasBeingRemoved;
        } );

        if ( updatedCommandList.length === 0 ) {
            store.remove( `commands.${ rootCommand }` );
        } else {
            store.put( `commands.${ rootCommand }`, updatedCommandList );
        }
    }

    chatFunctions.botSpeak( "Alias removed.", data );
}

// #########################################################

const addChatCommandWithMessage = ( data, chatFunctions, documentationFunctions ) => {
    const dataFilePath = `${ dirname( require.main.filename ) }/data/${ chatDataFileName }`;
    const store = new Storage( dataFilePath );
    const commandModule = commandFunctions();

    const splitData = commandModule.parseCommandElements( data.text );
    const newCommand = splitData[ 1 ];
    const commandMessage = splitData[ 2 ];

    const addCommand = commandModule.canCommandBeAdded( newCommand );
    if ( addCommand === true ) {
        store.put( `chatMessages.${ newCommand }.messages`, [ commandMessage ] );

        const successMessage = "Update successful. The command "
            + newCommand + " was added, along with the message '"
            + commandMessage + "'";

        chatFunctions.botSpeak( successMessage, data );
    } else {
        chatFunctions.botSpeak( addCommand, data );
    }

    chatDocumentationRebuild( documentationFunctions );
}

const addMessageToChatCommand = ( data, chatFunctions, documentationFunctions ) => {
    const dataFilePath = `${ dirname( require.main.filename ) }/data/${ chatDataFileName }`;
    const store = new Storage( dataFilePath );
    const commandModule = commandFunctions();

    const splitData = commandModule.parseCommandElements( data.text );
    const theCommand = splitData[ 1 ];
    const theMessage = splitData[ 2 ];

    if ( commandModule.isCoreCommand( theCommand ) ) {
        chatFunctions.botSpeak( "The command " + theCommand + " is not a chat command that can be managed like this.", data );
        return;
    }

    if ( !commandModule.isChatCommand( theCommand ) ) {
        addChatCommandWithMessage( data, chatFunctions, documentationFunctions );
        return;
    }

    let theMessages = store.get( `chatMessages.${ theCommand }.messages` );
    theMessages.push( theMessage );

    store.put( `chatMessages.${ theCommand }.messages`, theMessages );
    chatFunctions.botSpeak( "Update successful. The command " + theCommand + " was updated", data );

    chatDocumentationRebuild( documentationFunctions );
}

const addPictureToChatCommand = ( data, chatFunctions, documentationFunctions ) => {
    const dataFilePath = `${ dirname( require.main.filename ) }/data/${ chatDataFileName }`;
    const store = new Storage( dataFilePath );
    const commandModule = commandFunctions();

    const splitData = commandModule.parseCommandElements( data.text );
    const theCommand = splitData[ 1 ];
    const thePicture = splitData[ 2 ];

    if ( commandModule.isCoreCommand( theCommand ) ) {
        chatFunctions.botSpeak( "The command " + theCommand + " is not a chat command that can be managed like this.", data );
        return;
    }

    if ( !commandModule.isChatCommand( theCommand ) ) {
        chatFunctions.botSpeak( "The chat command " + theCommand + " does not exist.", data );
        return;
    }

    let thePictures = store.get( `chatMessages.${ theCommand }.pictures` );
    if ( thePictures === undefined ) {
        thePictures = [];
    }
    thePictures.push( thePicture );

    store.put( `chatMessages.${ theCommand }.pictures`, thePictures );
    chatFunctions.botSpeak( "Update successful. The command " + theCommand + " was updated", data );

    chatDocumentationRebuild( documentationFunctions );
}

const removeChatCommand = ( data, chatFunctions, documentationFunctions ) => {
    const dataFilePath = `${ dirname( require.main.filename ) }/data/${ chatDataFileName }`;
    const store = new Storage( dataFilePath );
    const commandModule = commandFunctions();

    const splitData = commandModule.parseCommandElements( data.text );
    const theCommand = splitData[ 1 ];

    if ( !commandModule.isChatCommand( theCommand ) ) {
        chatFunctions.botSpeak( "The chat command " + theCommand + " does not exist.", data );
        return;
    }

    store.remove( `chatMessages.${ theCommand }` );
    chatFunctions.botSpeak( "Update successful. The command " + theCommand + " was removed", data );

    chatDocumentationRebuild( documentationFunctions );
}

const removeChatCommandMessage = ( data, chatFunctions, documentationFunctions ) => {
    const dataFilePath = `${ dirname( require.main.filename ) }/data/${ chatDataFileName }`;
    const store = new Storage( dataFilePath );
    const commandModule = commandFunctions();

    const splitData = commandModule.parseCommandElements( data.text );
    const theCommand = splitData[ 1 ];
    const theMessage = splitData[ 2 ];

    if ( commandModule.isCoreCommand( theCommand ) ) {
        chatFunctions.botSpeak( "The command " + theCommand + " is not a dynamic chat command that can be managed like this.", data );
        return;
    }

    if ( !commandModule.isChatCommand( theCommand ) ) {
        chatFunctions.botSpeak( "The command " + theCommand + " does not exist.", data );
        return;
    }

    let theMessages = store.get( `chatMessages.${ theCommand }.messages` );
    if ( theMessages.indexOf( theMessage ) !== -1 ) {
        theMessages.splice( theMessages.indexOf( theMessage ), 1 );
    } else {
        chatFunctions.botSpeak( "That message can't be found for that command " + theCommand + ". Check that you sent the message EXACTLY as displayed, wrapped in double quotes", data );
        return;
    }

    store.put( `chatMessages.${ theCommand }.messages`, theMessages );
    chatFunctions.botSpeak( "Update successful. The command " + theCommand + " was updated", data );

    chatDocumentationRebuild( documentationFunctions );
}

const removeChatCommandPicture = ( data, chatFunctions, documentationFunctions ) => {
    const dataFilePath = `${ dirname( require.main.filename ) }/data/${ chatDataFileName }`;
    const store = new Storage( dataFilePath );
    const commandModule = commandFunctions();

    const splitData = commandModule.parseCommandElements( data.text );
    const theCommand = splitData[ 1 ];
    const thePicture = splitData[ 2 ];

    if ( commandModule.isCoreCommand( theCommand ) ) {
        chatFunctions.botSpeak( "The command " + theCommand + " is not a dynamic chat command that can be managed like this.", data );
        return;
    }

    if ( !commandModule.isChatCommand( theCommand ) ) {
        chatFunctions.botSpeak( "The command " + theCommand + " does not exist.", data );
        return;
    }

    let thePictures = store.get( `chatMessages.${ theCommand }.pictures` );
    if ( thePictures.indexOf( thePicture ) !== -1 ) {
        thePictures.splice( thePictures.indexOf( thePicture ), 1 );
    } else {
        chatFunctions.botSpeak( "That picture can't be found for that command " + theCommand + ". Check that you sent the URL EXACTLY as displayed, wrapped in double quotes", data );
        return;
    }

    store.put( `chatMessages.${ theCommand }.pictures`, thePictures );
    chatFunctions.botSpeak( "Update successful. The command " + theCommand + " was updated", data );

    chatDocumentationRebuild( documentationFunctions );
}

const chatDocumentationRebuild = ( documentationFunctions ) => {
    setTimeout( function () {
        documentationFunctions.rebuildChatDocumentation();
    }, 5 * 1000 );
}

module.exports = commandFunctions;