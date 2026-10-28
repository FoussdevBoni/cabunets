// src/services/providers/smtpService.ts
import nodemailer, { Transporter } from "nodemailer";

class SmtpService {
  private transporter: Transporter | null = null;

  private getTransporter(): Transporter {
    if (this.transporter) return this.transporter;

    this.transporter = nodemailer.createTransport({
      ...(process.env.SMTP_HOST ? { host: process.env.SMTP_HOST } : { service: "gmail" }),
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER ?? process.env.MAIL_USER,
        pass: process.env.SMTP_PASS ?? process.env.MAIL_PASS,
      },
    });

    return this.transporter;
  }

  async send(options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }): Promise<void> {
    const transporter = this.getTransporter();
    await transporter.sendMail({
      from: process.env.SMTP_FROM ?? process.env.SMTP_USER ?? process.env.MAIL_USER ?? "no-reply@cabunets.com",
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
  }
}

export const smtpService = new SmtpService();