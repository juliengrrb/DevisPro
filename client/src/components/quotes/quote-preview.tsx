import { Card, CardContent } from "@/components/ui/card";
import { formatPrice, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { EditSectionButton } from "./edit-section-button";
import { QuoteNumberFormat } from "./quote-number-modal";

interface QuotePreviewProps {
  quote: any;
  editable?: boolean;
  onEditSection?: (section: "info" | "client" | "project" | "conditions" | "notes" | "lineItems" | "numberFormat") => void;
  onNumberFormatChange?: (format: QuoteNumberFormat) => void;
}

export function QuotePreview({ 
  quote, 
  editable = false, 
  onEditSection,
  onNumberFormatChange
}: QuotePreviewProps) {
  const handleDownloadPdf = () => {
    if (!quote.id) return; // Can't download if the quote doesn't exist yet
    window.open(`/api/quotes/${quote.id}/pdf`, '_blank');
  };

  // Determine lineItem class based on type
  const getLineItemClass = (type: string) => {
    switch (type) {
      case "title":
        return "font-bold text-lg border-b border-slate-200 pb-2 mt-4";
      case "subtitle":
        return "font-semibold text-base text-slate-700 mt-3";
      case "text":
        return "text-slate-600 italic";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        {quote.id && (
          <Button 
            variant="outline" 
            className="flex items-center"
            onClick={handleDownloadPdf}
          >
            <Download className="mr-2 h-4 w-4" />
            Télécharger PDF
          </Button>
        )}
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-1">
                <h2 className="text-base font-normal text-slate-900">Devis n°<span className="font-semibold">{quote.number}</span></h2>
                {editable && onEditSection && (
                  <button 
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                    onClick={() => onEditSection("numberFormat")}
                    title="Modifier la numérotation"
                  >
                    <span className="text-sm">✎</span>
                  </button>
                )}
              </div>
              <div className="mt-2 text-slate-600 text-sm">
                <p>En date du {formatDate(quote.issueDate)}</p>
                {quote.validUntil && (
                  <p>Valable jusqu'au {formatDate(quote.validUntil)}</p>
                )}
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              {editable && (
                <>
                  <button 
                    className="w-full p-2 border border-slate-200 rounded-md text-left bg-white flex items-center justify-between"
                    onClick={() => onEditSection && onEditSection("client")}
                  >
                    <span className="text-slate-500">
                      {quote.client ? 
                        (quote.client.type === "company" ? 
                          quote.client.companyName : 
                          `${quote.client.firstName} ${quote.client.lastName}`
                        ) : 
                        "Sélectionner un client"
                      }
                    </span>
                    <svg className="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  <button 
                    className="w-full p-2 border border-slate-200 rounded-md text-left bg-white flex items-center justify-between"
                    onClick={() => onEditSection && onEditSection("project")}
                  >
                    <span className="text-slate-500">
                      {quote.project ? quote.project.name : "Sélectionner un chantier"}
                    </span>
                    <svg className="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Client and Project Info display in non-edit mode */}
          {!editable && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {quote.client && (
                <div className="p-4 rounded-md bg-slate-50">
                  <h3 className="font-semibold text-slate-900 mb-2">Client</h3>
                  <div>
                    {quote.client.type === "company" && (
                      <p className="font-medium">{quote.client.companyName}</p>
                    )}
                    <p>{quote.client.firstName} {quote.client.lastName}</p>
                    <p>{quote.client.email}</p>
                    <p>{quote.client.phone}</p>
                    <p>{quote.client.address}</p>
                    <p>{quote.client.zipCode} {quote.client.city}</p>
                    {quote.client.siret && <p>SIRET: {quote.client.siret}</p>}
                  </div>
                </div>
              )}

              {quote.project && (
                <div className="p-4 rounded-md bg-slate-50">
                  <h3 className="font-semibold text-slate-900 mb-2">Chantier / Projet</h3>
                  <p className="font-medium">{quote.project.name}</p>
                  <p>{quote.project.description}</p>
                  <p>{quote.project.address}</p>
                  <p>{quote.project.zipCode} {quote.project.city}</p>
                </div>
              )}
            </div>
          )}
          
          {/* Spacer for edit mode */}
          {editable && <div className="mb-8"></div>}

          {/* Quote Content */}
          <div className="mb-8 relative">
            {editable && onEditSection && (
              <EditSectionButton onClick={() => onEditSection("lineItems")} />
            )}
            <h3 className="font-semibold text-slate-900 mb-4 pb-2 border-b">Détail du devis</h3>
            
            {/* Line Items */}
            <div className="space-y-3">
              {quote.lineItems?.map((item: any, index: number) => {
                if (item.type === "title" || item.type === "subtitle" || item.type === "text") {
                  // Text elements
                  return (
                    <div key={index} className={getLineItemClass(item.type)}>
                      {item.type === "text" ? item.description : item.title}
                    </div>
                  );
                } else {
                  // Material, labor, or work
                  return (
                    <div key={index} className="border-b border-slate-100 pb-3">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">{item.title}</p>
                          {item.description && (
                            <p className="text-slate-600 text-sm">{item.description}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatPrice(item.totalHT || 0)}</p>
                          <p className="text-sm text-slate-600">
                            {item.quantity} {item.unit} x {formatPrice(item.unitPrice || 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }
              })}

              {(!quote.lineItems || quote.lineItems.length === 0) && (
                <p className="text-slate-500 italic">Aucun élément dans ce devis</p>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="mb-8">
            <div className="bg-slate-50 p-4 rounded-md">
              <h3 className="font-semibold text-slate-900 mb-2">Récapitulatif</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total HT:</span>
                  <span className="font-medium">{formatPrice(quote.totalHT || 0)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Total TVA:</span>
                  <span className="font-medium">{formatPrice(quote.totalTVA || 0)}</span>
                </div>
                
                <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
                  <span className="font-semibold">Total TTC:</span>
                  <span className="font-bold">{formatPrice(quote.totalTTC || 0)}</span>
                </div>
                
                {(quote.depositPercent > 0) && (
                  <div className="flex justify-between border-t border-slate-200 pt-2 mt-2 text-primary-700">
                    <span>Acompte ({quote.depositPercent}%):</span>
                    <span className="font-medium">{formatPrice(quote.deposit || 0)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Conditions */}
          {quote.conditions ? (
            <div className="mb-8 relative">
              {editable && onEditSection && (
                <EditSectionButton onClick={() => onEditSection("conditions")} />
              )}
              <h3 className="font-semibold text-slate-900 mb-2">Conditions</h3>
              <div className="bg-slate-50 p-4 rounded-md">
                <p style={{ whiteSpace: 'pre-line' }}>{quote.conditions}</p>
              </div>
            </div>
          ) : editable && (
            <div className="mb-8 relative border border-dashed border-slate-300 p-4 rounded-md">
              {editable && onEditSection && (
                <EditSectionButton onClick={() => onEditSection("conditions")} />
              )}
              <h3 className="font-semibold text-slate-900 mb-2">Conditions</h3>
              <p className="text-slate-500 italic">Cliquez pour ajouter les conditions de paiement</p>
            </div>
          )}

          {/* Notes */}
          {quote.notes ? (
            <div className="relative">
              {editable && onEditSection && (
                <EditSectionButton onClick={() => onEditSection("notes")} />
              )}
              <h3 className="font-semibold text-slate-900 mb-2">Notes</h3>
              <div className="bg-slate-50 p-4 rounded-md">
                <p style={{ whiteSpace: 'pre-line' }}>{quote.notes}</p>
              </div>
            </div>
          ) : editable && (
            <div className="relative border border-dashed border-slate-300 p-4 rounded-md">
              {editable && onEditSection && (
                <EditSectionButton onClick={() => onEditSection("notes")} />
              )}
              <h3 className="font-semibold text-slate-900 mb-2">Notes</h3>
              <p className="text-slate-500 italic">Cliquez pour ajouter des notes</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}