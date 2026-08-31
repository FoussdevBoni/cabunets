import { Vendeur } from "../utils/database";
import { BackendData } from "./core/BackendData";

export interface BaseRetrait {
    vendeurId: string;
    amount: number;
    netAmount: number;
    methodPayment: {
        type: "Momo" | "Bank";
        number: string;
        intitule: string;        // Nom du titulaire du compte
    };
    rejectReason?: string;
    status: 'PENDING' | 'COMPLETED' | 'REJECTED';
}

export interface Retrait extends BaseRetrait, BackendData {
   vendeur: Vendeur
}