import { WithoutFunctions } from "../helpers"

interface Expense {
    amount: number
    currency: string
}

export class Node {
    id: string
    tripId: string
    
    description: string
    active: boolean
    locked: boolean

    createdAt: number
    updatedAt: number

    expense?: Expense
    location?: string
    datetime?: number
    notes: string[]

    parentId?: string
    children?: Node[]

    totalExpenses: number
    totalLocations: string[]

    constructor(data: WithoutFunctions<Node>) {
        this.id = data.id
        this.tripId = data.tripId
        this.description = data.description
        this.createdAt = data.createdAt
        this.updatedAt = data.updatedAt
        this.parentId = data.parentId
        this.children = data.children
        this.active = data.active
        this.expense = data.expense
        this.location = data.location
        this.datetime = data.datetime
        this.locked = data.locked
        this.notes = data.notes || []
        this.totalExpenses = this.getTotalExpenses()
        this.totalLocations = this.getTotalLocations()
    }

    getTotalExpenses(): number {
        let total = this.expense ? this.expense.amount : 0
        if (this.children) {
            for (const child of this.children) {
                total += child.getTotalExpenses()
            }
        }
        this.totalExpenses = total
        return total
    }

    getTotalLocations(): string[] {
        const locations = new Set<string>()
        if (this.location) {
            locations.add(this.location)
        }
        if (this.children) {
            for (const child of this.children) {
                child.getTotalLocations().forEach(location => locations.add(location))
            }
        }
        this.totalLocations = Array.from(locations)
        return this.totalLocations
    }
}
