// src/services/mailService.js
import nodemailer from "nodemailer";

let transporter;

// Memakai akun uji coba Ethereal (email tidak sampai ke inbox asli)
const getTransporter = async () => {
  if (transporter) return transporter;
  const account = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: { user: account.user, pass: account.pass },
  });
  return transporter;
};

export const sendVerificationEmail = async (email, token) => {
  const mailer = await getTransporter();
  const link = `http://localhost:${process.env.PORT || 3000}/verify-email?token=${token}`;

  const info = await mailer.sendMail({
    from: '"EduCourse App" <no-reply@educourse.test>',
    to: email,
    subject: "Verifikasi Email EduCourse",
    html: `<p>Klik link berikut untuk verifikasi akun kamu:</p><p><a href="${link}">${link}</a></p>`,
  });

  return nodemailer.getTestMessageUrl(info) || null;
};