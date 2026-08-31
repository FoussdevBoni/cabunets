import { Client } from "../utils/database";
import { BackendData } from "./core/BackendData";

export interface BaseReclamation {
 
  clientId: string; 
  reference?: string; 
  objet: string;
  description?: string; 
  statut: 'brouillon' | 'soumise' | 'en_cours' | 'resolue' | 'rejetee'; 
  attachements?: string[]
}

export interface Reclamation extends BaseReclamation , BackendData {
  client: Client
}