import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../src/index';

// Configure chai
chai.use(chaiHttp);
chai.should();

const request = chai.request(app)

export {
  chai,
  request
}