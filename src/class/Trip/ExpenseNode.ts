import { WithoutFunctions } from "../helpers"

interface Expense {
    amount: string
    currency: string
    quantity?: string
}

export interface ExpenseComment {
    authorId: string
    content: string
    createdAt: number
}

export type ExpenseStatus = "pending" | "reserved" | "paid" | null

export class ExpenseNode {
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
    status?: ExpenseStatus
    responsibleParticipantId?: string | null

    notes: ExpenseComment[]

    parentId?: string
    children: ExpenseNode[]

    totalExpenses: number
    totalLocations: string[]

    constructor(data: WithoutFunctions<ExpenseNode>) {
        this.id = data.id
        this.tripId = data.tripId
        this.description = data.description
        this.createdAt = data.createdAt
        this.updatedAt = data.updatedAt
        this.parentId = data.parentId
        this.children = data.children.map((item) => new ExpenseNode(item))
        this.active = data.active
        this.expense = data.expense
        this.location = data.location
        this.datetime = data.datetime
        this.locked = data.locked
        this.notes = data.notes || []
        this.totalExpenses = this.getTotalExpenses()
        this.totalLocations = this.getTotalLocations()
        this.status = data.status
        this.responsibleParticipantId = data.responsibleParticipantId
    }

    getTotalExpenses(): number {
        if (!this.active) return 0

        let total = 0

        if (this.expense) {
            total += Number(this.expense.amount) * (Number(this.expense.quantity?.toString().replace(/[^0-9.-]+/g, "")) || 1)
        }

        for (const child of this.children) {
            total += child.getTotalExpenses()
        }

        this.totalExpenses = total
        return total
    }

    getTotalLocations(): string[] {
        const locations = new Set<string>()
        if (this.location) {
            locations.add(this.location)
        }

        for (const child of this.children) {
            child.getTotalLocations().forEach((location) => locations.add(location))
        }

        this.totalLocations = Array.from(locations)
        return this.totalLocations
    }

    findChild(id: string): ExpenseNode | null {
        if (this.id === id) {
            return this
        }

        for (const child of this.children) {
            const found = child.findChild(id)
            if (found) return found
        }

        return null
    }

    update(data: Partial<WithoutFunctions<ExpenseNode>>) {
        this.updatedAt = Date.now()

        // Update only specific fields, avoid replacing children array
        if (data.description !== undefined) this.description = data.description
        if (data.active !== undefined) this.active = data.active
        if (data.locked !== undefined) this.locked = data.locked
        if (data.expense !== undefined) this.expense = data.expense
        if (data.location !== undefined) this.location = data.location
        if (data.datetime !== undefined) this.datetime = data.datetime
        if (data.notes !== undefined) this.notes = data.notes
        if (data.parentId !== undefined) this.parentId = data.parentId
        if (data.status !== undefined) this.status = data.status
        if (data.responsibleParticipantId !== undefined) this.responsibleParticipantId = data.responsibleParticipantId

        // Recalculate totals after update
        this.totalExpenses = this.getTotalExpenses()
        this.totalLocations = this.getTotalLocations()
    }
}
