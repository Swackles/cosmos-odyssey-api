import { PoolClient } from "pg"
import Pool from './../lib/db'
import { Providers } from './'

interface References {
  importsId: number,
  originId: number,
  destId: number,
  legRef: string
}

class Routes {
  id: number
  ref: string
  legRef: string
  distance: number
  importsId: number
  originId: number
  destId: number
  origin: string
  destination: string

  constructor(input: any, ref: References = null) {
    if (isNaN(input.id)) {
      this.ref = input.id
      this.distance = input.distance
      
      this.legRef = ref.legRef
      this.importsId = ref.importsId
      this.originId = ref.originId
      this.destId = ref.destId
    } else {
      this.id = input.id
      this.ref = input.ref
      this.distance = input.distance
      this.legRef = input.leg_ref
      this.importsId = input.imports_id
      this.originId = input.origin_id
      this.destId = input.dest_id
      this.origin = input.origin
      this.destination = input.dest
    }
  }

  static async findRoutes(origin: string, dest: string): Promise<Routes[][]> {
    let allRoutes =  Routes.findNext([origin], dest, [])
    let results: Routes[][] = []

    for (const routes of allRoutes) {
      let result: Routes[] = []

      for (let i = 0; i < routes.length - 1; i++) {
        result.push(await Routes.find(routes[i], routes[i + 1]))
      }

      results.push(result)
    }

    return results
  }
  
  async findProviders(start: Date): Promise<Providers[]> {
    let query = `
      SELECT providers.*, origin.name AS origin, dest.name AS destination, routes.distance AS distance FROM providers
        LEFT JOIN imports ON providers.imports_id = imports.id
        LEFT JOIN routes ON providers.routes_id = routes.id
        LEFT JOIN planets as origin ON routes.origin_id = origin.id
        LEFT JOIN planets as dest ON routes.dest_id = dest.id
      WHERE imports.deleted_at > CURRENT_TIMESTAMP
        AND providers.routes_id = $1`

    let params: any[] = [this.id]
    if (start != null) {
      query += " AND providers.start_time = $2"
      params.push(start)
    }

    const client = await Pool.connect()
    const res = await client.query(query, params)
    
    const results = []


    for (const row of res.rows) {
      results.push(new Providers(row))
    }


    client.release()

    return results
  }

  private static findNext(path: string[], dest: string, visitedPlanets: string[]): string[][] {
    const planetRoutes = {
      'Mercury': ['Venus'],
      'Venus': ['Mercury', 'Earth'],
      'Earth': ['Jupiter', 'Uranus'],
      'Mars': ['Venus'],
      'Jupiter': ['Venus', 'Mars'],
      'Saturn': ['Earth', 'Neptune'],
      'Uranus': ['Saturn', 'Neptune'],
      'Neptune': ['Mercury', 'Uranus']
    }

    let nextPaths: string[] = []

    for (const planet of (planetRoutes as any)[path[path.length - 1]]) {
      if (planet == dest) return [[...path, planet]]
      // If planet was already visited, it means we're going to run in a circle
      else if (visitedPlanets.indexOf(planet) == -1) nextPaths.push(planet) 
    }

    visitedPlanets = [...path, ...visitedPlanets, ...nextPaths].filter((x, i, a) => a.indexOf(x) == i)

    let possibleRoutes = []

    // if no matches found, move on
    for (const next of nextPaths) {
      const results = Routes.findNext([...path, next], dest, visitedPlanets)
      for (const res of results) {
        if (res[res.length - 1] == dest) possibleRoutes.push(res)
      }
    }
    
    return possibleRoutes;
  }

  static async find(origin: string, dest: string): Promise<Routes> {
    
    const query = `
      SELECT routes.*, origin.name as origin, dest.name as dest FROM routes
        LEFT JOIN imports ON routes.imports_id = imports.id
        LEFT JOIN planets as origin ON routes.origin_id = origin.id
        LEFT JOIN planets as dest ON routes.dest_id = dest.id
      WHERE imports.deleted_at > CURRENT_TIMESTAMP
        AND LOWER(origin.name) = LOWER($1)
        AND LOWER(dest.name) = LOWER($2)
      LIMIT 1`

    const client = await Pool.connect()

    const res = await client.query(query, [origin, dest])

    if (res.rows.length > 0)
      return new Routes(res.rows[0])
    else
      return null
  }

  async save(client: PoolClient): Promise<Routes> {
    const query = 'INSERT INTO routes (ref, leg_ref, distance, imports_id, origin_id, dest_id) VALUES($1, $2, $3, $4, $5, $6) RETURNING *;'

    const res = await client.query(query, [this.ref, this.legRef, this.distance, this.importsId, this.originId, this.destId])

    this.id = res.rows[0].id
    return this;
  }
}

export default Routes
