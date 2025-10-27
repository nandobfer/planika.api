import { NextFunction, Request, Response } from "express"
import { Trip } from "../class/Trip/Trip"

export interface TripRequest extends Request {
    trip?: Trip | null
}

export const requireTrip = async (request: TripRequest, response: Response, next: NextFunction) => {
    const { trip_id } = request.query

    if (!trip_id) {
        return response.status(400).send("trip_id param is required")
    }

    request.trip = await Trip.findById(trip_id as string)

    next()
}
