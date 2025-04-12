import { Card, CardContent } from "@/components/ui/card";
import { formatPrice, formatDate } from "@/lib/utils";
import { BadgeStatus } from "@/components/ui/badge-status";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { EditSectionButton } from "./edit-section-button";

interface QuotePreviewProps {
  quote: any;
  editable?: boolean;
  onEditSection?: (section: "info" | "client" | "project" | "conditions" | "notes" | "lineItems") => void;
}

export function QuotePreview({ 
  quote, 
  editable = false, 
  onEditSection 
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
          <div className="flex flex-col md:flex-row justify-between mb-8 gap-4 relative">
            {editable && onEditSection && (
              <EditSectionButton onClick={() => onEditSection("info")} />
            )}
            <div>
              <h2 className="text-2xl font-bold text-slate-900">DEVIS {quote.number}</h2>
              <div className="mt-2 text-slate-600">
                <p>Date d'émission: {formatDate(quote.issueDate)}</p>
                {quote.validUntil && (
                  <p>Valide jusqu'au: {formatDate(quote.validUntil)}</p>
                )}
                {quote.status && (
                  <div className="mt-2">
                    <BadgeStatus status={quote.status} />
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center bg-slate-100 p-4 rounded-md min-w-[200px]">
                {/* Company Logo */}
                <svg className="h-10 w-10 text-primary-700" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" />
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="ml-3">
                  <p className="font-bold text-slate-900">DevisPro BTP</p>
                  <p className="text-xs text-slate-500">Votre partenaire construction</p>
                </div>
              </div>
            </div>
          </div>

          {/* Client and Project Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-slate-50 p-4 rounded-md relative">
              {editable && onEditSection && (
                <EditSectionButton onClick={() => onEditSection("client")} />
              )}
              <h3 className="font-semibold text-slate-900 mb-2">Client</h3>
              {quote.client && (
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
              )}
            </div>

            {quote.project ? (
              <div className="bg-slate-50 p-4 rounded-md relative">
                {editable && onEditSection && (
                  <EditSectionButton onClick={() => onEditSection("project")} />
                )}
                <h3 className="font-semibold text-slate-900 mb-2">Chantier / Projet</h3>
                <p className="font-medium">{quote.project.name}</p>
                <p>{quote.project.description}</p>
                <p>{quote.project.address}</p>
                <p>{quote.project.zipCode} {quote.project.city}</p>
              </div>
            ) : editable && (
              <div className="bg-slate-50 p-4 rounded-md relative border border-dashed border-slate-300">
                {editable && onEditSection && (
                  <EditSectionButton onClick={() => onEditSection("project")} />
                )}
                <h3 className="font-semibold text-slate-900 mb-2">Chantier / Projet</h3>
                <p className="text-slate-500 italic">Cliquez pour ajouter un projet</p>
              </div>
            )}
          </div>

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
