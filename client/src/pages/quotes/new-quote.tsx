import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { QuoteTable } from "@/components/quotes/quote-table";
import { QuotePreview } from "@/components/quotes/quote-preview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLocation, useSearch } from "wouter";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { generateQuoteNumber, formatDateInput, formatPrice } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Pencil, 
  Info, 
  ChevronDown, 
  Settings, 
  Trash2,
  X,
  Mail,
  Download,
  Copy
} from "lucide-react";

export default function NewQuote() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  const duplicateId = searchParams.get("duplicate");
  const clientId = searchParams.get("clientId");
  const projectId = searchParams.get("projectId");
  
  const [activeView, setActiveView] = useState("edition"); // "edition" or "preview"
  const [isLoading, setIsLoading] = useState(!!duplicateId);
  const [showRemise, setShowRemise] = useState(false);
  const [remisePercent, setRemisePercent] = useState<string>("0");
  
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

  // Clone quote if duplicating
  useEffect(() => {
    if (duplicateId) {
      const fetchQuote = async () => {
        try {
          const response = await fetch(`/api/quotes/${duplicateId}`);
          if (!response.ok) throw new Error('Erreur lors de la récupération du devis');
          
          const data = await response.json();
          if (data) {
            // Clone the quote
            setQuoteData({
              ...data,
              number: generateQuoteNumber(),
              status: "draft",
              issueDate: formatDateInput(new Date()),
              validUntil: formatDateInput(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
            });
          }
          setIsLoading(false);
        } catch (error) {
          console.error("Error fetching quote:", error);
          toast({
            title: "Erreur",
            description: "Impossible de récupérer les données du devis à dupliquer.",
            variant: "destructive",
          });
          setIsLoading(false);
        }
      };
      
      fetchQuote();
    }
  }, [duplicateId, toast]);

  // Create quote mutation
  const createQuoteMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/quotes", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la création du devis');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Succès",
        description: "Devis créé avec succès",
      });
      navigate(`/quotes/${data.id}`);
      queryClient.invalidateQueries({
        queryKey: ["/api/quotes"],
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer le devis",
        variant: "destructive",
      });
    },
  });

  // Handle form changes
  const handleFormChange = (field: string, value: any) => {
    setQuoteData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle line items change
  const handleLineItemsChange = (lineItems: any[]) => {
    // Calculate TVA and totals
    let totalHT = 0;
    let totalTVA10 = 0;
    let totalTVA20 = 0;
    
    lineItems.forEach(item => {
      if (item.totalHT && (item.type === "material" || item.type === "labor" || item.type === "work")) {
        const ht = parseFloat(item.totalHT);
        totalHT += ht;
        
        // Calculate TVA based on rate
        if (item.vatRate === "10") {
          totalTVA10 += ht * 0.1;
        } else if (item.vatRate === "20") {
          totalTVA20 += ht * 0.2;
        }
      }
    });
    
    // Apply remise if needed
    const remiseValue = parseFloat(remisePercent) || 0;
    const remiseAmount = totalHT * (remiseValue / 100);
    const totalHTAfterRemise = totalHT - remiseAmount;
    
    // Recalculate TVA after remise
    totalTVA10 = totalTVA10 * (1 - remiseValue / 100);
    totalTVA20 = totalTVA20 * (1 - remiseValue / 100);
    
    const totalTVA = totalTVA10 + totalTVA20;
    const totalTTC = totalHTAfterRemise + totalTVA;
    
    // Calculate deposit
    const deposit = (quoteData.depositPercent / 100) * totalTTC;
    
    // Update quote data
    setQuoteData(prev => ({
      ...prev,
      lineItems,
      totalHT: totalHTAfterRemise.toFixed(2),
      totalTVA: totalTVA.toFixed(2),
      totalTTC: totalTTC.toFixed(2),
      deposit: deposit.toFixed(2),
    }));
  };

  // Handle remise change
  const handleRemiseChange = (value: string) => {
    setRemisePercent(value);
    
    // Recalculate with new remise percent
    const lineItems = [...quoteData.lineItems];
    handleLineItemsChange(lineItems);
  };

  // Handle create quote
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
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-2 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900 mr-6">Créer un devis</h1>
            <p className="text-sm text-gray-600">Créez un nouveau devis pour un client</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate("/quotes")}
              className="text-sm h-9 px-3"
            >
              Annuler
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleCreateQuote()}
              disabled={createQuoteMutation.isPending}
              className="text-sm h-9 px-3"
            >
              Enregistrer en brouillon
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-sm h-9 px-3"
              onClick={() => handleCreateQuote("sent")}
              disabled={createQuoteMutation.isPending}
            >
              Finaliser le devis
            </Button>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow-sm mb-4">
        <div className="flex border-b border-gray-200">
          <button 
            className={`px-4 py-2 flex items-center text-sm font-medium ${activeView === 'edition' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveView('edition')}
          >
            <Pencil className="w-4 h-4 mr-2" />
            Édition
          </button>
          <button 
            className={`px-4 py-2 flex items-center text-sm font-medium ${activeView === 'preview' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveView('preview')}
          >
            <Info className="w-4 h-4 mr-2" />
            Prévisualisation
          </button>
          <div className="flex-1"></div>
          <button className="px-4 py-2 flex items-center text-sm font-medium text-gray-600">
            <Settings className="w-4 h-4 mr-2" />
            Options
            <ChevronDown className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>

      {activeView === 'edition' ? (
        <div>
          <div className="px-4 py-3 bg-white shadow-sm mb-4">
            <h2 className="font-semibold text-lg text-gray-900 mb-1">
              Rénovation du restaurant rue Rivoli
            </h2>
            <p className="text-sm text-gray-600">(Salle du restaurant et à l'étage)</p>
          </div>

          <div className="flex flex-row gap-4 mb-6">
            {/* Colonne gauche : Informations du devis */}
            <div className="w-1/3 space-y-4">
              <div className="bg-white shadow-sm p-4">
                <h3 className="font-medium text-gray-900 mb-3">Informations du devis</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Numéro du devis
                    </label>
                    <Input 
                      value={quoteData.number}
                      onChange={(e) => handleFormChange("number", e.target.value)}
                      className="border-gray-300"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date d'émission
                    </label>
                    <Input 
                      type="date"
                      value={quoteData.issueDate}
                      onChange={(e) => handleFormChange("issueDate", e.target.value)}
                      className="border-gray-300"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date de validité
                    </label>
                    <Input 
                      type="date"
                      value={quoteData.validUntil}
                      onChange={(e) => handleFormChange("validUntil", e.target.value)}
                      className="border-gray-300"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Acompte (%)
                    </label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      value={quoteData.depositPercent}
                      onChange={(e) => handleFormChange("depositPercent", parseInt(e.target.value))}
                    >
                      <option value="0">Pas d'acompte</option>
                      <option value="10">10%</option>
                      <option value="20">20%</option>
                      <option value="30">30%</option>
                      <option value="40">40%</option>
                      <option value="50">50%</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Conditions de paiement
                    </label>
                    <Textarea
                      rows={4}
                      value={quoteData.conditions}
                      onChange={(e) => handleFormChange("conditions", e.target.value)}
                      className="border-gray-300 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Colonne milieu : Client & Projet */}
            <div className="w-1/3">
              <div className="bg-white shadow-sm p-4 h-full">
                <h3 className="font-medium text-gray-900 mb-3">Client & Projet</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client
                    </label>
                    <div className="relative">
                      <select 
                        className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm appearance-none"
                        value={quoteData.clientId || ""}
                        onChange={(e) => handleFormChange("clientId", parseInt(e.target.value))}
                      >
                        <option value="">Sélectionner un client</option>
                        {clients && clients.map((client: any) => (
                          <option key={client.id} value={client.id}>
                            {client.type === "company" 
                              ? client.companyName 
                              : `${client.firstName} ${client.lastName}`}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="h-4 w-4 absolute right-3 top-2.5 text-gray-500 pointer-events-none" />
                    </div>
                    <div className="text-red-500 text-xs mt-1">
                      Veuillez sélectionner un client
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Projet / Chantier
                    </label>
                    <div className="relative">
                      <select 
                        className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm appearance-none"
                        value={quoteData.projectId || ""}
                        onChange={(e) => handleFormChange("projectId", parseInt(e.target.value))}
                        disabled={!quoteData.clientId}
                      >
                        <option value="">Sélectionnez d'abord un client</option>
                      </select>
                      <ChevronDown className="h-4 w-4 absolute right-3 top-2.5 text-gray-500 pointer-events-none" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Optionnel - Associez ce devis à un projet
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Colonne droite : Récapitulatif */}
            <div className="w-1/3">
              <div className="bg-white shadow-sm p-4 h-full">
                <h3 className="font-medium text-gray-900 mb-3">Récapitulatif</h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total HT:</span>
                    <span className="font-medium">{formatPrice(parseFloat(quoteData.totalHT))}</span>
                  </div>
                  
                  {showRemise && (
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Remise globale:</span>
                        <div className="flex items-center">
                          <Input 
                            type="number"
                            value={remisePercent}
                            onChange={(e) => handleRemiseChange(e.target.value)}
                            className="w-20 h-8 text-right mr-1 border-gray-300"
                          />
                          <span className="mr-1">%</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Remise HT:</span>
                        <span>{formatPrice(parseFloat(quoteData.totalHT) * (parseFloat(remisePercent) / 100))}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total net HT:</span>
                    <span className="font-medium">{formatPrice(parseFloat(quoteData.totalHT))}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">TVA 10%:</span>
                    <span>{formatPrice(parseFloat(quoteData.totalTVA) * 0.5)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">TVA 20%:</span>
                    <span>{formatPrice(parseFloat(quoteData.totalTVA) * 0.5)}</span>
                  </div>
                  
                  <div className="pt-2 border-t mt-2">
                    <div className="flex justify-between font-medium text-lg">
                      <span>Total TTC:</span>
                      <span>{formatPrice(parseFloat(quoteData.totalTTC))}</span>
                    </div>
                  </div>
                  
                  {!showRemise && (
                    <button 
                      className="text-xs text-blue-500 flex items-center justify-end w-full mt-2"
                      onClick={() => setShowRemise(true)}
                    >
                      <span className="mr-1">+</span> Ajouter une remise
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Contenu du devis */}
          <div className="bg-white shadow-sm p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-4">Contenu du devis</h3>
            
            <QuoteTable 
              lineItems={quoteData.lineItems} 
              onChange={handleLineItemsChange} 
            />
          </div>
          
          {/* Conditions de paiement */}
          <div className="bg-white shadow-sm p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-4">Conditions de paiement</h3>
            
            <p className="mb-2">
              Acompte de {quoteData.depositPercent}% soit {formatPrice(parseFloat(quoteData.deposit))} € TTC
            </p>
            <p className="mb-2">
              Méthodes de paiement acceptées : Chèque, Virement bancaire, Carte bancaire
            </p>
          </div>
          
          {/* Notes de bas de page */}
          <div className="bg-white shadow-sm p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-4">Notes de bas de page</h3>
            
            <Textarea
              rows={4}
              placeholder="Ajoutez des notes qui apparaîtront en bas du devis..."
              className="w-full border-gray-300"
              value={quoteData.notes}
              onChange={(e) => handleFormChange("notes", e.target.value)}
            />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-sm p-4">
          <QuotePreview quote={quoteData} />
        </div>
      )}
    </DashboardLayout>
  );
}