import { request } from './config'

describe('endpoints', function() {
  describe('page not found', function() {
    it('should be empty and status code 200', function(done) {

      request.post('/')
      .end((err, res) => {
        res.should.have.status(404)
        res.body.should.be.empty

        done();
      })
    })
  })
})