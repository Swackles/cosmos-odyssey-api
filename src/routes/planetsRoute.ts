import express, { Request, Response } from 'express';
import { Planets } from '../models';
import Pool from '../lib/db'

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  let client = await Pool.connect()

  res.send(await Planets.findAll(client));

  client.release()
})

export default router;
