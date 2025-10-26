import express, { Express, Request, Response } from 'express'
import { authenticate, AuthenticatedRequest } from '../middlewares/authenticate'
import { requireTrip, TripRequest } from '../middlewares/requireTrip'
import { TripForm } from '../class/Trip/Trip'
const router = express.Router()

type AuthenticatedTripRequest = AuthenticatedRequest & TripRequest

router.patch('/',  authenticate , requireTrip, async (request: AuthenticatedTripRequest, response:Response) => {    
    const data = request.body as Partial<TripForm>

    try {
        await request.trip?.update(data)
        console.log(request.trip)
        return response.json(request.trip)
    } catch (error) {
        console.log(error)
        response.status(500).send(error)
    }

})

export default router