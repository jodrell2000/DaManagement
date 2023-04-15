const mysql = require( '../modules/dbConnectionPool' );

const { dirname } = require( "path" );
const fs = require( "fs" );

const databaseFunctions = () => {

    return {

        // ========================================================
        // Database Functions
        // ========================================================

        runQuery: function ( query, values ) {
            return new Promise( ( resolve, reject ) => {
                mysql.pool.getConnection( ( ex, connection ) => {
                    if ( ex ) {
                        console.log( "Error: " + ex + query, values );
                    } else {
                        connection.query( query, values, function ( ex, results, fields ) {
                            connection.release();
                            if ( ex ) {
                                console.log( "Error:" + ex + "\n" + query );
                                reject( ex );
                            } else {
                                resolve( results );
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

        saveTrackData: function ( djID, songData ) {
            return this.getArtistID( songData.metadata.artist )
                .then( ( artistID ) => {
                    this.getTrackID( songData.metadata.song )
                        .then( ( trackID ) => {
                            let theQuery = "INSERT INTO tracksPlayed (artistID, trackID, djID) VALUES (?, ?, ?);"
                            let values = [ artistID, trackID, djID ];
                            return this.runQuery( theQuery, values )
                                .then( ( result ) => {
                                    return this.setTrackLength( result.insertId - 1 );
                                } )
                        } )
                        .catch( ( ex ) => { console.log( "Something went wrong: " + ex ); } );
                } )
                .catch( ( ex ) => { console.log( "Something went wrong: " + ex ); } );
        },

        setTrackLength: function ( trackID ) {
            return this.calcTrackLength( trackID )
                .then( ( length ) => {
                    let theQuery = "UPDATE tracksPlayed SET length = ? WHERE id = ?;"
                    let values = [ length, trackID ];
                    return this.runQuery( theQuery, values );
                } )
        },

        getArtistID: function ( theName ) {
            const selectQuery = `SELECT id FROM artists WHERE artistName = ?;`;
            const values = [ theName ];
            return this.runQuery( selectQuery, values )
                .then( ( result ) => {
                    if ( result.length !== 0 ) {
                        return result[ 0 ][ 'id' ];
                    } else {
                        const insertQuery = `INSERT INTO artists SET ?;`;
                        const values = { artistName: theName }
                        return this.runQuery( insertQuery, values )
                            .then( ( result ) => {
                                return result.insertId;
                            } );
                    }
                } )
        },

        getTrackID: function ( theName ) {
            const selectQuery = `SELECT id FROM tracks WHERE trackName = ?;`;
            const values = [ theName ];
            return this.runQuery( selectQuery, values )
                .then( ( result ) => {
                    if ( result.length !== 0 ) {
                        return result[ 0 ][ 'id' ];
                    } else {
                        const insertQuery = `INSERT INTO tracks SET ?;`;
                        const values = { trackName: theName }
                        return this.runQuery( insertQuery, values )
                            .then( ( result ) => {
                                return result.insertId;
                            } );
                    }
                } )
        },

        saveLastSongStats: function ( songFunctions ) {
            return this.getLastSongID( songFunctions.previousArtist(), songFunctions.previousTrack() )
                .then( ( theID ) => {
                    const query = "UPDATE tracksPlayed tp SET upvotes=?, downvotes=?, snags=? WHERE tp.id=?";
                    const values = [ songFunctions.previousUpVotes(), songFunctions.previousDownVotes(), songFunctions.previousSnags(), theID ];
                    return this.runQuery( query, values )
                } )
                .catch( ( ex ) => { console.log( "Something went wrong saving the song stats: .then( ( theID ) " + ex ); } );
        },

        getLastSongID: function ( theArtist, theTrack ) {
            const selectQuery = "SELECT MAX(tp.id) AS theID FROM tracksPlayed tp JOIN tracks t ON tp.trackID=t.id JOIN artists a ON tp.artistID=a.id WHERE t.trackname=? AND a.artistName=?;";
            const values = [ theTrack, theArtist ];
            return this.runQuery( selectQuery, values )
                .then( ( result ) => {
                    if ( result.length !== 0 ) {
                        return result[ 0 ][ 'theID' ];
                    } else {
                        console.log( "We couldn't find the last track in the DB?!?" );
                        console.log( "Track: " + theTrack + " by: " + theArtist );
                    }
                } )
        },

        getCurrentSongID: function () {
            const selectQuery = "SELECT MAX(tp.id) AS theID FROM tracksPlayed tp;";
            const values = [];
            return this.runQuery( selectQuery, values )
                .then( ( result ) => {
                    if ( result.length !== 0 ) {
                        return result[ 0 ][ 'theID' ];
                    }
                } )
        },

        calcTrackLength: function ( trackID ) {
            return this.getTrackPlayedTime( trackID )
                .then( ( thisTrackPlayedTime ) => {
                    return this.getTrackPlayedTime( trackID + 1 )
                        .then( ( nextTrackPlayedTime ) => {
                            const theLength = nextTrackPlayedTime - thisTrackPlayedTime;
                            return theLength;
                        } )
                } )
                .catch( ( ex ) => { console.log( "Something went wrong calculating the track length: " + ex ); } );
        },

        getTrackPlayedTime: function ( trackID ) {
            const selectQuery = "SELECT UNIX_TIMESTAMP(whenPlayed) AS timestampPlayed FROM tracksPlayed tp WHERE tp.id = ?;";
            const values = [ trackID ];
            return this.runQuery( selectQuery, values )
                .then( ( result ) => {
                    if ( result.length !== 0 ) {
                        return result[ 0 ][ 'timestampPlayed' ];
                    }
                } )
                .catch( ( ex ) => { console.log( "Something went wrong getting the track played time: " + ex ); } );
        },

        // ========================================================

        // ========================================================
        // Misc Functions
        // ========================================================

        getRandomVerifiedArtist () {
            return new Promise( ( resolve, reject ) => {
                const selectQuery = "select DISTINCT(displayName) from artists WHERE displayName IS NOT NULL ORDER BY RAND() LIMIT 1;";
                const values = [];

                this.runQuery( selectQuery, values )
                    .then( ( result ) => {
                        if ( result.length !== 0 ) {
                            resolve( result[ 0 ][ 'displayName' ] );
                        }
                    } )
            }
        },

        // ========================================================

        // ========================================================
        // Command Functions
        // ========================================================

        incrementCommandCountForCurrentTrack: function ( theCommand ) {
            this.getCurrentSongID()
                .then( ( trackID ) => {
                    this.getCommandID( theCommand )
                        .then( ( commandID ) => {
                            this.getCurrentCommandCount( commandID, trackID )
                                .then( ( commandCount ) => {
                                    const query = "REPLACE INTO extendedTrackStats (count, commandsToCount_id, tracksPlayed_id) VALUES (?, ?, ?)";
                                    const values = [ commandCount + 1, commandID, trackID ];
                                    this.runQuery( query, values )
                                } )
                                .catch( ( ex ) => { console.log( "Something went wrong saving the extended stats: " + ex ); } );
                        } )
                        .catch( ( ex ) => { console.log( "Something went wrong finding the CommandID: " + ex ); } );
                } )
                .catch( ( ex ) => { console.log( "Something went wrong getting the current Command count: " + ex ); } );
        },

        getCommandID: function ( theCommand ) {
            const selectQuery = "SELECT id as theID FROM commandsToCount WHERE command = ?;";
            const values = [ theCommand ];
            return this.runQuery( selectQuery, values )
                .then( ( result ) => {
                    if ( result.length !== 0 ) {
                        return result[ 0 ][ 'theID' ];
                    }
                } )
        },

        getCurrentCommandCount: function ( commandID, trackID ) {
            const selectQuery = "SELECT count as theCount FROM extendedTrackStats WHERE commandsToCount_id = ? AND tracksPlayed_id = ?;";
            const values = [ commandID, trackID ];
            return this.runQuery( selectQuery, values )
                .then( ( result ) => {
                    if ( result.length !== 0 ) {
                        return result[ 0 ][ 'theCount' ];
                    } else {
                        return 0;
                    }
                } )
        },

        // ========================================================

        // ========================================================
        // Config Functions
        // ========================================================

        commandsToCount: function () {
            const selectQuery = "SELECT command FROM commandsToCount;";
            const values = [];
            return this.runQuery( selectQuery, values )
                .then( ( results ) => {
                    return this.convertToArray( results, "command" );
                }
                )
        },

        // ========================================================

        // ========================================================
        // Helper Functions
        // ========================================================

        convertToArray: function ( results, column ) {
            let theArray = [];

            for ( let i = 0; i < results.length; i++ ) {
                let currentRow = results[ i ];
                let thisCommand = currentRow[ column ];
                theArray.push( thisCommand );
            }
            return theArray;
        }

        // ========================================================

    }

}

module.exports = databaseFunctions;