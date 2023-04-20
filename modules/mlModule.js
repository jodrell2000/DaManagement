const axios = require( 'axios' );
require( 'dotenv' ).config();
const { Configuration, OpenAIApi } = require( "openai" );
const configuration = new Configuration( {
    apiKey: process.env.OPENAI_API_KEY,
} );
const openai = new OpenAIApi( configuration );


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
                data: JSON.stringify( {
                    theQuestion,
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
    }
}

module.exports = mlFunctions;

// 440 characters, max chat length for ttfm
// 0123456789abcdefghijklmonpqrstuvwxyz0123456789abcdefghijklmonpqrstuvwxyz0123456789abcdefghijklmonpqrstuvwxyz0123456789abcdefghijklmonpqrstuvwxyz0123456789abcdefghijklmonpqrstuvwxyz0123456789abcdefghijklmonpqrstuvwxyz0123456789abcdefghijklmonpqrstuvwxyz0123456789abcdefghijklmonpqrstuvwxyz0123456789abcdefghijklmonpqrstuvwxyz0123456789abcdefghijklmonpqrstuvwxyz0123456789abcdefghijklmonpqrstuvwxyz0123456789abcdefghijklmonpqrstuvwxyz01234567