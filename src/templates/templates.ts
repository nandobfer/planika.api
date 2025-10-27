import { inviteParticipant } from "./mail/inviteParticipant"
import { passwordRecovery } from "./mail/passwordRecovery"

export const templates = {
    mail: {
        inviteParticipant,
        passwordRecovery,
    },
}
