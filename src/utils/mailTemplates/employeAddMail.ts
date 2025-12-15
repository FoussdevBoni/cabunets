export const employeeAccountCreationModel = (
  employeeName: string,
  companyName: string,
  receiverEmail: string,
  tempPassword: string,
  token: string
) => {
  const originUrl = location.origin
  const confirmationUrl = `${originUrl}/confirm/${token}`

  return {
    html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Activation de votre compte employé - ${companyName}</title>
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
      background: linear-gradient(135deg, #4CAF50, #2E7D32);
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
      background: linear-gradient(135deg, #4CAF50, #2E7D32);
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
    .credentials {
      background: #f1f8e9;
      border: 1px solid #c8e6c9;
      border-radius: 8px;
      padding: 16px;
      margin: 20px 0;
    }
    .credentials p {
      margin: 6px 0;
      font-family: monospace;
      font-size: 15px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Bienvenue chez ${companyName}</h1>
      <p>Activation de votre compte employé</p>
    </div>
    <div class="content">
      <p>Bonjour <strong>${employeeName}</strong>,</p>
      <p>Un compte a été créé pour vous sur la plateforme <strong>Hylia ERP</strong> par votre entreprise <strong>${companyName}</strong>.</p>
      <p>Voici vos identifiants de connexion temporaires :</p>

      <div class="credentials">
        <p>📧 <strong>Email :</strong> ${receiverEmail}</p>
        <p>🔑 <strong>Mot de passe temporaire :</strong> ${tempPassword}</p>
      </div>

      <p>Avant de pouvoir accéder à votre tableau de bord, merci de confirmer votre compte :</p>

      <div style="text-align:center;margin:30px 0;">
        <a href="${confirmationUrl}" class="cta-button">Activer mon compte</a>
      </div>

      <p>Après confirmation, vous pourrez vous connecter et modifier votre mot de passe.</p>

      <div style="margin-top:30px;border-top:1px solid #eee;padding-top:15px;">
        <p>📧 Besoin d’aide ? Contactez le support : 
        <a href="mailto:support@hylia-erp.com" style="color:#4CAF50;">support@hylia-erp.com</a></p>
      </div>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Hylia ERP — Tous droits réservés.</p>
      <p>Cet email a été envoyé à ${receiverEmail}</p>
    </div>
  </div>
</body>
</html>
`,

text: `
ACTIVATION DE VOTRE COMPTE EMPLOYÉ - ${companyName}
==================================================

Bonjour ${employeeName},

Un compte a été créé pour vous sur Hylia ERP par ${companyName}.

Voici vos identifiants temporaires :
📧 Email : ${receiverEmail}
🔑 Mot de passe temporaire : ${tempPassword}

Avant d'accéder à votre tableau de bord, veuillez activer votre compte :

✅ ${confirmationUrl}

Une fois confirmé, vous pourrez modifier votre mot de passe.

---
📧 support@sasatro.com
© ${new Date().getFullYear()} Hylia ERP
Cet email a été envoyé à ${receiverEmail}
`
  }
}
