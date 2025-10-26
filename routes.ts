import express, { Express, Request, Response } from "express"
import { version } from "./src/version"
import user from "./src/rest/user"
import login from "./src/rest/login"
import currency from "./src/rest/currency"
import trip from "./src/rest/trip"

export const router = express.Router()

router.get("/", (request, response) => {
    response.json({ version })
})

router.use("/user", user)
router.use("/login", login)
router.use("/currency", currency)
router.use("/trip", trip)

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
