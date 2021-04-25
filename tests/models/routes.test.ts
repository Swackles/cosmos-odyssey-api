import { Routes, Planets, Imports } from '../../src/models'
import { expect } from 'chai'
import Pool from '../../src/lib/db'
import Faker, { date } from 'faker'

describe('Routes model', function () {
  describe('#constructor', function () {
    describe('when input id is not a number', function () {
      it('creates a new instance of object', function (done) {
        const data = {
          id: Faker.datatype.uuid(),
          distance: Faker.datatype.number()
        }
        const refData = {
          legRef: Faker.datatype.uuid(),
          importsId: Faker.datatype.number(),
          originId: Faker.datatype.number(),
          destId: Faker.datatype.number()
        }
        const result = expect(new Routes(data, refData))

        result.to.have.property('ref').that.eq(data.id)
        result.to.have.property('distance').that.eq(data.distance)
        result.to.have.property('legRef').that.eq(refData.legRef)
        result.to.have.property('importsId').that.eq(refData.importsId)
        result.to.have.property('originId').that.eq(refData.originId)
        result.to.have.property('destId').that.eq(refData.destId)
        result.to.not.have.property('id')

        done()
      })
    })
    describe('when input id is a number', function () {
      it('creates a new instance of object', function (done) {
        const data = {
          id: Faker.datatype.number(),
          ref: Faker.datatype.uuid(),
          distance: Faker.datatype.number(),
          leg_ref: Faker.datatype.uuid(),
          imports_id: Faker.datatype.number(),
          origin_id: Faker.datatype.number(),
          dest_id: Faker.datatype.number()
        }
        const result = expect(new Routes(data))

        result.to.have.property('ref').that.eq(data.ref)
        result.to.have.property('distance').that.eq(data.distance)
        result.to.have.property('legRef').that.eq(data.leg_ref)
        result.to.have.property('importsId').that.eq(data.imports_id)
        result.to.have.property('originId').that.eq(data.origin_id)
        result.to.have.property('destId').that.eq(data.dest_id)
        result.to.have.property('id').that.eq(data.id)

        done()
      })
    })
  })
  describe('.findShortestRoute', function () {
    it('returns route when origin is Earth and destination is jupiter', function (done) {
      const result = Routes.findShortestRoute('Earth', 'Jupiter')
      expect(result).to.deep.eq([['Earth', 'Jupiter']])

      done()
    })
    it('returns route when origin is Mercury and destination is Neptune', function (done) {
      const result = Routes.findShortestRoute('Mercury', 'Neptune')
      expect(result).to.deep.eq([['Mercury', 'Venus', 'Earth', 'Uranus', 'Neptune']])

      done()
    })
    it('returns route when origin is Mars and destination is Mercury', function (done) {
      const result = Routes.findShortestRoute('Mars', 'Mercury')
      expect(result).to.deep.eq([['Mars', 'Venus', 'Mercury']])

      done()
    })
    it('returns route when origin is Saturn and destination is Uranus', function (done) {
      const result = Routes.findShortestRoute('Saturn', 'Uranus')
      expect(result).to.deep.eq([['Saturn', 'Earth', 'Uranus'], ['Saturn', 'Neptune', 'Uranus']])

      done()
    })
  })
  describe('#save', function() {
    it('inserts to the database', async function () {
      const client = await Pool.connect()

      const importListing = await new Imports({
        id: Faker.datatype.uuid(),
        validUntil: Faker.date.soon()
      }).save(client)

      const planetOrigin = await new Planets({
        id: Faker.datatype.uuid(),
        name: Faker.name.firstName()
      }, importListing.id).save(client)

      const planetDest = await new Planets({
        id: Faker.datatype.uuid(),
        name: Faker.name.firstName()
      }, importListing.id).save(client)

      const result = await new Routes({
        id: Faker.datatype.uuid(),
        distance: Faker.datatype.number()
      }, {
        legRef: Faker.datatype.uuid(),
        importsId: importListing.id,
        originId: planetOrigin.id,
        destId: planetDest.id
      }).save(client)

      expect(result).to.have.property('id').that.be.an('number')

      await client.query('ROLLBACK')
    })
  })
})
