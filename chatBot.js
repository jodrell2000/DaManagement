let Bot = require('ttapi');

let authModule = require('./auth.js');
let chatModule = require('./chatbot/chatModule.js');
let responseModule = require('./chatbot/responseModule.js');
let bot = new Bot(authModule.AUTH, authModule.USERID, authModule.ROOMID);

bot.debug = true;

bot.on('speak', function (data) {
  // Get the data
  let name = data.name;
  let text = data.text;

  // Respond to "/hello" command
  if (text.match(/^\/hello$/)) {
    responseModule.responseCount ++;
    bot.speak(chatModule.buildMessage()+name);
  }
});