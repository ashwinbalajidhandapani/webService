const express = require('express');
const pool = require('./models/database');
const hashBcrypt = require('bcrypt');
const app = express();
const port = process.env.PORT || 3000;
const models = require('./models/index');
const multiparty = require('multiparty');
const multer = require('multer');
const StatsD = require('node-statsd'),
client = new StatsD();
// const { resolve } = require('path/posix');
const {
    uploadFile,
    deleteFile,
    getFileStream
} = require('./s3')
const upload = multer({
    dest: 'uploads/'
})
const fs = require('fs')
const util = require('util')
const unlinkFile = util.promisify(fs.unlink)
const {
    v4: uuidv4
} = require('uuid');
const {
    check,
    validationResult
} = require('express-validator');
const imageUploader = require('./image-uploader');
app.use(express.json());

function decodeBase64(inpString) {
    const valb64 = Buffer.from(inpString, 'base64');
    const val = valb64.toString('utf-8');
    return val;
}

// Adding a user (Unauthenticated)
app.post("/v2/user", async (req, res, next) => {
    console.log("@@@ POST '/user/self/' @@@");
    client.increment("POST '/user/self/");
    try {
        const { first_name, last_name, email_id, password } = req.body;
        const salt = hashBcrypt.genSaltSync(10);
        const hash = hashBcrypt.hashSync(password, salt);
        let userCreatedVals;
        await pool.query(`INSERT INTO users(emailid, firstname, lastname, password, createdAt, updatedAt) VALUES('${email_id}', '${first_name}', '${last_name}', '${hash}', current_timestamp, current_timestamp)`);
        const queryGetUserDetails = pool.query(`SELECT id, firstname, lastname, emailid, password, createdAt, updatedAt from users where emailid='${email_id}'`, function (err, result) {
            if (err) {
                console.log(err);
                res.status(500).send(err);
            }
            else {
                userCreatedVals = result[0];
                const responseVals = {
                    id: userCreatedVals["id"],
                    first_name: userCreatedVals["firstname"],
                    last_name: userCreatedVals["lastname"],
                    username: userCreatedVals["emailid"],
                    account_created: userCreatedVals["createdAt"],
                    account_updated: userCreatedVals["updatedAt"]
                }
                res.status(201).json(responseVals)
            }
        });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(400).send('Email already exists');
        }
        else {
            console.log('Inside 500 block')
            console.log(err.Message)
            res.status(500).send(err.Message);
        }
    }
});

app.get("/v2/user/self", async (req, res) => {
    console.log("@@@ GET '/user/self/' @@@");
    client.increment("GET '/user/self/");
    if (!req.headers.authorization) {
        res.status(401).send('Unauthorized')
    }
    else if (req.headers.authorization) {
        const cVal = req.headers.authorization.split(" ")[1];
        const decodedAuthHeader = decodeBase64(cVal)
        const unamePwd = decodedAuthHeader.split(":");
        const token_uname = unamePwd[0];
        const token_pwd = unamePwd[1];
        let qdb_uname;
        let qdb_pwd;

        const userVerificationDetails = await (new Promise((resolve, reject) => {
            pool.query(`SELECT emailid, password FROM users where emailid='${token_uname}'`,
                (err, results) => {
                    if (err) {
                        console.log('Error: ' + err);
                        res.status(400).send('No users found');
                        return reject(err);
                    }
                    return resolve(results);
                });
        }));


        qdb_uname = userVerificationDetails[0]['emailid'];
        qdb_pwd = userVerificationDetails[0]['password'];
        if (token_uname === qdb_uname) {
            const isCorrectPwd = hashBcrypt.compareSync(token_pwd, qdb_pwd);
            let responseVals;
            console.log(isCorrectPwd)
            if (isCorrectPwd) {
                const getUserDetailsReq = await (new Promise((resolve, reject) => {
                    pool.query(`SELECT id, firstname, lastname, emailid, createdAt, updatedAt from users where emailid='${token_uname}'`, (err, result) => {
                        if (err) {
                            console.log('Error: ' + err);
                            res.status(400).send('No users found');
                            return reject(err);
                        }
                        return resolve(result)
                    });
                }));
                responseVals = getUserDetailsReq[0];
                const respValues = {
                    id: responseVals["id"],
                    first_name: responseVals["firstname"],
                    last_name: responseVals["lastname"],
                    username: responseVals["emailid"],
                    account_created: responseVals["createdAt"],
                    account_upadted: responseVals["updatedAt"]
                }
                res.status(200).json(respValues);
            }
            else {
                res.status(401).send('Unauthorized');
            }
        }
        else {
            res.status(401).send('Unauthorized');
        }
    }
});

app.put("/v2/user/self", async (req, res) => {
    console.log("@@@ PUT '/user/self/' @@@");
    client.increment("PUT '/user/self/");
    if (!req.headers.authorization) {
        res.status(401).send('Unauthorized')
    }
    else if (req.headers.authorization) {
        const chVal = req.headers.authorization.split(" ")[1];
        const put_decodedAuthHeader = decodeBase64(chVal)
        const put_unamePwd = put_decodedAuthHeader.split(":");
        const tokenPut_uname = put_unamePwd[0];
        const tokenPut_pwd = put_unamePwd[1];
        let qdbPut_uname;
        let qdbPut_pwd;
        const QueryDbDetailsPut = await (new Promise((resolve, reject) => {
            pool.query(`SELECT emailid, password FROM users where emailid='${tokenPut_uname}'`, (err, result)=>{
                if(err){
                    console.log('Error: '+err);
                    res.status(401).send('Unauthorized');
                    return reject(err);
                }
                return resolve(result);
            })
        }));
        qdbPut_uname = QueryDbDetailsPut[0]["emailid"]
        qdbPut_pwd = QueryDbDetailsPut[0]["password"]
        if (tokenPut_uname === qdbPut_uname) {
            const isCorrectPwdPut = hashBcrypt.compareSync(tokenPut_pwd, qdbPut_pwd);
            if (isCorrectPwdPut) {
                    if (!req.body) {
                        res.status(400).send('Bad Requeest');
                    }
                    else {
                        const rq_fname = req.body.first_name;
                        const rq_lname = req.body.last_name;
                        const rq_email = req.body.email_id;
                        const rq_password = req.body.password;
                        const rq_salt = hashBcrypt.genSaltSync(10);
                        const rq_hash = hashBcrypt.hashSync(rq_password, rq_salt);
                        await(new Promise((resolve, reject)=>{
                            pool.query(`UPDATE users SET firstname='${rq_fname}', lastname='${rq_lname}', emailid='${rq_email}', password='${rq_hash}', updatedAt=current_timestamp WHERE emailid ='${tokenPut_uname}'`, (err, result)=>{
                                if(err){
                                    console.log('Error: '+err);
                                    return reject(err);
                                }
                                return resolve(result);
                            });
                        }));
                        res.send(204).send("")
                    }
            }
            else {
                res.status(401).send('Unauthorized')
            }
        }
    }
});

// Assignment 5
 app.post("/v2/user/self/pic", upload.single('file_name'),
 async (req, res) => {
    console.log("@@@ POST '/user/self/pic' @@@");
    client.increment("POST '/user/self/pic");
     const file = req.file   
     const description = req.body.description
     var form = new multiparty.Form();
     const errors = validationResult(req);

     if (!errors.isEmpty()) {
         /*return res.status(400).json({
             errors: errors.array()
         });*/
     }
     if (!req.headers.authorization) {
         return res.status(401).send('Unauthorized')
     } else if (req.headers.authorization) {
         const valUpdateCheck = req.headers.authorization.split(" ")[1];
         const authHeaderDecoded = decodeBase64(valUpdateCheck)
         const usernamePasswordUpdated = authHeaderDecoded.split(":");
         const tokenUsernameUpdated = usernamePasswordUpdated[0];
         const tokenPasswordUpdated = usernamePasswordUpdated[1];
         let tokenUsernameDcrypt;
         let tokenPasswordDcrypt;
         let tokenUserId;
         const queryDbDetails = await (new Promise((resolve, reject) => {
            pool.query(`SELECT id, emailid, password FROM users where emailid='${tokenUsernameUpdated}'`, (err, result)=>{
                if(err){
                    console.log('Error: '+err);
                    res.status(401).send('Unauthorized');
                    return reject(err);
                }
                return resolve(result);
            })
        }));
        tokenPasswordDcrypt = queryDbDetails[0]["password"];
        tokenUsernameDcrypt = queryDbDetails[0]["emailid"];
        tokenUserId = queryDbDetails[0]["id"];
         if (tokenUsernameUpdated === tokenUsernameDcrypt) {
             const checkUpdatedPassword = hashBcrypt.compareSync(tokenPasswordUpdated, tokenPasswordDcrypt);
             if (checkUpdatedPassword) {
                 try {
                     if (!req.body) {
                         res.status(400).send('Bad Request');
                     } else {
                    const querydeleteImageDtl = await(new Promise((resolve, reject)=>{
                        pool.query(`Select * from images where user_id='${tokenUserId}'`, (err, result)=>{
                            if(err){
                                console.log('Error: '+err);
                                res.status(401).send('Unauthorized');
                                return reject(err);
                            }
                            return resolve(result);
                        });
                    }));
                
                    const result = await uploadFile(file);
                    await unlinkFile(file.path)
                    const requestedFilename = file.originalname;
                    const requestedUrl = result.Location;
                    const requestedUser_id = req.body.user_id;
                    if(querydeleteImageDtl[0]){   
                        print('select query not empty')                        
                        var fileName = querydeleteImageDtl[0]["url"];                             
                        await deleteFile(fileName.split('/')[4]);
                        new Promise((resolve, reject)=>{
                            pool.query(`UPDATE images set file_name='${requestedFilename}',url='${requestedUrl}' where user_id='${tokenUserId}'`, (err, result)=>{
                                if(err){
                                    console.log('Error: '+err);
                                    res.status(401).send('Unauthorized');
                                    return reject(err);
                                }
                                return resolve(result);
                            });
                        });
                    }
                    else {
                        const queryInsertImage = await(new Promise((resolve, reject)=>{
                            pool.query(`INSERT INTO images(user_id,filename,url,id) VALUES ('${tokenUserId}','${requestedFilename}','${requestedUrl}','${uuidv4()}')`, (err, result)=>{
                                if(err){
                                    console.log('Error: '+err);
                                    res.status(401).send('Unauthorized');
                                    return reject(err);
                                }
                                return resolve(result);
                            });
                        }));

                        const userDetailsImageInsert = await(new Promise((resolve, reject)=>{
                            pool.query(`SELECT filename, id, url, user_id, upload_date from images where user_id='${tokenUserId}'`, (err, result)=>{
                                if(err){
                                    console.log('Error: '+err);
                                    res.status(401).send('Unauthorized');
                                    return reject(err)
                                }
                                return resolve(result)
                            });
                        }));
                    }
                    const response = userDetailsImageInsert[0];
                    const jResp = {
                        file_name:response['filename'],
                        id:response['id'],
                        url:response['url'],
                        upload_date:response['upload_date'],
                        user_id:response['user_id']
                    }
                    res.status(200).json(jResp)
                    }
                 } catch (error) {
                     console.log(error);
                 }
             } else {
                 res.status(401).send('Unauthorized')
             }
         }
     }
 });

 app.get("/v2/user/self/pic", async (request, response) => {
    console.log("@@@ GET '/user/self/pic' @@@");
    client.increment("GET '/user/self/pic");
    if (!request.headers.authorization) {
        response.status(401).send('Unauthorized')
    } else if (request.headers.authorization) {
        const authorizationHeader = request.headers.authorization.split(" ")[1];
        const authHeaderDecoded = decodeBase64(authorizationHeader)
        const usernamePassword = authHeaderDecoded.split(":");
        const authTokenUsername = usernamePassword[0];
        const authTokenPassword = usernamePassword[1];
        let usernameDeCrypt;
        let passwordDecrypt;
        const responseValues = await (new Promise((resolve, reject) => {
        pool.query(`SELECT id, emailid, password FROM users where emailid='${authTokenUsername}'`, (err, result)=>{
            if(err){
                console.log('Error: '+err);
                res.status(401).send('Unauthorized');
                return reject(err);
            }
            return resolve(result);
        })
        }));
        usernameDeCrypt = responseValues[0]["emailid"];
        passwordDecrypt = responseValues[0]["password"];
        idDecrypt = responseValues[0]["id"];
        if (authTokenUsername === usernameDeCrypt) {
            const comparePassword = hashBcrypt.compareSync(authTokenPassword, passwordDecrypt);
            let parseResponse;
            if (comparePassword) {
                const qryGetUser = await(new Promise((resolve, reject)=>{
                    pool.query(`SELECT * from images where user_id='${idDecrypt}'`, (err, result)=>{
                        if(err){
                            console.log('Error: '+ err);
                            res.status(401).send('Unauthorized');
                            return reject(err);
                        }
                        return resolve(result);
                    });
            }));
        parseResponse = qryGetUser[0];
        const responseValues = {
            id: parseResponse["id"],
            user_id: parseResponse["user_id"],
            file_name: parseResponse["filename"],
            url: parseResponse["url"],
            upload_date: parseResponse["upload_date"]
        }
        response.status(200).json(responseValues);
        } 
        else {
            response.status(401).send('Unauthorized')
        }
        }
    }
});

app.delete("/v2/user/self/pic",
    async (req, res) => {
        console.log("@@@ DELETE '/user/self/pic' @@@");
        client.increment("DELETE '/user/self/pic");
        if (!req.headers.authorization) {
            return res.status(401).send('Unauthorized')
        } else if (req.headers.authorization) {
            const valUpdateCheck = req.headers.authorization.split(" ")[1];
            const authHeaderDecoded = decodeBase64(valUpdateCheck)
            const usernamePasswordUpdated = authHeaderDecoded.split(":");
            const tokenUsernameUpdated = usernamePasswordUpdated[0];
            const tokenPasswordUpdated = usernamePasswordUpdated[1];
            let tokenUsernameDcrypt;
            let tokenPasswordDcrypt;
            const queryDbDetails = await(new Promise((resolve, reject)=>{
                pool.query(`SELECT emailid, password,id FROM users where emailid='${tokenUsernameUpdated}'`, (err, result)=>{
                    if(err){
                        console.log('Error: '+err);
                        res.status(401).send('Unauthorized');
                        return reject(err)
                    }
                    return resolve(result)
                });
             
            }));
            tokenUsernameDcrypt = queryDbDetails[0]["emailid"];
            tokenPasswordDcrypt = queryDbDetails[0]["password"];
            tokenUserId = queryDbDetails[0]["id"];
            
            if (tokenUsernameUpdated === tokenUsernameDcrypt) {
                const checkUpdatedPassword = hashBcrypt.compareSync(tokenPasswordUpdated, tokenPasswordDcrypt);
                if (checkUpdatedPassword) {
                    try {
                        if (!req.body) {
                            res.status(400).send('Bad Request');
                        } else {
                            const querydeleteImageDtl = await(new Promise((resolve, reject)=>{
                                pool.query(`Select * from images where user_id='${tokenUserId}'`, (err, result)=>{
                                    if(err){
                                        console.log(err);
                                        res.status(401).send('Unauthorized');
                                        return reject(err);
                                    }
                                    return resolve(result);
                                }); 
                            }));                            
                            if(!querydeleteImageDtl){
                                return res.status(400).send({
                                    message: "No image to delete"
                                });
                            }
                            var fileName = querydeleteImageDtl[0]["url"];                             
                            const result = await deleteFile(fileName.split('/')[4]);
                            await(new Promise((resolve, reject)=>{
                                pool.query(`Delete from images where user_id='${tokenUserId}'`, (err, result)=>{
                                    if(err){
                                        console.log(err);
                                        res.send(401).send('Unauthorized');
                                        return reject(err);
                                    }
                                    return resolve(result);
                                });
                            }));
                        }
                    } catch (error) {
                        console.log(error);
                    }
                } else {
                    res.status(401).send('Unauthorized')
                }
            }
        }
    });

// Endpoint created for assignment 1

app.get('/healthztest123', (req, res) => {
    console.log("@@@ GET '/healthz' @@@");
    client.increment('GET /healthz');
    res.set({
        "readOnly": "true"
    });
    res.status('200').json({
        Message: 'Accessing the healthz API endpoint'
    });
});

models.sequelize.sync().then((x) => {
    console.log('### Database Resynced !! ###');
});


const server = app.listen(port, () => console.log(`Listening on port ${port}`));
module.exports = server
