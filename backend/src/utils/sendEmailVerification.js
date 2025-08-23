import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const tronsporter = nodemailer.createTransport({
  service: "gmail",
  // host: "smtp.gmail.com",
  // port: 465,
  // secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.APP_PASS,
  },
});

export const sendEmailVerification = async (to, token) => {
  let verificationUrl = `"${process.env.CLIENT_URL}/verify-email?token=${token}"`;

  await tronsporter.sendMail({
    from: `"Forum App ENSA" <${process.env.EMAIL}>`,
    to: to,
    subject: "Vérification de votre adresse email",
    html: `
                <h2>Bienvenue 👋</h2>
                <p>Merci de vous être inscrit. Veuillez vérifier votre adresse email en cliquant sur le lien ci-dessous :</p>
                <a href="${verificationUrl}" style="background-color:#4CAF50;color:white;padding:10px 20px;text-decoration:none;">Vérifier mon email</a>
                <p>Ou copiez ce lien dans votre navigateur :</p>
               <p>${verificationUrl}</p>
            `,
  });
};
