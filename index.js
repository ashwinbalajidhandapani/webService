const express = require('express');
const pool = require('./database');
const hashBcrypt = require('bcrypt');
const { Pool } = require('pg');
const { compareSync } = require('bcryptjs');
const app = express();
const port = process.env.PORT || 3000;


app.use(express.json());

function decodeBase64(inpString){
    const valb64 = Buffer.from(inpString, 'base64');
    const val = valb64.toString('utf-8');
    return val;
}

// Adding a user (Unauthenticated)
app.post("/v1/user", async(req,res, next)=>{
    try {
        const{first_name, last_name, email_id, password} = req.body;
        const salt = hashBcrypt.genSaltSync(10);
        const hash = hashBcrypt.hashSync(password, salt);
        let userCreatedVals;
        const queryAddUser = await pool.query(`INSERT INTO webserviceusers(emailid, firstname, lastname, password, datecreated, dateupdated) VALUES('${email_id}', '${first_name}', '${last_name}', '${hash}', current_timestamp, current_timestamp)`);
        const queryGetUserDetails = pool.query(`SELECT id, firstname, lastname, password, datecreated, dateupdated from webserviceusers where emailid='${email_id}'`);
        userCreatedVals = (await queryGetUserDetails).rows[0];
        const responseVals = {
            id:userCreatedVals["id"],
            first_name:userCreatedVals["firstname"],
            last_name:userCreatedVals["lastname"],
            account_created:userCreatedVals["datecreated"],
            account_updated:userCreatedVals["dateupdated"]
        }
        res.status(201).json(responseVals);

    } catch (err) {
        if (err.constraint === 'uemail'){
            res.status(400).send('Email already exists');
        }
        else{
            res.status(500).send(err.Message);
        }
    }
});

app.get("/v1/user/self", async(req,res)=>{

    if(!req.headers.authorization){
        res.status(401).send('Unauthorized')
    }
    else if(req.headers.authorization){
        const cVal = req.headers.authorization.split(" ")[1];
        const decodedAuthHeader = decodeBase64(cVal)
        const unamePwd = decodedAuthHeader.split(":");
        const token_uname = unamePwd[0];
        const token_pwd = unamePwd[1];
        let qdb_uname;
        let qdb_pwd;
        try{
            const QueryDbDetails = pool.query(`SELECT emailid, password FROM webserviceusers where emailid='${token_uname}'`);
            qdb_uname = (await QueryDbDetails).rows[0]["emailid"]
            qdb_pwd = (await QueryDbDetails).rows[0]["password"]
        }
        catch(err){
            console.log(err.stack);
            return;
        }
        
        if(token_uname === qdb_uname){
            const isCorrectPwd = hashBcrypt.compareSync(token_pwd, qdb_pwd);
            let responseVals;
            if(isCorrectPwd){
                try{
                    const queryGetUser = await pool.query(`SELECT id, firstname, lastname, emailid, datecreated, dateupdated from webserviceusers where emailid='${token_uname}'`);
                    responseVals = queryGetUser.rows[0];
                    const respValues = {
                        id:responseVals["id"],
                        first_name:responseVals["firstname"],
                        last_name:responseVals["lastname"],
                        username:responseVals["emailid"],
                        account_created:responseVals["datecreated"],
                        account_upadted:responseVals["dateupdated"]
                    }
                    res.status(200).json(respValues);
                }
                catch(err){
                    console.log(err);
                }
            }
            else{
                res.status(401).send('Unauthorized')
            }   
        }
    }
        
});

app.put("/v1/user/self", async(req, res)=>{
    if(!req.headers.authorization){
        res.status(401).send('Unauthorized')
    }
    else if(req.headers.authorization){
        const chVal = req.headers.authorization.split(" ")[1];
        const put_decodedAuthHeader = decodeBase64(chVal)
        const put_unamePwd = put_decodedAuthHeader.split(":");
        const tokenPut_uname = put_unamePwd[0];
        const tokenPut_pwd = put_unamePwd[1];
        let qdbPut_uname;
        let qdbPut_pwd;
        try{
            const QueryDbDetailsPut = pool.query(`SELECT emailid, password FROM webserviceusers where emailid='${tokenPut_uname}'`);
            qdbPut_uname = (await QueryDbDetailsPut).rows[0]["emailid"]
            qdbPut_pwd = (await QueryDbDetailsPut).rows[0]["password"]
        }
        catch(err){
            console.log(err.stack);
            return;
        }
        if(tokenPut_uname === qdbPut_uname){
            const isCorrectPwdPut = hashBcrypt.compareSync(tokenPut_pwd, qdbPut_pwd);
            if(isCorrectPwdPut){
                try{
                    if(!req.body){
                        res.status(400).send('Bad Requeest');
                    }
                    else{
                        const rq_fname = req.body.firstname;
                        const rq_lname = req.body.lastname;
                        const rq_email = req.body.email;
                        const rq_password = req.body.password;
                        const rq_salt = hashBcrypt.genSaltSync(10);
                        const rq_hash = hashBcrypt.hashSync(rq_password, rq_salt);
                        const queryUpdateUser = await pool.query(`UPDATE webserviceusers SET firstname='${rq_fname}', lastname='${rq_lname}', emailid='${rq_email}', password='${rq_hash}', dateupdated=current_timestamp WHERE emailid ='${tokenPut_uname}'`);
                        res.status(200).send('Success')
                    } 
                }
                catch(err){
                    console.log(err);
                }
            }
            else{
                res.status(401).send('Unauthorized')
            }   
        }
    }
});

// Endpoint created for assignment 1
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