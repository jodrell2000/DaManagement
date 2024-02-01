const mysql = require( '../modules/dbConnectionPool' );

const { dirname } = require( "path" );
const fs = require( "fs" );

const databaseFunctions = () => {

    return {

        // ========================================================
        // Database Functions
        // ========================================================

        runQuery: async function ( query, values ) {
            return new Promise( ( resolve, reject ) => {
                mysql.pool.getConnection( ( ex, connection ) => {
                    if ( ex ) {
                        console.error( `Error acquiring connection from pool: ${ ex }` );
                        reject( new Error( 'Error acquiring connection from pool' ) );
                    } else {
                        connection.query( query, values, ( ex, results, fields ) => {
                            connection.release();
                            if ( ex ) {
                                console.error( `Query execution failed: ${ ex }\nQuery: ${ query }` );
                                reject( new Error( `Query execution failed: ${ ex }` ) );
                            } else {
                                resolve( results );
                            }
                        } );
                    }
                } );
            } ).catch( error => {
                console.error( 'Promise rejection with reason:', error );
                throw error; // Rethrow the error for further investigation
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

        writeUserDataToDatabase: async function ( userObject ) {
            try {
                const query = this.buildSaveUserQuery( userObject );
                await this.runQuery( query );
            } catch ( error ) {
                throw new Error( `Error writing user data to database: ${ error.message }` );
            }
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
            return new Promise( ( resolve, reject ) => {
                try {
                    const userToSave = this.removeUnsavableDataFromUser( userObject );
                    this.writeUserDataToDisk( userToSave );
                    this.writeUserDataToDatabase( userToSave );
                    resolve();
                } catch ( error ) {
                    reject( error );
                }
            } );
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
        // RoboCoin Audit Functions
        // ========================================================

        saveRoboCoinAudit: async function ( userID, before, after, numCoins, changeReason, changeID ) {
            const theQuery = "INSERT INTO roboCoinAudit (users_id, beforeChange, afterChange, numCoins, changeReason, auditType_id) VALUES (?, ?, ?, ?, ?, ?);";
            const values = [ userID, before, after, numCoins, changeReason, changeID ];

            try {
                const result = await this.runQuery( theQuery, values );
                return result;
            } catch ( error ) {
                console.error( 'Error in saveRoboCoinAudit:', error.message );
                // Handle the error as needed
                throw error; // Rethrow the error if necessary
            }
        },

        hasUserHadInitialRoboCoinGift: async function ( userID ) {
            const theQuery = "SELECT COUNT(*) AS gifted FROM roboCoinAudit WHERE users_id=? AND auditType_id=1;";
            const values = [ userID ];
            try {
                const result = await this.runQuery( theQuery, values );
                const firstElement = result && result[ 0 ];
                const giftedValue = firstElement && firstElement.gifted;

                return giftedValue > 0;
            } catch ( error ) {
                console.error( 'Error in checking hasUserHadInitialRoboCoinGift in the DB:', error.message );
                // Handle the error as needed
                throw error; // Rethrow the error if necessary
            }
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
                        .catch( ( ex ) => { console.error( "Something went wrong: " + ex ); } );
                } )
                .catch( ( ex ) => { console.error( "Something went wrong: " + ex ); } );
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
                .catch( ( ex ) => { console.error( "Something went wrong saving the song stats: .then( ( theID ) " + ex ); } );
        },

        getLastSongID: function ( theArtist, theTrack ) {
            const selectQuery = "SELECT MAX(tp.id) AS theID FROM tracksPlayed tp JOIN tracks t ON tp.trackID=t.id JOIN artists a ON tp.artistID=a.id WHERE t.trackname=? AND a.artistName=?;";
            const values = [ theTrack, theArtist ];
            return this.runQuery( selectQuery, values )
                .then( ( result ) => {
                    if ( result.length !== 0 ) {
                        return result[ 0 ][ 'theID' ];
                    } else {
                        console.error( "We couldn't find the last track in the DB?!?" );
                        console.error( "Track: " + theTrack + " by: " + theArtist );
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
                .catch( ( ex ) => { console.error( "Something went wrong calculating the track length: " + ex ); } );
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
                .catch( ( ex ) => { console.error( "Something went wrong getting the track played time: " + ex ); } );
        },

        // ========================================================

        // ========================================================
        // DB Track Editing Functions
        // ========================================================

        getRandomVerifiedArtist() {
            return new Promise( ( resolve, _ ) => {
                const selectQuery = "SELECT DISTINCT(displayName) FROM artists WHERE displayName IS NOT NULL ORDER BY RAND() LIMIT 1;";
                const values = [];

                this.runQuery( selectQuery, values )
                    .then( ( result ) => {
                        if ( result.length !== 0 ) {
                            resolve( result[ 0 ][ 'displayName' ] );
                        }
                    } )
            } )
        },

        getVerifiedArtistsFromName( theArtist ) {
            const selectQuery = "SELECT displayName FROM artists WHERE artistName = ?;";
            const values = [ theArtist ];

            return this.runQuery( selectQuery, values )
                .then( ( result ) => {
                    return result;
                } );
        },

        getVerifiedTracksFromName( theSong ) {
            const selectQuery = "SELECT displayName FROM tracks WHERE trackName = ?;";
            const values = [ theSong ];

            return this.runQuery( selectQuery, values )
                .then( ( result ) => {
                    return result;
                } );
        },

        getUnverifiedSongList( sort ) {
            console.group( "getUnverifiedSongList" );
            console.log( "sort:", sort );
            let orderByClause = '';

            switch ( sort ) {
                case 'time':
                    orderByClause = ' ORDER BY tp.whenPlayed DESC';
                    break;
                case 'artist':
                    orderByClause = ' ORDER BY COALESCE(a.displayName, a.artistName) ASC, COALESCE(t.displayName, t.trackname) ASC';
                    break;
                case 'track':
                    orderByClause = ' ORDER BY COALESCE(t.displayName, t.trackname) ASC, COALESCE(a.displayName, a.artistName) ASC';
                    break;
                default:
                    orderByClause = ' ORDER BY COALESCE(a.displayName, a.artistName) ASC, COALESCE(t.displayName, t.trackname) ASC';
            }

            const selectQuery = `
        SELECT 
            tp.id AS trackPlayedID,
            a.id AS artistID, 
            a.artistName, 
            a.displayName AS artistDisplayName, 
            t.id AS trackID, 
            t.trackName, 
            t.displayName AS trackDisplayName, 
            ROUND(AVG(tp.length)) AS length 
        FROM 
            tracksPlayed tp 
            JOIN artists a ON a.id=tp.artistID 
            JOIN tracks t ON t.id=tp.trackID 
        WHERE 
            a.displayName IS NULL OR t.displayName IS NULL
        GROUP BY tp.id
        ${orderByClause}
        LIMIT 50`;

            const values = [];
            console.log( "selectQuery:", selectQuery );
            console.groupEnd();

            // return this.runQuery( selectQuery, values )
            //     .then( ( result ) => {
            //         return result;
            //     } );
        },

        updateArtistDisplayName( artistID, artistDisplayName ) {
            const selectQuery = "UPDATE artists SET displayName=? WHERE id=?;";
            const values = [ artistDisplayName, artistID ];

            return this.runQuery( selectQuery, values )
                .then( ( result ) => {
                    return result;
                } );
        },

        splitArtistName: async function ( trackPlayedID, artistName ) {
            const updateTrackPlayedQuery = "UPDATE tracksPlayed SET artistID=? WHERE id=?;";

            try {
                const artistID = await this.createNewArtist( artistName );
                const values = [ artistID, trackPlayedID ];

                return await this.runQuery( updateTrackPlayedQuery, values );
            } catch ( error ) {
                console.error( "Error splitting artist name:", error );
                throw error;
            }
        },

        createNewArtist: async function ( artistName ) {
            const createArtistQuery = "INSERT INTO artists SET artistName=?;";
            const values = [ artistName ];

            try {
                const result = await this.runQuery( createArtistQuery, values );
                return result.insertId;
            } catch ( error ) {
                console.error( "Error creating new artist:", error );
                throw error;
            }
        },

        updateTrackDisplayName( trackID, trackDisplayName ) {
            const selectQuery = "UPDATE tracks SET displayName=? WHERE id=?;";
            const values = [ trackDisplayName, trackID ];

            return this.runQuery( selectQuery, values )
                .then( ( result ) => {
                    return result;
                } );
        },

        splitTrackName: async function ( trackPlayedID, trackName ) {
            const updateTrackPlayedQuery = "UPDATE tracksPlayed SET trackID=? WHERE id=?;";

            try {
                const trackID = await this.createNewTrack( trackName );
                const values = [ trackID, trackPlayedID ];

                return await this.runQuery( updateTrackPlayedQuery, values );
            } catch ( error ) {
                console.error( "Error splitting artist name:", error );
                throw error;
            }
        },

        createNewTrack: async function ( trackName ) {
            const createTrackQuery = "INSERT INTO tracks SET trackName=?;";
            const values = [ trackName ];

            try {
                const result = await this.runQuery( createTrackQuery, values );
                return result.insertId;
            } catch ( error ) {
                console.error( "Error creating new artist:", error );
                throw error;
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
                                .catch( ( ex ) => { console.error( "Something went wrong saving the extended stats: " + ex ); } );
                        } )
                        .catch( ( ex ) => { console.error( "Something went wrong finding the CommandID: " + ex ); } );
                } )
                .catch( ( ex ) => { console.error( "Something went wrong getting the current Command count: " + ex ); } );
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
                } )
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
        },

        // ========================================================

        // ========================================================
        // Top 10 Functions
        // ========================================================

        async fullTop10Results( startDate, endDate, includeDays = [ 0, 1, 2, 3, 4, 5, 6 ] ) {
            const selectQuery = `SELECT COALESCE(a.displayName, a.artistName) AS "artist", COALESCE(t.displayName, t.trackname) AS "track", 
(SUM(tp.upvotes-tp.downvotes) + SUM(tp.snags*6) + 
SUM(IF(c.command='props', e.count, 0))*5 +
SUM(IF(c.command='noice', e.count, 0))*5 +
SUM(IF(c.command='spin', e.count, 0))*5 +
SUM(IF(c.command='tune', e.count, 0))*5) * COUNT(DISTINCT(u.id)) AS "points",
count(tp.id) AS "plays"
FROM users u 
JOIN tracksPlayed tp ON tp.djID=u.id 
JOIN tracks t ON tp.trackID=t.id 
JOIN artists a ON tp.artistID=a.id
LEFT JOIN extendedTrackStats e ON e.tracksPlayed_id = tp.id 
LEFT JOIN commandsToCount c ON c.id=e.commandsToCount_id
WHERE CONVERT_TZ(tp.whenPlayed, "UTC", "US/Central") BETWEEN ? AND ? AND 
tp.length>60 AND
u.username != "Mr. Roboto" AND 
DAYOFWEEK(CONVERT_TZ(tp.whenPlayed, "UTC", "US/Central")) IN (${ includeDays.join( ', ' ) }) 
GROUP BY COALESCE(a.displayName, a.artistName), COALESCE(t.displayName, t.trackname)
ORDER BY 3 DESC, 4 DESC
LIMIT 15;`;

            const values = [ startDate, endDate ];

            try {
                const result = await this.runQuery( selectQuery, values );
                return result;
            } catch ( error ) {
                console.error( error );
                throw error;
            }
        },

        async top10ByLikesResults( startDate, endDate, includeDays = [ 0, 1, 2, 3, 4, 5, 6 ] ) {
            const selectQuery = `SELECT COALESCE( a.displayName, a.artistName ) AS "artist", COALESCE( t.displayName, t.trackname ) AS "track", SUM( tp.upvotes ) as upvotes, SUM( tp.downvotes ) as 'downvotes',
                count( tp.id ) AS "plays"
FROM users u 
JOIN tracksPlayed tp ON tp.djID = u.id 
JOIN tracks t ON tp.trackID = t.id 
JOIN artists a ON tp.artistID = a.id
LEFT JOIN extendedTrackStats e ON e.tracksPlayed_id = tp.id 
LEFT JOIN commandsToCount c ON c.id = e.commandsToCount_id
WHERE CONVERT_TZ(tp.whenPlayed, "UTC", "US/Central") BETWEEN ? AND ? AND 
tp.length > 60 AND
u.username != "Mr. Roboto" AND 
DAYOFWEEK(CONVERT_TZ(tp.whenPlayed, "UTC", "US/Central")) IN (${ includeDays.join( ', ' ) }) 
GROUP BY COALESCE(a.displayName, a.artistName), COALESCE(t.displayName, t.trackname)
ORDER BY 3 DESC, 4 ASC, 5 DESC
limit 15;`;

            const values = [ startDate, endDate ];

            try {
                const result = await this.runQuery( selectQuery, values );
                return result;
            } catch ( error ) {
                console.error( error );
                throw error;
            }
        },

        async mostPlayedTracksResults( startDate, endDate, includeDays = [ 0, 1, 2, 3, 4, 5, 6 ] ) {
            const selectQuery = `SELECT COALESCE(a.displayName, a.artistName) AS "artist", COALESCE(t.displayName, t.trackname) AS "track", SUM(tp.upvotes-tp.downvotes) as 'points',
count(tp.id) AS "plays"
FROM users u 
JOIN tracksPlayed tp ON tp.djID=u.id 
JOIN tracks t ON tp.trackID=t.id 
JOIN artists a ON tp.artistID=a.id
LEFT JOIN extendedTrackStats e ON e.tracksPlayed_id = tp.id 
LEFT JOIN commandsToCount c ON c.id=e.commandsToCount_id
WHERE CONVERT_TZ(tp.whenPlayed, "UTC", "US/Central") BETWEEN ? AND ? AND 
tp.length>60 AND
u.username != "Mr. Roboto" AND 
DAYOFWEEK(CONVERT_TZ(tp.whenPlayed, "UTC", "US/Central")) IN (${ includeDays.join( ', ' ) }) 
GROUP BY COALESCE(a.displayName, a.artistName), COALESCE(t.displayName, t.trackname)
ORDER BY 4 DESC, 3 DESC 
limit 15;`;

            const values = [ startDate, endDate ];

            try {
                const result = await this.runQuery( selectQuery, values );
                return result;
            } catch ( error ) {
                console.error( error );
                throw error;
            }
        },

        async mostPlayedArtistsResults( startDate, endDate, includeDays = [ 0, 1, 2, 3, 4, 5, 6 ] ) {
            const selectQuery = `SELECT artist, COUNT(*) as "plays", SUM(points) as "points" FROM (
SELECT COALESCE(a.displayName, a.artistName) as "artist", (tp.upvotes-tp.downvotes+(tp.snags*6)+ 
SUM(IF(c.command='props', e.count, 0))*5+
SUM(IF(c.command='noice', e.count, 0))*5+
SUM(IF(c.command='spin', e.count, 0))*5+
SUM(IF(c.command='tune', e.count, 0))*5) * COUNT(DISTINCT(u.id)) AS points
FROM users u 
JOIN tracksPlayed tp ON tp.djID=u.id 
JOIN tracks t ON tp.trackID=t.id 
JOIN artists a ON tp.artistID=a.id
LEFT JOIN extendedTrackStats e ON e.tracksPlayed_id = tp.id 
LEFT JOIN commandsToCount c ON c.id=e.commandsToCount_id
WHERE CONVERT_TZ(tp.whenPlayed, "UTC", "US/Central") BETWEEN ? AND ? AND 
tp.length>60 AND
u.username != "Mr. Roboto" AND
DAYOFWEEK(CONVERT_TZ(tp.whenPlayed, "UTC", "US/Central")) IN (${ includeDays.join( ', ' ) }) 
GROUP BY tp.id, COALESCE(a.displayName, a.artistName)
) trackPoints
GROUP BY Artist
ORDER BY 2 DESC, 3 DESC
limit 15;`;

            const values = [ startDate, endDate ];

            try {
                const result = await this.runQuery( selectQuery, values );
                return result;
            } catch ( error ) {
                console.error( error );
                throw error;
            }
        },

        async roomSummaryResults( startDate, endDate ) {
            const selectQuery = `SELECT COUNT(tp.id) AS "plays", COUNT(DISTINCT(u.id)) AS "djs", SUM(tp.upvotes) "upvotes",  SUM(tp.downvotes) as "downvotes"
FROM tracksPlayed tp 
JOIN users u ON tp.djID=u.id 
WHERE CONVERT_TZ(tp.whenPlayed, "UTC", "US/Central") BETWEEN ? AND ? AND 
u.username != "Mr. Roboto";`;
            const values = [ startDate, endDate ];

            try {
                const result = await this.runQuery( selectQuery, values );
                return result;
            } catch ( error ) {
                console.error( error );
                throw error;
            }
        },

        async top10DJResults( startDate, endDate ) {
            const selectQuery = `SELECT dj, SUM(points) as "points" FROM (
SELECT u.username as "dj", SUM(tp.upvotes)-SUM(tp.downvotes)+SUM(tp.snags*6)+
(SUM(IF(c.command='props', e.count, 0))*5)+
(SUM(IF(c.command='noice', e.count, 0))*5)+
(SUM(IF(c.command='spin', e.count, 0))*5)+
(SUM(IF(c.command='tune', e.count, 0))*5) AS points
FROM users u 
JOIN tracksPlayed tp ON tp.djID=u.id 
JOIN tracks t ON tp.trackID=t.id 
JOIN artists a ON tp.artistID=a.id
LEFT JOIN extendedTrackStats e ON e.tracksPlayed_id = tp.id 
LEFT JOIN commandsToCount c ON c.id=e.commandsToCount_id
WHERE CONVERT_TZ(tp.whenPlayed, "UTC", "US/Central") BETWEEN ? AND ? AND 
tp.length>60
GROUP BY tp.id, u.username
) trackPoints
GROUP BY dj
ORDER BY 2 DESC
LIMIT 11;`;
            const values = [ startDate, endDate ];

            try {
                const result = await this.runQuery( selectQuery, values );
                return result;
            } catch ( error ) {
                console.error( error );
                throw error;
            }
        },

        // ========================================================

    }


}

module.exports = databaseFunctions;