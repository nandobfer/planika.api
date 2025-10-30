import express, { Express, Request, Response, Router } from "express"
import { prisma } from "../prisma"
import { User } from "../class/User"
import { Recovery } from "../class/Recovery"
import { mailer } from "../class/Mailer"
import { templates } from "../templates/templates"

const router: Router = express.Router()

router.post("/", async (request: Request, response: Response) => {
    const data = request.body as { email: string }

    try {
        const user_prisma = await prisma.user.findFirst({
            where: { OR: [{ email: data.email }] },
        })
        if (user_prisma) {
            const user = new User(user_prisma)
            const recovery = await Recovery.new(user.email)
            // const url = `${website_url}/forgot-password/verification/${recovery.code.join("")}`
            await mailer.sendMail({
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

    const decline = () => response.status(401).send("código inválido")

    try {
        const recovery = await Recovery.verifyCode(data.target, data.code)
        if (recovery) {
            const expired = new Date().getTime() - Number(recovery.datetime) >= 1000 * 60 * 15
            if (expired) {
                decline()
            } else {
                response.json(recovery)
            }
        } else {
            decline()
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
        response.json(user?.getToken())
    } catch (error) {
        console.log(error)
        response.status(500).send(error)
    }
})

export default router
