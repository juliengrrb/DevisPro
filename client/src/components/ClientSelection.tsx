import { useState } from "react";
import { Client } from "@shared/schema";
import { useClients } from "@/hooks/use-clients";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ClientSelectionProps {
  selectedClient: Client | null;
  onSelectClient: (client: Client) => void;
  onOpenAddClient: () => void;
}

const ClientSelection: React.FC<ClientSelectionProps> = ({ 
  selectedClient, 
  onSelectClient,
  onOpenAddClient
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { data: clients, isLoading } = useClients();

  const filteredClients = clients?.filter(client => {
    const searchString = `${client.name} ${client.company || ""} ${client.city}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  const handleSelectClient = (client: Client) => {
    onSelectClient(client);
    setOpen(false);
  };

  return (
    <div>
      {!selectedClient ? (
        <div className="bg-gray-50 p-6 border border-gray-200 rounded-md">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun client sélectionné</h3>
            <p className="mt-1 text-sm text-gray-500">Commencez par sélectionner un client pour votre devis.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 border border-gray-200 rounded-md">
          <div className="flex justify-between">
            <div>
              <h4 className="text-lg font-medium text-gray-900">{selectedClient.name}</h4>
              <p className="mt-1 text-sm text-gray-500">{selectedClient.address}</p>
              <p className="text-sm text-gray-500">{selectedClient.postal_code} {selectedClient.city}</p>
              <p className="mt-2 text-sm text-gray-500">Email: {selectedClient.email}</p>
              <p className="text-sm text-gray-500">Tél: {selectedClient.phone}</p>
            </div>
            <Button variant="ghost" onClick={() => onSelectClient(null)}>
              Changer de client
            </Button>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Search className="mr-2 h-4 w-4" />
              Sélectionner un client
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Sélectionner un client</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="mb-4">
                <Input
                  type="text"
                  placeholder="Rechercher un client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="max-h-60 overflow-y-auto">
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : filteredClients && filteredClients.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {filteredClients.map((client) => (
                      <li 
                        key={client.id} 
                        className="py-4 cursor-pointer hover:bg-gray-50" 
                        onClick={() => handleSelectClient(client)}
                      >
                        <div className="flex items-center">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {client.name}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {client.city}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">Aucun client trouvé</p>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Button onClick={onOpenAddClient}>
          Ajouter un nouveau client
        </Button>
      </div>
    </div>
  );
};

export default ClientSelection;
