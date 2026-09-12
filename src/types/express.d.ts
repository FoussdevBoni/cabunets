declare namespace Express {
  export interface Request {
    user?: {
      userId: string;
      role: 'admin' | 'client' | 'vendeur';
      username: string;
      avatar?: string;
      email?: string;
      profile: any;
    };
  }
}