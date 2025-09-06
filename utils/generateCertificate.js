import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve important absolute paths once
const ROOT_DIR = path.resolve(__dirname, '..');               // /server
const UPLOADS_DIR = path.join(ROOT_DIR, 'uploads');           // /server/uploads
const ASSETS_DIR  = path.join(ROOT_DIR, 'assets');            // /server/assets

/**
 * Generates a share certificate PDF.
 * @param {Object} options
 * @param {string} options.certId
 * @param {string} options.fullName
 * @param {number} options.shares
 * @param {number} options.perSharePrice
 * @param {number} options.totalPrice
 * @param {string} options.proportion
 * @param {string} options.purchaseDate
 * @param {string} options.photoPath  // filename in /uploads (e.g., '1728-...-photo.jpg')
 * @param {string} options.outputPath // absolute or relative to server root
 */
export const generateCertificate = ({
  certId,
  fullName,
  shares,
  perSharePrice,
  totalPrice,
  proportion,
  purchaseDate,
  photoPath,
  outputPath,
}) => {
  return new Promise((resolve, reject) => {
    try {
      // Make sure output folder exists
      const absoluteOutputPath = path.isAbsolute(outputPath)
        ? outputPath
        : path.join(ROOT_DIR, outputPath);
      const outDir = path.dirname(absoluteOutputPath);
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

      const doc = new PDFDocument({ size: 'A4', layout: 'portrait' });
      const stream = fs.createWriteStream(absoluteOutputPath);
      doc.pipe(stream);

      // Border
      doc.lineWidth(2).rect(30, 30, 535, 780).stroke('#d4af37');

      // Logo
      const logoPath = path.join(ASSETS_DIR, 'logo.jpg');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 60, 40, { width: 80 });
      }

      // Cert ID
      doc.font('Helvetica-Bold').fontSize(12).text(`ID Number: ${certId}`, 400, 50, { align: 'right' });

      // Title
      doc.fontSize(28).fillColor('#0b3d91').text('CERTIFICATE', 0, 120, { align: 'center' });
      doc.fontSize(16).fillColor('#5c47b7').text('OF SHARE AT WALIIN INC', { align: 'center' });

      // Intro
      doc.moveDown(1);
      doc.fillColor('black').fontSize(12).text('This certificate is proudly presented to:', { align: 'center' });

      // Name
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').fontSize(20).fillColor('#1b1b1b').text(fullName, { align: 'center' });

      // Certificate photo (JPEG/PNG only)
      if (photoPath) {
        const absolutePhoto = path.isAbsolute(photoPath)
          ? photoPath
          : path.join(UPLOADS_DIR, photoPath);

        try {
          // PDFKit supports PNG/JPEG. Skip if not supported/exists.
          if (fs.existsSync(absolutePhoto) && /\.(png|jpg|jpeg)$/i.test(absolutePhoto)) {
            doc.image(absolutePhoto, 460, 120, { width: 90, height: 110 }).stroke();
          }
        } catch (e) {
          console.warn('Certificate photo could not be embedded:', e?.message);
        }
      }

      // Body
      const description =
        `${shares} Shares from Waliin Inc. have been successfully purchased by the above-named individual. ` +
        `Each share costs ${perSharePrice} USD, totaling ${totalPrice} USD. ` +
        `This constitutes a ${proportion} stake in the company. ` +
        `The purchase was completed on ${purchaseDate}.`;

      doc.moveDown(1.5);
      doc.fontSize(11).fillColor('black').text(description, {
        align: 'center',
        lineGap: 4,
        paragraphGap: 6,
        indent: 20,
        width: 460,
      });

      // Signature
      const signaturePath = path.join(ASSETS_DIR, 'signature.png');
      if (fs.existsSync(signaturePath)) {
        doc.image(signaturePath, 70, 600, { width: 120 });
      }

      doc.moveDown(4);
      doc.font('Helvetica-Bold').fontSize(12).text('Seifu Haile Tolesa,', 60, 650);
      doc.font('Helvetica').text('CEO', 60, 665);

      // Date
      doc.fontSize(12).text(purchaseDate, 450, 650, { align: 'right' });
      doc.text('Date', 495, 665, { align: 'right' });

      doc.end();
      stream.on('finish', () => resolve(true));
      stream.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });
};