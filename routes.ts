import express, { Express, Request, Response } from "express"
import { version } from "./src/version"
import user from "./src/rest/user"
import login from "./src/rest/login"

export const router = express.Router()

router.get("/", (request, response) => {
    response.json({ version })
})

router.use("/user", user)
router.use("/login", login)

router.get("/ip", (req, res) => {
    // Modern way (requires trust proxy)
    const ip = req.ip

    // Alternative way that checks headers
    const forwarded = req.headers["x-forwarded-for"]
    const realIp = req.headers["x-real-ip"]

    res.json({
        modern_ip: ip,
        ip: req.ip,
        forwarded: forwarded,
        realIp: realIp || null,
        connection: req.connection.remoteAddress,
    })
})
