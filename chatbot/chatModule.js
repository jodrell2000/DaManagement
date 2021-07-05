let responseModule = require("../chatbot/responseModule.js");
let thisMsgText = "Hey! How are you @";

const chatModule = (bot) => {
    return {
        saySomething: function (data, message) {
            let pmResponse;
            let senderID;
            if ( data.command === "pmmed" ) { pmResponse = true; senderID = data.senderid }
            responseModule.responseCount++;
            if ( pmResponse === true ) {
                this.botPM( responseModule.responseCount + ": " + message, senderID);
            } else {
                this.botChat( responseModule.responseCount + ": " + message );
            }

        },

        botChat: function (message) {
            console.log("Public response");
            bot.speak(message);
        },

        botPM: function (message, user) {
            console.log("user:" + user);
            console.log("message:" + message);
            console.log("PM response");
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
