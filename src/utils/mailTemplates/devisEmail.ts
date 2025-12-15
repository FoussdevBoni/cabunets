// utils/emailTemplates/devisEmailModel.ts
export const devisEmailModel = (
  clientName: string,
  companyName: string,
  devisNumero: string,
  devisDate: string,
  devisMontant: string,
  dateValidite: string,
  devisLink: string,
  companyContactEmail: string,
  companyPhone?: string
) => {
  return {
    html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Devis ${devisNumero} - ${companyName}</title>
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
      background: linear-gradient(135deg, #FF6B35, #FF8E53);
      color: white;
      text-align: center;
      padding: 30px 20px;
    }
    .header h1 {
      margin: 0;
      font-size: 26px;
    }
    .header .subtitle {
      font-size: 16px;
      opacity: 0.9;
      margin-top: 8px;
    }
    .content {
      padding: 30px;
      line-height: 1.6;
    }
    .devis-info {
      background: #fff8f5;
      border: 1px solid #ffe0d2;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .devis-info-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      padding-bottom: 10px;
      border-bottom: 1px solid #ffe0d2;
    }
    .devis-info-item:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }
    .devis-info-label {
      font-weight: 600;
      color: #666;
    }
    .devis-info-value {
      font-weight: 700;
      color: #FF6B35;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #FF6B35, #FF8E53);
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
      box-shadow: 0 4px 12px rgba(255,107,53,0.3);
    }
    .footer {
      background: #f8f9fa;
      text-align: center;
      padding: 20px;
      font-size: 14px;
      color: #666;
    }
    .contact-info {
      background: #f1f8e9;
      border: 1px solid #c8e6c9;
      border-radius: 8px;
      padding: 16px;
      margin: 20px 0;
    }
    .contact-info p {
      margin: 6px 0;
    }
    .urgent-badge {
      background: #ffeb3b;
      color: #333;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      display: inline-block;
      margin-left: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Devis ${devisNumero}</h1>
      <p class="subtitle">${companyName}</p>
    </div>
    <div class="content">
      <p>Bonjour <strong>${clientName}</strong>,</p>
      <p>Nous avons le plaisir de vous adresser le devis <strong>${devisNumero}</strong> concernant nos prestations.</p>
      
      <div class="devis-info">
        <div class="devis-info-item">
          <span class="devis-info-label">Numéro de devis :</span>
          <span class="devis-info-value">${devisNumero}</span>
        </div>
        <div class="devis-info-item">
          <span class="devis-info-label">Date d'émission :</span>
          <span class="devis-info-value">${devisDate}</span>
        </div>
        <div class="devis-info-item">
          <span class="devis-info-label">Montant TTC :</span>
          <span class="devis-info-value">${devisMontant}</span>
        </div>
        <div class="devis-info-item">
          <span class="devis-info-label">Date de validité :</span>
          <span class="devis-info-value">
            ${dateValidite}
            <span class="urgent-badge">IMPORTANT</span>
          </span>
        </div>
      </div>

      <p>Pour consulter le détail complet du devis et le valider, cliquez sur le lien ci-dessous :</p>

      <div style="text-align:center;margin:30px 0;">
        <a href="${devisLink}" class="cta-button">Voir le devis en détail</a>
      </div>

      <div class="contact-info">
        <p><strong>📧 Questions ? Contactez-nous :</strong></p>
        <p>Email : <a href="mailto:${companyContactEmail}" style="color:#FF6B35;">${companyContactEmail}</a></p>
        ${companyPhone ? `<p>Téléphone : <a href="tel:${companyPhone}" style="color:#FF6B35;">${companyPhone}</a></p>` : ''}
        <p>Nous restons à votre disposition pour toute information complémentaire.</p>
      </div>

      <p>Dans l'attente de votre retour, nous vous remercions de la confiance que vous nous accordez.</p>

      <div style="margin-top:30px;border-top:1px solid #eee;padding-top:15px;">
        <p><strong>Cordialement,</strong><br>L'équipe ${companyName}</p>
      </div>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ${companyName} — Tous droits réservés.</p>
      <p>Cet email a été envoyé à titre informatif concernant le devis ${devisNumero}.</p>
    </div>
  </div>
</body>
</html>
`,

    text: `
DEVIS ${devisNumero} - ${companyName}
=====================================

Bonjour ${clientName},

Nous avons le plaisir de vous adresser le devis ${devisNumero} concernant nos prestations.

INFORMATIONS DU DEVIS :
• Numéro : ${devisNumero}
• Date d'émission : ${devisDate}
• Montant TTC : ${devisMontant}
• Date de validité : ${dateValidite} (IMPORTANT)

Pour consulter le détail complet du devis et le valider :
${devisLink}

CONTACT :
📧 ${companyContactEmail}
${companyPhone ? `📞 ${companyPhone}` : ''}

Nous restons à votre disposition pour toute information complémentaire.

Dans l'attente de votre retour, nous vous remercions de la confiance que vous nous accordez.

Cordialement,
L'équipe ${companyName}

---
© ${new Date().getFullYear()} ${companyName}
Cet email concerne le devis ${devisNumero}
`
  }
}