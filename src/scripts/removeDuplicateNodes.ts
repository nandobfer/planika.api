import { Trip, trip_includes } from "../class/Trip/Trip"
import { prisma } from "../prisma"

export const removeDuplicateNodes = async () => {
    const trips = (await prisma.trip.findMany({ include: trip_includes })).map((item) => new Trip(item))

    for (const trip of trips) {
        trip.removeDuplicateNodes()
        await trip.saveNodes()
    }

    console.log("Finished removing duplicate nodes from all trips")
}

removeDuplicateNodes()
