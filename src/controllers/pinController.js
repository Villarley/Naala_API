"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePin = void 0;
const Pin_1 = __importDefault(require("../models/Pin"));
const emailSender_1 = require("../utils/emailSender");
const generatePin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { proyecto, modelo, nombre, cedula, telefono, correo } = req.body;
    try {
        const pin = Math.floor(100000 + Math.random() * 900000).toString(); // Genera un PIN de 6 dígitos
        const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 horas desde ahora
        const newPin = yield Pin_1.default.create({
            proyecto,
            modelo,
            nombre,
            cedula,
            telefono,
            correo,
            pin,
            expiresAt,
        });
        // Envía el PIN por correo
        yield (0, emailSender_1.sendEmail)(correo, pin);
        yield (0, emailSender_1.sendEmail)(process.env.CORPORATE_EMAIL, pin);
        return res.status(201).json({ message: 'PIN generado exitosamente', pin });
    }
    catch (error) {
        console.error('Error generando PIN:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
});
exports.generatePin = generatePin;
