import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,   // défini dans .env
    pass: process.env.MAIL_PASS,   // App Password Gmail ou équivalent
  },
});
