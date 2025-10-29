import { Socket } from "socket.io"
import { Server as SocketIoServer } from "socket.io"
import { Server as HttpServer } from "http"
import { Server as HttpsServer } from "https"
import { ExpenseNode } from "./class/Trip/ExpenseNode"
import { Trip } from "./class/Trip/Trip"

let io: SocketIoServer | null = null

export const initializeIoServer = (server: HttpServer | HttpsServer) => {
    io = new SocketIoServer(server, {
        cors: { origin: "*" },
        maxHttpBufferSize: 1e8,
    })
}

export const getIoInstance = () => {
    if (!io) {
        throw new Error("Socket.IO has not been initialized. Please call initializeIoServer first.")
    }
    return io
}

export const handleSocket = (socket: Socket) => {
    console.log(`New client connected: ${socket.id}`)

    socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`)
    })

    socket.on("join", (roomId: string) => {
        socket.join(roomId)
        console.log(`Client ${socket.id} joined room ${roomId}`)
    })

    socket.on("leave", (roomId: string) => {
        socket.leave(roomId)
        console.log(`Client ${socket.id} left room ${roomId}`)
    })

    socket.on("trip:node", (node: ExpenseNode) => Trip.handleNodeUpdate(socket, node))
    socket.on("trip:node:delete", (tripId: string, nodeId: string) => Trip.handleNodeDelete(socket, tripId, nodeId))
}
