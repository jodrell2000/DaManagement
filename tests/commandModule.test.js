const dotenv = require('dotenv');
process.env.COMMANDIDENTIFIER = '/';

const commandModule = require( '../modules/commandModule.js' );
const chatDefaults = require( "../defaultSettings/chatDefaults" );

let commandFunctions;
let mockBot;

beforeAll( () => {
    mockBot = {
        // pm: jest.fn( ( message, recipient ) => {
        //     return { message: message, recipient: recipient }
        // } ),
        //
        // speak: jest.fn( ( message ) => {
        //     return { message: message }
        // } )
    };

    commandFunctions = commandModule( mockBot );
} );

beforeEach( () => {
    jest.clearAllMocks();
} );

describe( `Test command functions`, () => {
    describe( `wasThisACommand: was the message in the correct command format, and not on the ignore commands list`, () => {
        it( "Sending a valid command", () => {
            const data = {
                text: process.env.COMMANDIDENTIFIER + "testCommand wibble wibble"
            }

            expect( commandFunctions.wasThisACommand( data ) ).toBe( true );
        } );

        it( "Sending a plain text", () => {
            const data = {
                text: "lol, thanks"
            }

            expect( commandFunctions.wasThisACommand( data )).toBe( false );
        } );

        it( "Sending something that should be ignored", () => {
            const data = {
                text: "/me does a happy dance"
            }

            expect( commandFunctions.wasThisACommand( data )).toBe( false );
        } );
    } );

    describe( 'isCoreCommand: is the text one of the static core commands.', () => {
        it( "Sending a valid command", () => {
            const theCommand = "uptime";

            expect( commandFunctions.isCoreCommand( theCommand ) ).toBe( true );
        } );

        it( "Sending a non existent command", () => {
            const theCommand = "testCommand";

            expect( commandFunctions.isCoreCommand( theCommand ) ).toBe( false );
        } );

        it( "Sending undefined", () => {
            const theCommand = undefined;

            expect( commandFunctions.isCoreCommand( theCommand ) ).toBe( false );
        } );
    } );
} );
