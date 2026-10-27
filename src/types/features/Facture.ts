export interface Facture {
  numero: string; dateCreation: string; statut: string;
  client: { nom: string; email?: string; telephone?: string; adresse?: string };
  lignes: { description: string; quantite: number; prixUnitaireHT: number; tva: number; totalHT: number }[];
  sousTotalHT: number; remise: number; totalTVA: number; totalTTC: number;
}
