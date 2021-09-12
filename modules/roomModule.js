let roomDefaults = require( '../defaultSettings/roomDefaults.js' );
let musicDefaults = require( '../defaultSettings/musicDefaults.js' );
let botDefaults = require( '../defaultSettings/botDefaults.js' );
let chatCommandItems = require( '../defaultSettings/chatCommandItems.js' );

let djCount = null; //the number of dj's on stage, gets reset every song
let bannedArtistsMatcher = ''; //holds the regular expression for banned artist / song matching
let tempBanList = []; //holds the userid of everyone who is in the command based banned from stage list
let skipVoteUsers = []; //holds the userid's of everyone who has voted for the currently playing song to be skipped, is cleared every song
let lastdj = null; //holds the userid of the currently playing dj
let songLimitTimer = null; //holds the timer used to remove a dj off stage if they don't skip their song in time, and their song has exceeded the max allowed song time
let queueTimer = null; //holds the timer the auto removes dj's from the queue if they do not get on stage within the allowed time period

let greet = roomDefaults.greetUsers; //room greeting when someone joins the room(on by default)
let greetInPublic = roomDefaults.greetInPublic; //choose whether greeting message is through the pm or the chatbox(false = chatbox, true = pm), (only works when greeting message is turned on) (off by default)

let roomName = '';
let roomJoinMessage = 'Welcome to @roomName @username'; //the message users will see when they join the room, leave it empty for the default message (only works when greet is turned on)
let additionalJoinMessage = "You can checkout the room rules here: https://bit.ly/ilt80s and if you have any suggestions you can make them here: https://bit.ly/80scd";
let theme = false; //has a current theme been set? true or false. handled by commands
let rulesTimerRunning = false;
let rulesMessageOn = true;
let rulesInterval = 15; // how ofter, in minutes, the room rules will be displayed with the welcome messages

const roomFunctions = ( bot ) => {

    return {
        djCount: () => djCount, setDJCount: function ( theCount ) { djCount = theCount; },

        bannedArtistsMatcher: () => bannedArtistsMatcher,
        tempBanList: () => tempBanList,
        skipVoteUsers: () => skipVoteUsers,
        songLimitTimer: () => songLimitTimer,
        queueTimer: () => queueTimer,

        roomJoinMessage: () => roomJoinMessage,
        additionalJoinMessage: () => additionalJoinMessage,

        resetSkipVoteUsers: function () {
            skipVoteUsers = []
        },

        // ========================================================
        // Greeting Functions
        // ========================================================

        greet: () => greet,
        enableGreet: function () { greet = true; },
        disableGreet: function () { greet = false; },

        greetInPublic: () => greetInPublic,

        greetOnCommand: function ( data, chatFunctions ) {
            if ( this.greet() === true ) {
                chatFunctions.botSpeak( 'The Greet command is already enabled', data );
            } else {
                this.enableGreet();
                this.readGreetingStatus( data, chatFunctions );
            }
        },

        greetOffCommand: function ( data, chatFunctions ) {
            if ( this.greet() === false ) {
                chatFunctions.botSpeak( 'The Greet command is already disabled', data );
            } else {
                this.disableGreet();
                this.readGreetingStatus( data, chatFunctions );
            }
        },

        readGreetingStatus: function ( data, chatFunctions ) {
            let theMessage = 'The Greet command is ';
            if ( this.greet() === true ) {
                theMessage += 'enabled';
            } else {
                theMessage += 'disabled';
            }
            chatFunctions.botSpeak( theMessage, data );
        },

        // ========================================================

        // ========================================================
        // Greeting Functions
        // ========================================================

        theme: () => theme,
        setTheme: function ( value ) {
            theme = value;
        },
        clearTheme: function () {
            theme = false;
        },

        setThemeCommand: function ( data, newTheme, chatFunctions ) {
            this.setTheme( newTheme );
            this.readTheme( data, chatFunctions );
        },

        removeThemeCommand: function ( data, chatFunctions ) {
            this.clearTheme();
            this.readTheme( data, chatFunctions );
        },

        readTheme: function ( data, chatFunctions ) {
            if ( this.theme() === false ) {
                chatFunctions.botSpeak( 'There is currently no theme', data );
            } else {
                chatFunctions.botSpeak( 'The Theme is currently set to ' + this.theme(), data );
            }
        },

        // ========================================================

        // ========================================================
        // Greeting Functions
        // ========================================================

        isRulesTimerRunning: function () {
            return rulesTimerRunning;
        },

        startRulesTimer: function () {
            rulesTimerRunning = true;

            setTimeout( function () {
                this.clearRulesTimer();
            }.bind( this ), this.rulesInterval() * 60 * 1000 );

        },

        clearRulesTimer: function () {
            rulesTimerRunning = false;
        },

        rulesMessageOn: () => rulesMessageOn,

        enableRulesMessageCommand: function ( data, chatFunctions ) {
            rulesMessageOn = true;
            this.readRulesStatus( data, chatFunctions );
        },

        disableRulesMessageCommand: function ( data, chatFunctions ) {
            rulesMessageOn = false;
            this.readRulesStatus( data, chatFunctions );
        },

        readRulesStatus: function ( data, chatFunctions ) {
            if ( this.rulesMessageOn() ) {
                chatFunctions.botSpeak( 'The rules will displayed with the welcome message after ' + this.rulesInterval() + ' minutes', data );
            } else {
                chatFunctions.botSpeak( 'The rules will not displayed with the welcome message. The rules interval is set to ' + this.rulesInterval() + ' minutes', data );
            }
        },

        rulesInterval: () => rulesInterval,

        setRulesIntervalCommand: function ( data, minutes, chatFunctions ) {
            if ( isNaN( minutes ) || minutes === undefined ) {
                chatFunctions.botSpeak( minutes + ' is not a valid interval in minutes.', data );
            } else {
                rulesInterval = minutes;
                this.readRulesStatus( data, chatFunctions );
            }
        },

        // ========================================================

        lastdj: () => lastdj,
        setLastDJ: function ( djID ) {
            lastdj = djID;
        },

        queuePromptToDJ: function ( chatFunctions, userFunctions ) {
            const djName = '@' + userFunctions.getUsername( userFunctions.notifyThisDJ().toString() );
            let theMessage = chatCommandItems.queueInviteMessages[ Math.floor( Math.random() * chatCommandItems.queueInviteMessages.length ) ];

            let theTime;
            if ( ( roomDefaults.queueWaitTime / 60 ) < 1 ) { //is it seconds
                theTime = roomDefaults.queueWaitTime + ' seconds';
            } else if ( ( roomDefaults.queueWaitTime / 60 ) === 1 ) { //is it one minute
                let minute = Math.floor( ( roomDefaults.queueWaitTime / 60 ) );
                theTime = minute + ' minute';
            } else if ( ( roomDefaults.queueWaitTime / 60 ) > 1 ) { //is it more than one minute
                let minutes = Math.floor( ( roomDefaults.queueWaitTime / 60 ) );
                theTime = minutes + ' minutes';
            }

            theMessage = theMessage.replace( "@username", djName );
            theMessage = theMessage.replace( ":time:", theTime );

            chatFunctions.botSpeak( theMessage, null, true );
        },

        clearDecksForVIPs: function ( userFunctions, authModule ) {
            if ( userFunctions.vipList.length !== 0 && userFunctions.howManyDJs() !== userFunctions.vipList.length ) {
                for ( let p = 0; p < userFunctions.howManyDJs(); p++ ) {
                    let checkIfVip = userFunctions.vipList.indexOf( userFunctions.djList()[ p ] );
                    if ( checkIfVip === -1 && userFunctions.djList()[ p ] !== authModule.USERID ) {
                        bot.remDj( userFunctions.djList()[ p ] );
                    }
                }
            }
        },

        formatBannedArtists: function () {
            if ( musicDefaults.bannedArtists.length !== 0 ) {
                let tempArray = [];
                let tempString = '(';

                //add a backslash in front of all special characters
                for ( let i = 0; i < musicDefaults.bannedArtists.length; i++ ) {
                    tempArray.push( musicDefaults.bannedArtists[ i ].replace( /([-[\]{}()*^=!:+?.,\\$|#\s])/g, "\\$1" ) );
                }

                //join everything into one string
                for ( let i = 0; i < musicDefaults.bannedArtists.length; i++ ) {
                    if ( i < musicDefaults.bannedArtists.length - 1 ) {
                        tempString += tempArray[ i ] + '|';
                    } else {
                        tempString += tempArray[ i ] + ')';
                    }
                }

                //create regular expression
                bannedArtistsMatcher = new RegExp( '\\b' + tempString + '\\b', 'i' );
            }
        },

        escortDJsDown: function ( data, currentDJ, botFunctions, userFunctions, chatFunctions ) {
            //iterates through the escort list and escorts all djs on the list off the stage.

            if ( userFunctions.escortMeIsEnabled( currentDJ ) === true ) {
                bot.remDj( currentDJ );
                userFunctions.removeEscortMeFromUser( currentDJ );

                const theMessage = '@' + userFunctions.getUsername( currentDJ ) + ' had enabled escortme';
                chatFunctions.botSpeak( theMessage, data );
            }
        },

        roomName: () => roomName,
        setRoomName: function ( value ) { roomName = value; },

        setRoomDefaults: function ( data ) {
            roomDefaults.detail = data.room.description; //used to get room description
            this.setRoomName( data.room.name ); //gets your rooms name
            roomDefaults.ttRoomName = data.room.shortcut; //gets room shortcut

            bot.playlistAll( function ( callback ) {
                botDefaults.botPlaylist = callback.list;
            } );

        },

        clearSongLimitTimer ( userFunctions, roomFunctions ) {
            //this is for the song length limit
            if ( songLimitTimer !== null ) {
                clearTimeout( songLimitTimer );
                songLimitTimer = null;

                if ( typeof userFunctions.theUsersList()[ userFunctions.theUsersList().indexOf( roomFunctions.lastdj() ) + 1 ] !== 'undefined' ) {
                    bot.speak( "@" + userFunctions.theUsersList()[ userFunctions.theUsersList().indexOf( roomFunctions.lastdj() ) + 1 ] + ", Thanks buddy ;-)" );
                } else {
                    bot.speak( 'Thanks buddy ;-)' );
                }
            }
        }
    }
}

module.exports = roomFunctions;
