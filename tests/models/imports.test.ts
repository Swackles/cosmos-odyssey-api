import { Imports } from './../../src/models'
import { expect } from 'chai'
import Pool from './../../src/lib/db'
import Faker from 'faker'

describe('Imports model', function () {
  describe('#constructor', function () {
    describe('when input id is not a number', function () {
      it('creates a new instance of object', function (done) {
        const data = {
          id: Faker.datatype.uuid(),
          validUntil: Faker.date.soon().toString()
        }

        const result = expect(new Imports(data))

        result.to.have.property('ref').that.eq(data.id)
        result.to.have.property('deletedAt').that.deep.eq(new Date(data.validUntil))
        result.to.have.property('createdAt').that.be.an('date')
        result.to.not.have.property('id')

        done()
      })
    })
    describe('when input id is a number', function () {
      it('creates a new instance of object', function (done) {
        const data = {
          id: Faker.datatype.number(),
          ref: Faker.datatype.uuid(),
          deleted_at: Faker.date.recent(),
          created_at: Faker.date.soon()
        }

        const result = expect(new Imports(data))

        result.to.have.property('ref').that.eq(data.ref)
        result.to.have.property('deletedAt').that.deep.eq(data.deleted_at)
        result.to.have.property('createdAt').that.deep.eq(data.created_at)
        result.to.have.property('id').that.eq(data.id)

        done()
      })
    })
  })
  describe('#save', function() {
    it('inserts to the database', async function () {
      const client = await Pool.connect()
      const data = {
        id: Faker.datatype.uuid(),
        validUntil: Faker.date.soon().toString()
      }

      const result = await new Imports(data).save(client)

      expect(result).to.have.property('id').that.be.an('number')
      
      await client.query('ROLLBACK')
    })
  })
})