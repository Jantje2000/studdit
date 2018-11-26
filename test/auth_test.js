const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const db = require('../controllers/db');

chai.should();

chai.use(chaiHttp);

describe('User login', ()=> {
    it('Should log in with username: jsmit@server.nl and password: secret', (done) => {
        chai.request(server)
            .post('/api/login')
            .send({
                'email': 'jsmit@server.nl',
                'password': 'secret'
            })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.have.property('email').eql('jsmit@server.nl');
                res.body.should.have.property('token');
                done();
            })
    });
    it('Should give an error when logging in with the wrong username: wrongUser and password: wrongPassword', (done) => {
        chai.request(server)
            .post('/api/login')
            .send({
                'email': 'wrongUser',
                'password': 'wrongPassword'
            })
            .end((err, res) => {
                res.should.have.status(401);
                res.body.should.have.property('error').eql('Looks like you do not have an account yet!');
                done();
            })
    });
});
describe('Register a user', ()=> {
    it('Should save user in database and return token', (done) => {
        chai.request(server)
            .post('/api/register')
            .send({
                "firstname": "test_firstname",
                "lastname": "test_lastname",
                "email": "test@email.nl",
                "password": "secret"
            })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.have.property('email').eql('test@email.nl');
                res.body.should.have.property('token');

                done();
            })
    });
    it('Should give an error when providing less data', (done) => {
        chai.request(server)
            .post('/api/register')
            .end((err, res) => {
                res.should.have.status(412);
                res.body.should.have.property('message').eql('Some properties are not provided or length of some properties was not correct');
                done();
            })
    });
    after(() => {
        // existing email addresses cannot login
        db.query("DELETE FROM user WHERE Email = 'test@email.nl'", [])
    });
});