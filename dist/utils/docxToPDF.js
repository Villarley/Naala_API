"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertDocxToPdf = void 0;
const libreoffice_convert_1 = __importDefault(require("libreoffice-convert"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const convertDocxToPdf = async (inputPath, outputPath) => {
    const docxBuffer = await fs_extra_1.default.readFile(inputPath);
    return new Promise((resolve, reject) => {
        libreoffice_convert_1.default.convert(docxBuffer, '.pdf', undefined, (err, done) => {
            if (err) {
                reject('Error convirtiendo el documento a PDF: ' + err);
            }
            fs_extra_1.default.writeFileSync(outputPath, done);
            resolve(outputPath);
        });
    });
};
exports.convertDocxToPdf = convertDocxToPdf;
