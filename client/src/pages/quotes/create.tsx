import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { QuoteForm } from "@/components/quotes/quote-form";
import { QuotePreview } from "@/components/quotes/quote-preview";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation, useSearch, Route, Switch } from "wouter";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { generateQuoteNumber, formatDateInput } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function QuoteCreate() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  const duplicateId = searchParams.get("duplicate");
  const clientId = searchParams.get("clientId");
  const projectId = searchParams.get("projectId");
  
  const [activeTab, setActiveTab] = useState("edit");
  const [isLoading, setIsLoading] = useState(!!duplicateId);
  
  // Initialize with default values
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
        title: "Salle du restaurant",
        description: null,
        quantity: null,
        unit: null,
        unitPrice: null,
        vatRate: null,
        totalHT: null,
        position: 1,
        level: 0,
        subtotal: "1157.22"
      },
      {
        type: "subtitle",
        title: "Coin bar",
        description: null,
        quantity: null,
        unit: null,
        unitPrice: null,
        vatRate: null,
        totalHT: null,
        position: 2,
        level: 1,
        subtotal: "1157.22"
      },
      {
        type: "material",
        title: "Peinture du plafond et tâches associées",
        description: "Peinture acrylique blanc mat",
        quantity: "23",
        unit: "m²",
        unitPrice: "46",
        vatRate: "10",
        totalHT: "1058.00",
        position: 3,
        level: 2
      },
      {
        type: "work",
        title: "Cloisons de séparation",
        description: "Fourniture et pose",
        quantity: "8.75",
        unit: "u",
        unitPrice: "11.34",
        vatRate: "20",
        totalHT: "99.22",
        position: 4,
        level: 2,
        details: [
          "BA13 standard sur ossature métallique x 1 (m²)",
          "Rail R90 et double montant M48 x 1 (m²)",
          "Isolation GR80 x 1 (m²)"
        ]
      }
    ]
  });

  // Fetch clients for dropdown
  const { data: clients } = useQuery({
    queryKey: ["/api/clients"],
  });

  // If duplicating, fetch the original quote
  const { data: originalQuote } = useQuery({
    queryKey: ["/api/quotes", duplicateId],
    enabled: !!duplicateId,
  });

  // Mutation to create quote
  const createQuoteMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/quotes", data);
    },
    onSuccess: async (response) => {
      const data = await response.json();
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      toast({
        title: "Devis créé",
        description: "Le devis a été créé avec succès."
      });
      navigate(`/quotes/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la création du devis: ${error}`,
        variant: "destructive"
      });
    }
  });

  // Populate form with duplicate data if available
  useEffect(() => {
    if (originalQuote && duplicateId) {
      // Create a copy with a new number
      setQuoteData({
        ...originalQuote,
        id: undefined,
        number: generateQuoteNumber(),
        status: "draft",
        issueDate: formatDateInput(new Date()),
        validUntil: formatDateInput(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
      });
      setIsLoading(false);
    }
  }, [originalQuote, duplicateId]);

  const handleFormChange = (data: any) => {
    setQuoteData(data);
  };

  const handleCreateQuote = async (status: string = "draft") => {
    // Update status before saving
    const dataToSave = {
      ...quoteData,
      status
    };
    
    createQuoteMutation.mutate(dataToSave);
  };

  if (isLoading) {
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
      <div className="mb-8 mt-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Créer un devis</h1>
            <p className="mt-1 text-sm text-slate-600">
              Créez un nouveau devis pour un client
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Button 
              variant="outline" 
              onClick={() => navigate("/quotes")}
            >
              Annuler
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleCreateQuote()}
              disabled={createQuoteMutation.isPending}
            >
              Enregistrer en brouillon
            </Button>
            <Button 
              onClick={() => handleCreateQuote("sent")}
              disabled={createQuoteMutation.isPending}
            >
              Finaliser le devis
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="edit">Éditer</TabsTrigger>
          <TabsTrigger value="preview">Aperçu</TabsTrigger>
        </TabsList>
        <TabsContent value="edit" className="w-full">
          <div className="mb-4">
            <div className="flex flex-col md:flex-row">
              <div className="mb-4 md:mb-0 md:mr-4 flex-1">
                <h2 className="text-xl font-bold text-black mb-2">
                  Rénovation du restaurant rue Rivoli
                </h2>
                <div className="text-xs text-blue-600 mb-2">
                  <button className="hover:underline flex items-center">
                    <span>Masquer la description</span>
                  </button>
                </div>
                <div className="text-sm">
                  <p>Rénovation du restaurant rue Rivoli</p>
                  <p>(Salle du restaurant et à l'étage)</p>
                </div>
              </div>
              <div className="bg-gray-100 p-4 rounded-md md:w-1/3">
                <h3 className="font-semibold text-base mb-2">Informations client</h3>
                <div className="text-sm">
                  <p className="font-medium">M Jean Lefevre</p>
                  <p>97 Rue de Rivoli</p>
                  <p>75001 Paris</p>
                </div>
              </div>
            </div>
          </div>
          <QuoteForm 
            quote={quoteData} 
            clients={clients || []} 
            onChange={handleFormChange} 
            isCreating={true}
          />
        </TabsContent>
        <TabsContent value="preview">
          <QuotePreview quote={quoteData} />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
