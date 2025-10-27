import nodemailer from "nodemailer"
import Mail from "nodemailer/lib/mailer"

export interface MailOptions {
    destination: string[]
    subject: string
    text?: string
    html?: string
    attachments?: Mail.Attachment[]
    from?: string
}

export class Mailer {
    private from = "Planika <nandobfer@gmail.com>"
    private transporter = nodemailer.createTransport({
        host: "smtp.mailgun.org",
        port: 587,
        secure: false,
        auth: {
            user: "postmaster@boz.app.br",
            pass: "f385c320f7348c3d85c2873bc371f183-d010bdaf-b4a7be04",
        },
        tls: {
            // do not fail on invalid certs
            rejectUnauthorized: false,
        },
    })

    async sendMail(options: MailOptions) {
        const mailOptions: Mail.Options = {
                from: options.from || this.from,
                to: options.destination,
                subject: options.subject,
                html: options.html,
                text: options.text,
                attachments: options.attachments,
            }
        
            try {
                const response = await this.transporter.sendMail(mailOptions)
                return response
            } catch (error) {
                console.log("error sending mail")
                console.log({ destination: options.destination })
                console.log(error)
            }
    }
}

export const mailer = new Mailer()