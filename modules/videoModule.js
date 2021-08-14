// load the googleAPI
let fs = require( 'fs/promises' );
let readline = require( 'readline' );
let { google } = require( 'googleapis' );
const { check } = require( 'prettier' );
let OAuth2 = google.auth.OAuth2;
let SCOPES = [ 'https://www.googleapis.com/auth/youtube.readonly' ];
let TOKEN_DIR = ( process.env.HOME || process.env.HOMEPATH ) + '/.credentials/';
let TOKEN_PATH = TOKEN_DIR + 'theManagementCredentials.json';

let clientSecret;
let clientId;
let redirectUrl;
let oauth2Client;

let musicDefaults = require( '../defaultSettings/musicDefaults.js' );
let alertIfRegionBlocked = musicDefaults.alertIfRegionBlocked; //song play limit, this is for the playLimit variable up above(off by default)

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
                console.log( 'Didn\'t find any regions:' + JSON.stringify( videoData ) );
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
        fs.readFile( 'client_secret.json', function processClientSecrets ( err, content ) {
            if ( err ) {
                console.log( 'Error loading client secret file: ' + err );
            }
            // Authorize a client with the loaded credentials, then call the YouTube API.
            authorize( JSON.parse( content ), getVideoDetails, videoID );
        } );
    }

    //allow undefined blocked undefined - allowed everywhere
    //allow undefined blocked emptyList - blocked nowhere

    //allow list blocked undefined - allowed somewhere
    //allow undefined blocked list - blocked somewhere

    //allow emptyList blocked undefined - allowed nowhere

    async function ensureToken ( credentials ) {
        const clientSecret = credentials.installed.client_secret;
        const clientId = credentials.installed.client_id;
        const redirectUrl = credentials.installed.redirect_uris[ 0 ];
        const oauth2Client = new OAuth2( clientId, clientSecret, redirectUrl );
        fs.readFile( TOKEN_PATH )
            .then( JSON.parse )
            .catch( ( err ) = {
//                return getNewToken( oauth2Client )
            } )
    }

    async function authorize2 () {
        const contents = await fs.readFile( 'client_secret.json' )
        const token = await ensureToken( JSON.parse( contents ) )
        return await buildClient( token );
    }

    return {

        alertIfRegionBlocked: () => alertIfRegionBlocked,

        listAlertRegions: function ( data, chatFunctions ) {
            chatFunctions.botSpeak( data, 'The list of regions that will triger a blocked alert is currently ' + this.alertIfRegionBlocked() );
        },

        addAlertRegion: function ( data, args, chatFunctions ) {
            const region = args[0];
            if ( this.alertIfRegionBlocked().indexOf( region ) === -1 ) {
                alertIfRegionBlocked.push( region )
                chatFunctions.botSpeak( data, region + ' has been added to the region alerts list' );
            } else {
                chatFunctions.botSpeak( data, region + ' is already in the reggion alerts list' );
            }
        },

        removeAlertRegion: function ( data, args, chatFunctions ) {
            const region = args[0];
            if ( this.alertIfRegionBlocked().indexOf( region ) === -1 ) {
                chatFunctions.botSpeak( data, region + ' is not in the region alerts list' );
            } else {
                const listPosition = this.alertIfRegionBlocked().indexOf( region );
                alertIfRegionBlocked.splice( listPosition, 1 );
                chatFunctions.botSpeak( data, region + ' has been removed from the reggion alerts list' );
            }
        },

        readRegions: function ( data, args, userFunctions, chatFunctions ) {
            const theDJID = data.room.metadata.current_dj;
            const videoID = args[ 0 ];

            authorize2()
                .then( ( oauthClient ) => checkVideo2( oauthClient, videoId ) )
                .then( ( blocked, hasRestrictions, restrictionDescription ) => {
                    if ( blocked ) {
                        chatFunctions.botSpeak( data, '@' + userFunctions.getUsername( theDJID ) + ' that video is blocked everywhere' );
                    } else if ( hasRestrictions ) {
                        chatFunctions.botSpeak( data, '@' + userFunctions.getUsername( theDJID ) +
                            ' that video is blocked in the following important places' + '' );
                    } else {
                        console.log( "Mum's the word...video has no restrictions" )
                    }
                } )
        },

    }
}

module.exports = videoFunctions;