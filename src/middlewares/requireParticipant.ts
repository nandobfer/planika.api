import { NextFunction, Request, Response } from "express"
import { TripParticipant } from "../class/Trip/TripParticipant"

export interface ParticipantRequest extends Request {
    participant?: TripParticipant | null
}

export const requireParticipant = async (request: ParticipantRequest, response: Response, next: NextFunction) => {
    const { participant_id } = request.query

    if (!participant_id) {
        return response.status(400).send("participant_id param is required")
    }

    request.participant = await TripParticipant.findById(participant_id as string)

    next()
}
