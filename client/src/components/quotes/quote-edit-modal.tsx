import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { formatDateInput } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";

interface QuoteEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  section: "info" | "client" | "project" | "conditions" | "notes";
  data: any;
  clients?: any[];
  projects?: any[];
  onSave: (data: any) => void;
}

export function QuoteEditModal({
  open,
  onOpenChange,
  title,
  section,
  data,
  clients = [],
  projects = [],
  onSave,
}: QuoteEditModalProps) {
  // Basic form schema for each section
  const getFormSchema = () => {
    switch (section) {
      case "info":
        return z.object({
          number: z.string().min(1, "Le numéro du devis est requis"),
          issueDate: z.string().min(1, "La date d'émission est requise"),
          validUntil: z.string().min(1, "La date de validité est requise"),
          depositPercent: z.number().min(0).max(100),
        });
      case "client":
        return z.object({
          clientId: z.number().min(1, "Veuillez sélectionner un client"),
        });
      case "project":
        return z.object({
          projectId: z.number().nullable(),
        });
      case "conditions":
        return z.object({
          conditions: z.string(),
        });
      case "notes":
        return z.object({
          notes: z.string(),
        });
      default:
        return z.object({});
    }
  };

  // Initialize form with current data
  const form = useForm<any>({
    resolver: zodResolver(getFormSchema()),
    defaultValues: {
      ...data,
    },
  });

  // Handle form submission
  const onSubmit = (values: any) => {
    onSave(values);
    onOpenChange(false);
  };

  // Render form fields based on section
  const renderFormFields = () => {
    switch (section) {
      case "info":
        return (
          <>
            <FormField
              control={form.control}
              name="number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numéro du devis</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="issueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date d'émission</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      value={formatDateInput(field.value)}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="validUntil"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date de validité</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      value={formatDateInput(field.value)}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="depositPercent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Acompte (%)</FormLabel>
                  <Select
                    value={field.value?.toString()}
                    onValueChange={(value) => field.onChange(parseInt(value))}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un pourcentage" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">Pas d'acompte</SelectItem>
                      <SelectItem value="10">10%</SelectItem>
                      <SelectItem value="20">20%</SelectItem>
                      <SelectItem value="30">30%</SelectItem>
                      <SelectItem value="40">40%</SelectItem>
                      <SelectItem value="50">50%</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
      
      case "client":
        return (
          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client</FormLabel>
                <Select
                  value={field.value?.toString()}
                  onValueChange={(value) => field.onChange(parseInt(value))}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un client" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.type === "company" 
                          ? client.companyName 
                          : `${client.firstName} ${client.lastName}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      
      case "project":
        return (
          <FormField
            control={form.control}
            name="projectId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Projet / Chantier</FormLabel>
                <Select
                  value={field.value?.toString() || ""}
                  onValueChange={(value) => field.onChange(value === "no_project" ? null : parseInt(value))}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un projet" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="no_project">Aucun projet</SelectItem>
                    {projects?.map((project) => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Optionnel - Associez ce devis à un projet
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      
      case "conditions":
        return (
          <FormField
            control={form.control}
            name="conditions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Conditions de paiement</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    rows={6}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      
      case "notes":
        return (
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    rows={6}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {renderFormFields()}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit">
                Enregistrer
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}