export const serviceCategories = [
  "Consultation nutritionnelle",
  "Coaching alimentaire personnalisé",
  "Téléconsultation santé",
  "Ateliers cuisine saine",
  "Nutrition pour animaux",
  "Suivi diététique",
  "Nutrition sportive",
];

export const productCategories = [
  "Compléments alimentaires humains",
  "Produits diététiques / bio",
  "Superaliments (spiruline, chia, etc.)",
  "Boissons fonctionnelles",
  "Repas santé prêts à consommer",
  "Nutrition animale (chiens, chats…)",
  "Produits sans gluten / sans lactose",
];
export type Layout =  'servPro' | 'goodPro' | 'admin';

 export interface Prestataire {
    pays?: string;
    garde?: boolean;
    nom?: string;
    ville?: string,
    profile?: string;
    reviews?: number,
    likes: number,
    note?: number,
    date?: string,
    layout: Layout,
    id?: any, 
    adresse: string,
    views: number,
    tel?: string,
    disponibilites?: string,
    email: string;
    password?: string,
    statut: 'En attente' | 'Accepté' | 'Refusé'  ;
    about?: string,
    visibility?: number | 0 , 
    categories: []
  }