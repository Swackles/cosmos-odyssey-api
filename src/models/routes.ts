import { PoolClient } from "pg"

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

  static findShortestRoute(origin: string, dest: string): string[][] {

    return Routes.findNext([origin], dest, [])
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

  async save(client: PoolClient): Promise<Routes> {
    const query = 'INSERT INTO routes (ref, leg_ref, distance, imports_id, origin_id, dest_id) VALUES($1, $2, $3, $4, $5, $6) RETURNING *;'

    const res = await client.query(query, [this.ref, this.legRef, this.distance, this.importsId, this.originId, this.destId])

    this.id = res.rows[0].id
    return this;
  }
}

export default Routes
