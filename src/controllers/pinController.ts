import { NextFunction, Request, Response } from 'express';
import Pin from '../models/Pin';
import { sendEmail } from '../utils/emailSender';
import path from 'path';
import fs from 'fs-extra';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { convertDocxToPdf } from '../utils/docxToPDF';

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
        <img src="cid:urbania_signature" alt="Urbania Signature" style="width: auto; height: auto;" />
        <br />
        <a href="mailto:personalizaciones@urbania.cr" style="background-color: #0056b3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Contactar Soporte
        </a>
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

export const generateDocx = async (req: Request, res: Response): Promise<void> => {
    try {
        const { selectedOptions, clientEmail, fecha, finca, modelo, propietario, proyecto } = req.body;
        if (!selectedOptions || !clientEmail || !fecha || !finca || !modelo || !propietario) {
            res.status(400).json({ error: 'Faltan datos requeridos' });
            return;
        }

        const templatePath = path.join(__dirname, '../templates/Naala_contrato.docx');
        if (!(await fs.pathExists(templatePath))) {
            throw new Error(`No se encontró la plantilla en la ruta: ${templatePath}`);
        }
        const content = await fs.readFile(templatePath, 'binary');

        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip);

        const modificaciones = Object.entries(selectedOptions as { [key: string]: any[] }).map(([key, options]) => ({
            pregunta: key,
            opciones: options.map((option) => ({
                nombre: option.name,
                precio: `$${option.price.toFixed(2)}`
            }))
        }));
        
        // Calcular el total sumando los precios de todas las opciones
        const total = modificaciones
        .reduce((acc, item) => {
            const subtotal = item.opciones.reduce((sum, option) => sum + parseFloat(option.precio.replace('$', '')), 0);
            return acc + subtotal;
        }, 0)
        .toFixed(2);


        doc.setData({
            fecha,
            finca,
            modelo,
            propietario,
            modificaciones,
            total,
        });

        doc.render();

        const contractFileName = `${propietario}-Contrato.docx`;
        const pdfFileName = `${propietario}-Contrato.pdf`;
        const filePath = path.join(__dirname, `../../temp/${contractFileName}`);
        const pdfPath = path.resolve(__dirname, `../../temp/${pdfFileName}`);

        await fs.ensureDir(path.dirname(filePath));
        await fs.writeFile(filePath, doc.getZip().generate({ type: 'nodebuffer' }));

        if (!(await fs.pathExists(filePath))) {
            throw new Error(`No se pudo generar el archivo DOCX en la ruta: ${filePath}`);
        }

        // Convertir a PDF
        await convertDocxToPdf(filePath, pdfPath);

// Configuración del email con el contrato adjunto
const emailContent = {
    to: clientEmail,
    subject: 'Acceso a su contrato de personalización. FF ' + finca + ', Proyecto: ' + proyecto,
    html: `
        <p>Estimado cliente,</p>
        <p>Reciba un cordial saludo de parte de todo el equipo de Urbania.</p>
        <p>Adjunto encontrará su contrato de personalización.</p>
        <p>Si tiene alguna consulta o requiere asistencia, no dude en ponerse en contacto con nosotros.</p>
        <p><strong>Atentamente,<br>Equipo Urbania</strong></p>
        <img src="cid:urbania_signature" alt="Urbania Signature" style="width: auto; height: auto;" />
        <br />
        <a href="mailto:personalizaciones@urbania.cr" style="background-color: #0056b3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Contactar Soporte
        </a>
    `,
    attachments: [
        {
            filename: pdfFileName,
            path: pdfPath,
        },
        {
            filename: 'UrbaniaSignature.jpg',
            path: path.join(__dirname, '../assets/UrbaniaSignature.png'),
            cid: 'urbania_signature'
        },
        ],
    };


        // Enviar correo con el contrato adjunto en formato PDF
        await sendEmail(emailContent);
        emailContent.to = "info@urbania-custom.com"
        await sendEmail(emailContent);

        // Enviar el archivo PDF como respuesta al cliente
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${pdfFileName}`);
        const pdfBuffer = await fs.readFile(pdfPath);
        res.send(pdfBuffer);

        // Eliminar los archivos temporales
        await fs.unlink(filePath);
        await fs.unlink(pdfPath);
    } catch (error: any) {
        res.status(500).json({ 
            error: 'Error interno del servidor', 
            details: error.message || error 
        });
    }    
}

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