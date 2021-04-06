let responseModule = require('../chatbot/responseModule.js');
let thisMsgText = 'Hey! How are you @';

module.exports = {
    parseText, buildMessage, tickTok,
}

function saySomething (bot, message) {
    responseModule.responseCount ++;
    bot.speak(responseModule.responseCount+': '+message);
}

function tickTok (bot) {
    switch (responseModule.responseCount%2) {
        case 0:
            saySomething(bot,"tik");
            break;

        default:
            saySomething(bot,"tok");

    }
}

function parseText (bot, data) {
    // Get the data
    let name = data.name;
    let text = data.text;

    // Respond to "/hello" command
    if (text.match(/^\/hello$/)) {
        saySomething(bot, buildMessage(name));
    }
}

function buildMessage (name) {
    return thisMsgText+name;
}
