import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a price value for display
 */
export function formatPrice(price: number | string): string {
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(numPrice);
}

/**
 * Format a number with specified decimal places
 */
export function formatNumber(number: number | string, decimals = 2): string {
  const num = typeof number === "string" ? parseFloat(number) : number;
  return num.toFixed(decimals);
}

/**
 * Format a date for display
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("fr-FR");
}

/**
 * Format a date as YYYY-MM-DD (for inputs)
 */
export function formatDateInput(date: Date | string | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0];
}

/**
 * Generate a unique quote number
 */
export function generateQuoteNumber(): string {
  const today = new Date();
  const year = today.getFullYear();
  const randomPart = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `DEVIS-${year}-${randomPart}`;
}

/**
 * Generate a unique invoice number
 */
export function generateInvoiceNumber(): string {
  const today = new Date();
  const year = today.getFullYear();
  const randomPart = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `FACTURE-${year}-${randomPart}`;
}

/**
 * Calculate the total amount for a line item
 */
export function calculateLineItemTotal(
  quantity: number | string | null,
  unitPrice: number | string | null
): number {
  if (!quantity || !unitPrice) return 0;
  const qty = typeof quantity === "string" ? parseFloat(quantity) : quantity;
  const price = typeof unitPrice === "string" ? parseFloat(unitPrice) : unitPrice;
  return qty * price;
}

/**
 * Apply CSS in a global manner
 */
export function createGlobalStyle(): void {
  const styleElement = document.createElement("style");
  styleElement.innerHTML = `
    input[type="date"] {
      appearance: none;
      background-color: #fff;
      border: 1px solid hsl(var(--input));
      border-radius: var(--radius);
      padding: 0.5rem;
    }
    
    input[type="date"]:focus {
      outline: none;
      border-color: hsl(var(--ring));
      box-shadow: 0 0 0 2px rgba(var(--ring), 0.2);
    }
  `;
  document.head.appendChild(styleElement);
}

/**
 * Get status badge variant based on quote/invoice status
 */
export function getStatusVariant(status: string): 
  "default" | "primary" | "secondary" | "destructive" | "outline" | "success" {
  switch (status.toLowerCase()) {
    case "draft":
      return "secondary";
    case "sent":
      return "primary";
    case "signed":
      return "success";
    case "rejected":
      return "destructive";
    case "paid":
      return "success";
    case "pending":
      return "primary";
    default:
      return "outline";
  }
}

/**
 * Calculate quote totals
 */
export function calculateQuoteTotals(lineItems: any[]): { 
  totalHT: number; 
  totalTVA: number; 
  totalTTC: number;
} {
  // Only consider line items with type material, labor, or work
  const validLineItems = lineItems.filter(
    item => ["material", "labor", "work"].includes(item.type) && item.totalHT
  );
  
  // Calculate totalHT
  const totalHT = validLineItems.reduce((sum, item) => {
    const itemTotal = typeof item.totalHT === "string" 
      ? parseFloat(item.totalHT) 
      : (item.totalHT || 0);
    return sum + itemTotal;
  }, 0);
  
  // Calculate totalTVA
  const totalTVA = validLineItems.reduce((sum, item) => {
    const itemTotal = typeof item.totalHT === "string" 
      ? parseFloat(item.totalHT) 
      : (item.totalHT || 0);
    const vatRate = typeof item.vatRate === "string" 
      ? parseFloat(item.vatRate) 
      : (item.vatRate || 0);
    
    return sum + (itemTotal * vatRate / 100);
  }, 0);
  
  // Calculate totalTTC
  const totalTTC = totalHT + totalTVA;
  
  return {
    totalHT: parseFloat(totalHT.toFixed(2)),
    totalTVA: parseFloat(totalTVA.toFixed(2)),
    totalTTC: parseFloat(totalTTC.toFixed(2))
  };
}

/**
 * Calculate deposit amount based on total TTC and percentage
 */
export function calculateDeposit(totalTTC: number, percentage: number): number {
  return parseFloat((totalTTC * percentage / 100).toFixed(2));
}

/**
 * Translate status text to French
 */
export function translateStatus(status: string): string {
  const statusMap: Record<string, string> = {
    draft: "Brouillon",
    sent: "Envoyé",
    signed: "Signé",
    rejected: "Refusé",
    pending: "En attente",
    paid: "Payé"
  };
  
  return statusMap[status.toLowerCase()] || status;
}
