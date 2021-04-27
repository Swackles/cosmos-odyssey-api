import { Pool } from "pg"

const params = process.env.DATABASE_URL.match(/postgres:\/\/(.*?):(.*)@(.*?):(.*?)\/(.*?)$/);

const pool = new Pool({
  user: params[1],
  password: params[2],
  host: params[3],
  port: parseInt(params[4]),
  database: params[5]
})

export default pool
