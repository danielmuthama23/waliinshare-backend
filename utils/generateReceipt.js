import fs from 'fs';
import PDFDocument from 'pdfkit';
import path from 'path';

export const generateReceipt = (purchase, user) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    const receiptDir = path.join('receipts');
    if (!fs.existsSync(receiptDir)) fs.mkdirSync(receiptDir);

    const fileName = `receipt-${purchase._id}.pdf`;
    const filePath = path.join(receiptDir, fileName);
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // === Logo (Optional) ===
    const logoPath = path.join('server', 'assets', 'logo.jpg');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 45, { width: 100 });
    }

    // === Title ===
    doc
      .fontSize(24)
      .fillColor('#333')
      .text('Payment Receipt', { align: 'right' });

    doc
      .fontSize(10)
      .fillColor('#666')
      .text(new Date().toLocaleString(), { align: 'right' });

    doc.moveDown(2);
    doc
      .strokeColor('#999')
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke();

    doc.moveDown(2);

    // === Customer Info ===
    doc
      .fontSize(14)
      .fillColor('#333')
      .text('Customer Information', { underline: true });

    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('#000');
    doc.text(`Name: ${user.fullName}`);
    doc.text(`Email: ${user.email}`);
    doc.text(`Phone: ${purchase.phone}`);

    doc.moveDown(1.5);

    // === Payment Info ===
    doc
      .fontSize(14)
      .fillColor('#333')
      .text('Payment Details', { underline: true });

    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('#000');
    doc.text(`Transaction ID: ${purchase._id}`);
    doc.text(`Payment Method: ${capitalize(purchase.paymentMethod)}`);
    doc.text(`Shares Purchased: ${purchase.shares}`);
    doc.text(`Total Paid: $${parseFloat(purchase.totalPrice).toFixed(2)}`);
    doc.text(`Date: ${new Date(purchase.createdAt).toLocaleString()}`);

    doc.moveDown(2);

    // === Footer ===
    doc
      .fontSize(11)
      .fillColor('#888')
      .text(
        'Thank you for your investment with Waliin Investment.',
        50,
        doc.y,
        { align: 'center' }
      );

    doc
      .fontSize(9)
      .fillColor('#bbb')
      .text(
        'This receipt is system generated and does not require a signature.',
        50,
        doc.y + 10,
        { align: 'center' }
      );

    doc.end();

    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
};

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}