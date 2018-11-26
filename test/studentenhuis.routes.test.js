const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');

chai.should();
chai.use(chaiHttp);

describe('Studentenhuis API POST', () => {
    let token = "";

    before(function(done) {
        chai.request(server)
            .post('/api/login')
            .send({
                'email': 'jsmit@server.nl',
                'password': 'secret'
            })
            .end(function(err, res) {
                token = res.body.token;
                done();
            });
    });
    it('should throw an error when using invalid JWT token', (done) => {
        chai.request(server)
            .post('/api/studentenhuis')
            .set('X-Access-Token', "Fake.NotWorking.Token")
            .send({
                "naam": "unittest-home",
                "adres": "unittest-address"
            })
            .end((err, res) => {
                res.should.have.status(401);
                done();
            });
    });

    it('should return a studentenhuis when posting a valid object', (done) => {
        chai.request(server)
            .post('/api/studentenhuis')
            .set('X-Access-Token', token)
            .send({
                "naam": "unittesthome",
                "adres": "unittestaddress 1"
            })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');

                done();
            });
    });

    it('should throw an error when naam is missing', (done) => {
        chai.request(server)
            .post('/api/studentenhuis')
            .set('X-Access-Token', token)
            .send({
                "adres": "unittest-address"
            })
            .end((err, res) => {
                res.should.have.status(412);
                res.body.should.have.property('message').eql('The name must be provided');

                done();
            });
    });

    it('should throw an error when adres is missing', (done) => {
        chai.request(server)
            .post('/api/studentenhuis')
            .set('X-Access-Token', token)
            .send({
                "naam": "unittest-home"
            })
            .end((err, res) => {
                res.should.have.status(412);
                res.body.should.have.property('message').eql('The address must be provided');

                done();
            });
    })
});

describe('Studentenhuis API GET all', () => {
    let token = "";

    before(function(done) {
        chai.request(server)
            .post('/api/login')
            .send({
                'email': 'jsmit@server.nl',
                'password': 'secret'
            })
            .end(function(err, res) {
                token = res.body.token;
                done();
            });
    });
    it('should throw an error when using invalid JWT token', (done) => {
        chai.request(server)
            .get('/api/studentenhuis')
            .set('X-Access-Token', "Fake.NotWorking.Token")
            .end((err, res) => {
                res.should.have.status(401);
                done();
            });
    });

    it('should return all studentenhuizen when using a valid token', (done) => {
        chai.request(server)
            .get('/api/studentenhuis')
            .set('X-Access-Token', token)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('array');
                done();
            });
    })
});

describe('Studentenhuis API GET one', () => {
    let token = "";

    before(function(done) {
        chai.request(server)
            .post('/api/login')
            .send({
                'email': 'jsmit@server.nl',
                'password': 'secret'
            })
            .end(function(err, res) {
                token = res.body.token;
                done();
            });
    });
    it('should throw an error when using invalid JWT token', (done) => {
        chai.request(server)
            .get('/api/studentenhuis/1')
            .set('X-Access-Token', 'fake.Token')
            .end((err, res) => {
                res.should.have.status(401);
                done();
            });
    });

    it('should return the correct studentenhuis when using an existing huisId', (done) => {
        chai.request(server)
            .get('/api/studentenhuis/1')
            .set('X-Access-Token', token)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                done();
            });
    });

    it('should return an error when using an non-existing huisId', (done) => {
        chai.request(server)
            .get('/api/studentenhuis/-1')
            .set('X-Access-Token', token)
            .end((err, res) => {
                res.should.have.status(404);
                res.body.should.have.property('message').eql('This home does not exist');
                done();
            });
    })
});

describe('Studentenhuis API PUT', () => {
    let token = "";

    before(function(done) {
        chai.request(server)
            .post('/api/login')
            .send({
                'email': 'jsmit@server.nl',
                'password': 'secret'
            })
            .end(function(err, res) {
                token = res.body.token;
                done();
            });
    });
    it('should throw an error when using invalid JWT token', (done) => {
        chai.request(server)
            .put('/api/studentenhuis/1')
            .set('X-Access-Token', 'fake.Token')
            .send({
            "naam": "unittest-home",
            "adres": "unittest-address"
            })
            .end((err, res) => {
                res.should.have.status(401);
                done();
            });
    });

    it('should return a studentenhuis with ID when posting a valid object', (done) => {
        chai.request(server)
            .put('/api/studentenhuis/1')
            .set('X-Access-Token', token)
            .send({
            "naam": "unittest-home",
            "adres": "unittest-address"
            })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                done();
            });
    });

    it('should throw an error when naam is missing', (done) => {
        chai.request(server)
            .put('/api/studentenhuis/1')
            .set('X-Access-Token', token)
            .send({
                "adres": "unittest-address"
            })
            .end((err, res) => {
                res.should.have.status(412);
                done();
            });
    });

    it('should throw an error when adres is missing', (done) => {
        chai.request(server)
            .put('/api/studentenhuis/1')
            .set('X-Access-Token', token)
            .send({
                "naam": "unittest-home"
            })
            .end((err, res) => {
                res.should.have.status(412);
                done();
            });
    })
});

describe('Studentenhuis API DELETE', () => {
    let token = "";

    before(function(done) {
        chai.request(server)
            .post('/api/login')
            .send({
                'email': 'jsmit@server.nl',
                'password': 'secret'
            })
            .end(function(err, res) {
                token = res.body.token;
                done();
            });
    });
    it('should throw an error when using invalid JWT token', (done) => {
        chai.request(server)
            .delete('/api/studentenhuis/1')
            .set('X-Access-Token', 'fake.Token')
            .end((err, res) => {
                res.should.have.status(401);
                done();
            });
    });

    it('should return a studentenhuis when posting a valid object', (done) => {
        chai.request(server)
            .delete('/api/studentenhuis/1')
            .set('X-Access-Token', token)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                done();
            });
    });
});