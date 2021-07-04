let responseModule = require("../chatbot/responseModule.js");

let chatModule = require("../chatbot/chatModule.js");

const availableCommands = {};

const botModule = (bot) => {
    const responder = chatModule(bot);

    availableCommands.hello = (data) => {
        console.log("++++++++++++++++++++++++++++++++++++++++++++++");
        console.log("data:" + data);
        console.log("++++++++++++++++++++++++++++++++++++++++++++++");
        responder.sayHello(data.name);
    }
    availableCommands.hello.help = "'/hello': Reply to the sender with a Hello! Likely used to test if the Bot is working";

    availableCommands.list = () => {
        responder.saySomething("Available commands are: " + listCommands());
    }
    availableCommands.list.help = "'/list': Lists all available commands";

    availableCommands.help = (data, command) => {
        displayHelp(command);
    }
    availableCommands.help.argumentCount = 1;
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

        getCommandAndArguments: function(text, availableCommands) {
            console.log("Text:" + text);
            const [sentCommand, ...args] = text.split(" ");
            let theCommand = sentCommand.substring(1, sentCommand.length)
            console.log("Command:" + theCommand);
            console.log("Args:" + args);
            const commandObj = availableCommands[theCommand];
            if (commandObj) {
                return [commandObj, args];
            } else {
                return [null, null];
            }
        },

        newParseCommands: function(data, userFunctions) {
            const [command, args] = this.getCommandAndArguments(data.text, availableCommands);
            console.log("Command:" + command);
            console.log("Args:" + args);
            if (command) {
                console.log("++++++++++++++++++++++++++++++++++++++++++++++");
                console.log("data:" + data);
                console.log("++++++++++++++++++++++++++++++++++++++++++++++");
                command.call(null, data, args);
            } else {
                bot.speak("Nope, no idea");
            }
        },

        // getCommandAndArguments: function(text, availableCommands) {
        //     const [command, ...args] = text.split(" ");
        //     const commandObj = availableCommands[command];
        //     if (commandObj) {
        //         return [commandObj, args];
        //     } else {
        //         return null;
        //     }
        // },
        //
        // newParseCommands: function (data, userFunctions) {
        //     const [theCommand, args] = this.getCommandAndArguments(data.text, availableCommands);
        //
        //     if (theCommand) {
        //         theCommand.apply(null, args);
        //     } else {
        //         bot.speak("No idea what you're talking about");
        //     }
        //
        //     // const speaker = data.name;
        //     //const moderatorCommands = {};
        //     //moderatorCommands.riggedflip = () => { action: "riggedFlipResponse", helpText: "Ask the bot to flip a coin for you, always tails" }
        //     //const isMod = userFunctions.isUserModerator(speaker) === true;
        // },

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
