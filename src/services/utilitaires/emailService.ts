// src/services/utilitaires/emailService.ts
import { smtpService } from "../providers/smtpService";

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

    await smtpService.send({
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

    await smtpService.send({
      to,
      subject: "Réinitialisation de votre mot de passe",
      html,
      text: `Votre code de réinitialisation : ${otp}`,
    });
  },
};