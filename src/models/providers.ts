import { PoolClient } from "pg"

interface References {
  importsId: number,
  routesId: number,
  companiesId: number
}

class Providers {
  id: number
  ref: string
  price: number
  startTime: Date
  endTime: Date
  importsId: number
  routesId: number
  companiesId: number

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
      this.startTime = input.start_time 
      this.endTime = input.end_time
      this.importsId = input.imports_id
      this.routesId = input.routes_id
      this.companiesId = input.companies_id
    }
  }

  async save(client: PoolClient): Promise<Providers> {
    const query = 'INSERT INTO providers (ref, price, start_time, end_time, imports_id, routes_id, companies_id) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *;'

    const res = await client.query(query, [this.ref, this.price, this.startTime, this.endTime, this.importsId, this.routesId, this.companiesId])

    this.id = res.rows[0].id
    return this;
  }
}

export default Providers
