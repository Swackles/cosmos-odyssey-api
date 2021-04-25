import { Routes, Providers } from './'

interface Filters {
  companyName: string | null,
  dest: string,
  origin: string
}

class PriceListings {
  providers: Providers[]
  price: number
  startTime: Date
  endTime: Date
  origin: string
  dest: string
  distance: string

  constructor(origin: string, dest: string) {
    this.origin = origin
    this.dest = dest
    this.providers = []
    this.price = 0
    this.distance = '0'
    this.startTime = null
    this.endTime = null
  }

  add(provider: Providers) {
    this.providers.push(provider)

    this.distance = (BigInt(this.distance) + BigInt(provider.distance)).toString()
    this.price += provider.price

    if (this.startTime == null || this.startTime > provider.startTime)
      this.startTime = provider.startTime

    if (this.endTime == null || this.endTime < provider.endTime)
      this.endTime = provider.endTime
  }

  static async findAll(filters: Filters)/*: Promise<PriceListings[]>*/ {
    const possibleRoutes = await Routes.findRoutes(filters.origin, filters.dest)
    let results: PriceListings[] = []

    for (const routes of possibleRoutes) {
      let providerRoutes = await Providers.findProviders(routes)
      
      for (const providers of providerRoutes) {
        let pl = new PriceListings(filters.origin, filters.dest);

        for (const provider of providers) pl.add(provider)
        results.push(pl)
      }
    }

    return results
  }
}

export default PriceListings
