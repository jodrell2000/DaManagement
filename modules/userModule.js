let musicDefaults = require( '../defaultSettings/musicDefaults.js' );
let roomDefaults = require( '../defaultSettings/roomDefaults.js' );
let chatDefaults = require( '../defaultSettings/chatDefaults.js' );

let authModule = require( '../auth.js' );
const auth = require( '../auth.js' );

let theUsersList = []; // object array of everyone in the room
let afkPeople = []; //holds the userid of everyone who has used the /afk command
let modPM = []; //holds the userid's of everyone in the /modpm feature
let djList = []; //holds the userid of all the dj's who are on stage currently
let notifyThisDJ = null; // holds the ID of the DJ being told they're next in the queue

let bannedUsers = [ { id: 636473737373 }, { id: 535253533353 } ]; //banned users list, put userids in string form here for permanent banning(put their name after their userid to tell who is banned).
let permanentStageBan = [ { id: 636473737373 }, { id: 535253533353 } ]; //put userids in here to ban from djing permanently(put their name after their userid to tell who is banned)
let vipList = [];
/* this is the vip list, it accepts userids as input, this is for when you have a special guest or guests in your room and you only
   want to hear them dj, leave this empty unless you want everyone other than the people whos userids are in the vip list to be automatically kicked from stage. */

let masterIds = [ '6040a0333f4bfc001be4cf39' ]; //example (clear this before using)
/*  This is the master id list, userid's that are put in here will not be affected by the song length limit, artist / song banning, the /skip command, or the dj afk limit.
    This is meant to explicitly give extra privileges to yourself and anyone else you want to put in here. It takes userid's as input in string format separated by commas.
    You can put the person's name in the array either before or after a userid to tell who it belongs to, it will not affect its ability to function. */

let index = null; //the index returned when using unban commands
let informTimer = null; //holds the timeout for the /inform command, null lets it know that it hasn't already been set
let refreshDJCount = 0; // how many people are currently using the refresh command
let warnme = []; //holds the userid's of everyone using the /warnme feature

let queueList = []; //holds the userid of everyone in the queue

let DJPlaysLimited = musicDefaults.DJPlaysLimited; //song play limit, this is for the playLimit variable up above(off by default)
let DJsPlayLimit = musicDefaults.DJsPlayLimit; //set the playlimit here (default 4 songs)
let removeIdleDJs = roomDefaults.removeIdleDJs;
let djIdleLimit = roomDefaults.djIdleLimitThresholds[ 0 ]; // how long can DJs be idle before being removed
let idleFirstWarningTime = roomDefaults.djIdleLimitThresholds[ 1 ];
let idleSecondWarningTime = roomDefaults.djIdleLimitThresholds[ 2 ];


const userFunctions = ( bot ) => {

    function formatSeconds ( seconds ) {
        return ( Math.floor( seconds / 60 ) ).toString() + ' minutes';
    }

    function formatHours ( seconds ) {
        const theHours = Math.floor( seconds / ( 60 * 60 ) );
        const theMinutes = Math.floor( ( ( seconds / ( 60 * 60 ) ) - theHours ) * 60 );
        return ( theHours ).toString() + ' hours ' + ( theMinutes ).toString() + ' minutes';
    }

    function formatDays ( seconds ) {
        const theDays = Math.floor( seconds / ( 60 * 60 * 24 ) );
        const theHours = Math.floor( seconds / ( 60 * 60 ) );
        const theMinutes = Math.floor( ( ( seconds / ( 60 * 60 ) ) - theHours ) * 60 );
        return ( theDays ).toString() + ' days, ' + ( theHours ).toString() + ' hours ' + ( theMinutes ).toString() + ' and minutes';
    }

    function formatRelativeTime ( seconds ) {
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
            console.log( "Full theUsersList: " + JSON.stringify( theUsersList ) );
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

        resetPeople: function () {
            people = []
        },

        botStartReset: function ( botFunctions, songFunctions ) {
            this.resetAllEscortMe( bot );
            this.resetUsersList();
            this.resetQueueList();
            this.resetPeople();
            this.resetAFKPeople();
            this.deleteAllDJPlayCounts();
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
        // Basic User Functions
        // ========================================================

        isThisTheBot: function ( userID ) {
            if ( userID === auth.USERID ) {
                return true;
            } else {
                return false;
            }
        },

        userExists: function ( userID ) {
            if ( theUsersList[ this.getPositionOnUsersList( userID ) ] !== undefined ) {
                return true;
            } else {
                return false;
            }
        },

        getUsername: function ( userID ) {
            if ( this.userExists( userID ) ) {
                let theUser = theUsersList.find( ( { id } ) => id === userID );
                return theUser.username;
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

        enableEscortMe: function ( data, chatFunctions ) {
            const theUserID = this.whoSentTheCommand( data );
            let theError = '';
            if ( this.escortMeIsEnabled( theUserID ) ) {
                theError += ", you've already enabled Escort Me...";
            }
            if ( !this.isUserIDOnStage( theUserID ) ) {
                theError += ", you're not on stage...";
            }

            if ( theError === '' ) {
                this.addEscortMeToUser( theUserID );
                chatFunctions.botSpeak( '@' + this.getUsername( theUserID ) + ' you will be escorted after you play your song', data );
            } else {
                chatFunctions.botSpeak( '@' + this.getUsername( theUserID ) + theError, data );
            }
        },

        disableEscortMe: function ( data, chatFunctions ) {
            const theUserID = this.whoSentTheCommand( data );
            let theError = '';
            if ( !this.escortMeIsEnabled( theUserID ) ) {
                theError += ", you haven't enabled Escort Me..."
            }
            if ( !this.isUserIDOnStage( theUserID ) ) {
                theError += ", you're not on stage..."
            }

            if ( theError === '' ) {
                this.removeEscortMeFromUser( theUserID );
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
        // User Helper Functions
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

        resetModerators: function ( data ) {
            let theUserID;
            if ( data.room !== undefined ) {
                for ( let modLoop = 0; modLoop < data.room.metadata.moderator_id.length; modLoop++ ) {
                    theUserID = data.room.metadata.moderator_id[ modLoop ];
                    if ( this.userExists( theUserID ) ) {
                        theUsersList[ this.getPositionOnUsersList( theUserID ) ][ 'moderator' ] = true;
                    }
                }
            }
        },

        addModerator: function ( theUserID ) {
            if ( this.userExists( theUserID ) ) {
                let userPosition = this.getPositionOnUsersList( theUserID );
                theUsersList[ userPosition ][ 'moderator' ] = true;
            }
        },

        removeModerator: function ( theUserID ) {
            if ( this.userExists( theUserID ) ) {
                let userPosition = this.getPositionOnUsersList( theUserID );
                theUsersList[ userPosition ][ 'moderator' ] = false;
            }
        },

        isUserModerator: function ( theUserID ) {
            if ( this.userExists( theUserID ) ) {
                let userPosition = this.getPositionOnUsersList( theUserID );
                if ( theUsersList[ userPosition ][ 'moderator' ] === true ) {
                    return true;
                } else {
                    return false;
                }
            }
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

        incrementSpamCounter: function ( userID ) {
            if ( this.userExists( userID ) ) {
                ++theUsersList[ this.getPositionOnUsersList( userID ) ][ 'spamCount' ];

                if ( theUsersList[ this.getPositionOnUsersList( userID ) ][ 'spamTimer' ] !== null ) {
                    clearTimeout( theUsersList[ this.getPositionOnUsersList( userID ) ][ 'spamTimer' ] );
                    theUsersList[ this.getPositionOnUsersList( userID ) ][ 'spamTimer' ] = null;
                }

                theUsersList[ this.getPositionOnUsersList( userID ) ][ 'spamTimer' ] = setTimeout( function ( userID ) {
                    this.resetUsersSpamCount( userID );
                }.bind( this ), 10 * 1000 );
            }
        },

        resetUsersSpamCount: function ( userID ) {
            if ( this.userExists( userID ) ) {
                theUsersList[ this.getPositionOnUsersList( userID ) ][ 'spamCount' ] = 0;
            }
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

        refreshCommand: function ( data, chatFunctions, botFunctions ) {
            const theUserID = this.whoSentTheCommand( data );
            let [ , theMessage ] = this.addRefreshToUser( theUserID, botFunctions );

            chatFunctions.botSpeak( theMessage, data );
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

        addRefreshToUser: function ( userID, botFunctions ) {
            if ( botFunctions.refreshingEnabled() ) {
                if ( this.isUserInUsersList( userID ) ) {
                    if ( this.isUserIDOnStage( userID ) ) {
                        if ( !this.isUserInRefreshList( userID ) ) {
                            let listPosition = this.getPositionOnUsersList( userID );
                            theUsersList[ listPosition ][ 'RefreshStart' ] = Date.now();
                            ++theUsersList[ listPosition ][ 'RefreshCount' ];
                            theUsersList[ listPosition ][ 'RefreshCurrentPlayCount' ] = this.getDJCurrentPlayCount( userID );
                            theUsersList[ listPosition ][ 'RefreshTotalPlayCount' ] = this.getDJTotalPlayCount( userID );
                            theUsersList[ listPosition ][ 'RefreshTimer' ] = setTimeout( function ( userID ) {
                                this.removeRefreshFromUser( userID );
                            }.bind( this ), roomDefaults.amountOfTimeToRefresh * 1000 );

                            let message = '@' + this.getUsername( userID ) + ' i\'ll hold your spot on stage for the next ' + roomDefaults.amountOfTimeToRefresh / 60 + ' minutes';
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

        removeRefreshFromUser: function ( userID ) {
            if ( this.userExists( userID ) ) {
                let listPosition = this.getPositionOnUsersList( userID );
                delete theUsersList[ listPosition ][ 'RefreshStart' ];
                delete theUsersList[ listPosition ][ 'RefreshCurrentPlayCount' ]
                delete theUsersList[ listPosition ][ 'RefreshTotalPlayCount' ]
                delete theUsersList[ listPosition ][ 'RefreshTimer' ]
                --refreshDJCount;
            }
        },

        isUserInRefreshList: function ( userID ) {
            if ( this.userExists( userID ) ) {
                return theUsersList[ this.getPositionOnUsersList( userID ) ][ 'RefreshStart' ] !== undefined;
            }
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

        updateUserLastSpoke: function ( userID ) {
            if ( this.userExists( userID ) === true ) {
                theUsersList[ this.getPositionOnUsersList( userID ) ][ 'lastSpoke' ] = Date.now();
            }
        },

        updateUserLastVoted: function ( userID ) {
            if ( this.userExists( userID ) === true ) {
                theUsersList[ this.getPositionOnUsersList( userID ) ][ 'lastVoted' ] = Date.now();
            }
        },

        updateUserLastSnagged: function ( userID ) {
            if ( this.userExists( userID ) === true ) {
                theUsersList[ this.getPositionOnUsersList( userID ) ][ 'lastSnagged' ] = Date.now();
            }
        },

        updateUserJoinedStage: function ( userID ) {
            if ( this.userExists( userID ) === true ) {
                theUsersList[ this.getPositionOnUsersList( userID ) ][ 'joinedStage' ] = Date.now();
            }
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
                theMessage = 'You have less than ' + minutesRemaining + ' minutes left of idle left.';
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
        idledOutDJCheck: function ( roomDefaults, chatFunctions ) {
            let totalIdleAllowed = this.djIdleLimit();
            let firstWarning = this.idleFirstWarningTime();
            let finalWarning = this.idleSecondWarningTime();
            let userID;

            for ( let djLoop = 0; djLoop < djList.length; djLoop++ ) {
                userID = djList[ djLoop ]; //Pick a DJ
                if ( userID !== authModule.USERID ) {
                    let idleTImeInMinutes = this.getIdleTime( userID ) / 60;
                    if ( idleTImeInMinutes > totalIdleAllowed ) {
                        this.idleWarning( userID, 0, chatFunctions );
                        bot.remDj( userID ); //remove them
                        chatFunctions.botChat( 'The user' + '@' + this.getUsername( userID ) + ' was removed for being over the ' + totalIdleAllowed + ' minute idle limit.' );
                    } else if ( ( idleTImeInMinutes > finalWarning ) && !this.hasDJHadSecondIdleWarning( userID ) ) {
                        this.setDJSecondIdleWarning( userID );
                        this.idleWarning( userID, finalWarning, chatFunctions );
                    } else if ( ( idleTImeInMinutes > firstWarning ) && !this.hasDJHadFirstIdleWarning( userID ) ) {
                        this.setDJFirstIdleWarning( userID );
                        this.idleWarning( userID, firstWarning, chatFunctions );
                    }
                }
            }
        },

        setDJFirstIdleWarning: function ( userID ) {
            if ( this.userExists( userID ) ) {
                theUsersList[ this.getPositionOnUsersList( userID ) ][ 'firstIdleWarning' ] = true;
            }
        },

        clearDJFirstIdleWarning: function ( userID ) {
            if ( this.userExists( userID ) ) {
                theUsersList[ this.getPositionOnUsersList( userID ) ][ 'firstIdleWarning' ] = false;
            }
        },

        hasDJHadFirstIdleWarning: function ( userID ) {
            if ( this.userExists( userID ) ) {
                return theUsersList[ this.getPositionOnUsersList( userID ) ][ 'firstIdleWarning' ];
            }
        },

        setDJSecondIdleWarning: function ( userID ) {
            if ( this.userExists( userID ) ) {
                theUsersList[ this.getPositionOnUsersList( userID ) ][ 'secondIdleWarning' ] = true;
            }
        },

        clearDJSecondIdleWarning: function ( userID ) {
            if ( this.userExists( userID ) ) {
                theUsersList[ this.getPositionOnUsersList( userID ) ][ 'secondIdleWarning' ] = false;
            }
        },

        hasDJHadSecondIdleWarning: function ( userID ) {
            if ( this.userExists( userID ) ) {
                return theUsersList[ this.getPositionOnUsersList( userID ) ][ 'secondIdleWarning' ];
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
            const listPosition = afkPeople.indexOf( theUserID );

            afkPeople.splice( listPosition, 1 );

            chatFunctions.botSpeak( '@' + this.getUsername( theUserID ) + ' you are no longer afk', data )
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

        clearCurrentDJFlags: function () {
            for ( let userLoop = 0; userLoop < theUsersList.length; userLoop++ ) {
                theUsersList[ userLoop ][ 'currentDJ' ] = false;
            }
        },

        setCurrentDJ: function ( userID ) {
            this.clearCurrentDJFlags()
            if ( this.userExists( userID ) ) {
                theUsersList[ this.getPositionOnUsersList( userID ) ][ 'currentDJ' ] = true;
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

        // ========================================================

        // ========================================================
        // DJ Helper Functions
        // ========================================================

        isUserIDStageBanned: function ( userID ) {
            const stageBanned = permanentStageBan.findIndex( ( { id } ) => id === userID );
            return stageBanned !== -1;
        },

        isUserBannedFromRoom: function ( userID ) {
            const banned = bannedUsers.findIndex( ( { id } ) => id === userID );
            return banned !== -1;
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

            if ( this.refreshDJCount() + this.djList().length >= 5 ) {
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

        resetDJFlags: function ( userID ) {
            if ( this.userExists( ( userID ) ) ) {
                this.resetDJCurrentPlayCount( userID );
                this.clearDJFirstIdleWarning( userID );
                this.clearDJSecondIdleWarning( userID );
            }
        },

        // ========================================================

        // ========================================================
        // DJ Play Limit Functions
        // ========================================================


        removeDJsOverPlaylimit: function ( data, chatFunctions, userID ) {
            if ( this.DJPlaysLimited() === true ) {

                if ( userID !== authModule.USERID && this.isCurrentDJ( data, userID ) && this.getDJCurrentPlayCount( userID ) >= this.DJsPlayLimit() ) {
                    if ( this.userExists( userID ) ) {
                        chatFunctions.overPlayLimit( data, this.getUsername( userID ), this.DJsPlayLimit() );

                        bot.remDj( userID );
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

        deleteAllDJsPlayCounts: function () {
            for ( let userLoop = 0; userLoop < theUsersList.length; userLoop++ ) {
                this.deleteAllDJPlayCounts( theUsersList[ userLoop ][ 'id' ] );
            }
        },

        initialiseAllDJPlayCounts: function ( userID ) {
            if ( this.isUserInUsersList( userID ) ) {
                this.setDJCurrentPlayCount( userID, 0 );
                this.setDJTotalPlayCount( userID, 0 );
            }
        },

        incrementDJPlayCount: function ( userID ) {
            if ( this.userExists( userID ) ) {
                if ( isNaN( theUsersList[ this.getPositionOnUsersList( userID ) ][ 'currentPlayCount' ] ) ) {
                    this.setDJCurrentPlayCount( userID, 1 );
                } else {
                    ++theUsersList[ this.getPositionOnUsersList( userID ) ][ 'currentPlayCount' ];
                }

                if ( isNaN( theUsersList[ this.getPositionOnUsersList( userID ) ][ 'totalPlayCount' ] ) ) {
                    this.setDJTotalPlayCount( userID, 1 );
                } else {
                    ++theUsersList[ this.getPositionOnUsersList( userID ) ][ 'totalPlayCount' ];
                }
            }
        },

        decrementDJCurrentPlayCount: function ( userID ) {
            --theUsersList[ this.getPositionOnUsersList( userID ) ][ 'currentPlayCount' ]
        },

        resetDJCurrentPlayCount: function ( userID ) {
            if ( this.userExists( userID ) ) {
                this.setDJCurrentPlayCount( userID, 0 );
            }
        },

        setDJCurrentPlaycountCommand: function ( data, theCount, theUsername, chatFunctions ) {
            if ( theCount === undefined || isNaN( theCount ) ) {
                chatFunctions.botSpeak( "The new playcount doesn't seem to be a number. Check the command help for an example", data )
            } else if ( theUsername === '' || theUsername === undefined ) {
                chatFunctions.botSpeak( "I can't see a username there. Check the command help for an example", data )
            } else {
                chatFunctions.botSpeak( "Setting the Current playcount for @" + theUsername + " to " + theCount, data )
                this .setDJCurrentPlayCount( this.getUserIDFromUsername( theUsername ), theCount );
            }
        },

        setDJCurrentPlayCount: function ( userID, theCount ) {
            if ( theCount === undefined ) {
                theCount = 0
            }
            if ( this.userExists( userID ) ) {
                theUsersList[ this.getPositionOnUsersList( userID ) ][ 'currentPlayCount' ] = theCount;
            }
        },

        resetDJTotalPlayCount: function ( userID ) {
            if ( this.userExists( userID ) ) {
                this.setDJTotalPlayCount( userID, 0 );
            }
        },

        setDJTotalPlayCount: function ( userID, theCount ) {
            if ( this.userExists( userID ) ) {
                theUsersList[ this.getPositionOnUsersList( userID ) ][ 'totalPlayCount' ] = theCount;
            }
        },

        deleteAllDJPlayCounts: function ( userID ) {
            if ( this.userExists( userID ) ) {
                delete theUsersList[ this.getPositionOnUsersList( userID ) ][ 'currentPlayCount' ];
                delete theUsersList[ this.getPositionOnUsersList( userID ) ][ 'totalPlayCount' ];
            }
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
            chatFunctions.botSpeak( data, this.buildDJPlaysMessage() );
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
                    theCurrentPlayCount = this.theUsersList()[ theUserPosition ][ 'currentPlayCount' ];
                    theTotalPlayCount = this.theUsersList()[ theUserPosition ][ 'totalPlayCount' ];

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
                chatFunctions.botSpeak( data, "The user " + this.getUsername( userID ) + " is not currently in the queue" );
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
                chatFunctions.botSpeak( data, '@' + this.getUsername( userID ) + ', the queue is currently disabled' );
            } else {
                const queuePosition = queueList.findIndex( ( { id } ) => id === userID ) + 1;
                if ( queuePosition !== -1 ) {
                    chatFunctions.botSpeak( data, '@' + this.getUsername( userID ) + ', you are currently at position ' + queuePosition + ' in the queue' );
                } else {
                    chatFunctions.botSpeak( data, '@' + this.getUsername( userID ) + ', you are not currently in the queue' );
                }
            }
        },

        addme: function ( data, chatFunctions ) {
            const userID = this.whoSentTheCommand( data );

            const [ added, theMessage ] = this.addUserToQueue( userID );

            if ( added === true ) {
                this.readQueue( data, chatFunctions )
            } else {
                chatFunctions.botSpeak( data, theMessage );
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
                chatFunctions.botSpeak( data, "@" + this.getUsername( userID ) + ', I\'ve removed you from the queue' );
            } else {
                chatFunctions.botSpeak( data, "@" + this.getUsername( userID ) + ', you\'re not currently in the queue. Use the ' + chatDefaults.commandIdentifier + 'addme command to join' );
            }
            this.readQueue( data, chatFunctions )
        },

        enableQueue: function ( data, chatFunctions ) {
            if ( roomDefaults.queueActive === true ) {
                chatFunctions.botSpeak( data, "The queue is already enabled" );
            } else {
                roomDefaults.queueActive = true;
                chatFunctions.botSpeak( data, "The queue is now on" );
            }
        },

        disableQueue: function ( data, chatFunctions ) {
            if ( roomDefaults.queueActive !== true ) {
                chatFunctions.botSpeak( data, "The queue is already disabled" );
            } else {
                roomDefaults.queueActive = false;
                chatFunctions.botSpeak( data, "The queue is now off" );
            }
        },

        readQueue: function ( data, chatFunctions ) {
            if ( roomDefaults.queueActive === true ) {
                chatFunctions.botSpeak( data, this.buildQueueMessage() );
            } else {
                chatFunctions.botSpeak( data, "The DJ queue is not active" );
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
            theUsersList = []
        },

        updateUser: function ( data ) {
            if ( typeof data.name === 'string' ) {
                let oldname = ''; //holds users old name if exists
                let queueNamePosition;
                let queueListPosition;
                let afkPeoplePosition;

                //when when person updates their profile
                //and their name is not found in the users list then they must have changed
                //their name
                if ( theUsersList.indexOf( data.name ) === -1 ) {
                    let nameIndex = theUsersList.indexOf( data.userid );
                    if ( nameIndex !== -1 ) //if their userid was found in theUsersList
                    {
                        oldname = theUsersList[ nameIndex + 1 ];
                        theUsersList[ nameIndex + 1 ] = data.name;

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

        removeUserFromTheUsersList: function ( userID ) {
            let listPosition = this.getPositionOnUsersList( userID );
            if ( listPosition !== -1 ) {
                theUsersList.splice( listPosition, 1 );
            }
        },

        deregisterUser: function ( userID ) {
            //double check to make sure that if someone is on stage and they disconnect, that they are being removed
            //from the current Dj's array
            let checkIfStillInDjArray = djList.indexOf( userID );
            if ( checkIfStillInDjArray !== -1 ) {
                djList.splice( checkIfStillInDjArray, 1 );
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

            this.removeUserFromTheUsersList( userID );
        },


        bootNewUserCheck: function () {
            let bootUser = false;
            let bootMessage = null;
            const user = bot.data.user[ 0 ];

            if ( roomDefaults.kickTTSTAT === true && user.name.match( '@ttstat' ) ) {
                bootUser = true;
            }

            //checks to see if user is on the blacklist, if they are they are booted from the room.
            for ( let i = 0; i < roomDefaults.blackList.length; i++ ) {
                if ( user.userid === roomDefaults.blackList[ i ] ) {
                    bootUser = true;
                    bootMessage = 'You are on the user banned list.';
                    break;
                }
            }

            //checks if user is on the banned list
            if ( this.isUserBannedFromRoom( user.userid ) ) {
                bootUser = true;
                bootMessage = 'You are on the banned user list.';
            }

            // don't let the bot boot itself!
            if ( user.userid === authModule.USERID ) {
                bootUser = false;
            }

            return [ bootUser, bootMessage ];
        },

        bootThisUser: function ( userID, bootMessage ) {
            if ( bootMessage == null ) {
                // bot.boot( userID )
            } else {
                // bot.bootUser(userID, bootMessage);
            }
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

        addUserJoinedTime: function ( userID ) {
            if ( this.userExists( userID ) ) {
                theUsersList[ this.getPositionOnUsersList( userID ) ][ 'joinTime' ] = Date.now();
            }
        },

        getPositionOnUsersList: function ( userID ) {
            let listPosition = theUsersList.findIndex( ( { id } ) => id === userID )
            return listPosition;
        },

        userJoinsRoom: function ( userID, username ) {
            //adds users who join the room to the user list if their not already on the list
            this.addUserToTheUsersList( userID, username );

            //starts time for everyone that joins the room
            this.addUserJoinedTime( userID );

            //sets new persons spam count to zero
            this.resetUsersSpamCount( userID );
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

        addUserToTheUsersList: function ( userID, username ) {
            if ( !this.isUserInUsersList( userID ) ) {
                theUsersList.push( { id: userID, username: username } );
            }
        },

        rebuildUserList: function ( data ) {
            this.resetUsersList();
            let thisUserID;

            for ( let i = 0; i < data.users.length; i++ ) {
                if ( typeof data.users[ i ] !== 'undefined' ) {
                    thisUserID = data.users[ i ].userid;
                    this.addUserToTheUsersList( thisUserID, data.users[ i ].name );
                }
            }

        },

        startAllUserTimers: function () {
            //starts time in room for everyone currently in the room
            for ( let userLoop = 0; userLoop < theUsersList.length; userLoop++ ) {
                if ( typeof theUsersList[ userLoop ].id !== 'undefined' ) {
                    this.addUserJoinedTime( theUsersList[ userLoop ].id );
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

        resetAllWarnMe: function ( data ) {
            let theUserID;
            if ( data.room !== undefined ) {
                for ( let userLoop = 0; userLoop < data.users.length; userLoop++ ) {
                    theUserID = data.users[ userLoop ];
                    if ( typeof theUserID !== 'undefined' ) {
                        this.removeWarnMeFromUser( theUserID );
                    }
                }
            }
        },

        addWarnMeToUser ( userID ) {
            if ( this.isUserInUsersList( userID ) ) {
                theUsersList[ this.getPositionOnUsersList( userID ) ][ 'WarnMe' ] = true;
            }
        },

        removeWarnMeFromUser ( userID ) {
            if ( this.isUserInUsersList( userID ) ) {
                delete theUsersList[ this.getPositionOnUsersList( userID ) ][ 'WarnMe' ];
            }
        },

        // ========================================================

        // ========================================================
        // Escort Me Functions
        // ========================================================

        resetAllEscortMe: function ( data ) {
            let theUserID;
            if ( data.room !== undefined ) {
                for ( let userLoop = 0; userLoop < data.users.length; userLoop++ ) {
                    theUserID = data.users[ userLoop ];
                    if ( typeof theUserID !== 'undefined' ) {
                        this.removeEscortMeFromUser( theUserID );
                    }
                }
            }
        },

        addEscortMeToUser: function ( userID ) {
            if ( this.isUserInUsersList( userID ) ) {
                theUsersList[ this.getPositionOnUsersList( userID ) ][ 'EscortMe' ] = true;
            }
        },

        removeEscortMeFromUser: function ( userID ) {
            if ( this.isUserInUsersList( userID ) ) {
                delete theUsersList[ this.getPositionOnUsersList( userID ) ][ 'EscortMe' ];
            }
        },

        escortMeIsEnabled: function ( userID ) {
            if ( this.isUserInUsersList( userID ) ) {
                if ( theUsersList[ this.getPositionOnUsersList( userID ) ][ 'EscortMe' ] === true ) {
                    return true;
                } else {
                    return false;
                }
            }
        },


        // ========================================================

    }
}

module.exports = userFunctions;
