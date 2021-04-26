import { NextFunction, Request, Response } from "express";
import { Imports } from './../models'
import Pool from './../lib/db'
import importTravelInfo from './../jobs/importTravelinfo'

// This solution is going to be problematic with a lot of users
async function index(req: Request, res: Response, next: NextFunction) { 
  const client = await Pool.connect()
  
  if ((await Imports.findAll(client)).length == 0) await importTravelInfo()

  next()
}


export default index;