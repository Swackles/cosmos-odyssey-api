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
    console.log(input)
    console.log(ref)
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
    }
  }

  async save(client: PoolClient): Promise<Routes> {
    const query = 'INSERT INTO routes (ref, leg_ref, distance, imports_id, origin_id, dest_id) VALUES($1, $2, $3, $4, $5, $6) RETURNING *;'

    const res = await client.query(query, [this.ref, this.legRef, this.distance, this.importsId, this.originId, this.destId])

    this.id = res.rows[0].id
    return this;
  }
}

export default Routes
