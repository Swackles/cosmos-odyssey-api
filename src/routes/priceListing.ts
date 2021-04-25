import express, { Request, Response } from 'express';
import { PriceListing, Routes } from '../models';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  const filter = req.query as { companyName: string | null, dest: string, origin: string }

  res.send(await PriceListing.findAll(filter))
})

export default router;
