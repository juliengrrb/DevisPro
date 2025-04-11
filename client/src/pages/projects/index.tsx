import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { 
  Plus, 
  Eye, 
  FileEdit, 
  Trash2,
  Clock,
  FileText,
  PercentIcon
} from "lucide-react";
import { Building2 } from "@/components/ui/building2";
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
import { ProjectForm } from "@/components/projects/project-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface Project {
  id: number;
  name: string;
  client: {
    name: string;
  };
  description: string;
  address: string;
  city: string;
  zipCode: string;
  startDate: string;
  endDate: string;
  progress: number;
}

export default function ProjectsIndex() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

  // Fetch projects
  const { data: projects, isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/projects", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Projet créé",
        description: "Le projet a été créé avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la création du projet: ${error}`,
        variant: "destructive",
      });
    }
  });

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      return await apiRequest("PUT", `/api/projects/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setIsEditDialogOpen(false);
      setProjectToEdit(null);
      toast({
        title: "Projet mis à jour",
        description: "Le projet a été mis à jour avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la mise à jour du projet: ${error}`,
        variant: "destructive",
      });
    }
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Projet supprimé",
        description: "Le projet a été supprimé avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la suppression du projet: ${error}`,
        variant: "destructive",
      });
    },
  });

  // Project table columns
  const projectColumns = [
    {
      header: "Projet",
      accessorKey: "name",
      cell: (project: Project) => (
        <div>
          <span className="font-medium text-slate-900">{project.name}</span>
          {project.description && (
            <p className="text-sm text-slate-500 truncate max-w-[250px]">{project.description}</p>
          )}
        </div>
      ),
    },
    {
      header: "Client",
      accessorKey: "client.name",
      cell: (project: Project) => <span className="text-slate-700">{project.client?.name}</span>,
    },
    {
      header: "Adresse",
      accessorKey: "address",
      cell: (project: Project) => (
        <span className="text-slate-700">
          {project.address && project.zipCode && project.city 
            ? `${project.address}, ${project.zipCode} ${project.city}`
            : "Non spécifiée"}
        </span>
      ),
    },
    {
      header: "Période",
      accessorKey: "period",
      cell: (project: Project) => (
        <div className="flex items-center">
          <Clock className="h-4 w-4 text-slate-400 mr-1" />
          <span className="text-slate-700">
            {formatDate(project.startDate)} - {formatDate(project.endDate)}
          </span>
        </div>
      ),
    },
    {
      header: "Progression",
      accessorKey: "progress",
      cell: (project: Project) => (
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-2" />
        </div>
      ),
    },
  ];

  // Project actions
  const projectActions = [
    {
      label: "Créer un devis",
      icon: <FileText className="h-4 w-4" />,
      onClick: (project: Project) => navigate(`/quotes/create?projectId=${project.id}`),
    },
    {
      label: "Modifier",
      icon: <FileEdit className="h-4 w-4" />,
      onClick: (project: Project) => {
        setProjectToEdit(project);
        setIsEditDialogOpen(true);
      },
    },
    {
      label: "Supprimer",
      icon: <Trash2 className="h-4 w-4 text-red-600" />,
      onClick: (project: Project) => setProjectToDelete(project),
    },
  ];

  const handleDeleteConfirm = () => {
    if (projectToDelete) {
      deleteProjectMutation.mutate(projectToDelete.id);
      setProjectToDelete(null);
    }
  };

  const handleCreateProject = (data: any) => {
    createProjectMutation.mutate(data);
  };

  const handleUpdateProject = (data: any) => {
    if (projectToEdit) {
      updateProjectMutation.mutate({ id: projectToEdit.id, data });
    }
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8 mt-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Projets</h1>
            <p className="mt-1 text-sm text-slate-600">
              Gérez tous vos chantiers et projets
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button className="flex items-center" onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Projet
            </Button>
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <DataTable
        columns={projectColumns}
        data={projects || []}
        actionMenuItems={projectActions}
        isLoading={isLoadingProjects}
        emptyState={
          <div className="text-center py-8">
            <Building2 className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-2 text-sm font-medium text-slate-900">Aucun projet</h3>
            <p className="mt-1 text-sm text-slate-500">
              Commencez par ajouter un nouveau projet.
            </p>
            <div className="mt-6">
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nouveau Projet
              </Button>
            </div>
          </div>
        }
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le projet ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible et supprimera toutes les données associées à ce projet.
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

      {/* Create Project Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau projet</DialogTitle>
          </DialogHeader>
          <ProjectForm 
            onSubmit={handleCreateProject} 
            isPending={createProjectMutation.isPending} 
          />
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) setProjectToEdit(null);
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier le projet</DialogTitle>
          </DialogHeader>
          {projectToEdit && (
            <ProjectForm 
              onSubmit={handleUpdateProject} 
              isPending={updateProjectMutation.isPending} 
              defaultValues={projectToEdit}
            />
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
