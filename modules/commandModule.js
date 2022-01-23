let chatDefaults = require( '../defaultSettings/chatDefaults.js' );
let chatCommandItems = require( '../defaultSettings/chatCommandItems.js' );
const Storage = require( 'node-storage' );
const { dirname } = require( 'path' );

const generalCommands = {};
const userCommands = {};
const chatCommands = {};
const botCommands = {};
const userQueueCommands = {};
const moderatorQueueCommands = {};
const moderatorWelcomeCommands = {};
const moderatorCommands = {};

const aliasDataFile = process.env.ALIASDATA;

const ignoreCommands = [ '/me ' ];

const commandFunctions = ( bot ) => {
    // #############################################
    // These commands are confirmed as fully working
    // #############################################

    // #############################################
    // General commands
    // #############################################

    generalCommands.list = ( { data, args, chatFunctions } ) => { listCommands( data, args, chatFunctions ) }
    generalCommands.list.argumentCount = 1;
    generalCommands.list.help = "Lists all available commands";
    generalCommands.list.sampleArguments = [ "[command type]" ]

    generalCommands.help = ( { data, args, chatFunctions } ) => { displayHelp( data, args, chatFunctions ); }
    generalCommands.help.argumentCount = 1;
    generalCommands.help.help = "Display how to use an individual command";
    generalCommands.help.sampleArguments = [ "[command]" ];

    generalCommands.djplays = ( { data, userFunctions, chatFunctions } ) => { userFunctions.djPlaysCommand( data, chatFunctions ); }
    generalCommands.djplays.help = "How many track has each DJ played = current(total if different)";

    generalCommands.escortme = ( { data, userFunctions, chatFunctions } ) => { userFunctions.enableEscortMe( data, chatFunctions ); }
    generalCommands.escortme.help = "Have yourself removed from the decks after your track finishes playing";

    generalCommands.stopescortme = ( { data, userFunctions, chatFunctions } ) => { userFunctions.disableEscortMe( data, chatFunctions ); }
    generalCommands.stopescortme.help = "Stop yourself from being removed from the decks after your track finishes playing";

    generalCommands.whatsplaylimit = ( { data, userFunctions, chatFunctions } ) => { userFunctions.whatsPlayLimit( data, chatFunctions ); }
    generalCommands.whatsplaylimit.help = "Is the DJ Play Limit enabled, and if so what it's set to";

    generalCommands.refresh = ( { data, botFunctions, userFunctions, chatFunctions } ) => { userFunctions.refreshCommand( data, chatFunctions, botFunctions ); }
    generalCommands.refresh.help = "Hold your spot on stage for one minute if you need to refresh your browser";

    generalCommands.regionalerts = ( { data, botFunctions, videoFunctions, chatFunctions } ) => { botFunctions.reportRegionCheckStatus( data, videoFunctions, chatFunctions ); }
    generalCommands.regionalerts.help = "Show the list of regions that DJs are alerted about ";

    generalCommands.roomstatus = ( { data, botFunctions, chatFunctions, userFunctions, videoFunctions } ) => { botFunctions.reportRoomStatus( data, chatFunctions, userFunctions, videoFunctions ); }
    generalCommands.roomstatus.help = "Show the list of regions that DJs are alerted about ";

    generalCommands.dive = ( { data, botFunctions, chatFunctions, userFunctions } ) => { botFunctions.stageDiveCommand( data, chatFunctions, userFunctions, chatCommandItems.stageDiveMessages ); }
    generalCommands.dive.help = "Leave the DJ booth with style...stagedive tho' init!";

    generalCommands.mystats = ( { data, userFunctions, chatFunctions } ) => { userFunctions.readSingleUserStatus( data, chatFunctions ) }
    generalCommands.mystats.help = "What info does the Bot currently hold about you...handy for knowing how much time you've been wasting on here today!";

    generalCommands.theme = ( { data, roomFunctions, chatFunctions } ) => { roomFunctions.readTheme( data, chatFunctions ) }
    generalCommands.theme.help = "Tells you what the current teme is, if there is one";

    // #############################################
    // General user Queue commands
    // #############################################

    userQueueCommands.q = ( { data, userFunctions, chatFunctions } ) => { userFunctions.readQueue( data, chatFunctions ); }
    userQueueCommands.q.help = "Tells you who's in the queue";

    userQueueCommands.addme = ( { data, userFunctions, chatFunctions } ) => { userFunctions.addme( data, chatFunctions ); }
    userQueueCommands.addme.help = "Join the queue for the decks";

    userQueueCommands.removeme = ( { data, userFunctions, chatFunctions, botFunctions } ) => { userFunctions.removeme( data, chatFunctions, botFunctions ); }
    userQueueCommands.removeme.help = "Remove yourself from the queue";

    userQueueCommands.position = ( { data, userFunctions, chatFunctions } ) => { userFunctions.whatsMyQueuePosition( data, chatFunctions ); }
    userQueueCommands.position.help = "Tells a user where they are in the queue";

    // #############################################
    // Chat commands...make the bot post silly stuff
    // #############################################

    chatCommands.props = ( { data, userFunctions, chatFunctions } ) => { chatFunctions.pictureMessageTheDJ( data, chatCommandItems.propsMessages, chatCommandItems.propsPics, userFunctions ); }
    chatCommands.props.help = "congratulate the current DJ on playing an absolute banger";

    chatCommands.shade = ( { data, userFunctions, chatFunctions } ) => { chatFunctions.textMessageTheDJ( data, chatCommandItems.shadeMessages, userFunctions ); }
    chatCommands.shade.help = "lovingly, and randomly, diss the DJ ;-)";

    chatCommands.cheers = ( { data, userFunctions, chatFunctions } ) => { chatFunctions.pictureMessageTheDJ( data, chatCommandItems.cheersMessages, chatCommandItems.cheersPics, userFunctions ); }
    chatCommands.cheers.help = "raise a glass";

    chatCommands.dance = ( { data, userFunctions, chatFunctions } ) => { chatFunctions.pictureMessageTheDJ( data, chatCommandItems.danceMessages, chatCommandItems.dancePics, userFunctions ); }
    chatCommands.dance.help = "w00t!";

    chatCommands.frankie = ( { data, userFunctions, chatFunctions } ) => { chatFunctions.textMessageTheDJ( data, chatCommandItems.frankieMessages, userFunctions ); }
    chatCommands.frankie.help = "what does Frankie say?";

    chatCommands.hair = ( { data, userFunctions, chatFunctions } ) => { chatFunctions.pictureMessageTheDJ( data, chatCommandItems.hairMessages, chatCommandItems.hairPics, userFunctions ); }
    chatCommands.hair.help = "80s hair time";

    chatCommands.eddie = ( { data, userFunctions, chatFunctions } ) => { chatFunctions.pictureMessageTheDJ( data, chatCommandItems.eddieMessages, chatCommandItems.eddiePics, userFunctions ); }
    chatCommands.eddie.help = "it's Eddie Murphy time!";

    chatCommands.lonely = ( { data, userFunctions, chatFunctions } ) => { chatFunctions.textMessageTheDJ( data, chatCommandItems.lonelyMessages, userFunctions ); }
    chatCommands.lonely.help = "we all feel lonely sometimes...";

    chatCommands.suggestions = ( { data, userFunctions, chatFunctions } ) => { chatFunctions.textMessageTheDJ( data, chatCommandItems.suggestionsMessages, userFunctions ); }
    chatCommands.suggestions.help = "find out how to make suggestions";

    chatCommands.rules = ( { data, userFunctions, chatFunctions } ) => { chatFunctions.textMessageTheDJ( data, chatCommandItems.rulesMessages, userFunctions ); }
    chatCommands.rules.help = "get a link to the room rules";

    chatCommands.wc = ( { data, userFunctions, chatFunctions } ) => { chatFunctions.pictureMessageTheDJ( data, chatCommandItems.wcMessages, chatCommandItems.wcPics, userFunctions ); }
    chatCommands.wc.help = "how do you Wang Chung?";

    chatCommands.jump = ( { data, userFunctions, chatFunctions } ) => { chatFunctions.pictureMessageTheDJ( data, chatCommandItems.jumpMessages, chatCommandItems.jumpPics, userFunctions ); }
    chatCommands.jump.help = "Van Halen Rulez!";

    chatCommands.flirt = ( { data, userFunctions, chatFunctions } ) => { chatFunctions.pictureMessageTheDJ( data, chatCommandItems.flirtMessages, chatCommandItems.flirtPics, userFunctions ); }
    chatCommands.flirt.help = "you know...";

    chatCommands.rub = ( { data, userFunctions, chatFunctions } ) => { chatFunctions.textMessageTheDJ( data, chatCommandItems.rubMessages, userFunctions ); }
    chatCommands.rub.help = "is Buffalo Bill in?!?";

    chatCommands.alice = ( { data, userFunctions, chatFunctions } ) => { chatFunctions.pictureMessageTheDJ( data, chatCommandItems.aliceMessages, chatCommandItems.alicePics, userFunctions ); }
    chatCommands.alice.help = "are you? No, you're not...";

    chatCommands.feart = ( { data, userFunctions, chatFunctions } ) => { chatFunctions.textMessageTheDJ( data, chatCommandItems.feartMessages, userFunctions ); }
    chatCommands.feart.help = "there's some snagging going on in here";

    chatCommands.beer = ( { data, userFunctions, chatFunctions } ) => { chatFunctions.pictureMessageTheDJ( data, chatCommandItems.beerMessages, chatCommandItems.beerPics, userFunctions ); }
    chatCommands.beer.help = "it's 5 o'clock somewhere, right?";

    chatCommands.surf = ( { data, userFunctions, chatFunctions } ) => { chatFunctions.pictureMessageTheDJ( data, chatCommandItems.surfMessages, chatCommandItems.surfPics, userFunctions ); }
    chatCommands.surf.help = "Hang 10 dudes!";

    chatCommands.hello = ( { data, userFunctions, chatFunctions } ) => { chatFunctions.textMessageTheDJ( data, chatCommandItems.helloMessages, userFunctions ); }
    chatCommands.hello.help = "just saying hello...probably testing the bot tho' init";

    chatCommands.macho = ( { data, userFunctions, chatFunctions } ) => { chatFunctions.pictureMessageTheDJ( data, chatCommandItems.machoMessages, chatCommandItems.machoPics, userFunctions ); }
    chatCommands.macho.help = "Randy Savage!!!";

    chatCommands.ferris = ( { data, userFunctions, chatFunctions } ) => { chatFunctions.pictureMessageTheDJ( data, chatCommandItems.ferrisMessages, chatCommandItems.ferrisPics, userFunctions ); }
    chatCommands.ferris.help = "Bueller? Bueller? Bueller?";

    chatCommands.lighter = ( { data, userFunctions, chatFunctions } ) => { chatFunctions.pictureMessageTheDJ( data, chatCommandItems.lighterMessages, chatCommandItems.lighterPics, userFunctions ); }
    chatCommands.lighter.help = "One for the ballads...";

    chatCommands.couplesskate = ( { data, userFunctions, chatFunctions } ) => { chatFunctions.pictureMessageTheDJ( data, chatCommandItems.couplesSkateMessages, chatCommandItems.couplesSkatePics, userFunctions ); }
    chatCommands.couplesskate.help = "Time for a slow dance?";

    chatCommands.noice = ( { data, userFunctions, chatFunctions } ) => { chatFunctions.pictureMessageTheDJ( data, chatCommandItems.noiceMessages, chatCommandItems.noicePics, userFunctions ); }
    chatCommands.noice.help = "very nice...";

    chatCommands.shimmy = ( { data, userFunctions, chatFunctions } ) => { chatFunctions.pictureMessageTheDJ( data, chatCommandItems.shimmyMessages, chatCommandItems.shimmyPics, userFunctions ); }
    chatCommands.shimmy.help = "Pat Benatar time";

    chatCommands.metal = ( { data, userFunctions, chatFunctions } ) => { chatFunctions.pictureMessageTheDJ( data, chatCommandItems.metalMessages, chatCommandItems.metalPics, userFunctions ); }
    chatCommands.metal.help = ":metal: ";

    chatCommands.birthday = ( { data, userFunctions, chatFunctions } ) => { chatFunctions.pictureMessageTheDJ( data, chatCommandItems.birthdayMessages, chatCommandItems.birthdayPics, userFunctions ); }
    chatCommands.birthday.help = "Happy Birthday!!!";

    chatCommands.tumbleweed = ( { data, userFunctions, chatFunctions } ) => { chatFunctions.pictureMessageTheDJ( data, chatCommandItems.tumbleweedMessages, chatCommandItems.tumbleweedPics, userFunctions ); }
    chatCommands.tumbleweed.help = "..........";

    chatCommands.klaus = ( { data, userFunctions, chatFunctions } ) => { chatFunctions.pictureMessageTheDJ( data, chatCommandItems.klausMessages, chatCommandItems.klausPics, userFunctions ); }
    chatCommands.klaus.help = "It's Klaus Nomi...what more is there to know? ;-)";

    chatCommands.carefulnow = ( { data, userFunctions, chatFunctions } ) => { chatFunctions.pictureMessageTheDJ( data, chatCommandItems.carefulNowMessages, chatCommandItems.carefulNowPics, userFunctions ); }
    chatCommands.carefulnow.help = "Woah there...careful";

    chatCommands.martika = ( { data, chatFunctions } ) => { chatFunctions.multilineChatCommand( data, chatCommandItems.martikaMessages, chatCommandItems.martikaPics ); }
    chatCommands.martika.help = "M A R T I K A";

    chatCommands.monkey = ( { data, chatFunctions } ) => { chatFunctions.multilineChatCommand( data, chatCommandItems.monkeyMessages, chatCommandItems.monkeyPics ); }
    chatCommands.monkey.help = "Schock den Affen!";

    chatCommands.mindblown = ( { data, userFunctions, chatFunctions } ) => { chatFunctions.pictureMessageTheDJ( data, chatCommandItems.mindBlownMessages, chatCommandItems.mindBlownPics, userFunctions ); }
    chatCommands.mindblown.help = "Huh?!? I didn't know that!";

    chatCommands.rush = ( { data, userFunctions, chatFunctions } ) => { chatFunctions.pictureMessageTheDJ( data, chatCommandItems.rushMessages, chatCommandItems.rushPics, userFunctions ); }
    chatCommands.rush.help = "Celebrate the Rush ;-)";

    chatCommands.bow = ( { data, userFunctions, chatFunctions } ) => { chatFunctions.pictureMessageTheDJ( data, chatCommandItems.bowMessages, chatCommandItems.bowPics, userFunctions ); }
    chatCommands.bow.help = "Celebrate the Rush ;-)";

    chatCommands.cheese = ( { data, userFunctions, chatFunctions } ) => { chatFunctions.pictureMessageTheDJ( data, chatCommandItems.cheeseMessages, chatCommandItems.cheesePics, userFunctions ); }
    chatCommands.cheese.help = "You want cheese, you got cheese!";

    chatCommands.twofer = ( { data, userFunctions, chatFunctions } ) => { chatFunctions.pictureMessageTheDJ( data, chatCommandItems.twoferMessages, chatCommandItems.twoferPics, userFunctions ); }
    chatCommands.twofer.help = "You played another one?";

    chatCommands.goth = ( { data, userFunctions, chatFunctions } ) => { chatFunctions.pictureMessageTheDJ( data, chatCommandItems.gothMessages, chatCommandItems.gothPics, userFunctions ); }
    chatCommands.goth.help = "The sunlight, it burns!";

    chatCommands.drama = ( { data, userFunctions, chatFunctions } ) => { chatFunctions.pictureMessageTheDJ( data, chatCommandItems.dramaMessages, chatCommandItems.dramaPics, userFunctions ); }
    chatCommands.drama.help = "Just sit back and watch the fun";

    chatCommands.nope = ( { data, userFunctions, chatFunctions } ) => { chatFunctions.pictureMessageTheDJ( data, chatCommandItems.nopeMessages, chatCommandItems.nopePics, userFunctions ); }
    chatCommands.nope.help = "Nope nope nope!";

    chatCommands.thirtyk = ( { data, userFunctions, chatFunctions } ) => { chatFunctions.pictureMessageTheDJ( data, chatCommandItems.thirtyKMessages, chatCommandItems.thirtyKPics, userFunctions ); }
    chatCommands.thirtyk.help = "30k point celebration";

    chatCommands.yacht = ( { data, userFunctions, chatFunctions } ) => { chatFunctions.pictureMessageTheDJ( data, chatCommandItems.yachtMessages, chatCommandItems.yachtPics, userFunctions ); }
    chatCommands.yacht.help = "because not all rock is hard";

    chatCommands.sax = ( { data, userFunctions, chatFunctions } ) => { chatFunctions.pictureMessageTheDJ( data, chatCommandItems.saxMessages, chatCommandItems.saxPics, userFunctions ); }
    chatCommands.sax.help = "I'm A SAX MAN!!";

    chatCommands.zod = ( { data, userFunctions, chatFunctions } ) => { chatFunctions.pictureMessageTheDJ( data, chatCommandItems.zodMessages, chatCommandItems.zodPics, userFunctions ); }
    chatCommands.zod.help = "Bro, do you even General Zod?";

    chatCommands.micdrop = ( { data, userFunctions, chatFunctions } ) => { chatFunctions.pictureMessageTheDJ( data, chatCommandItems.micDropMessages, chatCommandItems.micDropPics, userFunctions ); }
    chatCommands.micdrop.help = "End of...";

    // ######################################################
    // Advanced chat commands...more than just basic messages
    // ######################################################

    chatCommands.coinflip = ( { data, userFunctions, chatFunctions } ) => { chatFunctions.coinflip( data, userFunctions ); }
    chatCommands.coinflip.help = "Flip a coin and return heads or tails?";

    chatCommands.dice = ( { data, args, userFunctions, chatFunctions } ) => { chatFunctions.dice( data, args, userFunctions ); }
    chatCommands.dice.argumentCount = 2;
    chatCommands.dice.help = "Roll some dice";
    chatCommands.dice.sampleArguments = [ "1", "d20" ]

    chatCommands.listalias = ( { data, chatFunctions } ) => { listAlias( data, chatFunctions ); }
    chatCommands.listalias.argumentCount = 1;
    chatCommands.listalias.help = "List aliases for a command";
    chatCommands.listalias.sampleArguments = [ "alias" ];

    // #############################################
    // Bot control commands
    // #############################################

    botCommands.uptime = ( { data, botFunctions, userFunctions, chatFunctions } ) => { botFunctions.reportUptime( data, userFunctions, chatFunctions ); }
    botCommands.uptime.help = "Tells you how long the bot has been running for";

    botCommands.playlist = ( { data, chatFunctions } ) => { chatFunctions.readPlaylistStats( data ); }
    botCommands.playlist.help = "Tells you how many songs are in the Bot playlist";

    // #############################################
    // User commands
    // #############################################

    userCommands.afk = ( { data, userFunctions, chatFunctions } ) => { userFunctions.switchUserAFK( data, chatFunctions ); }
    userCommands.afk.help = "Switches the senders AFK state";

    userCommands.whosafk = ( { data, userFunctions, chatFunctions } ) => { userFunctions.whosAFK( data, chatFunctions ); }
    userCommands.whosafk.help = "Tells you which users have enabled AFK";

    // #############################################
    // Moderator Only commands
    // #############################################

    moderatorCommands.randomiseplaylist = ( { songFunctions } ) => { songFunctions.randomisePlaylist() }
    moderatorCommands.randomiseplaylist.help = () => { }

    moderatorCommands.autodj = () => { bot.addDj(); }
    moderatorCommands.autodj.help = "Starts the Bot DJing";

    moderatorCommands.lengthlimit = ( { data, args, songFunctions, chatFunctions } ) => { songFunctions.switchLengthLimit( data, args, chatFunctions ) }
    moderatorCommands.lengthlimit.argumentCount = 1;
    moderatorCommands.lengthlimit.help = "Switch the song length limit on or off. Sent with a number it changes the limit";
    moderatorCommands.lengthlimit.sampleArguments = [ "20" ];

    moderatorCommands.userstatus = ( { data, args, userFunctions, chatFunctions } ) => { userFunctions.readUserStatus( data, args, chatFunctions ) }
    moderatorCommands.userstatus.argumentCount = 1;
    moderatorCommands.userstatus.help = "Read out the activity summary of a specified user";
    moderatorCommands.userstatus.sampleArguments = [ "Jodrell" ];

    moderatorCommands.playlimiton = ( { data, args, userFunctions, chatFunctions } ) => { userFunctions.playLimitOnCommand( data, args, chatFunctions ) }
    moderatorCommands.playlimiton.argumentCount = 1;
    moderatorCommands.playlimiton.help = "Enable the DJ play limits";
    moderatorCommands.playlimiton.sampleArguments = [ "10" ];

    moderatorCommands.playlimitoff = ( { data, userFunctions, chatFunctions } ) => { userFunctions.playLimitOffCommand( data, chatFunctions ) }
    moderatorCommands.playlimitoff.help = "Disable the DJ play limits";

    moderatorCommands.songstats = ( { data, botFunctions, chatFunctions } ) => { botFunctions.songStatsCommand( data, chatFunctions ) }
    moderatorCommands.songstats.help = "Switch the readout of the song stats on or off";

    moderatorCommands.autodj = ( { data, botFunctions, chatFunctions } ) => { botFunctions.autoDJCommand( data, chatFunctions ) }
    moderatorCommands.autodj.help = "Enables or Disables the auto DJing function";

    moderatorCommands.autodjstart = ( { data, args, botFunctions, chatFunctions } ) => { botFunctions.setWhenToGetOnStage( data, args, chatFunctions ) }
    moderatorCommands.autodjstart.help = "Set the number of DJs that need to be on stage for the Bot to start DJing";

    moderatorCommands.autodjstop = ( { data, args, botFunctions, chatFunctions } ) => { botFunctions.setWhenToGetOffStage( data, args, chatFunctions ) }
    moderatorCommands.autodjstop.help = "Set the number of DJs that need to be on stage for the Bot to stop DJing";

    moderatorCommands.removeidledjs = ( { data, userFunctions, botFunctions, chatFunctions } ) => { botFunctions.removeIdleDJsCommand( data, userFunctions, chatFunctions ) }
    moderatorCommands.removeidledjs.help = "Enable/Disable the auto removal of DJs who've idled out";

    moderatorCommands.idlewarning1 = ( { data, args, userFunctions, chatFunctions } ) => { userFunctions.setIdleFirstWarningTime( data, args, chatFunctions ) }
    moderatorCommands.idlewarning1.help = "Time in minutes for the first Idle warning to be sent";

    moderatorCommands.idlewarning2 = ( { data, args, userFunctions, chatFunctions } ) => { userFunctions.setIdleSecondWarningTime( data, args, chatFunctions ) }
    moderatorCommands.idlewarning2.help = "Time in minutes for the first Idle warning to be sent";

    moderatorCommands.parsevideo = ( { data, args, videoFunctions, userFunctions, chatFunctions, botFunctions } ) => { videoFunctions.checkVideoRegionAlert( data, args, userFunctions, chatFunctions, botFunctions ) }
    moderatorCommands.parsevideo.help = "Test the video region checker";

    moderatorCommands.addalertregion = ( { data, args, videoFunctions, chatFunctions, botFunctions } ) => { botFunctions.addAlertRegionCommand( data, args, videoFunctions, chatFunctions ) }
    moderatorCommands.addalertregion.argumentCount = 1;
    moderatorCommands.addalertregion.help = "Add a new region to the list of places that DJs will be alerted about if their video is blocked from";
    moderatorCommands.addalertregion.sampleArguments = [ "CA" ];

    moderatorCommands.removealertregion = ( { data, args, videoFunctions, chatFunctions, botFunctions } ) => { botFunctions.removeAlertRegionCommand( data, args, videoFunctions, chatFunctions ) }
    moderatorCommands.removealertregion.argumentCount = 1;
    moderatorCommands.removealertregion.help = "Remove a region from the list of places that DJs will be alerted about if their video is blocked from";
    moderatorCommands.removealertregion.sampleArguments = [ "CA" ];

    moderatorCommands.checkvideoregions = ( { data, botFunctions, chatFunctions, videoFunctions } ) => { botFunctions.checkVideoRegionsCommand( data, videoFunctions, chatFunctions ); }
    moderatorCommands.checkvideoregions.help = "Switch the region alerts on/off";

    moderatorCommands.m = ( { data, args, chatFunctions } ) => { chatFunctions.ventriloquistCommand( data, args ); }
    moderatorCommands.m.help = "Make your Bot say whatever you want it to!";

    moderatorCommands.refreshon = ( { data, botFunctions, chatFunctions } ) => { botFunctions.refreshOnCommand( data, chatFunctions ); }
    moderatorCommands.refreshon.help = "Enable the " + chatDefaults.commandIdentifier + "refresh command";

    moderatorCommands.refreshoff = ( { data, botFunctions, chatFunctions } ) => { botFunctions.refreshOffCommand( data, chatFunctions ); }
    moderatorCommands.refreshoff.help = "Disable the " + chatDefaults.commandIdentifier + "refresh command";

    moderatorCommands.whosrefreshing = ( { data, userFunctions, chatFunctions } ) => { userFunctions.whosRefreshingCommand( data, chatFunctions ); }
    moderatorCommands.whosrefreshing.help = "List of users currently using the refresh command";

    moderatorCommands.sarahconner = ( { data, args, botFunctions, userFunctions, chatFunctions } ) => { botFunctions.sarahConner( data, reassembleArgs( args ), userFunctions, chatFunctions ); }
    moderatorCommands.sarahconner.argumentCount = 1;
    moderatorCommands.sarahconner.help = "Shut down the Bot if it's causing problems";
    moderatorCommands.sarahconner.sampleArguments = [ "He started booting everyone!" ];

    moderatorCommands.removedj = ( { data, args, botFunctions, userFunctions, chatFunctions } ) => { botFunctions.removeDJCommand( data, reassembleArgs( args ), userFunctions, chatFunctions ); }
    moderatorCommands.removedj.help = "Remove the current DJ from the decks. Add a message after the command to have it sent direct to the DJ (in public)";

    moderatorCommands.informdj = ( { data, args, botFunctions, userFunctions, chatFunctions } ) => { botFunctions.informDJCommand( data, reassembleArgs( args ), userFunctions, chatFunctions ); }
    moderatorCommands.informdj.help = "Have the Bot send the current DJ a message";

    moderatorCommands.awesome = ( { botFunctions } ) => { botFunctions.awesomeCommand(); }
    moderatorCommands.awesome.help = "Have the Bot upvote";

    moderatorCommands.lame = ( { botFunctions } ) => { botFunctions.lameCommand(); }
    moderatorCommands.lame.help = "Have the Bot downvote";

    moderatorCommands.alias = ( { data, chatFunctions } ) => { addAlias( data, chatFunctions ); }
    moderatorCommands.alias.argumentCount = 2;
    moderatorCommands.alias.help = "Add or edit an alias command, will repoint an alias to a different command if it already exists";
    moderatorCommands.alias.sampleArguments = [ "alias", "command" ];

    moderatorCommands.removealias = ( { data, chatFunctions } ) => { removeAlias( data, chatFunctions ); }
    moderatorCommands.removealias.argumentCount = 2;
    moderatorCommands.removealias.help = "Remove an alias from a command";
    moderatorCommands.removealias.sampleArguments = [ "alias", "command" ];

    // #############################################
    // Moderator Greeting commands
    // #############################################

    moderatorWelcomeCommands.greeton = ( { data, chatFunctions, roomFunctions } ) => { roomFunctions.greetOnCommand( data, chatFunctions ); }
    moderatorWelcomeCommands.greeton.help = "Enable user greetings";

    moderatorWelcomeCommands.greetoff = ( { data, chatFunctions, roomFunctions } ) => { roomFunctions.greetOffCommand( data, chatFunctions ); }
    moderatorWelcomeCommands.greetoff.help = "Disable user greetings";

    moderatorWelcomeCommands.settheme = ( { data, args, chatFunctions, roomFunctions } ) => { roomFunctions.setThemeCommand( data, reassembleArgs( args ), chatFunctions ); }
    moderatorWelcomeCommands.settheme.help = "Set a theme for the room";

    moderatorWelcomeCommands.notheme = ( { data, chatFunctions, roomFunctions } ) => { roomFunctions.removeThemeCommand( data, chatFunctions ); }
    moderatorWelcomeCommands.notheme.help = "Set a theme for the room";

    moderatorWelcomeCommands.enablerules = ( { data, chatFunctions, roomFunctions } ) => { roomFunctions.enableRulesMessageCommand( data, chatFunctions ); }
    moderatorWelcomeCommands.enablerules.help = "Have the room rules etc read out with the room greeting";

    moderatorWelcomeCommands.disablerules = ( { data, chatFunctions, roomFunctions } ) => { roomFunctions.disableRulesMessageCommand( data, chatFunctions ); }
    moderatorWelcomeCommands.disablerules.help = "Stop the room rules being read out with the room greeting";

    moderatorWelcomeCommands.rulesinterval = ( { data, args, chatFunctions, roomFunctions } ) => { roomFunctions.setRulesIntervalCommand( data, args, chatFunctions ); }
    moderatorWelcomeCommands.rulesinterval.argumentCount = 1;
    moderatorWelcomeCommands.rulesinterval.help = "Set the interval, in minutes, for how often the room rules will be read out with the room greeting";
    moderatorWelcomeCommands.rulesinterval.sampleArguments = [ 15 ];

    // #############################################
    // Moderator Only Queue commands
    // #############################################

    moderatorQueueCommands.move = ( { data, args, userFunctions, chatFunctions } ) => { userFunctions.changeUsersQueuePosition( data, args, chatFunctions ) };
    moderatorQueueCommands.move.argumentCount = 2;
    moderatorQueueCommands.move.help = "Change a users position in the queue";
    moderatorQueueCommands.move.sampleArguments = [ 'jodrell', 1 ];

    moderatorQueueCommands.bumptop = ( { data, args, userFunctions, chatFunctions, botFunctions } ) => { userFunctions.moveUserToHeadOfQueue( data, args, chatFunctions, botFunctions ) };
    moderatorQueueCommands.bumptop.argumentCount = 1;
    moderatorQueueCommands.bumptop.help = "Move a user to the head of the queue";
    moderatorQueueCommands.bumptop.sampleArguments = [ 'jodrell' ];

    moderatorQueueCommands.queueon = ( { data, userFunctions, chatFunctions } ) => { userFunctions.enableQueue( data, chatFunctions ) }
    moderatorQueueCommands.queueon.help = "Enables the queue";

    moderatorQueueCommands.queueoff = ( { data, userFunctions, chatFunctions } ) => { userFunctions.disableQueue( data, chatFunctions ) }
    moderatorQueueCommands.queueoff.help = "Disables the queue";

    moderatorQueueCommands.setdjplaycount = ( { data, args, userFunctions, chatFunctions } ) => { userFunctions.setDJCurrentPlaycountCommand( data, args[ 0 ], reassembleArgs( args, 1 ), chatFunctions ) }
    moderatorQueueCommands.setdjplaycount.argumentCount = 2;
    moderatorQueueCommands.setdjplaycount.help = "Sets a DJs current playcount. This will let you give a DJ extra plays, or fewer, if the playLimit is set";
    moderatorQueueCommands.setdjplaycount.sampleArguments = [ 2, 'jodrell' ];

    // #############################
    // end of fully checked commands
    // #############################

    const allModeratorCommands = {
        ...moderatorCommands,
        ...moderatorWelcomeCommands,
        ...moderatorQueueCommands
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

    function listCommands ( data, commandGroup, chatFunctions ) {
        let theCommand = commandGroup[ 0 ];
        let theMessage;

        switch ( theCommand ) {
            case "generalCommands":
                theMessage = "The General Commands are " + buildListFromObject( Object.keys( allGeneralCommands ) );
                break;
            case "modCommands":
                theMessage = "The Moderator Commands are " + buildListFromObject( Object.keys( moderatorCommands ) );
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
                theMessage = 'Top level command groups are: generalCommands, chatCommands, queueCommands, botCommands, userCommands, modCommands, modWelcomeCommands, modQueueCommands. Please use ' + chatDefaults.commandIdentifier + 'list [commandGroup] for the individual commands';
                break;
        }

        theMessage = theMessage.replace( ',', ', ' );
        chatFunctions.botSpeak( theMessage, data );
    }

    function buildListFromObject ( commandObject ) {
        let theList = '';
        for ( let i in commandObject ) {
            theList += chatDefaults.commandIdentifier + commandObject[ i ] + ", ";
        }
        return theList.substring( 0, theList.length - 2 );
    }

    function displayHelp ( data, command, chatFunctions ) {
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

    function reassembleArgs ( args, startFrom ) {
        let theString = '';
        if ( startFrom === undefined ) { startFrom = 0; }
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

            // check if this was a command
            const commandString = "^" + chatDefaults.commandIdentifier;
            if ( text.match( commandString ) ) {
                return true;
            }
        },

        getCommandAndArguments: function ( text, allCommands ) {
            const [ sentCommand, ...args ] = text.split( " " );

            let theCommand = sentCommand.substring( 1, sentCommand.length )
            theCommand = theCommand.toLowerCase();

            // Check if command exists
            let commandObj = allCommands[ theCommand ];

            // Command doesn't exist, check aliases
            if ( !commandObj ) {
                const aliasCommand = checkForAlias( sentCommand );
                commandObj = allCommands[ aliasCommand ];
            }

            if ( commandObj ) {
                const moderatorOnly = !!moderatorCommands[ theCommand ];
                return [ commandObj, args, moderatorOnly ];
            } else {
                return [ null, null ];
            }
        },

        parseCommands: function ( data, userFunctions, botFunctions, roomFunctions, songFunctions, chatFunctions, videoFunctions ) {
            const senderID = data.userid;
            const [ command, args, moderatorOnly ] = this.getCommandAndArguments( data.text, allCommands );
            if ( moderatorOnly && !userFunctions.isUserModerator( senderID ) ) {
                chatFunctions.botSpeak( "Sorry, that function is only available to moderators", data );
            } else if ( command ) {
                command.call( null, { data, args, userFunctions, botFunctions, roomFunctions, songFunctions, chatFunctions, videoFunctions } );
            } else {
                chatFunctions.botSpeak( "Sorry, that's not a command I recognise. Try " + chatDefaults.commandIdentifier + "list to find out more.", data );
            }
        },
    }
}

const checkForAlias = ( theCommand ) => {
    const strippedCommand = theCommand.substr( 1, theCommand.length - 1 ).toLowerCase();

    const dataFilePath = `${ dirname( require.main.filename ) }/data/aliases.json`;
    const store = new Storage( dataFilePath );

    const theAliases = store.get( 'aliases' );

    let findAlias = theAliases[ strippedCommand ];
    return findAlias ? findAlias.command : undefined;
}

const listAlias = ( data, chatFunctions ) => {
    const dataFilePath = `${ dirname( require.main.filename ) }/data/${ this.aliasDataFileName }`;
    const store = new Storage( dataFilePath );

    const strippedCommand = data.text.slice( 1 ).toLowerCase().split( " " );
    const alias = checkForAlias( `/${ strippedCommand[ 1 ] }` );

    const aliasLookup = alias ? `commands.${ alias }` : `commands.${ strippedCommand[ 1 ] }`;

    const aliases = store.get( aliasLookup );

    chatFunctions.botSpeak( getAliasReturnText( aliases, alias, strippedCommand[ 1 ] ), data );
}

const getAliasReturnText = ( aliases, alias, command ) => {
    let returnText;

    if ( alias ) {
        returnText = `${ command } is an alias for the command /${ alias }`;

        if ( aliases?.length > 1 ) {
            returnText += ` which has the following aliases /${ aliases.join( ` and /` ) }`;
        }
    }
    else {
        returnText = `The command /${ command } has no aliases`;

        if ( aliases?.length ) {
            returnText = `The command /${ command } now has aliases /${ aliases.join( ` and /` ) }`;
        }
    }

    return returnText;
}

const addAlias = ( data, chatFunctions ) => {
    const dataFilePath = `${ dirname( require.main.filename ) }/data/${ this.aliasDataFileName }`;
    const store = new Storage( dataFilePath );

    const strippedCommand = data.text.slice( 1 ).toLowerCase().split( " " );

    store.put( `aliases.${ strippedCommand[ 1 ] }`, { command: strippedCommand[ 2 ] } );

    let newCommandWithAlias = [ strippedCommand[ 1 ] ];

    let commandList = store.get( `commands.${ strippedCommand[ 2 ] }` );

    if ( commandList ) {
        commandList.push( strippedCommand[ 1 ] );
        newCommandWithAlias = commandList;
    }

    store.put( `commands.${ strippedCommand[ 2 ] }`, newCommandWithAlias );

    chatFunctions.botSpeak( "Update successful.", data );
}

const removeAlias = ( data, chatFunctions ) => {
    const dataFilePath = `${ dirname( require.main.filename ) }/data/${ this.aliasDataFileName }`;
    const store = new Storage( dataFilePath );

    const strippedCommand = data.text.slice( 1 ).toLowerCase().split( " " );

    const aliasBeingRemoved = checkForAlias( `/${ strippedCommand[ 1 ] }` );

    store.remove( `aliases.${ strippedCommand[ 1 ] }` );

    let commandList = store.get( `commands.${ aliasBeingRemoved }` );

    if ( commandList ) {
        var updatedCommandList = commandList.filter( function ( value, index, arr ) {
            return value !== strippedCommand[ 1 ];
        } );

        store.put( `commands.${ aliasBeingRemoved }`, updatedCommandList );
    }

    chatFunctions.botSpeak( "Alias removed.", data );
}

module.exports = commandFunctions;
