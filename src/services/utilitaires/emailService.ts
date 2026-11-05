import axios from "axios";
// src/services/utilitaires/emailService.ts
import { smtpService } from "../providers/smtpService";

async function sendEmail(options: Parameters<typeof smtpService.send>[0]): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    await smtpService.send(options);
    return;
  }

  const from = process.env.RESEND_FROM?.trim() || "Cabunets <no-reply@cabunets.com>";
  try {
    await axios.post("https://api.resend.com/emails", {
      ...options,
      from,
      to: [options.to],
    }, {
      headers: { Authorization: "Bearer " + apiKey },
      timeout: 10_000,
      maxRedirects: 0,
    });
  } catch (error) {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;
    console.error("[Resend] Email delivery request failed", { status });
    throw new Error("Le service d’envoi email est indisponible.");
  }
}

export const emailService = {
  async sendConfirmationOtp(to: string, otp: string): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Confirmation de votre compte Cabunets</h2>
        <p>Votre code de confirmation est :</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px;">
          ${otp}
        </p>
        <p>Ce code expire dans 30 minutes.</p>
      </div>
    `;

    await sendEmail({
      to,
      subject: "Confirmation de votre compte Cabunets",
      html,
      text: `Votre code de confirmation : ${otp}`,
    });
  },

  async sendPasswordResetOtp(to: string, otp: string): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Réinitialisation de votre mot de passe</h2>
        <p>Votre code de réinitialisation est :</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px;">
          ${otp}
        </p>
        <p>Ce code expire dans 10 minutes.</p>
      </div>
    `;

    await sendEmail({
      to,
      subject: "Réinitialisation de votre mot de passe",
      html,
      text: `Votre code de réinitialisation : ${otp}`,
    });
  },
};