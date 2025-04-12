import { useState } from "react";
import { useClients, useDeleteClient } from "@/hooks/use-clients";
import { Client } from "@shared/schema";
import { PlusCircle, Pencil, Trash2, Mail, Phone, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import ClientForm from "@/components/ClientForm";
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
import { useToast } from "@/hooks/use-toast";

const Clients = () => {
  const { data: clients, isLoading } = useClients();
  const deleteClient = useDeleteClient();
  const { toast } = useToast();
  
  const [showAddClientForm, setShowAddClientForm] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | undefined>(undefined);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter clients based on search term
  const filteredClients = clients?.filter(client => {
    const searchString = `${client.name} ${client.company || ""} ${client.email} ${client.city}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  const handleEditClient = (client: Client) => {
    setClientToEdit(client);
    setShowAddClientForm(true);
  };

  const handleCloseForm = () => {
    setClientToEdit(undefined);
    setShowAddClientForm(false);
  };

  const handleConfirmDelete = async () => {
    if (!clientToDelete) return;
    
    try {
      await deleteClient.mutateAsync(clientToDelete.id);
      toast({
        title: "Client supprimé",
        description: "Le client a été supprimé avec succès."
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression du client.",
        variant: "destructive"
      });
    } finally {
      setClientToDelete(null);
    }
  };

  return (
    <div>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <Button onClick={() => setShowAddClientForm(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Ajouter un client
          </Button>
        </div>
      </div>
      
      {/* Search clients */}
      <div className="mb-6">
        <div className="flex rounded-md shadow-sm">
          <div className="relative flex items-stretch flex-grow focus-within:z-10">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              className="pl-10"
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {/* Client list */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {isLoading ? (
          <div className="p-4 space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : filteredClients && filteredClients.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {filteredClients.map((client) => (
              <li key={client.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <p className="text-sm font-medium text-primary-600 truncate">{client.name}</p>
                      {client.company && (
                        <p className="mt-1 sm:mt-0 sm:ml-2 text-sm text-gray-500">{client.company}</p>
                      )}
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClient(client)}
                        className="mr-2"
                      >
                        <Pencil className="h-4 w-4 text-gray-400" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setClientToDelete(client)}
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex flex-col sm:flex-row sm:gap-6">
                      <p className="flex items-center text-sm text-gray-500">
                        <Mail className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        <span>{client.email}</span>
                      </p>
                      <p className="mt-2 sm:mt-0 flex items-center text-sm text-gray-500">
                        <Phone className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        <span>{client.phone}</span>
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      <span>{client.address}, {client.postal_code} {client.city}</span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">
              {searchTerm ? "Aucun client correspondant à votre recherche" : "Aucun client pour le moment"}
            </p>
            {!searchTerm && (
              <div className="mt-4">
                <Button onClick={() => setShowAddClientForm(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Ajouter votre premier client
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Client Form Dialog */}
      <ClientForm 
        open={showAddClientForm}
        onOpenChange={handleCloseForm}
        client={clientToEdit}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!clientToDelete} onOpenChange={(open) => !open && setClientToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le client</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce client ? Cette action ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Clients;
