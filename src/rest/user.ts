import express, { Express, Request, Response } from "express"
import { authenticate, AuthenticatedRequest } from "../middlewares/authenticate"
import { User, UserForm } from "../class/User"
import { UploadedFile } from "express-fileupload"

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
            await user.update(data)
        }

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


export default router
