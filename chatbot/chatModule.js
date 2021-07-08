let responseModule = require("../chatbot/responseModule.js");
let thisMsgText = "Hey! How are you @";

const chatModule = (bot) => {
    return {
        saySomething: function (data, message, public) {
            let pmResponse;
            let senderID;
            if ( data.command === "pmmed" ) { pmResponse = true; senderID = data.senderid }
            responseModule.responseCount++;
            if ( pmResponse === true && public === undefined ) {
                this.botPM( responseModule.responseCount + ": " + message, senderID);
            } else {
                this.botChat( responseModule.responseCount + ": " + message );
            }

        },

        botChat: function (message) {
            bot.speak(message);
        },

        botPM: function (message, user) {
            bot.pm(message, user);
        },

        buildMessage: (name) => {
            return thisMsgText + name;
        },

        sayHello(data) {
            if ( data.command === "pmmed" ) {
                this.saySomething( data, "Hello..." );
            } else {
                const theName = data.name;
                this.saySomething( data, "Hello " + theName + "..." );
            }
        }
    };
};

module.exports = chatModule;
