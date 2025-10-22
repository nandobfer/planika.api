import { NextFunction, Request, Response } from "express"
import { Band } from "../class/Band"

export interface BandRequest extends Request {
    band?: Band | null
}

export const requireBandId = async (request: BandRequest, response: Response, next: NextFunction) => {
    const { band_id } = request.query

    if (!band_id) {
        return response.status(400).send("band_id param is required")
    }

    request.band = await Band.findById(band_id as string)

    next()
}
