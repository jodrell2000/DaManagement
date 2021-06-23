let responseModule = require("../chatbot/responseModule.js");
let thisMsgText = "Hey! How are you @";

const chatModule = (bot) => {
    return {
        saySomething: (message) => {
            responseModule.responseCount++;
            bot.speak(responseModule.responseCount + ": " + message);
        },

        buildMessage: (name) => {
            return thisMsgText + name;
        },

        sayHello(name) {
          this.saySomething( "Hello " + name + "..." );
        }
    };
};

module.exports = chatModule;
