import { NextFunction, Request, Response } from 'express';
import Pin from '../models/Pin';
import { sendEmail } from '../utils/emailSender';

export const generatePin = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
  const { proyecto, modelo, nombre, finca, cedula, telefono, correo } = req.body;

  try {
    const pin = Math.floor(100000 + Math.random() * 900000).toString(); // Genera un PIN de 6 dígitos
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 horas desde ahora

    const newPin = await Pin.create({
      proyecto,
      modelo,
      nombre,
      finca,
      cedula,
      telefono,
      correo,
      pin,
      expiresAt,
    });
    

    const emailContent = {
      to: correo,
      subject: 'Acceso a la personalización de su hogar',
      html: `
        <p>Estimado cliente,</p>
        <p>Reciba un cordial saludo de parte de todo el equipo de Urbania.</p>
        <p>Por este medio, le compartimos el enlace de acceso a la plataforma de personalización de su hogar:</p>
        <p><a href="https://urbania-custom.com/pin" target="_blank">Acceder a la personalización</a></p>
        <p>Para ingresar, el sistema le solicitará el siguiente PIN: <strong>${pin}</strong></p>
        <p>Tenga en cuenta que este PIN es de único uso y tiene una vigencia de 48 horas a partir de la recepción de este correo.</p>
        <p>Si tiene alguna consulta o requiere asistencia, no dude en ponerse en contacto con nosotros.</p>
        <p>Atentamente,<br>Equipo Urbania</p>
      `,
    };

    await sendEmail(emailContent);
    await sendEmail({ ...emailContent, to: process.env.CORPORATE_EMAIL! });

    return res.status(201).json({ message: 'PIN generado exitosamente', pin });
  } catch (error) {
    console.error('Error generando PIN:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const verifyPin = async (req: Request, res: Response) => {
    const { pin } = req.body;
    console.log('Verificando PIN:', pin);
    try {
      const foundPin = await Pin.findOne({ pin });
  
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
    } catch (error) {
      console.error('Error verificando PIN:', error);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
};