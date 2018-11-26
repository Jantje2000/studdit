const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const db = require("../controllers/db");
const auth = require("../auth/authentication");

chai.should();

chai.use(chaiHttp);

describe('Get all dormitories', ()=> {
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

    it('Should get all dormitories', (done) => {
        chai.request(server)
            .get('/api/studentenhuis')
            .set('X-Access-Token', token)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('array');

                // get dormitories in database to check length of dormitories
                db.query("SELECT * FROM view_studentenhuis", [], (err, result) => {
                    res.body.should.have.length(result.length);

                    res.body[0]["ID"].should.be.equal(result[0]["ID"]);
                    res.body[0]["naam"].should.be.equal(result[0]["Naam"]);
                    res.body[0]["adres"].should.be.equal(result[0]["Adres"]);
                    res.body[0]["contact"].should.be.equal(result[0]["Contact"]);
                    res.body[0]["email"].should.be.equal(result[0]["Email"]);
                });
                done();
            })
    });
    it("Should give an error when dont send a token", (done) => {
        chai.request(server)
            .get('/api/studentenhuis')
            .end((err, res) => {
                res.should.have.status(401);
                res.body.should.have.property('message').eql('Not authorised');
                res.body.should.have.property('code').eql(401);
                done();
            });
    });
});


describe('Add new dormitory', ()=> {
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
    it('Should add a dormitory returning object and status 200', (done) => {
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

                // get dormitories in database to check length of dormitories
                db.query("SELECT * FROM view_studentenhuis WHERE ID = ?", [res.body["ID"]], (err, result) => {
                    res.body.should.have.property("ID").eql(result[0]["ID"]);
                    res.body.should.have.property("naam").eql(result[0]["Naam"]);
                    res.body.should.have.property("adres").eql(result[0]["Adres"]);
                    res.body.should.have.property("contact").eql(result[0]["Contact"]);
                    res.body.should.have.property("email").eql(result[0]["Email"]);
                });
                done();
            })
    });
    it("Should give an error when dont send a token", (done) => {
        chai.request(server)
            .post('/api/studentenhuis')
            .end((err, res) => {
                res.should.have.status(401);
                res.body.should.have.property('message').eql('Not authorised');
                res.body.should.have.property('code').eql(401);
                done();
            });
    });
    it('Should return statuscode 412 with error message when don\'t sending name', (done) => {
        chai.request(server)
            .post('/api/studentenhuis')
            .set('X-Access-Token', token)
            .send({
                "adres": "unittest-address"
            })
            .end((err, res) => {
                res.should.have.status(412);
                res.body.should.be.a('object');

                res.body.should.have.property("message").eql("The name must be provided");
                res.body.should.have.property("code").eql(412);

                done();
            })
    });
    it('Should return statuscode 412 with error message when don\'t sending address', (done) => {
        chai.request(server)
            .post('/api/studentenhuis')
            .set('X-Access-Token', token)
            .send({
                "naam": "unittest-name"
            })
            .end((err, res) => {
                res.should.have.status(412);
                res.body.should.be.a('object');

                res.body.should.have.property("message").eql("The address must be provided");
                res.body.should.have.property("code").eql(412);

                done();
            })
    });
});
describe('Get a dormitory by Id', ()=> {
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
    it('Should return a dormitory object and status 200', (done) => {
        // qet an existing id out of the database
        db.query("SELECT MAX(ID) AS ID FROM studentenhuis", [], (err, result) => {
            chai.request(server)
                .get('/api/studentenhuis/' + result[0]["ID"])
                .set('X-Access-Token', token)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');

                    // get dormitories in database to check length of dormitories
                    db.query("SELECT * FROM view_studentenhuis WHERE ID = ?", [result[0]["ID"]], (err, result) => {
                        result = result[0];
                        res.body.should.have.property("ID").eql(result["ID"]);
                        res.body.should.have.property("naam").eql(result["Naam"]);
                        res.body.should.have.property("adres").eql(result["Adres"]);
                        res.body.should.have.property("contact").eql(result["Contact"]);
                        res.body.should.have.property("email").eql(result["Email"]);
                    });
                    done();
                });
        });
    });
    it("Should give an error when dont send a token", (done) => {
        chai.request(server)
            .get('/api/studentenhuis/0')
            .end((err, res) => {
                res.should.have.status(401);
                res.body.should.have.property('message').eql('Not authorised');
                res.body.should.have.property('code').eql(401);
                done();
            });
    });
    it('Should return statuscode 404 with error message when sending a code which don\'t exist', (done) => {
        chai.request(server)
            .get('/api/studentenhuis/0')
            .set('X-Access-Token', token)
            .send({
                "adres": "unittest-address"
            })
            .end((err, res) => {
                res.should.have.status(404);
                res.body.should.be.a('object');

                res.body.should.have.property("message").eql("This home does not exist");
                res.body.should.have.property("code").eql(404);

                done();
            })
    });
});
describe('Update a dormitory', ()=> {
    let token;
    let userId;

    let existingId = null;

    before(function(done) {
        chai.request(server)
            .post('/api/login')
            .send({
                'email': 'jsmit@server.nl',
                'password': 'secret'
            })
            .end(function(err, res) {
                token = res.body.token;

                auth.decodeToken(token, (err, payload) => {
                    userId = payload.sub
                });

                done();
            });
    });
    it('Should return a dormitory object and status 200', (done) => {
        // qet an existing id out of the database
        db.query("SELECT MAX(ID) AS ID FROM studentenhuis", [], (err, result) => {
            existingId = result[0]["ID"];

            chai.request(server)
                .put('/api/studentenhuis/' + existingId)
                .set('X-Access-Token', token)
                .send({
                    "naam": "name-unittest",
                    "adres": "address-unittest"
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');

                    // get dormitories in database to check length of dormitories
                    db.query("SELECT * FROM view_studentenhuis WHERE ID = ?", [existingId], (err, result) => {
                        result = result[0];

                        res.body.should.have.property("ID").eql(result["ID"]);
                        res.body.should.have.property("naam").eql(result["Naam"]);
                        res.body.should.have.property("adres").eql(result["Adres"]);
                        res.body.should.have.property("contact").eql(result["Contact"]);
                        res.body.should.have.property("email").eql(result["Email"]);
                    });
                    done();
                });
        });
    });
    it("Should give an error when dont send a token", (done) => {
        chai.request(server)
            .put('/api/studentenhuis/0')
            .end((err, res) => {
                res.should.have.status(401);
                res.body.should.have.property('message').eql('Not authorised');
                res.body.should.have.property('code').eql(401);
                done();
            });
    });
    it('Should return statuscode 404 with error message when sending a code which don\'t exist', (done) => {
        chai.request(server)
            .put('/api/studentenhuis/0')
            .set('X-Access-Token', token)
            .send({
                "naam": "name-unittest",
                "adres": "address-unittest"
            })
            .end((err, res) => {
                res.should.have.status(404);
                res.body.should.be.a('object');

                res.body.should.have.property("message").eql("This home does not exist");
                res.body.should.have.property("code").eql(404);

                done();
            })
    });
    it('Should return statuscode 412 with error message when don\'t sending name', (done) => {
        chai.request(server)
            .put('/api/studentenhuis/' + existingId)
            .set('X-Access-Token', token)
            .send({
                "adres": "unittest-address"
            })
            .end((err, res) => {
                res.should.have.status(412);
                res.body.should.be.a('object');

                res.body.should.have.property("message").eql("The name must be provided");
                res.body.should.have.property("code").eql(412);

                done();
            })
    });
    it('Should return statuscode 412 with error message when don\'t sending address', (done) => {
        chai.request(server)
            .put('/api/studentenhuis/' + existingId)
            .set('X-Access-Token', token)
            .send({
                "naam": "unittest-name"
            })
            .end((err, res) => {
                res.should.have.status(412);
                res.body.should.be.a('object');

                res.body.should.have.property("message").eql("The address must be provided");
                res.body.should.have.property("code").eql(412);

                done();
            })
    });
    it('Should return statuscode 409 with error message when trying to update without be authorized', (done) => {
        db.query("SELECT MAX(ID) AS ID FROM studentenhuis WHERE UserID <> ?", [userId], (err, result) => {
            chai.request(server)
                .put('/api/studentenhuis/' + result[0]["ID"])
                .set('X-Access-Token', token)
                .send({
                    "naam": "unittest-name",
                    "adres": "unittest-address"
                })
                .end((err, res) => {
                    res.should.have.status(409);
                    res.body.should.be.a('object');

                    res.body.should.have.property("message").eql("You could not edit this data");
                    res.body.should.have.property("code").eql(409);

                    done();
                })
        });
    });
});
describe('Delete a dormitory', ()=> {
    let token;
    let userId;

    let existingId = null;

    before(function(done) {
        chai.request(server)
            .post('/api/login')
            .send({
                'email': 'jsmit@server.nl',
                'password': 'secret'
            })
            .end(function(err, res) {
                token = res.body.token;

                auth.decodeToken(token, (err, payload) => {
                    userId = payload.sub
                });

                done();
            });
    });
    it('Should return a dormitory object and status 200', (done) => {
        // qet an existing id out of the database
        db.query("SELECT MAX(ID) AS ID FROM studentenhuis", [], (err, result) => {
            existingId = result[0]["ID"];

            chai.request(server)
                .delete('/api/studentenhuis/' + existingId)
                .set('X-Access-Token', token)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object').eql({});

                    done();
                });
        });
    });
    it("Should give an error when dont send a token", (done) => {
        chai.request(server)
            .delete('/api/studentenhuis/0')
            .end((err, res) => {
                res.should.have.status(401);
                res.body.should.have.property('message').eql('Not authorised');
                res.body.should.have.property('code').eql(401);
                done();
            });
    });
    it('Should return statuscode 404 with error message when sending a code which don\'t exist', (done) => {
        chai.request(server)
            .delete('/api/studentenhuis/0')
            .set('X-Access-Token', token)
            .send({
                "naam": "name-unittest",
                "adres": "address-unittest"
            })
            .end((err, res) => {
                res.should.have.status(404);
                res.body.should.be.a('object');

                res.body.should.have.property("message").eql("This home does not exist");
                res.body.should.have.property("code").eql(404);

                done();
            })
    });
    it('Should return statuscode 409 with error message when trying to update without be authorized', (done) => {
        db.query("SELECT MAX(ID) AS ID FROM studentenhuis WHERE UserID <> ?", [userId], (err, result) => {
            chai.request(server)
                .delete('/api/studentenhuis/' + result[0]["ID"])
                .set('X-Access-Token', token)
                .end((err, res) => {
                    res.should.have.status(409);
                    res.body.should.be.a('object');

                    res.body.should.have.property("message").eql("You could not delete this data");
                    res.body.should.have.property("code").eql(409);

                    done();
                })
        });
    });
});