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