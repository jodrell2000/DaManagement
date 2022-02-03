describe( 'environmental variables', () => {
    const OLD_ENV = process.env;

    beforeEach( () => {
        jest.resetModules() // Most important - it clears the cache
        process.env = { ...OLD_ENV }; // Make a copy
    } );

    afterAll( () => {
        process.env = OLD_ENV; // Restore old environment
    } );

    test( 'will receive process.env variables', () => {
        const testedModule = require( '../auth.js' );

        expect( process.env.AUTH.length ).toBe( 24 );
        expect( process.env.USERID.length ).toBe( 24 );
        expect( process.env.ROOMID.length ).toBe( 24 );
        expect( process.env.COMMANDIDENTIFIER.length ).toBe( 1 );
        expect( process.env.ALIASDATA.length ).toBeDefined();
        expect( process.env.CHATDATA.length ).toBeDefined();
    } );
} );