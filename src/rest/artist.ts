import express, { Express, Request, Response } from "express"
import { Artist, ArtistForm } from "../class/Artist"
import { authenticate, AuthenticatedRequest } from "../middlewares/authenticate"
import { LogAction, LogTarget } from "../class/Log"
import { ArtistRequest, requireArtistId } from "../middlewares/requireArtistId"
import { UploadedFile } from "express-fileupload"

const router = express.Router()

router.get("/", async (request: Request, response: Response) => {
    const { artist_id } = request.query
    try {
        if (artist_id) {
            const artist = await Artist.findById(artist_id as string)
            return response.json(artist)
        }

        const artists = await Artist.getAll()
        return response.json(artists)
    } catch (error) {
        console.log(error)
        response.status(500).send(error)
    }
})

router.post("/", authenticate, async (request: AuthenticatedRequest, response: Response) => {
    const data = request.body as ArtistForm

    try {
        const artist = await Artist.new(data)
        request.user?.log({
            action: LogAction.create,
            message: `cadastrou o artista (${artist.id}) ${artist.name}.`,
            target: LogTarget.artist,
            request_ip: request.clientIp,
        })
        return response.json(artist)
    } catch (error) {
        console.log(error)
        response.status(500).send(error)
    }
})

router.patch("/", requireArtistId, authenticate, async (request: AuthenticatedRequest & ArtistRequest, response: Response) => {
    try {
        const artist = request.artist!

        const image = request.files?.image
        if (image) {
            await artist.updateImage(image as UploadedFile)
        } else {
            const data = request.body as Partial<ArtistForm>
            await artist.update(data)
        }

        request.user?.log({
            action: LogAction.update,
            message: `atualizou o artista (${artist.id}) ${artist.name}.`,
            target: LogTarget.artist,
            request_ip: request.clientIp,
        })
        return response.json(artist)
    } catch (error) {
        console.log(error)
        response.status(500).send(error)
    }
})

router.delete("/", requireArtistId, authenticate, async (request: AuthenticatedRequest & ArtistRequest, response: Response) => {
    try {
        const artist = request.artist!
        await artist.delete()

        request.user?.log({
            action: LogAction.delete,
            message: `deletou o artista (${artist.id}) ${artist.name}.`,
            target: LogTarget.artist,
            request_ip: request.clientIp,
        })
        return response.json(artist)
    } catch (error) {
        console.log(error)
        response.status(500).send(error)
    }
})

export default router
