import { PoolClient } from "pg"
import Routes from "./routes"

interface References {
  importsId: number,
  routesId: number,
  companiesId: number
}

class Providers {
  id: number
  ref: string
  price: number
  distance: number
  startTime: Date
  endTime: Date
  importsId: number
  routesId: number
  companiesId: number
  origin: string
  destination: string
  company: string


  constructor(input: any, ref: References = null) {
    if (isNaN(input.id)) {
      this.ref = input.id
      this.price = input.price
      this.startTime = new Date(input.flightStart)
      this.endTime = new Date(input.flightEnd)

      this.importsId = ref.importsId
      this.routesId = ref.routesId
      this.companiesId = ref.companiesId
    } else {
      this.id = input.id
      this.ref = input.ref
      this.price = input.price
      this.distance = input.distance
      this.startTime = input.start_time 
      this.endTime = input.end_time
      this.importsId = input.imports_id
      this.routesId = input.routes_id
      this.companiesId = input.companies_id
      this.origin = input.origin
      this.destination = input.destination
      this.company = input.company
    }
  }

  static async findProviders(routes: Routes[], companyName: string): Promise<Providers[][]> {
    return await this.findNext([], 0, routes)
  }

  private static async findNext(path: Providers[], routeId: number, routes: Routes[]): Promise<Providers[][]> {
    const lastProvider = path[path.length - 1]

    let providers = await routes[routeId].findProviders(lastProvider?.endTime || null)

    if (providers.length == 0) return []

    let results: Providers[][] = []    

    for (const provider of providers) {
      if (routes.length - 1 == routeId) results.push([...path, provider])
      else {
        const res = await Providers.findNext([...path, provider], routeId + 1, routes)
        results = [...results, ...res]
      }
    }

    return results
  }

  async save(client: PoolClient): Promise<Providers> {
    const query = 'INSERT INTO providers (ref, price, start_time, end_time, imports_id, routes_id, companies_id) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *;'

    const res = await client.query(query, [this.ref, this.price, this.startTime, this.endTime, this.importsId, this.routesId, this.companiesId])

    this.id = res.rows[0].id
    return this;
  }
}

export default Providers
