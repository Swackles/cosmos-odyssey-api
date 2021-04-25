import { PoolClient } from "pg"

class Planets {
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

  static async findAll(client: PoolClient): Promise<Planets[]> {
    const res = await client.query('SELECT DISTINCT ON (planets.name) planets.* FROM planets LEFT JOIN imports ON planets.imports_id = imports.id WHERE imports.deleted_at > CURRENT_TIMESTAMP ORDER BY planets.name;')

    let data: Planets[] = []

    for (const row of res.rows) {
      data.push(new Planets(row))
    }

    return data;
  }

  async save(client: PoolClient): Promise<Planets> {
    // Check if already exists in the databse
    let query = 'SELECT * FROM planets WHERE name = $1 AND ref = $2'

    let res = await client.query(query, [this.name, this.ref])

    if (res.rows.length > 0) return new Planets(res.rows[0]) // If planet already exists, return it
    
    query = 'INSERT INTO planets (name, ref, imports_id) VALUES($1, $2, $3) RETURNING *;'

    res = await client.query(query, [this.name, this.ref, this.importsId])

    this.id = res.rows[0].id
    return this;
  }
}

export default Planets
