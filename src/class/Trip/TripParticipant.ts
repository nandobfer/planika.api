import { Prisma } from "@prisma/client"

type ParticipantPrisma = Prisma.TripParticipantGetPayload<{}>

export type ParticipantRole = 'administrator' | 'collaborator' | 'viewer'

export interface TripParticipantForm {
    role: ParticipantRole
    identifier: string
    idType: 'userId' | 'email'
}

export type ParticipantStatus = 'active' | 'pending'

export class TripParticipant {
    id: string
    tripId: string
    role: ParticipantRole
    createdAt: number
    updatedAt: number
    status: ParticipantStatus

    userId?: string

    constructor(data: ParticipantPrisma) {
        this.id = data.id
        this.tripId = data.tripId
        this.userId = data.userId || undefined
        this.role = data.role as ParticipantRole
        this.createdAt = Number(data.createdAt)
        this.updatedAt = Number(data.updatedAt)
        this.status = data.status as ParticipantStatus
    }

}