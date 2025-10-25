import { WithoutFunctions } from "./helpers"

export class HandledPrismaError {
    text: string
    key: string

    constructor(data: WithoutFunctions<HandledPrismaError>) {
        this.text = data.text
        this.key = data.key
    }
}
