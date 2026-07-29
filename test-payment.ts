import axios from 'axios';

// 1. URL de ta passerelle en ligne sur Railway
const GATEWAY_URL = 'https://carnation-untangled-comrade.ngrok-free.dev';

async function testerPaiementBenin() {
    console.log('🚀 Lancement du test de paiement Bénin (MTN) vers la passerelle (API V2)...');

    try {
        const response = await axios.post(`${GATEWAY_URL}/v1/payments/initiate`, {
            "appId": "APP_A",
            "clientReference": "TEST_COD_001",
            "amount": "1000",
            "country": "COD",
            "currency": "CDF",
            "phone": "243815625169",
            
            "correspondent": "VODACOM_MPESA_COD",
            "description": "Test paiement RDC",
            "callbackUrl": "https://cabupay-production.up.railway.app/v1/payments/pawapay-webhook",
            "payerType": "MSISDN"
        });

        // Extraction intelligente des données selon la structure de retour du service
        const responseData = response.data?.data || response.data;
        const pawaResponse = responseData?.pawaResponse;
        const transaction = responseData?.transaction;

        if (pawaResponse) {
            console.log('\n[PawaPay V2 Response]:', JSON.stringify(pawaResponse, null, 2));
        }

        console.log('\n✅ Requête envoyée avec succès à ta passerelle !');
        console.log('ID du paiement (depositId) :', transaction?.depositId || responseData?.depositId);
        console.log('Statut initial :', transaction?.status || responseData?.status);
        console.log('\nRegarde maintenant tes logs Railway ou ton dashboard PawaPay.');

    } catch (error: any) {
        console.error('\n❌ Erreur lors du test :');
        console.error(error.response?.data || error.message);
    }
}

testerPaiementBenin();



