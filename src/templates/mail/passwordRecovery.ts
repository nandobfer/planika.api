import { User } from "../../class/User";

export const passwordRecovery = (code: string, user: User) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Recuperação de Senha</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 50px auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #333333;
        }
        p {
            color: #666666;
        }
        .code {
            font-size: 24px;
            font-weight: bold;
            color: #007BFF;
            margin: 20px 0;
        }
        .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #999999;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Recuperação de Senha</h1>
        <p>Olá ${user.name},</p>
        <p>Recebemos uma solicitação para redefinir sua senha. Use o código abaixo para prosseguir com a recuperação da sua conta:</p>
        <div class="code">${code}</div>
        <p>Este código é válido por 15 minutos. Se você não solicitou a recuperação de senha, por favor, ignore este e-mail.</p>
        <div class="footer">
            <p>Planika</p>
        </div>
    </div>
</body>
</html>
`