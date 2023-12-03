// load the googleAPI
let { google } = require( "googleapis" );
let authorize = require( "./oauth2lib" );
const request = require( 'request' );


let { setIntersection, setDifference } = require( "../modules/setlib" );

let SCOPES = [ "https://www.googleapis.com/auth/youtube.readonly" ];
let CLIENT_SECRET_PATH = "client_secret.json";
let TOKEN_DIR = ( process.env.HOME || process.env.HOMEPATH ) + "/.credentials/";
let TOKEN_PATH = TOKEN_DIR + "theManagementCredentials.json";

const countryLookup = require( 'country-code-lookup' );

let musicDefaults = require( "../defaultSettings/musicDefaults.js" );
let regionsWeCareAbout = new Set( musicDefaults.alertRegions );

const videoFunctions = () => {
    function alertIfRegionsNotAllowed ( restrictions, userFunctions, notifier ) {
        let missingRegions = setDifference(
            regionsWeCareAbout,
            restrictions.allowed
        );
        if ( missingRegions.length ) {
            notifier(
                'Sorry @' + userFunctions.getUsername( userFunctions.getCurrentDJID() ) + ', this video can\'t be played in ' + turnCodesIntoCountries( missingRegions ) + '. Please consider skipping.'
            );
        }
    }

    function alertIfRegionsBlocked ( restrictions, userFunctions, notifier ) {
        let blockedRegions = setIntersection(
            regionsWeCareAbout,
            restrictions.blocked
        );
        if ( blockedRegions.length ) {
            notifier(
                'Sorry @' + userFunctions.getUsername( userFunctions.getCurrentDJID() ) + ', this video can\'t be played in ' + turnCodesIntoCountries( blockedRegions ) + '. Please consider skipping.'
            );
        }
    }

    function turnCodesIntoCountries ( regionCodes ) {
        let countriesString = '';

        for ( let regionLoop = 0; regionLoop < regionCodes.length; regionLoop++ ) {
            countriesString += countryLookup.byIso( regionCodes[ regionLoop ] ).country + ', ';
        }

        countriesString = countriesString.substring( 0, countriesString.length - 2 );
        const lastComma = countriesString.lastIndexOf( ',' );
        if ( lastComma !== -1 ) {
            countriesString = countriesString.substring( 0, lastComma ) + ' and' + countriesString.substring( lastComma + 1 )
        }

        if ( countriesString.length === 0 ) {
            return "empty";
        } else {
            return countriesString;
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
                // console.log( JSON.stringify( data ) );
                return data.items[ 0 ].contentDetails;
            } )
            .catch( err => console.error( `Error occurred in videoFunctions.queryVideoDetails() : ${ err }` ) );
    }

    async function getRegionRestrictions ( auth, videoID ) {
        const { regionRestriction } = await queryVideoDetails( auth, videoID );
        return regionRestriction;
    }

    return {
        listAlertRegions: function ( data, chatFunctions ) {
            const regionsAsArray = Array.from( regionsWeCareAbout );
            let regionReport = `The list of regions that will trigger a blocked alert is currently ` + turnCodesIntoCountries( regionsAsArray );

            chatFunctions.botSpeak( regionReport, data );
        },

        checkVideoStatus: function ( videoIDs ) {
            return new Promise( ( resolve, reject ) => {
                let youtubeURL = `https://www.googleapis.com/youtube/v3/videos?id=${ videoIDs }&part=status&key=${ process.env.YOUTUBE_API_KEY }`
                request( youtubeURL, { json: true }, ( error, res, body ) => {

                    if ( error ) {
                        reject( `Something went wrong. Try again later.` );
                    }

                    if ( !body.hasOwnProperty( 'items' ) ) {
                        reject( `No data returned` );
                    }

                    if ( !Array.isArray( body.items ) || !body.items.length ) {
                        reject( `No data returned` );
                    }

                    resolve( body.items );
                } );
            } );
        },

        addAlertRegion: function ( data, region, chatFunctions, announce = true ) {
            let message;
            let theRegion = region.toUpperCase();

            if ( countryLookup.byIso( theRegion ) !== null ) {
                if ( regionsWeCareAbout.has( theRegion ) ) {
                    message = countryLookup.byIso( theRegion ).country + ' is already in the region alerts list';
                } else {
                    regionsWeCareAbout.add( theRegion );
                    message = countryLookup.byIso( theRegion ).country + ' has been added to the region alerts list';
                }
                if ( announce === true ) {
                    chatFunctions.botSpeak( message, data );
                }
            } else {
                if ( announce === true ) {
                    chatFunctions.botSpeak( 'That region is not recognised. Please use one of the 2 character ISO country codes, https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2', data );
                }
            }
        },

        removeAlertRegion: function ( data, region, chatFunctions, announce = true ) {
            let message;
            let theRegion = region.toUpperCase();

            if ( regionsWeCareAbout.delete( theRegion ) ) {
                message = countryLookup.byIso( theRegion ).country + ' has been removed from the region alerts list';
            } else {
                message = countryLookup.byIso( theRegion ).country + ' is not in the region alerts list';
            }
            if ( announce === true ) {
                chatFunctions.botSpeak( message, data );
            }
        },

        resetAlertRegions: function () {
            regionsWeCareAbout = new Set( musicDefaults.alertRegions );
        },

        // checkVideoRegionAlert: function ( data, videoID, userFunctions, chatFunctions, botFunctions ) {
        //     if ( botFunctions.checkVideoRegions() ) {
        //         authorize( CLIENT_SECRET_PATH, TOKEN_PATH, SCOPES )
        //             .then( ( oauthClient ) => getRegionRestrictions( oauthClient, videoID ) )
        //             .then( ( restrictions ) => {
        //                 if ( !restrictions ) {
        //                     return;
        //                 }

        //                 if ( restrictions.hasOwnProperty( `allowed` ) ) {
        //                     if ( restrictions.allowed ) {
        //                         alertIfRegionsNotAllowed( restrictions, userFunctions, ( msg ) =>
        //                             chatFunctions.botSpeak( msg, data )
        //                         );
        //                     }
        //                     return;
        //                 }

        //                 if ( restrictions.hasOwnProperty( `blocked` ) ) {
        //                     if ( restrictions.blocked ) {
        //                         alertIfRegionsBlocked( restrictions, userFunctions, ( msg ) =>
        //                             chatFunctions.botSpeak( msg, data )
        //                         );
        //                     }
        //                 }

        //             } )
        //             .catch( err => console.error( `Error occurred in videoFunctions.checkVideoRegionAlert() : ${ err }` ) );
        //     }
        // },



        checkVideoRegionAlert: function ( data, videoID, userFunctions, chatFunctions, botFunctions ) {
            console.group( "checkVideoRegionAlert" );
            if ( botFunctions.checkVideoRegions() ) {
                const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${ videoID }&key=${ process.env.YOUTUBE_API_KEY }`;

                request( apiUrl, { json: true }, ( error, response, body ) => {
                    if ( error ) {
                        console.error( `Error occurred in videoFunctions.checkVideoRegionAlert() : ${ error }` );
                        return;
                    }

                    const regionCode = body.items[ 0 ]?.contentDetails?.regionRestriction?.blocked[ 0 ];
                    console.log( "regionCode:" + JSON.stringify( regionCode ) );

                    if ( regionCode ) {
                        alertIfRegionsBlocked( { blocked: true, blockedRegions: [ regionCode ] }, userFunctions, ( msg ) =>
                            chatFunctions.botSpeak( msg, data )
                        );
                    } else {
                        alertIfRegionsNotAllowed( { allowed: true }, userFunctions, ( msg ) =>
                            chatFunctions.botSpeak( msg, data )
                        );
                    }
                } );
            }
            console.groupEnd();
        },

        // this is pretty horrible, but nothing in here is easy to test
        test_alertIfRegionsNotAllowed: alertIfRegionsNotAllowed,
        test_alertIfRegionsBlocked: alertIfRegionsBlocked,
    };
};

module.exports = videoFunctions;
