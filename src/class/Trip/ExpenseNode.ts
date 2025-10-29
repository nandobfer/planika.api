import { WithoutFunctions } from "../helpers"

interface Expense {
    amount: number
    currency: string
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
        this.children = data.children.map(item => new ExpenseNode(item))
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
            return child.findChild(id)
        }

        return null
    }

    update(data: Partial<WithoutFunctions<ExpenseNode>>) {
        this.updatedAt = Date.now()
        for (const key in data) {
            // @ts-expect-error
            this[key] = data[key]
        }
    }
}
