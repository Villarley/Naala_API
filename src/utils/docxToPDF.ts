import libreConvert from 'libreoffice-convert';
import fs from 'fs-extra';

export const convertDocxToPdf = async (inputPath: string, outputPath: string): Promise<string> => {
  try {
    // Read the DOCX file into a buffer
    const docxBuffer = await fs.readFile(inputPath);

    // Use libreoffice-convert to convert the file to PDF
    return new Promise((resolve, reject) => {
      libreConvert.convert(docxBuffer, '.pdf', undefined, async (err, done) => {
        if (err) {
          console.error('Error converting DOCX to PDF:', err);
          return reject(new Error('Error converting the document to PDF: ' + err));
        }

        try {
          // Write the converted PDF to the output path
          await fs.writeFile(outputPath, done);
          console.log('PDF successfully created at:', outputPath);
          resolve(outputPath);
        } catch (writeError) {
          console.error('Error writing PDF file:', writeError);
          reject(new Error('Failed to write the PDF file: ' + writeError));
        }
      });
    });
  } catch (readError) {
    console.error('Error reading DOCX file:', readError);
    throw new Error('Failed to read the DOCX file: ' + readError);
  }
};
