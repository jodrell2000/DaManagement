const chatModule = require( './chatModule' );

let chatFunctions;
let mockBot;

beforeAll( () => {
    mockBot = {
        pm: jest.fn( (message, recipient) => {
            return { message: message, recipient: recipient } 
        }),

        speak: jest.fn( (message) => {
            return {message: message }
        })
    };

    chatFunctions = chatModule(mockBot);
});

beforeEach( () => {
    jest.clearAllMocks();
});

describe(`Test chat function`, () => {
    describe(`botSpeak`, () => {
        it(`public message - call botChat`, () => {
            const botChat = jest.spyOn(chatFunctions, "botChat");

            let data = {
                command: `pmmed`,
                senderid: `abc123`
            }

            let publicChat = true;
            let recipient;

            chatFunctions.botSpeak(`Jest Rules`, data, publicChat, recipient);

            expect(botChat).toHaveBeenCalled();
        });

        it(`command chat - call botChat`, () => {
            const botChat = jest.spyOn(chatFunctions, "botChat");
            const speak = jest.spyOn(mockBot, "speak");

            let data = {
                command: `chat`,
                senderid: `abc123`
            }

            let publicChat;
            let recipient = `Bill Gates`;

            chatFunctions.botSpeak(`Jest Rules`, data, publicChat, recipient);

            expect(speak.mock.results[0].value).toEqual({
                message: `Jest Rules`
            });

            expect(botChat).toHaveBeenCalled();
        });
        

        it(`public message - call botpm`, () => {
            const botPM = jest.spyOn(chatFunctions, "botPM");
            const pm = jest.spyOn(mockBot, "pm");

            let data = {
                command: `pmmed`,
                senderid: `abc123`
            }

            let publicChat;
            let recipient;

            chatFunctions.botSpeak(`Jest Rules`, data, publicChat, recipient);

            expect(botPM).toHaveBeenCalled();

            expect(pm.mock.results[0].value).toEqual({
                message: `Jest Rules`,
                recipient: `abc123`
            });
        });
    });

    it(`botChat`, () => {
        const speak = jest.spyOn(mockBot, "speak");

        chatFunctions.botChat(`Jest was here`);

        expect(speak).toHaveBeenCalled();
    });

    it(`botPM`, () => {
        const pm = jest.spyOn(mockBot, "pm");

        chatFunctions.botPM(`Jest was here`, `abc123`);

        expect(pm).toHaveBeenCalled();
    });

    describe(`buildUserToUserRandomMessage`, () => {
        let theMessage = `@receiverUsername, this is a test from @senderUsername`

        it(`With senderUsername and receiverUsername`, () => {
            const userFunctions = {
                getUsername: (userID) => userID
            }

            let returnMessage = chatFunctions.buildUserToUserRandomMessage(userFunctions, `sender`, theMessage, `receiver`);

            expect(returnMessage).toBe(`@receiver, this is a test from @sender`);
        });

        it(`With senderUsername and no receiverUsername`, () => {
            const userFunctions = {
                getUsername: (userID) => userID
            }

            let returnMessage = chatFunctions.buildUserToUserRandomMessage(userFunctions, `sender`, theMessage);

            expect(returnMessage).toBe(`@receiverUsername, this is a test from @sender`);
        });

        it(`With no senderUsername and receiverUsername`, () => {
            const userFunctions = {
                getUsername: (userID) => userID
            }

            let returnMessage = chatFunctions.buildUserToUserRandomMessage(userFunctions, undefined, theMessage, `receiver`);

            expect(returnMessage).toBe(`@receiver, this is a test from @senderUsername`);
        });

        it(`With no senderUsername and no receiverUsername`, () => {
            const userFunctions = {
                getUsername: (userID) => userID
            }

            let returnMessage = chatFunctions.buildUserToUserRandomMessage(userFunctions, undefined, theMessage, undefined);

            expect(returnMessage).toBe(`@receiverUsername, this is a test from @senderUsername`);
        });
    });

    describe(`textMessageTheDJ`, () => {
        it(`With receiverID`, () => {
            let botSpeakReturn = ``;

            const botSpeak = jest.spyOn(chatFunctions, "botSpeak");
            botSpeak.mockImplementation( (message) => {
                botSpeakReturn = message
            });
            
            const buildUserToUserRandomMessage = jest.spyOn(chatFunctions, "buildUserToUserRandomMessage");
            buildUserToUserRandomMessage.mockImplementation( (userFunctions, senderID, randomMessage, receiverID) => {
                return `@${receiverID}, This is a test message`;
            });

            const messageVariable = [`Message 1`];    

            const userFunctions = {
                getCurrentDJID: () => `DJ`,
                whoSentTheCommand: () => `Sender`
            }

            chatFunctions.textMessageTheDJ(null, messageVariable, userFunctions);

            expect(botSpeak).toHaveBeenCalled();
            expect(botSpeakReturn).toBe(`@DJ, This is a test message`);

            botSpeak.mockRestore();
            buildUserToUserRandomMessage.mockRestore();
        });

        it(`Without receiverID`, () => {
            let botSpeakReturn = ``;

            const botSpeak = jest.spyOn(chatFunctions, "botSpeak");
            botSpeak.mockImplementation( (message) => {
                botSpeakReturn = message
            });

            const userFunctions = {
                getCurrentDJID: () => null,
                whoSentTheCommand: () => `Sender`,
                getUsername: (sender) => sender
            }

            chatFunctions.textMessageTheDJ(null, null, userFunctions);

            expect(botSpeak).toHaveBeenCalled();
            expect(botSpeakReturn).toBe(`@Sender you can't send that message if there's no DJ?!?`);

            botSpeak.mockRestore();
        });
    });

    describe(`pictureMessageTheDJ`, () => {
        it(`With receiverID`, () => {
            let botSpeakReturn = ``;

            const botSpeak = jest.spyOn(chatFunctions, "botSpeak");
            botSpeak.mockImplementation( (message) => {
                botSpeakReturn += message
            });
            
            const buildUserToUserRandomMessage = jest.spyOn(chatFunctions, "buildUserToUserRandomMessage");
            buildUserToUserRandomMessage.mockImplementation( (userFunctions, senderID, randomMessage, receiverID) => {
                return `@${receiverID}, This is a test message`;
            });

            const messageVariable = [`Message 1`];
            const pictureVariable = [` Picture 1`];

            const userFunctions = {
                getCurrentDJID: () => `DJ`,
                whoSentTheCommand: () => `Sender`
            }

            chatFunctions.pictureMessageTheDJ(null, messageVariable, pictureVariable, userFunctions);

            expect(botSpeak).toHaveBeenCalled();
            expect(botSpeakReturn).toBe(`@DJ, This is a test message Picture 1`);

            botSpeak.mockRestore();
            buildUserToUserRandomMessage.mockRestore();
        });

        it(`Without receiverID`, () => {
            let botSpeakReturn = ``;

            const botSpeak = jest.spyOn(chatFunctions, "botSpeak");
            botSpeak.mockImplementation( (message) => {
                botSpeakReturn = message
            });
        

            const userFunctions = {
                getCurrentDJID: () => null,
                whoSentTheCommand: () => `Sender`,
                getUsername: (sender) => sender
            }

            chatFunctions.pictureMessageTheDJ(null, null, null, userFunctions);

            expect(botSpeak).toHaveBeenCalled();
            expect(botSpeakReturn).toBe(`@Sender you can't send that message if there's no DJ?!?`);

            botSpeak.mockRestore();
        });
    });
});