"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPin = exports.generatePin = void 0;
const Pin_1 = __importDefault(require("../models/Pin"));
const emailSender_1 = require("../utils/emailSender");
const generatePin = async (req, res, next) => {
    console.log('CORPORATE_EMAIL:', process.env.CORPORATE_EMAIL);
    console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD);
    const { proyecto, modelo, nombre, cedula, telefono, correo } = req.body;
    try {
        const pin = Math.floor(100000 + Math.random() * 900000).toString(); // Genera un PIN de 6 dígitos
        const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 horas desde ahora
        const newPin = await Pin_1.default.create({
            proyecto,
            modelo,
            nombre,
            cedula,
            telefono,
            correo,
            pin,
            expiresAt,
        });
        console.log('CORPORATE_EMAIL:', process.env.CORPORATE_EMAIL);
        console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD);
        await (0, emailSender_1.sendEmail)(correo, pin);
        await (0, emailSender_1.sendEmail)(process.env.CORPORATE_EMAIL, pin);
        return res.status(201).json({ message: 'PIN generado exitosamente', pin });
    }
    catch (error) {
        console.error('Error generando PIN:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};
exports.generatePin = generatePin;
const verifyPin = async (req, res) => {
    const { pin } = req.body;
    console.log('Verificando PIN:', pin);
    try {
        const foundPin = await Pin_1.default.findOne({ pin });
        if (!foundPin) {
            return res.status(404).json({ message: 'El PIN no existe. Por favor, verifica e intenta de nuevo.' });
        }
        if (foundPin.used) {
            return res.status(400).json({ message: 'El PIN ya fue usado. Por favor, contacta a tu asesor de Naala.' });
        }
        if (foundPin.expiresAt < new Date()) {
            return res.status(400).json({ message: 'El PIN ha expirado. Por favor, contacta a tu asesor de Naala.' });
        }
        if (!foundPin.used && foundPin.expiresAt >= new Date()) {
            foundPin.used = true;
            await foundPin.save();
        }
        return res.status(200).json({ message: 'El PIN es válido.', pin: foundPin });
    }
    catch (error) {
        console.error('Error verificando PIN:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};
exports.verifyPin = verifyPin;
