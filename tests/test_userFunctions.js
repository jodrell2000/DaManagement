let mockBot = require('./mock_bot.js');
let roomDefaults = require('../defaultSettings/roomDefaults.js');
let userModule = require('../modules/userModule.js');

const bot = mockBot();
const userFunctions = userModule(bot, roomDefaults);

let testResults = [];
let debug = true;

function debugMessage(message) {
    if (debug === true) {
        console.log(message);
    }
}

function test_resetUsersList(userFunctions) {
    if (userFunctions.theUsersList.length !== 0) {
        debugMessage("Users list is not empty?!?");
        return false;
    }
    userFunctions.theUsersList.push(12345);
    userFunctions.resetUsersList();

    if (userFunctions.theUsersList.length !== 0) {
        debugMessage("Users list is no longer empty");
        return false;
    }

    return true;
}

if (!test_resetUsersList(userFunctions)) {
    testResults.push("resetUsersList failed");
}

if (testResults.length !== 0) {
    console.log(testResults);
} else {
    console.log("All userFunctions tests passed!");
}

