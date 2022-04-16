const { assert } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
const { response } = require('express');
const server = require('../index');
const should = chai.should();

chai.use(chaiHttp);

const bodyMess = {
    Message: 'Accessing the healthz API endpoint'
}

describe('healthz API', ()=>{
    // Testing the Status code of the API
    it("Validating the status code", (done)=>{
        chai.request(server)
            .get('/healthztest4')

            .end((err, response)=>{
                response.should.have.status(200);
                done();
            });
    });
    //Testing the body of the API
    it("validating the response body", (done)=>{
        chai.request(server)
        .get('/healthztest4')
        .end((err, response)=>{
            response.body.should.include(bodyMess);
            done();
        });
    });
});
