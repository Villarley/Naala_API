import { Router, Request, Response } from 'express';
import fs from 'fs-extra';
import path from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { sendEmail } from '../utils/emailSender';
import { convertDocxToPdf } from '../utils/docxToPDF';

const router = Router();

router.post('/generateDocx', async (req: Request, res: Response): Promise<void> => {
    try {
        const { selectedOptions, clientEmail, fecha, finca, modelo, propietario } = req.body;
        if (!selectedOptions || !clientEmail || !fecha || !finca || !modelo || !propietario) {
            res.status(400).json({ error: 'Faltan datos requeridos' });
            return;
        }
        console.log('Generando documento para:', propietario);
        console.log('Opciones seleccionadas:', selectedOptions);
        const templatePath = path.join(__dirname, '../templates/Naala_contrato.docx');
        if (!(await fs.pathExists(templatePath))) {
            throw new Error(`No se encontró la plantilla en la ruta: ${templatePath}`);
        }
        const content = await fs.readFile(templatePath, 'binary');

        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip);
        const modificaciones = Object.keys(selectedOptions).map((key) => ({
            pregunta: key,
            nombre: selectedOptions[key].name,
            precio: `$${selectedOptions[key].price.toFixed(2)}`,
            
        }));
        console.log('Modificaciones:', modificaciones);
        const total = modificaciones.reduce((acc, item) => acc + parseFloat(item.precio.replace('$', '')), 0).toFixed(2);
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

        // Configuración del email mejorado
        const emailContent = {
            to: clientEmail,
            subject: 'Acceso a su contrato de personalización',
            html: `
                <p>Estimado cliente,</p>
                <p>Reciba un cordial saludo de parte de todo el equipo de Urbania.</p>
                <p>Adjunto encontrará su contrato de personalización.</p>
                <p>Si tiene alguna consulta o requiere asistencia, no dude en ponerse en contacto con nosotros.</p>
                <p><strong>Atentamente,<br>Equipo Urbania</strong></p>
                <a href="mailto:soporte@urbania.com" style="background-color: #0056b3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                Contactar Soporte
                </a>
            `,
            attachments: [
                {
                    filename: pdfFileName,
                    path: pdfPath,
                },
            ],
        };

        // Enviar correo con el contrato adjunto en formato PDF
        await sendEmail(emailContent);

        // Leer y enviar el archivo PDF al cliente
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${pdfFileName}`);
        const pdfBuffer = await fs.readFile(pdfPath);
        res.send(pdfBuffer);

        // Eliminar los archivos temporales
        await fs.unlink(filePath);
        await fs.unlink(pdfPath);
        console.log(`Archivo ${pdfFileName} eliminado después de ser enviado.`);
    } catch (error: any) {
        console.error('Error generando documento:', error.message || error);
        res.status(500).json({ 
            error: 'Error interno del servidor', 
            details: error.message || error 
        });
    }    
});

export default router;
