const mysql = require('mysql');
const settings = require('../config');

const connection = mysql.createConnection({
    host: settings.databaseHost,
    user: settings.username,
    password: settings.password,
    database: settings.databaseName
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected to database!");
});

module.exports = connection;