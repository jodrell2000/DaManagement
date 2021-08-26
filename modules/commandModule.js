let authModule = require( '../auth.js' );
let botDefaults = require( '../defaultSettings/botDefaults.js' );
let roomDefaults = require( '../defaultSettings/roomDefaults.js' );
let musicDefaults = require( '../defaultSettings/musicDefaults.js' );
let chatDefaults = require( '../defaultSettings/chatDefaults.js' );
let chatCommandItems = require( '../defaultSettings/chatCommandItems.js' );
const botFunctions = require( './botModule.js' );


const generalCommands = {};
const moderatorCommands = {};
const botCommands = {};
const chatCommands = {};
const userCommands = {};
const userQueueCommands = {};
const moderatorQueueCommands = {};

const commandFunctions = ( bot ) => {
    function logMe ( logLevel, message ) {
        if ( logLevel === 'error' || logLevel === 'info' ) {
            console.log( "commandFunctions:" + logLevel + "->" + message + "\n" );
        } else {
            if ( bot.debug ) {
                console.log( "commandFunctions:" + logLevel + "->" + message + "\n" );
            }
        }
    }

    // #############################################
    // These comamnds are confirmed as fully working
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

    generalCommands.whatsPlayLimit = ( { data, userFunctions, chatFunctions } ) => { userFunctions.whatsPlayLimit( data, chatFunctions ); }
    generalCommands.whatsPlayLimit.help = "Is the DJ Play Limit enabled, and if so what it's set to";

    generalCommands.refresh = ( { data, botFunctions, userFunctions, chatFunctions } ) => { userFunctions.refreshCommand( data, chatFunctions, botFunctions ); }
    generalCommands.refresh.help = "Hold your spot on stage for one minute if you need to refresh your browser";

    generalCommands.regionAlerts = ( { data, botFunctions, videoFunctions, chatFunctions } ) => { botFunctions.reportRegionCheckStatus( data, videoFunctions, chatFunctions ); }
    generalCommands.regionAlerts.help = "Show the list of regions that DJs are alerted about ";

    generalCommands.roomStatus = ( { data, botFunctions, chatFunctions, userFunctions, videoFunctions } ) => { botFunctions.reportRoomStatus( data, chatFunctions, userFunctions, videoFunctions ); }
    generalCommands.roomStatus.help = "Show the list of regions that DJs are alerted about ";

    generalCommands.dive = ( { data, botFunctions, chatFunctions, userFunctions } ) => { botFunctions.stageDiveCommand( data, chatFunctions, userFunctions, chatCommandItems.stageDiveMessages ); }
    generalCommands.dive.help = "Leave the DJ booth with style...stagedive tho' init!";

    generalCommands.myStats = ( { data, userFunctions, chatFunctions } ) => { userFunctions.readSingleUserStatus( data, chatFunctions ) }
    generalCommands.myStats.help = "What info does the Bot currently hold about you...handy for knowing how much time you've been wasting on here today!";

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

    chatCommands.couplesSkate = ( { data, userFunctions, chatFunctions } ) => { chatFunctions.pictureMessageTheDJ( data, chatCommandItems.couplesSkateMessages, chatCommandItems.couplesSkatePics, userFunctions ); }
    chatCommands.couplesSkate.help = "Time for a slow dance?";

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

    chatCommands.carefulNow = ( { data, userFunctions, chatFunctions } ) => { chatFunctions.pictureMessageTheDJ( data, chatCommandItems.carefulNowMessages, chatCommandItems.carefulNowPics, userFunctions ); }
    chatCommands.carefulNow.help = "Woah there...careful";

    chatCommands.martika = ( { data, chatFunctions } ) => { chatFunctions.martikaCommand( data, chatCommandItems.martikaPics ); }
    chatCommands.martika.help = "M A R T I K A";

    chatCommands.mindBlown = ( { data, userFunctions, chatFunctions } ) => { chatFunctions.pictureMessageTheDJ( data, chatCommandItems.mindBlownMessages, chatCommandItems.mindBlownPics, userFunctions ); }
    chatCommands.mindBlown.help = "Huh?!? I didn't know that!";

    chatCommands.rush = ( { data, userFunctions, chatFunctions } ) => { chatFunctions.pictureMessageTheDJ( data, chatCommandItems.rushMessages, chatCommandItems.rushPics, userFunctions ); }
    chatCommands.rush.help = "Celebrate the Rush ;-)";

    chatCommands.bow = ( { data, userFunctions, chatFunctions } ) => { chatFunctions.pictureMessageTheDJ( data, chatCommandItems.bowMessages, chatCommandItems.bowPics, userFunctions ); }
    chatCommands.bow.help = "Celebrate the Rush ;-)";

    // ######################################################
    // Advanced chat commands...more than just basic messages
    // ######################################################

    chatCommands.coinflip = ( { data, userFunctions, chatFunctions } ) => { chatFunctions.coinflip( data, userFunctions ); }
    chatCommands.coinflip.help = "Flip a coin and return heads or tails?";

    chatCommands.dice = ( { data, args, userFunctions, chatFunctions } ) => { chatFunctions.dice( data, args, userFunctions ); }
    chatCommands.dice.argumentCount = 2;
    chatCommands.dice.help = "Roll some dice";
    chatCommands.dice.sampleArguments = [ "1", "d20" ]

    // #############################################
    // Bot control commands
    // #############################################

    botCommands.uptime = ( { data, botFunctions, userFunctions, chatFunctions } ) => { botFunctions.reportUptime( data, userFunctions, chatFunctions ); }
    botCommands.uptime.help = "Tells you how long the bot has been running for";

    botCommands.playlist = ( { data, chatFunctions } ) => { chatFunctions.readPlaylistStats( data ); }
    botCommands.playlist.help = "Tells you how many songs are in the Bot playlist";

    // #############################################
    // User comamnds
    // #############################################

    userCommands.afk = ( { data, userFunctions, chatFunctions } ) => { userFunctions.switchUserAFK( data, chatFunctions ); }
    userCommands.afk.help = "Switches the senders AFK state";

    userCommands.whosafk = ( { data, userFunctions, chatFunctions } ) => { userFunctions.whosAFK( data, chatFunctions ); }
    userCommands.whosafk.help = "Tells you which users have enabled AFK";

    // #############################################
    // Moderator Only comamnds
    // #############################################

    moderatorCommands.randomisePlaylist = ( { songFunctions } ) => { songFunctions.randomisePlaylist() }
    moderatorCommands.randomisePlaylist.help = () => { }

    moderatorCommands.autodj = () => { bot.addDj(); }
    moderatorCommands.autodj.help = "Starts the Bot DJing";

    moderatorCommands.lengthLimit = ( { data, args, songFunctions, chatFunctions } ) => { songFunctions.switchLengthLimit( data, args, chatFunctions ) }
    moderatorCommands.lengthLimit.argumentCount = 1;
    moderatorCommands.lengthLimit.help = "Switch the song length limit on or off. Sent with a number it changes the limit";
    moderatorCommands.lengthLimit.sampleArguments = [ "20" ];

    moderatorCommands.userStatus = ( { data, args, userFunctions, chatFunctions } ) => { userFunctions.readUserStatus( data, args, chatFunctions ) }
    moderatorCommands.userStatus.argumentCount = 1;
    moderatorCommands.userStatus.help = "Read out the activity summary of a specified user";
    moderatorCommands.userStatus.sampleArguments = [ "Jodrell" ];

    moderatorCommands.playLimitOn = ( { data, args, userFunctions, chatFunctions } ) => { userFunctions.playLimitOnCommand( data, args, chatFunctions ) }
    moderatorCommands.playLimitOn.argumentCount = 1;
    moderatorCommands.playLimitOn.help = "Enable the DJ play limits";
    moderatorCommands.playLimitOn.sampleArguments = [ "10" ];

    moderatorCommands.playLimitOff = ( { data, userFunctions, chatFunctions } ) => { userFunctions.playLimitOffCommand( data, chatFunctions ) }
    moderatorCommands.playLimitOff.help = "Disable the DJ play limits";

    moderatorCommands.songStats = ( { data, botFunctions, chatFunctions } ) => { botFunctions.songStatsCommand( data, chatFunctions ) }
    moderatorCommands.songStats.help = "Switch the readout of the song stats on or off";

    moderatorCommands.autoDJ = ( { data, botFunctions, chatFunctions } ) => { botFunctions.autoDJCommand( data, chatFunctions ) }
    moderatorCommands.autoDJ.help = "Enables or Disables the auto DJing function";

    moderatorCommands.autoDJStart = ( { data, args, botFunctions, chatFunctions } ) => { botFunctions.setWhenToGetOnStage( data, args, chatFunctions ) }
    moderatorCommands.autoDJStart.help = "Set the number of DJs that need to be on stage for the Bot to start DJing";

    moderatorCommands.autoDJStop = ( { data, args, botFunctions, chatFunctions } ) => { botFunctions.setWhenToGetOffStage( data, args, chatFunctions ) }
    moderatorCommands.autoDJStop.help = "Set the number of DJs that need to be on stage for the Bot to stop DJing";

    moderatorCommands.removeIdleDJs = ( { data, userFunctions, botFunctions, chatFunctions } ) => { botFunctions.removeIdleDJsCommand( data, userFunctions, chatFunctions ) }
    moderatorCommands.removeIdleDJs.help = "Enable/Disable the auto removal of DJs who've idled out";

    moderatorCommands.idleWarning1 = ( { data, args, userFunctions, chatFunctions } ) => { userFunctions.setIdleFirstWarningTime( data, args, chatFunctions ) }
    moderatorCommands.idleWarning1.help = "Time in minutes for the first Idle warning to be sent";

    moderatorCommands.idleWarning2 = ( { data, args, userFunctions, chatFunctions } ) => { userFunctions.setIdleSecondWarningTime( data, args, chatFunctions ) }
    moderatorCommands.idleWarning2.help = "Time in minutes for the first Idle warning to be sent";

    moderatorCommands.parseVideo = ( { data, args, videoFunctions, userFunctions, chatFunctions, botFunctions } ) => { videoFunctions.checkVideoRegionAlert( data, args, userFunctions, chatFunctions, botFunctions ) }
    moderatorCommands.parseVideo.help = "Test the video region checker";

    moderatorCommands.addAlertRegion = ( { data, args, videoFunctions, chatFunctions, botFunctions } ) => { botFunctions.addAlertRegionCommand( data, args, videoFunctions, chatFunctions ) }
    moderatorCommands.addAlertRegion.argumentCount = 1;
    moderatorCommands.addAlertRegion.help = "Add a new region to the list of places that DJs will be alerted about if their video is blocked from";
    moderatorCommands.addAlertRegion.sampleArguments = [ "CA" ];

    moderatorCommands.removeAlertRegion = ( { data, args, videoFunctions, chatFunctions, botFunctions } ) => { botFunctions.removeAlertRegionCommand( data, args, videoFunctions, chatFunctions ) }
    moderatorCommands.removeAlertRegion.argumentCount = 1;
    moderatorCommands.removeAlertRegion.help = "Remove a region from the list of places that DJs will be alerted about if their video is blocked from";
    moderatorCommands.removeAlertRegion.sampleArguments = [ "CA" ];

    moderatorCommands.checkVideoRegions = ( { data, botFunctions, chatFunctions, videoFunctions } ) => { botFunctions.checkVideoRegionsCommand( data, videoFunctions, chatFunctions ); }
    moderatorCommands.checkVideoRegions.help = "Switch the region alerts on/off";

    moderatorCommands.m = ( { data, args, chatFunctions } ) => { chatFunctions.ventriloquistCommand( data, args ); }
    moderatorCommands.m.help = "Make your Bot say whatever you want it to!";

    moderatorCommands.refreshOn = ( { data, botFunctions, chatFunctions } ) => { botFunctions.refreshOnCommand( data, chatFunctions ); }
    moderatorCommands.refreshOn.help = "Enable the " + chatDefaults.commandIdentifier + "refresh command";

    moderatorCommands.refreshOff = ( { data, botFunctions, chatFunctions } ) => { botFunctions.refreshOffCommand( data, chatFunctions ); }
    moderatorCommands.refreshOff.help = "Disable the " + chatDefaults.commandIdentifier + "refresh command";

    moderatorCommands.whosRefreshing = ( { data, userFunctions, chatFunctions } ) => { userFunctions.whosRefreshingCommand( data, chatFunctions ); }
    moderatorCommands.whosRefreshing.help = "List of users currently using the refresh command";

    moderatorCommands.sarahConner = ( { data, botFunctions, userFunctions, chatFunctions } ) => { botFunctions.sarahConner( data, userFunctions, chatFunctions ); }
    moderatorCommands.sarahConner.help = "Shut down the Bot if it's causing problems";

    moderatorCommands.removedj = ( { data, args, botFunctions, userFunctions, chatFunctions } ) => { botFunctions.removeDJCommand( data, reassembleArgs( args ), userFunctions, chatFunctions ); }
    moderatorCommands.removedj.help = "Remove the current DJ from the decks. Add a message after the command to have it sent direct to the DJ (in public)";

    moderatorCommands.informdj = ( { data, args, botFunctions, userFunctions, chatFunctions } ) => { botFunctions.informDJCommand( data, reassembleArgs( args ), userFunctions, chatFunctions ); }
    moderatorCommands.informdj.help = "Have the Bot send the current DJ a message";

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

    moderatorQueueCommands.queueOn = ( { data, userFunctions, chatFunctions } ) => { userFunctions.enableQueue( data, chatFunctions ) }
    moderatorQueueCommands.queueOn.help = "Enables the queue";

    moderatorQueueCommands.queueOff = ( { data, userFunctions, chatFunctions } ) => { userFunctions.disableQueue( data, chatFunctions ) }
    moderatorQueueCommands.queueOff.help = "Disables the queue";

    // #############################
    // end of fully checked commands
    // #############################

    const allModeratorCommands = {
        ...moderatorCommands,
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
        let theMessage = "";

        switch ( theCommand ) {
            case "generalCommands":
                theMessage = "The General Commands are " + buildListFromObject( Object.keys( allGeneralCommands ) );
                break;
            case "moderatorCommands":
                theMessage = "The Moderator Commands are " + buildListFromObject( Object.keys( allModeratorCommands ) );
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
                theMessage = 'Top level command groups are: generalCommands, moderatorCommands, botCommands, chatCommands, userCommands, queueCommands. Please use ' + chatDefaults.commandIdentifier + 'list [commandGroup] for the individual commands';
                break;
        }

        theMessage = theMessage.replace( ',', ', ' );
        chatFunctions.botSpeak( data, theMessage );
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
            chatFunctions.botSpeak( data, 'That command doesn\'t exist. Try ' + chatDefaults.commandIdentifier + 'list to find the available commands' );
        } else {
            theMessage = theMessage + "'" + chatDefaults.commandIdentifier + command;

            if ( allCommands[ command ].argumentCount !== undefined ) {
                for ( let argumentLoop = 0; argumentLoop < allCommands[ command ].argumentCount; argumentLoop++ ) {
                    theMessage = theMessage + ' ' + allCommands[ command ].sampleArguments[ argumentLoop ]
                }
            }
            theMessage = theMessage + "': " + allCommands[ command ].help;
            chatFunctions.botSpeak( data, theMessage );
        }
    }

    function reassembleArgs ( args ) {
        let theString = '';
        for ( let argLoop = 0; argLoop < args.length; argLoop++ ) {
            theString += args[ argLoop ] + ' ';
        }
        theString = theString.substring( 0, theString.length - 1 );

        return theString;
    }

    return {

        wasThisACommand: function ( data ) {
            let text = data.text;

            // check if this was a command
            const commandString = "^" + chatDefaults.commandIdentifier;
            if ( text.match( commandString ) ) {
                return true;
            }
        },

        getCommandAndArguments: function ( text, allCommands ) {
            const [ sentCommand, ...args ] = text.split( " " );
            let theCommand = sentCommand.substring( 1, sentCommand.length )
            const commandObj = allCommands[ theCommand ];
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
                chatFunctions.botSpeak( data, "Sorry, that function is only available to moderators" );
            } else if ( command ) {
                command.call( null, { data, args, userFunctions, botFunctions, roomFunctions, songFunctions, chatFunctions, videoFunctions } );
            } else {
                chatFunctions.botSpeak( data, "Sorry, that's not a command I recognise. Try " + chatDefaults.commandIdentifier + "list to find out more." );
            }
        },

        parseChat: function ( data, userFunctions, botFunctions, roomFunctions, songFunctions, chatFunctions ) {
            const text = data.text; //the most recent text in the chatbox on turntable
            const speaker = data.userid;

            if ( text.match( 'turntable.fm/' ) && !text.match( 'turntable.fm/' + roomDefaults.ttRoomName ) && !userFunctions.isUserModerator( speaker ) && data.userid !== authModule.USERID ) {
                bot.boot( data.userid, 'do not advertise other rooms here' );
            } else if ( text.match( /^\/stalk/ ) && userFunctions.isUserModerator( speaker ) === true ) {
                let stalker = text.substring( 8 );
                bot.getUserId( stalker, function ( data6 ) {
                    bot.stalk( data6.userid, allInformations = true, function ( data4 ) {
                        if ( data4.success !== false ) {
                            bot.speak( 'User found in room: http://turntable.fm/' + data4.room.shortcut );
                        } else {
                            bot.speak( 'User not found, they may be offline or in the lobby, they may also have just joined a room, or they may not exist' );
                        }
                    } );
                } );
            } else if ( text.match( /^\/botstatus/ ) && userFunctions.isUserModerator( speaker ) === true ) {
                let whatsOn = '';

                if ( botDefaults.autoBop === true ) {
                    whatsOn += 'autoBop: On, ';
                } else {
                    whatsOn += 'autoBop: Off, ';
                }
                if ( roomDefaults.EVENTMESSAGE === true ) {
                    whatsOn += 'event message: On, ';
                } else {
                    whatsOn += 'event message: Off, ';
                }
                if ( roomDefaults.MESSAGE === true ) {
                    whatsOn += 'room message: On, ';
                } else {
                    whatsOn += 'room message: Off, ';
                }
                if ( roomFunctions.GREET() === true ) {
                    whatsOn += 'greeting message: On, ';
                } else {
                    whatsOn += 'greeting message: Off, ';
                }
                if ( musicDefaults.voteSkip === true ) {
                    whatsOn += 'voteskipping: On, ';
                } else {
                    whatsOn += 'voteskipping: Off, ';
                }
                if ( userFunctions.roomIdle() === true ) {
                    whatsOn += 'audience afk limit: On, ';
                } else {
                    whatsOn += 'audience afk limit: Off, ';
                }
                if ( roomDefaults.kickTTSTAT === true ) {
                    whatsOn += 'auto ttstat kick: On, ';
                } else {
                    whatsOn += 'auto ttstat kick: Off, ';
                }
                if ( botFunctions.skipOn() === true ) {
                    whatsOn += 'autoskipping: On, ';
                } else {
                    whatsOn += 'autoskipping: Off, ';
                }
                if ( songFunctions.snagSong() === true ) {
                    whatsOn += 'every song adding: On, ';
                } else {
                    whatsOn += 'every song adding: Off, ';
                }
                if ( botDefaults.autoSnag === true ) {
                    whatsOn += 'vote based song adding: On, ';
                } else {
                    whatsOn += 'vote based song adding: Off, ';
                }
                if ( botFunctions.randomOnce() === 0 ) {
                    whatsOn += 'playlist reordering in progress?: No';
                } else {
                    whatsOn += 'playlist reordering in progress?: Yes';
                }

                bot.speak( whatsOn );
            } else if ( text.match( /^\/voteskipon/ ) && userFunctions.isUserModerator( speaker ) === true ) {
                userFunctions.resetSkipVoteUsers();
                roomDefaults.HowManyVotesToSkip = Number( data.text.slice( 12 ) )
                if ( isNaN( roomDefaults.HowManyVotesToSkip ) || roomDefaults.HowManyVotesToSkip === 0 ) {
                    bot.speak( "error, please enter a valid number" );
                }

                if ( !isNaN( roomDefaults.HowManyVotesToSkip ) && roomDefaults.HowManyVotesToSkip !== 0 ) {
                    bot.speak( "vote skipping is now active, current votes needed to pass " + "the vote is " + roomDefaults.HowManyVotesToSkip );
                    musicDefaults.voteSkip = true;
                    songFunctions.resetVoteCountSkip();
                    songFunctions.setVotesLeft( roomDefaults.HowManyVotesToSkip );
                }
            } else if ( text.match( /^\/noTheme/ ) && userFunctions.isUserModerator( speaker ) === true ) {
                roomDefaults.THEME = false;
                bot.speak( 'The theme is now inactive' );
            } else if ( text.match( /^\/setTheme/ ) && userFunctions.isUserModerator( speaker ) === true ) {
                whatIsTheme = data.text.slice( 10 );
                roomDefaults.THEME = true;
                bot.speak( 'The theme is now set to: ' + whatIsTheme );
            } else if ( text.match( /^\/theme/ ) ) {
                if ( roomDefaults.THEME === false ) {
                    bot.speak( 'There is currently no theme, standard rules apply' );
                } else {
                    bot.speak( 'The theme is currently set to: ' + whatIsTheme );
                }
            } else if ( text.match( /^\/voteskipoff$/ ) && userFunctions.isUserModerator( speaker ) === true ) {
                bot.speak( "vote skipping is now inactive" );
                musicDefaults.voteSkip = false;
                songFunctions.resetVoteCountSkip();
                songFunctions.setVotesLeft( roomDefaults.HowManyVotesToSkip );
            } else if ( text.match( /^\/skip$/ ) && musicDefaults.voteSkip === true ) //if command matches and voteskipping is enabled
            {
                let isMaster = userFunctions.masterIds().includes( data.userid );
                let checkIfOnList = roomFunctions.skipVoteUsers().indexOf( data.userid ); //check if the person using the command has already voted
                let checkIfMaster = userFunctions.masterIds().indexOf( roomFunctions.lastdj() ); //is the currently playing dj on the master id's list?

                if ( ( checkIfOnList === -1 || isMaster ) && data.userid !== authModule.USERID ) //if command user has not voted and command user is not the bot
                {
                    songFunctions.addToVoteCountSkip(); //add one to the total count of votes for the current song to be skipped
                    songFunctions.decrementVotesLeft(); //decrement votes left by one (the votes remaining till the song will be skipped)
                    roomFunctions.skipVoteUsers().unshift( data.userid ); //add them to an array to make sure that they can't vote again this song

                    let findLastDj = userFunctions.theUsersList().indexOf( roomFunctions.lastdj() ); //the index of the currently playing dj's userid in the theUser's list
                    if ( songFunctions.votesLeft() !== 0 && checkIfMaster === -1 ) //if votesLeft has not reached zero and the current dj is not on the master id's list
                    {
                        //the bot will say the following
                        bot.speak( "Current Votes for a song skip: " + songFunctions.voteCountSkip() +
                            " Votes needed to skip the song: " + roomDefaults.HowManyVotesToSkip );
                    }
                    if ( songFunctions.votesLeft() === 0 && checkIfMaster === -1 && !isNaN( roomDefaults.HowManyVotesToSkip ) ) //if there are no votes left and the current dj is not on the master list and the
                    { //the amount of votes set was a valid number
                        bot.speak( "@" + userFunctions.theUsersList()[ findLastDj + 1 ] + " you have been voted off stage" );
                        bot.remDj( roomFunctions.lastdj() ); //remove the current dj and display the above message
                    }
                } else //else the command user has already voted
                {
                    bot.pm( 'sorry but you have already voted, only one vote per person per song is allowed', data.userid );
                }
            } else if ( text.match( /^\/roomafkon/ ) && userFunctions.isUserModerator( speaker ) === true ) {
                userFunctions.enableRoomIdle();
                bot.speak( 'the audience afk list is now active.' );
                for ( let zh = 0; zh < userFunctions.userIDs().length; zh++ ) {
                    let isDj2 = userFunctions.djList().indexOf( userFunctions.userIDs()[ zh ] )
                    if ( isDj2 === -1 ) {
                        userFunctions.justSaw( userFunctions.userIDs()[ zh ], 'justSaw3' );
                        userFunctions.justSaw( userFunctions.userIDs()[ zh ], 'justSaw4' );
                    }
                }
            } else if ( text.match( /^\/roomafkoff/ ) && userFunctions.isUserModerator( speaker ) === true ) {
                userFunctions.disableRoomIdle();
                bot.speak( 'the audience afk list is now inactive.' );

            } else if ( text.match( /^\/mytime/ ) ) {
                let msecPerMinute1 = 1000 * 60;
                let msecPerHour1 = msecPerMinute1 * 60;
                let msecPerDay1 = msecPerHour1 * 24;
                let endTime1 = Date.now();
                let currentTime1 = endTime1 - userFunctions.myTime()[ data.userid ];

                let days1 = Math.floor( currentTime1 / msecPerDay1 );
                currentTime1 = currentTime1 - ( days1 * msecPerDay1 );

                let hours1 = Math.floor( currentTime1 / msecPerHour1 );
                currentTime1 = currentTime1 - ( hours1 * msecPerHour1 );

                let minutes1 = Math.floor( currentTime1 / msecPerMinute1 );

                bot.getProfile( data.userid, function ( data6 ) {
                    bot.speak( '@' + data6.name + ' you have been in the room for: ' + days1 + ' days, ' + hours1 + ' hours, ' + minutes1 + ' minutes' );
                } );
            } else if ( text.match( /^\/greeton/ ) && userFunctions.isUserModerator( speaker ) === true ) {
                bot.speak( 'room greeting: On' );
                roomFunctions.enableGreet();
            } else if ( text.match( /^\/greetoff/ ) && userFunctions.isUserModerator( speaker ) === true ) {
                bot.speak( 'room greeting: Off' );
                roomFunctions.disableGreet();
            } else if ( text.match( /^\/eventmessageOn/ ) && userFunctions.isUserModerator( speaker ) === true ) {
                bot.speak( 'event message: On' );
                roomDefaults.EVENTMESSAGE = true;
            } else if ( text.match( /^\/eventmessageOff/ ) && userFunctions.isUserModerator( speaker ) === true ) {
                bot.speak( 'event message: Off' );
                roomDefaults.EVENTMESSAGE = false;
            } else if ( text.match( /^\/messageOn/ ) && userFunctions.isUserModerator( speaker ) === true ) {
                bot.speak( 'message: On' );
                roomDefaults.MESSAGE = true;
            } else if ( text.match( /^\/messageOff/ ) && userFunctions.isUserModerator( speaker ) === true ) {
                bot.speak( 'message: Off' );
                roomDefaults.MESSAGE = false;
            } else if ( text.match( '/awesome' ) ) {
                bot.vote( 'up' );
            } else if ( text.match( '/lame' ) && userFunctions.isUserModerator( speaker ) === true ) {
                bot.vote( 'down' );
            } else if ( text.match( /^\/fanratio/ ) ) //this one courtesy of JenTheInstigator of turntable.fm
            {
                let tmpuser = data.text.substring( 11 );
                bot.getUserId( tmpuser, function ( data1 ) {
                    let tmpid = data1.userid;
                    bot.getProfile( tmpid, function ( data2 ) {
                        if ( typeof ( data1.userid ) !== 'undefined' ) {
                            let tmp = tmpuser + " has " + data2.points + " points and " + data2.fans + " fans, for a ratio of " + Math.round( data2.points / data2.fans ) + ".";
                            bot.speak( tmp );
                        } else {
                            bot.speak( 'I\m sorry I don\'t know that one' );
                        }
                    } );
                } );
            } else if ( data.text === '/roominfo' ) {
                if ( typeof roomDefaults.detail !== 'undefined' ) {
                    bot.speak( roomDefaults.detail );
                }
            } else if ( text.match( /^\/snagevery$/ ) && userFunctions.isUserModerator( speaker ) === true ) {
                if ( songFunctions.snagSong() === true ) {
                    songFunctions.snagSong = false;
                    bot.speak( 'I am no longer adding every song that plays' );
                } else if ( songFunctions.snagSong() === false ) {
                    songFunctions.snagSong = true; //this is for /snagevery
                    botDefaults.autoSnag = false; //this turns off /autosnag
                    bot.speak( 'I am now adding every song that plays, /autosnag has been turned off' );
                }
            } else if ( text.match( /^\/autosnag/ ) && userFunctions.isUserModerator( speaker ) === true ) {
                if ( botDefaults.autoSnag === false ) {
                    botDefaults.autoSnag = true; //this is for /autosnag
                    songFunctions.snagSong = false; //this is for /snagevery
                    bot.speak( 'I am now adding every song that gets at least (' + botDefaults.howManyVotes + ') awesome\'s, /snagevery has been turned off' );
                } else if ( botDefaults.autoSnag === true ) {
                    botDefaults.autoSnag = false;
                    bot.speak( 'vote snagging has been turned off' );
                }
            } else if ( text.match( /^\/snag/ ) && userFunctions.isUserModerator( speaker ) === true ) {
                if ( songFunctions.getSong() !== null && botDefaults.botPlaylist !== null ) {
                    let found = false;
                    for ( let igh = 0; igh < botDefaults.botPlaylist.length; igh++ ) {
                        if ( botDefaults.botPlaylist[ igh ]._id === songFunctions.getSong() ) {
                            found = true;
                            bot.speak( 'I already have that song' );
                            break;
                        }
                    }
                    if ( !found ) {
                        bot.playlistAdd( songFunctions.getSong(), -1 ); //add song to the end of the playlist
                        bot.speak( 'song added' );
                        let tempSongHolder = {
                            _id: songFunctions.getSong()
                        };
                        botDefaults.botPlaylist.push( tempSongHolder );
                    }
                } else {
                    bot.pm( 'error, you can\'t snag the song that\'s playing when the bot enters the room', data.userid );
                }
            } else if ( text.match( /^\/removesong$/ ) && userFunctions.isUserModerator( speaker ) === true ) {
                if ( roomFunctions.checkWhoIsDj() === authModule.USERID ) {
                    bot.skip();
                    bot.playlistRemove( -1 );
                    botDefaults.botPlaylist.splice( botDefaults.botPlaylist.length - 1, 1 );
                    bot.speak( 'the last snagged song has been removed.' );
                } else {
                    botDefaults.botPlaylist.splice( botDefaults.botPlaylist.length - 1, 1 );
                    bot.playlistRemove( -1 );
                    bot.speak( 'the last snagged song has been removed.' );
                }
            } else if ( text.match( /^\/playminus/ ) && userFunctions.isUserModerator( speaker ) === true ) {
                if ( musicDefaults.DJPlaysLimit === true ) //is the play limit on?
                {
                    let playMinus = data.text.slice( 12 );
                    let areTheyInRoom = userFunctions.theUsersList().indexOf( playMinus );
                    let areTheyDj = userFunctions.djList().indexOf( userFunctions.theUsersList()[ areTheyInRoom - 1 ] );

                    if ( areTheyInRoom !== -1 ) //are they in the room?
                    {
                        if ( areTheyDj !== -1 ) //are they a dj?
                        {
                            if ( typeof ( userFunctions.djSongCount( userFunctions.theUsersList()[ areTheyInRoom - 1 ] ) ) != 'undefined' ) {
                                if ( !userFunctions.djSongCount( userFunctions.theUsersList()[ areTheyInRoom - 1 ] ).nbSong <= 0 ) //is their play count already 0 or lower?
                                {
                                    userFunctions.decrementDJPlayCount( userFunctions.theUsersList()[ areTheyInRoom - 1 ] );
                                    bot.speak( userFunctions.theUsersList()[ areTheyInRoom ] + '\'s play count has been reduced by one' );
                                } else {
                                    bot.pm( 'error, that user\'s play count is already at zero', data.userid );
                                }
                            } else {
                                bot.pm( 'something weird happened!, attemping to recover now', data.userid );
                                if ( typeof userFunctions.theUsersList()[ areTheyInRoom - 1 ] != 'undefined' ) {
                                    //recover here
                                    userFunctions.setDJPlayCount( userFunctions.theUsersList()[ areTheyInRoom - 1 ], 0 );
                                }
                            }
                        } else {
                            bot.pm( 'error, that user is not currently djing', data.userid );
                        }
                    } else {
                        bot.pm( 'error, that user is not currently in the room', data.userid );
                    }
                } else {
                    bot.pm( 'error, the play limit must be turned on in order for me to decrement play counts', data.userid );
                }
            } else if ( text.match( /^\/whobanned$/ ) && userFunctions.isUserModerator( speaker ) === true ) {
                if ( roomDefaults.blackList.length !== 0 ) {
                    bot.speak( 'ban list: ' + roomDefaults.blackList );
                } else {
                    bot.speak( 'The ban list is empty.' );
                }
            } else if ( text.match( /^\/whostagebanned$/ ) && userFunctions.isUserModerator( speaker ) === true ) {
                if ( roomFunctions.tempBanList().length !== 0 ) {
                    bot.speak( 'banned from stage: ' + roomFunctions.tempBanList() );
                } else {
                    bot.speak( 'The banned from stage list is currently empty.' );
                }
            } else if ( text.match( /^\/warnme/ ) ) {
                let areTheyBeingWarned = userFunctions.warnme().indexOf( data.userid );
                let areTheyDj80 = userFunctions.djList().indexOf( data.userid );
                let Position56 = userFunctions.djList().indexOf( roomFunctions.checkWhoIsDj() ); //current djs index

                if ( areTheyDj80 !== -1 ) //are they on stage?
                {
                    if ( roomFunctions.checkWhoIsDj() != null ) {
                        if ( roomFunctions.checkWhoIsDj() === data.userid ) {
                            bot.pm( 'you are currently playing a song!', data.userid );
                        } else if ( userFunctions.djList()[ Position56 ] === userFunctions.djList()[ userFunctions.howManyDJs() - 1 ] &&
                            userFunctions.djList()[ 0 ] === data.userid ||
                            userFunctions.djList()[ Position56 + 1 ] === data.userid ) //if they aren't the next person to play a song
                        {
                            bot.pm( 'your song is up next!', data.userid );
                        } else {
                            if ( areTheyBeingWarned === -1 ) //are they already being warned? no
                            {
                                userFunctions.warnme().unshift( data.userid );
                                bot.speak( '@' + userFunctions.name() + ' you will be warned when your song is up next' );
                            } else if ( areTheyBeingWarned !== -1 ) //yes
                            {
                                userFunctions.warnme().splice( areTheyBeingWarned, 1 );
                                bot.speak( '@' + userFunctions.name() + ' you will no longer be warned' );
                            }
                        }
                    } else {
                        bot.pm( 'you must wait one song since the bot has started up to use this command', data.userid );
                    }
                } else {
                    bot.pm( 'error, you must be on stage to use that command', data.userid );
                }
            } else if ( text.match( '/banstage' ) && userFunctions.isUserModerator( speaker ) === true ) {
                let ban = data.text.slice( 11 );
                let checkBan = roomFunctions.tempBanList().indexOf( ban );
                let checkUser = userFunctions.theUsersList().indexOf( ban );
                if ( checkBan === -1 && checkUser !== -1 ) {
                    roomFunctions.tempBanList().push( userFunctions.theUsersList()[ checkUser - 1 ], userFunctions.theUsersList()[ checkUser ] );
                    bot.remDj( userFunctions.theUsersList()[ checkUser - 1 ] );
                    userFunctions.removeAsModerator();
                } else {
                    bot.pm( 'error, no such person was found, make sure you typed in their name correctly', data.userid );
                }
            } else if ( text.match( '/unbanstage' ) && userFunctions.isUserModerator( speaker ) === true ) {
                let ban2 = data.text.slice( 13 );
                userFunctions.index = roomFunctions.tempBanList().indexOf( ban2 );
                if ( userFunctions.index !== -1 ) {
                    roomFunctions.tempBanList().splice( roomFunctions.tempBanList()[ userFunctions.index - 1 ], 2 );
                    userFunctions.removeAsModerator();
                    userFunctions.index = null;
                } else {
                    bot.pm( 'error, no such person was found, make sure you typed in their name correctly', data.userid );
                }
            } else if ( text.match( '/ban' ) && userFunctions.isUserModerator( speaker ) === true ) {
                let ban3 = data.text.slice( 6 );
                let checkBan5 = roomDefaults.blackList.indexOf( ban3 );
                let checkUser3 = userFunctions.theUsersList().indexOf( ban3 );
                if ( checkBan5 === -1 && checkUser3 !== -1 ) {
                    roomDefaults.blackList.push( userFunctions.theUsersList()[ checkUser3 - 1 ], userFunctions.theUsersList()[ checkUser3 ] );
                    bot.boot( userFunctions.theUsersList()[ checkUser3 - 1 ] );
                    userFunctions.removeAsModerator();
                } else {
                    bot.pm( 'error, no such person was found, make sure you typed in their name correctly', data.userid );
                }
            } else if ( text.match( '/unban' ) && userFunctions.isUserModerator( speaker ) === true ) {
                let ban6 = data.text.slice( 8 );
                userFunctions.index = roomDefaults.blackList.indexOf( ban6 );
                if ( userFunctions.index !== -1 ) {
                    roomDefaults.blackList.splice( roomDefaults.blackList[ userFunctions.index - 1 ], 2 );
                    userFunctions.removeAsModerator();
                    userFunctions.index = null;
                } else {
                    bot.pm( 'error, no such person was found, make sure you typed in their name correctly', data.userid );
                }
            }
        },

        parsePM: function ( data, userFunctions, botFunctions, roomFunctions, songFunctions, chatFunctions ) {

            let speaker = speaker; //the userid of the person who just pmmed the bot
            let text = data.text; //the text sent to the bot in a pm
            let name1 = userFunctions.theUsersList().indexOf( speaker ) + 1; //the name of the person who sent the bot a pm
            let isInRoom = userFunctions.isPMerInRoom( senderid ); //check to see whether pmmer is in the same room as the bot

            userFunctions.isUserModerator( speaker ); //check to see if person pming the bot a command is a moderator or not

            //if no commands match, the pmmer is a moderator and theres more than zero people in the modpm chat
            if ( userFunctions.modPM.length !== 0 && data.text.charAt( 0 ) !== '/' && userFunctions.isUserModerator( speaker ) === true ) //if no other commands match, send dpm
            {
                let areTheyInModPm = userFunctions.modPM.indexOf( speaker );

                if ( areTheyInModPm !== -1 ) {
                    for ( let jhg = 0; jhg < userFunctions.modPM.length; jhg++ ) {
                        if ( userFunctions.modPM[ jhg ] !== speaker && userFunctions.modPM[ jhg ] !== authModule.USERID ) //this will prevent you from messaging yourself
                        {
                            bot.pm( userFunctions.theUsersList()[ name1 ] + ' said: ' + data.text, userFunctions.modPM[ jhg ] );
                        }
                    }
                }
            } else if ( text.match( /^\/modpm/ ) && userFunctions.isUserModerator( speaker ) === true && isInRoom === true ) {
                let areTheyInModPm = userFunctions.modPM.indexOf( speaker );

                if ( areTheyInModPm === -1 ) //are they already in modpm? no
                {
                    userFunctions.modPM.unshift( speaker );
                    bot.pm( 'you have now entered into modpm mode, your messages ' +
                        'will go to other moderators currently in the modpm', speaker );
                    if ( userFunctions.modPM.length !== 0 ) {
                        for ( let jk = 0; jk < userFunctions.modPM.length; jk++ ) {
                            if ( userFunctions.modPM[ jk ] !== speaker ) {
                                bot.pm( userFunctions.theUsersList()[ name1 ] + ' has entered the modpm chat', userFunctions.modPM[ jk ] ); //declare user has entered chat
                            }
                        }
                    }
                } else if ( areTheyInModPm !== -1 ) //yes
                {
                    userFunctions.modPM.splice( areTheyInModPm, 1 );
                    bot.pm( 'you have now left modpm mode', speaker );
                    if ( userFunctions.modPM.length !== 0 ) {
                        for ( let jk = 0; jk < userFunctions.modPM.length; jk++ ) {
                            bot.pm( userFunctions.theUsersList()[ name1 ] + ' has left the modpm chat', userFunctions.modPM[ jk ] ); //declare user has entered chat
                        }
                    }
                }
            } else if ( text.match( /^\/whosinmodpm/ ) && userFunctions.isUserModerator( speaker ) === true && isInRoom === true ) {
                if ( userFunctions.modPM.length !== 0 ) {
                    let temper = "Users in modpm: "; //holds names

                    for ( let gfh = 0; gfh < userFunctions.modPM.length; gfh++ ) {
                        let whatAreTheirNames = userFunctions.theUsersList().indexOf( userFunctions.modPM[ gfh ] ) + 1;

                        if ( gfh !== ( userFunctions.modPM.length - 1 ) ) {
                            temper += userFunctions.theUsersList()[ whatAreTheirNames ] + ', ';

                        } else {
                            temper += userFunctions.theUsersList()[ whatAreTheirNames ];
                        }
                    }
                    bot.pm( temper, speaker );
                } else {
                    bot.pm( 'no one is currently in modpm', speaker );
                }
            } else if ( text.match( /^\/warnme/ ) && isInRoom === true ) {
                let areTheyBeingWarned = userFunctions.warnme().indexOf( speaker );
                let areTheyDj80 = userFunctions.djList().indexOf( speaker );
                let Position56 = userFunctions.djList().indexOf( roomFunctions.checkWhoIsDj() ); //current djs index

                if ( areTheyDj80 !== -1 ) //are they on stage?
                {
                    if ( roomFunctions.checkWhoIsDj() != null ) {
                        if ( roomFunctions.checkWhoIsDj() === speaker ) {
                            bot.pm( 'you are currently playing a song!', speaker );
                        } else if ( userFunctions.djList()[ Position56 ] === userFunctions.djList()[ userFunctions.howManyDJs() - 1 ] &&
                            userFunctions.djList()[ 0 ] === speaker ||
                            userFunctions.djList()[ Position56 + 1 ] === speaker ) //if they aren't the next person to play a song
                        {
                            bot.pm( 'your song is up next!', speaker );
                        } else {
                            if ( areTheyBeingWarned === -1 ) //are they already being warned? no
                            {
                                userFunctions.warnme().unshift( speaker );
                                bot.pm( 'you will be warned when your song is up next', speaker );
                            } else if ( areTheyBeingWarned !== -1 ) //yes
                            {
                                userFunctions.warnme().splice( areTheyBeingWarned, 1 );
                                bot.pm( 'you will no longer be warned', speaker );
                            }
                        }
                    } else {
                        bot.pm( 'you must wait one song since the bot has started up to use this command', speaker );
                    }
                } else {
                    bot.pm( 'error, you must be on stage to use that command', speaker );
                }
            } else if ( text.match( /^\/playminus/ ) && userFunctions.isUserModerator( speaker ) === true && isInRoom === true ) {
                if ( musicDefaults.DJPlaysLimit === true ) //is the play limit on?
                {
                    let playMinus = data.text.slice( 12 );
                    let areTheyInRoom = userFunctions.theUsersList().indexOf( playMinus );
                    let areTheyDj = userFunctions.djList().indexOf( userFunctions.theUsersList()[ areTheyInRoom - 1 ] );
                    if ( areTheyInRoom !== -1 ) //are they in the room?
                    {
                        if ( areTheyDj !== -1 ) //are they a dj?
                        {
                            if ( typeof ( userFunctions.djSongCount( userFunctions.theUsersList()[ areTheyInRoom - 1 ] ) ) != 'undefined' ) {

                                if ( !userFunctions.djSongCount( userFunctions.theUsersList()[ areTheyInRoom - 1 ] ).nbSong <= 0 ) //is their play count already 0 or lower?
                                {
                                    userFunctions.decrementDJPlayCount( userFunctions.theUsersList()[ areTheyInRoom - 1 ] );
                                    bot.pm( userFunctions.theUsersList()[ areTheyInRoom ] + '\'s play count has been reduced by one', speaker );
                                } else {
                                    bot.pm( 'error, that user\'s play count is already at zero', speaker );
                                }
                            } else {
                                bot.pm( 'something weird happened!, attemping to recover now', speaker );

                                if ( userFunctions.theUsersList()[ areTheyInRoom - 1 ] !== 'undefined' ) //only recover if userid given is not undefined
                                {
                                    //recover here
                                    userFunctions.initialiseDJPlayCount( userFunctions.theUsersList()[ areTheyInRoom - 1 ] );
                                }
                            }
                        } else {
                            bot.pm( 'error, that user is not currently djing', speaker );
                        }
                    } else {
                        bot.pm( 'error, that user is not currently in the room', speaker );
                    }
                } else {
                    bot.pm( 'error, the play limit must be turned on in order for me to decrement play counts', speaker );
                }
            } else if ( text.match( /^\/snagevery$/ ) && userFunctions.isUserModerator( speaker ) === true && isInRoom === true ) {
                if ( songFunctions.snagSong() === true ) {
                    songFunctions.snagSong = false;
                    bot.pm( 'I am no longer adding every song that plays', speaker );
                } else if ( songFunctions.snagSong() === false ) {
                    songFunctions.snagSong = true; //this is for /snagevery
                    botDefaults.autoSnag = false; //this turns off /autosnag
                    bot.pm( 'I am now adding every song that plays, /autosnag has been turned off', speaker );
                }
            } else if ( text.match( /^\/autosnag/ ) && userFunctions.isUserModerator( speaker ) === true && isInRoom === true ) {
                if ( botDefaults.autoSnag === false ) {
                    botDefaults.autoSnag = true; //this is for /autosnag
                    songFunctions.snagSong = false; //this is for /snagevery
                    bot.pm( 'I am now adding every song that gets at least (' + botDefaults.howManyVotes + ') awesome\'s, /snagevery has been turned off', speaker );
                } else if ( botDefaults.autoSnag === true ) {
                    botDefaults.autoSnag = false;
                    bot.pm( 'vote snagging has been turned off', speaker );
                }
            } else if ( text.match( '/awesome' ) && isInRoom === true ) {
                bot.vote( 'up' );
            } else if ( text.match( '/lame' ) && userFunctions.isUserModerator( speaker ) === true && isInRoom === true ) {
                bot.vote( 'down' );
            } else if ( text.match( /^\/eventmessageOn/ ) && userFunctions.isUserModerator( speaker ) === true && isInRoom === true ) {
                bot.pm( 'event message: On', speaker );
                roomDefaults.EVENTMESSAGE = true;
            } else if ( text.match( /^\/eventmessageOff/ ) && userFunctions.isUserModerator( speaker ) === true && isInRoom === true ) {
                bot.pm( 'event message: Off', speaker );
                roomDefaults.EVENTMESSAGE = false;
            } else if ( text.match( /^\/messageOff/ ) && userFunctions.isUserModerator( speaker ) === true && isInRoom === true ) {
                bot.pm( 'message: Off', speaker );
                roomDefaults.MESSAGE = false;
            } else if ( text.match( /^\/messageOn/ ) && userFunctions.isUserModerator( speaker ) === true && isInRoom === true ) {
                bot.pm( 'message: On', speaker );
                roomDefaults.MESSAGE = true;
            } else if ( text.match( /^\/greetoff/ ) && userFunctions.isUserModerator( speaker ) === true && isInRoom === true ) {
                bot.pm( 'room greeting: Off', speaker );
                roomFunctions.disableGreet();
            } else if ( text.match( /^\/greeton/ ) && userFunctions.isUserModerator( speaker ) === true && isInRoom === true ) {
                bot.pm( 'room greeting: On', speaker );
                roomFunctions.enableGreet();
            } else if ( text.match( /^\/setTheme/ ) && userFunctions.isUserModerator( speaker ) === true && isInRoom === true ) {
                whatIsTheme = data.text.slice( 10 );
                roomDefaults.THEME = true;
                bot.pm( 'The theme is now set to: ' + whatIsTheme, speaker );
            } else if ( text.match( /^\/noTheme/ ) && userFunctions.isUserModerator( speaker ) === true && isInRoom === true ) {
                roomDefaults.THEME = false;
                bot.pm( 'The theme is now inactive', speaker );
            } else if ( text.match( /^\/theme/ ) && isInRoom === true ) {
                if ( roomDefaults.THEME === false ) {
                    bot.pm( 'There is currently no theme, standard rules apply', speaker );
                } else {
                    bot.pm( 'The theme is currently set to: ' + whatIsTheme, speaker );
                }
            } else if ( text.match( /^\/roomafkoff/ ) && userFunctions.isUserModerator( speaker ) === true && isInRoom === true ) {
                userFunctions.disableRoomIdle();
                bot.pm( 'the audience afk list is now inactive.', speaker );
            } else if ( text.match( /^\/roomafkon/ ) && userFunctions.isUserModerator( speaker ) === true && isInRoom === true ) {
                userFunctions.enableRoomIdle();
                bot.pm( 'the audience afk list is now active.', speaker );
                for ( let zh = 0; zh < userFunctions.userIDs().length; zh++ ) {
                    let isDj2 = userFunctions.djList().indexOf( userFunctions.userIDs()[ zh ] )
                    if ( isDj2 === -1 ) {
                        userFunctions.justSaw( userFunctions.userIDs()[ zh ], 'justSaw3' );
                        userFunctions.justSaw( userFunctions.userIDs()[ zh ], 'justSaw4' );
                    }
                }
            } else if ( text.match( /^\/voteskipoff$/ ) && userFunctions.isUserModerator( speaker ) === true && isInRoom === true ) {
                bot.pm( "vote skipping is now inactive", speaker );
                musicDefaults.voteSkip = false;
                songFunctions.resetVoteCountSkip();
                songFunctions.setVotesLeft( roomDefaults.HowManyVotesToSkip );
            } else if ( text.match( /^\/mytime/ ) && isInRoom === true ) {
                let msecPerMinute1 = 1000 * 60;
                let msecPerHour1 = msecPerMinute1 * 60;
                let msecPerDay1 = msecPerHour1 * 24;
                let endTime1 = Date.now();
                let currentTime1 = endTime1 - userFunctions.myTime()[ speaker ];

                let days1 = Math.floor( currentTime1 / msecPerDay1 );
                currentTime1 = currentTime1 - ( days1 * msecPerDay1 );

                let hours1 = Math.floor( currentTime1 / msecPerHour1 );
                currentTime1 = currentTime1 - ( hours1 * msecPerHour1 );

                let minutes1 = Math.floor( currentTime1 / msecPerMinute1 );


                bot.pm( 'you have been in the room for: ' + days1 + ' days, ' + hours1 + ' hours, ' + minutes1 + ' minutes', speaker );

            } else if ( text.match( /^\/voteskipon/ ) && userFunctions.isUserModerator( speaker ) === true && isInRoom === true ) {
                userFunctions.resetSkipVoteUsers();
                roomDefaults.HowManyVotesToSkip = Number( data.text.slice( 12 ) )
                if ( isNaN( roomDefaults.HowManyVotesToSkip ) || roomDefaults.HowManyVotesToSkip === 0 ) {
                    bot.pm( "error, please enter a valid number", speaker );
                }

                if ( !isNaN( roomDefaults.HowManyVotesToSkip ) && roomDefaults.HowManyVotesToSkip !== 0 ) {
                    bot.pm( "vote skipping is now active, current votes needed to pass " + "the vote is " + roomDefaults.HowManyVotesToSkip, speaker );
                    musicDefaults.voteSkip = true;
                    songFunctions.resetVoteCountSkip();
                    songFunctions.setVotesLeft( roomDefaults.HowManyVotesToSkip );
                }
            } else if ( text.match( '/banstage' ) && userFunctions.isUserModerator( speaker ) === true && isInRoom === true ) {
                let ban12 = data.text.slice( 11 );
                let checkBan = roomFunctions.tempBanList().indexOf( ban12 );
                let checkUser12 = userFunctions.theUsersList().indexOf( ban12 );
                if ( checkBan === -1 && checkUser12 !== -1 ) {
                    roomFunctions.tempBanList().push( userFunctions.theUsersList()[ checkUser12 - 1 ], userFunctions.theUsersList()[ checkUser12 ] );
                    bot.remDj( userFunctions.theUsersList()[ checkUser12 - 1 ] );
                    userFunctions.removeAsModerator();
                }
            } else if ( text.match( '/unbanstage' ) && userFunctions.isUserModerator( speaker ) === true && isInRoom === true ) {
                let ban2 = data.text.slice( 13 );
                userFunctions.index = roomFunctions.tempBanList().indexOf( ban2 );
                if ( userFunctions.index !== -1 ) {
                    roomFunctions.tempBanList().splice( roomFunctions.tempBanList()[ userFunctions.index - 1 ], 2 );
                    userFunctions.removeAsModerator();
                    userFunctions.index = null;
                }
            } else if ( text.match( '/ban' ) && userFunctions.isUserModerator( speaker ) === true && isInRoom === true ) {
                let ban17 = data.text.slice( 6 );
                let checkBan17 = roomDefaults.blackList.indexOf( ban17 );
                let checkUser17 = userFunctions.theUsersList().indexOf( ban17 );
                if ( checkBan17 === -1 && checkUser17 !== -1 ) {
                    roomDefaults.blackList.push( userFunctions.theUsersList()[ checkUser17 - 1 ], userFunctions.theUsersList()[ checkUser17 ] );
                    bot.boot( userFunctions.theUsersList()[ checkUser17 - 1 ] );
                    userFunctions.removeAsModerator();
                }
            } else if ( text.match( '/unban' ) && userFunctions.isUserModerator( speaker ) === true && isInRoom === true ) {
                let ban20 = data.text.slice( 8 );
                userFunctions.index = roomDefaults.blackList.indexOf( ban20 );
                if ( userFunctions.index !== -1 ) {
                    roomDefaults.blackList.splice( roomDefaults.blackList[ userFunctions.index - 1 ], 2 );
                    userFunctions.removeAsModerator();
                    userFunctions.index = null;
                }
            } else if ( text.match( /^\/stalk/ ) && userFunctions.isUserModerator( speaker ) === true && isInRoom === true ) {
                let stalker = text.substring( 8 );
                bot.getUserId( stalker, function ( data6 ) {
                    bot.stalk( data6.userid, allInformations = true, function ( data4 ) {
                        if ( data4.success !== false ) {
                            bot.pm( 'User found in room: http://turntable.fm/' + data4.room.shortcut, speaker );
                        } else {
                            bot.pm( 'User not found, they may be offline or in the lobby, they may also have just joined a room, or they may not exist', speaker );
                        }
                    } );
                } );
            } else if ( text.match( /^\/whobanned$/ ) && userFunctions.isUserModerator( speaker ) === true && isInRoom === true ) {
                if ( roomDefaults.blackList.length !== 0 ) {
                    bot.pm( 'ban list: ' + roomDefaults.blackList, speaker );
                } else {
                    bot.pm( 'The ban list is empty.', speaker );
                }
            } else if ( text.match( /^\/whostagebanned$/ ) && userFunctions.isUserModerator( speaker ) === true && isInRoom === true ) {
                if ( roomFunctions.tempBanList().length !== 0 ) {
                    bot.pm( 'banned from stage: ' + roomFunctions.tempBanList(), speaker );
                } else {
                    bot.pm( 'The banned from stage list is currently empty.', speaker );
                }
            } else if ( text.match( /^\/snag/ ) && userFunctions.isUserModerator( speaker ) === true && isInRoom === true ) {
                if ( songFunctions.getSong() !== null && botDefaults.botPlaylist !== null ) {
                    let found = false;
                    for ( let igh = 0; igh < botDefaults.botPlaylist.length; igh++ ) {
                        if ( botDefaults.botPlaylist[ igh ]._id === songFunctions.getSong() ) {
                            found = true;
                            bot.pm( 'I already have that song', speaker );
                            break;
                        }
                    }
                    if ( !found ) {
                        bot.playlistAdd( songFunctions.getSong(), -1 ); //add song to the end of the playlist
                        bot.pm( 'song added', speaker );
                        let tempSongHolder = {
                            _id: songFunctions.getSong()
                        };
                        botDefaults.botPlaylist.push( tempSongHolder );
                    }
                } else {
                    bot.pm( 'error, you can\'t snag the song that\'s playing when the bot enters the room', speaker );
                }
            } else if ( text.match( /^\/removesong$/ ) && userFunctions.isUserModerator( speaker ) === true && isInRoom === true ) {
                if ( roomFunctions.checkWhoIsDj() === authModule.USERID ) {
                    bot.skip();
                    bot.playlistRemove( -1 );
                    botDefaults.botPlaylist.splice( botDefaults.botPlaylist.length - 1, 1 );
                    bot.pm( 'the last snagged song has been removed.', speaker );
                } else {
                    botDefaults.botPlaylist.splice( botDefaults.botPlaylist.length - 1, 1 );
                    bot.playlistRemove( -1 );
                    bot.pm( 'the last snagged song has been removed.', speaker );
                }
            } else if ( text.match( /^\/boot/ ) && userFunctions.isUserModerator( speaker ) === true && isInRoom === true ) //admin only
            {
                let bootName = data.text.slice( 5 ); //holds their name
                let tempArray = bootName.split( " " );
                let reason = "";
                let whatIsTheirUserid = userFunctions.theUsersList().indexOf( tempArray[ 1 ] );
                let theirName = ""; //holds the person's name
                let isNameValid; //if second param is int value this is used to hold name index


                //if second arg is a number and that number is not a name of someone in the room
                //then that number represents the word length of the name given, which means
                //that they are going to print a message with the boot command
                if ( !isNaN( tempArray[ 1 ] ) && whatIsTheirUserid === -1 ) {
                    //if arg given will not produce index of bounds error
                    if ( tempArray[ 1 ] < tempArray.length - 1 ) {
                        for ( let gj = 2; gj <= ( 2 + Math.round( tempArray[ 1 ] ) ) - 1; gj++ ) {
                            theirName += tempArray[ gj ] + " ";
                        }

                        isNameValid = userFunctions.theUsersList().indexOf( theirName.trim() ); //find the index

                        //if the name you provided was valid
                        if ( isNameValid !== -1 ) {
                            //get the message
                            for ( let gyj = 2 + Math.round( tempArray[ 1 ] ); gyj < tempArray.length; gyj++ ) {
                                reason += tempArray[ gyj ] + " ";
                            }


                            //if their name is multi word, then a number must be given in order
                            //to know when their name ends and their message begins, however
                            //this command can be used with a multi name word and no message
                            //in which case there would be no reason parameter
                            if ( reason !== "" ) {
                                bot.boot( userFunctions.theUsersList()[ isNameValid - 1 ], reason );
                            } else {
                                bot.boot( userFunctions.theUsersList()[ isNameValid - 1 ] );
                            }
                        } else {
                            bot.pm( 'sorry but the name you provided was not found in the room', speaker );
                        }
                    } else {
                        bot.pm( 'error, the number provided must be the number of words that make up the person\'s name', speaker );
                    }
                } //if their name is just 1 single word and a message is given
                //it comes to here
                else if ( tempArray.length > 2 && whatIsTheirUserid !== -1 ) {
                    for ( let ikp = 2; ikp < tempArray.length; ikp++ ) {
                        reason += tempArray[ ikp ] + " ";
                    }

                    bot.boot( userFunctions.theUsersList()[ whatIsTheirUserid - 1 ], reason );
                }
                //if their name is a single word and no message is given it comes to here
                else if ( whatIsTheirUserid !== -1 ) {
                    bot.boot( userFunctions.theUsersList()[ whatIsTheirUserid - 1 ] );
                } else {
                    bot.pm( 'error, that user was not found in the room. multi word names must be specified in the command usage, example: /boot 3 first middle last.' +
                        ' if the name is only one word long then you do not need to specify its length', speaker );
                }
            }
        }
    }
}
module.exports = commandFunctions;
