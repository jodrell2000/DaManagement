let authModule = require("./authChat.js");
let chatResponder = require("./chatbot/chatModule.js");

let Bot = require("ttapi");
let bot = new Bot(authModule.AUTH, authModule.USERID, authModule.ROOMID);

bot.debug = true;

bot.on("newsong", function () {
  bot.bop();
});

const responder = chatResponder(bot);

bot.on("speak", function (data) {
  if (data.text.match(/^\//)) {
    responder.parseText(data);
  }
});

setInterval(responder.tickTok, 5000);
