const axios = require( 'axios' );
require( 'dotenv' ).config();
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

            const url = `${ baseURL }?q=${ query }&type=${ queryType }`;

            try {
                // Obtain an access token using the client ID and client secret
                const authResponse = await axios.post( authURL, {
                    grant_type: 'client_credentials',
                    client_id: SPOTIFY_CLIENT_ID,
                    client_secret: SPOTIFY_CLIENT_SECRET,
                } );

                const accessToken = authResponse.data.access_token;

                // Make a GET request to the Spotify API's search endpoint, passing in the access token as a header
                const response = await axios.get( url, {
                    headers: {
                        Authorization: `Bearer ${ accessToken }`,
                    },
                } );

                return response.data;
            } catch ( error ) {
                console.error( error );
            }
        },

    }
}

module.exports = mlFunctions;

// 440 characters, max chat length for ttfm
// 0123456789abcdefghijklmonpqrstuvwxyz0123456789abcdefghijklmonpqrstuvwxyz0123456789abcdefghijklmonpqrstuvwxyz0123456789abcdefghijklmonpqrstuvwxyz0123456789abcdefghijklmonpqrstuvwxyz0123456789abcdefghijklmonpqrstuvwxyz0123456789abcdefghijklmonpqrstuvwxyz0123456789abcdefghijklmonpqrstuvwxyz0123456789abcdefghijklmonpqrstuvwxyz0123456789abcdefghijklmonpqrstuvwxyz0123456789abcdefghijklmonpqrstuvwxyz0123456789abcdefghijklmonpqrstuvwxyz01234567