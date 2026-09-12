import { Vendeur } from "../utils/database";
import { BackendData } from "./core/BackendData";

export interface BaseRetrait {
    vendeurId?: string;
    amount: number;
        type: 'cabunet' | 'vendeur';

    methodPayment: {
        type: "Momo" | "Bank";
        number: string;
        intitule: string;        // Nom du titulaire du compte
    };
    rejectReason?: string;
    currency: "CDF" | "USD";
     correspondent: string
    status?: 'PENDING' | 'COMPLETED' | 'REJECTED';
}

export interface Retrait extends BaseRetrait, BackendData {
    vendeur: Vendeur;
    payoutId?: string
}

export interface RetraitInitiationResponse {
    success: boolean;
    message: string;
    data: {
      retrait: Retrait;
      status: string;
      pawapayData: any;
    }
}