const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');

chai.should();

chai.use(chaiHttp);

describe('User routes', ()=> {
    it('Should return all users', (done) =>{
        chai.request(server)
            .get('/user')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('array');

                if(res.body.length > 0){
                    res.body[0].should.be.an('object');
                    res.body[0].should.have.property('username');
                    res.body[0].should.have.property('password');
                }
                done();
            })
    });

    it('Should add user', (done) =>{
        chai.request(server)
            .post('/user')
            .send({username: 'test', password: 'test'})
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('object');

                res.body.should.have.property('username').eql('test');
                res.body.should.have.property('password').eql('test');

                done();
            })
    });

    it('Should return empty object', (done) =>{
        chai.request(server)
            .post('/user')
            .send({username: 'test', password: 'test'})
            .end((err, res) => {
                res.should.have.status(200);

                res.body.should.be.eql({});

                done();
            })
    });

    it('Should return 401 unauthorized', (done) =>{
        chai.request(server)
            .put('/user')
            .send({username: 'tester1', password: 'tester1'})
            .end((err, res) => {
                res.should.have.status(401);

                done();
            })
    });

    it('Should return updated object', (done) =>{
        chai.request(server)
            .put('/user')
            .send({username: 'test', password: 'test', newPassword: 'myTest'})
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('object');

                res.body.should.have.property('username').eql('test');
                res.body.should.have.property('password').eql('myTest');

                done();
            })
    });

    it('Should return deleted object', (done) =>{
        chai.request(server)
            .delete('/user')
            .send({username: 'test', password: 'myTest'})
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('object');

                res.body.should.have.property('username').eql('test');
                res.body.should.have.property('password').eql('myTest');

                done();
            })
    });
});