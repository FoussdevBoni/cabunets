declare namespace Express {
  export interface Request {
    user?: {
      userId: string;
      companyId: string;
      role: string;
    };
    tenantId?: string;
  }
}