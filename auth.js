// configured using environment variables in a .env file
// copy the .env.example file to .env and fill ouut the details for your Bot user
const dotenv = require('dotenv').config()

module.exports = {
    AUTH: process.env.AUTH,
    USERID: process.env.USERID,
    ROOMID: process.env.ROOMID
}