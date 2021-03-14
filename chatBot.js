var Bot = require('ttapi');

var authModule = require('./auth.js');
var bot = new Bot(authModule.AUTH, authModule.USERID, authModule.ROOMID);

bot.debug = true;

bot.on('speak', function (data) {
  // Get the data
  var name = data.name;
  var text = data.text;

  // Respond to "/hello" command
  if (text.match(/^\/hello$/)) {
    bot.speak('Hey! How are you @'+name+'?');
  }
});