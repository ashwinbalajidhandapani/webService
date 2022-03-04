const mySql = require('mysql');

const pool = mySql.createPool({
    connectionLimit: 100,
    user:'root',
    password:'webservice',
    database:'webapp',
    host:'127.0.0.1',
    port:3306
});

module.exports = pool;
