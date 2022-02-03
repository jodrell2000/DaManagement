// change the switch used to identify commands sent to yout bot in your .env file
// copy the .env.example file to .env and fill out the details for your Bot user

const dotenv = require('dotenv')

module.exports = {
    commandIdentifier: process.env.COMMANDIDENTIFIER,
}