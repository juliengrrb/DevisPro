import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { DataTable } from "@/components/ui/data-table";
import { BadgeStatus } from "@/components/ui/badge-status";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { 
  FileText, 
  Plus, 
  Eye, 
  FileEdit, 
  Copy, 
  CreditCard, 
  Trash2,
  FilterX,
  Download,
  Mail
} from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Quote {
  id: number;
  number: string;
  client: {
    name: string;
  };
  issueDate: string;
  totalTTC: string | number;
  status: string;
}

export default function QuotesIndex() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [quoteToDelete, setQuoteToDelete] = useState<Quote | null>(null);

  // Fetch quotes
  const { data: quotes, isLoading: isLoadingQuotes } = useQuery<Quote[]>({
    queryKey: ["/api/quotes"],
  });

  // Delete quote mutation
  const deleteQuoteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/quotes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      toast({
        title: "Devis supprimé",
        description: "Le devis a été supprimé avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la suppression du devis: ${error}`,
        variant: "destructive",
      });
    },
  });

  // Quote table columns
  const quoteColumns = [
    {
      header: "Numéro",
      accessorKey: "number",
      cell: (quote: Quote) => (
        <Link href={`/quotes/${quote.id}`}>
          <a className="text-primary-700 hover:underline font-medium">
            {quote.number}
          </a>
        </Link>
      ),
    },
    {
      header: "Client",
      accessorKey: "client.name",
      cell: (quote: Quote) => <span className="text-slate-700">{quote.client?.name}</span>,
    },
    {
      header: "Date",
      accessorKey: "issueDate",
      cell: (quote: Quote) => <span className="text-slate-700">{formatDate(quote.issueDate)}</span>,
    },
    {
      header: "Montant",
      accessorKey: "totalTTC",
      cell: (quote: Quote) => <span className="text-slate-700">{formatPrice(quote.totalTTC)}</span>,
    },
    {
      header: "Statut",
      accessorKey: "status",
      cell: (quote: Quote) => <BadgeStatus status={quote.status} />,
    },
  ];

  // Quote actions
  const quoteActions = [
    {
      label: "Voir",
      icon: <Eye className="h-4 w-4" />,
      onClick: (quote: Quote) => navigate(`/quotes/${quote.id}`),
    },
    {
      label: "Télécharger PDF",
      icon: <Download className="h-4 w-4" />,
      onClick: (quote: Quote) => {
        window.open(`/api/quotes/${quote.id}/pdf`, '_blank');
      },
    },
    {
      label: "Envoyer par email",
      icon: <Mail className="h-4 w-4" />,
      onClick: (quote: Quote) => navigate(`/quotes/${quote.id}?emailDialog=true`),
    },
    {
      label: "Éditer",
      icon: <FileEdit className="h-4 w-4" />,
      onClick: (quote: Quote) => navigate(`/quotes/edit/${quote.id}`),
      disabled: (quote: Quote) => quote.status === "rejected",
    },
    {
      label: "Dupliquer",
      icon: <Copy className="h-4 w-4" />,
      onClick: (quote: Quote) => navigate(`/quotes/create?duplicate=${quote.id}`),
    },
    {
      label: "Facturer",
      icon: <CreditCard className="h-4 w-4" />,
      onClick: (quote: Quote) => navigate(`/invoices/create?quoteId=${quote.id}`),
      disabled: (quote: Quote) => quote.status !== "signed",
    },
    {
      label: "Supprimer",
      icon: <Trash2 className="h-4 w-4 text-red-600" />,
      onClick: (quote: Quote) => setQuoteToDelete(quote),
    },
  ];

  const handleDeleteConfirm = () => {
    if (quoteToDelete) {
      deleteQuoteMutation.mutate(quoteToDelete.id);
      setQuoteToDelete(null);
    }
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8 mt-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Devis</h1>
            <p className="mt-1 text-sm text-slate-600">
              Gérez tous vos devis
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Button variant="outline" className="flex items-center">
              <FilterX className="mr-2 h-4 w-4" />
              Filtrer
            </Button>
            <Button className="flex items-center" asChild>
              <Link href="/quotes/create">
                <Plus className="mr-2 h-4 w-4" />
                Nouveau Devis
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Quotes Table */}
      <DataTable
        columns={quoteColumns}
        data={quotes || []}
        actionMenuItems={quoteActions}
        isLoading={isLoadingQuotes}
        onRowClick={(quote) => navigate(`/quotes/${quote.id}`)}
        emptyState={
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-2 text-sm font-medium text-slate-900">Aucun devis</h3>
            <p className="mt-1 text-sm text-slate-500">
              Commencez par créer un nouveau devis.
            </p>
            <div className="mt-6">
              <Button asChild>
                <Link href="/quotes/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Nouveau Devis
                </Link>
              </Button>
            </div>
          </div>
        }
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!quoteToDelete} onOpenChange={(open) => !open && setQuoteToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le devis ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce devis ? Cette action est irréversible et supprimera définitivement le devis {quoteToDelete?.number}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
