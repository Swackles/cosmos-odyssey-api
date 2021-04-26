import { PoolClient } from "pg"
import Pool from './../lib/db'
import { PriceListings } from "."
import pool from "./../lib/db"

class Reservations {
  id: number
  priceListingId: number
  firstName: string
  lastName: string
  priceListing: PriceListings
  deletedAt: Date

  constructor(input: any) {
    this.id = input.id || null
    this.priceListingId = input.price_listing_id || input.priceListingId
    this.firstName = input.first_name || input.firstName
    this.lastName = input.last_name || input.lastName
    this.priceListing = input.priceList || null
    this.deletedAt = input.deleted_at || input.deletedAt || null
  }

  static async findAll(): Promise<Reservations[]> {
    const client = await pool.connect()

    let results = await client.query('SELECT * FROM reservations WHERE deleted_at > CURRENT_TIMESTAMP')
    let reservations: Reservations[] = []

    for (const res of await results.rows) {
      let reservation = new Reservations(res)
        reservation.priceListing = await PriceListings.find(reservation.priceListingId, client)

        reservations.push(reservation)
    }

    client.release()
    return reservations
  }

  async save(client: PoolClient): Promise<Reservations> {
    let res = await client.query(`INSERT INTO reservations (first_name, last_name, price_listing_id, deleted_at) VALUES ($1, $2, $3, $4) RETURNING *`,
                                  [this.firstName, this.lastName, this.priceListingId, this.deletedAt])

    this.id = res.rows[0].id

    return this
  }  
}

export default Reservations