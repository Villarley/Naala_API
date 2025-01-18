import nodemailer from 'nodemailer';

export const sendEmail = async (to: string, pin: string) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.CORPORATE_EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.CORPORATE_EMAIL,
    to,
    subject: 'Tu PIN de personalización - Proyecto Naala',
    text: `Hola, tu PIN de acceso es: ${pin}. Este PIN expirará en 48 horas.`,
  };

  await transporter.sendMail(mailOptions);
};
