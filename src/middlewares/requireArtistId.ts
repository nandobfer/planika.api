import { NextFunction, Request, Response } from "express"
import { Artist } from "../class/Artist"

export interface ArtistRequest extends Request {
    artist?: Artist | null
}

export const requireArtistId = async (request: ArtistRequest, response: Response, next: NextFunction) => {
    const { artist_id } = request.query

    if (!artist_id) {
        return response.status(400).send("artist_id param is required")
    }

    request.artist = await Artist.findById(artist_id as string)

    next()
}
