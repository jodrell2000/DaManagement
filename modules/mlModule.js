const mlFunctions = () => {

    return {

        async askBard ( sentQuestion ) {
            const theQuestion = "In no more than 440 characters " + sentQuestion;
            const request = {
                method: "POST",
                url: "https://bard.ai/v1/query",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify( {
                    theQuestion,
                } ),
            };

            try {
                const response = await fetch( request );

                if ( !response.ok ) {
                    throw new Error( `Request failed with status code ${ response.status }` );
                }

                const body = await response.json();

                return body.result;
            } catch ( error ) {
                console.error( error );
                throw new Error( "Failed to get response from Bard AI" );
            }
        },

    }
}

module.exports = mlFunctions;


// 440 characters, max chat length for ttfm
// 0123456789abcdefghijklmonpqrstuvwxyz0123456789abcdefghijklmonpqrstuvwxyz0123456789abcdefghijklmonpqrstuvwxyz0123456789abcdefghijklmonpqrstuvwxyz0123456789abcdefghijklmonpqrstuvwxyz0123456789abcdefghijklmonpqrstuvwxyz0123456789abcdefghijklmonpqrstuvwxyz0123456789abcdefghijklmonpqrstuvwxyz0123456789abcdefghijklmonpqrstuvwxyz0123456789abcdefghijklmonpqrstuvwxyz0123456789abcdefghijklmonpqrstuvwxyz0123456789abcdefghijklmonpqrstuvwxyz01234567