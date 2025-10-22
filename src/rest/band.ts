import express, { Express, Request, Response } from "express"
import { Band, BandForm } from "../class/Band"
import { authenticate, AuthenticatedRequest } from "../middlewares/authenticate"
import { LogAction, LogTarget } from "../class/Log"
import { BandRequest, requireBandId } from "../middlewares/requireBandId"
import { UploadedFile } from "express-fileupload"
const router = express.Router()

router.get("/", async (request: Request, response: Response) => {
    const { band_id } = request.query
    try {
        if (band_id) {
            const band = await Band.findById(band_id as string)
            return response.json(band)
        }

        const bands = await Band.getAll()
        return response.json(bands)
    } catch (error) {
        console.log(error)
        response.status(500).send(error)
    }
})

router.post("/", authenticate, async (request: AuthenticatedRequest, response: Response) => {
    const data = request.body as BandForm

    try {
        const band = await Band.new(data)
        request.user?.log({
            action: LogAction.create,
            message: `cadastrou a banda (${band.id}) ${band.name}.`,
            target: LogTarget.band,
            request_ip: request.clientIp,
        })
        return response.json(band)
    } catch (error) {
        console.log(error)
        response.status(500).send(error)
    }
})

router.patch("/", requireBandId, authenticate, async (request: AuthenticatedRequest & BandRequest, response: Response) => {
    try {
        const band = request.band!
        const image = request.files?.image
        if (image) {
            await band.updateImage(image as UploadedFile)
        } else {
            const data = request.body as Partial<BandForm>
            await band.update(data)
        }

        request.user?.log({
            action: LogAction.update,
            message: `atualizou a banda (${band.id}) ${band.name}.`,
            target: LogTarget.band,
            request_ip: request.clientIp,
        })
        return response.json(band)
    } catch (error) {
        console.log(error)
        response.status(500).send(error)
    }
})


router.delete("/", requireBandId, authenticate, async (request: AuthenticatedRequest & BandRequest, response: Response) => {
    try {
        const band = request.band!
        await band.delete()

        request.user?.log({
            action: LogAction.delete,
            message: `deletou o artista (${band.id}) ${band.name}.`,
            target: LogTarget.band,
            request_ip: request.clientIp,
        })
        return response.json(band)
    } catch (error) {
        console.log(error)
        response.status(500).send(error)
    }
})

export default router
