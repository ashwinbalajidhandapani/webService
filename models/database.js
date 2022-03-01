const Pool = require('pg').Pool;

const pool = new Pool({
    user:'root',
    password:'',
    database:'root',
    host:'localhost',
    port:5432
});

module.exports = pool;