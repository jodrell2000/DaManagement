const axios = require( 'axios' );

const mlFunctions = () => {

    return {

        async askBard ( sentQuestion ) {
            console.group( "askBard" );
            const theQuestion = "In no more than 440 characters " + sentQuestion;
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

            try {
                const response = await axios( request );
                console.log( "response: " + JSON.stringify( response ) );

                if ( !response.data ) {
                    throw new Error( `Empty response` );
                }

                console.groupEnd();
                return response.data.result;
            } catch ( error ) {
                console.error( error );
                console.groupEnd();

                throw new Error( "Failed to get response from Bard AI" );
            }

        },

    }
}

module.exports = mlFunctions;

// 440 characters, max chat length for ttfm
// 0123456789abcdefghijklmonpqrstuvwxyz0123456789abcdefghijklmonpqrstuvwxyz0123456789abcdefghijklmonpqrstuvwxyz0123456789abcdefghijklmonpqrstuvwxyz0123456789abcdefghijklmonpqrstuvwxyz0123456789abcdefghijklmonpqrstuvwxyz0123456789abcdefghijklmonpqrstuvwxyz0123456789abcdefghijklmonpqrstuvwxyz0123456789abcdefghijklmonpqrstuvwxyz0123456789abcdefghijklmonpqrstuvwxyz0123456789abcdefghijklmonpqrstuvwxyz0123456789abcdefghijklmonpqrstuvwxyz01234567