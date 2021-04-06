let Bot = require('ttapi');
let thisBot = require('./chatbot/botModule.js');

let authModule = require('./authChat.js');
let chatModule = require('./chatbot/chatModule.js');
let bot = new Bot(authModule.AUTH, authModule.USERID, authModule.ROOMID);

bot.debug = true;

bot.on('newsong', function () {
  bot.bop();
});

bot.on('speak', function (data) {
  if (data.text.match(/^\//)) {
    chatModule.parseText(bot, data);
  }
});

setInterval(function () {
    chatModule.tickTok(bot)
}, 5000);