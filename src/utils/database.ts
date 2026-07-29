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
  phoneNumber: string;
  paymentPhone?: string
  contactPhone?: string
  units: number;
  price: number;
  currency: "CDF" | "USD";
  network: string;
  offerId: string;
  vendeurId: string;
  vendeurName: string;
  vendeurPhone: string;
  status: "PENDING" | "PAID" | "COMPLETED" | "FAILED" | "CANCELLED";
  createdAt?: Date;
  correspondent: string
  updatedAt?: Date;
}

export interface Email {
  text: string;
  subject: string;
  html?: string,
  to: string
}