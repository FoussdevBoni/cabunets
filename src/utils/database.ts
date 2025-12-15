export type Time = 'year' | 'month' | 'week' | 'day'
export type UserRole = 'company' | 'employee'


export type Profile = Vendeur | Admin 

export interface User {
  id: string;
  email: string;
  role: 'vendeur'  | 'admin',
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



export interface Vendeur  {
  id: string;
  nom: string;
  tel: string;
  email: string;
  whatsapp?: string;
  views?: number;
  statut: 'accepted' | 'refused' | 'pending' | 'suspended' 
}


export interface Email {
  text: string;
  subject: string;
  html?: string,
  to: string
}