import { NextFunction, Request, Response } from "express"
import { Event } from "../class/Event"

export interface EventRequest extends Request {
    event?: Event | null
}

export const requireEventId = async (request: EventRequest, response: Response, next: NextFunction) => {
    const {  event_id } = request.query

    if (!event_id) {
        return response.status(400).send("event_id param is required")
    }

    request.event = await Event.findById(event_id as string)

    next()
}
