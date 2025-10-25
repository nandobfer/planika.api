import { Prisma } from "@prisma/client"
import { prisma } from "../prisma"
import { WithoutFunctions } from "./helpers"
import { uid } from "uid"
import jwt from "jsonwebtoken"
import { UploadedFile } from "express-fileupload"
import { saveFile } from "../tools/saveFile"

export type UserPrisma = Prisma.UserGetPayload<{}>

export type UserForm = Omit<WithoutFunctions<User>, "id"> & { password: string; id?: string | null }

export interface GoogleAuthResponse {
    credential: string
    clientId: string
    select_by: string
}

export interface GoogleLoginData {
    aud: string
    azp: string
    email: string
    email_verified: true
    exp: number
    family_name: string
    given_name: string
    iat: number
    iss: string
    jti: string
    name: string
    nbf: number
    picture: string
    sub: string
}

export interface LoginForm {
    login: string
    password: string
}

export interface AccessToken {
    value: string
    exp: number
    iat: number
}

export class User {
    id: string
    name: string
    email: string
    defaultCurrency?: string
    picture?: string
    // password: string

    static async new(data: UserForm) {
        const new_user = await prisma.user.create({
            data: {
                id: data.id || uid(),
                email: data.email.trim(),
                name: data.name.trim(),
                password: data.password.trim(),
                picture: data.picture,
                createdAt: Date.now().toString(),
            },
        })

        return new User(new_user)
    }

    static async login(data: LoginForm) {
        const result = await prisma.user.findFirst({ where: { email: data.login, password: data.password } })
        if (result) return new User(result)

        return null
    }

    static async getAll() {
        const data = await prisma.user.findMany({})
        return data.map((item) => new User(item))
    }

    static async findById(id: string) {
        const data = await prisma.user.findFirst({ where: { id } })
        if (data) return new User(data)
        return null
    }

    static async findByEmail(email: string) {
        const data = await prisma.user.findFirst({ where: { email } })
        if (data) return new User(data)
        return null
    }

    static async delete(user_id: string) {
        const result = await prisma.user.delete({ where: { id: user_id } })
        return new User(result)
    }

    static async googleLogin(data: GoogleAuthResponse) {
        const people = jwt.decode(data.credential) as GoogleLoginData

        const user = await User.findById(people.sub)
        if (user) {
            return user
        } else {
            try {
                return await this.new({
                    id: people.sub,
                    email: people.email,
                    name: people.name.split(" ").slice(0, 2).join(" "),
                    picture: people.picture,
                    password: uid(16),
                })
            } catch (error) {
                if (error instanceof Prisma.PrismaClientKnownRequestError) {
                    if (error.code === "P2002") {
                        // Unique constraint failed
                        const existingUser = await User.findByEmail(people.email)
                        if (existingUser) {
                            await existingUser.update({ id: people.sub })
                            return existingUser
                        }
                    }
                }
            }
        }
    }

    static async tryChangePassword(user_id: string, current_password: string, new_password: string) {
        await prisma.user.update({ where: { id: user_id, password: current_password }, data: { password: new_password } })
    }

    constructor(data: UserPrisma) {
        this.id = data.id
        this.name = data.name
        this.email = data.email
        this.defaultCurrency = data.defaultCurrency
        this.picture = data.picture || undefined
        // this.password = data.password
    }

    load(data: UserPrisma) {
        this.id = data.id
        this.name = data.name
        this.email = data.email
        this.defaultCurrency = data.defaultCurrency
        this.picture = data.picture || undefined
        // this.password = data.password
    }

    async update(data: Partial<UserForm>) {
        const updated = await prisma.user.update({
            where: { id: this.id },
            data: {
                id: data.id || undefined,
                email: data.email?.trim(),
                name: data.name?.trim(),
                password: data.password?.trim(),
                picture: data.picture?.trim(),
                defaultCurrency: data.defaultCurrency?.trim(),
            },
        })

        this.load(updated)
    }

    async updateImage(file: UploadedFile) {
        const { url } = saveFile(`/user/${this.id}`, file.data, file.name)
        await this.update({ picture: url })

        return url
    }

    async delete() {
        await prisma.user.delete({ where: { id: this.id } })
        return this
    }

    getToken() {
        return jwt.sign({ user: this }, process.env.JWT_SECRET!)
    }
}
