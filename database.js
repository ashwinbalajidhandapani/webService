const Pool = require('pg').Pool;

const pool = new Pool({
    user:'ashwinbalajidhandapani',
    password:'admin',
    database:'webapp',
    host:'localhost',
    port:5432
});

module.exports = pool;