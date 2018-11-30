const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');

chai.should();

chai.use(chaiHttp);

describe('Friend routes', () => {

    before((done) => {
        chai.request(server)
            .post('/user')
            .send({ username: 'Tester1', password: 'Tester1' })
            .then(() => {
                chai.request(server)
                    .post('/user')
                    .send({ username: 'Tester2', password: 'Tester2' })
                    .end((err, res) => {
                        done();
                    });
            });
    });

    after((done) => {
        chai.request(server)
            .delete('/user')
            .send({ username: 'Tester1', password: 'Tester1' })
            .then(() => {
                chai.request(server)
                    .delete('/user')
                    .send({ username: 'Tester2', password: 'Tester2' })
                    .end(() => {
                        done();
                    });
            });
    });

    it('Should add friends', (done) => {
        chai.request(server)
            .post('/friend')
            .send({ friend1: 'Tester1', friend2: 'Tester2' })
            .end((err, res) => {
                res.should.have.status(200);

                done();
            })
    });

    it('Should 424 when frienduser is not existing', (done) => {
        chai.request(server)
            .post('/friend')
            .send({ friend1: 'notExistingUser', friend2: 'notExistingUser2' })
            .end((err, res) => {
                res.should.have.status(424);

                done();
            })
    });

    it('Should return 401 unauthorized', (done) => {
        chai.request(server)
            .delete('/friend')
            .send({ friend1: 'Tester1', friend2: 'Tester2' })
            .end((err, res) => {
                res.should.have.status(200);

                done();
            })
    });
});