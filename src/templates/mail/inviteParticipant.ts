import { Trip } from "../../class/Trip/Trip"
import { TripParticipant } from "../../class/Trip/TripParticipant"
import { website_url } from "../../website_url"

export const inviteParticipant = (trip: Trip, data: TripParticipant) => {
    // Helper function to format date
    const formatDate = (timestamp: number): string => {
        return new Date(timestamp).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        })
    }

    const roleInfo =
        data.role === "administrator"
            ? {
                  title: "Administrador",
                  description: "Você terá controle total sobre a viagem, podendo adicionar participantes, gerenciar despesas e configurações.",
                  icon: "👑",
              }
            : data.role === "collaborator"
            ? {
                  title: "Colaborador",
                  description: "Você pode adicionar e gerenciar despesas, contribuindo ativamente para o planejamento da viagem.",
                  icon: "✏️",
              }
            : {
                  title: "Visualizador",
                  description: "Você poderá acompanhar todos os detalhes da viagem, mas não poderá fazer alterações.",
                  icon: "👁️",
              }

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Convite para Viagem - ${trip.name}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #b0e298 0%, #7ab862 100%); color: white; padding: 40px 30px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 10px;">✈️</div>
            <h1 style="margin: 0 0 10px 0; font-size: 28px; font-weight: 600;">Você foi convidado!</h1>
            <p style="margin: 0; opacity: 0.9; font-size: 16px;">Para participar de uma viagem</p>
        </div>

        <!-- Content -->
        <div style="padding: 30px;">
            <!-- Trip Info -->
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #b0e298;">
                <h2 style="margin: 0 0 10px 0; font-size: 22px; color: #333;">${trip.name}</h2>
                ${trip.description ? `<p style="margin: 0 0 15px 0; color: #666; font-size: 14px; line-height: 1.5;">${trip.description}</p>` : ""}
                ${
                    trip.startDate || trip.endDate
                        ? `
                    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e0e0e0;">
                        <span style="font-size: 14px; color: #666;">
                            📅 ${trip.startDate ? formatDate(trip.startDate) : ""} ${trip.startDate && trip.endDate ? "→" : ""} ${
                              trip.endDate ? formatDate(trip.endDate) : ""
                          }
                        </span>
                    </div>
                `
                        : ""
                }
            </div>

            <!-- Role Info -->
            <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #ffc107;">
                <div style="margin-bottom: 10px;">
                    <span style="font-size: 24px; margin-right: 10px;">${roleInfo.icon}</span>
                    <span style="font-size: 18px; font-weight: 600; color: #856404;">Sua função: ${roleInfo.title}</span>
                </div>
                <p style="margin: 10px 0 0 0; color: #856404; font-size: 14px; line-height: 1.5;">${roleInfo.description}</p>
            </div>

            <!-- Action Button -->
            <div style="text-align: center; margin-bottom: 25px;">
                <a href="${website_url}/accept-invite?email=${data.email}&trip=${trip.id}" 
                   style="display: inline-block; background: linear-gradient(135deg, #b0e298 0%, #7ab862 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 2px 8px rgba(122, 184, 98, 0.3);">
                    Aceitar Convite
                </a>
            </div>

            <!-- Info Note -->
            <div style="background-color: #e7f3ff; padding: 15px; border-radius: 8px; border-left: 4px solid #2196F3;">
                <p style="margin: 0; color: #0d47a1; font-size: 13px; line-height: 1.5;">
                    💡 <strong>Importante:</strong> Este convite foi enviado especificamente para você. Se você não esperava receber este convite, pode ignorar este e-mail com segurança.
                </p>
            </div>
        </div>

        <!-- Footer -->
        <div style="padding: 20px 30px; background-color: #f8f9fa; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #e0e0e0;">
            <p style="margin: 0 0 5px 0;">Convite enviado em ${formatDate(Date.now())}</p>
            <p style="margin: 0; font-weight: 600; color: #7ab862;">Planika - Gestão de Viagens</p>
        </div>
    </div>
</body>
</html>
    `.trim()
}
