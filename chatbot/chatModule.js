let responseModule = require('../chatbot/responseModule.js');
let thisMsgText = 'Hey! How are you @';

module.exports = {
    buildMessage: function() {
        return responseModule.responseCount+': '+thisMsgText;
    }
}
