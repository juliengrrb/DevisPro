import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Client, Quote, QuoteItem } from '@shared/schema';
import { formatCurrency, formatDate, calculateSubtotal, calculateTotalTax, calculateTotal } from './utils';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

/**
 * Generate a PDF for a quote
 */
export function generateQuotePdf(quote: Quote, client: Client, items: QuoteItem[]): jsPDF {
  // Create a new PDF
  const doc = new jsPDF();
  
  // Add company header
  doc.setFontSize(20);
  doc.setTextColor(59, 130, 246); // primary-600
  doc.text('DevisPro', 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128); // text-gray-500
  doc.text('Votre solution de devis pour le BTP', 14, 26);
  doc.text('contact@devispro.com', 14, 30);
  doc.text('01 23 45 67 89', 14, 34);
  
  // Add document title
  doc.setFontSize(16);
  doc.setTextColor(17, 24, 39); // text-gray-900
  doc.text(`DEVIS N° ${quote.quote_number}`, 105, 30, { align: 'center' });
  
  // Add dates
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128); // text-gray-500
  doc.text(`Date d'émission: ${formatDate(quote.issue_date)}`, 170, 24, { align: 'right' });
  doc.text(`Valable jusqu'au: ${formatDate(quote.valid_until)}`, 170, 30, { align: 'right' });
  
  // Add client details
  doc.setFontSize(12);
  doc.setTextColor(17, 24, 39); // text-gray-900
  doc.text('INFORMATIONS CLIENT', 14, 50);
  
  doc.setFontSize(10);
  doc.text(client.name, 14, 58);
  if (client.company) doc.text(client.company, 14, 63);
  doc.text(client.address, 14, 68);
  doc.text(`${client.postal_code} ${client.city}`, 14, 73);
  doc.text(`Email: ${client.email}`, 14, 78);
  doc.text(`Tél: ${client.phone}`, 14, 83);
  
  // Add table for quote items
  const tableColumn = ["Description", "Quantité", "Prix unitaire", "TVA (%)", "Total HT"];
  const tableRows: any[][] = [];
  
  items.forEach((item) => {
    const totalHt = item.quantity * item.unit_price;
    tableRows.push([
      item.description,
      item.quantity,
      formatCurrency(item.unit_price),
      `${item.tax_rate}%`,
      formatCurrency(totalHt)
    ]);
  });
  
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 95,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] }, // primary-600 and white
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 30, halign: 'right' }
    }
  });
  
  // Calculate totals
  const subtotal = calculateSubtotal(items);
  const totalTax = calculateTotalTax(items);
  const totalAmount = calculateTotal(items);
  
  // Add totals
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  // Summary box
  doc.setDrawColor(229, 231, 235); // border-gray-200
  doc.setFillColor(249, 250, 251); // bg-gray-50
  doc.roundedRect(120, finalY, 75, 30, 3, 3, 'FD');
  
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128); // text-gray-500
  
  doc.text('Sous-total HT:', 125, finalY + 8);
  doc.text('TVA:', 125, finalY + 16);
  
  doc.setFontSize(10);
  doc.setTextColor(17, 24, 39); // text-gray-900
  doc.text('Total TTC:', 125, finalY + 24);
  
  // Amounts
  doc.setFontSize(9);
  doc.text(formatCurrency(subtotal), 190, finalY + 8, { align: 'right' });
  doc.text(formatCurrency(totalTax), 190, finalY + 16, { align: 'right' });
  
  doc.setFontSize(10);
  doc.setTextColor(59, 130, 246); // primary-600
  doc.setFontStyle('bold');
  doc.text(formatCurrency(totalAmount), 190, finalY + 24, { align: 'right' });
  
  // Add payment terms
  doc.setFontSize(10);
  doc.setTextColor(17, 24, 39); // text-gray-900
  doc.setFontStyle('normal');
  doc.text(`Conditions de paiement: ${quote.payment_terms}`, 14, finalY + 8);
  
  // Add notes if they exist
  if (quote.notes) {
    doc.setFontSize(10);
    doc.text('Notes:', 14, finalY + 16);
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128); // text-gray-500
    
    // Handle multi-line notes
    const splitNotes = doc.splitTextToSize(quote.notes, 100);
    doc.text(splitNotes, 14, finalY + 22);
  }
  
  // Add footer
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175); // text-gray-400
  doc.text('Document généré par DevisPro - www.devispro.com', 105, 285, { align: 'center' });
  
  return doc;
}

/**
 * Download the PDF for a quote
 */
export function downloadQuotePdf(quote: Quote, client: Client, items: QuoteItem[]): void {
  const doc = generateQuotePdf(quote, client, items);
  doc.save(`Devis_${quote.quote_number}.pdf`);
}
