let authModule = require( './auth.js' );
let Bot = require("ttapi");
let bot = new Bot(authModule.AUTH, authModule.USERID, authModule.ROOMID);

let botModule = require("./chatbot/botModule.js")
const botFunctions = botModule(bot);

bot.debug = false;

bot.roomRegister(authModule.ROOMID, function() {
  bot.setAsBot();
});

bot.on("newsong", function () {
  bot.bop();
});

bot.on("speak", function (data) {
  if (botFunctions.wasThisACommand(data)) {
    botFunctions.parseCommands(data);
  }
});

bot.on('pmmed', function (data)
{
  if (botFunctions.wasThisACommand(data)) {
    botFunctions.newParseCommands(data);
  }
});

// userID1 = 12345;
// userID2 = 987654;
// let afkPeople = [];
// console.log('afkPeople empty: ' + afkPeople );

// afkPeople.push( userID1 );
// console.log('afkPeople: user 12345 added ' + afkPeople );

// afkPeople.push( userID2 );
// console.log('afkPeople: user 987654 added ' + afkPeople );

// const listPosition = afkPeople.indexOf( userID1 )
// console.log('listPosition: position for 12345 ' + listPosition );

// afkPeople.splice(listPosition, 1);
// console.log('afkPeople: user 12345 removed ' + afkPeople );


// playing with arrays and objects...
//
// userList = [ { id:636473737373, username: 'Tom'},
//   { id:535253533353, username: 'Dick'},
//   { id:123456789000, username: 'Harry', afk: true}
//   ];
// console.log('userlist:', userList);
// console.log('values count:', Object.values(userList).length);
// console.log('keys count:', Object.keys(userList).length);
//
// arrayLocation = userList.find( ({ id }) => id === 636473737373 );
// console.log('User ID 636473737373: username:', arrayLocation.username);
//
// userHarry = userList.find( ({ username }) => username === 'Harry' );
// console.log('User Harry: ', userHarry);
//
// harryLocation = userList.findIndex( ({ username }) => username === 'Harry' );
// console.log('User Harry location: ', harryLocation);
//
// // remove 1 array element from position harryLocation
// userList.splice(harryLocation, 1);
// console.log('2 userlist:', userList);
//
// notFound = userList.findIndex( ({ username }) => username === 'Wibble' );
// console.log('not Found:', notFound);
//
// // add new user to array
// userList.push( { id:99, username: 'Jodrell'} );
// console.log('3 userlist:', userList);
//
// // add afk property for user Jodrell
// userList[2]['wibble'] = true;
// console.log('3 userlist:', userList);
//
// // remove afk property for user Jodrell
// delete userList[2]['wibble'];
// console.log('3 userlist:', userList);
