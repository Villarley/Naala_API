"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const pizzip_1 = __importDefault(require("pizzip"));
const docxtemplater_1 = __importDefault(require("docxtemplater"));
const emailSender_1 = require("../utils/emailSender");
const docxToPDF_1 = require("../utils/docxToPDF");
const router = (0, express_1.Router)();
router.post('generateDocx', async (req, res) => {
    try {
        const { selectedOptions, clientEmail, fecha, finca, modelo, propietario, proyecto } = req.body;
        if (!selectedOptions || !clientEmail || !fecha || !finca || !modelo || !propietario) {
            res.status(400).json({ error: 'Faltan datos requeridos' });
            return;
        }
        const templatePath = path_1.default.join(__dirname, '../templates/Naala_contrato.docx');
        if (!(await fs_extra_1.default.pathExists(templatePath))) {
            throw new Error(`No se encontró la plantilla en la ruta: ${templatePath}`);
        }
        const content = await fs_extra_1.default.readFile(templatePath, 'binary');
        const zip = new pizzip_1.default(content);
        const doc = new docxtemplater_1.default(zip);
        const modificaciones = Object.entries(selectedOptions).map(([key, options]) => ({
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
        const filePath = path_1.default.join(__dirname, `../../temp/${contractFileName}`);
        const pdfPath = path_1.default.resolve(__dirname, `../../temp/${pdfFileName}`);
        await fs_extra_1.default.ensureDir(path_1.default.dirname(filePath));
        await fs_extra_1.default.writeFile(filePath, doc.getZip().generate({ type: 'nodebuffer' }));
        if (!(await fs_extra_1.default.pathExists(filePath))) {
            throw new Error(`No se pudo generar el archivo DOCX en la ruta: ${filePath}`);
        }
        // Convertir a PDF
        await (0, docxToPDF_1.convertDocxToPdf)(filePath, pdfPath);
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
                    path: path_1.default.join(__dirname, '../assets/UrbaniaSignature.png'),
                    cid: 'urbania_signature'
                },
            ],
        };
        // Enviar correo con el contrato adjunto en formato PDF
        await (0, emailSender_1.sendEmail)(emailContent);
        emailContent.to = "info@urbania-custom.com";
        await (0, emailSender_1.sendEmail)(emailContent);
        // Enviar el archivo PDF como respuesta al cliente
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${pdfFileName}`);
        const pdfBuffer = await fs_extra_1.default.readFile(pdfPath);
        res.send(pdfBuffer);
        // Eliminar los archivos temporales
        await fs_extra_1.default.unlink(filePath);
        await fs_extra_1.default.unlink(pdfPath);
    }
    catch (error) {
        res.status(500).json({
            error: 'Error interno del servidor',
            details: error.message || error
        });
    }
});
exports.default = router;
