import { inviteParticipant } from "./mail/inviteParticipant"
import { passwordRecovery } from "./mail/passwordRecovery"
import { tripReport } from "./mail/tripReport"

export const templates = {
    mail: {
        inviteParticipant,
        passwordRecovery,
        tripReport,
    },
}
