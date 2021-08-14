// load the googleAPI
let { google } = require( "googleapis" );
let authorize = require("./oauth2lib")

let SCOPES = [ "https://www.googleapis.com/auth/youtube.readonly" ];
let TOKEN_DIR = ( process.env.HOME || process.env.HOMEPATH ) + "/.credentials/";
let TOKEN_PATH = TOKEN_DIR + "theManagementCredentials.json";

let musicDefaults = require( "../defaultSettings/musicDefaults.js" );
let alertIfRegionBlocked = musicDefaults.alertIfRegionBlocked; //song play limit, this is for the playLimit variable up above(off by default)

const videoFunctions = ( bot ) => {
    function logMe ( logLevel, message ) {
        const theFile = 'videoFunctions';
        switch ( logLevel ) {
            case "error":
                console.log( "!!!!!!!!!!! " + theFile + ":" + logLevel + "->" + message + "\n" );
                break;
            case "warn":
                console.log( "+++++++++++ " + theFile + ":" + logLevel + "->" + message + "\n" );
                break;
            case "info":
                console.log( "----------- " + theFile + ":" + logLevel + "->" + message + "\n" );
                break;
            default:
                if ( bot.debug ) {
                    console.log( theFile + ":" + logLevel + "->" + message + "\n" );
                }
                break;
        }
    }

    async function queryVideoDetails ( auth, videoID ) {
        let service = google.youtube( "v3" );
        return service.videos
            .list( {
                auth: auth,
                part: "snippet,contentDetails,statistics",
                id: videoID,
            } )
            .then( ( { data } ) => {
                return data.items[ 0 ].contentDetails;
            } );
    }

    async function checkVideo ( auth, videoID ) {
        const { regionRestriction } = await queryVideoDetails( auth, videoID );
        if ( regionRestriction !== undefined ) {
            return regionRestriction;
        } else {
            return null;
        }
    }

    //allow undefined blocked undefined - allowed everywhere
    //allow undefined blocked emptyList - blocked nowhere

    //allow list blocked undefined - allowed somewhere
    //allow undefined blocked list - blocked somewhere

    //allow emptyList blocked undefined - allowed nowhere


    function areAnyAlertRegionsBlocked ( alertRegions, blockedRegions ) {
        let blockedRegionsWeCareAbout = '';
        for ( let checkRegionLoop = 0; checkRegionLoop < alertRegions.length; checkRegionLoop++ ) {
            for ( let blockedRegionLoop = 0; blockedRegionLoop < blockedRegions.length; blockedRegionLoop++ ) {
                if ( alertRegions[ checkRegionLoop ] === blockedRegions[ blockedRegionLoop ] ) {
                    blockedRegionsWeCareAbout.push( alertRegions[ checkRegionLoop ] );
                }
            }
        }

        if ( blockedRegionsWeCareAbout.length === alertRegions.length ) {
            return true;
        } else {
            return false;
        }
    }

    function areAllAlertRegionsAllowed ( alertRegions, allowedRegions ) {
        let allowedRegionsWeCareAbout = [];
        for ( let checkRegionLoop = 0; checkRegionLoop < alertRegions.length; checkRegionLoop++ ) {
            for ( let allowedRegionLoop = 0; allowedRegionLoop < allowedRegions.length; allowedRegionLoop++ ) {
                if ( alertRegions[ checkRegionLoop ] === allowedRegions[ allowedRegionLoop ] ) {
                    allowedRegionsWeCareAbout.push( alertRegions[ checkRegionLoop ] );
                }
            }
        }

        if ( allowedRegionsWeCareAbout.length === alertRegions.length ) {
            return true;
        } else {
            return false;
        }
    }

    return {
        alertIfRegionBlocked: () => alertIfRegionBlocked,

        listAlertRegions: function ( data, chatFunctions ) {
            chatFunctions.botSpeak(
                data,
                "The list of regions that will triger a blocked alert is currently " +
                this.alertIfRegionBlocked()
            );
        },

        addAlertRegion: function ( data, args, chatFunctions ) {
            const region = args[ 0 ];
            if ( this.alertIfRegionBlocked().indexOf( region ) === -1 ) {
                alertIfRegionBlocked.push( region );
                chatFunctions.botSpeak(
                    data,
                    region + " has been added to the region alerts list"
                );
            } else {
                chatFunctions.botSpeak(
                    data,
                    region + " is already in the reggion alerts list"
                );
            }
        },

        removeAlertRegion: function ( data, args, chatFunctions ) {
            const region = args[ 0 ];
            if ( this.alertIfRegionBlocked().indexOf( region ) === -1 ) {
                chatFunctions.botSpeak(
                    data,
                    region + " is not in the region alerts list"
                );
            } else {
                const listPosition = this.alertIfRegionBlocked().indexOf( region );
                alertIfRegionBlocked.splice( listPosition, 1 );
                chatFunctions.botSpeak(
                    data,
                    region + " has been removed from the reggion alerts list"
                );
            }
        },

        readRegions: function ( data, args, userFunctions, chatFunctions ) {
            // const theDJID = userFunctions.getCurrentDJID()
            const videoID = args[ 0 ];

            authorize( "client_secret.json", TOKEN_PATH, SCOPES)
                .then( ( oauthClient ) => checkVideo( oauthClient, videoID ) )
                .then( ( restrictions ) => {
                    if ( restrictions.allowed !== undefined ) {
                        logMe( 'info', 'readRegions, restrictions: allowed found' + JSON.stringify( restrictions.allowed ) );
                        logMe( 'info', 'readRegions, restrictions: ' + restrictions.allowed.length + ' found' );
                        if ( !areAllAlertRegionsAllowed( this.alertIfRegionBlocked(), restrictions.allowed ) ) {
                            chatFunctions.botSpeak( data, 'This video can\'t be played in one of the regions we care about. Please consider skipping' );
                        }
                    }
                    if ( restrictions.blocked !== undefined ) {
                        logMe( 'info', 'readRegions, restrictions: blocked found' + JSON.stringify( restrictions.blocked ) );
                        if ( areAnyAlertRegionsBlocked( this.alertIfRegionBlocked(), restrictions.allowed ) ) {
                            chatFunctions.botSpeak( data, 'This video can\'t be played in one of the regions we care about. Please consider skipping' );
                        }
                    }
                } );
        },
    };
};

module.exports = videoFunctions;
