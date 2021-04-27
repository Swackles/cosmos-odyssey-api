import { PoolClient } from 'pg'
import { Routes, Providers } from './'

interface Filters {
  companyName: string | null,
  dest: string,
  origin: string
}

class PriceListings {
  id: number
  providers: Providers[]
  price: number
  startTime: Date
  endTime: Date
  origin: string
  dest: string
  distance: string
  deletedAt: Date

  constructor(origin: string | any, dest: string = null) {
    if (typeof origin === 'string' && dest != null) {
      this.origin = origin
      this.dest = dest
      this.providers = []
      this.price = 0
      this.distance = '0'
      this.startTime = null
      this.endTime = null
    } else {
      this.id = origin.id
      this.providers = []
      this.origin = origin.origin
      this.dest = origin.dest
      this.price = origin.price
      this.distance = origin.distance
      this.startTime = origin.start_time
      this.endTime = origin.end_time
      this.deletedAt = origin.deleted_at
    }
  }

  add(provider: Providers) {
    this.providers.push(provider)

    this.distance = (BigInt(this.distance) + BigInt(provider.distance)).toString()
    this.price += provider.price

    if (this.startTime == null || this.startTime > provider.startTime)
      this.startTime = provider.startTime

    if (this.endTime == null || this.endTime < provider.endTime)
      this.endTime = provider.endTime
  }

  static async findAll(filters: Filters): Promise<PriceListings[]> {
    const possibleRoutes = await Routes.findRoutes(filters.origin, filters.dest)
    let results: PriceListings[] = []

    for (const routes of possibleRoutes) {
      let providerRoutes = await Providers.findProviders(routes, filters.companyName)
      
      for (const providers of providerRoutes) {
        let pl = new PriceListings(filters.origin, filters.dest);

        for (const provider of providers) pl.add(provider)
        results.push(pl)
      }
    }

    return results
  }

  static async prune(client: PoolClient) {
    await client.query(`DELETE FROM public.price_listings WHERE id NOT IN(
      SELECT price_listings.id FROM price_listings LEFT JOIN reservations on reservations.price_listing_id = price_listings.id WHERE reservations.id IS NULL order by id desc LIMIT 15);`)
  }

  static async save(inputs: PriceListings[], client: PoolClient): Promise<PriceListings[]> {
    await PriceListings.prune(client)

    const priceListings: PriceListings[] = []
    for (const input of inputs) priceListings.push(await input.save(client))


    return priceListings
  }

  static async find(id: number, client: PoolClient): Promise<PriceListings | null> {   
    const query =  `
      SELECT MIN(imports.deleted_at) FROM providers
        LEFT JOIN imports ON providers.imports_id = imports.id
        WHERE providers.id IN (SELECT providers_id FROM providers_in_price_listings WHERE price_listings_id = price_listings.id)`

    let res = await client.query(`
      SELECT
        price_listings.*,
		    (${query}) as deleted_at
	    FROM price_listings
        WHERE (${query}) > CURRENT_TIMESTAMP
          AND price_listings.id = $1
        `, [id])
    if (res.rows.length == 0) return null    
    
    let priceListings = new PriceListings(res.rows[0])

    res = await client.query(`
      SELECT providers.*, origin.name AS origin, dest.name AS destination, routes.distance AS distance, companies.name AS company FROM providers
        LEFT JOIN imports ON providers.imports_id = imports.id
        LEFT JOIN routes ON providers.routes_id = routes.id
        LEFT JOIN planets as origin ON routes.origin_id = origin.id
        LEFT JOIN planets as dest ON routes.dest_id = dest.id
        LEFT JOIN companies ON companies.id = providers.companies_id
      WHERE imports.deleted_at > CURRENT_TIMESTAMP
        AND providers.id in (SELECT providers_id FROM providers_in_price_listings WHERE price_listings_id = $1)`, [priceListings.id])

    for (const response of res.rows) {
      priceListings.providers.push(new Providers(response))
    }

    return priceListings
  }

  async getID(client: PoolClient): Promise<number | null> {
    if (this.id != null) return this.id

    let query = `
      SELECT price_listings.* FROM price_listings
      WHERE (
        SELECT MIN(imports.deleted_at) FROM providers
          LEFT JOIN imports ON providers.imports_id = imports.id
          WHERE providers.id IN (SELECT providers_id FROM providers_in_price_listings WHERE price_listings_id = price_listings.id)
      ) > CURRENT_TIMESTAMP
        AND origin = $1
        AND dest = $2
        AND price = $3
        AND distance = $4
        AND start_time = $5
        AND end_time = $6`

    const params = [this.origin, this.dest, this.price, this.distance, this.startTime, this.endTime]

    let res = await client.query(query, params)

    if (res.rows.length > 0) return res.rows[0].id
    else return null
  }

  async save(client: PoolClient): Promise<PriceListings> {
    const id = await this.getID(client)
    if (id != null) { this.id = id; return this }

    let query = `INSERT INTO price_listings
      (origin, dest, price, distance, start_time, end_time)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;`

      let res = await client.query(query, [this.origin, this.dest, this.price, this.distance, this.startTime, this.endTime])

    this.id = res.rows[0].id

    if (this.providers.length > 0) {
      const providerIds = this.providers.map(x => x.id)

      let query = `INSERT INTO providers_in_price_listings (price_listings_id, providers_id) VALUES `
      let data = []

      for (const providerId of providerIds) {
        query += `($${data.length + 1}, $${data.length + 2})`
        data.push(this.id)
        data.push(providerId)
      }

      await client.query(query, data)
    }

    return this
  }
}

export default PriceListings
