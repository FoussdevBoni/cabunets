
export interface User {
  id?: string
  email: string;
  username: string,
  role: 'admin' | 'vendeur' | 'superviseur';
  profile?: Profile

  createdt?: string,
  updatedAt?: string
}

export type Profile = Vendeur | Superviseur

export interface CurrentUser extends User {
}

export interface Vendeur {
  id?: string,
  balance: Balance,
  superviseurId: string,
  superviseurPseudo?: string;
  poste: string,
  phone?: string,
  whatsapp?: string
}

export interface Superviseur {
  id?: string,
  balance: Balance,
  invitationCode?: string,
  phone?: string,
  whatsapp?: string
}





// Types & Interfaces
export type OperationType = 'Retrait' | 'Depot' | 'Vente';
export type Account = 'Marchand' | 'Cash' | 'Credit' | 'MoMoPay';
export type Network = 'MTN' | 'Moov' | 'Celtis';

export interface Transaction {
  id?: string;
  type: OperationType;
  amount: number;
  network: 'MTN' | 'Moov' | 'Celtis';
  account: 'Marchand' | 'MoMoPay' | 'Credit';
  date: string;
  clientName?: string,
  phoneNumber?: string,
  currentBalance: Balance,
  ancienBalance: Balance;
  operatorId: string,
  commission: number
}

export interface NetworkAccount {
  Marchand: number;
  MoMoPay: number;
  Credit: number;
}



export interface Balance {

  cashStart: number;
  superviseurId: string;
  balances: {
    MTN: NetworkAccount
    Moov: NetworkAccount;
    Celtis: NetworkAccount;
  };
  createdAt?: Date;
  updatedAt?: Date
}


export interface Dette {
  userId: string;
  date: string;
  client: string,
  currentAmount: number,
  lastPaymentDate?: string
  amount: number,
  id?: string,
  objet: string;
  status: 'paid' | 'unpaid' | 'partiel'
  createdAt?: Date;
  updatedAt?: Date
}