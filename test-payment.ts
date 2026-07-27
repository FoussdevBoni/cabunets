import axios from 'axios';

// 1. URL de ta passerelle en ligne sur Railway
const GATEWAY_URL = 'https://cabupay-production.up.railway.app';

async function testerPaiementBenin() {
    console.log('🚀 Lancement du test de paiement Bénin (MTN) vers la passerelle (API V2)...');

    try {
        const response = await axios.post(`${GATEWAY_URL}/v1/payments/initiate`, {
            appId: 'APP_A',
            clientReference: 'TEST_BEN_002', // Changement de réf pour éviter les conflits
            amount: '500',
            country: 'BEN',
            currency: 'XOF',
            phone: '22951345789',
            correspondent: 'MTN_MOMO_BEN', 
            description: 'Test paiement V2',
            callbackUrl: 'https://cabupay-production.up.railway.app',
            payerType: 'MSISDN' 
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



