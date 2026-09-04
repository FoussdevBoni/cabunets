export type Time = 'year' | 'month' | 'week' | 'day'
export type UserRole = 'vendeur' | 'admin' | 'client'


export type Profile = Vendeur | Admin | Client

export interface UserBase {
  id?: string;
  _id?: string
  email: string;
  username: string,
  avatar: string
  role: 'vendeur' | 'admin' | 'client',
}
export interface User extends UserBase {
  isVerified?: boolean,
  isActive?: boolean
  profile: Profile
  createdAt?: Date;
  updatedAt?: Date;
}


export interface AuthResponse {
  message: string;
  user: {
    id: string;
    email: string;
    role: string;
    profile?: Profile
  };
  token: string
}


export interface CurrentUser extends User {

}

export interface Admin {
  nom: string,
  tel: string
}


export interface Vendeur {
  _id?: string
  id?: string
  whatsappNumber: string;
  advantage: string;
  email: string;
  avatar?: string
  username: string
  networks: {
    Airtel: boolean;
    Vodacom: boolean;
    Africell: boolean;
    Orange: boolean;
  };

  photoUrls: string[];
  paymentAmount: number;
  availability: string;

  // Nouveaux champs pour les horaires
  openingTime?: string;    // Format "HH:mm" (ex: "08:00")
  closingTime?: string;    // Format "HH:mm" (ex: "18:00")
  isOnline?: boolean;      // Statut en ligne (calculé ou manuel)

  createdAt?: Date;
  updatedAt?: Date;
}
export interface Client {
  id: string;
  whatsappNumber: string;
  rechargePhone?: string;
  address?: string;
  createdAt?: Date;
  updatedAt?: Date;
}


export interface Offre {
  id?: string
  vendeurId: string
  vendeurName: string
  network: "Airtel" | "Vodacom" | "Africell" | "Orange";
  priceFC: number;
  priceUSD: number;
  units: number;
  createdAt?: Date;
  updatedAt?: Date;
}


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

export interface Email {
  text: string;
  subject: string;
  html?: string,
  to: string
}