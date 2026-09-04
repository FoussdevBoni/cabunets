import { Client, User } from "../utils/database";
import { BackendData } from "./core/BackendData";
export interface LinkedEntity {
  type: 'vendeur' | 'order' | 'offer' | 'client';
  id: string;
}
export interface BaseReclamation {

  userId: string;
  reference?: string;
  objet: string;
  description?: string;
  statut: 'brouillon' | 'soumise' | 'en_cours' | 'resolue' | 'rejetee';
  attachements?: string[];
  linkedEntities?: LinkedEntity[]
 
}

export interface Reclamation extends BaseReclamation, BackendData {
  user: User
}