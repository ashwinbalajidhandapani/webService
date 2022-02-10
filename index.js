const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
// modules.export = server


app.get('/healthz', (req, res)=>{
    res.set({
    "readOnly":"true"
    });
    res.status('200').json({
        Message: 'Accessing the healthz API endpoint'
    });
});

const server = app.listen(port, ()=> console.log(`Listening on port ${port}`));
module.exports = server