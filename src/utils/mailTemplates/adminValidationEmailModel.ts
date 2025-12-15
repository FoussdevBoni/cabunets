import { Companie, Professionnel, User } from "../database"

export const adminValidationEmail = (
    profileName: string, 
    receiverEmail: string, 
    role: User['role'],
    status: (Professionnel | Companie)['statut']) => {
  
  const originUrl = location.origin
  const loginUrl = `${originUrl}/login`
  const supportEmail = "support@sasatro.com"
  
  const isCompany = role === 'companie'
  const profileType = isCompany ? "entreprise cliente" : "professionnel de santé"
  
  // Sujet de l'email selon le statut
  const getSubject = () => {
    switch (status) {
      case 'Accepté':
        return `Votre profil ${profileType} - Accepté ✅`
      case 'Refusé':
        return `Votre profil ${profileType} - Refusé ❌`
      case 'Suspendu':
        return `Votre profil ${profileType} - Suspendu ⚠️`
      case 'En attente':
      default:
        return `Votre profil ${profileType} - En attente de modifications 📋`
    }
  }

  const subject = getSubject()

  // Template ACCEPTATION (vert/bleu)
  const acceptanceTemplate = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Profil Accepté</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f7f9fc;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }
        .header {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .content {
            padding: 40px 30px;
        }
        .content h2 {
            color: #1e293b;
            margin-top: 0;
            font-size: 22px;
        }
        .content p {
            margin-bottom: 20px;
            font-size: 16px;
            color: #475569;
        }
        .success-box {
            background-color: #dcfce7;
            border-left: 4px solid #16a34a;
            padding: 20px;
            border-radius: 0 8px 8px 0;
            margin: 30px 0;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            color: white;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: all 0.3s ease;
            text-align: center;
        }
        .button:hover {
            background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(37, 99, 235, 0.3);
        }
        .steps {
            background-color: #f8fafc;
            border-radius: 10px;
            padding: 25px;
            margin: 30px 0;
        }
        .step {
            display: flex;
            align-items: flex-start;
            margin-bottom: 20px;
        }
        .step-number {
            background-color: #2563eb;
            color: white;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            margin-right: 15px;
            flex-shrink: 0;
        }
        .step-content h4 {
            margin: 0 0 8px 0;
            color: #1e293b;
        }
        .step-content p {
            margin: 0;
            color: #64748b;
        }
        .footer {
            background-color: #f1f5f9;
            padding: 25px 30px;
            text-align: center;
            color: #64748b;
            font-size: 14px;
            border-top: 1px solid #e2e8f0;
        }
        .footer a {
            color: #2563eb;
            text-decoration: none;
        }
        .contact-info {
            background-color: #fef3c7;
            border-left: 4px solid #d97706;
            padding: 15px;
            border-radius: 0 8px 8px 0;
            margin: 20px 0;
        }
        @media (max-width: 600px) {
            .header, .content, .footer {
                padding: 25px 20px;
            }
            .header h1 {
                font-size: 24px;
            }
            .content h2 {
                font-size: 20px;
            }
            .button {
                display: block;
                width: 100%;
                box-sizing: border-box;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>🎉 Félicitations ${profileName} !</h1>
            <p>Votre profil ${profileType} a été approuvé</p>
        </div>
        
        <div class="content">
            <h2>Bienvenue sur notre plateforme</h2>
            <p>Bonjour ${profileName},</p>
            <p>Nous sommes ravis de vous informer que votre profil ${profileType} a été validé avec succès par notre équipe d'administration.</p>
            
            <div class="success-box">
                <strong>✅ Votre compte est maintenant actif !</strong>
                <p>Vous pouvez dès à présent accéder à toutes les fonctionnalités de la plateforme.</p>
            </div>
            
            <p>Pour commencer à utiliser votre compte, cliquez sur le bouton ci-dessous :</p>
            
            <div style="text-align: center;">
                <a href="${loginUrl}" class="button">Accéder à mon compte</a>
            </div>
            
            <div class="steps">
                <h3 style="margin-top: 0; color: #1e293b;">Prochaines étapes recommandées :</h3>
                
                <div class="step">
                    <div class="step-number">1</div>
                    <div class="step-content">
                        <h4>Complétez votre profil</h4>
                        <p>Ajoutez des photos de vos réalisations et détaillez vos services pour attirer plus de clients.</p>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">2</div>
                    <div class="step-content">
                        <h4>Explorez la plateforme</h4>
                        <p>Découvrez les fonctionnalités disponibles pour ${isCompany ? 'gérer vos projets' : 'trouver de nouvelles opportunités'}.</p>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">3</div>
                    <div class="step-content">
                        <h4>Connectez-vous</h4>
                        <p>Commencez à ${isCompany ? 'créer vos premiers projets' : 'recevoir des demandes de devis'}.</p>
                    </div>
                </div>
            </div>
            
            <p>Si vous avez des questions ou besoin d'assistance, n'hésitez pas à consulter notre centre d'aide ou à contacter notre équipe de support.</p>
            
            <div class="contact-info">
                <p><strong>📧 Support technique :</strong> <a href="mailto:${supportEmail}">${supportEmail}</a></p>
            </div>
            
            <p>Cordialement,<br>L'équipe SASATRO</p>
        </div>
        
        <div class="footer">
            <p>© ${new Date().getFullYear()} SASATRO. Tous droits réservés.</p>
            <p>
                <a href="${originUrl}/privacy">Politique de confidentialité</a> | 
                <a href="${originUrl}/terms">Conditions d'utilisation</a>
            </p>
            <p>Cet email a été envoyé à ${receiverEmail}</p>
        </div>
    </div>
</body>
</html>`

  // Template REFUS (rouge foncé)
  const rejectionTemplate = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Profil Refusé</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f7f9fc;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }
        .header {
            background: linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .content {
            padding: 40px 30px;
        }
        .content h2 {
            color: #1e293b;
            margin-top: 0;
            font-size: 22px;
        }
        .content p {
            margin-bottom: 20px;
            font-size: 16px;
            color: #475569;
        }
        .rejection-box {
            background-color: #fee2e2;
            border-left: 4px solid #dc2626;
            padding: 20px;
            border-radius: 0 8px 8px 0;
            margin: 30px 0;
        }
        .reasons {
            background-color: #f8fafc;
            border-radius: 10px;
            padding: 25px;
            margin: 30px 0;
            border: 1px solid #e2e8f0;
        }
        .reason-item {
            display: flex;
            align-items: flex-start;
            margin-bottom: 15px;
        }
        .reason-icon {
            color: #dc2626;
            margin-right: 12px;
            flex-shrink: 0;
            font-weight: bold;
        }
        .appeal-box {
            background-color: #dbeafe;
            border-left: 4px solid #2563eb;
            padding: 20px;
            border-radius: 0 8px 8px 0;
            margin: 30px 0;
        }
        .contact-info {
            background-color: #fef3c7;
            border-left: 4px solid #d97706;
            padding: 15px;
            border-radius: 0 8px 8px 0;
            margin: 20px 0;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            color: white;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: all 0.3s ease;
            text-align: center;
        }
        .button:hover {
            background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(37, 99, 235, 0.3);
        }
        .footer {
            background-color: #f1f5f9;
            padding: 25px 30px;
            text-align: center;
            color: #64748b;
            font-size: 14px;
            border-top: 1px solid #e2e8f0;
        }
        .footer a {
            color: #2563eb;
            text-decoration: none;
        }
        @media (max-width: 600px) {
            .header, .content, .footer {
                padding: 25px 20px;
            }
            .header h1 {
                font-size: 24px;
            }
            .content h2 {
                font-size: 20px;
            }
            .button {
                display: block;
                width: 100%;
                box-sizing: border-box;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>❌ Demande Refusée</h1>
            <p>Votre inscription en tant que ${profileType} n'a pas été acceptée</p>
        </div>
        
        <div class="content">
            <h2>Bonjour ${profileName},</h2>
            <p>Notre équipe d'administration a examiné votre demande d'inscription en tant que ${profileType} et malheureusement, nous ne pouvons pas l'accepter.</p>
            
            <div class="rejection-box">
                <p><strong>🚫 Votre demande a été refusée</strong></p>
                <p>Vous ne pouvez pas accéder à la plateforme en tant que ${profileType} pour le moment.</p>
            </div>
            
            <div class="reasons">
                <h3 style="margin-top: 0; color: #1e293b;">Raisons possibles de ce refus :</h3>
                
                <div class="reason-item">
                    <div class="reason-icon">•</div>
                    <div>
                        <strong>Critères d'éligibilité non remplis</strong>
                        <p>Votre profil ne répond pas aux exigences minimales pour être ${profileType} sur notre plateforme.</p>
                    </div>
                </div>
                
                <div class="reason-item">
                    <div class="reason-icon">•</div>
                    <div>
                        <strong>Documents incomplets ou non valides</strong>
                        <p>Les documents fournis ne sont pas suffisants ou ne respectent pas nos critères.</p>
                    </div>
                </div>
                
                <div class="reason-item">
                    <div class="reason-icon">•</div>
                    <div>
                        <strong>Zone géographique non couverte</strong>
                        <p>Nous ne couvrons pas encore votre région pour ce type de profil.</p>
                    </div>
                </div>
                
                <div class="reason-item">
                    <div class="reason-icon">•</div>
                    <div>
                        <strong>Capacité d'accueil limitée</strong>
                        <p>Nous avons atteint le nombre maximum de ${profileType}s dans votre secteur.</p>
                    </div>
                </div>
            </div>
            
            <div class="appeal-box">
                <h4 style="margin-top: 0; color: #1e293b;">Possibilité de recours :</h4>
                <p>Si vous pensez qu'il s'agit d'une erreur ou si vous souhaitez plus d'informations :</p>
                <p><strong>📧 Contactez notre service d'administration :</strong> <a href="mailto:${supportEmail}">${supportEmail}</a></p>
                <p>Notre équipe pourra vous fournir des détails supplémentaires sur les raisons spécifiques du refus.</p>
            </div>
            
            <div class="contact-info">
                <p><strong>💡 Alternative :</strong> Vous pouvez créer un compte utilisateur standard pour accéder à certaines fonctionnalités de la plateforme.</p>
            </div>
            
            <p>Pour contacter notre équipe ou obtenir plus d'informations :</p>
            
            <div style="text-align: center;">
                <a href="mailto:${supportEmail}" class="button">Contacter le support</a>
            </div>
            
            <p>Nous vous remercions de l'intérêt que vous portez à notre plateforme.</p>
            
            <p>Cordialement,<br>Le comité de validation SASATRO</p>
        </div>
        
        <div class="footer">
            <p>© ${new Date().getFullYear()} SASATRO. Tous droits réservés.</p>
            <p>
                <a href="${originUrl}/privacy">Politique de confidentialité</a> | 
                <a href="${originUrl}/terms">Conditions d'utilisation</a>
            </p>
            <p>Cet email a été envoyé à ${receiverEmail}</p>
        </div>
    </div>
</body>
</html>`

  // Template SUSPENSION (rouge vif)
  const suspensionTemplate = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Profil Suspendu</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f7f9fc;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }
        .header {
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .content {
            padding: 40px 30px;
        }
        .content h2 {
            color: #1e293b;
            margin-top: 0;
            font-size: 22px;
        }
        .content p {
            margin-bottom: 20px;
            font-size: 16px;
            color: #475569;
        }
        .suspension-box {
            background-color: #fee2e2;
            border-left: 4px solid #dc2626;
            padding: 20px;
            border-radius: 0 8px 8px 0;
            margin: 30px 0;
        }
        .reasons {
            background-color: #f8fafc;
            border-radius: 10px;
            padding: 25px;
            margin: 30px 0;
            border: 1px solid #e2e8f0;
        }
        .reason-item {
            display: flex;
            align-items: flex-start;
            margin-bottom: 15px;
        }
        .reason-icon {
            color: #dc2626;
            margin-right: 12px;
            flex-shrink: 0;
        }
        .appeal-box {
            background-color: #dbeafe;
            border-left: 4px solid #2563eb;
            padding: 20px;
            border-radius: 0 8px 8px 0;
            margin: 30px 0;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            color: white;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: all 0.3s ease;
            text-align: center;
        }
        .button:hover {
            background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(37, 99, 235, 0.3);
        }
        .warning {
            background-color: #fef3c7;
            border: 2px solid #f59e0b;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
        }
        .footer {
            background-color: #f1f5f9;
            padding: 25px 30px;
            text-align: center;
            color: #64748b;
            font-size: 14px;
            border-top: 1px solid #e2e8f0;
        }
        .footer a {
            color: #2563eb;
            text-decoration: none;
        }
        @media (max-width: 600px) {
            .header, .content, .footer {
                padding: 25px 20px;
            }
            .header h1 {
                font-size: 24px;
            }
            .content h2 {
                font-size: 20px;
            }
            .button {
                display: block;
                width: 100%;
                box-sizing: border-box;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>⚠️ Profil Suspendu</h1>
            <p>Votre compte ${profileType} a été temporairement suspendu</p>
        </div>
        
        <div class="content">
            <h2>Bonjour ${profileName},</h2>
            <p>Notre équipe d'administration a dû prendre la décision de suspendre temporairement votre compte ${profileType} sur notre plateforme.</p>
            
            <div class="suspension-box">
                <p><strong>🚫 Votre compte est actuellement suspendu</strong></p>
                <p>Vous ne pouvez plus accéder aux fonctionnalités de la plateforme jusqu'à la levée de cette suspension.</p>
            </div>
            
            <div class="reasons">
                <h3 style="margin-top: 0; color: #1e293b;">Raisons possibles de cette suspension :</h3>
                
                <div class="reason-item">
                    <div class="reason-icon">•</div>
                    <div>
                        <strong>Violation de nos conditions d'utilisation</strong>
                        <p>Non-respect des règles de la plateforme ou comportement inapproprié.</p>
                    </div>
                </div>
                
                <div class="reason-item">
                    <div class="reason-icon">•</div>
                    <div>
                        <strong>Informations non conformes</strong>
                        <p>Documents ou informations fournis ne respectant pas nos critères de validation.</p>
                    </div>
                </div>
                
                <div class="reason-item">
                    <div class="reason-icon">•</div>
                    <div>
                        <strong>Problème de paiement</strong>
                        <p>${isCompany ? 'Facture impayée' : 'Cotisation en retard'} ou problème financier.</p>
                    </div>
                </div>
                
                <div class="reason-item">
                    <div class="reason-icon">•</div>
                    <div>
                        <strong>Plainte d'utilisateur</strong>
                        <p>Réception d'une ou plusieurs plaintes à votre encontre.</p>
                    </div>
                </div>
            </div>
            
            <div class="warning">
                <p><strong>⚠️ IMPORTANT :</strong> Cette suspension est temporaire. Vous pouvez contacter notre équipe pour plus d'informations.</p>
            </div>
            
            <div class="appeal-box">
                <h4 style="margin-top: 0; color: #1e293b;">Procédure de recours :</h4>
                <p>Si vous pensez que cette suspension est une erreur ou si vous souhaitez faire appel de cette décision :</p>
                <p><strong>📧 Contactez notre service d'administration :</strong> <a href="mailto:${supportEmail}">${supportEmail}</a></p>
                <p>Veuillez fournir toutes les informations pertinentes pour nous aider à examiner votre cas.</p>
            </div>
            
            <p>Pour toute question ou pour initier une procédure de recours, n'hésitez pas à nous contacter :</p>
            
            <div style="text-align: center;">
                <a href="mailto:${supportEmail}" class="button">Contacter le support</a>
            </div>
            
            <p>Nous examinerons votre demande dans les plus brefs délais.</p>
            
            <p>Cordialement,<br>Le comité d'administration SASATRO</p>
        </div>
        
        <div class="footer">
            <p>© ${new Date().getFullYear()} SASATRO. Tous droits réservés.</p>
            <p>
                <a href="${originUrl}/privacy">Politique de confidentialité</a> | 
                <a href="${originUrl}/terms">Conditions d'utilisation</a>
            </p>
            <p>Cet email a été envoyé à ${receiverEmail}</p>
        </div>
    </div>
</body>
</html>`

  // Template EN ATTENTE (orange)
  const updateRequiredTemplate = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mise à jour requise</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f7f9fc;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }
        .header {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .content {
            padding: 40px 30px;
        }
        .content h2 {
            color: #1e293b;
            margin-top: 0;
            font-size: 22px;
        }
        .content p {
            margin-bottom: 20px;
            font-size: 16px;
            color: #475569;
        }
        .update-box {
            background-color: #fef3c7;
            border-left: 4px solid #d97706;
            padding: 20px;
            border-radius: 0 8px 8px 0;
            margin: 30px 0;
        }
        .requirements {
            background-color: #f8fafc;
            border-radius: 10px;
            padding: 25px;
            margin: 30px 0;
            border: 1px solid #e2e8f0;
        }
        .requirement-item {
            display: flex;
            align-items: flex-start;
            margin-bottom: 15px;
        }
        .requirement-icon {
            color: #dc2626;
            margin-right: 12px;
            flex-shrink: 0;
        }
        .support-box {
            background-color: #dbeafe;
            border-left: 4px solid #2563eb;
            padding: 20px;
            border-radius: 0 8px 8px 0;
            margin: 30px 0;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            color: white;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: all 0.3s ease;
            text-align: center;
        }
        .button:hover {
            background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(37, 99, 235, 0.3);
        }
        .footer {
            background-color: #f1f5f9;
            padding: 25px 30px;
            text-align: center;
            color: #64748b;
            font-size: 14px;
            border-top: 1px solid #e2e8f0;
        }
        .footer a {
            color: #2563eb;
            text-decoration: none;
        }
        @media (max-width: 600px) {
            .header, .content, .footer {
                padding: 25px 20px;
            }
            .header h1 {
                font-size: 24px;
            }
            .content h2 {
                font-size: 20px;
            }
            .button {
                display: block;
                width: 100%;
                box-sizing: border-box;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>📋 Mise à jour requise</h1>
            <p>Votre profil ${profileType} nécessite des modifications</p>
        </div>
        
        <div class="content">
            <h2>Bonjour ${profileName},</h2>
            <p>Notre équipe d'administration a examiné votre inscription en tant que ${profileType} et a identifié des éléments nécessitant votre attention.</p>
            
            <div class="update-box">
                <p><strong>⚠️ Votre profil n'a pas encore été validé</strong></p>
                <p>Pour finaliser votre inscription, veuillez apporter les modifications nécessaires indiquées ci-dessous.</p>
            </div>
            
            <div class="requirements">
                <h3 style="margin-top: 0; color: #1e293b;">Éléments à vérifier :</h3>
                
                <div class="requirement-item">
                    <div class="requirement-icon">•</div>
                    <div>
                        <strong>Documents manquants ou non valides</strong>
                        <p>Vérifiez que tous les documents requis sont téléchargés et lisibles.</p>
                    </div>
                </div>
                
                <div class="requirement-item">
                    <div class="requirement-icon">•</div>
                    <div>
                        <strong>Informations incomplètes</strong>
                        <p>Assurez-vous que tous les champs obligatoires sont correctement remplis.</p>
                    </div>
                </div>
                
                <div class="requirement-item">
                    <div class="requirement-icon">•</div>
                    <div>
                        <strong>Photos de profil</strong>
                        <p>Votre logo/photo doit être professionnel et de bonne qualité.</p>
                    </div>
                </div>
                
                <div class="requirement-item">
                    <div class="requirement-icon">•</div>
                    <div>
                        <strong>Informations de contact</strong>
                        <p>Confirmez que vos coordonnées sont exactes et à jour.</p>
                    </div>
                </div>
            </div>
            
            <p>Une fois les modifications apportées, notre équipe réexaminera votre profil dans les plus brefs délais.</p>
            
            <div class="support-box">
                <h4 style="margin-top: 0; color: #1e293b;">Besoin d'aide ?</h4>
                <p>Si vous avez des questions concernant les modifications requises ou si vous avez besoin d'assistance :</p>
                <p><strong>📧 Contactez notre support :</strong> <a href="mailto:${supportEmail}">${supportEmail}</a></p>
                <p>Notre équipe se fera un plaisir de vous guider dans le processus de validation.</p>
            </div>
            
            <p>Pour vous connecter à votre compte et effectuer les modifications :</p>
            
            <div style="text-align: center;">
                <a href="${loginUrl}" class="button">Accéder à mon profil</a>
            </div>
            
            <p>Nous sommes impatients de vous accueillir sur notre plateforme une fois votre profil complété.</p>
            
            <p>Cordialement,<br>L'équipe d'administration SASATRO</p>
        </div>
        
        <div class="footer">
            <p>© ${new Date().getFullYear()} SASATRO. Tous droits réservés.</p>
            <p>
                <a href="${originUrl}/privacy">Politique de confidentialité</a> | 
                <a href="${originUrl}/terms">Conditions d'utilisation</a>
            </p>
            <p>Cet email a été envoyé à ${receiverEmail}</p>
        </div>
    </div>
</body>
</html>`

  // Version texte simple (fallback) pour chaque statut
  const getTextTemplate = () => {
    switch (status) {
      case 'Accepté':
        return `
FÉLICITATIONS ${profileName.toUpperCase()} !

Votre profil ${profileType} a été approuvé.

Bonjour ${profileName},

Nous sommes ravis de vous informer que votre profil ${profileType} a été validé avec succès par notre équipe d'administration.

✅ VOTRE COMPTE EST MAINTENANT ACTIF !

Vous pouvez dès à présent accéder à toutes les fonctionnalités de la plateforme.

Pour commencer à utiliser votre compte, rendez-vous sur : ${loginUrl}

PROCHAINES ÉTAPES RECOMMANDÉES :

1. Complétez votre profil
   Ajoutez des photos de vos réalisations et détaillez vos services.

2. Explorez la plateforme
   Découvrez les fonctionnalités disponibles pour ${isCompany ? 'gérer vos projets' : 'trouver de nouvelles opportunités'}.

3. Connectez-vous
   Commencez à ${isCompany ? 'créer vos premiers projets' : 'recevoir des demandes de devis'}.

SUPPORT TECHNIQUE :
📧 ${supportEmail}

Cordialement,
L'équipe SASATRO

---
© ${new Date().getFullYear()} SASATRO
${originUrl}
        `
      case 'Refusé':
        return `
DEMANDE REFUSÉE - ${profileName.toUpperCase()}

Votre inscription en tant que ${profileType} n'a pas été acceptée.

Bonjour ${profileName},

Notre équipe d'administration a examiné votre demande d'inscription en tant que ${profileType} et malheureusement, nous ne pouvons pas l'accepter.

🚫 VOTRE DEMANDE A ÉTÉ REFUSÉE

RAISONS POSSIBLES :
• Critères d'éligibilité non remplis
• Documents incomplets ou non valides
• Zone géographique non couverte
• Capacité d'accueil limitée

POSSIBILITÉ DE RECOURS :
Si vous pensez qu'il s'agit d'une erreur ou pour plus d'informations :

📧 Contactez notre service d'administration : ${supportEmail}

ALTERNATIVE :
Vous pouvez créer un compte utilisateur standard pour accéder à certaines fonctionnalités.

Nous vous remercions de l'intérêt que vous portez à notre plateforme.

Cordialement,
Le comité de validation SASATRO

---
© ${new Date().getFullYear()} SASATRO
${originUrl}
        `
      case 'Suspendu':
        return `
PROFIL SUSPENDU - ${profileName.toUpperCase()}

Votre compte ${profileType} a été temporairement suspendu.

Bonjour ${profileName},

Notre équipe d'administration a dû prendre la décision de suspendre temporairement votre compte ${profileType} sur notre plateforme.

🚫 VOTRE COMPTE EST ACTUELLEMENT SUSPENDU

Vous ne pouvez plus accéder aux fonctionnalités de la plateforme jusqu'à la levée de cette suspension.

RAISONS POSSIBLES DE CETTE SUSPENSION :

• Violation de nos conditions d'utilisation
• Informations non conformes
• ${isCompany ? 'Facture impayée' : 'Cotisation en retard'}
• Plainte d'utilisateur

⚠️ IMPORTANT : Cette suspension est temporaire.

PROCÉDURE DE RECOURS :

Si vous pensez que cette suspension est une erreur ou si vous souhaitez faire appel de cette décision :

📧 Contactez notre service d'administration : ${supportEmail}

Veuillez fournir toutes les informations pertinentes pour nous aider à examiner votre cas.

Nous examinerons votre demande dans les plus brefs délais.

Cordialement,
Le comité d'administration SASATRO

---
© ${new Date().getFullYear()} SASATRO
${originUrl}
        `
      case 'En attente':
      default:
        return `
MISE À JOUR REQUISE - ${profileName.toUpperCase()}

Votre profil ${profileType} nécessite des modifications.

Bonjour ${profileName},

Notre équipe d'administration a examiné votre inscription en tant que ${profileType} et a identifié des éléments nécessitant votre attention.

⚠️ VOTRE PROFIL N'A PAS ENCORE ÉTÉ VALIDÉ

Pour finaliser votre inscription, veuillez apporter les modifications nécessaires.

ÉLÉMENTS À VÉRIFIER :

• Documents manquants ou non valides
  Vérifiez que tous les documents requis sont téléchargés et lisibles.

• Informations incomplètes
  Assurez-vous que tous les champs obligatoires sont correctement remplis.

• Photos de profil
  Votre logo/photo doit être professionnel et de bonne qualité.

• Informations de contact
  Confirmez que vos coordonnées sont exactes et à jour.

Une fois les modifications apportées, notre équipe réexaminera votre profil dans les plus brefs délais.

BESOIN D'AIDE ?
Si vous avez des questions concernant les modifications requises :

📧 Contactez notre support : ${supportEmail}

Pour vous connecter à votre compte et effectuer les modifications :
${loginUrl}

Nous sommes impatients de vous accueillir sur notre plateforme une fois votre profil complété.

Cordialement,
L'équipe d'administration SASATRO

---
© ${new Date().getFullYear()} SASATRO
${originUrl}
        `
    }
  }

  // Sélection du template HTML
  const getHtmlTemplate = () => {
    switch (status) {
      case 'Accepté': return acceptanceTemplate
      case 'Refusé': return rejectionTemplate
      case 'Suspendu': return suspensionTemplate
      case 'En attente':
      default: return updateRequiredTemplate
    }
  }

  return {
    subject,
    html: getHtmlTemplate(),
    text: getTextTemplate()
  }
}