import express, { Request, Response } from 'express';
import path from 'path';
import logger from 'morgan';

import { checkTravelUpdate } from './middlewares'
import { planetsRoute, priceListingsRoute, reservationsRoute } from './routes'

const app = express();

// Don't run route logger if running tests
if (process.env.NODE_ENV != 'test') app.use(logger('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(checkTravelUpdate)

app.use('/planets', planetsRoute)
app.use('/priceListings', priceListingsRoute)
app.use('/reservations', reservationsRoute)

// catch 404 and forward to error handler
app.use((req: Request, res: Response) => { res.status(404).send() });

// error handler
app.use((err: any, req: Request, res: Response) => {
  if (process.env.NODE_ENV === 'production') {
    res.status(500).send({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'internal server error'
      }
    })
  } else {
    res.status(err.status || 500).send({
      error: err,
      message: err.message
    })
  }
});

app.listen(3000);

export default app;
