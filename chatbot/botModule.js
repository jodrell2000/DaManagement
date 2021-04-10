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

        wasThisACommand: (data) => {
            let text = data.text;

            // check if this was a command
            if (text.match(/^\//)) {
                return true;
            }
        },

        parseCommand: (data) => {
            switch (data.text) {
                case "/hello":
                    responder.saySomething(responder.buildMessage(data.name));
            }
        },
    };
};

module.exports = botModule;
