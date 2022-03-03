const Pool = require('pg').Pool;

const pool = new Pool({
    user:'postgres',
    password:'passsword',
    database:'postgres
    host:'127.0.0.1
    port:5432
});

module.exports = pool;
