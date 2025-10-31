import { Trip, trip_includes } from "../class/Trip/Trip"
import { ExpenseNode } from "../class/Trip/ExpenseNode"
import { prisma } from "../prisma"

export const removeDuplicateNodes = async () => {
    const trips = (await prisma.trip.findMany({include: trip_includes})).map(item => new Trip(item))

    for (const trip of trips) {
        const seenIds = new Set<string>()
        let duplicatesFound = 0

        // Recursive function to traverse and remove duplicates
        const removeDuplicates = (nodes: ExpenseNode[]): ExpenseNode[] => {
            const uniqueNodes: ExpenseNode[] = []

            for (const node of nodes) {
                if (seenIds.has(node.id)) {
                    // This is a duplicate, skip it
                    duplicatesFound++
                    console.log(`Removing duplicate node with ID: ${node.id} in trip ${trip.id}`)
                    continue
                }

                // Mark this ID as seen
                seenIds.add(node.id)

                // Recursively process children
                node.children = removeDuplicates(node.children)

                uniqueNodes.push(node)
            }

            return uniqueNodes
        }

        // Remove duplicates from the trip's nodes
        trip.nodes = removeDuplicates(trip.nodes)

        if (duplicatesFound > 0) {
            console.log(`Trip ${trip.id} (${trip.name}): Removed ${duplicatesFound} duplicate node(s)`)
            await trip.saveNodes()
        } else {
            console.log(`Trip ${trip.id} (${trip.name}): No duplicates found`)
        }
    }

    console.log("Finished removing duplicate nodes from all trips")
}

removeDuplicateNodes()