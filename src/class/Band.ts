import { Prisma } from "@prisma/client"
import { prisma } from "../prisma"
import { uid } from "uid"
import { Artist, artist_include } from "./Artist"
import { Event, event_include } from "./Event"
import { UploadedFile } from "express-fileupload"
import { saveFile } from "../tools/saveFile"

export const band_include = Prisma.validator<Prisma.BandInclude>()({ artists: { include: artist_include }, _count: { select: { events: true } } })
export type BandPrisma = Prisma.BandGetPayload<{ include: typeof band_include }>
export interface BandForm {
    name: string
    description?: string
    image?: string
    instagram?: string
    artists?: Artist[]
}

export class Band {
    id: string
    name: string
    description: string | null
    image: string | null
    instagram: string | null
    artists: Artist[]
    events: number

    static async new(data: BandForm) {
        const new_band = await prisma.band.create({
            data: {
                id: uid(),
                name: data.name,
            },
            include: band_include,
        })

        return new Band(new_band)
    }

    static async getAll() {
        const data = await prisma.band.findMany({ include: band_include })
        return data.map((item) => new Band(item))
    }

    static async findById(id: string) {
        const data = await prisma.band.findUnique({ where: { id }, include: band_include })
        if (data) return new Band(data)
        return null
    }

    constructor(data: BandPrisma) {
        this.id = data.id
        this.name = data.name
        this.description = data.description
        this.artists = data.artists.map((artist) => new Artist(artist))
        this.image = data.image
        this.instagram = data.instagram
        this.events = data._count.events
    }

    load(data: BandPrisma) {
        this.id = data.id
        this.name = data.name
        this.description = data.description
        this.artists = data.artists.map((artist) => new Artist(artist))
        this.image = data.image
        this.instagram = data.instagram
        this.events = data._count.events
    }

    async update(data: Partial<BandForm>) {
        const result = await prisma.band.update({
            where: { id: this.id },
            data: {
                name: data.name,
                description: data.description,
                image: data.image,
                instagram: data.instagram,
                artists: data.artists ? { set: [], connect: data.artists.map((artist) => ({ id: artist.id })) } : undefined,
            },
            include: band_include,
        })
        this.load(result)
    }
    async updateImage(file: UploadedFile) {
        const { url } = saveFile(`/bands/${this.id}`, { name: file.name, file: file.data })
        await this.update({ image: url })

        return url
    }

    async getEvents() {
        const result = await prisma.event.findMany({
            where: { bands: { some: { id: this.id } } },
            include: event_include,
        })
        return result.map((item) => new Event(item))
    }

    async delete() {
        const result = await prisma.band.delete({ where: { id: this.id } })
        return true
    }
}
