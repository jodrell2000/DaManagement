const mysql = require( '../modules/dbConnectionPool' );

const { dirname } = require( "path" );
const fs = require( "fs" );

const databaseFunctions = () => {

    return {

        // ========================================================
        // Database Functions
        // ========================================================

        runQuery: function ( query ) {
            mysql.pool.getConnection( ( ex, connection ) => {
                if ( ex ) {
                    console.log( "Error:" + ex + query );
                } else {
                    connection.query( query, ( ex, rows, fields ) => {
                        // Comment out the following line if you want your application
                        // to freeze up after 100 requests and you don’t want to get
                        // the performance benefits of connection reuse.
                        connection.release();
                        if ( ex ) {
                            console.log( "Error:" + ex + "\n" + query );
                        } else {
                            //console.log( "Result:" + JSON.stringify( rows ) );
                            return rows;
                        }
                    } );
                }
            } );
        },

        buildSaveUserQuery: function ( userObject ) {
            const id = userObject[ "id" ];
            const userInfo = JSON.stringify( userObject ).replace( "'", "\\'" );
            const username = userObject[ "username" ];

            let moderator = "False";
            let joinTime = 0;
            let currentDJ = "False";
            let lastVoted = 0;
            let lastSpoke = 0;
            let currentPlayCount = 0;
            let totalPlayCount = 0;
            let joinedStage = 0;
            let firstIdleWarning = "False";
            let secondIdleWarning = "False";
            let spamCount = 0;
            let lastSnagged = 0;
            let region = "";
            let BBBootTimestamp = 0;
            let noiceCount = 0;
            let propsCount = 0;
            let RoboCoins = 0;
            let here = "";

            if ( userObject[ "moderator" ] !== undefined ) { moderator = userObject[ "moderator" ] }
            if ( userObject[ "joinTime" ] !== undefined ) { joinTime = userObject[ "joinTime" ] }
            if ( userObject[ "currentDJ" ] !== undefined ) { currentDJ = userObject[ "currentDJ" ] }
            if ( userObject[ "lastVoted" ] !== undefined ) { lastVoted = userObject[ "lastVoted" ] }
            if ( userObject[ "lastSpoke" ] !== undefined ) { lastSpoke = userObject[ "lastSpoke" ] }
            if ( userObject[ "currentPlayCount" ] !== undefined ) { currentPlayCount = userObject[ "currentPlayCount" ] }
            if ( userObject[ "totalPlayCount" ] !== undefined ) { totalPlayCount = userObject[ "totalPlayCount" ] }
            if ( userObject[ "joinedStage" ] !== undefined ) { joinedStage = userObject[ "joinedStage" ] }
            if ( userObject[ "firstIdleWarning" ] !== undefined ) { firstIdleWarning = userObject[ "firstIdleWarning" ] }
            if ( userObject[ "secondIdleWarning" ] !== undefined ) { secondIdleWarning = userObject[ "secondIdleWarning" ] }
            if ( userObject[ "spamCount" ] !== undefined ) { spamCount = userObject[ "spamCount" ] }
            if ( userObject[ "lastSnagged" ] !== undefined ) { lastSnagged = userObject[ "lastSnagged" ] }
            if ( userObject[ "region" ] !== undefined ) { region = userObject[ "region" ] }
            if ( userObject[ "BBBootTimestamp" ] !== undefined ) { BBBootTimestamp = userObject[ "BBBootTimestamp" ] }
            if ( userObject[ "noiceCount" ] !== undefined ) { noiceCount = userObject[ "noiceCount" ] }
            if ( userObject[ "propsCount" ] !== undefined ) { propsCount = userObject[ "propsCount" ] }
            if ( userObject[ "RoboCoins" ] !== undefined ) { RoboCoins = userObject[ "RoboCoins" ] }
            if ( userObject[ "here" ] !== undefined ) { here = userObject[ "here" ] }

            const query = `REPLACE INTO users (id, userInfo, username, moderator, joinTime, currentDJ, lastVoted, lastSpoke, currentPlayCount, totalPlayCount, joinedStage, firstIdleWarning, secondIdleWarning, spamCount, lastSnagged, region, BBBootTimestamp, noiceCount, propsCount, RoboCoins, here) VALUES ("${ id }", '${ userInfo }', "${ username }", ${ moderator }, ${ joinTime }, "${ currentDJ }", ${ lastVoted }, ${ lastSpoke }, ${ currentPlayCount }, ${ totalPlayCount }, ${ joinedStage }, "${ firstIdleWarning }", "${ secondIdleWarning }", ${ spamCount }, ${ lastSnagged }, "${ region }", ${ BBBootTimestamp }, ${ noiceCount }, ${ propsCount }, ${ RoboCoins }, "${ here }");`;

            return query;

        },

        writeUserDataToDatabase: function ( userObjeect ) {
            const query = this.buildSaveUserQuery( userObjeect );
            this.runQuery( query );
        },

        getLastInsertID: function () {
            const query = "select LAST_INSERT_ID();";
            return this.runQuery( query );
        },

        // ========================================================
        // File Functions
        // ========================================================

        writeUserDataToDisk: function ( userObject ) {
            const userID = userObject[ "id" ];
            const dataFilePath = `${ dirname( require.main.filename ) }/data/users/${ userID }.json`;
            fs.writeFileSync( dataFilePath, JSON.stringify( userObject ), function ( err ) {
                if ( err ) {
                    return console.error( err );
                }
            } );
        },

        readAllUserDataFromDisk: function () {
            const dataFilePath = `${ dirname( require.main.filename ) }/data/users/`;
            let theUsersList = [];
            fs.readdirSync( dataFilePath ).forEach( file => {
                theUsersList.push( this.readUserDataFromFile( dataFilePath + file ) );
            } )

            return theUsersList;
        },

        readUserDataFromFile: function ( file ) {
            const theData = fs.readFileSync( file, { encoding: 'utf8' } )
            return JSON.parse( theData );
        },

        // ========================================================
        // Persistent User Functions
        // ========================================================

        storeUserData: function ( userObject ) {
            const userToSave = this.removeUnsavableDataFromUser( userObject );
            this.writeUserDataToDisk( userToSave );
            this.writeUserDataToDatabase( userToSave );
        },

        removeUnsavableDataFromUser: function ( userObject ) {
            // delete the spamTimer if it's in the object or it'll crash the save due to a circular reference
            var editedUser = Object.assign( {}, userObject, { spamTimer: undefined } )

            // remove refresh properties from permanent storage
            delete editedUser[ "RefreshCount" ];
            delete editedUser[ "RefreshStart" ];
            delete editedUser[ "RefreshCurrentPlayCount" ];
            delete editedUser[ "RefreshTotalPlayCount" ];
            delete editedUser[ "RefreshTimer" ];

            // don't store the welcome timer in permanent storage
            delete editedUser[ "welcomeTimer" ];

            return editedUser;
        },

        // ========================================================

        // ========================================================
        // Song Data Functions
        // ========================================================

        saveTrackData: function ( databaseFunctions, djID, songData ) {
            console.group( "saveTrackData" );
            const theTrack = songData.song;
            const theArtist = songData.artist;
            let artistID;
            let trackID;

            artistID = this.doesArtistExist( theArtist );
            console.log( "artistID:" + artistID );
            if ( artistID === false ) {
                let artistID = this.addArtist( theArtist );
            }

            trackID = this.doesTrackExist( theTrack );
            console.log( "trackID:" + trackID );
            if ( !trackID ) {
                let trackID = this.addTrack( theTrack );
            }

            console.log( "artistID:" + artistID );
            console.log( "trackID:" + trackID );
            let theQuery = `INSERT INTO tracksPlayed (artistID, trackID, djID) VALUES ("` + artistID + `", "` + trackID + `", ` + djID + `);`
            this.runQuery( theQuery );
            console.groupEnd();
        },

        doesArtistExist: function ( artistName ) {
            console.group( "doesArtistExist" );
            const theQuery = `SELECT id FROM artists WHERE artistName = "` + artistName + `";`;
            let result = this.runQuery( theQuery );
            console.log( "result:" + result );
            if ( result !== undefined ) {
                console.groupEnd();
                return result;
            } else {
                console.groupEnd();
                return false;
            }
        },

        doesTrackExist: function ( trackName ) {
            console.group( "doesTrackExist" );
            const theQuery = `SELECT id FROM tracks WHERE trackName = "` + trackName + `";`;
            let result = this.runQuery( theQuery );
            console.log( "result:" + result );
            if ( result !== undefined ) {
                console.groupEnd();
                return result;
            } else {
                console.groupEnd();
                return false;
            }
        },

        addArtist: function ( artistName ) {
            const theQuery = `INSERT INTO artists WHERE artistName = "` + artistName + `";`;
            this.runQuery( theQuery );
            return this.getLastInsertID();
        },

        addTrack: function ( trackName ) {
            const theQuery = `INSERT INTO tracks WHERE artistName = "` + trackName + `";`;
            this.runQuery( theQuery );
            return this.getLastInsertID();
        },

        getArtistID: function () {

        },

        getTrackID: function () {

        },

        getArtistName: function () {

        },

        getTrackName: function () {

        },

        // ========================================================


    }

}

module.exports = databaseFunctions;