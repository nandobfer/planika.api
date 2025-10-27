import { Trip } from "../../class/Trip/Trip"
import { TripParticipantForm } from "../../class/Trip/TripParticipant"

export const inviteParticipant = (trip: Trip, data: TripParticipantForm) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Convite para viagem</title>
</head>
<body>
    <h1>Você foi convidado para participar da viagem: ${trip.name}</h1>
    <p>${
        data.role === "administrator"
            ? "Como administrador, você terá controle total sobre a viagem."
            : data.role === "collaborator"
            ? "Como colaborador, você pode adicionar e gerenciar despesas."
            : "Como visualizador, você pode apenas ver os detalhes da viagem."
    }</p>
    <p>Para aceitar o convite, clique no link abaixo:</p>
    <a href="http://localhost:5174/accept-invite?email=${data.identifier}&trip=${trip.id}">Aceitar Convite</a>
    <p>Se você não esperava por este convite, pode ignorar este email.</p>
</body>
</html>
`
