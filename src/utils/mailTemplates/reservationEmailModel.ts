export const reservationEmailModel = (
    clientName: string,
    prestataireName: string,
    titre: string
) => {
    return {
        html: `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouvelle réservation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #2196F3; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
        <h1 style="margin: 0;">🎉 Nouvelle Réservation !</h1>
    </div>
    
    <div style="padding: 30px; background-color: #f9f9f9; border-radius: 0 0 5px 5px; border: 1px solid #ddd; border-top: none;">
        <p>Bonjour <strong>${prestataireName}</strong>,</p>
        
        <p>Félicitations ! Vous avez reçu une nouvelle réservation pour votre service.</p>
        
        <div style="background-color: white; padding: 20px; border-radius: 5px; border: 1px solid #e0e0e0; margin: 20px 0;">
            <h2 style="color: #2196F3; margin-top: 0;">📋 Détails de la réservation</h2>
            
            <div style="margin: 15px 0; padding-bottom: 10px; border-bottom: 1px solid #f0f0f0;">
                <span style="font-weight: bold; color: #555; display: inline-block; width: 120px;">Client :</span>
                <strong>${clientName}</strong>
            </div>
            
            <div style="margin: 15px 0; padding-bottom: 10px; border-bottom: 1px solid #f0f0f0;">
                <span style="font-weight: bold; color: #555; display: inline-block; width: 120px;">Service :</span>
                ${titre}
            </div>
            
            <div style="margin: 15px 0; padding-bottom: 10px; border-bottom: 1px solid #f0f0f0;">
                <span style="font-weight: bold; color: #555; display: inline-block; width: 120px;">Statut :</span>
                En attente de confirmation
            </div>
        </div>
        
        <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            Connectez-vous à votre espace prestataire pour gérer cette réservation.
        </p>
    </div>
</body>
</html>
`,

        text: `
NOUVELLE RÉSERVATION

Bonjour ${prestataireName},

Félicitations ! Vous avez reçu une nouvelle réservation pour votre service.

DÉTAILS DE LA RÉSERVATION
─────────────────────────
Client : ${clientName}
Service : ${titre}
Statut : En attente de confirmation

Connectez-vous à votre espace prestataire pour gérer cette réservation.
`
    }
}