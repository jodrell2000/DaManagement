const dotenv = require( 'dotenv' );
process.env.COMMANDIDENTIFIER = "/";
process.env.ALIASDATA = "aliases.json";
process.env.CHATDATA = "chat_example.json";

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

            expect( commandFunctions.wasThisACommand( data ) ).toBe( false );
        } );

        it( "Sending something that should be ignored", () => {
            const data = {
                text: "/me does a happy dance"
            }

            expect( commandFunctions.wasThisACommand( data ) ).toBe( false );
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

    describe( 'isChatCommand: is the text an existing dynamic chat commands', () => {
        it( "Sending a valid command", () => {
            const theCommand = "props";

            expect( commandFunctions.isChatCommand( theCommand ) ).toBe( true );
        } );

        it( "Sending a non existent command", () => {
            const theCommand = "testCommand";

            expect( commandFunctions.isChatCommand( theCommand ) ).toBe( false );
        } );

        it( "Sending undefined", () => {
            const theCommand = undefined;

            expect( commandFunctions.isChatCommand( theCommand ) ).toBe( false );
        } );
    } );

    describe( 'getCommandAndArguments: is the right thing/s being returned for the command sent?', () => {
        it( "Sending actual command", () => {
            const theCommand = process.env.COMMANDIDENTIFIER + "uptime";
            const botCommands = {};
            botCommands.uptime = ( { data, botFunctions, userFunctions, chatFunctions } ) => { botFunctions.reportUptime( data, userFunctions, chatFunctions ); }
            botCommands.uptime.help = "Tells you how long the bot has been running for";
            const allCommands = {
                ...botCommands
            }

            const expected = expect.arrayContaining( [
                expect.any( Function ),
                expect.any( Array ),
                false
            ] );

            expect( commandFunctions.getCommandAndArguments( theCommand, allCommands ) ).toEqual( expected );
        } );

        it( "Sending invalid command", () => {
            const checkForAlias = jest.spyOn( commandFunctions, "checkForAlias" );
            checkForAlias.mockImplementation( ( passedArguement ) => {
                checkForAliasReturn = undefined
            } );

            const theCommand = process.env.COMMANDIDENTIFIER + "wibhfkjhgkjhgble";
            const botCommands = {};
            botCommands.uptime = ( { data, botFunctions, userFunctions, chatFunctions } ) => { botFunctions.reportUptime( data, userFunctions, chatFunctions ); }
            botCommands.uptime.help = "Tells you how long the bot has been running for";
            const allCommands = {
                ...botCommands
            }

            const expected = expect.arrayContaining( [
                null,
                null
            ] );

            expect( commandFunctions.getCommandAndArguments( theCommand, allCommands ) ).toEqual( expected );
        } );

        it( "Sending alias of a command", () => {
            const checkForAlias = jest.spyOn( commandFunctions, "checkForAlias" );
            checkForAlias.mockImplementation( ( passedArguement ) => {
                checkForAliasReturn = undefined
            } );

            const theCommand = "wibble";
            const commandToSend = process.env.COMMANDIDENTIFIER + theCommand;
            const botCommands = {};
            botCommands.uptime = ( { data, botFunctions, userFunctions, chatFunctions } ) => { botFunctions.reportUptime( data, userFunctions, chatFunctions ); }
            botCommands.uptime.help = "Tells you how long the bot has been running for";
            const allCommands = {
                ...botCommands
            }

            const expected = expect.arrayContaining( [
                theCommand,
                "dynamicChat",
                null
            ] );

            expect( commandFunctions.getCommandAndArguments( commandToSend, allCommands ) ).toEqual( expected );
        } );
    } );

} );
