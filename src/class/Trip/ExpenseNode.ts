import { WithoutFunctions } from "../helpers"

interface Expense {
    amount: string
    currency: string
    quantity?: number
}

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
    notes: string[]

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
    }

    getTotalExpenses(): number {
        if (!this.active) return 0

        let total = this.expense ? Number(this.expense.amount) * (this.expense.quantity || 1) : 0

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

        // Recalculate totals after update
        this.totalExpenses = this.getTotalExpenses()
        this.totalLocations = this.getTotalLocations()
    }
}
