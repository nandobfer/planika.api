import express, { Express, Request, Response } from "express"
import { prisma } from "../prisma"
import { User } from "../class/User"
import { Recovery } from "../class/Recovery"
import { mailer } from "../class/Mailer"
import { templates } from "../templates/templates"

const router = express.Router()

router.post("/", async (request: Request, response: Response) => {
    const data = request.body as { login: string }

    try {
        const user_prisma = await prisma.user.findFirst({
            where: { OR: [{ email: data.login }] },
        })
        if (user_prisma) {
            const user = new User(user_prisma)
            const recovery = await Recovery.new(user.email)
            // const url = `${website_url}/forgot-password/verification/${recovery.code.join("")}`
            mailer.sendMail({
                destination: [user.email],
                subject: `${recovery.code.join("")} - Código de Segurança para Redefinição de Senha`,
                html: templates.mail.passwordRecovery(recovery.code.join(""), user),
            })
            response.status(200).send()
        } else {
            response.status(400).send("nenhum usuário encontrado")
        }
    } catch (error) {
        console.log(error)
        response.status(500).send(error)
    }
})

router.post("/verify-code", async (request: Request, response: Response) => {
    const data = request.body as { code: number[]; target: string }

    try {
        const recovery = await Recovery.verifyCode(data.target, data.code)
        if (recovery) {
            const expired = new Date().getTime() - Number(recovery.datetime) >= 1000 * 60 * 15
            if (expired) {
                response.json(null)
            } else {
                response.json(recovery)
            }
        } else {
            response.json(null)
        }
    } catch (error) {
        console.log(error)
        response.status(500).send(error)
    }
})

router.post("/reset-password", async (request: Request, response: Response) => {
    const data = request.body as { target: string; password: string }

    try {
        const user = await User.findByEmail(data.target)
        if (user) {
            await user.update({ password: data.password })
            await Recovery.finish(data.target)
        }
        response.json(user)
    } catch (error) {
        console.log(error)
        response.status(500).send(error)
    }
})

export default router
