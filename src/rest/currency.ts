import express, { Express, Request, Response, Router } from "express"
import { exchangeRateAPI } from "../api/exchangerate"
import { AxiosError } from "axios"

const router: Router = express.Router()

router.get("/", async (request: Request, response: Response) => {
    try {
        const rates = await exchangeRateAPI.getRates()
        response.json(rates)
    } catch (error) {
        if (error instanceof AxiosError) {
            console.log(error.response)
            return response.status(error.response?.status || 500).json(error.response?.data)
        }
        console.log(error)
        response.status(500).send(error)
    }
})

export default router
