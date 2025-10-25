import { createWriteStream, existsSync, mkdirSync } from "fs"
import { join } from "path"
import { FileUpload } from "../class/helpers"
import { getLocalUrl } from "./getLocalUrl"
import { slugify } from "./slugify"

const getBuffer = (file: FileUpload) => {
    if (file.base64) {
        return Buffer.from(file.base64, "base64")
    }

    return Buffer.from(file.file as ArrayBuffer)
}

export const saveFile = (path: string, buffer: Buffer, file_name: string, callback?: () => void) => {
    const uploadDir = `static/${path}`
    if (!existsSync(uploadDir)) {
        mkdirSync(uploadDir, { recursive: true })
    }

    const filepath = join(uploadDir, slugify(file_name))
    createWriteStream(filepath).write(buffer, () => {
        if (callback) callback()
    })

    const url = `${getLocalUrl()}/${filepath}`
    return { url, filepath }
}
