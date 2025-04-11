import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { 
  Users, 
  Plus, 
  Eye, 
  FileEdit, 
  Trash2,
  Mail,
  FileText,
  BuildingIcon,
  User2Icon
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { ClientForm } from "@/components/clients/client-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Client {
  id: number;
  type: string;
  companyName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  siret: string;
}

export default function ClientsIndex() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);

  // Fetch clients
  const { data: clients, isLoading: isLoadingClients } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  // Create client mutation
  const createClientMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/clients", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Client créé",
        description: "Le client a été créé avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la création du client: ${error}`,
        variant: "destructive",
      });
    }
  });

  // Update client mutation
  const updateClientMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      return await apiRequest("PUT", `/api/clients/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      setIsEditDialogOpen(false);
      setClientToEdit(null);
      toast({
        title: "Client mis à jour",
        description: "Le client a été mis à jour avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la mise à jour du client: ${error}`,
        variant: "destructive",
      });
    }
  });

  // Delete client mutation
  const deleteClientMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/clients/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "Client supprimé",
        description: "Le client a été supprimé avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la suppression du client: ${error}`,
        variant: "destructive",
      });
    },
  });

  // Client table columns
  const clientColumns = [
    {
      header: "Nom",
      accessorKey: "name",
      cell: (client: Client) => (
        <div className="flex items-center">
          {client.type === "company" ? (
            <BuildingIcon className="h-4 w-4 mr-2 text-slate-400" />
          ) : (
            <User2Icon className="h-4 w-4 mr-2 text-slate-400" />
          )}
          <span className="font-medium text-slate-900">
            {client.type === "company" 
              ? client.companyName 
              : `${client.firstName} ${client.lastName}`}
          </span>
        </div>
      ),
    },
    {
      header: "Email",
      accessorKey: "email",
      cell: (client: Client) => <span className="text-slate-700">{client.email}</span>,
    },
    {
      header: "Téléphone",
      accessorKey: "phone",
      cell: (client: Client) => <span className="text-slate-700">{client.phone}</span>,
    },
    {
      header: "Adresse",
      accessorKey: "address",
      cell: (client: Client) => (
        <span className="text-slate-700">
          {client.address}, {client.zipCode} {client.city}
        </span>
      ),
    },
    {
      header: "Type",
      accessorKey: "type",
      cell: (client: Client) => (
        <Badge variant="outline">
          {client.type === "company" ? "Société" : "Particulier"}
        </Badge>
      ),
    },
  ];

  // Client actions
  const clientActions = [
    {
      label: "Nouveau devis",
      icon: <FileText className="h-4 w-4" />,
      onClick: (client: Client) => navigate(`/quotes/create?clientId=${client.id}`),
    },
    {
      label: "Envoyer un email",
      icon: <Mail className="h-4 w-4" />,
      onClick: (client: Client) => window.open(`mailto:${client.email}`),
    },
    {
      label: "Modifier",
      icon: <FileEdit className="h-4 w-4" />,
      onClick: (client: Client) => {
        setClientToEdit(client);
        setIsEditDialogOpen(true);
      },
    },
    {
      label: "Supprimer",
      icon: <Trash2 className="h-4 w-4 text-red-600" />,
      onClick: (client: Client) => setClientToDelete(client),
    },
  ];

  const handleDeleteConfirm = () => {
    if (clientToDelete) {
      deleteClientMutation.mutate(clientToDelete.id);
      setClientToDelete(null);
    }
  };

  const handleCreateClient = (data: any) => {
    createClientMutation.mutate(data);
  };

  const handleUpdateClient = (data: any) => {
    if (clientToEdit) {
      updateClientMutation.mutate({ id: clientToEdit.id, data });
    }
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8 mt-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
            <p className="mt-1 text-sm text-slate-600">
              Gérez tous vos clients
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button className="flex items-center" onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Client
            </Button>
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <DataTable
        columns={clientColumns}
        data={clients || []}
        actionMenuItems={clientActions}
        isLoading={isLoadingClients}
        emptyState={
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-2 text-sm font-medium text-slate-900">Aucun client</h3>
            <p className="mt-1 text-sm text-slate-500">
              Commencez par ajouter un nouveau client.
            </p>
            <div className="mt-6">
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nouveau Client
              </Button>
            </div>
          </div>
        }
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!clientToDelete} onOpenChange={(open) => !open && setClientToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le client ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible et supprimera toutes les données associées à ce client.
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

      {/* Create Client Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau client</DialogTitle>
          </DialogHeader>
          <ClientForm 
            onSubmit={handleCreateClient} 
            isPending={createClientMutation.isPending} 
          />
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) setClientToEdit(null);
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier le client</DialogTitle>
          </DialogHeader>
          {clientToEdit && (
            <ClientForm 
              onSubmit={handleUpdateClient} 
              isPending={updateClientMutation.isPending} 
              defaultValues={clientToEdit}
            />
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
