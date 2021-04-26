import express, { Request, Response } from 'express';
import Pool from '../lib/db'
import { PriceListings } from '../models';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  const filter = req.query as { companyName: string | null, dest: string, origin: string }
  
  const client = await Pool.connect()
  
  res.send(await PriceListings.save(await PriceListings.findAll(filter), client))

  client.release()
})

export default router;
