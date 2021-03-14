var Bot = require('ttapi');

// var AUTH = 'xxx'; //set the auth of your bot here.
// var USERID = 'xxx'; //set the userid of your bot here.
// var ROOMID = 'xxx'; //set the roomid of the room you want the bot to go to here.
// var bot = new Bot(AUTH, USERID, ROOMID);

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