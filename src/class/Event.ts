import { Prisma } from "@prisma/client"
import { Band, band_include } from "./Band"
import { prisma } from "../prisma"
import { Artist, artist_include } from "./Artist"
import { uid } from "uid"
import { getWeekNumber } from "../tools/getWeekNumber"
import { saveFile } from "../tools/saveFile"
import { UploadedFile } from "express-fileupload"
import { WithoutFunctions } from "./helpers"

export const event_include = Prisma.validator<Prisma.EventInclude>()({
    bands: { include: band_include },
    artists: { include: artist_include },
})

export type EventPrisma = Prisma.EventGetPayload<{ include: typeof event_include }>
export type EventForm = Omit<WithoutFunctions<Event>, "id" | "image"> & { image?: string }

export interface Location {
    street: string
    district: string
    number: string
    cep: string
    complement: string
}

export class Event {
    id: string
    title: string
    description: string
    datetime: string
    price: number
    location: Location
    week: number
    bands: Band[]
    artists: Artist[]
    image: string | null
    ticketUrl: string | null

    static async getWeek(week: number | string) {
        const result = await prisma.event.findMany({ where: { week: Number(week) }, include: event_include })
        return result.map((item) => new Event(item))
    }

    static async getCurrentWeek() {
        return await this.getWeek(new Date().getTime())
    }

    static async getAll() {
        const data = await prisma.event.findMany({ include: event_include })
        return data.map((item) => new Event(item))
    }

    static async findById(id: string) {
        const data = await prisma.event.findUnique({ where: { id }, include: event_include })
        if (data) return new Event(data)
        return null
    }

    static async clone(originalEvent: Event) {
        const currentEventDate = new Date(Number(originalEvent.datetime))
        const nextWeekDatetime = currentEventDate.setTime(currentEventDate.getTime() + 1000 * 60 * 60 * 24 * 7)
        const event = await Event.new({
            artists: originalEvent.artists,
            bands: originalEvent.bands,
            datetime: nextWeekDatetime.toString(),
            description: originalEvent.description,
            location: originalEvent.location,
            price: originalEvent.price,
            ticketUrl: originalEvent.ticketUrl,
            title: originalEvent.title,
            week: originalEvent.week + 1,
            image: originalEvent.image || undefined,
        })

        return event
    }

    static async new(data: EventForm) {
        const result = await prisma.event.create({
            data: {
                id: uid(),
                title: data.title,
                description: data.description,
                datetime: data.datetime,
                price: data.price,
                ticketUrl: data.ticketUrl,
                week: getWeekNumber(data.datetime),
                location: JSON.stringify(data.location),
                bands: { connect: data.bands.map((band) => ({ id: band.id })) },
                artists: { connect: data.artists.map((artist) => ({ id: artist.id })) },
            },
            include: event_include,
        })

        const event = new Event(result)

        if (data.image) {
            await event.update({ image: data.image })
        }

        return event
    }

    constructor(data: EventPrisma) {
        this.id = data.id
        this.title = data.title
        this.description = data.description
        this.datetime = data.datetime
        this.price = data.price
        this.week = data.week
        this.location = JSON.parse(data.location as string)
        this.bands = data.bands.map((item) => new Band(item))
        this.artists = data.artists.map((item) => new Artist(item))
        this.image = data.image
        this.ticketUrl = data.ticketUrl
    }

    load(data: EventPrisma) {
        this.id = data.id
        this.title = data.title
        this.description = data.description
        this.datetime = data.datetime
        this.price = data.price
        this.week = data.week
        this.location = JSON.parse(data.location as string)
        this.bands = data.bands.map((item) => new Band(item))
        this.artists = data.artists.map((item) => new Artist(item))
        this.image = data.image
        this.ticketUrl = data.ticketUrl
    }

    async update(data: Partial<EventForm>) {
        const result = await prisma.event.update({
            where: { id: this.id },
            data: {
                title: data.title,
                description: data.description,
                datetime: data.datetime,
                price: data.price ? Number(data.price) : undefined,
                ticketUrl: data.ticketUrl,
                week: data.datetime ? getWeekNumber(data.datetime) : undefined,
                location: JSON.stringify(data.location),
                bands: data.bands ? { set: [], connect: data.bands.map((band) => ({ id: band.id })) } : undefined,
                artists: data.artists ? { set: [], connect: data.artists.map((artist) => ({ id: artist.id })) } : undefined,
                image: data.image,
            },
            include: event_include,
        })
        this.load(result)
    }

    async updateImage(file: UploadedFile) {
        const { url } = saveFile(`/events/${this.id}`, { name: file.name, file: file.data })
        await this.update({ image: url })

        return url
    }

    async delete() {
        const result = await prisma.event.delete({ where: { id: this.id } })
        return true
    }
}
