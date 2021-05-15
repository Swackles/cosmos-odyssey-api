import express, { Request, Response } from 'express';
import Pool from '../lib/db'
import { PriceListings } from '../models';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  const filter = req.query as { company: string | null, dest: string, origin: string }
  if (filter.dest == null || filter.origin == null) return res.status(400).send({ code: 'REQUIRED_FIELD_EMPTY' })
  
  const client = await Pool.connect()

  res.send(await PriceListings.save(await PriceListings.findAll(filter), client));

  client.release()
})

export default router;
