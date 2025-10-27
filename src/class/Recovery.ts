import { Prisma } from "@prisma/client"
import { prisma } from "../prisma"

type RecoveryPrisma = Prisma.RecoveryGetPayload<{}>

export class Recovery {
    id: number
    target: string
    code: number[]
    datetime: number

    constructor(data: RecoveryPrisma) {
        this.id = data.id
        this.target = data.target
        this.code = JSON.parse(data.code)
        this.datetime = Number(data.datetime)
    }

    static async new(target: string) {
        const code = (Math.random() * 100000)
            .toFixed(0)
            .split("")
            .map((char) => (char ? Number(char) : 0))
        const data = await prisma.recovery.create({
            data: { code: JSON.stringify(code), datetime: new Date().getTime().toString(), target },
        })

        return new Recovery(data)
    }

    static async verifyCode(target: string, code: number[]) {
        const data = await prisma.recovery.findFirst({ where: { AND: [{ target, code: JSON.stringify(code) }] } })
        if (data) {
            const recovery = new Recovery(data)
            return recovery
        }

        return null
    }

    static async finish(target: string) {
        const deleted = await prisma.recovery.deleteMany({ where: { target } })
        return deleted
    }
}
