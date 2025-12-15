import axios from "axios";
import { API_URL } from "../utils/api";

const EMAIL_API_URL = `${API_URL}/email/send`;

export interface Email {
  text: string;
  subject: string;
  html?: string;
  to: string;
}

export async function sendEmail(payload: Email) {
  try {
    const { data } = await axios.post(EMAIL_API_URL, payload);
    return data;
  } catch (error: any) {
    console.error("Erreur lors de l’envoi d’email:", error?.response || error);
    throw error;
  }
}


