
var mysql = require('mysql2');

function connectDatabase() {
    var con = mysql.createPool({
        host: process.env.DB_HOST || "localhost",
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "password",
        database: process.env.DB_NAME || 'easyClicksDatabase',
        ssl: process.env.DB_HOST ? { rejectUnauthorized: false } : false,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    return con;
}

module.exports = connectDatabase;
