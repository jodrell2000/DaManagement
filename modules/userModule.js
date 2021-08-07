let musicDefaults = require( '../defaultSettings/musicDefaults.js' );
let roomDefaults = require( '../defaultSettings/roomDefaults.js' );
let chatDefaults = require( '../defaultSettings/chatDefaults.js' );

let authModule = require( '../auth.js' );
const auth = require( '../auth.js' );

let theUsersList = []; // object array of everyone in the room
let afkPeople = []; //holds the userid of everyone who has used the /afk command
let modPM = []; //holds the userid's of everyone in the /modpm feature
let djList = []; //holds the userid of all the dj's who are on stage currently
let people = []; //holds the userid's of everyone who is kicked off stage for the spam limit
let myTime = []; //holds a date object for everyone in the room, which represents the time when they joined the room, resets every time the person rejoins
let timer = []; //holds the timeout of everyone who has been spamming the stage, resets their spam count if their timer completes
let myID = null; //the userid of the person using the /fanme command, speak event only
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
let playLimitOfRefresher = []; //holds a copy of the number of plays for people who have used the /refresh command
let refreshDJCount = 0; // how many people are currently using the refresh command
let warnme = []; //holds the userid's of everyone using the /warnme feature

let queueList = []; //holds the userid of everyone in the queue

const userFunctions = ( bot ) => {
    function logMe ( logLevel, message ) {
        if ( logLevel === 'error' || logLevel === 'info' ) {
            console.log( "userFunctions:" + logLevel + "->" + message + "\n" );
        } else {
            if ( bot.debug ) {
                console.log( "userFunctions:" + logLevel + "->" + message + "\n" );
            }
        }
    }

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
        } else {
        }

        if ( seconds < 60 * 60 ) {
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

        removeDJsOverPlaylimit: function ( chatFunctions, djID ) {
            if ( musicDefaults.PLAYLIMIT === true ) //is playlimit on?
            {
                if ( djID !== authModule.USERID && djID === djList[ 0 ] && roomDefaults.playLimit === 1 ) //if person is in the far left seat and limit is set to one
                {
                    let checklist33 = theUsersList.indexOf( djID ) + 1;

                    if ( checklist33 !== -1 ) {
                        chatFunctions.overPlayLimit( theUsersList[ checklist33 ], roomDefaults.playLimit )
                    }

                    bot.remDj( djID );
                }
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
            for ( userLoop = 0; userLoop < theUsersList.length; userLoop++ ) {
                if ( theUsersList[ userLoop ].username === theUsername ) {
                    return theUsersList[ userLoop ].id;
                }
            }
        },

        // ========================================================
        // User Helper Functions
        // ========================================================

        readUserStatus: function ( data, args, chatFunctions ) {
            let theUsername = '';
            for ( userLoop = 0; userLoop < args.length; userLoop++ ) {
                theUsername += args[ userLoop ] + ' ';
            }
            theUsername = theUsername.substring( 0, theUsername.length - 1 );

            const theUserID = this.getUserIDFromUsername( theUsername );
            const roomJoined = formatRelativeTime( ( Date.now() - this.getUserJoinedRoom( theUserID ) ) / 1000 );
            let modText = '';
            if ( this.isUserModerator( theUserID ) !== true ) { modText = 'not ' }
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
                    chatFunctions.botSpeak( data, 'User info for ' + theUsername );
                    await sleep( 100 )

                    chatFunctions.botSpeak( data, '- userID is ' + theUserID );
                    await sleep( 100 )

                    chatFunctions.botSpeak( data, '- joined the room ' + roomJoined + ' ago' );
                    await sleep( 100 )

                    chatFunctions.botSpeak( data, '- is ' + modText + 'a Moderator' );
                    await sleep( 100 )

                    if ( lastSpoke !== false ) {
                        chatFunctions.botSpeak( data, '- spoke ' + lastSpoke + ' ago' );
                        await sleep( 100 )
                    }

                    if ( lastVoted !== false ) {
                        chatFunctions.botSpeak( data, '- voted ' + lastVoted + ' ago' );
                        await sleep( 100 )
                    }

                    if ( lastSnagged !== false ) {
                        chatFunctions.botSpeak( data, '- snagged ' + lastSnagged + ' ago' );
                        await sleep( 100 )
                    }

                    if ( joinedStage !== false ) {
                        chatFunctions.botSpeak( data, '- DJd ' + joinedStage + ' ago' );
                        await sleep( 100 )
                    }

                    chatFunctions.botSpeak( data, '- SPAM count=' + spamCount );
                    await sleep( 100 )

                    if ( currentPlayCount !== undefined ) {
                        chatFunctions.botSpeak( data, '- current playcount=' + currentPlayCount );
                        await sleep( 100 )
                    }

                    if ( !isNaN( totalPlayCount ) ) {
                        chatFunctions.botSpeak( data, '- total playcount=' + totalPlayCount );
                        await sleep( 100 )
                    }
                }
                readStatusInOrder();
            } else {
                chatFunctions.botSpeak( data, 'I couldn\'t find the details for that user. Please check the spelling, and capitalisation' );
            }

        },

        getUserJoinedRoom: function ( userID ) {
            let userPosition = this.getPositionOnUsersList( userID );
            return theUsersList[ userPosition ][ 'joinTime' ];
        },

        getUserLastVoted: function ( userID ) {
            let userPosition = this.getPositionOnUsersList( userID );
            return theUsersList[ userPosition ][ 'lastVoted' ];
        },

        getUserLastSpoke: function ( userID ) {
            let userPosition = this.getPositionOnUsersList( userID );
            return theUsersList[ userPosition ][ 'lastSpoke' ];
        },

        getUserLastSnagged: function ( userID ) {
            let userPosition = this.getPositionOnUsersList( userID );
            return theUsersList[ userPosition ][ 'lastSnagged' ];
        },

        getUserJoinedStage: function ( userID ) {
            let userPosition = this.getPositionOnUsersList( userID );
            return theUsersList[ userPosition ][ 'joinedStage' ];
        },

        // "songCount":0

        // ========================================================

        // ========================================================
        // Moderator Management Functions
        // ========================================================

        resetModerators: function ( data ) {
            let userPosition;
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

        refreshDJCount: () => refreshDJCount,

        addRefreshToUser: function ( userID ) {
            if ( roomDefaults.refreshingEnabled ) {
                if ( this.isUserInUsersList( userID ) ) {
                    if ( this.isCurrentDJ( userID ) ) {
                        if ( !this.isUserInRefreshList( userID ) ) {
                            let listPosition = this.getPositionOnUsersList( userID );
                            theUsersList[ listPosition ][ 'Refresh' ] = Date.now();
                            ++theUsersList[ listPosition ][ 'RefreshCount' ];
                            theUsersList[ listPosition ][ 'RefreshPlayCount' ] = this.getDJCurrentPlayCount( userID );
                            theUsersList[ listPosition ][ 'RefreshTimer' ] = setTimeout( function ( userID ) {
                                this.removeRefreshFromUser( userID );
                            }.bind( this ), 60 * 1000 );

                            ++refreshDJCount;

                            let message = '@' + this.getUsername( userID ) + ' i\'ll hold your spot on stage for the next ' + roomDefaults.amountOfTimeToRefresh + ' minutes';
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
                delete theUsersList[ listPosition ][ 'Refresh' ];
                delete theUsersList[ listPosition ][ 'RefreshPlayCount' ]
                delete theUsersList[ listPosition ][ 'RefreshTimer' ]
                --refreshDJCount;
            }
        },

        isUserInRefreshList: function ( userID ) {
            if ( this.userExists( userID ) ) {
                return theUsersList[ this.getPositionOnUsersList( userID ) ][ 'Refresh' ] !== undefined;
            }
        },

        getUsersRefreshPlayCount: function ( userID ) {
            if ( this.userExists( userID ) ) {
                let listPosition = this.getPositionOnUsersList( userID );
                if ( theUsersList[ listPosition ][ 'RefreshPlayCount' ] !== undefined ) {
                    return theUsersList[ listPosition ][ 'RefreshPlayCount' ];
                } else {
                    return 0;
                }
            }
        },

        // ========================================================

        // ========================================================
        // Idle Functions (have people just gone away)
        // ========================================================

        roomIdle: () => roomDefaults.roomIdle,
        enableRoomIdle: function () { roomDefaults.roomIdle = true; },
        disableRoomIdle: function () { roomDefaults.roomIdle = false; },

        djIdleLimit: () => roomDefaults.djIdleLimit,
        enableDJIdle: function () { roomDefaults.djIdleLimit = true; },
        disableDJIdle: function () { roomDefaults.djIdleLimit = false; },

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

        idleWarning: function ( userID, minutesRemaining, idleLimit, chatFunctions ) {
            let theMessage;

            if ( minutesRemaining !== 0 ) {
                theMessage = 'you have less than ' + minutesRemaining + ' minutes left of idle, chat or awesome please.';
            } else {
                theMessage = 'you are over the idle limit of ' + idleLimit + ' minutes.';
            }

            if ( roomDefaults.warnIdlePM === false ) {
                chatFunctions.botChat( '@' + this.getUsername( userID ) + ' ' + theMessage );
            } else {
                chatFunctions.botPM( userID, theMessage );
            }
        },

        checkHasUserIdledOut: function ( userID, idleLimit, threshold ) {
            return this.getIdleTime( userID ) / 60 > idleLimit - threshold;
        },

        //removes idle dj's after roomDefaultsModule.djIdleLimit is up.
        idledOutDJCheck: function ( roomDefaults, chatFunctions ) {
            let djID;
            for ( let i = 0; i < djList.length; i++ ) {
                djID = djList[ i ]; //Pick a DJ
                if ( djID !== authModule.USERID ) {
                    if ( this.checkHasUserIdledOut( djID, roomDefaults.djIdleLimit, 0 ) ) {
                        this.idleWarning( djID, 0, roomDefaults.djIdleLimit, chatFunctions );
                        bot.remDj( djID ); //remove them
                    } else if ( this.checkHasUserIdledOut( djID, roomDefaults.djIdleLimit, 1 ) ) {
                        this.idleWarning( djID, 1, roomDefaults.djIdleLimit, chatFunctions );
                    } else if ( this.checkHasUserIdledOut( djID, roomDefaults.djIdleLimit, 5 ) ) {
                        this.idleWarning( djID, 5, roomDefaults.djIdleLimit, chatFunctions );
                    }
                }
            }
        },

        //this removes people on the floor, not the djs
        roomIdleCheck: function ( roomDefaults, chatFunctions ) {
            let theUserID;
            for ( let userLoop = 0; userLoop < theUsersList.length; userLoop++ ) {
                theUserID = theUsersList[ userLoop ].id;

                if ( roomDefaults.roomIdle === true && theUserID !== authModule.USERID ) {
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
        },

        // ========================================================

        // ========================================================
        // AFK Functions (for the afk command)
        // ========================================================

        afkPeople: () => afkPeople,
        resetAFKPeople: function () {
            afkPeople = []
        },

        isUserAFK: function ( userID ) {
            let isAlreadyAfk = afkPeople.indexOf( userID );
            return isAlreadyAfk !== -1;
        },

        switchUserAFK: function ( data, chatFunctions ) {
            const userID = this.getUserIDFromData( data );
            if ( this.isUserAFK( userID ) === true ) {
                this.removeUserFromAFKList( data, chatFunctions );
            } else {
                this.addToAFKList( data, chatFunctions );
            }
        },

        addToAFKList: function ( data, chatFunctions ) {
            const userID = this.getUserIDFromData( data );

            afkPeople.push( userID );
            chatFunctions.botSpeak( data, '@' + this.getUsername( userID ) + ' you are marked as afk' )
        },

        removeUserFromAFKList: function ( data, chatFunctions ) {
            const userID = this.getUserIDFromData( data );
            const listPosition = afkPeople.indexOf( userID );

            afkPeople.splice( listPosition, 1 );

            chatFunctions.botSpeak( data, '@' + this.getUsername( userID ) + ' you are no longer afk' )
        },

        howManyAFKUsers: function () {
            return afkPeople.length;
        },

        sendUserIsAFKMessage: function ( data, userID, chatFunctions ) {
            chatFunctions.botSpeak( data, '@' + this.getUsername( userID ) + ' is currently AFK, sorry' )
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
            const findDJ = ( dj ) => dj === userID;
            const listPosition = djList.findIndex( findDJ )

            djList.splice( listPosition, 1 );
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

        isCurrentDJ: function ( userID ) {
            const findDJ = ( dj ) => dj === userID;
            const listPosition = djList.findIndex( findDJ );

            return listPosition !== -1;
        },

        resetDJs: function ( data ) {
            this.clearDJList();
            let djID;
            if ( data.room !== undefined ) {
                for ( let djLoop = 0; djLoop < data.room.metadata.djs.length; djLoop++ ) {
                    djID = data.room.metadata.djs[ djLoop ];
                    if ( typeof djID !== 'undefined' ) {
                        this.initialiseAllDJPlayCounts( djID );
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
            }},

        decrementDJCurrentPlayCount: function ( userID ) {
            --theUsersList[ this.getPositionOnUsersList( userID ) ][ 'currentPlayCount' ]
        },

        resetDJCurrentPlayCount: function ( userID ) {
            if ( this.userExists( userID ) ) {
                this.setDJCurrentPlayCount( userID, 0 );
            }
        },

        setDJCurrentPlayCount: function ( userID, theCount ) {
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

        removeUserFromQueue: function ( userID ) {
            if ( !this.isUserIDInQueue( userID ) ) {
                return [ true, "not in queue" ];
            } else {
                const queuePosition = queueList.findIndex( ( { id } ) => id === userID );
                queueList.splice( queuePosition, 1 );
                return [ false, '' ];
            }
        },

        isUserIDInQueue: function ( userID ) {
            const inQueue = queueList.indexOf( userID );
            return inQueue !== -1;
        },

        changeUsersQueuePosition: function ( data, args, chatFunctions ) {
            const username = args[ 0 ];
            const userID = this.getUserIDFromUsername( username );
            const newPosition = args[ 1 ] - 1;
            const [ err, _ ] = this.removeUserFromQueue( userID );

            logMe( 'info', '================ changeUsersQueuePosition, username:' + username );
            logMe( 'info', '================ changeUsersQueuePosition, userID:' + userID );
            logMe( 'info', '================ changeUsersQueuePosition, newPosition:' + newPosition );
            logMe( 'info', '================ changeUsersQueuePosition, err:' + err );
            logMe( 'info', '================ changeUsersQueuePosition, queueList:' + JSON.stringify( queueList ) );

            if ( err !== true ) {
                queueList.splice( newPosition, 0, userID );
                logMe( 'info', '================ changeUsersQueuePosition, queueList:' + JSON.stringify( queueList ) );
            } else {
                chatFunctions.botSpeak( data, "The user " + this.getUsername( userID ) + " is not currently in the queue" );
            }
            this.readQueue( data, chatFunctions );
        },

        moveUserToHeadOfQueue: function ( data, args, chatFunctions ) {
            logMe( 'info', '================ moveUserToHeadOfQueue, args:' + JSON.stringify( args ) );
            args[ 1 ] = 1;
            this.changeUsersQueuePosition( data, args, chatFunctions );
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

        clearDJToNotify: function ( ) {
            notifyThisDJ = null;
        },

        whatsMyQueuePosition: function ( data, chatFunctions ) {
            const userID = data.userid;

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
            const userID = data.userid;

            const [ added, theMessage ] = this.addUserToQueue( userID );

            if ( added === true ) {
                this.readQueue( data, chatFunctions )
            } else {
                chatFunctions.botSpeak( data, theMessage );
            }
        },

        removeNotifyDJFromQueue: function (botFunctions, userFunctions ) {
            bot.speak( 'Sorry @' + userFunctions.getUsername( this.notifyThisDJ().toString() ) + ' you have run out of time.' );
            this.removeUserFromQueue( this.notifyThisDJ() );
            this.clearDJToNotify();
            botFunctions.setSayOnce( true );
        },

        removeme: function ( data, chatFunctions ) {
            const userID = data.userid;
            if ( this.isUserIDInQueue( userID ) ) {
                this.removeUserFromQueue( userID )
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
                chatFunctions.botSpeak( data, "The queue is not active" );
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
                message = "The queue is currently: " + listOfUsers;
            } else {
                message = "The queue is empty...";
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

        updateUser: function ( data, roomFunctions ) {
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

        removeUserFromTheUsersList: function ( userID ) {
            // maybe don't do this
            // remove users if they've not been in the room for 24hrs instead?
            // that was we keep stats for longer
            //

            // if ( this.userExists( userID ) ) {
            //     let listLocation = theUsersList.find( ( { id } ) => id === userID );
            //     theUsersList.splice( listLocation, 1 );
            // }
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
                for ( afkPeopleLoop = 0; afkPeopleLoop < afkPeople.length; afkPeopleLoop++ ) {
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
