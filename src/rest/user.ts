import express, { Express, Request, Response } from "express"
import { authenticate, AuthenticatedRequest } from "../middlewares/authenticate"
import { User, UserForm } from "../class/User"
import { UploadedFile } from "express-fileupload"
import { Prisma } from "@prisma/client"
import { HandledPrismaError } from "../class/HandledError"
import { TripForm } from "../class/Trip/Trip"

const router = express.Router()

router.get("/", async (request: Request, response: Response) => {
    const { user_id } = request.query
    try {
        if (user_id) {
            const user = await User.findById(user_id as string)
            return response.json(user)
        }

        const users = await User.getAll()
        return response.json(users)
    } catch (error) {
        console.log(error)
        response.status(500).send(error)
    }
})

router.patch("/", authenticate, async (request: AuthenticatedRequest, response: Response) => {
    try {
        const user = request.user!

        const file = request.files?.image
        if (file) {
            await user.updateImage(file as UploadedFile)
        } else {
            const data = request.body as Partial<UserForm>
            console.log(data)
            await user.update(data)
        }

        console.log(user)
        return response.json(user)
    } catch (error) {
        console.log(error)
        response.status(500).send(error)
    }
})

router.delete("/", authenticate, async (request: AuthenticatedRequest, response: Response) => {
    try {
        const user = request.user!
        await user.delete()

        return response.json(user)
    } catch (error) {
        console.log(error)
        response.status(500).send(error)
    }
})

router.post("/", async (request: Request, response: Response) => {
    const data = request.body as UserForm

    try {
        const user = await User.new(data)
        const token = user.getToken()
        return response.send(token)
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                // Unique constraint failed
                return response.status(400).json(
                    new HandledPrismaError({
                        text: "Email já cadastrado.",
                        key: "email",
                    })
                )
            }
        }
        console.log(error)
        response.status(500).send(error)
    }
})

router.post("/change-password", authenticate, async (request: AuthenticatedRequest, response: Response) => {
    const data = request.body as { current_password: string; new_password: string }

    try {
        const user = request.user!
        await User.tryChangePassword(user.id, data.current_password, data.new_password)

        return response.status(201).send("ok")
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                // Record to update not found.
                return response.status(400).json(
                    new HandledPrismaError({
                        text: "Senha atual incorreta.",
                        key: "current_password",
                    })
                )
            }
            console.log(error)
            response.status(500).send(error)
        }
    }
})

router.get("/trips", authenticate, async (request: AuthenticatedRequest, response: Response) => {
    try {
        const user = request.user!
        const trips = await user.getParticipatingTrips()

        return response.json(trips)
    } catch (error) {
        console.log(error)
        response.status(500).send(error)
    }
})

router.post("/trips", authenticate, async (request: AuthenticatedRequest, response: Response) => {
    const data = request.body as TripForm

    try {
        const trip = await request.user!.newTrip(data)
        return response.status(201).json(trip)
    } catch (error) {
        console.log(error)
        response.status(500).send(error)
    }
})

router.get("/search", async (request: Request, response: Response) => {
    const query = request.query.query as string | undefined

    if (query) {
        try {
            const users = await User.search(query)
            return response.json(users)
        } catch (error) {
            console.log(error)
            response.status(500).send(error)
        }
    } else {
        response.status(400).send("query param is required")
    }
})

router.get("/pending-invitations", authenticate, async (request: AuthenticatedRequest, response: Response) => {
    try {
        const user = request.user!
        const invitations = await user.getPendingInvitation()
        return response.json(invitations)
    } catch (error) {
        console.log(error)
        response.status(500).send(error)
    }
})

export default router
