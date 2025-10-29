import express, { Express, Request, Response } from "express"
import dotenv from "dotenv"
import cors from "cors"
import { router } from "./routes"
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import http from "http"
import fileUpload from "express-fileupload"
import express_prom_bundle from "express-prom-bundle"
import { getIoInstance, handleSocket, initializeIoServer } from "./src/io"
import expressWebsockets from "express-ws"
import { hocuspocus } from "./src/hocuspocus"

process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "Reason:", reason)
})

const metricsMiddleware = express_prom_bundle({
    includeMethod: true,
    includePath: true,
    includeStatusCode: true,

    customLabels: { project_name: "wagazap.api" },
    promClient: {
        collectDefaultMetrics: {
            // Optionally include default metrics
        },
    },
})

dotenv.config()

const { app } = expressWebsockets(express())
const port = process.env.PORT

// @ts-ignore
app.use(metricsMiddleware)
app.use(
    cors({
        origin: "*", // Allows all origins
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"], // Allows all common methods
        allowedHeaders: ["Content-Type", "Authorization", "Origin", "x-access-token", "XSRF-TOKEN"], // Allows all headers listed
        credentials: true, // Allows credentials
    })
)
app.use(bodyParser.json({ limit: "10000mb" }))
app.use(bodyParser.urlencoded({ extended: false, limit: "10000mb" }))
app.use(cookieParser())
app.use(fileUpload())
app.use("/", router)
app.use(
    "/static",
    express.static("static", {
        setHeaders: function (res, path, stat) {
            res.set("Cross-Origin-Resource-Policy", "cross-origin")
        },
    })
)

app.ws("/hocuspocus", (socket, request) => {
    console.log("New WebSocket connection to /hocuspocus")

    const context = {}
    // any context?
    hocuspocus.handleConnection(socket, request, context)
})

const server = http.createServer(app)

initializeIoServer(server)
const io = getIoInstance()

io.on("connection", (socket) => {
    handleSocket(socket)
})

server.setTimeout(1000 * 60 * 60)

server.listen(port, () => {
    console.log(`[server]: Server is running at http://${port}`)
})
