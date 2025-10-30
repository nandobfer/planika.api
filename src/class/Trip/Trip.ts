import { Prisma } from "@prisma/client"
import { participant_include, ParticipantRole, TripParticipant, TripParticipantForm } from "./TripParticipant"
import { ExpenseNode } from "./ExpenseNode"
import { WithoutFunctions } from "../helpers"
import { prisma } from "../../prisma"
import { uid } from "uid"
import { mailer } from "../Mailer"
import { templates } from "../../templates/templates"
import { Socket } from "socket.io"

export const trip_includes = Prisma.validator<Prisma.TripInclude>()({ participants: { include: participant_include } })
type PrismaTrip = Prisma.TripGetPayload<{ include: typeof trip_includes }>

export type TripStatus = "planning" | "ongoing" | "completed"

export type TripForm = Omit<WithoutFunctions<Partial<Trip>>, "id" | "createdAt" | "updatedAt" | "participants" | "nodes" | "totalExpenses" | "status">

export class Trip {
    id: string

    name: string
    description: string
    createdAt: number
    updatedAt: number

    startDate?: number
    endDate?: number

    participants: TripParticipant[]
    nodes: ExpenseNode[]
    totalExpenses: number
    status: TripStatus

    static async new(data: TripForm, userId: string) {
        const now = Date.now()
        const result = await prisma.trip.create({
            data: {
                id: uid(),
                name: data.name || "",
                description: data.description || "",
                createdAt: now.toString(),
                updatedAt: now.toString(),
                startDate: data.startDate?.toString() || undefined,
                endDate: data.endDate?.toString() || undefined,
                nodesJson: JSON.stringify([]),
                participants: {
                    create: {
                        createdAt: now.toString(),
                        updatedAt: now.toString(),
                        userId,
                        role: "administrator",
                        status: "active",
                    },
                },
            },
            include: trip_includes,
        })

        return new Trip(result)
    }

    static async findById(id: string) {
        const result = await prisma.trip.findUnique({
            where: { id },
            include: trip_includes,
        })

        if (!result) {
            return null
        }

        return new Trip(result)
    }

    static async handleNodeUpdate(socket: Socket, data: ExpenseNode) {
        const trip = await this.findById(data.tripId)
        console.log(JSON.stringify(trip, null, 4))
        if (trip) {
            let node = trip.findNode(data.id)
            if (node) {
                // Node exists - update it
                node.update(data)
                console.log(`Updating node`, node)
            } else {
                // New node - create it
                // Don't include children from data to avoid duplication
                data.children = []
                node = new ExpenseNode(data)

                if (data.parentId) {
                    const parentNode = trip.findNode(data.parentId)
                    if (parentNode) {
                        parentNode.children.push(node)
                    } else {
                        console.error(`Parent node ${data.parentId} not found for new node ${data.id}`)
                        return
                    }
                } else {
                    trip.nodes.push(node)
                }
                console.log(`Adding new node`, node)
            }

            // Broadcast to other clients in the room
            socket.to(data.tripId).emit("trip:update", trip)

            await trip.saveNodes()
        }
    }

    static async handleNodeDelete(socket: Socket, tripId: string, nodeId: string) {
        const trip = await this.findById(tripId)
        if (trip) {
            trip.deleteNode(nodeId)
            console.log(`Deleting node ${nodeId} from trip ${tripId}`)

            socket.to(tripId).emit("trip:node:delete", nodeId)

            await trip.saveNodes()
        }
    }

    constructor(data: PrismaTrip) {
        this.id = data.id

        this.name = data.name
        this.description = data.description
        this.createdAt = Number(data.createdAt)
        this.updatedAt = Number(data.updatedAt)
        this.startDate = data.startDate ? Number(data.startDate) : undefined
        this.endDate = data.endDate ? Number(data.endDate) : undefined

        this.participants = data.participants.map((participant) => new TripParticipant(participant))
        this.nodes = (data.nodesJson ? JSON.parse(data.nodesJson as string) : []).map(
            (node_data: WithoutFunctions<ExpenseNode>) => new ExpenseNode(node_data)
        )

        this.totalExpenses = this.nodes.reduce((total, node) => total + node.getTotalExpenses(), 0)
        this.status = this.getStatus()
    }

    load(data: PrismaTrip) {
        this.name = data.name
        this.description = data.description
        this.createdAt = Number(data.createdAt)
        this.updatedAt = Number(data.updatedAt)
        this.startDate = data.startDate ? Number(data.startDate) : undefined
        this.endDate = data.endDate ? Number(data.endDate) : undefined

        this.participants = data.participants.map((participant) => new TripParticipant(participant))
        this.nodes = (data.nodesJson ? JSON.parse(data.nodesJson as string) : []).map(
            (node_data: WithoutFunctions<ExpenseNode>) => new ExpenseNode(node_data)
        )

        this.totalExpenses = this.nodes.reduce((total, node) => total + node.getTotalExpenses(), 0)
        this.status = this.getStatus()
    }

    getStatus(): TripStatus {
        if (!this.startDate || !this.endDate) {
            return "planning"
        }

        if (Date.now() >= this.endDate) {
            return "completed"
        } else if (Date.now() >= this.startDate) {
            return "ongoing"
        } else {
            return "planning"
        }
    }

    async update(data: Partial<TripForm>) {
        const updated = await prisma.trip.update({
            where: { id: this.id },
            data: {
                name: data.name?.trim(),
                description: data.description?.trim(),
                startDate: data.startDate?.toString(),
                endDate: data.endDate?.toString(),
                updatedAt: Date.now().toString(),
            },
            include: trip_includes,
        })

        this.load(updated)
    }

    async inviteParticipant(data: TripParticipantForm) {
        const email = data.idType === "email" ? data.identifier : (await prisma.user.findUnique({ where: { id: data.identifier } }))?.email

        const participant = await TripParticipant.new(data, email)
        this.participants.push(participant)

        if (email) {
            mailer.sendMail({
                destination: [email],
                subject: `Você foi convidado para a viagem "${this.name}"`,
                html: templates.mail.inviteParticipant(this, participant),
            })

            console.log("email sent")
        }

        return participant
    }

    async acceptInvitation(email: string) {
        const participant = this.participants.find((p) => p.email === email && p.status === "pending")
        if (!participant) {
            throw new Error("Convite não encontrado")
        }

        const user = await prisma.user.findUnique({ where: { email } })

        await participant.update({ status: "active", userId: user?.id })
        return participant
    }

    findNode(id: string) {
        for (const node of this.nodes) {
            const found = node.findChild(id)
            if (found) {
                return found
            }
        }
    }

    async saveNodes() {
        await prisma.trip.update({
            where: { id: this.id },
            data: {
                nodesJson: JSON.stringify(this.nodes),
                updatedAt: Date.now().toString(),
            },
        })
    }

    deleteNode(nodeId: string) {
        const deleteRecursive = (nodes: ExpenseNode[]): ExpenseNode[] => {
            return nodes
                .filter((node) => node.id !== nodeId)
                .map((node) => {
                    node.children = deleteRecursive(node.children)
                    return node
                })
        }

        this.nodes = deleteRecursive(this.nodes)
    }

    async delete() {
        await prisma.tripParticipant.deleteMany({ where: { tripId: this.id } })
        await prisma.trip.delete({ where: { id: this.id } })
    }
}
