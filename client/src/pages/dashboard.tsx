import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { StatsCard } from "@/components/stats-card";
import { ProjectCard } from "@/components/project-card";
import { RecentClients } from "@/components/recent-clients";
import { DataTable } from "@/components/ui/data-table";
import { BadgeStatus } from "@/components/ui/badge-status";
import { formatPrice, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { 
  FileText, 
  FilterX, 
  Plus, 
  FileEdit, 
  Eye, 
  Copy, 
  CreditCard,
  Building2
} from "lucide-react";

interface DashboardStats {
  totalQuotes: number;
  pendingQuotes: number;
  acceptedQuotes: number;
  totalRevenue: number;
  quoteIncrease: number;
  revenueIncrease: number;
}

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

interface Project {
  id: number;
  name: string;
  client: {
    name: string;
  };
  startDate: string;
  endDate: string;
  progress: number;
}

export default function Dashboard() {
  const [, navigate] = useLocation();

  // Fetch dashboard stats
  const { data: stats, isLoading: isLoadingStats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  // Fetch recent quotes
  const { data: quotes, isLoading: isLoadingQuotes } = useQuery<Quote[]>({
    queryKey: ["/api/quotes"],
  });

  // Fetch projects
  const { data: projects, isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
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
  ];

  return (
    <DashboardLayout>
      {/* Dashboard Header */}
      <div className="mb-8 mt-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
            <p className="mt-1 text-sm text-slate-600">
              Gérez vos devis, factures et clients
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

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard
          title="Total Devis"
          value={isLoadingStats ? "..." : stats?.totalQuotes || 0}
          icon={<FileText className="h-6 w-6" />}
          increaseBadge={
            stats
              ? {
                  value: stats.quoteIncrease,
                  label: "ce mois",
                }
              : undefined
          }
        />

        <StatsCard
          title="Devis en attente"
          value={isLoadingStats ? "..." : stats?.pendingQuotes || 0}
          icon={
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          iconColor="blue"
          progressBar={
            stats && stats.totalQuotes
              ? {
                  value: (stats.pendingQuotes / stats.totalQuotes) * 100,
                  label: `${Math.round((stats.pendingQuotes / stats.totalQuotes) * 100)}% de tous les devis`,
                }
              : undefined
          }
        />

        <StatsCard
          title="Devis acceptés"
          value={isLoadingStats ? "..." : stats?.acceptedQuotes || 0}
          icon={
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          }
          iconColor="green"
          progressBar={
            stats && stats.totalQuotes
              ? {
                  value: (stats.acceptedQuotes / stats.totalQuotes) * 100,
                  label: `${Math.round((stats.acceptedQuotes / stats.totalQuotes) * 100)}% de tous les devis`,
                }
              : undefined
          }
        />

        <StatsCard
          title="Chiffre d'affaires"
          value={isLoadingStats ? "..." : formatPrice(stats?.totalRevenue || 0)}
          icon={
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          iconColor="construction"
          increaseBadge={
            stats
              ? {
                  value: stats.revenueIncrease,
                  label: "vs. mois dernier",
                }
              : undefined
          }
        />
      </div>

      {/* Recent Quotes */}
      <h2 className="text-lg font-medium text-slate-900 mb-4">Devis récents</h2>
      <DataTable
        columns={quoteColumns}
        data={quotes?.slice(0, 5) || []}
        actionMenuItems={quoteActions}
        isLoading={isLoadingQuotes}
        className="mb-8"
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

      {/* Additional sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Clients */}
        <div className="lg:col-span-1">
          <RecentClients />
        </div>

        {/* Active Projects */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="text-md font-medium text-slate-900">Chantiers en cours</h3>
              <Link href="/projects">
                <a className="text-sm text-primary-700 hover:text-primary-900 font-medium">
                  Voir tous
                </a>
              </Link>
            </div>
            <div className="p-6">
              {isLoadingProjects ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="border border-slate-200 rounded-lg overflow-hidden shadow-sm animate-pulse"
                    >
                      <div className="bg-slate-100 h-12"></div>
                      <div className="p-4 space-y-4">
                        <div className="h-4 bg-slate-200 rounded"></div>
                        <div className="h-4 bg-slate-200 rounded"></div>
                        <div className="h-4 bg-slate-200 rounded"></div>
                        <div className="h-2 bg-slate-200 rounded mt-6"></div>
                      </div>
                      <div className="bg-slate-50 h-12 border-t border-slate-200"></div>
                    </div>
                  ))}
                </div>
              ) : projects && projects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {projects.slice(0, 4).map((project) => (
                    <ProjectCard
                      key={project.id}
                      id={project.id}
                      name={project.name}
                      client={project.client?.name || ""}
                      startDate={formatDate(project.startDate)}
                      endDate={formatDate(project.endDate)}
                      progress={project.progress}
                      quoteLink={`/quotes?projectId=${project.id}`}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building2 className="mx-auto h-12 w-12 text-slate-300" />
                  <h3 className="mt-2 text-sm font-medium text-slate-900">
                    Aucun chantier en cours
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Commencez par créer un nouveau chantier.
                  </p>
                  <div className="mt-6">
                    <Button asChild>
                      <Link href="/projects/create">
                        <Plus className="mr-2 h-4 w-4" />
                        Nouveau Chantier
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
