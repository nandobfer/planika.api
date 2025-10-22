import express, { Express, Request, Response } from "express"
import { Event, EventForm } from "../class/Event"
import { authenticate, AuthenticatedRequest } from "../middlewares/authenticate"
import { LogAction, LogTarget } from "../class/Log"
import { EventRequest, requireEventId } from "../middlewares/requireEventId"
import { UploadedFile } from "express-fileupload"

const router = express.Router()

router.get("/", async (request: Request, response: Response) => {
    const { week } = request.query
    const { all } = request.query
    try {
        const events = all ? await Event.getAll() : week ? await Event.getWeek(week as string) : await Event.getCurrentWeek()
        return response.json(events)
    } catch (error) {
        console.log(error)
        response.status(500).send(error)
    }
})

router.post("/", authenticate, async (request: AuthenticatedRequest, response: Response) => {
    const data = request.body as EventForm

    try {
        const event = await Event.new(data)
        request.user?.log({
            action: LogAction.create,
            message: `criou o evento (${event.id}) ${event.title}.`,
            target: LogTarget.event,
            request_ip: request.clientIp,
        })
        return response.json(event)
    } catch (error) {
        console.log(error)
        response.status(500).send(error)
    }
})

router.patch("/", requireEventId, authenticate, async (request: AuthenticatedRequest & EventRequest, response: Response) => {
    try {
        const event = request.event!

        const image = request.files?.image
        if (image) {
            await event.updateImage(image as UploadedFile)
        } else {
            const data = request.body as Partial<EventForm>
            await event.update(data)
        }

        request.user?.log({
            action: LogAction.update,
            message: `atualizou o evento (${event.id}) ${event.title}.`,
            target: LogTarget.event,
            request_ip: request.clientIp,
        })
        return response.json(event)
    } catch (error) {
        console.log(error)
        response.status(500).send(error)
    }
})

router.delete("/", requireEventId, authenticate, async (request: AuthenticatedRequest & EventRequest, response: Response) => {
    try {
        const event = request.event!
        await event.delete()
        request.user?.log({
            action: LogAction.delete,
            message: `deletou o evento (${event.id}) ${event.title}.`,
            target: LogTarget.event,
            request_ip: request.clientIp,
        })
        return response.json(event)
    } catch (error) {
        console.log(error)
        response.status(500).send(error)
    }
})

router.post("/clone", authenticate, requireEventId, async (request: AuthenticatedRequest & EventRequest, response: Response) => {
    try {
        const originalEvent = request.event!
        const event = await Event.clone(originalEvent)
        request.user?.log({
            action: LogAction.create,
            message: `clonou o evento (${originalEvent.id}) ${originalEvent.title} para (${event.id}) ${event.title}.`,
            target: LogTarget.event,
            request_ip: request.clientIp,
        })
        return response.json(event)
    } catch (error) {
        console.log(error)
        response.status(500).send(error)
    }
})

export default router
