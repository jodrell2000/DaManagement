var Bot = require('ttapi');

var AUTH = 'SgJGxBviJVjyFEOhROuJILSs'; //set the auth of your bot here.
var USERID = '6044d40847c69b001e447957'; //set the userid of your bot here.
var ROOMID = '604ca44347b5e3001a8feb25'; //set the roomid of the room you want the bot to go to here.

var bot = new Bot(AUTH, USERID, ROOMID);

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