import libreConvert from 'libreoffice-convert';
import fs from 'fs-extra';

export const convertDocxToPdf = async (inputPath: string, outputPath: string) => {
  const docxBuffer = await fs.readFile(inputPath);
  return new Promise((resolve, reject) => {
    libreConvert.convert(docxBuffer, '.pdf', undefined, (err, done) => {
      if (err) {
        reject('Error convirtiendo el documento a PDF: ' + err);
      }
      fs.writeFileSync(outputPath, done);
      resolve(outputPath);
    });
  });
};
