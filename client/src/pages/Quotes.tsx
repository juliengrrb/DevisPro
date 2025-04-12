import { useState } from "react";
import { Link } from "wouter";
import { useQuotes } from "@/hooks/use-quotes";
import { useClients } from "@/hooks/use-clients";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PlusCircle, Calendar, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

const Quotes = () => {
  const { data: quotes, isLoading: isLoadingQuotes } = useQuotes();
  const { data: clients, isLoading: isLoadingClients } = useClients();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter quotes based on search term
  const filteredQuotes = quotes?.filter(quote => {
    const client = clients?.find(c => c.id === quote.client_id);
    const searchString = `${quote.quote_number} ${client?.name || ""} ${client?.company || ""}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  return (
    <div>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mes devis</h1>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <Link href="/nouveau-devis">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nouveau devis
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Search and filters */}
      <div className="mb-6">
        <div className="flex rounded-md shadow-sm">
          <div className="relative flex items-stretch flex-grow focus-within:z-10">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              className="pl-10 rounded-r-none"
              placeholder="Rechercher un devis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="-ml-px rounded-l-none">
            <Filter className="h-5 w-5 text-gray-400 mr-2" />
            Filtrer
          </Button>
        </div>
      </div>

      {/* Quotes list */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {isLoadingQuotes || isLoadingClients ? (
          <div className="p-4 space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : filteredQuotes && filteredQuotes.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {filteredQuotes.map((quote) => {
              // Find client for this quote
              const client = clients?.find(c => c.id === quote.client_id);
              
              return (
                <li key={quote.id}>
                  <a href="#" className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-primary-600 truncate">
                            {client?.company || client?.name}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            Client: {client?.name}
                          </p>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex flex-col items-end">
                          <p className="text-sm font-medium text-gray-900">
                            {formatCurrency(Number(quote.total_ttc))}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            Devis #{quote.quote_number}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                            Créé le {formatDate(quote.issue_date)}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            quote.status === 'accepted' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {quote.status === 'accepted' ? 'Accepté' : 'En attente'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </a>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">
              {searchTerm ? "Aucun devis correspondant à votre recherche" : "Aucun devis pour le moment"}
            </p>
            {!searchTerm && (
              <div className="mt-4">
                <Link href="/nouveau-devis">
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Créer votre premier devis
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Quotes;
