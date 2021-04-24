import { Providers, Routes, Planets, Imports, Companies } from '../../src/models'
import { expect } from 'chai'
import Pool from '../../src/lib/db'
import Faker, { date } from 'faker'

describe('Providers model', function () {
  describe('#constructor', function () {
    describe('when input id is not a number', function () {
      it('creates a new instance of object', function (done) {
        const data = {
          id: Faker.datatype.uuid(),
          price: Faker.datatype.number(),
          flightStart: Faker.date.future(),
          flightEnd: Faker.date.future()
        }
        const refData = {
          importsId: Faker.datatype.number(),
          routesId: Faker.datatype.number(),
          companiesId: Faker.datatype.number()
        }

        const result = expect(new Providers(data, refData))

        result.to.have.property('ref').that.eq(data.id)
        result.to.have.property('price').that.eq(data.price)
        result.to.have.property('startTime').that.deep.eq(data.flightStart)
        result.to.have.property('endTime').that.deep.eq(data.flightEnd)
        result.to.have.property('importsId').that.eq(refData.importsId)
        result.to.have.property('routesId').that.eq(refData.routesId)
        result.to.have.property('companiesId').that.eq(refData.companiesId)
        result.to.not.have.property('id')

        done()
      })
    })
    describe('when input id is a number', function () {
      it('creates a new instance of object', function (done) {
        const data = {
          id: Faker.datatype.number(),
          ref: Faker.datatype.uuid(),
          price: Faker.datatype.number(),
          start_time: Faker.date.future(),
          end_time: Faker.date.future(),
          imports_id: Faker.datatype.number(),
          routes_id: Faker.datatype.number(),
          companies_id: Faker.datatype.number()
        }

        const result = expect(new Providers(data))

        result.to.have.property('ref').that.eq(data.ref)
        result.to.have.property('price').that.eq(data.price)
        result.to.have.property('startTime').that.eq(data.start_time)
        result.to.have.property('endTime').that.eq(data.end_time)
        result.to.have.property('importsId').that.eq(data.imports_id)
        result.to.have.property('routesId').that.eq(data.routes_id)
        result.to.have.property('companiesId').that.eq(data.companies_id)
        result.to.have.property('id').that.eq(data.id)

        done()
      })
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

      const routes = await new Routes({
        id: Faker.datatype.uuid(),
        distance: Faker.datatype.number()
      }, {
        legRef: Faker.datatype.uuid(),
        importsId: importListing.id,
        originId: planetOrigin.id,
        destId: planetDest.id
      }).save(client)

      const company = await new Companies({
        id: Faker.datatype.uuid(),
        name: Faker.company.companyName()
      }, importListing.id).save(client)

      const result = await new Providers({
        id: Faker.datatype.uuid(),
        price: Faker.datatype.number(),
        flightStart: Faker.date.future(),
        flightEnd: Faker.date.future()
      }, {
        importsId: importListing.id,
        routesId: routes.id,
        companiesId: company.id
      }).save(client)

      expect(result).to.have.property('id').that.be.an('number')

      await client.query('ROLLBACK')
    })
  })
})
