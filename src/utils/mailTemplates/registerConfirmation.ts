export const registerConfirmationModel = (companyName: string, receiverEmail: string, token: string) => {
  const originUrl = location.origin
  const confirmationUrl = `${originUrl}/confirm/${token}`

  return {
    html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Confirmez votre compte -SASATRO</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f9f9f9;
      margin: 0;
      padding: 0;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #fff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #90EE90, #4CAF50);
      color: white;
      text-align: center;
      padding: 30px 20px;
    }
    .header h1 {
      margin: 0;
      font-size: 26px;
    }
    .content {
      padding: 30px;
      line-height: 1.6;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #90EE90, #4CAF50);
      color: white;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      text-align: center;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(76,175,80,0.3);
    }
    .footer {
      background: #f8f9fa;
      text-align: center;
      padding: 20px;
      font-size: 14px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Confirmez votre compte</h1>
      <p>Avant d'accéder à votre tableau de bord</p>
    </div>
    <div class="content">
      <p>Bonjour <strong>${companyName}</strong>,</p>
      <p>Merci d’avoir rejoint <strong> SASATRO</strong> 🎉</p>
      <p>Pour des raisons de sécurité, nous devons vérifier que c’est bien vous.  
      Cliquez simplement sur le bouton ci-dessous pour confirmer votre compte et activer votre accès à votre tableau de bord.</p>
      
      <div style="text-align:center;margin:30px 0;">
        <a href="${confirmationUrl}" class="cta-button">Confirmer mon compte</a>
      </div>

      <p>Si vous n’avez pas créé de compte sur SASATRO, vous pouvez ignorer cet email.</p>

      <div style="margin-top:30px;border-top:1px solid #eee;padding-top:15px;">
        <p>📧 Besoin d’aide ? Contactez-nous : 
        <a href="mailto:support@hylia-erp.com" style="color:#4CAF50;">support@hylia-erp.com</a></p>
      </div>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} SASATRO — Tous droits réservés.</p>
      <p>Cet email a été envoyé à ${receiverEmail}</p>
    </div>
  </div>
</body>
</html>
`,

text: `
CONFIRMEZ VOTRE COMPTE - SASATRO
===================================

Bonjour ${companyName},

Merci d’avoir rejoint SASATRO 🎉

Pour des raisons de sécurité, nous devons vérifier que c’est bien vous.
Cliquez sur le lien ci-dessous pour confirmer votre compte :

✅ ${confirmationUrl}

Si vous n’êtes pas à l’origine de cette inscription, ignorez simplement ce message.

---
📧 support@sasatro.com
© ${new Date().getFullYear()} SASATRO
Cet email a été envoyé à ${receiverEmail}
`
  }
}
