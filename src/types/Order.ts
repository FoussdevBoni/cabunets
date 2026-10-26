export interface Order {
  id?: string
  _id?: string
  phoneNumber: string;            // Téléphone principal (client)
  paymentPhone?: string;          // Téléphone utilisé pour le paiement Mobile Money
  contactPhone?: string;          // Téléphone de contact / WhatsApp
  units: number;
  price: number;
  currency: "XOF" | "FCFA" | "CDF" | "USD";
  network: string;                // Réseau de la recharge (ex: MTN, Moov, Celtiis, Vodacom...)
  correspondent?: string;         // Identifiant opérateur Cabupay (ex: MTN_MOMO_BEN)
  offerId: string;
  clientId: string;
  vendeurId: string;
  vendeurName: string;
  vendeurPhone: string;
  depositId?: string;             // Reference unique du paiement Cabupay
  providerTransactionId?: string; // ID transaction opérateur final
  failureReason?: string;         // Motif en cas d'échec du paiement
  status: "PENDING" | "COMPLETED" | "FAILED";
  depositExistence?: 'FOUND' | 'NOT_FOUND';
  whatsappSent?: boolean;
  whatsappSentAt?: Date;
  deliveredAt?: Date;
  failureCode?: string
  createdAt?: Date;
  reference?: string
  updatedAt?: Date;
}