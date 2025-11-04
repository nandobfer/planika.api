import { User } from "../../class/User";

export const passwordRecovery = (code: string, user: User) => {
    // Helper function to format date
    const formatDate = (timestamp: number): string => {
        return new Date(timestamp).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Recuperação de Senha</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #b0e298 0%, #7ab862 100%); color: white; padding: 40px 30px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 10px;">🔐</div>
            <h1 style="margin: 0 0 10px 0; font-size: 28px; font-weight: 600;">Recuperação de Senha</h1>
            <p style="margin: 0; opacity: 0.9; font-size: 16px;">Redefina sua senha com segurança</p>
        </div>

        <!-- Content -->
        <div style="padding: 30px;">
            <!-- Greeting -->
            <p style="margin: 0 0 20px 0; font-size: 16px; color: #333;">Olá <strong>${user.name}</strong>,</p>
            
            <p style="margin: 0 0 25px 0; font-size: 14px; color: #666; line-height: 1.6;">
                Recebemos uma solicitação para redefinir sua senha. Use o código abaixo para prosseguir com a recuperação da sua conta:
            </p>

            <!-- Code Display -->
            <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; border-radius: 8px; margin-bottom: 25px; text-align: center; border: 2px solid #b0e298;">
                <p style="margin: 0 0 10px 0; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Seu Código de Recuperação</p>
                <div style="font-size: 36px; font-weight: 700; color: #7ab862; letter-spacing: 8px; font-family: 'Courier New', monospace; margin: 10px 0;">
                    ${code}
                </div>
            </div>

            <!-- Warning Box -->
            <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #ffc107;">
                <div style="margin-bottom: 10px;">
                    <span style="font-size: 20px; margin-right: 8px;">⏱️</span>
                    <span style="font-size: 16px; font-weight: 600; color: #856404;">Válido por 15 minutos</span>
                </div>
                <p style="margin: 0; color: #856404; font-size: 13px; line-height: 1.5;">
                    Por questões de segurança, este código expirará em 15 minutos. Se expirar, você precisará solicitar um novo código.
                </p>
            </div>

            <!-- Security Note -->
            <div style="background-color: #ffebee; padding: 20px; border-radius: 8px; border-left: 4px solid #f44336;">
                <div style="margin-bottom: 10px;">
                    <span style="font-size: 20px; margin-right: 8px;">🛡️</span>
                    <span style="font-size: 16px; font-weight: 600; color: #c62828;">Não solicitou esta recuperação?</span>
                </div>
                <p style="margin: 0; color: #c62828; font-size: 13px; line-height: 1.5;">
                    Se você não solicitou a recuperação de senha, por favor ignore este e-mail. Sua senha permanecerá inalterada e sua conta está segura.
                </p>
            </div>
        </div>

        <!-- Footer -->
        <div style="padding: 20px 30px; background-color: #f8f9fa; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #e0e0e0;">
            <p style="margin: 0 0 5px 0;">Solicitação recebida em ${formatDate(Date.now())}</p>
            <p style="margin: 0; font-weight: 600; color: #7ab862;">Planika - Gestão de Viagens</p>
        </div>
    </div>
</body>
</html>
    `.trim()
}