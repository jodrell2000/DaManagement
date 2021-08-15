// load the googleAPI
let { google } = require( "googleapis" );
let authorize = require( "./oauth2lib" );

let { setIntersection, setDifference } = require( "../modules/setlib" );

let SCOPES = [ "https://www.googleapis.com/auth/youtube.readonly" ];
let CLIENT_SECRET_PATH = "client_secret.json";
let TOKEN_DIR = ( process.env.HOME || process.env.HOMEPATH ) + "/.credentials/";
let TOKEN_PATH = TOKEN_DIR + "theManagementCredentials.json";

const countryLookup = require( 'country-code-lookup' );

let musicDefaults = require( "../defaultSettings/musicDefaults.js" );
let regionsWeCareAbout = new Set( musicDefaults.alertRegions ); //song play limit, this is for the playLimit variable up above(off by default)

const videoFunctions = () => {
    function logMe( logLevel, message ) {
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
                    console.log( "" + theFile + ":" + logLevel + "->" + message + "\n" );
                }
                break;
        }
    }

    function alertIfRegionsNotAllowed( restrictions, notifier ) {
        let missingRegions = setDifference(
            regionsWeCareAbout,
            restrictions.allowed
        );
        if ( missingRegions.length ) {
            notifier(
                'This video can\'t be played in ' + turnCodesIntoCountries( missingRegions ) + '. Please consider skipping.'
            );
        }
    }

    function alertIfRegionsBlocked( restrictions, notifier ) {
        let blockedRegions = setIntersection(
            regionsWeCareAbout,
            restrictions.blocked
        );
        if ( blockedRegions.length ) {
            notifier(
                'This video can\'t be played in ' + turnCodesIntoCountries( blockedRegions ) + '. Please consider skipping.'
            );
        }
    }

    function turnCodesIntoCountries( regionCodes ) {
        let countriesString = '';

        for ( let regionLoop = 0; regionLoop < regionCodes.length; regionLoop++ ) {
            countriesString += countryLookup.byIso( regionCodes[ regionLoop ] ).country + ', ';
        }

        countriesString = countriesString.substring( 0, countriesString.length - 2 );
        const lastComma = countriesString.lastIndexOf( ',' );
        if ( lastComma !== -1 ) {
            countriesString = countriesString.substring( 0, lastComma ) + ' and' + countriesString.substring( lastComma + 1 )
        }

        return countriesString;
    }

    async function queryVideoDetails( auth, videoID ) {
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

    async function getRegionRestrictions( auth, videoID ) {
        const { regionRestriction } = await queryVideoDetails( auth, videoID );
        return regionRestriction;
    }

    return {
        listAlertRegions: function ( data, chatFunctions ) {
            const regionsAsArray = Array.from( regionsWeCareAbout );
            logMe( 'info', 'listAlertRegions, regionsAsArray:' + regionsAsArray );
            let regionReport = `The list of regions that will triger a blocked alert is currently ` + turnCodesIntoCountries( regionsAsArray );

            chatFunctions.botSpeak( data, regionReport );
        },

        addAlertRegion: function ( data, [ region ], chatFunctions ) {
            let message;
            if ( countryLookup.byIso( region ) !== null ) {
                if ( regionsWeCareAbout.has( region ) ) {
                    message = countryLookup.byIso( region ).country + ' is already in the region alerts list';
                } else {
                    regionsWeCareAbout.add( region );
                    message = countryLookup.byIso( region ).country + ' has been added to the region alerts list';
                }
                chatFunctions.botSpeak( data, message );
            } else {
                chatFunctions.botSpeak( data, 'That region is not recognised. Please use one of the 2 character ISO country codes, https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2' );
            }
        },

        removeAlertRegion: function ( data, [ region ], chatFunctions ) {
            let message;
            if ( regionsWeCareAbout.delete( region ) ) {
                message = countryLookup.byIso( region ).country + ' has been removed from the region alerts list';
            } else {
                message = countryLookup.byIso( region ).country + ' is not in the region alerts list';
            }
            chatFunctions.botSpeak( data, message );
        },

        checkVideoRegionAlert: function ( data, videoID, userFunctions, chatFunctions, botFunctions ) {
            if ( botFunctions.checkVideoRegions() ) {
                authorize( CLIENT_SECRET_PATH, TOKEN_PATH, SCOPES )
                    .then( ( oauthClient ) => getRegionRestrictions( oauthClient, videoID ) )
                    .then( ( restrictions ) => {
                        if ( restrictions !== undefined ) {
                            if ( restrictions.allowed !== undefined ) {
                                alertIfRegionsNotAllowed( restrictions, ( msg ) =>
                                    chatFunctions.botSpeak( data, msg )
                                );
                            } else if ( restrictions.blocked !== undefined ) {
                                alertIfRegionsBlocked( restrictions, ( msg ) =>
                                    chatFunctions.botSpeak( data, msg )
                                );
                            }
                        }
                    } );
            }
        },

        // this is pretty horrible, but nothing in here is easy to test
        test_alertIfRegionsNotAllowed: alertIfRegionsNotAllowed,
        test_alertIfRegionsBlocked: alertIfRegionsBlocked,
    };
};

module.exports = videoFunctions;
