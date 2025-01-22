"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendEmail = async (to, pin) => {
    const transporter = nodemailer_1.default.createTransport({
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
exports.sendEmail = sendEmail;
