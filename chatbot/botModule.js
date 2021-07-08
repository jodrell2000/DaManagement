let responseModule = require("../chatbot/responseModule.js");

let chatModule = require("../chatbot/chatModule.js");

const availableCommands = {};
const moderatorCommands = {};

const botModule = (bot) => {
    const responder = chatModule(bot);

    availableCommands.hello = (data) => { console.log("hello function"); responder.sayHello(data); }
    availableCommands.hello.help = "'/hello': Reply to the sender with a Hello! Likely used to test if the Bot is working";

    availableCommands.list = (data) => { responder.saySomething(data, "Available commands are: " + listCommands()); }
    availableCommands.list.help = "'/list': Lists all available commands";

    availableCommands.help = (data, command) => { console.log("Command:" + typeof(command) + "===="); displayHelp(data, command); }
    availableCommands.help.argumentCount = 1;
    availableCommands.help.help = "/help [command] Display how to use an individual command";

    moderatorCommands.queue = (data) => { responder.saySomething(data, "This would be a queue in he actual bot", true); }
    moderatorCommands.queue.help = "/queue Command that always responds in public";

    const allCommands = {
        ...availableCommands,
        ...moderatorCommands
    }

    function displayHelp(data, command) {
        if ( command[0] === undefined ) { command = "help" }
        if ( allCommands[command] === undefined ) {
            responder.saySomething( data, "That command desn't exist. Try /list to find the available commands");
        } else {
            responder.saySomething(data, allCommands[command].help);
        }
    }

    function listCommands() {
        return Object.keys(allCommands);
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

        getCommandAndArguments: function(text) {
            const [sentCommand, ...args] = text.split(" ");
            let theCommand = sentCommand.substring(1, sentCommand.length)
            const commandObj = allCommands[theCommand];
            if (commandObj) {
                return [commandObj, args];
            } else {
                return [null, null];
            }
        },

        newParseCommands: function(data, userFunctions) {
            const [command, args] = this.getCommandAndArguments(data.text);
             if (command) {
                command.call(null, data, args);
            } else {
                 bot.speak(data, "Sorry, that's not a command I recognise. Try /list to find out more.");
            }
        },
    };
};

module.exports = botModule;
