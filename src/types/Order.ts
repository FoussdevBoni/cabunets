export interface CreateOrderResponse {
  success: boolean;
  message: string;
  order: {
    _id: string;
    phoneNumber: string;
    paymentPhone: string;
    contactPhone: string;
    units: number;
    price: number;
    currency: string;
    network: string;
    correspondent: string;
    offerId: string;
    vendeurId: string;
    vendeurName: string;
    vendeurPhone: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    depositExistence?: 'FOUND' | 'NOT_FOUND';
    depositId?: string;
    providerTransactionId?: string;
    failureReason?: string;
    createdAt: string;
    updatedAt: string;
    __v?: number;
  };
  payment: {
    success: boolean;
    message: string;
    data?: {
      depositId: string;
      status: 'ACCEPTED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REJECTED' | string;
      pawaResponse?: {
        depositId: string;
        status: 'ACCEPTED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REJECTED' | string;
        failureReason?: {
          failureCode: string;
          failureMessage: string;
        };
      };
    };
  };
}


