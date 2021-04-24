import { Planets, Imports } from '../../src/models'
import { expect } from 'chai'
import Pool from '../../src/lib/db'
import Faker from 'faker'

describe('Planets model', function () {
  describe('#constructor', function () {
    describe('when input id is not a number', function () {
      it('creates a new instance of object', function (done) {
        const importsId = Faker.datatype.number()
        const data = {
          id: Faker.datatype.uuid(),
          name: Faker.name.findName()
        }
        const result = expect(new Planets(data, importsId))

        result.to.have.property('ref').that.eq(data.id)
        result.to.have.property('name').that.eq(data.name)
        result.to.have.property('importsId').that.eq(importsId)
        result.to.not.have.property('id')

        done()
      })
    })
    describe('when input id is a number', function () {
      it('creates a new instance of object', function (done) {
        const data = {
          id: Faker.datatype.number(),
          ref: Faker.datatype.uuid(),
          name: Faker.name.findName(),
          imports_id: Faker.datatype.number()
        }
        const result = expect(new Planets(data))

        result.to.have.property('ref').that.eq(data.ref)
        result.to.have.property('name').that.eq(data.name)
        result.to.have.property('importsId').that.eq(data.imports_id)
        result.to.have.property('id').that.eq(data.id)

        done()
      })
    })
  })
  describe('#save', function () {
    describe('when planet with ref and name does not exist', function () {
      it('inserts to the database', async function () {
        const client = await Pool.connect()

        const importListing = await new Imports({
          id: Faker.datatype.uuid(),
          validUntil: Faker.date.soon().toString()
        }).save(client)

        const result = await new Planets({
          id: Faker.datatype.uuid(),
          name: Faker.name.findName()
        }, importListing.id).save(client)

        expect(result).to.have.property('id').that.be.an('number')

        await client.query('ROLLBACK')
      })
    })
    describe('when planet with ref and name already exists', function () {
      it('selects it from the database and returns it', async function () {
        const client = await Pool.connect()

        const importListing = await new Imports({
          id: Faker.datatype.uuid(),
          validUntil: Faker.date.soon().toString()
        }).save(client)

        const data = {
          id: Faker.datatype.uuid(),
          name: Faker.name.findName()
        }

        const existing = await new Planets(data, importListing.id).save(client)

        const result = await new Planets(data, importListing.id).save(client)

        expect(result).to.have.property('id').that.eq(existing.id)

        await client.query('ROLLBACK')
      })
    })
  })
})
