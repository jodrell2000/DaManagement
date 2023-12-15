var mysql = require( 'mysql' );

var pool = mysql.createPool( {
    host: 'localhost',
    user: process.env.DBUSERNAME,
    password: process.env.DBPASSWORD,
    database: process.env.DBNAME,
    connectionLimit: 100
} );

exports.pool = pool;
