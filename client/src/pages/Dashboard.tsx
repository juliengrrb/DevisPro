import { useQuotes } from "@/hooks/use-quotes";
import { useClients } from "@/hooks/use-clients";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, CheckCircle, Clock, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const { data: quotes, isLoading: isLoadingQuotes } = useQuotes();
  const { data: clients, isLoading: isLoadingClients } = useClients();

  // Calculate stats from quotes
  const stats = {
    total: 0,
    accepted: 0,
    pending: 0,
    clients: 0
  };

  if (quotes) {
    stats.total = quotes.length;
    stats.accepted = quotes.filter(quote => quote.status === 'accepted').length;
    stats.pending = quotes.filter(quote => quote.status === 'pending').length;
  }

  if (clients) {
    stats.clients = clients.length;
  }

  return (
    <div>
      <div className="pb-5 border-b border-gray-200 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Quotes */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                <FileText className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Devis en cours
                  </dt>
                  <dd>
                    {isLoadingQuotes ? (
                      <Skeleton className="h-7 w-12" />
                    ) : (
                      <div className="text-lg font-medium text-gray-900">{stats.total}</div>
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accepted Quotes */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Devis acceptés
                  </dt>
                  <dd>
                    {isLoadingQuotes ? (
                      <Skeleton className="h-7 w-12" />
                    ) : (
                      <div className="text-lg font-medium text-gray-900">{stats.accepted}</div>
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Quotes */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-amber-100 rounded-md p-3">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Devis en attente
                  </dt>
                  <dd>
                    {isLoadingQuotes ? (
                      <Skeleton className="h-7 w-12" />
                    ) : (
                      <div className="text-lg font-medium text-gray-900">{stats.pending}</div>
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Clients */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-secondary-100 rounded-md p-3">
                <Users className="h-6 w-6 text-secondary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Clients actifs
                  </dt>
                  <dd>
                    {isLoadingClients ? (
                      <Skeleton className="h-7 w-12" />
                    ) : (
                      <div className="text-lg font-medium text-gray-900">{stats.clients}</div>
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Quotes */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Devis récents</h2>
        <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
          {isLoadingQuotes ? (
            <div className="p-4 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : quotes && quotes.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {quotes.slice(0, 5).map((quote) => {
                // Find client for this quote
                const client = clients?.find(c => c.id === quote.client_id);
                
                return (
                  <li key={quote.id}>
                    <a href="#" className="block hover:bg-gray-50">
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-primary-600 truncate">
                              {quote.quote_number} - {client?.name || "Client inconnu"}
                            </p>
                            <div className="ml-2 flex-shrink-0 flex">
                              <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                quote.status === 'accepted' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {quote.status === 'accepted' ? 'Accepté' : 'En attente'}
                              </p>
                            </div>
                          </div>
                          <div className="ml-2 flex-shrink-0 flex flex-col text-right">
                            <p className="text-sm text-gray-500">{formatCurrency(Number(quote.total_ttc))}</p>
                            <p className="text-xs text-gray-400">{formatDate(quote.issue_date)}</p>
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
              <p className="text-sm text-gray-500">Aucun devis pour le moment</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
