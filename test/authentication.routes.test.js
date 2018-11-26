/**
 * Testcases aimed at testing the authentication process.
 */
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const db = require('../controllers/db');

chai.should();
chai.use(chaiHttp);

// After successful registration we have a valid token. We export this token
// for usage in other testcases that require login.
let validToken;

describe('Registration', () => {
    it('should return a token when providing valid information', (done) => {
        chai.request(server)
            .post('/api/register')
            .send({
                'firstname': 'test_firstname',
                'lastname': 'test_lastname',
                'email': 'test@email.nl',
                'password': 'secret'
            })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.have.property('email').eql('test@email.nl');
                res.body.should.have.property('token');

                validToken = res.body.token;

                done();
            })
    });

    it('should return an error on GET request', (done) => {
        chai.request(server)
            .get('/api/register')
            .end((err, res) => {
                res.should.have.status(404);
                res.body.should.be.a('object');
                res.body.should.have.property('error').eql('This endpoint does not exist');
                done();
            });
    });

    it('should throw an error when the user already exists', (done) => {
        chai.request(server)
            .post('/api/register')
            .send({
                'firstname': 'test_firstname',
                'lastname': 'test_lastname',
                'email': 'test@email.nl',
                'password': 'secret'
            })
            .end((err, res) => {
                res.should.have.status(412);
                res.body.should.be.a("object");

                res.body.should.have.property("message").eql("This user is already existing");

                done();
            });
    });

    it('should throw an error when no firstname is provided', (done) => {
        chai.request(server)
            .post('/api/register')
            .send({
                'lastname': 'test_lastname',
                'email': 'test@email.nl',
                'password': 'secret'
            })
            .end((err, res) => {
                res.should.have.status(412);
                res.body.should.be.a("object");

                res.body.should.have.property("message").eql("Some properties are not provided or length of some properties was not correct");

                done();
            });
    });

    it('should throw an error when firstname is shorter than 2 chars', (done) => {
        chai.request(server)
            .post('/api/register')
            .send({
                "firstname": "t",
                'lastname': 'test_lastname',
                'email': 'test@email.nl',
                'password': 'secret'
            })
            .end((err, res) => {
                res.should.have.status(412);
                res.body.should.be.a("object");

                res.body.should.have.property("message").eql("Some properties are not provided or length of some properties was not correct");

                done();
            });
    });

    it('should throw an error when no lastname is provided', (done) => {
        chai.request(server)
            .post('/api/register')
            .send({
                "firstname": "test_firstname",
                'email': 'test@email.nl',
                'password': 'secret'
            })
            .end((err, res) => {
                res.should.have.status(412);
                res.body.should.be.a("object");

                res.body.should.have.property("message").eql("Some properties are not provided or length of some properties was not correct");

                done();
            });
    });

    it('should throw an error when lastname is shorter than 2 chars', (done) => {
        chai.request(server)
            .post('/api/register')
            .send({
                "firstname": "test_firstname",
                'lastname': 't',
                'email': 'test@email.nl',
                'password': 'secret'
            })
            .end((err, res) => {
                res.should.have.status(412);
                res.body.should.be.a("object");

                res.body.should.have.property("message").eql("Some properties are not provided or length of some properties was not correct");

                done();
            });
    });

    it('should throw an error when email is invalid', (done) => {
        chai.request(server)
            .post('/api/register')
            .send({
                "firstname": "test_firstname",
                'lastname': 't',
                'email': 'testemail.nl',
                'password': 'secret'
            })
            .end((err, res) => {
                res.should.have.status(412);
                res.body.should.be.a("object");

                res.body.should.have.property("message").eql("Some properties are not provided or length of some properties was not correct");

                done();
            });
    });

    after(() => {
        // existing email addresses cannot login
        db.query("DELETE FROM user WHERE Email = 'test@email.nl'", [])
    });

});

describe('Login', () => {

    it('should return a token when providing valid information', (done) => {
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

    it('should throw an error when email does not exist', (done) => {
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

    it('should throw an error when email exists but password is invalid', (done) => {
        chai.request(server)
            .post('/api/login')
            .send({
                'email': 'jsmit@server.nl',
                'password': 'wrongPassword'
            })
            .end((err, res) => {
                res.should.have.status(401);
                res.body.should.have.property('error').eql('Looks like you do not have an account yet!');
                done();
            })
    });

    it('should throw an error when using an invalid email', (done) => {
        chai.request(server)
            .post('/api/login')
            .send({
                'email': 'jsmitservernl',
                'password': 'wrongPassword'
            })
            .end((err, res) => {
                res.should.have.status(401);
                res.body.should.have.property('error').eql('Looks like you do not have an account yet!');
                done();
            })
    });

});
