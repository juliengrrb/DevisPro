import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { DataTable } from "@/components/ui/data-table";
import { BadgeStatus } from "@/components/ui/badge-status";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { 
  CreditCard, 
  Plus, 
  Eye, 
  FileEdit, 
  Printer,
  CheckCircle,
  Trash2,
  FilterX,
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
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Invoice {
  id: number;
  number: string;
  client: {
    name: string;
  };
  issueDate: string;
  dueDate: string;
  totalTTC: string | number;
  status: string;
  type: string;
}

export default function InvoicesIndex() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);

  // Fetch invoices
  const { data: invoices, isLoading: isLoadingInvoices } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });

  // Delete invoice mutation
  const deleteInvoiceMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/invoices/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({
        title: "Facture supprimée",
        description: "La facture a été supprimée avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la suppression de la facture: ${error}`,
        variant: "destructive",
      });
    },
  });

  // Mark as paid mutation
  const markAsPaidMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PUT", `/api/invoices/${id}`, { status: "paid" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({
        title: "Statut mis à jour",
        description: "La facture a été marquée comme payée.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la mise à jour du statut: ${error}`,
        variant: "destructive",
      });
    },
  });

  // Invoice table columns
  const invoiceColumns = [
    {
      header: "Numéro",
      accessorKey: "number",
      cell: (invoice: Invoice) => (
        <Link href={`/invoices/${invoice.id}`}>
          <a className="text-primary-700 hover:underline font-medium">
            {invoice.number}
          </a>
        </Link>
      ),
    },
    {
      header: "Type",
      accessorKey: "type",
      cell: (invoice: Invoice) => {
        const typeMap: Record<string, string> = {
          deposit: "Acompte",
          intermediate: "Intermédiaire",
          final: "Finale",
        };
        return <span className="text-slate-700">{typeMap[invoice.type] || invoice.type}</span>;
      },
    },
    {
      header: "Client",
      accessorKey: "client.name",
      cell: (invoice: Invoice) => <span className="text-slate-700">{invoice.client?.name}</span>,
    },
    {
      header: "Date",
      accessorKey: "issueDate",
      cell: (invoice: Invoice) => <span className="text-slate-700">{formatDate(invoice.issueDate)}</span>,
    },
    {
      header: "Échéance",
      accessorKey: "dueDate",
      cell: (invoice: Invoice) => <span className="text-slate-700">{formatDate(invoice.dueDate)}</span>,
    },
    {
      header: "Montant",
      accessorKey: "totalTTC",
      cell: (invoice: Invoice) => <span className="text-slate-700">{formatPrice(invoice.totalTTC)}</span>,
    },
    {
      header: "Statut",
      accessorKey: "status",
      cell: (invoice: Invoice) => <BadgeStatus status={invoice.status} />,
    },
  ];

  // Invoice actions
  const invoiceActions = [
    {
      label: "Voir",
      icon: <Eye className="h-4 w-4" />,
      onClick: (invoice: Invoice) => navigate(`/invoices/${invoice.id}`),
    },
    {
      label: "Imprimer",
      icon: <Printer className="h-4 w-4" />,
      onClick: (invoice: Invoice) => {
        window.open(`/api/invoices/${invoice.id}/pdf`, '_blank');
      },
    },
    {
      label: "Éditer",
      icon: <FileEdit className="h-4 w-4" />,
      onClick: (invoice: Invoice) => navigate(`/invoices/edit/${invoice.id}`),
    },
    {
      label: "Marquer comme payée",
      icon: <CheckCircle className="h-4 w-4 text-green-600" />,
      onClick: (invoice: Invoice) => markAsPaidMutation.mutate(invoice.id),
      disabled: (invoice: Invoice) => invoice.status === "paid",
    },
    {
      label: "Supprimer",
      icon: <Trash2 className="h-4 w-4 text-red-600" />,
      onClick: (invoice: Invoice) => setInvoiceToDelete(invoice),
    },
  ];

  const handleDeleteConfirm = () => {
    if (invoiceToDelete) {
      deleteInvoiceMutation.mutate(invoiceToDelete.id);
      setInvoiceToDelete(null);
    }
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8 mt-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Factures</h1>
            <p className="mt-1 text-sm text-slate-600">
              Gérez toutes vos factures
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Button variant="outline" className="flex items-center">
              <FilterX className="mr-2 h-4 w-4" />
              Filtrer
            </Button>
            <Button className="flex items-center" asChild>
              <Link href="/quotes?status=signed">
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle Facture
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <DataTable
        columns={invoiceColumns}
        data={invoices || []}
        actionMenuItems={invoiceActions}
        isLoading={isLoadingInvoices}
        onRowClick={(invoice) => navigate(`/invoices/${invoice.id}`)}
        emptyState={
          <div className="text-center py-8">
            <CreditCard className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-2 text-sm font-medium text-slate-900">Aucune facture</h3>
            <p className="mt-1 text-sm text-slate-500">
              Créez une facture à partir d'un devis signé.
            </p>
            <div className="mt-6">
              <Button asChild>
                <Link href="/quotes?status=signed">
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle Facture
                </Link>
              </Button>
            </div>
          </div>
        }
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!invoiceToDelete} onOpenChange={(open) => !open && setInvoiceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la facture ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette facture ? Cette action est irréversible et supprimera définitivement la facture {invoiceToDelete?.number}.
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
