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
        const { selectedOptions, clientEmail, fecha, finca, modelo, propietario, proyecto } = req.body;
        if (!selectedOptions || !clientEmail || !fecha || !finca || !modelo || !propietario) {
            res.status(400).json({ error: 'Faltan datos requeridos' });
            return;
        }

        const templatePath = path.join(process.cwd(), 'templates/Naala_contrato.docx');
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
        const filePath = path.join('/tmp', contractFileName);
        const pdfPath = path.join('/tmp', pdfFileName);

        await fs.writeFile(filePath, doc.getZip().generate({ type: 'nodebuffer' }));

        await convertDocxToPdf(filePath, pdfPath);

        const emailContent = {
            to: clientEmail,
            subject: 'Acceso a su contrato de personalización. FF ' + finca + ', Proyecto: ' + proyecto,
            html: `
                <p>Estimado cliente,</p>
                <p>Reciba un cordial saludo de parte de todo el equipo de Urbania.</p>
                <p>Adjunto encontrará su contrato de personalización.</p>
                <p>Si tiene alguna consulta o requiere asistencia, no dude en ponerse en contacto con nosotros.</p>
                <p><strong>Atentamente,<br>Equipo Urbania</strong></p>
            `,
            attachments: [
                { filename: pdfFileName, path: pdfPath },
                { filename: 'UrbaniaSignature.jpg', path: path.join(process.cwd(), 'assets/UrbaniaSignature.jpg'), cid: 'urbania_signature' }
            ],
        };

        await sendEmail(emailContent);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${pdfFileName}`);
        const pdfBuffer = await fs.readFile(pdfPath);
        res.send(pdfBuffer);

        await fs.unlink(filePath);
        await fs.unlink(pdfPath);
    } catch (error: any) {
        console.error('Error generando contrato:', error);
        res.status(500).json({ error: 'Error interno del servidor', details: error.message || error });
    }
});

export default router;
