let responseModule = require("../chatbot/responseModule.js");

let chatModule = require("../chatbot/chatModule.js");

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

        wasThisACommand: function (data) {
            let text = data.text;

            // check if this was a command
            if (text.match(/^\|/)) {
                return true;
            }
        },

        getCommandFromText: function (theText) {
            const firstSpace = theText.indexOf(" ");
            const commandWord = theText.substring( 1, firstSpace );

            return commandWord;
        },

        newParseCommands: function (data, userFunctions) {
            const speaker = data.name;
            console.log("Sent by :" + speaker);

            let sentCommand;
            sentCommand = this.getCommandFromText(data.text);

            const moderatorCommands = {};
            //moderatorCommands.riggedflip = () => { action: "riggedFlipResponse", helpText: "Ask the bot to flip a coin for you, always tails" }

            const availableCommands = {};
            availableCommands.hello = () => { responder.sayHello(data.name); }
            //availableCommands.coinflip = () => { action: "coinFlipResponse", helpText: "Ask the bot to flip a coin for you" }

            let command;
            //const isMod = userFunctions.isUserModerator(speaker) === true;

            if ((command = availableCommands[sentCommand])) {
                command();
            //} else if ((command = moderatorCommands[sentCommand]) && isMod) {
            //    command();
            } else {
                bot.speak("No idea what you're talking about");
            }
        },

        parseCommand: function (data) {
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
