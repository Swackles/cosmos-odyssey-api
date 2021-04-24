import axios, { AxiosResponse } from 'axios'
import { Companies, Imports, Planets, Providers, Routes } from './../models'
import Pool from './../lib/db'

async function index() {
  const res = await axios.get('https://cosmos-odyssey.azurewebsites.net/api/v1.0/TravelPrices')

  const client = await Pool.connect()
  try {
    const importData = await new Imports(res.data).save(client)

    for (const leg of res.data.legs) {
      const originPlanet = await new Planets(leg.routeInfo.from, importData.id).save(client)
      const destPlanet = await new Planets(leg.routeInfo.to, importData.id).save(client)
      const route = await new Routes(leg.routeInfo, {
        legRef: leg.id,
        importsId: importData.id,
        originId: originPlanet.id,
        destId: destPlanet.id
      }).save(client)

      for (const provider of leg.providers) {
        const company = await new Companies(provider.company, importData.id).save(client)
        await new Providers(provider, {
          importsId: importData.id,
          routesId: route.id,
          companiesId: company.id
        }).save(client)
      }
    }
  } catch (err) {
    await client.query('ROLLBACK') // TODO: Figure out why this doesn't work, neither does it work in tests
    throw err
  } finally {
    client.query('COMMIT')
    client.release()
  }
}

export default index;
