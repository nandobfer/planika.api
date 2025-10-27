import axios from "axios"
import { prisma } from "../prisma"

// https://app.freecurrencyapi.com/dashboard
const API_KEY = "fca_live_Jwcwc54d0veVoxj193SRLS5RECPSCcRWQWc5Hvj4"

interface CurrenciesResponse {
    data: Record<
    string,
    {
        symbol: string
        name: string
        symbol_native: string
        decimal_digits: number
        rounding: number
        code: string
        name_plural: string
        type: string
    }
>
}

interface RatesResponse {
    data: Record<string, number>
}

export interface CurrencyRate {
    symbol: string
    updatedAt: string
    id: number
    name: string
    code: string
    base: string
    rate: number
}

class ExchangeRateAPI {
    api = axios.create({
        baseURL: "https://api.freecurrencyapi.com/v1",
        params: { apikey: API_KEY },
    })

    base = "USD"
    currencies = "USD,JPY,BGN,CZK,DKK,GBP,HUF,PLN,RON,SEK,CHF,ISK,NOK,HRK,RUB,TRY,AUD,BRL,CAD,CNY,HKD,IDR,ILS,INR,KRW,MXN,MYR,NZD,PHP,SGD,THB,ZAR"
    rates: CurrencyRate[] = []

    static isExpired(timestamp: string | number) {
        return false // Mônika não quer conversão
        return Date.now() - Number(timestamp) >= 24 * 60 * 60 * 1000
    }

    constructor() {
        this.init()
    }

    async init() {
        await this.getRates()
        console.log("ExchangeRateAPI initialized")
    }

    async getRates() {
        if (this.rates.length === 0 || ExchangeRateAPI.isExpired(this.rates[0].updatedAt)) {
            const stored = await prisma.currencyRate.findMany()

            if (stored.length === 0 || ExchangeRateAPI.isExpired(stored[0].updatedAt)) {
                console.log("Fetching currencies from API...")
                const response = await this.api.get<CurrenciesResponse>("/currencies", {
                    params: {
                        currencies: this.currencies,
                    },
                })
                const currencies = response.data.data

                const ratesResponse = (await this.api.get<RatesResponse>("/latest", {
                    params: {
                        base_currency: this.base,
                        currencies: this.currencies,
                    },
                })).data.data


                await prisma.currencyRate.deleteMany({})

                for (const code of Object.keys(currencies)) {
                    const currency = currencies[code]
                    const rate = ratesResponse[code]

                    await prisma.currencyRate.create({
                        data: {
                            symbol: currency.symbol,
                            name: currency.name,
                            code: currency.code,
                            updatedAt: Date.now().toString(),
                            base: this.base,
                            rate: rate,
                        },
                    })
                }

                const updated = await prisma.currencyRate.findMany()

                this.rates = updated
            } else {
                this.rates = stored
            }
        }

        return this.rates
    }
}
export const exchangeRateAPI = new ExchangeRateAPI()
