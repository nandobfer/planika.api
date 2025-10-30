import { Prisma } from "@prisma/client"
import { prisma } from "../../prisma"
import { User } from "../User"

export const participant_include = Prisma.validator<Prisma.TripParticipantInclude>()({ user: true })
type ParticipantPrisma = Prisma.TripParticipantGetPayload<{ include: typeof participant_include }>

export type ParticipantRole = "administrator" | "collaborator" | "viewer"

export interface TripParticipantForm {
    role: ParticipantRole
    identifier: string
    idType: "userId" | "email"
    tripId: string
}

export type ParticipantStatus = "active" | "pending"

export class TripParticipant {
    id: string
    tripId: string
    email?: string
    role: ParticipantRole
    createdAt: number
    updatedAt: number
    status: ParticipantStatus

    user?: User
    userId?: string

    static async new(data: TripParticipantForm, email?: string) {
        const now = Date.now()
        const participant = await prisma.tripParticipant.create({
            data: {
                tripId: data.tripId,
                role: data.role,
                status: "pending",
                createdAt: now.toString(),
                updatedAt: now.toString(),
                email: data.idType === "email" ? data.identifier : email,
                userId: data.idType === "userId" ? data.identifier : undefined,
            },
            include: participant_include,
        })

        return new TripParticipant(participant)
    }

    static async findById(id: string) {
        const participant = await prisma.tripParticipant.findUnique({
            where: { id },
            include: participant_include,
        })

        if (!participant) {
            return null
        }

        return new TripParticipant(participant)
    }

    constructor(data: ParticipantPrisma) {
        this.id = data.id
        this.tripId = data.tripId
        this.email = data.email || undefined
        this.userId = data.userId || undefined
        this.user = data.user ? new User(data.user) : undefined
        this.role = data.role as ParticipantRole
        this.createdAt = Number(data.createdAt)
        this.updatedAt = Number(data.updatedAt)
        this.status = data.status as ParticipantStatus
    }

    load(data: ParticipantPrisma) {
        this.id = data.id
        this.tripId = data.tripId
        this.email = data.email || undefined
        this.userId = data.userId || undefined
        this.user = data.user ? new User(data.user) : undefined
        this.role = data.role as ParticipantRole
        this.createdAt = Number(data.createdAt)
        this.updatedAt = Number(data.updatedAt)
        this.status = data.status as ParticipantStatus
    }

    async update(data: Partial<TripParticipant>) {
        const now = Date.now()
        const updated = await prisma.tripParticipant.update({
            where: { id: this.id },
            data: {
                updatedAt: now.toString(),
                email: data.email,
                role: data.role,
                status: data.status,
                userId: data.userId,
            },
            include: participant_include,
        })

        this.load(updated)
    }

    async delete() {
        await prisma.tripParticipant.delete({ where: { id: this.id } })
    }
}
