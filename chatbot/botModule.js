let responseModule = require("../chatbot/responseModule.js");

let chatModule = require("../chatbot/chatModule.js");

let availableCommands = [
    { command: "hello", action: "helloResponse", helpText: "Ask the bot to say hello to you" },
    { command: "coinflip", action: "coinFlipResponse", helpText: "Ask the bot to flip a coin for you" },
]

const botModule = (bot) => {
    const responder = chatModule(bot);

    return {
        tikTok: () => {
            switch (responseModule.responseCount % 2) {
                case 0:
                    responder.saySomething("tik");
                    break;
                default:
                    responder.saySomething("tok");
            }
        },

        wasThisACommand: (data) => {
            let text = data.text;

            // check if this was a command
            if (text.match(/^\//)) {
                return true;
            }
        },

        parseCommand: (data) => {
            let theCommand = data.text;
            console.log("parseCommand, theCommand:" + theCommand + "-----" );

            for (let commandLoop = 0; commandLoop < availableCommands.length; commandLoop++ ) {
                console.log("In the commandLoop:" + commandLoop + "-----" );
                if ( availableCommands[commandLoop]["command"] === theCommand ) {
                    responder[availableCommands[commandLoop]["action"]](data);
                }
            }
            // switch (data.text) {
            //     case "/hello":
            //         responder.saySomething(responder.buildMessage(data.name));
            // }
        },
    };
};

module.exports = botModule;
