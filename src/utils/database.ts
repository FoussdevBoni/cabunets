export type Time = 'year' | 'month' | 'week' | 'day'
export type UserRole = 'company' | 'employee'


export type Profile = Vendeur | Admin

export interface UserBase {
  id?: string;
  email: string;
  username: string,
  avatar: string
  role: 'vendeur' | 'admin',
}
export interface User extends UserBase {

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
  vendeurId: string;
  vendeurName: string;
  vendeurPhone: string;
  depositId?: string;             // Reference unique du paiement Cabupay
  providerTransactionId?: string; // ID transaction opérateur final
  failureReason?: string;         // Motif en cas d'échec du paiement
  status: "PENDING" | "COMPLETED" | "FAILED";
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Email {
  text: string;
  subject: string;
  html?: string,
  to: string
}