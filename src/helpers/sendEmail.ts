import axios from "axios";
import { Request, Response } from "express";

export const sendEmail = async (subject: string, text: string, html: string, to: string) => {
 
  try {
    const response = await axios.post(
      "https://mjo.primeconnect2.com/api/email/send",
      {
        subject,
        text,
        html,
        to,
        companyName: "Permute"

      },
      {
        headers: {
          "Content-Type": "application/json",
          // si ton API exige une clé, ajoute-la ici
          // "Authorization": `Bearer ${process.env.MAIL_API_TOKEN}`,
        },
        timeout: 10_000,
      }
    );

    console.log(response)

   

  } catch (error: any) {
    console.log(
      "Erreur server-to-server mail:",
      error?.response?.data || error.message
    );

  
    throw new Error("Erreur lors de l'envoi de  email");
  }
};