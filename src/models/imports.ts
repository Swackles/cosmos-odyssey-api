import { PoolClient } from "pg"

class Imports {
  id: number
  ref: string
  createdAt: Date
  deletedAt: Date

  constructor(input: any) {
    if (isNaN(input.id)) {
      this.ref = input.id
      this.createdAt = new Date()
      this.deletedAt = new Date(input.validUntil)
    } else {
      this.id = input.id
      this.ref = input.ref
      this.createdAt = input.created_at
      this.deletedAt = input.deleted_at
    }
  }

  async save(client: PoolClient): Promise<Imports> {
    const query = 'INSERT INTO imports (ref, created_at, deleted_at) VALUES( $1, $2, $3) RETURNING *;'
    const params = [this.ref, this.createdAt, this.deletedAt]

    const res = await client.query(query, params)

    this.id = res.rows[0].id

    return this;
  }
}

export default Imports
