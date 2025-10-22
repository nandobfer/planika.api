import express, { Express, Request, Response } from "express"
import { authenticate, AuthenticatedRequest } from "../middlewares/authenticate"
import { User } from "../class/User"

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


export default router
