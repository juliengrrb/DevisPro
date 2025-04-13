import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { QuotePreview } from "@/components/quotes/quote-preview";
import { QuoteEditModal } from "@/components/quotes/quote-edit-modal";
import { LineItemsModal } from "@/components/quotes/line-items-modal";
import { QuoteNumberModal, QuoteNumberFormat } from "@/components/quotes/quote-number-modal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useRoute, useSearch } from "wouter";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { calculateQuoteTotals, calculateDeposit, formatDateInput, generateQuoteNumber } from "@/lib/utils";
import { ArrowLeft, Save, Send, FileCheck, X, Copy, CreditCard } from "lucide-react";

export default function QuoteEditor() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [, params] = useRoute("/quotes/edit/:id");
  const quoteId = params?.id;
  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  const duplicateId = searchParams.get("duplicate");
  const clientId = searchParams.get("clientId");
  const projectId = searchParams.get("projectId");
  
  const isNewQuote = !quoteId; // This is a new quote if there's no ID
  
  // State for modals
  const [activeModal, setActiveModal] = useState<"info" | "client" | "project" | "conditions" | "notes" | "lineItems" | "numberFormat" | null>(null);
  const [isLoading, setIsLoading] = useState(!!quoteId || !!duplicateId);
  
  // Fetch quote if editing an existing one
  const { data: existingQuote, isLoading: isLoadingQuote } = useQuery({
    queryKey: [`/api/quotes/${quoteId}`],
    enabled: !!quoteId && !duplicateId,
  });

  // Fetch duplicated quote if needed
  const { data: duplicatedQuote, isLoading: isLoadingDuplicate } = useQuery({
    queryKey: [`/api/quotes/${duplicateId}`],
    enabled: !!duplicateId,
  });

  // Fetch clients for selection
  const { data: clients } = useQuery({
    queryKey: ["/api/clients"],
  });

  // Fetch projects if client is selected
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const { data: projects } = useQuery({
    queryKey: [`/api/clients/${selectedClientId}/projects`],
    enabled: !!selectedClientId,
  });

  // Initialize quote data state
  const [quoteData, setQuoteData] = useState({
    clientId: clientId ? parseInt(clientId) : 0,
    projectId: projectId ? parseInt(projectId) : null,
    number: generateQuoteNumber(),
    status: "draft",
    issueDate: formatDateInput(new Date()),
    validUntil: formatDateInput(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // +30 days
    notes: "",
    conditions: "Paiement : 30% à la commande, 70% à la livraison\nValidité du devis : 30 jours",
    totalHT: "0",
    totalTVA: "0",
    totalTTC: "0",
    deposit: "0",
    depositPercent: 30,
    lineItems: [
      {
        type: "title",
        title: "Titre section",
        description: null,
        quantity: null,
        unit: null,
        unitPrice: null,
        vatRate: null,
        totalHT: null,
        position: 1,
        level: 0,
      }
    ],
  });

  // Update mutation
  const updateQuoteMutation = useMutation({
    mutationFn: async (data: any) => {
      if (quoteId) {
        // Update existing quote
        return await apiRequest("PUT", `/api/quotes/${quoteId}`, data);
      } else {
        // Create new quote
        return await apiRequest("POST", "/api/quotes", data);
      }
    },
    onSuccess: async (response) => {
      const data = await response.json();
      const newQuoteId = data.id;
      
      if (quoteId) {
        // Updated existing quote
        queryClient.invalidateQueries({ queryKey: [`/api/quotes/${quoteId}`] });
        toast({
          title: "Devis mis à jour",
          description: "Le devis a été mis à jour avec succès."
        });
      } else {
        // Created new quote
        toast({
          title: "Devis créé",
          description: "Le devis a été créé avec succès."
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      navigate(`/quotes/${newQuoteId || quoteId}`);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Une erreur est survenue: ${error}`,
        variant: "destructive"
      });
    }
  });

  // Initialize quoteData from existing quote, duplicated quote, or with default values
  useEffect(() => {
    if (existingQuote && !duplicateId) {
      // Editing existing quote
      setQuoteData(existingQuote as any);
      if (existingQuote.clientId) {
        setSelectedClientId(existingQuote.clientId);
      }
      setIsLoading(false);
    } else if (duplicatedQuote) {
      // Duplicating a quote
      const duplicateData = {
        ...duplicatedQuote,
        id: undefined,
        number: generateQuoteNumber(),
        status: "draft",
        issueDate: formatDateInput(new Date()),
        validUntil: formatDateInput(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
      };
      setQuoteData(duplicateData as any);
      if (duplicateData.clientId) {
        setSelectedClientId(duplicateData.clientId);
      }
      setIsLoading(false);
    } else if (!quoteId) {
      // New quote
      if (clientId) {
        setSelectedClientId(parseInt(clientId));
      }
      setIsLoading(false);
    }
  }, [existingQuote, duplicatedQuote, quoteId, duplicateId, clientId]);

  // Handle section edit
  const handleEditSection = (section: "info" | "client" | "project" | "conditions" | "notes" | "lineItems" | "numberFormat") => {
    setActiveModal(section);
  };

  // Handle changes to quote data
  const handleQuoteDataChange = (section: string, data: any) => {
    let updatedData = { ...quoteData };
    
    // Update the corresponding section
    if (section === "info") {
      updatedData = {
        ...updatedData,
        number: data.number,
        issueDate: data.issueDate,
        validUntil: data.validUntil,
        depositPercent: data.depositPercent,
      };
      
      // Recalculate deposit
      const totalTTC = parseFloat(updatedData.totalTTC || "0");
      const deposit = calculateDeposit(totalTTC, data.depositPercent);
      updatedData.deposit = deposit.toString();
    } 
    else if (section === "client") {
      updatedData.clientId = data.clientId;
      setSelectedClientId(data.clientId);
      
      // When client changes, reset project
      updatedData.projectId = null;
    } 
    else if (section === "project") {
      updatedData.projectId = data.projectId;
    } 
    else if (section === "conditions") {
      updatedData.conditions = data.conditions;
    } 
    else if (section === "notes") {
      updatedData.notes = data.notes;
    } 
    else if (section === "lineItems") {
      updatedData.lineItems = data;
      
      // Recalculate totals
      const { totalHT, totalTVA, totalTTC } = calculateQuoteTotals(data);
      updatedData.totalHT = totalHT.toString();
      updatedData.totalTVA = totalTVA.toString();
      updatedData.totalTTC = totalTTC.toString();
      
      // Recalculate deposit
      const deposit = calculateDeposit(totalTTC, updatedData.depositPercent || 0);
      updatedData.deposit = deposit.toString();
    }
    else if (section === "numberFormat") {
      // Update quote number from the number format modal
      updatedData.number = data.formattedNumber;
    }
    
    setQuoteData(updatedData);
  };

  // Handle saving the quote
  const handleSaveQuote = (status?: string) => {
    const dataToSave = status 
      ? { ...quoteData, status } 
      : { ...quoteData };
    
    updateQuoteMutation.mutate(dataToSave);
  };

  // Format quote data for preview
  const formatQuoteForPreview = () => {
    // Try to find the client and project objects to include in the preview
    const client = Array.isArray(clients) 
      ? clients.find((c: any) => c.id === quoteData.clientId) 
      : undefined;
      
    const project = quoteData.projectId && Array.isArray(projects) 
      ? projects.find((p: any) => p.id === quoteData.projectId) 
      : null;
    
    return {
      ...quoteData,
      client,
      project,
    };
  };

  if (isLoading || isLoadingQuote || isLoadingDuplicate) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex justify-between items-center mb-6 mt-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/quotes")}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour
          </Button>
          <h1 className="text-2xl font-bold">
            {isNewQuote ? "Nouveau devis" : `Modifier le devis ${quoteData.number}`}
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          {!isNewQuote && quoteData.status === "draft" && (
            <Button 
              variant="outline" 
              onClick={() => handleSaveQuote("pending")}
              disabled={updateQuoteMutation.isPending}
            >
              <Send className="h-4 w-4 mr-1" />
              Envoyer
            </Button>
          )}
          
          {!isNewQuote && quoteData.status === "pending" && (
            <>
              <Button 
                variant="outline" 
                onClick={() => handleSaveQuote("rejected")}
                disabled={updateQuoteMutation.isPending}
              >
                <X className="h-4 w-4 mr-1" />
                Refuser
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleSaveQuote("signed")}
                disabled={updateQuoteMutation.isPending}
              >
                <FileCheck className="h-4 w-4 mr-1" />
                Accepter
              </Button>
            </>
          )}
          
          {!isNewQuote && quoteData.status === "signed" && (
            <Button 
              variant="outline" 
              onClick={() => navigate(`/invoices/create?quoteId=${quoteId}`)}
            >
              <CreditCard className="h-4 w-4 mr-1" />
              Facturer
            </Button>
          )}
          
          {!isNewQuote && (
            <Button 
              variant="outline" 
              onClick={() => navigate(`/quotes/create?duplicate=${quoteId}`)}
            >
              <Copy className="h-4 w-4 mr-1" />
              Dupliquer
            </Button>
          )}
          
          <Button 
            onClick={() => handleSaveQuote()}
            disabled={updateQuoteMutation.isPending}
          >
            <Save className="h-4 w-4 mr-1" />
            Enregistrer
          </Button>
        </div>
      </div>
      
      {/* Content */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <QuotePreview 
          quote={formatQuoteForPreview()} 
          editable={true}
          onEditSection={handleEditSection}
          onNumberFormatChange={(format) => handleQuoteDataChange("numberFormat", format)}
        />
      </div>
      
      {/* Modals */}
      <QuoteEditModal
        open={activeModal === "info"}
        onOpenChange={(open) => setActiveModal(open ? "info" : null)}
        title="Informations du devis"
        section="info"
        data={quoteData}
        onSave={(data) => handleQuoteDataChange("info", data)}
      />
      
      <QuoteEditModal
        open={activeModal === "client"}
        onOpenChange={(open) => setActiveModal(open ? "client" : null)}
        title="Client"
        section="client"
        data={quoteData}
        clients={Array.isArray(clients) ? clients : []}
        onSave={(data) => handleQuoteDataChange("client", data)}
      />
      
      <QuoteEditModal
        open={activeModal === "project"}
        onOpenChange={(open) => setActiveModal(open ? "project" : null)}
        title="Projet / Chantier"
        section="project"
        data={quoteData}
        projects={Array.isArray(projects) ? projects : []}
        onSave={(data) => handleQuoteDataChange("project", data)}
      />
      
      <QuoteEditModal
        open={activeModal === "conditions"}
        onOpenChange={(open) => setActiveModal(open ? "conditions" : null)}
        title="Conditions"
        section="conditions"
        data={quoteData}
        onSave={(data) => handleQuoteDataChange("conditions", data)}
      />
      
      <QuoteEditModal
        open={activeModal === "notes"}
        onOpenChange={(open) => setActiveModal(open ? "notes" : null)}
        title="Notes"
        section="notes"
        data={quoteData}
        onSave={(data) => handleQuoteDataChange("notes", data)}
      />
      
      <LineItemsModal 
        open={activeModal === "lineItems"}
        onOpenChange={(open) => setActiveModal(open ? "lineItems" : null)}
        lineItems={quoteData.lineItems || []}
        onSave={(lineItems) => handleQuoteDataChange("lineItems", lineItems)}
      />
      
      <QuoteNumberModal
        open={activeModal === "numberFormat"}
        onOpenChange={(open) => setActiveModal(open ? "numberFormat" : null)}
        currentNumber={quoteData.number}
        onSave={(format) => handleQuoteDataChange("numberFormat", format)}
      />
    </DashboardLayout>
  );
}