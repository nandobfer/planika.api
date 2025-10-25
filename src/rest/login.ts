import express, { Express, Request, Response } from "express"
import jwt from "jsonwebtoken"
import { GoogleAuthResponse, LoginForm, User } from "../class/User"

const router = express.Router()

router.post("/", async (request: Request, response: Response) => {
    const data = request.body as LoginForm

    try {
        const user = await User.login(data)
        if (!user) {
            return response.status(401).json({ error: "Invalid credentials" })
        }

        const token = user.getToken()
        return response.send(token)
    } catch (error) {
        console.log(error)
        return response.status(500).send(error)
    }
})

router.post("/google", async (request: Request, response: Response) => {
    const data = request.body as GoogleAuthResponse

    try {
        const user = await User.googleLogin(data)
        const token = user?.getToken()
        console.log(user)
        return response.send(token)
    } catch (error) {
        console.log(error)
        response.status(500).send(error)
    }
})

export default router
