import express, { Express, Request, Response, Router } from "express"
import { authenticate, AuthenticatedRequest } from "../middlewares/authenticate"
import { requireTrip, TripRequest } from "../middlewares/requireTrip"
import { TripForm } from "../class/Trip/Trip"
import { TripParticipantForm } from "../class/Trip/TripParticipant"
import { ParticipantRequest, requireParticipant } from "../middlewares/requireParticipant"

const router: Router = express.Router()

type AuthenticatedTripRequest = AuthenticatedRequest & TripRequest

router.get("/", requireTrip, async (request: TripRequest, response: Response) => {
    try {
        return response.json(request.trip)
    } catch (error) {
        console.log(error)
        response.status(500).send(error)
    }
})

router.patch("/", authenticate, requireTrip, async (request: AuthenticatedTripRequest, response: Response) => {
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

router.delete("/", authenticate, requireTrip, async (request: AuthenticatedTripRequest, response: Response) => {
    try {
        await request.trip?.delete()
        return response.status(204).send()
    } catch (error) {
        console.log(error)
        response.status(500).send(error)
    }
})

router.patch("/participant", authenticate, requireParticipant, async (request: ParticipantRequest, response: Response) => {
    const data = request.body as Partial<TripParticipantForm>

    try {
        await request.participant?.update(data)
        console.log(request.participant)
        return response.json(request.participant)
    } catch (error) {
        console.log(error)
        response.status(500).send(error)
    }
})

router.post("/participant", authenticate, requireTrip, async (request: AuthenticatedTripRequest, response: Response) => {
    const data = request.body as TripParticipantForm

    try {
        const participant = await request.trip!.inviteParticipant(data)
        return response.json(participant)
    } catch (error) {
        console.log(error)
        response.status(500).send(error)
    }
})

router.get("/participant/accept", authenticate, requireTrip, async (request: AuthenticatedTripRequest, response: Response) => {
    try {
        const participant = await request.trip!.acceptInvitation(request.user!.email)
        return response.json(participant)
    } catch (error) {
        console.log(error)
        response.status(500).send(error)
    }
})

export default router
