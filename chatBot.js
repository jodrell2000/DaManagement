let authModule = require("./authChat.js");
let Bot = require("ttapi");
let bot = new Bot(authModule.AUTH, authModule.USERID, authModule.ROOMID);

let botModule = require("./chatbot/botModule.js")
const botFunctions = botModule(bot);

bot.debug = true;

bot.roomRegister(authModule.ROOMID, function() {
  bot.setAsBot();
});

bot.on("newsong", function () {
  bot.bop();
});

bot.on("speak", function (data) {
  if (botFunctions.wasThisACommand(data)) {
    botFunctions.parseCommand(data);
  }
});

setInterval(botFunctions.tikTok, 5000);
