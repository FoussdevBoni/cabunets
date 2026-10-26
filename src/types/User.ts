import { Admin } from "./Admin";
import { Client } from "./Client";
import { Vendeur } from "./Vendeur";

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
  profile: Profile;
  impersonatedBy?: any;
  // 🆕 Suivi d'activité
  lastLoginAt?: string;
  loginCount: number;
  actionsCount: number;

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