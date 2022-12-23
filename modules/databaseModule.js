const mysql = require( 'mysql' );

const dbUsername = process.env.DBUSERNAME;
const dbPassword = process.env.DBPASSWORD;
const dbName = process.env.DBNAME;

const databaseFunctions = () => {

    return {
        getDBConnection: function () {
            const connection = mysql.createConnection( {
                host: "localhost",
                user: dbUsername,
                password: dbPassword,
                database: dbName
            } );

            return connection;
        }
    }

}

module.exports = databaseFunctions;