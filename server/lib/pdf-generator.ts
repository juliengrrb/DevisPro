import { Quote, Client, Project, QuoteLineItem, User } from "@shared/schema";

export interface GenerateQuotePdfParams {
  quote: Quote;
  client: Client;
  project: Project | null;
  lineItems: QuoteLineItem[];
  company: User;
}

/**
 * Generate a PDF for a quote
 * 
 * Note: In a real implementation, this would use a library like PDFKit, jsPDF,
 * or html-pdf to generate a PDF. For the current MVP, we'll mock this functionality
 * by returning a dummy Buffer with text content.
 */
export async function generateQuotePdf(params: GenerateQuotePdfParams): Promise<Buffer> {
  const { quote, client, project, lineItems, company } = params;
  
  // This is a simplified mock implementation
  // In a real implementation, we would generate a proper PDF here
  
  const quoteText = `
DEVIS ${quote.number}
Date d'émission: ${formatDate(quote.issueDate)}
Valide jusqu'au: ${quote.validUntil ? formatDate(quote.validUntil) : 'N/A'}

ÉMETTEUR
${company.companyName || 'DevisPro BTP'}
${company.address || ''}
${company.phone || ''}
${company.email || ''}
SIRET: ${company.siret || ''}
RCS: ${company.rcs || ''}
NAF: ${company.naf || ''}

CLIENT
${client.type === 'company' ? client.companyName : `${client.firstName} ${client.lastName}`}
${client.address || ''}
${client.zipCode || ''} ${client.city || ''}
${client.phone || ''}
${client.email || ''}
${client.siret ? `SIRET: ${client.siret}` : ''}

${project ? `CHANTIER
${project.name}
${project.address || ''}
${project.zipCode || ''} ${project.city || ''}
Description: ${project.description || ''}
` : ''}

DÉTAIL DU DEVIS
${lineItems.map(item => {
  if (item.type === 'title') {
    return `\n--- ${item.title} ---\n`;
  } else if (item.type === 'subtitle') {
    return `\n- ${item.title} -\n`;
  } else if (item.type === 'text') {
    return `${item.description}\n`;
  } else {
    return `${item.title}
${item.description || ''}
Quantité: ${item.quantity || ''} ${item.unit || ''}
Prix unitaire: ${item.unitPrice ? formatCurrency(Number(item.unitPrice)) : ''}
TVA: ${item.vatRate ? `${item.vatRate}%` : ''}
Total HT: ${item.totalHT ? formatCurrency(Number(item.totalHT)) : ''}
`;
  }
}).join('\n')}

RÉCAPITULATIF
Total HT: ${formatCurrency(Number(quote.totalHT))}
TVA: ${formatCurrency(Number(quote.totalTVA))}
Total TTC: ${formatCurrency(Number(quote.totalTTC))}
${quote.depositPercent ? `Acompte (${quote.depositPercent}%): ${formatCurrency(Number(quote.deposit))}` : ''}

CONDITIONS
${quote.conditions || 'Aucune condition spécifiée'}

NOTES
${quote.notes || 'Aucune note spécifiée'}
`;

  // Convert the string to a Buffer - in a real implementation we'd return the actual PDF
  return Buffer.from(quoteText, 'utf-8');
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('fr-FR');
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
}
