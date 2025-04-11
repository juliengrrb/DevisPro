import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { QuoteForm } from "@/components/quotes/quote-form";
import { QuotePreview } from "@/components/quotes/quote-preview";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation, useRoute } from "wouter";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function QuoteEdit() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [, params] = useRoute("/quotes/edit/:id");
  const quoteId = params?.id;
  
  const [activeTab, setActiveTab] = useState("edit");
  const [quoteData, setQuoteData] = useState<any>(null);
  
  // Fetch quote data
  const { data: quote, isLoading: isLoadingQuote } = useQuery({
    queryKey: [`/api/quotes/${quoteId}`],
    enabled: !!quoteId,
  });

  // Fetch clients for dropdown
  const { data: clients } = useQuery({
    queryKey: ["/api/clients"],
  });

  // Update quote mutation
  const updateQuoteMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PUT", `/api/quotes/${quoteId}`, data);
    },
    onSuccess: async (response) => {
      const data = await response.json();
      queryClient.invalidateQueries({ queryKey: [`/api/quotes/${quoteId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      toast({
        title: "Devis mis à jour",
        description: "Le devis a été mis à jour avec succès."
      });
      navigate(`/quotes/${quoteId}`);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la mise à jour du devis: ${error}`,
        variant: "destructive"
      });
    }
  });

  // Initialize form with quote data
  useEffect(() => {
    if (quote) {
      setQuoteData(quote);
    }
  }, [quote]);

  const handleFormChange = (data: any) => {
    setQuoteData(data);
  };

  const handleUpdateQuote = async (status?: string) => {
    if (!quoteData) return;
    
    // Update status if provided
    const dataToSave = status 
      ? { ...quoteData, status } 
      : { ...quoteData };
    
    updateQuoteMutation.mutate(dataToSave);
  };

  if (isLoadingQuote || !quoteData) {
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
            <h1 className="text-2xl font-bold text-slate-900">Modifier le devis</h1>
            <p className="mt-1 text-sm text-slate-600">
              {quoteData.number}
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Button 
              variant="outline" 
              onClick={() => navigate(`/quotes/${quoteId}`)}
            >
              Annuler
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleUpdateQuote()} 
              disabled={updateQuoteMutation.isPending}
            >
              Enregistrer
            </Button>
            {quoteData.status === "draft" && (
              <Button
                onClick={() => handleUpdateQuote("sent")}
                disabled={updateQuoteMutation.isPending}
              >
                Finaliser le devis
              </Button>
            )}
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="edit">Éditer</TabsTrigger>
          <TabsTrigger value="preview">Aperçu</TabsTrigger>
        </TabsList>
        <TabsContent value="edit" className="w-full">
          <QuoteForm 
            quote={quoteData} 
            clients={clients || []} 
            onChange={handleFormChange} 
            isCreating={false}
          />
        </TabsContent>
        <TabsContent value="preview">
          <QuotePreview quote={quoteData} />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
