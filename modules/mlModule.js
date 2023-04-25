const axios = require( 'axios' );
require( 'dotenv' ).config();
const request = require( 'request' ); // "Request" library
const { Configuration, OpenAIApi } = require( "openai" );
const configuration = new Configuration( {
    apiKey: process.env.OPENAI_API_KEY,
} );
const openai = new OpenAIApi( configuration );

const discogsConsumerKey = process.env.DISCOGS_CONSUMER_KEY;
const discogsConsumerSecret = process.env.DISCOGS_CONSUMER_SECRET;

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

const mlFunctions = () => {

    return {

        async askChatGPT ( sentQuestion ) {
            const theQuestion = "Answer in no more than 440 characters: " + sentQuestion;
            const messages = [
                { role: 'user', content: theQuestion }
            ];

            try {
                const completion = await openai.createChatCompletion( {
                    model: 'gpt-3.5-turbo',
                    messages
                } );
                console.log( completion.data );
                console.log( completion.data.choices[ 0 ].message );

            } catch ( error ) {
                if ( error.response ) {
                    console.error( error.response.status, error.response.data );
                } else {
                    console.error( `Error with OpenAI API request: ${ error.message }` );
                }
            }
        },

        async askBard ( sentQuestion ) {
            console.group( "askBard" );
            const theQuestion = "Answer in no more than 440 characters: " + sentQuestion;
            console.log( "theQuestion: " + theQuestion );
            console.log( "stringify theQuestion: " + JSON.stringify( theQuestion ) );
            const request = {
                method: "POST",
                url: "https://bard.ai/v1/query",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify( {
                    question: theQuestion,
                } ),
            };

            console.log( "request:" + JSON.stringify( request ) )

            try {
                const response = await Promise.race( [
                    axios( request ),
                    new Promise( ( resolve, reject ) => setTimeout( () => reject( new Error( "Timeout" ) ), 10000 ) )
                ] );
                // console.log( "response: " + JSON.stringify( response ) );

                if ( !response.data ) {
                    throw new Error( `Empty response` );
                }

                console.groupEnd();
                return response.data.result;
            } catch ( error ) {
                console.error( "==" + error + "==" );
                console.groupEnd();
                if ( error.message === "Timeout" ) {
                    return "Sorry, Bard didn't return a response in time";
                }

                throw new Error( "Failed to get response from Bard AI" );
            }
        },

        async searchDiscogs ( songName, artistName ) {
            try {
                const response = await axios.get( 'https://api.discogs.com/database/search', {
                    params: {
                        artist: `${ artistName }`,
                        release_title: `${ songName }`,
                        key: discogsConsumerKey,
                        secret: discogsConsumerSecret
                    }
                } );

                if ( response.data.results.length === 0 ) {
                    throw new Error( 'No response found.' );
                }

                const thumbnail = response.data.results[ 0 ].thumb;
                const releaseCountry = response.data.results[ 0 ].country;


                const releaseId = response.data.results[ 0 ].id;

                const release = await axios.get( `https://api.discogs.com/masters/${ releaseId }`, {
                    params: {
                        key: discogsConsumerKey,
                        secret: discogsConsumerSecret
                    }
                } );

                if ( release === undefined ) {
                    throw new Error( 'No release found.' );
                }

                return {
                    thumbnail,
                    releaseCountry,
                    releaseYear: release.data.year,
                    discogsUrl: release.data.uri,
                    tracklist: release.data.tracklist
                };

            } catch ( error ) {
                console.error( error );
                throw new Error( 'Failed to get information from Discogs API.' );
            }
        },

        async searchSpotify ( songName, artistName ) {
            const baseURL = 'https://api.spotify.com/v1/search';
            const authURL = 'https://accounts.spotify.com/api/token';
            const query = encodeURIComponent( artistName + " " + songName );
            const queryType = "track"

            const url = `${ baseURL }?q=${ query }&type=${ queryType }&limit=1`;

            try {

                var authOptions = {
                    url: authURL,
                    headers: {
                        'Authorization': 'Basic ' + ( new Buffer.from( SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET ).toString( 'base64' ) )
                    },
                    form: {
                        grant_type: 'client_credentials'
                    },
                    json: true
                };

                request.post( authOptions, function ( error, response, body ) {
                    if ( !error && response.statusCode === 200 ) {

                        // use the access token to access the Spotify Web API
                        var token = body.access_token;
                        var options = {
                            url: url,
                            headers: {
                                'Authorization': 'Bearer ' + token
                            },
                            json: true
                        };
                        request.get( options, function ( error, response, body ) {
                            console.log( "body:" + body );
                            console.log( "items:" + JSON.stringify( body.tracks.items ) )
                        } );
                    }
                } );

                // return response.data;
            } catch ( error ) {
                console.error( error );
            }
        },

        async searchMusicBrainz ( songName, artistName ) {
            try {
                // https://musicbrainz.org/ws/2/recording/?query=artist:%22Huey%20Lewis%20And%20The%20News%22ANDrecording:%22Heart%20And%20Soul%22&limit=10&fmt=json
                // https://musicbrainz.org/ws/2/recording/?query=artist%3A%2522Huey%2520Lewis%2520And%2520The%2520News%2522ANDrecording%3A%2522Heart%2520And%2520Soul%2522&limit=10&fmt=json

                const query = "artist:" + encodeURIComponent( '"' + artistName + '"' ) + "ANDrecording:" + encodeURIComponent( '"' + songName + '"' );
                const queryToSend = `https://musicbrainz.org/ws/2/recording/?query=${ query }&limit=10&fmt=json`;
                console.log( "query:" + queryToSend );
                const response = await axios.get( queryToSend, {
                    headers: {
                        'User-Agent': 'Mr. Roboto/1.0.0 ( https://turntable.fm/i_the_80s )'
                    }
                } );

                if ( response.data.recordings.length > 0 ) {
                    const recording = response.data.recordings[ 0 ];
                    console.log( JSON.stringify( recording ) );
                    // console.log( `Title: ${ recording.title }` );
                    // console.log( `Artist: ${ recording[ 'artist-credit' ][ 0 ].artist.name }` );
                    // console.log( `Length: ${ recording.length }ms` );
                    // console.log( `MBID: ${ recording.id }` );
                    // console.log( `URL: https://musicbrainz.org/recording/${ recording.id }` );
                } else {
                    console.log( `No recording found for "${ query }"` );
                }
            } catch ( error ) {
                console.error( error );
            }
        }

    }
}

module.exports = mlFunctions;

// 440 characters, max chat length for ttfm
// 0123456789abcdefghijklmonpqrstuvwxyz0123456789abcdefghijklmonpqrstuvwxyz0123456789abcdefghijklmonpqrstuvwxyz0123456789abcdefghijklmonpqrstuvwxyz0123456789abcdefghijklmonpqrstuvwxyz0123456789abcdefghijklmonpqrstuvwxyz0123456789abcdefghijklmonpqrstuvwxyz0123456789abcdefghijklmonpqrstuvwxyz0123456789abcdefghijklmonpqrstuvwxyz0123456789abcdefghijklmonpqrstuvwxyz0123456789abcdefghijklmonpqrstuvwxyz0123456789abcdefghijklmonpqrstuvwxyz01234567