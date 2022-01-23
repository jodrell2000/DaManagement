const chatModule = require( './chatModule' );

describe(`Test chat module`, () => {
    it(`botChat`, () => {
        const mockBot = {
            speak: jest.fn()
        };

        const chatFunctions = chatModule(mockBot);

        const speak = jest.spyOn(mockBot, "speak");

        chatFunctions.botChat(`Jest was here`);

        expect(speak).toHaveBeenCalled();
    });
});