const mySql = require('mysql');
const config = require('../config/dbConfig');

const pool = mySql.createPool({
    connectionLimit: 100,
    user:config.USER,
    password:config.PASSWORD,
    database:config.DB,
    host:config.HOST,
    port:config.port
});

module.exports = pool;
