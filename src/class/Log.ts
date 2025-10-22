import { Prisma } from "@prisma/client"
import { prisma } from "../prisma"

export type LogPrisma = Prisma.LogGetPayload<{}>
export enum LogAction {
    create = "create",
    update = "update",
    delete = "delete",
}

export enum LogTarget {
    artist = 'artist',
    band = 'band',
    event = 'event'
}

export interface LogForm {
    action: LogAction
    target: LogTarget
    message: string
    request_ip?: string | null
}

export class Log {
    id: number
    datetime: string
    action: LogAction
    target: LogTarget
    message: string
    request_ip: string | null
    admin_id: string
    admin_name: string

    static async list() {
        const result = await prisma.log.findMany()
        return result.map((log) => new Log(log))
    }

    constructor(data: LogPrisma) {
        this.id = data.id
        this.datetime = data.datetime
        this.action = data.action as LogAction
        this.target = data.target as LogTarget
        this.message = data.message
        this.request_ip = data.request_ip
        this.admin_id = data.admin_id
        this.admin_name = data.admin_name
    }
}
