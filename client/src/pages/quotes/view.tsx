import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { QuotePreview } from "@/components/quotes/quote-preview";
import { QuoteEmailForm } from "@/components/quotes/quote-email-form";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BadgeStatus } from "@/components/ui/badge-status";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocation, useRoute, useSearch } from "wouter";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  FileEdit, 
  Download, 
  Mail, 
  Copy, 
  CreditCard, 
  Check, 
  X, 
  ChevronDown 
} from "lucide-react";

export default function QuoteView() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [, params] = useRoute("/quotes/:id");
  const quoteId = params?.id;
  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  const showEmailDialog = searchParams.get("emailDialog") === "true";

  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(showEmailDialog);
  
  // Fetch quote data
  const { data: quote, isLoading } = useQuery({
    queryKey: [`/api/quotes/${quoteId}`],
    enabled: !!quoteId,
  });

  // Update quote status mutation
  const updateQuoteStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      return await apiRequest("PUT", `/api/quotes/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/quotes/${quoteId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      toast({
        title: "Statut mis à jour",
        description: "Le statut du devis a été mis à jour avec succès."
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la mise à jour du statut: ${error}`,
        variant: "destructive"
      });
    }
  });

  // Email sending mutation
  const sendEmailMutation = useMutation({
    mutationFn: async (emailData: any) => {
      return await apiRequest("POST", `/api/quotes/${quoteId}/send`, emailData);
    },
    onSuccess: () => {
      setIsEmailDialogOpen(false);
      toast({
        title: "Email envoyé",
        description: "Le devis a été envoyé par email avec succès."
      });
      
      // If the quote was in draft, update it to sent
      if (quote?.status === "draft") {
        updateQuoteStatusMutation.mutate({ id: parseInt(quoteId!), status: "sent" });
      }
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de l'envoi de l'email: ${error}`,
        variant: "destructive"
      });
    }
  });

  // Handle status change
  const handleStatusChange = (status: string) => {
    if (quoteId) {
      updateQuoteStatusMutation.mutate({ id: parseInt(quoteId), status });
    }
  };

  // Download PDF
  const handleDownloadPdf = () => {
    window.open(`/api/quotes/${quoteId}/pdf`, '_blank');
  };

  // Open email dialog
  const handleOpenEmailDialog = () => {
    setIsEmailDialogOpen(true);
  };

  // Handle email send
  const handleSendEmail = (emailData: any) => {
    sendEmailMutation.mutate(emailData);
  };

  // Update URL when email dialog changes
  useEffect(() => {
    const currentUrl = new URL(window.location.href);
    
    if (isEmailDialogOpen) {
      currentUrl.searchParams.set("emailDialog", "true");
    } else {
      currentUrl.searchParams.delete("emailDialog");
    }
    
    window.history.replaceState({}, '', currentUrl.toString());
  }, [isEmailDialogOpen]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (!quote) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <h2 className="text-xl font-semibold text-slate-900">Devis non trouvé</h2>
          <p className="mt-2 text-slate-600">Le devis demandé n'existe pas ou a été supprimé.</p>
          <Button className="mt-4" onClick={() => navigate("/quotes")}>
            Retour à la liste des devis
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8 mt-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{quote.number}</h1>
              <p className="mt-1 text-sm text-slate-600">
                Client: {quote.client?.name}
              </p>
            </div>
            <BadgeStatus status={quote.status} className="ml-2" />
          </div>
          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              className="flex items-center"
              onClick={handleDownloadPdf}
            >
              <Download className="mr-2 h-4 w-4" />
              Télécharger PDF
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center"
              onClick={handleOpenEmailDialog}
            >
              <Mail className="mr-2 h-4 w-4" />
              Envoyer par email
            </Button>

            <Button 
              variant="outline"
              className="flex items-center"
              asChild
            >
              <Link href={`/quotes/create?duplicate=${quoteId}`}>
                <Copy className="mr-2 h-4 w-4" />
                Dupliquer
              </Link>
            </Button>
            
            {quote.status === "signed" && (
              <Button 
                className="flex items-center"
                asChild
              >
                <Link href={`/invoices/create?quoteId=${quoteId}`}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Créer une facture
                </Link>
              </Button>
            )}
            
            {quote.status !== "rejected" && quote.status !== "signed" && (
              <Button 
                variant="outline"
                className="flex items-center"
                asChild
              >
                <Link href={`/quotes/edit/${quoteId}`}>
                  <FileEdit className="mr-2 h-4 w-4" />
                  Modifier
                </Link>
              </Button>
            )}
            
            {quote.status === "sent" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button>
                    Changer le statut <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleStatusChange("signed")}>
                    <Check className="mr-2 h-4 w-4 text-green-600" />
                    Marquer comme signé
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("rejected")}>
                    <X className="mr-2 h-4 w-4 text-red-600" />
                    Marquer comme refusé
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      <QuotePreview quote={quote} />

      {/* Email Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Envoyer le devis par email</DialogTitle>
          </DialogHeader>
          <QuoteEmailForm 
            quote={quote} 
            onSend={handleSendEmail} 
            onCancel={() => setIsEmailDialogOpen(false)}
            isPending={sendEmailMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
