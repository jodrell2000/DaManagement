let musicDefaults = require( '../defaultSettings/musicDefaults.js' );
let roomDefaults = require( '../defaultSettings/roomDefaults.js' );
let chatDefaults = require( '../defaultSettings/chatDefaults.js' );

let authModule = require( '../auth.js' );
const auth = require( '../auth.js' );
const countryLookup = require( "country-code-lookup" );

let theUsersList = []; // object array of everyone in the room
let afkPeople = []; //holds the userid of everyone who has used the /afk command
let modPM = []; //holds the userid's of everyone in the /modpm feature
let djList = []; //holds the userid of all the dj's who are on stage currently
let notifyThisDJ = null; // holds the ID of the DJ being told they're next in the queue
let superDJs = []; // list of users not removed by exceeding the playcount and who don't have to queue

/* Previously banned users
 *
 */

let bannedUsers = [ { id: "6040548a3f4bfc001be4c174", name: "bacon_cheeseburger" }, {
    id: "60d14bf5cd1ec800127fb964",
    name: "outlaw"
}, { id: "625a5dd088b736001f4160c3", name: "MustardX" }, {
    id: "636e831117f5ac001d2331c7",
    name: "wub the fuzzizzle"
}, { id: "6041125b3f4bfc001b27de48", name: "Eggman" }, {
    id: "617a2526d1a3d9001c8cd086",
    name: "Eggman"
}, { id: "62b94b7388b736001dfd42da", name: "Eggman" }, {
    id: "61b457a8d1a3d9001ce3b8b0",
    name: "Eggman"
}, { id: "604cfaa047c69b001b52cea5", name: "Eggman" }, {
    id: "61b460d8261cf0001dd4a8c6",
    name: "Eggman"
}, { id: "61837c92caf438001c80d56a", name: "Eggman" } ]; //banned users list, put userids in string form here for permanent banning(put their name after their userid to tell who is banned).
let permanentStageBan = [ { id: "60417796c2dbd9001be7573f" }, { id: "6046b7f947b5e3001be33745" } ]; //put userids in here to ban from djing permanently(put their name after their userid to tell who is banned)
// 6046b7f947b5e3001be33745 MC Swelter for repeated AFK Djing
// 60abaaa6eaab840012280b78 RealAlexJones TROLL!
let vipList = [];
/* this is the vip list, it accepts userids as input, this is for when you have a special guest or guests in your room and you only
   want to hear them dj, leave this empty unless you want everyone other than the people whos userids are in the vip list to be automatically kicked from stage. */

let masterIds = [ '6040a0333f4bfc001be4cf39', '604068d23f4bfc001be4c698' ]; //example (clear this before using) 
// jodrell: 6040a0333f4bfc001be4cf39
// Kelsi: 604068d23f4bfc001be4c698
/*  This is the master id list, userid's that are put in here will not be affected by the song length limit, artist / song banning, the /skip command, or the dj afk limit.
    This is meant to explicitly give extra privileges to yourself and anyone else you want to put in here. It takes userid's as input in string format separated by commas.
    You can put the person's name in the array either before or after a userid to tell who it belongs to, it will not affect its ability to function. */

let index = null; //the index returned when using unban commands
let informTimer = null; //holds the timeout for the /inform command, null lets it know that it hasn't already been set
let warnme = []; //holds the userid's of everyone using the /warnme feature

let queueList = []; //holds the userid of everyone in the queue

let DJPlaysLimited = musicDefaults.DJPlaysLimited; //song play limit, this is for the playLimit variable up above(off by default)
let DJsPlayLimit = musicDefaults.DJsPlayLimit; //set the playlimit here (default 4 songs)
let removeIdleDJs = roomDefaults.removeIdleDJs;
let djIdleLimit = roomDefaults.djIdleLimitThresholds[ 0 ]; // how long can DJs be idle before being removed
let idleFirstWarningTime = roomDefaults.djIdleLimitThresholds[ 1 ];
let idleSecondWarningTime = roomDefaults.djIdleLimitThresholds[ 2 ];

let functionStore = []; // store give RoboCoin callback functions

const addRCOperation = ( before, coins ) => ( before || 0 ) + coins;
const subtractRCOperation = ( before, coins ) => ( before || 0 ) - coins;

const userFunctions = ( bot ) => {

    function formatSeconds( seconds ) {
        return ( Math.floor( seconds / 60 ) ).toString() + ' minutes';
    }

    function formatHours( seconds ) {
        const theHours = Math.floor( seconds / ( 60 * 60 ) );
        const theMinutes = Math.floor( ( ( seconds / ( 60 * 60 ) ) - theHours ) * 60 );
        return ( theHours ).toString() + ' hours ' + ( theMinutes ).toString() + ' minutes';
    }

    function formatDays( seconds ) {
        const oneDaySeconds = 60 * 60 * 24;
        const oneHourSeconds = 60 * 60;
        const oneMinuteSeconds = 60;
        let remaining;

        const theDays = Math.floor( seconds / oneDaySeconds );
        remaining = seconds - ( theDays * oneDaySeconds );

        const theHours = Math.floor( ( remaining / oneHourSeconds ) );
        remaining = remaining - ( theHours * oneHourSeconds );

        const theMinutes = Math.floor( remaining / oneMinuteSeconds );

        return ( theDays ).toString() + ' days, ' + ( theHours ).toString() + ' hours and ' + ( theMinutes ).toString() + ' minutes';
    }

    function formatRelativeTime( seconds ) {
        if ( isNaN( seconds ) ) {
            return false
        } else if ( seconds < 60 * 60 ) {
            return formatSeconds( seconds );
        } else if ( seconds < 60 * 60 * 24 ) {
            return formatHours( seconds );
        } else {
            return formatDays( seconds );
        }
    }

    return {
        debugPrintTheUsersList: function () {
            console.info( "Full theUsersList: " + JSON.stringify( theUsersList ) );
        },

        theUsersList: () => theUsersList,
        modPM: () => modPM,

        bannedUsers: () => bannedUsers,
        permanentStageBan: () => permanentStageBan,

        masterIds: () => masterIds,

        index: () => index,
        informTimer: () => informTimer,
        warnme: () => warnme,

        resetModPM: function () {
            modPM = []
        },

        botStartReset: function ( botFunctions, songFunctions ) {
            // clear everything from memory in case there's any chuff
            this.resetQueueList();
            this.resetAFKPeople();
            this.resetModPM();
            this.clearDJList();

            songFunctions.loadPlaylist();

            const theStartTime = botFunctions.botStartTime();
            if ( !theStartTime ) {
                botFunctions.setBotStartTime();
            }
        },

        isPMerInRoom: function ( userID ) {
            let isInRoom = theUsersList.indexOf( userID );
            isInRoom = isInRoom !== -1;
            return isInRoom;
        },

        // ========================================================
        // User Storage Functions
        // ========================================================

        initialUserDataLoad: function ( databaseFunctions ) {
            theUsersList = databaseFunctions.readAllUserDataFromDisk();
        },

        storeUserData: async function ( userID, key, value, databaseFunctions ) {
            if ( this.userExists( userID ) && this.getUsername( userID ) !== "Guest" ) {
                try {
                    const userPosition = this.getPositionOnUsersList( userID );
                    theUsersList[ userPosition ][ key ] = value;
                    await databaseFunctions.storeUserData( theUsersList[ userPosition ] );
                } catch ( error ) {
                    console.error( "Error storing user data:", error.message );
                    throw error;
                }
            }
        },

        deleteUserData: function ( databaseFunctions, userID, key ) {
            if ( this.userExists( userID ) ) {
                delete theUsersList[ this.getPositionOnUsersList( userID ) ][ key ];
                databaseFunctions.storeUserData( theUsersList[ this.getPositionOnUsersList( userID ) ] );
            }
        },

        // ========================================================

        // ========================================================
        // Basic User Functions
        // ========================================================

        isThisTheBot: function ( userID ) {
            return userID === auth.USERID;
        },

        userExists: function ( userID ) {
            return theUsersList[ this.getPositionOnUsersList( userID ) ] !== undefined;
        },

        getUsername: function ( userID ) {
            if ( this.userExists( userID ) ) {
                let theUser = theUsersList.find( ( { id } ) => id === userID );
                return theUser.username;
            }
        },

        setEmailAddress: async function ( data, args, chatFunctions, databaseFunctions ) {
            try {
                const username = args[ 0 ];
                const userID = this.getUserIDFromUsername( username );
                const email = args[ 1 ];

                await this.storeUserData( userID, "email", email, databaseFunctions );
                chatFunctions.botSpeak( 'Email address for ' + username + ' set to ' + email, data );
            } catch ( error ) {
                console.error( 'Error setting email address:', error );
                throw error;
            }
        },
        verifyUsersEmail: async function ( userID, givenEmail, databaseFunctions ) {
            try {
                const returnedEmail = await databaseFunctions.getUsersEmailAddress( userID );
                return returnedEmail === givenEmail;
            } catch ( error ) {
                console.error( 'Error in verifyUsersEmail:', error );
                return false;
            }
        },

        getUserIDFromData: function ( data ) {
            return data.userid;
        },

        getUserIDFromUsername: function ( theUsername ) {
            for ( let userLoop = 0; userLoop < theUsersList.length; userLoop++ ) {
                if ( theUsersList[ userLoop ].username === theUsername ) {
                    return theUsersList[ userLoop ].id;
                }
            }
        },

        enableEscortMe: function ( data, chatFunctions, databaseFunctions ) {
            const theUserID = this.whoSentTheCommand( data );
            let theError = '';
            if ( this.escortMeIsEnabled( theUserID ) ) {
                theError += ", you've already enabled Escort Me...";
            }
            if ( !this.isUserIDOnStage( theUserID ) ) {
                theError += ", you're not on stage...";
            }

            if ( theError === '' ) {
                this.addEscortMeToUser( theUserID, databaseFunctions );
                chatFunctions.botSpeak( '@' + this.getUsername( theUserID ) + ' you will be escorted after you play your song', data );
            } else {
                chatFunctions.botSpeak( '@' + this.getUsername( theUserID ) + theError, data );
            }
        },

        disableEscortMe: function ( data, chatFunctions, databaseFunctions ) {
            const theUserID = this.whoSentTheCommand( data );
            let theError = '';
            if ( !this.escortMeIsEnabled( theUserID ) ) {
                theError += ", you haven't enabled Escort Me..."
            }
            if ( !this.isUserIDOnStage( theUserID ) ) {
                theError += ", you're not on stage..."
            }

            if ( theError === '' ) {
                this.removeEscortMeFromUser( theUserID, databaseFunctions );
                chatFunctions.botSpeak( '@' + this.getUsername( theUserID ) + ' you will no longer be escorted after you play your song', data );
            } else {
                chatFunctions.botSpeak( '@' + this.getUsername( theUserID ) + theError, data );
            }
        },

        whoSentTheCommand: function ( data ) {
            // if the command was PMd userID will contain the ID of the Bot user #facepalm
            // check if it was PMd and user senderid instead
            if ( data.command === 'pmmed' ) {
                return data.senderid;
            } else {
                return data.userid;
            }
        },

        // ========================================================

        // ========================================================
        // User Region Functions
        // ========================================================

        checkUsersHaveRegions: function ( data, chatFunctions ) {
            let userID;

            for ( let userCount = 0; userCount < data.users.length; userCount++ ) {
                if ( typeof data.users[ userCount ] !== 'undefined' ) {
                    userID = data.users[ userCount ].userid;
                    if ( this.userExists( userID ) ) {
                        this.askUserToSetRegion( userID, chatFunctions );
                    }
                }
            }
        },

        askUserToSetRegion: function ( userID, chatFunctions ) {
            if ( !this.getUserRegion( userID ) && !this.userWantsNoRegion( userID ) ) {
                chatFunctions.botPM( "If you'd like me to check that videos are playable in your region, please set it using the command '" + chatDefaults.commandIdentifier + "myRegion XX'. Replace XX with a valid 2 letter country code https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2 If you want to not be asked this again please user the command '" + chatDefaults.commandIdentifier + "noRegion'", userID );
            }
        },

        getUserRegion: function ( userID ) {
            if ( this.userExists( userID ) ) {
                const userPosition = this.getPositionOnUsersList( userID );
                const userRegion = theUsersList[ userPosition ][ 'region' ];

                // Check if 'region' is defined
                if ( userRegion !== undefined ) {
                    return userRegion;
                }
            }
        },

        myRegionCommand: async function ( data, args, chatFunctions, videoFunctions, databaseFunctions ) {
            const userID = this.whoSentTheCommand( data );

            if ( args[ 0 ] === undefined ) {
                chatFunctions.botSpeak( `@${ this.getUsername( userID ) } you must give a region code, e.g., \`/myregion GB\`. Please use one of the 2 character ISO country codes, [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2)`, data );
                return;
            }

            const theRegion = args[ 0 ].toUpperCase();
            const isValidRegion = theRegion.length === 2 && countryLookup.byIso( theRegion ) !== null;

            if ( !isValidRegion ) {
                chatFunctions.botSpeak( `@${ this.getUsername( userID ) } that region is not recognized. Please use one of the 2 character ISO country codes, [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2)`, data );
            } else {
                console.log( "this.getUserRegion( userID ): " + this.getUserRegion( userID ) );
                if ( !this.getUserRegion( userID ) ) {
                    this.storeUserRegion( data, userID, theRegion, chatFunctions, videoFunctions, databaseFunctions );
                } else {
                    await this.chargeMe( 50, data, chatFunctions, databaseFunctions, () =>
                        this.storeUserRegion( data, userID, theRegion, chatFunctions, videoFunctions, databaseFunctions, "to change your region" )
                    );
                }
            }
        },

        userWantsNoRegion: function ( userID ) {
            return theUsersList[ this.getPositionOnUsersList( userID ) ][ 'noregion' ];
        },

        storeUserRegion: function ( data, userID, region, chatFunctions, videoFunctions, databaseFunctions ) {
            this.deleteUserWantsNoRegion( userID, data, videoFunctions, chatFunctions, databaseFunctions );
            this.storeUserData( userID, "region", region, databaseFunctions );

            chatFunctions.botSpeak( "@" + this.getUsername( userID ) + " the region " + countryLookup.byIso( region ).country + " has been added to your user", data );
            this.updateRegionAlertsFromUsers( data, videoFunctions, chatFunctions );
        },

        deleteUserRegion: function ( userID, data, videoFunctions, chatFunctions, databaseFunctions ) {
            this.deleteUserData( databaseFunctions, userID, "region" );
            this.updateRegionAlertsFromUsers( data, videoFunctions, chatFunctions );
        },

        storeNoRegion: function ( data, chatFunctions, videoFunctions, databaseFunctions ) {
            const userID = this.whoSentTheCommand( data );

            this.deleteUserRegion( userID, data, videoFunctions, chatFunctions, databaseFunctions );
            this.storeUserData( userID, "noregion", true, databaseFunctions );

            chatFunctions.botSpeak( "You won't be asked again to set a region", data );
            this.updateRegionAlertsFromUsers( data, videoFunctions, chatFunctions );
        },

        deleteUserWantsNoRegion: function ( userID, data, videoFunctions, chatFunctions, databaseFunctions ) {
            this.deleteUserData( databaseFunctions, userID, "noregion" );
        },

        updateRegionAlertsFromUsers: function ( data, videoFunctions, chatFunctions ) {
            videoFunctions.resetAlertRegions();
            const userRegionsArray = this.getUniqueRegionsFromUsersInTheRoom( data );
            let thisRegion;

            // add regions that users have set that aren't being checked
            if ( userRegionsArray !== undefined ) {
                for ( let userRegionLoop = 0; userRegionLoop < userRegionsArray.length; userRegionLoop++ ) {
                    thisRegion = userRegionsArray[ userRegionLoop ];
                    if ( Object.keys( thisRegion ).length > 0 ) {
                        videoFunctions.addAlertRegion( data, thisRegion, chatFunctions, false );
                    }
                }
            }
        },

        getUniqueRegionsFromUsersInTheRoom: function () {
            let regionsArray = [];
            let userRegion;
            let userHere;

            for ( let userLoop = 0; userLoop < theUsersList.length; userLoop++ ) {
                userRegion = this.getUserRegion( theUsersList[ userLoop ][ "id" ] );
                userHere = this.isUserHere( theUsersList[ userLoop ][ "id" ] );
                if ( userHere && userRegion !== undefined ) {
                    regionsArray.push( this.getUserRegion( theUsersList[ userLoop ][ "id" ] ) );
                }
            }
            console.log( "Regions array:" + regionsArray.filter( ( v, i, a ) => a.indexOf( v ) === i ) );
            return regionsArray.filter( ( v, i, a ) => a.indexOf( v ) === i );
        },


        // ========================================================

        // ========================================================
        // Super User Functions
        // ========================================================

        superDJs: () => superDJs,

        addSuperDJ: function ( username, data, chatFunctions ) {
            const userID = this.getUserIDFromUsername( username );
            this.isSuperDJ( userID )
                .then( ( isSuperDJ ) => {
                    if ( !isSuperDJ ) {
                        superDJs.push( userID );
                        chatFunctions.botSpeak( this.getUsername( userID ) + " is now a SuperDJ", data );
                    } else {
                        chatFunctions.botSpeak( this.getUsername( userID ) + " is already a SuperDJ", data );
                    }
                } );
        },

        removeSuperDJ: function ( username, data, chatFunctions ) {
            const userID = this.getUserIDFromUsername( username );
            this.isSuperDJ( userID )
                .then( ( isSuperDJ ) => {
                    if ( !isSuperDJ ) {
                        chatFunctions.botSpeak( this.getUsername( userID ) + " is not a SuperDJ??", data );
                    } else {
                        superDJs.splice( superDJs.indexOf( userID ), 1 )
                        chatFunctions.botSpeak( this.getUsername( userID ) + " is no longer a SuperDJ", data );
                    }
                } );
        },

        isSuperDJ: function ( userID ) {
            return new Promise( ( resolve ) => {
                if ( superDJs.includes( userID ) ) {
                    resolve( true );
                } else {
                    resolve( false );
                }
            } );
        },

        clearSuperDJs: function ( data, chatFunctions ) {
            superDJs = [];
            this.readSuperDJs( data, chatFunctions );
        },

        readSuperDJs: function ( data, chatFunctions ) {
            if ( superDJs.length === 0 ) {
                chatFunctions.botSpeak( "There are currently no SuperDJs", data );
            } else {
                let usernameArray = [];
                for ( let i = 0; i < superDJs.length; i++ ) {
                    let username = this.getUsername( superDJs[ i ] );
                    usernameArray.push( username );
                }
                let usernameList = usernameArray.join( ', ' );

                chatFunctions.botSpeak( "The current SuperDJs are " + usernameList, data );
            }
        },

        // ========================================================

        readSingleUserStatus: function ( data, chatFunctions ) {
            let username = [];
            username.push( this.getUsername( this.whoSentTheCommand( data ) ) );

            this.readUserStatus( data, username, chatFunctions );
        },

        readUserStatus: function ( data, args, chatFunctions ) {
            let theUsername = '';
            for ( let userLoop = 0; userLoop < args.length; userLoop++ ) {
                theUsername += args[ userLoop ] + ' ';
            }
            theUsername = theUsername.substring( 0, theUsername.length - 1 );

            const theUserID = this.getUserIDFromUsername( theUsername );
            const roomJoined = formatRelativeTime( ( Date.now() - this.getUserJoinedRoom( theUserID ) ) / 1000 );
            let modText = '';
            if ( this.isUserModerator( theUserID ) !== true ) {
                modText = 'not '
            }
            const lastSpoke = formatRelativeTime( ( Date.now() - this.getUserLastSpoke( theUserID ) ) / 1000 );
            const lastVoted = formatRelativeTime( ( Date.now() - this.getUserLastVoted( theUserID ) ) / 1000 );
            const lastSnagged = formatRelativeTime( ( Date.now() - this.getUserLastSnagged( theUserID ) ) / 1000 );
            const joinedStage = formatRelativeTime( ( Date.now() - this.getUserJoinedStage( theUserID ) ) / 1000 );
            const spamCount = this.getUserSpamCount( theUserID );
            const currentPlayCount = this.getDJCurrentPlayCount( theUserID );
            const totalPlayCount = this.getDJTotalPlayCount( theUserID );

            if ( theUserID !== undefined ) {

                const sleep = ( delay ) => new Promise( ( resolve ) => setTimeout( resolve, delay ) )

                // the message is constructed in this way to add a brief pause before sending each part
                // this ensures that the messages appear in the correct order
                const readStatusInOrder = async () => {
                    chatFunctions.botSpeak( 'User info for ' + theUsername, data );
                    await sleep( 100 )

                    chatFunctions.botSpeak( '- userID is ' + theUserID, data );
                    await sleep( 100 )

                    chatFunctions.botSpeak( '- joined the room ' + roomJoined + ' ago', data );
                    await sleep( 100 )

                    chatFunctions.botSpeak( '- is ' + modText + 'a Moderator', data );
                    await sleep( 100 )

                    if ( lastSpoke !== false ) {
                        chatFunctions.botSpeak( '- spoke ' + lastSpoke + ' ago', data );
                        await sleep( 100 )
                    }

                    if ( lastVoted !== false ) {
                        chatFunctions.botSpeak( '- voted ' + lastVoted + ' ago', data );
                        await sleep( 100 )
                    }

                    if ( lastSnagged !== false ) {
                        chatFunctions.botSpeak( '- snagged ' + lastSnagged + ' ago', data );
                        await sleep( 100 )
                    }

                    if ( joinedStage !== false ) {
                        chatFunctions.botSpeak( '- DJd ' + joinedStage + ' ago', data );
                        await sleep( 100 )
                    }

                    chatFunctions.botSpeak( '- SPAM count=' + spamCount, data );
                    await sleep( 100 )

                    if ( currentPlayCount !== undefined ) {
                        chatFunctions.botSpeak( '- current playcount=' + currentPlayCount, data );
                        await sleep( 100 )
                    }

                    if ( !isNaN( totalPlayCount ) ) {
                        chatFunctions.botSpeak( '- total playcount=' + totalPlayCount, data );
                        await sleep( 100 )
                    }
                }
                readStatusInOrder();
            } else {
                chatFunctions.botSpeak( 'I couldn\'t find the details for that user. Please check the spelling, and capitalisation', data );
            }

        },

        getUserJoinedRoom: function ( userID ) {
            if ( this.userExists( userID ) ) {
                let userPosition = this.getPositionOnUsersList( userID );
                return theUsersList[ userPosition ][ 'joinTime' ];
            }
        },

        getUserLastVoted: function ( userID ) {
            if ( this.userExists( userID ) ) {
                let userPosition = this.getPositionOnUsersList( userID );
                return theUsersList[ userPosition ][ 'lastVoted' ];
            }
        },

        getUserLastSpoke: function ( userID ) {
            if ( this.userExists( userID ) ) {
                let userPosition = this.getPositionOnUsersList( userID );
                return theUsersList[ userPosition ][ 'lastSpoke' ];
            }
        },

        getUserLastSnagged: function ( userID ) {
            if ( this.userExists( userID ) ) {
                let userPosition = this.getPositionOnUsersList( userID );
                return theUsersList[ userPosition ][ 'lastSnagged' ];
            }
        },

        getUserJoinedStage: function ( userID ) {
            if ( this.userExists( userID ) ) {
                let userPosition = this.getPositionOnUsersList( userID );
                return theUsersList[ userPosition ][ 'joinedStage' ];
            }
        },

        // "songCount":0

        // ========================================================

        // ========================================================
        // Moderator Management Functions
        // ========================================================

        resetModerators: function ( data, databaseFunctions ) {
            let userID;
            if ( data.room !== undefined ) {
                for ( let modLoop = 0; modLoop < data.room.metadata.moderator_id.length; modLoop++ ) {
                    userID = data.room.metadata.moderator_id[ modLoop ];
                    if ( this.userExists( userID ) ) {
                        this.storeUserData( userID, 'moderator', true, databaseFunctions );
                    }
                }
            }
        },

        addModerator: function ( userID, databaseFunctions ) {
            this.storeUserData( userID, 'moderator', true, databaseFunctions );
        },

        removeModerator: function ( userID, databaseFunctions ) {
            this.storeUserData( userID, 'moderator', false, databaseFunctions );
        },

        isUserModerator: function ( theUserID ) {
            if ( this.userExists( theUserID ) ) {
                let userPosition = this.getPositionOnUsersList( theUserID );
                return theUsersList[ userPosition ][ 'moderator' ] === true;
            }
        },

        // ========================================================

        // ========================================================
        // Command Count Functions
        // ========================================================

        getCommandCount: function ( receiverID, theCommand ) {
            if ( this.userExists( receiverID ) ) {
                return theUsersList[ this.getPositionOnUsersList( receiverID ) ][ theCommand + 'Count' ];
            }
        },

        updateCommandCount: function ( receiverID, theCommand, databaseFunctions ) {
            let commandCount = this.getCommandCount( receiverID, theCommand );
            if ( commandCount === undefined ) {
                commandCount = 0
            }
            this.storeUserData( receiverID, theCommand + 'Count', commandCount + 1, databaseFunctions );
            databaseFunctions.incrementCommandCountForCurrentTrack( theCommand );
        },


        // ========================================================

        // ========================================================
        // VIP Functions
        // ========================================================

        vipList: () => vipList,

        isUserVIP: function ( userID ) {
            return this.vipList().indexOf( userID ) !== -1;
        },

        // ========================================================

        // ========================================================
        // User SPAM Functions
        // ========================================================

        resetAllSpamCounts: function () {
            //sets everyones spam count to zero
            //puts people on the global afk list when it joins the room
            for ( let userLoop = 0; userLoop < theUsersList.length; userLoop++ ) {
                theUsersList[ userLoop ][ 'spamCount' ] = 0;
            }
        },

        incrementSpamCounter: function ( userID, databaseFunctions ) {
            if ( this.userExists( userID ) ) {
                const key = "spamCount";
                const value = this.getUserSpamCount( userID );
                this.storeUserData( userID, key, value, databaseFunctions )

                if ( theUsersList[ this.getPositionOnUsersList( userID ) ][ 'spamTimer' ] !== null ) {
                    clearTimeout( theUsersList[ this.getPositionOnUsersList( userID ) ][ 'spamTimer' ] );
                    this.resetUserSpamTimer( userID, databaseFunctions );
                }

                theUsersList[ this.getPositionOnUsersList( userID ) ][ 'spamTimer' ] = setTimeout( function ( userID ) {
                    this.resetUsersSpamCount( userID, databaseFunctions );
                }.bind( this ), 10 * 1000 );
            }
        },

        resetUserSpamTimer: function ( userID, databaseFunctions ) {
            this.storeUserData( userID, "spamTimer", null, databaseFunctions )
        },

        resetUsersSpamCount: function ( userID, databaseFunctions ) {
            this.storeUserData( userID, "spamCount", 0, databaseFunctions );
        },

        getUserSpamCount: function ( userID ) {
            if ( this.userExists( userID ) ) {
                return theUsersList[ this.getPositionOnUsersList( userID ) ][ 'spamCount' ];
            }
        },


        // ========================================================

        // ========================================================
        // Refresh Functions
        // ========================================================

        refreshCommand: function ( data, chatFunctions, botFunctions, databaseFunctions ) {
            const theUserID = this.whoSentTheCommand( data );
            let [ , theMessage ] = this.addRefreshToUser( theUserID, botFunctions, databaseFunctions );

            chatFunctions.botSpeak( theMessage, data );
        },

        addRefreshToUser: function ( userID, botFunctions, databaseFunctions ) {
            if ( botFunctions.refreshingEnabled() ) {
                if ( this.isUserInUsersList( userID ) ) {
                    if ( this.isUserIDOnStage( userID ) ) {
                        if ( !this.isUserInRefreshList( userID ) ) {
                            const listPosition = this.getPositionOnUsersList( userID );
                            this.storeUserData( userID, 'RefreshStart', Date.now(), databaseFunctions );
                            this.storeUserData( userID, 'RefreshCount', this.getUsersRefreshCount() + 1, databaseFunctions );
                            this.storeUserData( userID, 'RefreshCurrentPlayCount', this.getDJCurrentPlayCount( userID ), databaseFunctions );
                            this.storeUserData( userID, 'RefreshTotalPlayCount', this.getDJTotalPlayCount( userID ), databaseFunctions );

                            theUsersList[ listPosition ][ 'RefreshTimer' ] = setTimeout( function () {
                                this.removeRefreshFromUser( userID, databaseFunctions );
                            }.bind( this ), roomDefaults.amountOfTimeToRefresh * 1000 );

                            let message = '@' + this.getUsername( userID ) + ' I\'ll hold your spot on stage for the next ' + roomDefaults.amountOfTimeToRefresh / 60 + ' minutes';
                            return [ true, message ]
                        } else {
                            return [ false, "You're already using the refresh command" ];
                        }
                    } else {
                        return [ false, "You're not currently DJing...so you don't need the refresh command" ];
                    }
                } else {
                    return [ false, "You seem not to exist. Please tell a Moderator! (err: userFunctions.addRefreshToUser)" ];
                }
            } else {
                return [ false, "Use of the /refresh command is currently disabled" ]
            }
        },

        getUsersRefreshCount: function ( userID ) {
            if ( this.userExists( userID ) ) {
                return theUsersList[ this.getPositionOnUsersList( userID ) ][ 'RefreshCount' ];
            }
        },

        removeRefreshFromUser: function ( userID, databaseFunctions ) {
            this.deleteUserData( databaseFunctions, userID, "RefreshStart" );
            this.deleteUserData( databaseFunctions, userID, "RefreshCurrentPlayCount" );
            this.deleteUserData( databaseFunctions, userID, "RefreshTotalPlayCount" );
            this.deleteUserData( databaseFunctions, userID, "RefreshTimer" );
        },

        // ========================================================

        // ========================================================
        // Refresh Helper Functions
        // ========================================================

        isUserInRefreshList: function ( userID ) {
            if ( this.userExists( userID ) ) {
                return theUsersList[ this.getPositionOnUsersList( userID ) ][ 'RefreshStart' ] !== undefined;
            }
        },

        getUsersRefreshCurrentPlayCount: function ( userID ) {
            if ( this.userExists( userID ) ) {
                let listPosition = this.getPositionOnUsersList( userID );
                if ( theUsersList[ listPosition ][ 'RefreshCurrentPlayCount' ] !== undefined ) {
                    return theUsersList[ listPosition ][ 'RefreshCurrentPlayCount' ];
                } else {
                    return 0;
                }
            }
        },

        getUsersRefreshTotalPlayCount: function ( userID ) {
            if ( this.userExists( userID ) ) {
                let listPosition = this.getPositionOnUsersList( userID );
                if ( theUsersList[ listPosition ][ 'RefreshTotalPlayCount' ] !== undefined ) {
                    return theUsersList[ listPosition ][ 'RefreshTotalPlayCount' ];
                }
            }
        },

        refreshDJCount: function () {
            let theCount = 0;
            for ( let userLoop = 0; userLoop < theUsersList.length; userLoop++ ) {
                if ( theUsersList[ userLoop ][ 'RefreshStart' ] !== undefined ) {
                    theCount++;
                }
            }
            return theCount;
        },

        whosRefreshingCommand: function ( data, chatFunctions ) {
            let userList = '';
            for ( let userLoop = 0; userLoop < theUsersList.length; userLoop++ ) {
                if ( theUsersList[ userLoop ][ 'RefreshStart' ] !== undefined ) {
                    userList += theUsersList[ userLoop ].username + ', ';
                }
            }

            userList = userList.substring( 0, userList.length - 2 );
            const lastComma = userList.lastIndexOf( ',' );
            if ( lastComma !== -1 ) {
                userList = userList.substring( 0, lastComma ) + ' and' + userList.substring( lastComma + 1 )
            }

            if ( userList === '' ) {
                chatFunctions.botSpeak( 'No users are currently refreshing.', data );
            } else {
                chatFunctions.botSpeak( 'The following users are currently refreshing. ' + userList, data );
            }
        },

        // ========================================================

        // ========================================================
        // Idle Functions (have people just gone away)
        // ========================================================

        roomIdle: () => roomDefaults.roomIdle,
        enableRoomIdle: function () {
            roomDefaults.roomIdle = true;
        },
        disableRoomIdle: function () {
            roomDefaults.roomIdle = false;
        },

        djIdleLimit: () => djIdleLimit,

        removeIdleDJs: () => removeIdleDJs,
        enableDJIdle: function ( data, chatFunctions ) {
            removeIdleDJs = true;
            this.reportDJIdleStatus( data, chatFunctions );
        },
        disableDJIdle: function ( data, chatFunctions ) {
            removeIdleDJs = false;
            this.reportDJIdleStatus( data, chatFunctions );
        },
        reportDJIdleStatus: function ( data, chatFunctions ) {
            if ( this.removeIdleDJs() ) {
                chatFunctions.botSpeak( 'DJs who have been idle for longer than ' + this.djIdleLimit() + ' will be removed from the decks', data )
            } else {
                chatFunctions.botSpeak( 'Automatic removal of idle DJs is disabled', data )
            }
        },

        idleFirstWarningTime: () => idleFirstWarningTime,
        setIdleFirstWarningTime: function ( data, args, chatFunctions ) {
            const newWarningTime = args[ 0 ];
            if ( isNaN( newWarningTime ) ) {
                chatFunctions.botSpeak( 'I can\'t set the First Idle Warning time to ' + newWarningTime + ' minutes', data );
            } else {
                idleFirstWarningTime = newWarningTime;
                chatFunctions.botSpeak( 'DJs will now be given their first Idle warning after ' + newWarningTime + ' minutes', data );
            }
        },

        idleSecondWarningTime: () => idleSecondWarningTime,
        setIdleSecondWarningTime: function ( data, args, chatFunctions ) {
            const newWarningTime = args[ 0 ];
            if ( isNaN( newWarningTime ) ) {
                chatFunctions.botSpeak( 'I can\'t set the Second Idle Warning time to ' + newWarningTime + ' minutes', data );
            } else {
                idleSecondWarningTime = newWarningTime;
                chatFunctions.botSpeak( 'DJs will now be given their Second Idle Warning after ' + newWarningTime + ' minutes', data );
            }
        },

        updateUserLastSpoke: function ( userID, databaseFunctions ) {
            this.storeUserData( userID, "lastSpoke", Date.now(), databaseFunctions )
        },

        updateUserLastVoted: function ( userID, databaseFunctions ) {
            this.storeUserData( userID, "lastVoted", Date.now(), databaseFunctions )
        },

        updateUserLastSnagged: function ( userID, databaseFunctions ) {
            this.storeUserData( userID, "lastSnagged", Date.now(), databaseFunctions )
        },

        updateUserJoinedStage: function ( userID, databaseFunctions ) {
            this.storeUserData( userID, "joinedStage", Date.now(), databaseFunctions )
        },

        getIdleTime: function ( userID ) {
            let userLastActive = this.getUserJoinedRoom( userID );

            if ( roomDefaults.voteMeansActive ) {
                let lastVoted = this.getUserLastVoted( userID );
                if ( lastVoted > userLastActive ) {
                    userLastActive = lastVoted;
                }
            }

            if ( roomDefaults.speechMeansActive ) {
                let lastSpoke = this.getUserLastSpoke( userID );
                if ( lastSpoke > userLastActive ) {
                    userLastActive = lastSpoke;
                }
            }

            if ( roomDefaults.snagMeansActive ) {
                let lastSnagged = this.getUserLastSnagged( userID );
                if ( lastSnagged > userLastActive ) {
                    userLastActive = lastSnagged;
                }
            }

            if ( roomDefaults.djingMeansActive ) {
                let joinedStage = this.getUserJoinedStage( userID );
                if ( joinedStage > userLastActive ) {
                    userLastActive = joinedStage;
                }
            }

            return ( Date.now() - userLastActive ) / 1000; // return usersAFK time in seconds
        },

        idleWarning: function ( userID, threshold, chatFunctions ) {
            let theMessage;
            let theActions = '';
            let idleLimit = this.djIdleLimit();
            let minutesRemaining = idleLimit - threshold;

            if ( minutesRemaining !== 0 ) {
                theMessage = 'You have less than ' + minutesRemaining + ' minutes of idle left.';
                if ( roomDefaults.voteMeansActive === true ) {
                    theActions += ' Awesome,';
                }
                if ( roomDefaults.speechMeansActive === true ) {
                    theActions += ' Chat,';
                }
                if ( roomDefaults.snagMeansActive === true ) {
                    theActions += ' Grab a song,';
                }
                theActions = theActions.substring( 0, theActions.length - 1 );
                const lastComma = theActions.lastIndexOf( ',' );
                if ( lastComma !== -1 ) {
                    theActions = theActions.substring( 0, lastComma ) + ' or' + theActions.substring( lastComma + 1 )
                }

                theActions += ' to show that you\'re awake';
                theMessage += theActions;
            } else {
                theMessage = 'You are over the idle limit of ' + idleLimit + ' minutes.';
            }

            chatFunctions.botSpeak( '@' + this.getUsername( userID ) + ' ' + theMessage, null, roomDefaults.warnIdlePublic, userID );
        },

        checkHasUserIdledOut: function ( userID, threshold ) {
            let totalIdleAllowed = this.djIdleLimit();
            return this.getIdleTime( userID ) / 60 > ( totalIdleAllowed - threshold );
        },

        //removes idle dj's after roomDefaultsModule.djIdleLimit is up.
        idledOutDJCheck: function ( roomDefaults, chatFunctions, databaseFunctions ) {
            let totalIdleAllowed = this.djIdleLimit();
            let firstWarning = this.idleFirstWarningTime();
            let finalWarning = this.idleSecondWarningTime();
            let userID;

            for ( let djLoop = 0; djLoop < djList.length; djLoop++ ) {
                userID = djList[ djLoop ]; //Pick a DJ
                if ( userID !== authModule.USERID ) {
                    let idleTImeInMinutes = this.getIdleTime( userID ) / 60;
                    if ( idleTImeInMinutes > totalIdleAllowed ) {
                        this.idleWarning( userID, djIdleLimit, chatFunctions );
                        this.removeDJ( userID, 'DJ has idled out' ); //remove them
                        chatFunctions.botChat( 'The user ' + '@' + this.getUsername( userID ) + ' was removed for being over the ' + totalIdleAllowed + ' minute idle limit.' );
                    } else if ( ( idleTImeInMinutes > finalWarning ) && !this.hasDJHadSecondIdleWarning( userID ) ) {
                        this.setDJSecondIdleWarning( userID, databaseFunctions );
                        this.idleWarning( userID, finalWarning, chatFunctions );
                    } else if ( ( idleTImeInMinutes > firstWarning ) && !this.hasDJHadFirstIdleWarning( userID ) ) {
                        this.setDJFirstIdleWarning( userID, databaseFunctions );
                        this.idleWarning( userID, firstWarning, chatFunctions );
                    } else if ( idleTImeInMinutes < firstWarning && ( this.hasDJHadFirstIdleWarning( userID ) || this.hasDJHadSecondIdleWarning( userID ) ) ) {
                        this.resetDJIdleWarnings( userID, databaseFunctions );
                    }
                }
            }
        },

        setDJFirstIdleWarning: function ( userID, databaseFunctions ) {
            if ( this.userExists( userID ) ) {
                this.storeUserData( userID, "firstIdleWarning", true, databaseFunctions );
            }
        },

        hasDJHadFirstIdleWarning: function ( userID ) {
            if ( this.userExists( userID ) ) {
                return theUsersList[ this.getPositionOnUsersList( userID ) ][ 'firstIdleWarning' ];
            }
        },

        setDJSecondIdleWarning: function ( userID, databaseFunctions ) {
            if ( this.userExists( userID ) ) {
                this.storeUserData( userID, "secondIdleWarning", true, databaseFunctions );
            }
        },

        hasDJHadSecondIdleWarning: function ( userID ) {
            if ( this.userExists( userID ) ) {
                return theUsersList[ this.getPositionOnUsersList( userID ) ][ 'secondIdleWarning' ];
            }
        },

        resetDJIdleWarnings: function ( userID, databaseFunctions ) {
            this.clearDJFirstIdleWarning( userID, databaseFunctions );
            this.clearDJSecondIdleWarning( userID, databaseFunctions );
        },

        clearDJFirstIdleWarning: function ( userID, databaseFunctions ) {
            if ( this.userExists( userID ) ) {
                this.storeUserData( userID, "firstIdleWarning", false, databaseFunctions );
            }
        },

        clearDJSecondIdleWarning: function ( userID, databaseFunctions ) {
            if ( this.userExists( userID ) ) {
                this.storeUserData( userID, "secondIdleWarning", false, databaseFunctions );
            }
        },

        //this removes people on the floor, not the djs
        roomIdleCheck: function ( roomDefaults, chatFunctions ) {
            if ( roomDefaults.roomIdle === true ) {
                let theUserID;
                for ( let userLoop = 0; userLoop < theUsersList.length; userLoop++ ) {
                    theUserID = theUsersList[ userLoop ].id;

                    if ( theUserID !== authModule.USERID ) {
                        if ( this.checkHasUserIdledOut( theUserID, roomDefaults.roomIdleLimit, 0 ) ) {
                            this.idleWarning( theUserID, 0, roomDefaults.roomIdleLimit, chatFunctions )
                            bot.boot( theUserID, 'you are over the idle limit' );
                        } else if ( this.checkHasUserIdledOut( theUserID, roomDefaults.roomIdleLimit, 1 ) ) {
                            this.idleWarning( theUserID, 1, roomDefaults.roomIdleLimit, chatFunctions )
                        } else if ( this.checkHasUserIdledOut( theUserID, roomDefaults.roomIdleLimit, 5 ) ) {
                            this.idleWarning( theUserID, 5, roomDefaults.roomIdleLimit, chatFunctions )
                        }
                    }
                }
            }
        },

        // ========================================================

        // ========================================================
        // User Timer functions
        // ========================================================

        isUsersWelcomeTimerActive: function ( userID ) {
            return theUsersList[ this.getPositionOnUsersList( userID ) ][ 'welcomeTimer' ] === true;
        },

        activateUsersWelcomeTimer: function ( userID, databaseFunctions ) {
            this.storeUserData( userID, "welcomeTimer", true, databaseFunctions );

            setTimeout( function () {
                this.clearUsersWelcomeTimer( userID, databaseFunctions );
            }.bind( this ), 5 * 60 * 1000 );
        },

        clearUsersWelcomeTimer: function ( userID, databaseFunctions ) {
            this.storeUserData( userID, "welcomeTimer", false, databaseFunctions );
        },

        // ========================================================

        // ========================================================
        // AFK Functions (for the afk command)
        // ========================================================

        afkPeople: () => afkPeople,
        resetAFKPeople: function () {
            afkPeople = []
        },

        whosAFK: function ( data, chatFunctions ) {
            let userList = '';
            let afkCount = 0;
            for ( let userLoop = 0; userLoop < this.afkPeople().length; userLoop++ ) {
                afkCount++;
                userList += this.getUsername( this.afkPeople()[ userLoop ] ) + ', ';
            }

            userList = userList.substring( 0, userList.length - 2 );
            const lastComma = userList.lastIndexOf( ',' );
            if ( lastComma !== -1 ) {
                userList = userList.substring( 0, lastComma ) + ' and' + userList.substring( lastComma + 1 )
            }

            if ( afkCount > 0 ) {
                if ( afkCount === 1 ) {
                    userList += ' is';
                } else {
                    userList += ' are';
                }
                userList += ' marked as AFK';
                chatFunctions.botSpeak( userList, data )
            } else {
                chatFunctions.botSpeak( "No one...everyone's here :-)", data )
            }
        },

        isUserAFK: function ( userID ) {
            let isAlreadyAfk = afkPeople.indexOf( userID );
            return isAlreadyAfk !== -1;
        },

        switchUserAFK: function ( data, chatFunctions ) {
            const theUserID = this.whoSentTheCommand( data );
            if ( this.isUserAFK( theUserID ) === true ) {
                this.removeUserFromAFKList( data, chatFunctions );
            } else {
                this.addToAFKList( data, chatFunctions );
            }
        },

        addToAFKList: function ( data, chatFunctions ) {
            const theUserID = this.whoSentTheCommand( data );

            afkPeople.push( theUserID );
            chatFunctions.botSpeak( '@' + this.getUsername( theUserID ) + ' you are marked as afk', data )
        },

        removeUserFromAFKList: function ( data, chatFunctions ) {
            const theUserID = this.whoSentTheCommand( data );
            this.removeUserIDFromAFKArray( theUserID );
            chatFunctions.botSpeak( '@' + this.getUsername( theUserID ) + ' you are no longer afk', data )
        },

        removeUserIDFromAFKArray: function ( theUserID ) {
            const listPosition = afkPeople.indexOf( theUserID );
            afkPeople.splice( listPosition, 1 );
        },

        howManyAFKUsers: function () {
            return afkPeople.length;
        },

        sendUserIsAFKMessage: function ( data, userID, chatFunctions ) {
            chatFunctions.botSpeak( '@' + this.getUsername( userID ) + ' is currently AFK, sorry', data )
        },


        // ========================================================

        // ========================================================
        // DJ Core Functions
        // ========================================================

        djList: () => djList,

        clearDJList: function () {
            djList = []
        },

        addDJToList: function ( userID ) {
            djList.push( userID );
        },

        removeDJFromList: function ( userID ) {
            const listPosition = djList.indexOf( userID )
            if ( listPosition !== -1 ) {
                djList.splice( listPosition, 1 );
            }
        },

        howManyDJs: function () {
            return djList.length;
        },

        clearCurrentDJFlags: function ( databaseFunctions ) {
            for ( let userLoop = 0; userLoop < theUsersList.length; userLoop++ ) {
                this.storeUserData( theUsersList[ userLoop ][ 'id' ], "currentDJ", false, databaseFunctions );
            }
        },

        setCurrentDJ: function ( userID, databaseFunctions ) {
            this.clearCurrentDJFlags( databaseFunctions )
            if ( this.userExists( userID ) ) {
                this.storeUserData( userID, "currentDJ", true, databaseFunctions );
            }
        },

        getCurrentDJID: function () {
            for ( let userLoop = 0; userLoop < theUsersList.length; userLoop++ ) {
                if ( theUsersList[ userLoop ][ 'currentDJ' ] === true ) {
                    return theUsersList[ userLoop ][ 'id' ];
                }
            }

            return null;
        },

        getLastDJID: function () {
            return djList[ this.howManyDJs() - 1 ];
        },

        lastDJPlaying: function () {
            return this.getCurrentDJID() === this.getLastDJID();
        },

        getNextDJ: function () {
            let nextDJID;
            const currentDJID = this.getCurrentDJID();
            const currentDJPosition = djList.indexOf( currentDJID );

            nextDJID = djList[ currentDJPosition + 1 ];

            if ( nextDJID + 1 > this.howManyDJs() || nextDJID === undefined ) {
                nextDJID = djList[ 0 ];
            }

            return nextDJID;
        },


        // ========================================================

        // ========================================================
        // DJ Helper Functions
        // ========================================================

        isUserIDStageBanned: function ( userID ) {
            const stageBanned = permanentStageBan.findIndex( ( { id } ) => id === userID );
            return stageBanned !== -1;
        },

        isUserBannedFromRoom: function ( userID ) {
            return bannedUsers.some( ( { id } ) => id === userID );
        },

        isUserIDOnStage: function ( userID ) {
            const onStage = djList.indexOf( userID );
            return onStage !== -1;
        },

        isCurrentDJ: function ( data, userID ) {
            const currentDJ = data.room.metadata.current_dj
            return userID === currentDJ;
        },

        resetDJs: function ( data ) {
            this.clearDJList();
            let djID;
            if ( data.room !== undefined ) {
                for ( let djLoop = 0; djLoop < data.room.metadata.djs.length; djLoop++ ) {
                    djID = data.room.metadata.djs[ djLoop ];
                    if ( typeof djID !== 'undefined' ) {
                        this.addDJToList( djID );
                    }
                }
            }
        },

        checkOKToDJ: function ( theUserID, roomFunctions ) {
            if ( theUserID === authModule.USERID ) {
                return [ true, '' ];
            }

            if ( superDJs.includes( theUserID ) ) {
                return [ true, '' ];
            }

            if ( !this.isUserVIP( theUserID ) && roomDefaults.vipsOnly ) {
                return [ false, "The VIP list is active...and you're not on the list. Sorry!" ];
            }

            if ( roomDefaults.queueActive ) {
                if ( this.isUserInRefreshList( theUserID ) ) {
                    return [ true, '' ];
                }

                if ( this.isUserIDInQueue( theUserID ) ) {
                    if ( theUserID !== this.headOfQueue() ) {
                        return [ false, '@' + this.getUsername( theUserID ) + ', sorry, but you are not first in queue. please wait your turn.' ];
                    } else {
                        return [ true, '' ];
                    }
                } else {
                    return [ false, '@' + this.getUsername( theUserID ) + ', the queue is currently active. To add yourself to the queue type ' + chatDefaults.commandIdentifier + 'addme. To remove yourself from the queue type ' + chatDefaults.commandIdentifier + 'removeme.' ];
                }
            }

            if ( this.refreshDJCount() + this.djList().length >= roomFunctions.maxDJs() ) {
                return [ false, '@' + this.getUsername( theUserID ) + ', sorry, but I\'m holding that spot for someone in the refresh list' ];
            }

            for ( let banLoop = 0; banLoop < roomFunctions.tempBanList().length; banLoop++ ) {
                if ( theUserID === roomFunctions.tempBanList()[ banLoop ] ) {
                    return [ false, '@' + this.getUsername( theUserID ) + ', you are banned from djing. Please speak to a Mod to find out why' ];
                }
            }

            if ( this.isUserIDStageBanned( theUserID ) ) {
                return [ false, '@' + this.getUsername( theUserID ) + ', you are banned from djing. Please speak to a Mod to find out why' ];
            }

            if ( this.getUserSpamCount( theUserID ) >= roomDefaults.spamLimit ) {
                return [ false, '@' + this.getUsername( theUserID ) + ', you\'ve been SPAMming too much...please want a few minutes before trying again' ];
            }

            return [ true, '' ];
        },

        resetDJFlags: function ( userID, databaseFunctions ) {
            if ( this.userExists( ( userID ) ) ) {
                this.resetDJCurrentPlayCount( userID, databaseFunctions );
                this.clearDJFirstIdleWarning( userID, databaseFunctions );
                this.clearDJSecondIdleWarning( userID, databaseFunctions );
            }
        },

        removeDJ: function ( djID, message ) {
            console.group( '! removeDJ ===============================' );
            console.log( '========================================' );

            let currentDateTime = require( 'moment' );
            console.log( 'DJ removed at ' + currentDateTime().format( 'DD/MM/yyyy HH:mm:ss' ) );
            console.log( 'The DJ ' + this.getUsername( djID ) + ' with ID ' + djID + ' is being removed from the decks' );
            console.log( 'Reason: ' + message );
            bot.remDj( djID );

            console.log( '========================================' );
            console.groupEnd();
        },

        // ========================================================

        // ========================================================
        // DJ Play Limit Functions
        // ========================================================


        removeDJsOverPlaylimit: async function ( data, chatFunctions, userID ) {
            if ( this.DJPlaysLimited() === true && !superDJs.includes( userID ) ) {

                if ( userID !== authModule.USERID && this.isCurrentDJ( data, userID ) && this.getDJCurrentPlayCount( userID ) >= this.DJsPlayLimit() ) {
                    if ( this.userExists( userID ) ) {
                        chatFunctions.overPlayLimit( data, this.getUsername( userID ), this.DJsPlayLimit() );

                        this.removeDJ( userID, 'DJ is over play limit' );
                    }
                }
            }
        },

        DJPlaysLimited: () => DJPlaysLimited,
        enablePlayLimit: function () {
            DJPlaysLimited = true;
        },
        disablePlayLimit: function () {
            DJPlaysLimited = false;
        },

        DJsPlayLimit: () => DJsPlayLimit,
        setDJsPlayLimit: function ( value ) {
            DJsPlayLimit = value;
        },

        playLimitOnCommand: function ( data, args, chatFunctions ) {
            let theNewPlayLimit = args[ 0 ];
            if ( isNaN( theNewPlayLimit ) ) {
                theNewPlayLimit = musicDefaults.DJsPlayLimit
            }
            this.enablePlayLimit();
            this.setDJsPlayLimit( theNewPlayLimit );
            chatFunctions.botSpeak( 'The play limit is now set to ' + this.DJsPlayLimit(), data );
        },

        playLimitOffCommand: function ( data, chatFunctions ) {
            this.disablePlayLimit();
            chatFunctions.botSpeak( 'The play limit is now disabled', data );
        },

        whatsPlayLimit: function ( data, chatFunctions ) {
            if ( this.DJPlaysLimited() ) {
                chatFunctions.botSpeak( 'The DJ play limit is currently set to ' + this.DJsPlayLimit(), data );
            } else {
                chatFunctions.botSpeak( 'The DJ play limit is not currently active', data );
            }
        },

        // ========================================================

        // ========================================================
        // DJ Play Count Functions
        // ========================================================

        deleteAllDJsPlayCounts: function ( databaseFunctions ) {
            for ( let userLoop = 0; userLoop < theUsersList.length; userLoop++ ) {
                this.deleteAllDJPlayCounts( theUsersList[ userLoop ][ 'id' ], databaseFunctions );
            }
        },

        initialiseAllDJPlayCounts: function ( userID, databaseFunctions ) {
            if ( this.isUserInUsersList( userID ) ) {
                this.setDJCurrentPlayCount( userID, 0, databaseFunctions );
                this.setDJTotalPlayCount( userID, 0, databaseFunctions );
            }
        },

        incrementDJPlayCount: function ( userID, databaseFunctions ) {
            if ( this.userExists( userID ) ) {
                if ( isNaN( theUsersList[ this.getPositionOnUsersList( userID ) ][ 'currentPlayCount' ] ) ) {
                    this.setDJCurrentPlayCount( userID, 1, databaseFunctions );
                } else {
                    this.storeUserData( userID, "currentPlayCount", this.getDJCurrentPlayCount( userID ) + 1, databaseFunctions );
                }

                if ( isNaN( theUsersList[ this.getPositionOnUsersList( userID ) ][ 'totalPlayCount' ] ) ) {
                    this.setDJTotalPlayCount( userID, 1, databaseFunctions );
                } else {
                    this.storeUserData( userID, "totalPlayCount", this.getDJTotalPlayCount( userID ) + 1, databaseFunctions );
                }
            }
        },

        decrementDJCurrentPlayCount: function ( userID, databaseFunctions ) {
            this.storeUserData( userID, "currentPlayCount", this.getDJCurrentPlayCount( userID ) - 1, databaseFunctions );
        },

        resetDJCurrentPlayCount: function ( userID, databaseFunctions ) {
            if ( this.userExists( userID ) ) {
                this.setDJCurrentPlayCount( userID, 0, databaseFunctions );
            }
        },

        setDJCurrentPlaycountCommand: function ( data, theCount, theUsername, chatFunctions, databaseFunctions ) {
            if ( theCount === undefined || isNaN( theCount ) ) {
                chatFunctions.botSpeak( "The new playcount doesn't seem to be a number. Check the command help for an example", data )
            } else if ( theUsername === '' || theUsername === undefined ) {
                chatFunctions.botSpeak( "I can't see a username there. Check the command help for an example", data )
            } else {
                chatFunctions.botSpeak( "Setting the Current playcount for @" + theUsername + " to " + theCount, data )
                this.setDJCurrentPlayCount( this.getUserIDFromUsername( theUsername ), theCount, databaseFunctions );
            }
        },

        setDJCurrentPlayCount: function ( userID, theCount, databaseFunctions ) {
            if ( theCount === undefined ) {
                theCount = 0
            }
            this.storeUserData( userID, "currentPlayCount", theCount, databaseFunctions )
        },


        resetDJTotalPlayCount: function ( userID, databaseFunctions ) {
            if ( this.userExists( userID ) ) {
                this.setDJTotalPlayCount( userID, 0, databaseFunctions );
            }
        },

        setDJTotalPlayCount: function ( userID, theCount, databaseFunctions ) {
            if ( theCount === undefined ) {
                theCount = 0
            }

            if ( this.userExists( userID ) ) {
                this.storeUserData( userID, "totalPlayCount", theCount, databaseFunctions )
            }
        },


        deleteAllDJPlayCounts: function ( userID, databaseFunctions ) {
            this.deleteUserData( databaseFunctions, userID, 'currentPlayCount' );
            this.deleteUserData( databaseFunctions, userID, 'totalPlayCount' );
        },

        getDJCurrentPlayCount: function ( userID ) {
            if ( this.userExists( userID ) ) {
                return theUsersList[ this.getPositionOnUsersList( userID ) ][ 'currentPlayCount' ];
            }
        },

        getDJTotalPlayCount: function ( userID ) {
            if ( this.userExists( userID ) ) {
                return theUsersList[ this.getPositionOnUsersList( userID ) ][ 'totalPlayCount' ];
            }
        },

        djPlaysCommand: function ( data, chatFunctions ) {
            chatFunctions.botSpeak( this.buildDJPlaysMessage(), data );
        },


        buildDJPlaysMessage: function () {
            if ( this.djList().length === 0 ) {
                return 'There are no dj\'s on stage.';
            } else {
                let theMessage = '';
                let theUserID;
                let theUserPosition;
                let theUsername;
                let theCurrentPlayCount;
                let theTotalPlayCount;

                for ( let djLoop = 0; djLoop < this.djList().length; djLoop++ ) {
                    theUserID = this.djList()[ djLoop ];
                    theUsername = this.getUsername( theUserID );
                    theUserPosition = this.getPositionOnUsersList( theUserID );
                    theCurrentPlayCount = theUsersList[ theUserPosition ][ 'currentPlayCount' ];
                    theTotalPlayCount = theUsersList[ theUserPosition ][ 'totalPlayCount' ];

                    theMessage += theUsername + ': ' + theCurrentPlayCount;
                    if ( theCurrentPlayCount !== theTotalPlayCount && theTotalPlayCount !== undefined ) {
                        theMessage += '(' + theTotalPlayCount + '), ';
                    } else {
                        theMessage += ', ';
                    }
                }

                theMessage = 'The play counts are now ' + theMessage.substring( 0, theMessage.length - 2 );
                return theMessage;
            }
        },

        // ========================================================

        // ========================================================
        // DJ Queue Core Functions
        // ========================================================

        queueList: () => queueList,

        resetQueueList: function () {
            queueList = []
        },

        addUserToQueue: function ( userID ) {
            if ( !roomDefaults.queueActive ) {
                return [ false, "the queue is disabled." ];
            }

            if ( this.isUserIDInQueue( userID ) === true ) {
                return [ false, "you are already in the queue." ];
            }

            if ( this.isUserIDOnStage( userID ) === true ) {
                return [ false, "you are already on stage!" ];
            }

            if ( this.isUserIDStageBanned( userID ) === true ) {
                return [ false, "sorry, you are banned from the stage." ];
            }

            queueList.push( userID );
            return [ true, '' ];
        },

        removeUserFromQueue: function ( userID, botFunctions ) {
            botFunctions.setSayOnce( true );
            if ( !this.isUserIDInQueue( userID ) ) {
                return [ true, "not in queue" ];
            } else {
                const queuePosition = queueList.indexOf( userID );
                queueList.splice( queuePosition, 1 );
                return [ false, '' ];
            }
        },

        isUserIDInQueue: function ( userID ) {
            const inQueue = queueList.indexOf( userID );
            return inQueue !== -1;
        },

        changeUsersQueuePosition: function ( data, args, chatFunctions, botFunctions ) {
            const username = args[ 0 ];
            const userID = this.getUserIDFromUsername( username );
            const newPosition = args[ 1 ] - 1;
            const [ err, ] = this.removeUserFromQueue( userID, botFunctions );

            if ( err !== true ) {
                queueList.splice( newPosition, 0, userID );
            } else {
                chatFunctions.botSpeak( "The user " + this.getUsername( userID ) + " is not currently in the queue", data );
            }
            this.readQueue( data, chatFunctions );
        },

        moveUserToHeadOfQueue: function ( data, args, chatFunctions, botFunctions ) {
            args[ 1 ] = 1;
            this.changeUsersQueuePosition( data, args, chatFunctions, botFunctions );
        },

        // ========================================================

        // ========================================================
        // DJ Queue Helper Functions
        // ========================================================

        headOfQueue: function () {
            return queueList[ 0 ];
        },

        notifyThisDJ: () => notifyThisDJ,

        setDJToNotify: function ( userID ) {
            notifyThisDJ = userID;
        },

        clearDJToNotify: function () {
            notifyThisDJ = null;
        },

        whatsMyQueuePosition: function ( data, chatFunctions ) {
            const userID = this.whoSentTheCommand( data );

            if ( !roomDefaults.queueActive ) {
                chatFunctions.botSpeak( '@' + this.getUsername( userID ) + ', the queue is currently disabled', data );
            } else {
                const queuePosition = queueList.findIndex( ( { id } ) => id === userID ) + 1;
                if ( queuePosition !== -1 ) {
                    chatFunctions.botSpeak( '@' + this.getUsername( userID ) + ', you are currently at position ' + queuePosition + ' in the queue', data );
                } else {
                    chatFunctions.botSpeak( '@' + this.getUsername( userID ) + ', you are not currently in the queue', data );
                }
            }
        },

        addme: function ( data, chatFunctions ) {
            const userID = this.whoSentTheCommand( data );

            const [ added, theMessage ] = this.addUserToQueue( userID );

            if ( added === true ) {
                this.readQueue( data, chatFunctions )
            } else {
                chatFunctions.botSpeak( theMessage, data );
            }
        },

        removeNotifyDJFromQueue: function ( botFunctions, userFunctions ) {
            bot.speak( 'Sorry @' + userFunctions.getUsername( this.notifyThisDJ().toString() ) + ' you have run out of time.' );
            this.removeUserFromQueue( this.notifyThisDJ(), botFunctions );
            this.clearDJToNotify();
            botFunctions.setSayOnce( true );
        },

        removeme: function ( data, chatFunctions, botFunctions ) {
            const userID = this.whoSentTheCommand( data );
            if ( this.isUserIDInQueue( userID ) ) {
                this.removeUserFromQueue( userID, botFunctions )
                chatFunctions.botSpeak( "@" + this.getUsername( userID ) + ', I\'ve removed you from the queue', data );
            } else {
                chatFunctions.botSpeak( "@" + this.getUsername( userID ) + ', you\'re not currently in the queue. Use the ' + chatDefaults.commandIdentifier + 'addme command to join', data );
            }
            this.readQueue( data, chatFunctions )
        },

        enableQueue: function ( data, chatFunctions ) {
            if ( roomDefaults.queueActive === true ) {
                chatFunctions.botSpeak( "The queue is already enabled", data );
            } else {
                roomDefaults.queueActive = true;
                chatFunctions.botSpeak( "The queue is now on", data );
            }
        },

        disableQueue: function ( data, chatFunctions ) {
            if ( roomDefaults.queueActive !== true ) {
                chatFunctions.botSpeak( "The queue is already disabled", data );
            } else {
                roomDefaults.queueActive = false;
                chatFunctions.botSpeak( "The queue is now off", data );
            }
        },

        readQueue: function ( data, chatFunctions ) {
            if ( roomDefaults.queueActive === true ) {
                chatFunctions.botSpeak( this.buildQueueMessage(), data );
            } else {
                chatFunctions.botSpeak( "The DJ queue is not active", data );
            }
        },

        buildQueueMessage: function () {
            let listOfUsers = '';
            let message;
            let thisQueuePosition = 1;

            queueList.forEach( function ( userID ) {
                if ( listOfUsers === '' ) {
                    listOfUsers = '[' + thisQueuePosition + '] ' + this.getUsername( userID );
                } else {
                    listOfUsers = listOfUsers + ', [' + thisQueuePosition + '] ' + this.getUsername( userID );

                }
                thisQueuePosition++;
            }.bind( this ) );

            if ( listOfUsers !== '' ) {
                message = "The DJ queue is currently: " + listOfUsers;
            } else {
                message = "The DJ queue is empty...";
            }

            return message;
        },

        // ========================================================

        // ========================================================
        // User Object Functions
        // ========================================================

        resetUsersList: function () {
            theUsersList.splice( 0, theUsersList.length );
        },

        updateUser: function ( data, databaseFunctions ) {
            if ( typeof data.name === 'string' ) {
                let oldname = ''; // holds users old name if exists
                let queueNamePosition;
                let queueListPosition;
                let afkPeoplePosition;

                // when person updates their profile
                // and their name is not found in the users list then they must have changed
                // their name
                if ( theUsersList.indexOf( data.name ) === -1 ) {
                    let nameIndex = theUsersList.indexOf( data.userid );
                    if ( nameIndex !== -1 ) // if their userid was found in theUsersList
                    {
                        oldname = theUsersList[ nameIndex + 1 ];
                        this.storeUserData( data.userid, "username", data.name, databaseFunctions );

                        if ( typeof oldname !== 'undefined' ) {
                            queueNamePosition = userFunctions.queueName().indexOf( oldname );
                            queueListPosition = userFunctions.queueList().indexOf( oldname );
                            afkPeoplePosition = afkPeople.indexOf( oldname );


                            if ( queueNamePosition !== -1 ) //if they were in the queue when they changed their name, then replace their name
                            {
                                userFunctions.queueName()[ queueNamePosition ] = data.name;
                            }

                            if ( queueListPosition !== -1 ) //this is also for the queue
                            {
                                userFunctions.queueList()[ queueListPosition ] = data.name;
                            }

                            if ( afkPeoplePosition !== -1 ) //this checks the afk list
                            {
                                afkPeople[ afkPeoplePosition ] = data.name;
                            }
                        }
                    }
                }
            }
        },

        deregisterUser: function ( userID, databaseFunctions ) {
            //double check to make sure that if someone is on stage and they disconnect, that they are being removed
            //from the current Dj's array
            let checkIfStillInDjArray = djList.indexOf( userID );
            if ( checkIfStillInDjArray !== -1 ) {
                djList.splice( checkIfStillInDjArray, 1 );
            }

            if ( this.isUserAFK( userID ) ) {
                this.removeUserIDFromAFKArray( userID );
            }

            //removes people leaving the room in modpm still
            if ( modPM.length !== 0 ) {
                let areTheyStillInModpm = modPM.indexOf( userID );

                if ( areTheyStillInModpm !== -1 ) {
                    let whatIsTheirName = theUsersList.indexOf( userID );
                    modPM.splice( areTheyStillInModpm, 1 );

                    if ( whatIsTheirName !== -1 ) {
                        for ( let hg = 0; hg < modPM.length; hg++ ) {
                            if ( typeof modPM[ hg ] !== 'undefined' && modPM[ hg ] !== userID ) {
                                bot.pm( theUsersList[ whatIsTheirName + 1 ] + ' has left the modpm chat', modPM[ hg ] );
                            }
                        }
                    }
                }
            }

            this.removeUserIsHere( userID, databaseFunctions );
        },

        bootNewUserCheck: function ( userID, username ) {
            let bootUser = false;
            let bootMessage = null;

            if ( roomDefaults.kickTTSTAT === true && username === "@ttstat" ) {
                bootUser = true;
            }

            //checks to see if user is on the blacklist, if they are they are booted from the room.
            for ( let i = 0; i < roomDefaults.blackList.length; i++ ) {
                if ( userID === roomDefaults.blackList[ i ] ) {
                    bootUser = true;
                    bootMessage = 'You are on the user banned list.';
                    break;
                }
            }

            //checks if user is on the banned list
            const thisUserIsBanned = this.isUserBannedFromRoom( userID );
            if ( thisUserIsBanned ) {
                bootUser = true;
                bootMessage = 'You are on the banned user list.';
            }

            // don't let the bot boot itself!
            if ( userID === authModule.USERID ) {
                bootUser = false;
            }
            return [ bootUser, bootMessage ];
        },

        bootThisUser: function ( userID, bootMessage ) {
            console.group( "! bootThisUser ===============================" );
            console.log( '========================================' );
            if ( bootMessage == null ) {
                console.log( "Booting userID:" + userID );
                bot.boot( userID );
            } else {
                console.log( "Booting userID:" + userID + " with message:" + bootMessage );
                bot.bootUser( userID, bootMessage );
            }
            console.groupEnd();
        },

        greetNewuser: function ( userID, username, roomFunctions ) {
            //gets newest user and prints greeting, does not greet the bot or the ttstats bot, or banned users
            if ( roomFunctions.greet() === true && userID !== authModule.USERID && !username.match( '@ttstat' ) ) {
                const greetingTimers = roomFunctions.greetingTimer();

                // if there's a timeout function waiting to be called for
                // this user, cancel it.
                if ( greetingTimers[ userID ] !== null ) {
                    clearTimeout( greetingTimers[ userID ] );
                    delete greetingTimers[ userID ];
                }

                return true;
            }
        },

        addUserJoinedTime: function ( userID, databaseFunctions ) {
            if ( this.userExists( userID ) && !this.getUserJoinedRoom( userID ) ) {
                this.storeUserData( userID, "joinTime", Date.now(), databaseFunctions )
            }
        },

        getPositionOnUsersList: function ( userID ) {
            return theUsersList.findIndex( ( { id } ) => id === userID )
        },

        userJoinsRoom: function ( userID, username, databaseFunctions ) {
            //adds users who join the room to the user list if their not already on the list
            this.addUserToTheUsersList( userID, username, databaseFunctions );

            // if they've previously been in the room as a guest we won't have their name
            // best update it from the raw data that was passed into this function to be sure
            this.updateUsername( userID, username, databaseFunctions );

            //starts time for everyone that joins the room
            this.addUserJoinedTime( userID, databaseFunctions );

            //sets new persons spam count to zero
            this.resetUsersSpamCount( userID, databaseFunctions );

            // remove the user from afk, just in case it was hanging around from a previous visit
            if ( this.isUserAFK( userID ) ) {
                this.removeUserIDFromAFKArray( userID );
            }

            this.addUserIsHere( userID, databaseFunctions );
        },

        updateUsername: function ( userID, username, databaseFunctions ) {
            if ( this.userExists( userID ) ) {
                this.storeUserData( userID, "username", username, databaseFunctions );
            }
        },

        isUserHere: function ( userID ) {
            if ( this.userExists( userID ) ) {
                return theUsersList[ this.getPositionOnUsersList( userID ) ][ 'here' ];
            }
        },

        addUserIsHere: function ( userID, databaseFunctions ) {
            if ( this.userExists( userID ) ) {
                this.storeUserData( userID, "here", true, databaseFunctions );
            }
        },

        removeUserIsHere: function ( userID, databaseFunctions ) {
            if ( this.userExists( userID ) ) {
                this.deleteUserData( databaseFunctions, userID, "here" );
            }
        },

        checkForEmptyUsersList: function ( data ) {
            if ( theUsersList.length === 0 ) {
                this.rebuildUserList( data );
            }
        },

        isUserInUsersList: function ( userID ) {
            // if the userID is in the userList return true, else false
            return theUsersList.find( ( { id } ) => id === userID ) !== undefined;
        },

        addUserToTheUsersList: function ( userID, username, databaseFunctions ) {
            if ( !this.isUserInUsersList( userID ) ) {
                theUsersList.push( { id: userID, username: username } );
            }
            this.addUserIsHere( userID, databaseFunctions );
        },

        rebuildUserList: function ( data ) {
            let userID;

            for ( let i = 0; i < data.users.length; i++ ) {
                if ( typeof data.users[ i ] !== 'undefined' ) {
                    userID = data.users[ i ].userid;
                    if ( !this.userExists( userID ) ) {
                        this.addUserToTheUsersList( userID, data.users[ i ].name );
                    }
                }
            }
        },

        startAllUserTimers: function ( databaseFunctions ) {
            //starts time in room for everyone currently in the room
            for ( let userLoop = 0; userLoop < theUsersList.length; userLoop++ ) {
                if ( typeof theUsersList[ userLoop ].id !== 'undefined' ) {
                    this.addUserJoinedTime( theUsersList[ userLoop ].id, databaseFunctions );
                }
            }
        },

        // ========================================================

        // ========================================================
        // Other User Functions
        // ========================================================

        checkTextForUsernames: function ( theText ) {
            let loopUsername;
            let mentions = [];

            if ( theText.indexOf( '@' ) !== -1 ) {
                for ( let afkPeopleLoop = 0; afkPeopleLoop < afkPeople.length; afkPeopleLoop++ ) {
                    loopUsername = this.getUsername( afkPeople[ afkPeopleLoop ] );
                    if ( theText.indexOf( '@' + loopUsername ) !== -1 ) {
                        mentions.push( loopUsername );
                    }
                }
            }

            return mentions;
        },

        // ========================================================

        // ========================================================
        // Inform Functions
        // ========================================================

        clearInformTimer: function ( roomFunctions ) {
            //this is for the /inform command
            if ( informTimer !== null ) {
                clearTimeout( informTimer );
                informTimer = null;

                if ( typeof theUsersList[ theUsersList.indexOf( roomFunctions.lastdj() ) + 1 ] !== 'undefined' ) {
                    bot.speak( "@" + theUsersList[ theUsersList.indexOf( roomFunctions.lastdj() ) + 1 ] + ", Thanks buddy ;-)" );
                } else {
                    bot.speak( 'Thanks buddy ;-)' );
                }
            }
        },

        // ========================================================

        // ========================================================
        // Warn Me Functions
        // ========================================================

        warnMeCall: function ( roomFunctions ) {
            if ( warnme.length !== 0 ) //is there anyone in the warnme?
            {
                let whatIsPosition = djList.indexOf( roomFunctions.checkWhoIsDj() ); //what position are they

                if ( whatIsPosition === djList.length - 1 ) //if 5th dj is playing, check guy on the left
                {
                    let areTheyNext = warnme.indexOf( djList[ 0 ] );
                    if ( areTheyNext !== -1 ) //is the next dj up in the warnme?
                    {
                        bot.pm( 'your song is up next!', djList[ 0 ] );
                        warnme.splice( areTheyNext, 1 );

                    }
                } else {
                    let areTheyNext = warnme.indexOf( djList[ whatIsPosition + 1 ] );
                    if ( areTheyNext !== -1 ) //is the next dj up in the warnme?
                    {
                        bot.pm( 'your song is up next!', djList[ whatIsPosition + 1 ] );
                        warnme.splice( areTheyNext, 1 );

                    }
                }
            }
        },

        resetAllWarnMe: function ( data, databaseFunctions ) {
            let theUserID;
            if ( data.room !== undefined ) {
                for ( let userLoop = 0; userLoop < data.users.length; userLoop++ ) {
                    theUserID = data.users[ userLoop ];
                    if ( typeof theUserID !== 'undefined' ) {
                        this.removeWarnMeFromUser( theUserID, databaseFunctions );
                    }
                }
            }
        },

        addWarnMeToUser( userID, databaseFunctions ) {
            if ( this.isUserInUsersList( userID ) ) {
                this.storeUserData( userID, "WarnMe", true, databaseFunctions );
            }
        },

        removeWarnMeFromUser( userID, databaseFunctions ) {
            if ( this.isUserInUsersList( userID ) ) {
                this.deleteUserData( databaseFunctions, userID, "WarnMe" );
            }
        },

        // ========================================================

        // ========================================================
        // Escort Me Functions
        // ========================================================

        resetAllEscortMe: function ( data, databaseFunctions ) {
            let theUserID;
            if ( data.room !== undefined ) {
                for ( let userLoop = 0; userLoop < data.users.length; userLoop++ ) {
                    theUserID = data.users[ userLoop ];
                    if ( typeof theUserID !== 'undefined' ) {
                        this.removeEscortMeFromUser( theUserID, databaseFunctions );
                    }
                }
            }
        },

        addEscortMeToUser: function ( userID, databaseFunctions ) {
            if ( this.isUserInUsersList( userID ) ) {
                this.storeUserData( userID, "EscortMe", true, databaseFunctions );
            }
        },

        removeEscortMeFromUser: function ( userID, databaseFunctions ) {
            if ( this.isUserInUsersList( userID ) ) {
                this.deleteUserData( databaseFunctions, userID, "EscortMe" );
            }
        },

        escortMeIsEnabled: function ( userID ) {
            if ( this.isUserInUsersList( userID ) ) {
                return theUsersList[ this.getPositionOnUsersList( userID ) ][ 'EscortMe' ] === true;
            }
        },

        // ========================================================

        // ========================================================
        // Special Functions
        // ========================================================

        bbUserID: function () {
            return "604154083f4bfc001c3a42ed";
        },

        bbBoot: function ( data, chatFunctions, databaseFunctions ) {
            const bootingUserID = this.whoSentTheCommand( data );

            if ( bootingUserID === this.bbUserID() ) {
                chatFunctions.botSpeak( "You can't boot yourself @Bukkake, you ain't that flexible!", data );
            } else if ( bootingUserID === authModule.USERID ) {
                // you can't use the bot to speak the boot command
                chatFunctions.botSpeak( "Yeah, nope...", data );
            } else {
                if ( this.isBBHere() ) {
                    if ( this.canBBBoot( bootingUserID ) ) {
                        if ( this.canBBBeBooted() ) {
                            const bootMessage = "Sorry @Bukkake, you got booted by @" + this.getUsername( bootingUserID ) + ". They win 5 RoboCoins!!!";
                            this.bbBootSomeone( data, this.bbUserID(), bootingUserID, bootMessage, chatFunctions, databaseFunctions );
                        } else {
                            const bootMessage = "Sorry " + this.getUsername( bootingUserID ) + ", you lose. BB was booted within the last 24Hrs. @Bukkake wins 1 RoboCoin!";
                            this.bbBootSomeone( data, bootingUserID, bootingUserID, bootMessage, chatFunctions, databaseFunctions );
                        }
                    } else {
                        const msSinceLastBoot = Date.now() - this.getBBBootedTimestamp( bootingUserID );
                        const formatttedLastBBBooted = formatRelativeTime( msSinceLastBoot / 1000 );
                        chatFunctions.botSpeak( 'Sorry @' + this.getUsername( bootingUserID ) + ", you can't play BBBoot again yet. You last played " + formatttedLastBBBooted + " ago", data );
                    }
                } else {
                    chatFunctions.botSpeak( 'Sorry @' + this.getUsername( bootingUserID ) + ", but I can't boot BB if they're not here!", data );
                }
            }

        },

        getBBBootedTimestamp: function ( userID ) {
            if ( this.userExists( userID ) ) {
                return theUsersList[ this.getPositionOnUsersList( userID ) ][ 'BBBootTimestamp' ];
            }
        },

        updateBBBootedTimestamp: function ( userID, databaseFunctions ) {
            this.storeUserData( userID, "BBBootTimestamp", Date.now(), databaseFunctions );
        },

        isBBHere: function () {
            return this.isUserHere( this.bbUserID() );
        },

        canBBBeBooted: function () {
            return this.withinBBBootTime( this.bbUserID(), 24 );
        },

        canBBBoot: function ( userID ) {
            const hours = 24 + ( Math.floor( Math.random() * 12 ) );
            return this.withinBBBootTime( userID, hours );
        },

        withinBBBootTime: function ( userID, hours ) {
            return Date.now() - this.getBBBootedTimestamp( userID ) >= 3600000 * hours;
        },

        bbBootSomeone: function ( data, bootedUserID, bootingUserID, bootMessage, chatFunctions, databaseFunctions ) {
            const sleep = ( delay ) => new Promise( ( resolve ) => setTimeout( resolve, delay ) )

            const performInOrder = async () => {
                chatFunctions.botSpeak( "Nah Nah Nah Nah...", data );
                await sleep( 2000 )

                chatFunctions.botSpeak( "Nah Nah Nah Nah...", data );
                await sleep( 2000 )

                chatFunctions.botSpeak( "Hey Hey Hey...", data );
                await sleep( 2000 )

                chatFunctions.botSpeak( "Goodbye @" + this.getUsername( bootedUserID ), data );
                await sleep( 5000 )

                this.bootThisUser( bootedUserID, bootMessage )
                //chatFunctions.botSpeak( bootMessage, data );
                await sleep( 100 )

                this.updateBBBootedTimestamp( bootedUserID, databaseFunctions );
                await sleep( 100 )
            }
            performInOrder();

            if ( bootedUserID === this.bbUserID() ) {
                this.updateRoboCoins( bootingUserID, this.getRoboCoins( bootingUserID ) + 5, databaseFunctions )
            } else {
                this.updateRoboCoins( this.bbUserID(), this.getRoboCoins( this.bbUserID() ) + 1, databaseFunctions )
            }
        },

        // ========================================================

        // ========================================================
        // Username Functions
        // ========================================================

        returnUsernameFromMessageAfterArguments: function ( theMessage ) {
            const regex = /^\/giverc (\d+) (.+)$/;

            // Use the regular expression to match the message
            const match = theMessage.match( regex );

            // If there is a match, return the username (captured in the second group)
            // Otherwise, return null or an empty string based on your preference
            return match ? match[ 2 ] : null;
        },

        // ========================================================

        // ========================================================
        // RoboCoin Functions
        // ========================================================

        getRoboCoins: async function ( userID ) {
            return new Promise( ( resolve, reject ) => {
                if ( this.userExists( userID ) ) {
                    const position = this.getPositionOnUsersList( userID );
                    let theCoins = parseInt( theUsersList[ position ][ 'RoboCoins' ], 10 );
                    if ( isNaN( theCoins ) ) {
                        theCoins = 0;
                    }

                    resolve( theCoins );
                } else {
                    reject( new Error( 'User does not exist' ) );
                }
            } );
        },

        canUserAffordToSpendThisMuch: async function ( userID, numCoins, chatFunctions, data ) {
            try {
                const userRoboCoins = await this.getRoboCoins( userID );

                if ( userRoboCoins >= numCoins ) {
                    return true;
                } else {
                    chatFunctions.botSpeak( "Sorry @" + this.getUsername( userID ) + " you can't afford " + numCoins + " RoboCoins for that", data );
                    throw new Error( 'Insufficient funds' );
                }
            } catch ( error ) {
                // Handle any errors that may occur in getRoboCoins or due to insufficient funds
                throw new Error( 'Error checking user affordability' );
            }
        },

        subtractRoboCoins: async function ( userID, numCoins, changeReason, changeID, databaseFunctions ) {
            try {
                const coins = parseFloat( numCoins );
                await this.processRoboCoins( userID, coins, changeReason, changeID, subtractRCOperation, databaseFunctions );
            } catch ( error ) {
                console.error( 'Error in subtractRoboCoins:', error.message );
                // Handle the error as needed
            }
        },

        addRoboCoins: async function ( userID, numCoins, changeReason, changeID, databaseFunctions ) {
            try {
                const coins = parseFloat( numCoins );
                await this.processRoboCoins( userID, coins, changeReason, changeID, addRCOperation, databaseFunctions );
            } catch ( error ) {
                console.error( 'Error in addRoboCoins:', error.message );
                // Handle the error as needed
            }
        },

        processRoboCoins: async function ( userID, numCoins, changeReason, changeID, operation, databaseFunctions ) {
            console.group( "processRoboCoins" );
            console.log( "numCoins:" + numCoins );
            try {
                const before = await this.getRoboCoins( userID );
                console.log( "before:" + before );
                console.log( "type of before:" + typeof before );
                const updatedCoins = await operation( before, numCoins );
                console.log( "updatedCoins:" + updatedCoins );
                console.log( "type of updatedCoins:" + typeof updatedCoins );
                await this.updateRoboCoins( userID, updatedCoins, databaseFunctions );
                const after = await this.getRoboCoins( userID );
                console.log( "after:" + after );
                console.log( "type of after:" + typeof after );

                // Pass positive or negative numCoins to auditRoboCoin based on the type of operation
                await this.auditRoboCoin( userID, before, after, operation === addRCOperation ? numCoins : -numCoins, changeReason, changeID, databaseFunctions );
            } catch ( error ) {
                console.error( `Error in ${ operation.name }:`, error.message );
                throw error;
            }
            console.groupEnd();
        },

        updateRoboCoins: async function ( userID, coins, databaseFunctions ) {
            console.group( "updateRoboCoins" );
            console.log( "coins:" + coins );
            console.groupEnd();
            try {
                await this.storeUserData( userID, "RoboCoins", coins, databaseFunctions );
                return; // Resolve the promise without value (implicit)
            } catch ( error ) {
                throw new Error( 'User does not exist' ); // Reject the promise
            }
        },

        auditRoboCoin: async function ( userID, before, after, numCoins, changeReason, changeID, databaseFunctions ) {
            try {
                await databaseFunctions.saveRoboCoinAudit( userID, before, after, numCoins, changeReason, changeID );
            } catch ( error ) {
                console.error( 'Query failed:', error );
            } finally {
                console.groupEnd();
            }
        },

        validateNumCoins: async function ( numCoins, sendingUserID, chatFunctions, data ) {
            if ( numCoins === undefined || isNaN( numCoins ) ) {
                chatFunctions.botSpeak( '@' + this.getUsername( sendingUserID ) + ' you must give a number of coins to send, e.g. giverc 10 username', data );
                throw new Error( 'Invalid number of coins' );
            }
            return true;
        },

        validateReceivingUser: async function ( args, receivingUserID, sendingUserID, chatFunctions, data ) {
            if ( args[ 1 ] === undefined ) {
                chatFunctions.botSpeak( '@' + this.getUsername( sendingUserID ) + ' you must give the name of the user to send RoboCoins to, e.g. giverc 10 username', data );
                throw new Error( 'No receiving user specified' );
            }
            if ( receivingUserID === undefined ) {
                chatFunctions.botSpeak( '@' + this.getUsername( sendingUserID ) + " I can't find that username", data );
                throw new Error( 'User not found' );
            }
            return true;
        },

        handleError: async function ( error ) {
            console.error( 'RoboCoin error:', JSON.stringify( error ) );
        },

        giveInitialRoboCoinGift: async function ( data, userID, databaseFunctions, chatFunctions, roomFunctions ) {
            const numCoins = 100;
            const changeReason = "Welcome gift";
            const changeID = 1;
            await this.addRoboCoins( userID, numCoins, changeReason, changeID, databaseFunctions );
            setTimeout( () => {
                chatFunctions.botSpeak( "@" + this.getUsername( userID ) + " welcome to the " + roomFunctions.roomName() + " room. Have a gift of 100 RoboCoins!", data );
            }, 3 * 1000 );
        },

        // ========================================================

        // ========================================================
        // RoboCoin Commands
        // ========================================================


        readMyRoboCoin: async function ( data, chatFunctions ) {
            try {
                const userID = this.whoSentTheCommand( data );
                const theCoins = await this.getRoboCoins( userID );
                chatFunctions.botSpeak( '@' + this.getUsername( userID ) + " you currently have " + theCoins + " RoboCoins", data );
            } catch ( error ) {
                console.error( "Error reading RoboCoins:", error.message );
                // Handle the error as needed
            }
        },

        giveRoboCoinCommand: async function ( data, args, chatFunctions, databaseFunctions ) {
            const sendingUserID = this.whoSentTheCommand( data );
            const receivingUserID = this.getUserIDFromUsername( this.returnUsernameFromMessageAfterArguments( data.text ) );
            const numCoins = parseInt( args[ 0 ], 10 );

            try {
                await this.validateNumCoins( numCoins, sendingUserID, chatFunctions, data );
                await this.validateReceivingUser( args, receivingUserID, sendingUserID, chatFunctions, data );
                await this.canUserAffordToSpendThisMuch( sendingUserID, numCoins, chatFunctions, data );

                functionStore[ sendingUserID + "function" ] = () => {
                    return new Promise( ( innerResolve, innerReject ) => {
                        this.giveRoboCoinAction( sendingUserID, receivingUserID, numCoins, "Give RoboCoin", 2, chatFunctions, databaseFunctions, data )
                            .then( () => innerResolve() )
                            .catch( ( error ) => innerReject( error ) );
                    } );
                };

                functionStore[ sendingUserID + "timeout" ] = setTimeout( () => {
                    functionStore[ sendingUserID + "function" ] = null;
                    chatFunctions.botSpeak( "@" + this.getUsername( sendingUserID ) + " give RoboCoins command timed out", data );
                }, 60 * 1000 );

                chatFunctions.botSpeak( "@" + this.getUsername( sendingUserID ) + " please send the command /confirm to confirm you want to spend " + numCoins + " RoboCoins", data );
            } catch ( error ) {
                if ( error instanceof Error ) {
                    // If it's an instance of Error, pass the error object with its details
                    await this.handleError( error, chatFunctions, data );
                } else {
                    // If it's not an instance of Error, create a new error object with the message
                    await this.handleError( new Error( error ), chatFunctions, data );
                }
            }
        },

        confirmCommand: async function ( data, chatFunctions ) {
            const sendingUserID = this.whoSentTheCommand( data );
            if ( functionStore && functionStore[ sendingUserID + "function" ] && typeof functionStore[ sendingUserID + "function" ] === 'function' ) {
                functionStore[ sendingUserID + "function" ]()
                    .then( () => {
                        clearTimeout( functionStore[ sendingUserID + "timeout" ] );
                    } )
                    .then( () => {
                        functionStore[ sendingUserID + "function" ] = null;
                        functionStore[ sendingUserID + "timeout" ] = null;
                    } )
                    .catch( ( error ) => {
                        console.error( 'Error confirming command:', error );
                    } );
            } else {
                chatFunctions.botSpeak( "@" + this.getUsername( sendingUserID ) + " there's nothing to confirm??", data );
            }
        },

        giveRoboCoinAction: async function ( sendingUserID, receivingUserID, numCoins, changeReason, changeID, chatFunctions, databaseFunctions, data ) {
            try {
                await this.subtractRoboCoins( sendingUserID, numCoins, changeReason + " to " + this.getUsername( receivingUserID ), changeID, databaseFunctions );
                await this.addRoboCoins( receivingUserID, numCoins, changeReason + " from " + this.getUsername( sendingUserID ), changeID, databaseFunctions );

                chatFunctions.botSpeak( "@" + this.getUsername( sendingUserID ) + " gave " + numCoins + " to @" + this.getUsername( receivingUserID ), data );
                return Promise.resolve(); // Resolve the promise after successful execution
            } catch ( error ) {
                await this.handleError( error, chatFunctions, data );
                throw error; // Rethrow the error to propagate the rejection
            }
        },

        // ========================================================

        // ========================================================
        // Testing Generalised Chargeable Commands
        // ========================================================

        wibble: async function ( data, chatFunctions ) {
            chatFunctions.botSpeak( "wibble", data );
        },

        chargeMe: async function ( callCost, data, chatFunctions, databaseFunctions, functionCall, description = "" ) {
            const sendingUserID = this.whoSentTheCommand( data );

            try {
                await this.canUserAffordToSpendThisMuch( sendingUserID, callCost, chatFunctions, data );

                functionStore[ sendingUserID + "function" ] = () => {
                    return new Promise( ( innerResolve, innerReject ) => {
                        this.runCommandAndChargeForIt( sendingUserID, callCost, functionCall, databaseFunctions, description )
                            .then( () => innerResolve() )
                            .catch( ( error ) => innerReject( error ) );
                    } );
                };

                functionStore[ sendingUserID + "timeout" ] = setTimeout( () => {
                    functionStore[ sendingUserID + "function" ] = null;
                    chatFunctions.botSpeak( "@" + this.getUsername( sendingUserID ) + " command timed out", data );
                }, 60 * 1000 );

                chatFunctions.botSpeak( "@" + this.getUsername( sendingUserID ) + " please send the command /confirm to confirm you want to spend " + callCost + " RoboCoins " + description, data );

            } catch ( error ) {
                if ( error instanceof Error ) {
                    // If it's an instance of Error, pass the error object with its details
                    await this.handleError( error, chatFunctions, data );
                } else {
                    // If it's not an instance of Error, create a new error object with the message
                    await this.handleError( new Error( error ), chatFunctions, data );
                }
            }
        },

        runCommandAndChargeForIt: async function ( sendingUserID, callCost, functionCall, databaseFunctions, description ) {
            if ( description === "" ) {
                description = "Chargeable command";
            }
            const changeID = 4;
            await this.subtractRoboCoins( sendingUserID, callCost, description, changeID, databaseFunctions );
            functionCall();
        }
    }
}

module.exports = userFunctions;
