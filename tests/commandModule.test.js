const dotenv = require( 'dotenv' );
process.env.COMMANDIDENTIFIER = "/";
process.env.ALIASDATA = "aliases_example.json";
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
            const theCommand = "uptime";
            const commandToSend = process.env.COMMANDIDENTIFIER + theCommand;
            const botCommands = {};
            botCommands.uptime = ( { data, botFunctions, userFunctions, chatFunctions } ) => { botFunctions.reportUptime( data, userFunctions, chatFunctions ); }
            const allCommands = {
                ...botCommands
            }

            const expected = expect.arrayContaining( [
                expect.any( Function ),
                expect.any( Array ),
                false
            ] );

            expect( commandFunctions.getCommandAndArguments( commandToSend, allCommands ) ).toEqual( expected );
        } );

        it( "Sending a dynamic chat command", () => {
            jest.mock( '../modules/commandModule.js', () => {
                const originalModule = jest.requireActual( '../modules/commandModule.js' );
                return {
                    __esModule: true,
                    ...originalModule,
                    isChatCommand: jest.fn( () => 'bow' ),
                };
            } );

            const theCommand = "bow";
            const commandToSend = process.env.COMMANDIDENTIFIER + theCommand;
            const botCommands = {};
            botCommands.uptime = ( { data, botFunctions, userFunctions, chatFunctions } ) => { botFunctions.reportUptime( data, userFunctions, chatFunctions ); }
            const allCommands = {
                ...botCommands
            }

            const expected = expect.arrayContaining( [
                "bow",
                "dynamicChat",
                null
            ] );

            expect( commandFunctions.getCommandAndArguments( commandToSend, allCommands ) ).toEqual( expected );
        } );

        it( "Sending neither static command, dynamic chat command nor alias", () => {
            jest.mock( '../modules/commandModule.js', () => {
                const originalModule = jest.requireActual( '../modules/commandModule.js' );
                return {
                    __esModule: true,
                    ...originalModule,
                    checkForAlias: jest.fn( () => 'dice' ),
                };
            } );

            const theCommand = "wibhfkjhgkjhgble";
            const commandToSend = process.env.COMMANDIDENTIFIER + theCommand;
            const botCommands = {};
            botCommands.uptime = ( { data, botFunctions, userFunctions, chatFunctions } ) => { botFunctions.reportUptime( data, userFunctions, chatFunctions ); }
            const allCommands = {
                ...botCommands
            }

            const expected = expect.arrayContaining( [
                null,
                null
            ] );

            expect( commandFunctions.getCommandAndArguments( commandToSend, allCommands ) ).toEqual( expected );
        } );

        it( "Sending alias of a command", () => {
            jest.mock( '../modules/commandModule.js', () => {
                const originalModule = jest.requireActual( '../modules/commandModule.js' );
                return {
                    __esModule: true,
                    ...originalModule,
                    checkForAlias: jest.fn( () => 'dice' ),
                };
            } );

            const theCommand = "yahtzee";
            const commandToSend = process.env.COMMANDIDENTIFIER + theCommand;

            const botCommands = {};
            botCommands.uptime = ( { data, botFunctions, userFunctions, chatFunctions } ) => { botFunctions.reportUptime( data, userFunctions, chatFunctions ); }

            const chatCommands = {};
            chatCommands.dice = ( { data, args, userFunctions, chatFunctions } ) => { chatFunctions.dice( data, args, userFunctions ); }

            const allCommands = {
                ...botCommands,
                ...chatCommands
            }

            const expected = expect.arrayContaining( [
                expect.any( Function ),
                expect.any( Array ),
                false
            ] );

            expect( commandFunctions.getCommandAndArguments( commandToSend, allCommands ) ).toEqual( expected );
        } );

        it( "Sending alias of a dynamic command", () => {
            jest.mock( '../modules/commandModule.js', () => {
                const originalModule = jest.requireActual( '../modules/commandModule.js' );
                return {
                    __esModule: true,
                    ...originalModule,
                    checkForAlias: jest.fn( () => 'dice' ),
                };
            } );

            const theCommand = "bows";
            const commandToSend = process.env.COMMANDIDENTIFIER + theCommand;

            const botCommands = {};
            botCommands.uptime = ( { data, botFunctions, userFunctions, chatFunctions } ) => { botFunctions.reportUptime( data, userFunctions, chatFunctions ); }

            const allCommands = {
                ...botCommands
            }

            const expected = expect.arrayContaining( [
                "bow",
                "dynamicChat",
                null
            ] );

            expect( commandFunctions.getCommandAndArguments( commandToSend, allCommands ) ).toEqual( expected );
        } );
    } );

} );
