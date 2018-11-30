const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');

chai.should();

chai.use(chaiHttp);

describe('Thread routes', () => {

  var threadId1;
  var threadId2;

  var userId1;
  var userId2;


  before((done) => {
    chai.request(server)
      .post('/user')
      .send({ username: 'Tester1', password: 'Tester1' })
      .end((err, res) => {
        userId1 = res.body._id;
        chai.request(server)
          .post('/user')
          .send({ username: 'Tester2', password: 'Tester2' })
          .end((err, res) => {
            userId2 = res.body._id;
            chai.request(server)
            .post('/friend')
            .send({friend1 : "Tester1", friend2: "Tester2"})
            .end((err, res) => { 
              done()});
          });
      });
  });

  after((done) => {
    chai.request(server)
      .delete('/user')
      .send({ username: 'Tester1', password: 'Tester1' })
      .end(() => {
        chai.request(server)
          .delete('/user')
          .send({ username: 'Tester2', password: 'Tester2' })
          .end(() => {
            chai.request(server)
              .delete('/thread/' + threadId2)
              .end(() => {
                chai.request(server)
                .delete('/friend')
                .send({friend1 : "Tester1", friend2: "Tester2"})
                .end((err, res) => { 
                  done();
                });
              });
          });
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


        threadId1 = res.body._id;

        done();
      })
  });

  it('Should get threads', (done) => {
    chai.request(server)
      .get('/thread')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('array');

        res.body[0].should.have.property('upvotes');
        res.body[0].should.have.property('downvotes');
        res.body[0].should.not.have.property('comments');
        res.body[0].should.have.property('username');
        res.body[0].should.have.property('content');
        res.body[0].should.have.property('title');
        done();
      })
  });

  it('Should get threads sorted on upvotes', (done) => {
    chai.request(server)
      .post('/thread')
      .send({ username: "Tester2", title: "First", content: "test" })
      .end((err, res) => {
        threadId2 = res.body._id;
        chai.request(server)
          .post('/thread/upvote/' + res.body._id)
          .send({ username: "Tester1" }).end(() => {
            chai.request(server)
              .get('/thread/upvotes')
              .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('array');

                res.body[0].should.have.property('upvotes').least(res.body[1].upvotes);
                res.body[0].should.have.property('downvotes');
                res.body[0].should.not.have.property('comments');
                res.body[0].should.have.property('username');
                res.body[0].should.have.property('content');
                res.body[0].should.have.property('title');
                done();
              })
          })
      });
  });
  

  it('Should get threads sorted on karma', (done) => {
    chai.request(server)
      .post('/thread/downvote/' + threadId2)
      .send({ username: "Tester2" }).end(() => {
        chai.request(server)
          .get('/thread/karma')
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('array');

            res.body[0].should.have.property('upvotes');
            res.body[0].should.have.property('downvotes');
            res.body[0].should.not.have.property('comments');
            res.body[0].should.have.property('username');
            res.body[0].should.have.property('content');
            res.body[0].should.have.property('title');
            res.body[0].should.have.property('karma').eql(res.body[0].upvotes - res.body[0].downvotes).least(res.body[1].karma);

            done();
          })
      });
  });

  it('Should get threads sorted on comments', (done) => {
    chai.request(server)
      .get('/thread/comments')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('array');

        res.body[0].should.have.property('upvotes');
        res.body[0].should.have.property('downvotes');
        res.body[0].should.have.property('comments');
        res.body[0].should.have.property('username');
        res.body[0].should.have.property('content');
        res.body[0].should.have.property('title');
        done();
      });
  });

  it('Should get threads based on friends', (done) => {
    chai.request(server)
    .get('/thread/friend/Tester1/2')
    .end((err, res) => {
      res.should.have.status(200);
      res.body.should.be.an('array');

      res.body[0].should.have.property('upvotes');
      res.body[0].should.have.property('downvotes');
      res.body[0].should.not.have.property('comments');
      res.body[0].should.have.property('username');
      res.body[0].should.have.property('content').eql('test');
      res.body[0].should.have.property('title').eql('First');
      done();
    });
  });

  it('Should get one thread', (done) => {
    chai.request(server)
      .get('/thread/' + threadId1)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');

        res.body.should.have.property('upvotes').eql(0);
        res.body.should.have.property('downvotes').eql(0);
        res.body.should.have.property('comments');
        res.body.should.have.property('username');
        res.body.should.have.property('content').eql('test');
        res.body.should.have.property('title').eql('test');
        done();
      })
  });

  it('Should return thread object when upvoting', (done) => {
    chai.request(server)
      .post('/thread/upvote/' + threadId1)
      .send({ username: "Tester1" })
      .end((err, res) => {
        res.should.have.status(200);

        res.body.should.have.property('upvotes').include(userId1);
        res.body.should.have.property('downvotes').not.include(userId1);
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
      .post('/thread/downvote/' + threadId1)
      .send({ username: "Tester1" })
      .end((err, res) => {
        res.should.have.status(200);

        res.body.should.have.property('upvotes').not.include(userId1);
        res.body.should.have.property('downvotes').include(userId1);
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
      .put('/thread/' + threadId1)
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
      .delete('/thread/' + threadId1)
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