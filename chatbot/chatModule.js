let responseModule = require("../chatbot/responseModule.js");
let thisMsgText = "Hey! How are you @";

const saySomething = (bot) => {
  responseModule.responseCount++;
  bot.speak(responseModule.responseCount + ": " + message);
};

const buildMessage = (name) => {
  return thisMsgText + name;
};

const chatResponder = (bot) => {
  return {
    tickTok: () => {
      switch (responseModule.responseCount % 2) {
        case 0:
          saySomething(bot, "tik");
          break;
        default:
          saySomething(bot, "tok");
      }
    },

    parseText: (data) => {
      // Get the data
      let name = data.name;
      let text = data.text;

      // Respond to "/hello" command
      if (text.match(/^\/hello$/)) {
        saySomething(buildMessage(name));
      }
    },
  };
};

module.exports = chatResponder;
