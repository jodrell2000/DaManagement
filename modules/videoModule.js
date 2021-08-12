// load the googleAPI
let fs = require('fs');
let readline = require('readline');
let {google} = require('googleapis');
let OAuth2 = google.auth.OAuth2;
let SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
let TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ) + '/.credentials/';
let TOKEN_PATH = TOKEN_DIR + 'theManagementCredentials.json';

let clientSecret;
let clientId;
let redirectUrl;
let oauth2Client;

const videoFunctions = ( bot ) => {
    function getNewToken ( oauth2Client, callback ) {
        let authUrl = oauth2Client.generateAuthUrl( {
            access_type: 'offline',
            scope: SCOPES
        } );
        console.log( 'Authorize this app by visiting this url: ', authUrl );
        let rl = readline.createInterface( {
            input: process.stdin,
            output: process.stdout
        } );
        rl.question( 'Enter the code from that page here: ', function ( code ) {
            rl.close();
            oauth2Client.getToken( code, function ( err, token ) {
                if ( err ) {
                    console.log( 'Error while trying to retrieve access token', err );
                    return;
                }
                oauth2Client.credentials = token;
                storeToken( token );
                callback( oauth2Client );
            } );
        } );
    }

    function storeToken ( token ) {
        try {
            fs.mkdirSync( TOKEN_DIR );
        } catch ( err ) {
            if ( err.code != 'EEXIST' ) {
                throw err;
            }
        }
        fs.writeFile( TOKEN_PATH, JSON.stringify( token ), ( err ) => {
            if ( err ) throw err;
            console.log( 'Token stored to ' + TOKEN_PATH );
        } );
    }

    function getVideoDetails ( auth, videoID ) {
        let service = google.youtube( 'v3' );
        service.videos.list( {
            auth: auth,
            part: 'snippet,contentDetails,statistics',
            id: videoID
        }, function ( err, response ) {
            if ( err ) {
                console.log( 'The API returned an error: ' + err );
                return;
            }

            let importantRegions = [ 'US', 'GB' ];
            let videoData = response.data.items;
            if ( videoData[ 0 ].contentDetails.regionRestriction !== undefined ) {
                console.log( JSON.stringify( videoData[ 0 ].contentDetails.regionRestriction ) );
                return videoData[ 0 ].contentDetails.regionRestriction;
            } else {
                console.log('Didn\'t find any regions:' + JSON.stringify( videoData ) );
            }

            // for ( let regionLoop = 0;  regionLoop < videoData.regionRestriction.allowed.length; regionLoop++ ) {
            //     console.log(videoData.regionRestriction.allowed[0]);
            // }
        } );
    }

    function authorize ( credentials, callback, videoID ) {
        clientSecret = credentials.installed.client_secret;
        clientId = credentials.installed.client_id;
        redirectUrl = credentials.installed.redirect_uris[ 0 ];
        oauth2Client = new OAuth2( clientId, clientSecret, redirectUrl );

        // Check if we have previously stored a token.
        fs.readFile( TOKEN_PATH, function ( err, token ) {
            if ( err ) {
                getNewToken( oauth2Client, callback );
            } else {
                oauth2Client.credentials = JSON.parse( token );
                callback( oauth2Client, videoID );
            }
        } );
    }

    function checkVideo ( videoID ) {
        fs.readFile( 'client_secret.json', function processClientSecrets( err, content ) {
            if ( err ) {
                console.log( 'Error loading client secret file: ' + err );
            }
            // Authorize a client with the loaded credentials, then call the YouTube API.
            authorize( JSON.parse( content ), getVideoDetails, videoID );
        } );
    }

    return {

        readRegions: function ( data, args, chatFunctions ) {
            const videoID = args[0];
            checkVideo( videoID )
        },

    }
}

module.exports = videoFunctions;