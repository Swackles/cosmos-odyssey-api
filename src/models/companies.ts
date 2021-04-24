import { PoolClient } from "pg"

class Companies {
  id: number
  name: string
  ref: string
  importsId: number

  constructor(input: any, importId: number = null) {
    if (isNaN(input.id)) {
      this.ref = input.id
      this.name = input.name
      this.importsId = importId
    } else {
      this.id = input.id
      this.name = input.name
      this.ref = input.ref
      this.importsId = input.imports_id
    }
  }

  async save(client: PoolClient): Promise<Companies> {
    // Check if already exists in the databse
    let query = 'SELECT * FROM companies WHERE name = $1 AND ref = $2'

    let res = await client.query(query, [this.name, this.ref])

    if (res.rows.length > 0) return new Companies(res.rows[0]) // If planet already exists, return it

    query = 'INSERT INTO companies (name, ref, imports_id) VALUES($1, $2, $3) RETURNING *;'

    res = await client.query(query, [this.name, this.ref, this.importsId])

    this.id = res.rows[0].id
    return this;
  }
}

export default Companies
