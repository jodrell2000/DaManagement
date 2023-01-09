const mysql = require( '../modules/dbConnectionPool' );

const { dirname } = require( "path" );
const fs = require( "fs" );

const databaseFunctions = () => {

    return {

        // ========================================================
        // Database Functions
        // ========================================================

        runQuery: function ( query ) {
            console.group( "runQuery" );
            return new Promise( ( resolve, reject ) => {
                mysql.pool.getConnection( ( ex, connection ) => {
                    if ( ex ) {
                        console.log( "Error: " + ex + query );
                    } else {
                        connection.query( query, function ( ex, rows, fields ) {
                            connection.release();
                            if ( ex ) {
                                console.log( "Error:" + ex + "\n" + query );
                            } else {
                                console.log( "Query: " + query );
                                console.log( "Rows: " + JSON.stringify( rows ) );
                                console.log( "Fields: " + JSON.stringify( fields ) );
                                console.groupEnd();
                                return rows;
                            }
                        } );
                    }
                } );
            } )
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
            //this.writeUserDataToDatabase( userToSave );
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

        // saveTrackData: function ( djID, songData ) {
        //     console.group( "saveTrackData" );
        //     console.log( "songData.artist:" + songData.metadata.artist )
        //     console.log( "songData.song:" + songData.metadata.song )
        //     const trackID = this.getTrackID( songData.metadata.song );

        //     this.getArtistID( songData.metadata.artist )
        //         .then( ( row ) => { console.log( "row: " + row ) } );

        //     console.log( "artistID:" + artistID );
        //     console.log( "trackID:" + trackID );
        //     let theQuery = `INSERT INTO tracksPlayed (artistID, trackID, djID) VALUES ("` + artistID + `", "` + trackID + `", "` + djID + `");`
        //     this.runQuery( theQuery );
        //     console.groupEnd();
        // },

        // getArtistID: function ( artistName ) {
        //     console.group( "getArtistID" );
        //     let artistID;

        //     const theQuery = `SELECT id FROM artists WHERE artistName = "` + artistName + `";`;
        //     this.runQuery( theQuery )
        //         .then( ( row ) => { artistID = row[ "id" ] } )
        //         .catch( ( ex ) => { console.log( "Something went wrong: " + ex ); } );
        //     console.log( "first get artist ID result: " + artistID );

        //     if ( artistID !== undefined ) {
        //         console.groupEnd();
        //         return artistID;
        //     } else {
        //         console.groupEnd();
        //         return this.addArtist( artistName )
        //     }
        // },

        saveTrackData: function ( djID, songData ) {
            console.group( "saveTrackData" );
            this.getArtistID( songData.metadata.artist )
                .then( ( artistID ) => {
                    console.log( "artistID:" + artistID );
                    this.getTrackID( songData.metadata.song )
                        .then( ( trackID ) => {
                            console.log( "trackID:" + trackID );
                            let theQuery = `INSERT INTO tracksPlayed (artistID, trackID, djID) VALUES ("` + artistID + `", "` + trackID + `", "` + djID + `");`
                            return this.runQuery( theQuery );
                        } )
                        .catch( ( ex ) => { console.log( "Something went wrong: " + ex ); } );
                } )
                .catch( ( ex ) => { console.log( "Something went wrong: " + ex ); } );
            console.groupEnd();
        },

        getArtistID: function ( artistName ) {
            console.group( "getArtistID" );
            const selectQuery = `SELECT id FROM artists WHERE artistName = "` + artistName + `";`;
            return this.runQuery( selectQuery )
                .then( ( result ) => {
                    if ( result.length !== 0 ) {
                        console.log( "result" + JSON.stringify( result ) );
                        return result
                    } else {
                        console.log( "erm" );
                        const insertQuery = `INSERT INTO artists (artistName) VALUES ("` + artistName + `");`;
                        return this.runQuery( insertQuery )
                            .then( ( result ) => {
                                return this.runQuery( selectQuery );
                            } );
                    }
                } )
                .then( ( row ) => {
                    console.log( "row:" + JSON.stringify( row ) );
                    return row[ 0 ][ 'id' ];
                } )
                .catch( ( ex ) => { console.log( "Something went wrong: " + ex ); } );
        },

        getTrackID: function ( trackName ) {
            console.group( "getTrackID" );
            const selectQuery = `SELECT id FROM tracks WHERE trackName = "` + trackName + `";`;
            return this.runQuery( selectQuery )
                .then( ( result ) => {
                    if ( result.length !== 0 ) {
                        return result
                    } else {
                        const insertQuery = `INSERT INTO tracks (trackName) VALUES ("` + trackName + `");`;
                        return this.runQuery( insertQuery )
                            .then( ( result ) => {
                                return this.runQuery( selectQuery );
                            } );
                    }
                } )
                .then( ( row ) => {
                    return row[ 0 ][ 'id' ];
                } )
                .catch( ( ex ) => { console.log( "Something went wrong: " + ex ); } );
        },

        // ========================================================


    }

}

module.exports = databaseFunctions;