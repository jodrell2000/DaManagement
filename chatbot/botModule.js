let responseModule = require("../chatbot/responseModule.js");

let chatModule = require("../chatbot/chatModule.js");

const availableCommands = {};

const botModule = (bot) => {
    const responder = chatModule(bot);

    availableCommands.hello = (data) => {
        responder.sayHello(data.name);
    }
    availableCommands.hello.help = "'/hello': Reply to the sender with a Hello! Likely used to test if the Bot is working";

    availableCommands.list = () => {
        responder.saySomething("Available commands are: " + listCommands());
    }
    availableCommands.list.help = "'/list': Lists all available commands";

    availableCommands.help = () => {
        displayHelp(command);
    }
    availableCommands.help.arguments = (1);
    availableCommands.help.help = "/help [command] Display how to use an individual command";

    function displayHelp(command) {
        responder.saySomething(availableCommands[command].help);
    }

    function listCommands() {
        console.log("Listing all available commands");
        console.log("Commands:" + Object.keys(availableCommands));
        return Object.keys(availableCommands);
    }

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

        getArguments: function (theText) {
            let startIndex = theText.indexOf(" ");
            let remainingText = theText.substring(startIndex, theText.length);

            if (startIndex !== remainingText.indexOf(" ")) {
                console.log("Should have found a space for an argument here");
                return theCommand;
            }
            for (let argumentLoop = 0; argumentLoop < availableCommands[theCommand].arguments; argumentLoop++) {
                theCommand.argument[argumentLoop] = remainingText.substring(startIndex, remainingText.length);
                remainingText = remainingText.substring(startIndex, remainingText.length);
            }
        },

        getCommandFromText: function (theText) {
            let theCommand;
            const firstSpace = theText.indexOf(" ");
            if (firstSpace !== -1) {
                theCommand = theText.substring(1, firstSpace);
            } else {
                theCommand = theText.substring(1, theText.length);
            }

            return theCommand;
        },

        newParseCommands: function (data, userFunctions) {
            const speaker = data.name;
            console.log("Sent by :" + speaker);

            let sentCommand;
            sentCommand = this.getCommandFromText(data.text);

            const moderatorCommands = {};
            //moderatorCommands.riggedflip = () => { action: "riggedFlipResponse", helpText: "Ask the bot to flip a coin for you, always tails" }

            let theCommand;
            //const isMod = userFunctions.isUserModerator(speaker) === true;

            console.log("sentCommand: " + sentCommand);

            if ((theCommand = availableCommands[sentCommand])) {
                if (availableCommands[theCommand].hasOwnProperty('arguments')) {
                    this.getArguments(sentCommand)
                } else {
                    theCommand(data);
                }
                //} else if ((command = moderatorCommands[sentCommand]) && isMod) {
                //    command();
            } else {
                bot.speak("No idea what you're talking about");
            }
        },

        parseCommand: function (data) {
            let theCommand = data.text;
            console.log("parseCommand, theCommand:" + theCommand + "-----");

            for (let commandLoop = 0; commandLoop < availableCommands.length; commandLoop++) {
                console.log("In the commandLoop:" + commandLoop + "-----");
                if (availableCommands[commandLoop]["command"] === theCommand) {
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
