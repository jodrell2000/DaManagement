let theRefereeID = "";
let domeList = [];
let oldMaxDJs;

const thunderdomeFunctions = () => {

    return {

        // ========================================================
        // Main functions
        // ========================================================

        thunderdome: function ( data, roomFunctions, userFunctions, chatFunctions ) {
            if ( this.thunderMode() ) {
                chatFunctions.botSpeak( 'Thunderdome is already running...did you mean beginthunderdome?', data );
            } else {
                roomFunctions.enableThunderMode()
                    .then( () => this.clearDomeList() )
                    .then( () => this.announceSignups( data, chatFunctions ) )
                    .then( () => userFunctions.whoSentTheCommand( data ) )
                    .then( ( refereeID ) => this.setTheRefereeID( refereeID ) );
            }
        },

        beginThunderdome: function ( data, roomFunctions, userFunctions, chatFunctions ) {
            if ( !roomFunctions.thunderMode() ) {
                chatFunctions.botSpeak( 'Thunderdome is not running...did you just mean thunderdome?', data );
            } else {
                this.removeAllDJs( data, userFunctions, chatFunctions )
                    .then( () => this.saveOldMaxDJs( roomFunctions.maxDJs ) )
                    .then( () => roomFunctions.setMaxDJs( 3 ) )

                // invite contestant 1
                // wait for them to both join the stage
                // call start round function

                // // start round
                // invite dj No.2
                // wait for them to join the stage
                // announce the theme
                // clear the point counts
            }
        },

        endThunderdome: function ( data, roomFunctions, chatFunctions ) {
            if ( roomFunctions.thunderMode() ) {
                roomFunctions.disableThunderMode();
                this.clearDomeList();
                roomFunctions.setMaxDJs( this.oldMaxDJs() );
            } else {
                chatFunctions.botSpeak( 'Thunderdome is not running...how can I end it??', data );
            }
        },

        // ========================================================

        // ========================================================
        // Helper functions
        // ========================================================

        oldMaxDJs: () => oldMaxDJs,

        saveOldMaxDJs: function ( value ) {
            oldMaxDJs = value;
        },

        announceSignups: function ( data, chatFunctions ) {
            chatFunctions.botSpeak( "The Thunderdome is now open for signups!!!", data )
                .then( () => chatFunctions.botSpeak( "Remember where you are - this is Thunderdome, and death is listening, and will take the first DJ that screams", data ) )
                .then( () => chatFunctions.botSpeak( "Use the command 'enterdome' to join the waiting list, 'leavedome' to remove yourself and 'waitinglist' to see who's on it", data ) )
        },

        startRound: function () {

        },

        // ========================================================

        // ========================================================
        // Thunderdome list functions
        // ========================================================

        domeList: () => domeList,

        clearDomeList: function () {
            domeList = [];
        },

        addToEndOfDomeList: function ( userID ) {
            domeList.push( userID );
        },

        removeFromDomeList: function ( userID ) {
            domeList.splice( domeList.indexOf( userID ), 1 );
        },

        nextDJInDomeList: function () {
            return domeList[ 0 ];
        },

        isUserInDomeList: function ( userID ) {
            const inList = domeList.indexOf( userID );
            return inList !== -1;
        },

        readDomeList: function ( data, chatFunctions ) {
            chatFunctions.botSpeak( this.buildQueueMessage(), data );
        },

        buildQueueMessage: function () {
            let listOfUsers = '';
            let message;
            let thisQueuePosition = 1;

            domeList.forEach( function ( userID ) {
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


        enterDome: function ( data, userFunctions, chatFunctions ) {
            const userID = userFunctions.whoSentTheCommand( data );
            if ( !this.isUserInDomeList( userID ) ) {
                this.addToEndOfDomeList( userID, data, chatFunctions );
                chatFunctions.botSpeak( "@" + this.getUsername( userID ) + " you have been added to the Thunderdome waiting list", data );
                this.readDomeList( data, chatFunctions );
            } else {
                chatFunctions.botSpeak( "@" + this.getUsername( userID ) + " you're alrady on the Thunderdome waiting list", data );
            }
        },

        leaveDome: function ( data, userFunctions, chatFunctions ) {
            const userID = userFunctions.whoSentTheCommand( data );
            if ( this.isUserInDomeList( userID ) ) {
                this.removeFromDomeList( userID, data, chatFunctions );
                chatFunctions.botSpeak( "@" + this.getUsername( userID ) + " you have been removed from the Thunderdome waiting list", data );
                this.readDomeList( data, chatFunctions );
            } else {
                chatFunctions.botSpeak( "@" + this.getUsername( userID ) + " you're not on the Thunderdome waiting list", data );
            }
        },

        // ========================================================

        // ========================================================
        // Thunderdome Stage functions
        // ========================================================

        theRefereeID: () => theRefereeID,

        setTheRefereeID: function ( userID ) {
            theRefereeID = userID;
        },

        removeAllDJs: async function ( data, userFunctions, chatFunctions ) {
            let currentDJs = userFunctions.djList();
            let theUserID;

            chatFunctions.botSpeak( "PREPARE, THE THUNDERDOME!", data );

            for ( let djLoop = 0; djLoop < currentDJs.length; djLoop++ ) {
                theUserID = currentDJs[ djLoop ]; //Pick a DJ
                if ( theUserID !== this.theRefereeID() ) {
                    userFunctions.removeDJ( theUserID, "Clearing the decks for Thunderdome!" );
                }
            }
        },

        inviteDJ: function () {

        },

    }

}

module.exports = thunderdomeFunctions;