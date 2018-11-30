const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');

chai.should();

chai.use(chaiHttp);

describe('Non-existent endpoint', () => {
    it('Should give an error when a path doesn\'t exist', (done) => {
        chai.request(server)
            .get('')
            .end((err, res) => {
                res.should.have.status(404);
                res.body.should.have.property('error').eql('This endpoint does not exist');
                done();
            })
    })
});