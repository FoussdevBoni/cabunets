import axios from "axios";
import { Request, Response } from "express";

export const sendEmail = async (req: Request, res: Response) => {
  const { subject, text, html, to } = req.body;

  if (!subject || !text) {
    return res.status(400).json({ error: "Subject et message obligatoires" });
  }

  try {
    const response = await axios.post(
      "https://mjo.primeconnect2.com/api/email/send",
      {
        subject,
        text,
        html,
        to,
        companyName: "Cabunets"

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

    return res.status(200).json({
      message: "Email envoyé via serveur mail distant ✅",
      providerResponse: response.data,
    });

  } catch (error: any) {
    console.error(
      "Erreur server-to-server mail:",
      error?.response?.data || error.message
    );

    return res.status(502).json({
      error: "Service mail indisponible",
    });
  }
};
