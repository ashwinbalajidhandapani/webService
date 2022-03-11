const mySql = require('mysql');

const pool = mySql.createPool({
    connectionLimit: 100,
    user:'csye6225',
    password:'admin123',
    database:'csye6225',
    host:'csye6225.ceqcujguktqu.us-east-2.rds.amazonaws.com',
    port:"3306"
});

module.exports = pool;
