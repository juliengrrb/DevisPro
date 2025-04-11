import { Card, CardContent } from "@/components/ui/card";
import { Mail, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface Client {
  id: number;
  name: string;
  email: string;
}

export function RecentClients() {
  const { data: clients, isLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  return (
    <Card className="shadow-sm h-full">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
        <h3 className="text-md font-medium text-slate-900">Clients récents</h3>
      </div>
      
      {isLoading ? (
        <CardContent className="p-0">
          <ul role="list" className="divide-y divide-slate-200 max-h-[360px] overflow-y-auto">
            {Array.from({ length: 4 }).map((_, index) => (
              <li key={index} className="px-6 py-4 flex items-center">
                <div className="min-w-0 flex-1">
                  <Skeleton className="h-5 w-40 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="ml-6 flex-shrink-0 flex">
                  <Skeleton className="h-8 w-8 mr-4 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      ) : (
        <CardContent className="p-0">
          <ul role="list" className="divide-y divide-slate-200 max-h-[360px] overflow-y-auto">
            {clients?.map((client) => (
              <li key={client.id} className="px-6 py-4 flex items-center hover:bg-slate-50">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {client.name}
                  </p>
                  <p className="text-sm text-slate-500 truncate">{client.email}</p>
                </div>
                <div className="ml-6 flex-shrink-0 flex">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-primary-700 hover:text-primary-900 mr-1"
                    asChild
                  >
                    <Link href={`mailto:${client.email}`}>
                      <Mail className="h-5 w-5" />
                      <span className="sr-only">Email</span>
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-primary-700 hover:text-primary-900"
                    asChild
                  >
                    <Link href={`/quotes/create?clientId=${client.id}`}>
                      <FileText className="h-5 w-5" />
                      <span className="sr-only">Nouveau devis</span>
                    </Link>
                  </Button>
                </div>
              </li>
            ))}
            
            {clients?.length === 0 && (
              <li className="px-6 py-12 text-center">
                <p className="text-sm text-slate-500">Aucun client trouvé</p>
              </li>
            )}
          </ul>
          
          <div className="px-6 py-3 border-t border-slate-200 bg-slate-50">
            <Button 
              variant="ghost" 
              className="w-full flex justify-center items-center text-sm text-primary-700 hover:text-primary-900 font-medium"
              asChild
            >
              <Link href="/clients/create">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un client
              </Link>
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
