import express, { Request, Response } from 'express';
import { Planets } from '../models';
import Pool from '../lib/db'

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  res.send(await Planets.findAll(await Pool.connect()));
})

export default router;
