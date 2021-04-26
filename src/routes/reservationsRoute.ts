import express, { Request, Response } from 'express';
import Pool from '../lib/db'
import { PriceListings, Reservations } from '../models';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  res.send(await Reservations.findAll())
})

router.post('/', async (req: Request, res: Response) => {
  const { firstName, lastName, priceListingId } = req.body as { firstName: string, lastName: string, priceListingId: number }
  if (firstName == null || lastName == null || priceListingId == null) return res.status(400).send({ code: 'REQUIRED_FIELD_EMPTY' })
  
  const client = await Pool.connect()
  
  const priceListings = await PriceListings.find(priceListingId, client)

  if (priceListings == null) return res.status(400).send({ code: 'PRICE_LISTING_NOT_AVAILABLE' })

  let reservation = new Reservations({ firstName: firstName, lastName: lastName, priceListingId: priceListingId, deletedAt: priceListings.deletedAt})

  res.send(await reservation.save(client))

  client.release()
})

export default router;
