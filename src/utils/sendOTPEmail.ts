// utils/sendOtpEmail.ts
import axios from "axios";

export const sendOtpEmail = async (to: string, otp: string, subject?: string) => {
  try {
    await axios.post(
      "https://mjo.primeconnect2.com/api/email/send",
      {
        to,
        subject: subject || "Vérification par code OTP",
        text: `Votre code OTP est : ${otp}`,
        html: `<p>Votre code OTP est : <strong>${otp}</strong></p>`,
        companyName: "Cabunets"
      },
      {
        headers: {
          "Content-Type": "application/json",
          // si ton API nécessite une clé :
          // "X-API-KEY": process.env.MAIL_API_KEY!,
        },
        timeout: 10_000,
      }
    );
  } catch (error: any) {
    console.error(
      "Erreur envoi OTP mail:",
      error?.response?.data || error.message
    );
    throw new Error("Erreur lors de l'envoi de l'OTP par email");
  }
};
