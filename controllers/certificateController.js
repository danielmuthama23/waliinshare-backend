import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import Purchase from '../models/Purchase.js';

export const generateCertificate = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.purchaseId).populate('userId');
    if (!purchase) return res.status(404).json({ message: 'Purchase not found' });

    if (purchase.status !== 'verified') {
      return res.status(400).json({ message: 'Only verified purchases get certificates' });
    }

    const user = purchase.userId;
    const certDir = path.resolve('certificates');
    if (!fs.existsSync(certDir)) fs.mkdirSync(certDir);

    const certPath = path.join(certDir, `certificate-${purchase._id}.pdf`);
    const logoPath = path.resolve('assets', 'logo.jpg');

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const writeStream = fs.createWriteStream(certPath);
    doc.pipe(writeStream);

    // ✅ Add watermark in center
    if (fs.existsSync(logoPath)) {
      doc.opacity(0.07);
      doc.image(logoPath, doc.page.width / 2 - 200, doc.page.height / 2 - 200, {
        width: 400,
        align: 'center',
        valign: 'center',
      });
      doc.opacity(1);
    }

    // ✅ Add visible logo at top
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, doc.page.width / 2 - 50, 30, { width: 100 });
    }

    doc.moveDown(6);
    doc.fontSize(26).fillColor('#1E3A8A').text('Certificate of Share Purchase', {
      align: 'center',
    });

    doc.moveDown(1);
    doc.fontSize(14).fillColor('#333').text('This is to certify that', {
      align: 'center',
    });

    doc.moveDown(1);
    doc.fontSize(20).fillColor('#000').text(user.fullName, {
      align: 'center',
      underline: true,
    });

    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('#444').text(`(${user.email})`, {
      align: 'center',
    });

    doc.moveDown(1.5);
    doc.fontSize(14).fillColor('#444').text(
      `has successfully purchased ${purchase.shares} share(s) totaling ${purchase.currency} ${purchase.totalPrice}`,
      { align: 'center' }
    );

    doc.moveDown(1);
    doc.fontSize(12).fillColor('#888').text(
      `Payment Method: ${purchase.paymentMethod.toUpperCase()}`,
      { align: 'center' }
    );

    doc.moveDown(2);
    doc.fontSize(12).fillColor('#666').text(`Purchase ID: ${purchase._id}`, {
      align: 'center',
    });

    doc.text(`Date: ${new Date(purchase.createdAt).toDateString()}`, {
      align: 'center',
    });

    doc.moveDown(4);
    doc.fontSize(12).fillColor('#555').text('Authorized Signature', {
      align: 'right',
    });

    doc.fontSize(10).text('Waliin Investment', {
      align: 'right',
    });

    doc.end();

    writeStream.on('finish', () => {
      return res.download(certPath);
    });
  } catch (err) {
    console.error('Certificate generation error:', err);
    res.status(500).json({ message: 'Error generating certificate' });
  }
};