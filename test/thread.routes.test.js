const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');

chai.should();

chai.use(chaiHttp);

describe('Thread routes', () => {

  var threadId;
  var userId;

  before((done) => {
    chai.request(server)
      .post('/user')
      .send({ username: 'Tester1', password: 'Tester1' })
      .end((err, res) => {
        userId = res.body._id;
        done();
      });
  });

  after((done) => {
    chai.request(server)
      .delete('/user')
      .send({ username: 'Tester1', password: 'Tester1' })
      .end(() => {
        done();
      });
  });

  it('Should add thread', (done) => {
    chai.request(server)
      .post('/thread')
      .send({ username: "Tester1", title: "test", content: "test" })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');

        res.body.should.have.property('upvotes').eql([]);
        res.body.should.have.property('downvotes').eql([]);
        res.body.should.have.property('comments').eql([]);
        res.body.should.have.property('user');
        res.body.should.have.property('content').eql('test');
        res.body.should.have.property('title').eql('test');


        threadId = res.body._id;

        done();
      })
  });

  it('Should get threads', (done) => {
    chai.request(server)
      .get('/thread')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('array');

        res.body[0].should.have.property('upvotes').eql(0);
        res.body[0].should.have.property('downvotes').eql(0);
        res.body[0].should.not.have.property('comments');
        res.body[0].should.have.property('username');
        res.body[0].should.have.property('content').eql('test');
        res.body[0].should.have.property('title').eql('test');
        done();
      })
  });

  it('Should return thread object when upvoting', (done) => {
    chai.request(server)
      .post('/thread/upvote/' + threadId)
      .send({ username: "Tester1" })
      .end((err, res) => {
        res.should.have.status(200);

        res.body.should.have.property('upvotes').include(userId);
        res.body.should.have.property('downvotes').not.include(userId);
        res.body.should.have.property('comments').an('array');
        res.body.should.have.property('_id');
        res.body.should.have.property('content');
        res.body.should.have.property('user');
        res.body.should.have.property('title').eql('test');


        done();
      })
  });

  it('Should return thread object when downvoting', (done) => {
    chai.request(server)
      .post('/thread/downvote/' + threadId)
      .send({ username: "Tester1" })
      .end((err, res) => {
        res.should.have.status(200);

        res.body.should.have.property('upvotes').not.include(userId);
        res.body.should.have.property('downvotes').include(userId);
        res.body.should.have.property('comments').an('array');
        res.body.should.have.property('_id');
        res.body.should.have.property('content');
        res.body.should.have.property('user');
        res.body.should.have.property('title').eql('test');


        done();
      })
  });

  it('Should return thread object when editing', (done) => {
    chai.request(server)
      .put('/thread/' + threadId)
      .send({ content: "nieuwe content" })
      .end((err, res) => {
        res.should.have.status(200);

        res.body.should.have.property('upvotes');
        res.body.should.have.property('downvotes');
        res.body.should.have.property('comments').an('array');
        res.body.should.have.property('_id');
        res.body.should.have.property('content').eql("nieuwe content");
        res.body.should.have.property('user');

        done();
      })
  });

  it('Should return thread object when deleting', (done) => {
    chai.request(server)
      .delete('/thread/' + threadId)
      .end((err, res) => {
        res.should.have.status(200);

        res.body.should.have.property('upvotes');
        res.body.should.have.property('downvotes');
        res.body.should.have.property('comments').an('array');
        res.body.should.have.property('_id');
        res.body.should.have.property('content');
        res.body.should.have.property('user');

        done();
      })
  });
});