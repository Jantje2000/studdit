const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');

chai.should();

chai.use(chaiHttp);

describe('Comment routes', () => {

    let id = null;
    let commentId = null;

    before((done) => {
        chai.request(server)
            .post('/user')
            .send({ username: 'Tester1', password: 'Tester1' })
            .then(() => {
                chai.request(server)
                    .post('/thread')
                    .send({ username: 'Tester1', title: 'Test', content: "Dit is een testje van mij" })
                    .end((err, res) => {
                        id = res.body._id.toString();

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
                    .delete('/thread/' + id)
                    .end(() => {
                        done();
                    });
            });
    });

    it('Should add comment to thread', (done) => {
        chai.request(server)
            .post('/comment/' + id)
            .send({ username: "Tester1", content: "test" })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('object');

                res.body.should.have.property('upvotes').eql([]);
                res.body.should.have.property('downvotes').eql([]);
                res.body.should.have.property('comments').eql([]);
                res.body.should.have.property('user');
                res.body.should.have.property('content').eql('test');

                commentId = res.body._id;

                done();
            })
    });

    it('Should return Wrong post body when not sending correct data', (done) => {
        chai.request(server)
            .post('/comment/' + id)
            .send()
            .end((err, res) => {
                res.should.have.status(200);

                res.body.should.be.eql({});

                done();
            })
    });

    it('Should return comment object when upvoting', (done) => {
        chai.request(server)
            .post('/comment/upvote/' + commentId)
            .send({ username: "Tester1" })
            .end((err, res) => {
                res.should.have.status(200);

                res.body.should.have.property('upvotes').an('array');
                res.body.should.have.property('downvotes').an('array');
                res.body.should.have.property('comments').an('array');
                res.body.should.have.property('_id');
                res.body.should.have.property('content');
                res.body.should.have.property('user');

                done();
            })
    });

    it('Should return comment object when downvoting', (done) => {
        chai.request(server)
            .post('/comment/downvote/' + commentId)
            .send({ username: "Tester1" })
            .end((err, res) => {
                res.should.have.status(200);

                res.body.should.have.property('upvotes').an('array');
                res.body.should.have.property('downvotes').an('array');
                res.body.should.have.property('comments').an('array');
                res.body.should.have.property('_id');
                res.body.should.have.property('content');
                res.body.should.have.property('user');

                done();
            })
    });
});