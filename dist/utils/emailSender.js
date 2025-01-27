"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendEmail = async (mailOptions) => {
    const transporter = nodemailer_1.default.createTransport({
        service: "gmail",
        secure: true,
        auth: {
            user: process.env.CORPORATE_EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
    });
    const fullMailOptions = {
        from: process.env.CORPORATE_EMAIL,
        ...mailOptions,
    };
    try {
        await transporter.sendMail(fullMailOptions);
        console.log(`Correo enviado exitosamente a: ${mailOptions.to}`);
    }
    catch (error) {
        console.error('Error enviando correo:', error);
        throw new Error('No se pudo enviar el correo.');
    }
};
exports.sendEmail = sendEmail;
