import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
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
import { QuoteLineItems } from "@/components/quotes/quote-line-items";
import { 
  calculateQuoteTotals, 
  calculateDeposit,
  formatDateInput,
} from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { insertQuoteSchema } from "@shared/schema";

interface QuoteFormProps {
  quote: any;
  clients: any[];
  onChange: (data: any) => void;
  isCreating: boolean;
}

export function QuoteForm({ quote, clients, onChange, isCreating }: QuoteFormProps) {
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  // Extend the insertQuoteSchema with client validation
  const formSchema = insertQuoteSchema.extend({
    clientId: z.number({
      required_error: "Veuillez sélectionner un client",
    }).min(1, "Veuillez sélectionner un client"),
    projectId: z.number().nullable().optional(),
    lineItems: z.array(
      z.object({
        type: z.string(),
        title: z.string().optional().nullable(),
        description: z.string().optional().nullable(),
        quantity: z.string().or(z.number()).nullable().optional(),
        unit: z.string().nullable().optional(),
        unitPrice: z.string().or(z.number()).nullable().optional(),
        vatRate: z.string().or(z.number()).nullable().optional(),
        totalHT: z.string().or(z.number()).nullable().optional(),
        position: z.number(),
      })
    ).optional(),
  });

  // Get projects for selected client
  const { data: projects } = useQuery({
    queryKey: [`/api/clients/${selectedClient?.id}/projects`],
    enabled: !!selectedClient?.id,
  });

  // Initialize form with quote data
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...quote,
      clientId: quote.clientId || 0,
      projectId: quote.projectId || null,
    },
  });

  // Update form values when quote changes (for duplicate scenario)
  useEffect(() => {
    form.reset({
      ...quote,
      clientId: quote.clientId || 0,
      projectId: quote.projectId || null,
    });
  }, [quote, form]);

  // Set selected client when form is initialized or client is changed
  useEffect(() => {
    const clientId = form.getValues().clientId;
    if (clientId && clients) {
      const client = clients.find(c => c.id === clientId);
      setSelectedClient(client);
    }
  }, [clients, form]);

  // Set selected project when form is initialized or project is changed
  useEffect(() => {
    const projectId = form.getValues().projectId;
    if (projectId && projects) {
      const project = projects.find(p => p.id === projectId);
      setSelectedProject(project);
    }
  }, [projects, form]);

  // Handle form submission
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    // Calculate totals
    const lineItems = data.lineItems || [];
    const { totalHT, totalTVA, totalTTC } = calculateQuoteTotals(lineItems);
    
    // Calculate deposit if needed
    const deposit = calculateDeposit(totalTTC, data.depositPercent || 0);
    
    // Update the complete data
    const updatedData = {
      ...data,
      totalHT: totalHT.toString(),
      totalTVA: totalTVA.toString(),
      totalTTC: totalTTC.toString(),
      deposit: deposit.toString(),
    };
    
    onChange(updatedData);
  };

  // Handle line items changes
  const handleLineItemsChange = (lineItems: any[]) => {
    // Calculate totals
    const { totalHT, totalTVA, totalTTC } = calculateQuoteTotals(lineItems);
    
    // Calculate deposit
    const depositPercent = form.getValues().depositPercent || 0;
    const deposit = calculateDeposit(totalTTC, depositPercent);
    
    // Update form values
    form.setValue("lineItems", lineItems);
    form.setValue("totalHT", totalHT.toString());
    form.setValue("totalTVA", totalTVA.toString());
    form.setValue("totalTTC", totalTTC.toString());
    form.setValue("deposit", deposit.toString());
    
    // Submit the form to update parent
    form.handleSubmit(onSubmit)();
  };

  // Handle client change
  const handleClientChange = (clientId: string) => {
    const id = parseInt(clientId);
    form.setValue("clientId", id);
    form.setValue("projectId", null);
    
    // Find the selected client
    const client = clients.find(c => c.id === id);
    setSelectedClient(client);
    setSelectedProject(null);
    
    // Submit form to update parent
    form.handleSubmit(onSubmit)();
  };

  // Handle project change
  const handleProjectChange = (projectId: string) => {
    // Check if "no_project" is selected
    if (projectId === "no_project") {
      form.setValue("projectId", null);
      setSelectedProject(null);
    } else {
      // It's a numeric project ID
      const id = parseInt(projectId);
      form.setValue("projectId", id);
      
      // Find the selected project
      if (projects) {
        const project = projects.find(p => p.id === id);
        setSelectedProject(project);
      }
    }
    
    // Submit form to update parent
    form.handleSubmit(onSubmit)();
  };

  // Handle deposit percent change
  const handleDepositPercentChange = (percent: string) => {
    const depositPercent = parseInt(percent);
    form.setValue("depositPercent", depositPercent);
    
    // Recalculate deposit amount
    const totalTTC = parseFloat(form.getValues().totalTTC || "0");
    const deposit = calculateDeposit(totalTTC, depositPercent);
    form.setValue("deposit", deposit.toString());
    
    // Submit form to update parent
    form.handleSubmit(onSubmit)();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quote Details */}
          <Card className="lg:col-span-1">
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Informations du devis</h3>
              
              <div className="space-y-4">
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
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            form.handleSubmit(onSubmit)();
                          }}
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
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            form.handleSubmit(onSubmit)();
                          }}
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
                        onValueChange={handleDepositPercentChange}
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
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          rows={3}
                          onChange={(e) => {
                            field.onChange(e);
                            form.handleSubmit(onSubmit)();
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="conditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conditions de paiement</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          rows={4}
                          onChange={(e) => {
                            field.onChange(e);
                            form.handleSubmit(onSubmit)();
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Client and Project Details */}
          <Card className="lg:col-span-1">
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Client & Projet</h3>
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client</FormLabel>
                      <Select
                        value={field.value?.toString()}
                        onValueChange={handleClientChange}
                        disabled={!isCreating && quote.status !== "draft"}
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
                
                {selectedClient && (
                  <div className="bg-slate-50 p-4 rounded-md text-sm">
                    {selectedClient.type === "company" && (
                      <p className="font-medium">{selectedClient.companyName}</p>
                    )}
                    <p>{selectedClient.firstName} {selectedClient.lastName}</p>
                    <p>{selectedClient.email}</p>
                    <p>{selectedClient.phone}</p>
                    <p>{selectedClient.address}</p>
                    <p>{selectedClient.zipCode} {selectedClient.city}</p>
                    {selectedClient.siret && <p>SIRET: {selectedClient.siret}</p>}
                  </div>
                )}
                
                <FormField
                  control={form.control}
                  name="projectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Projet / Chantier</FormLabel>
                      <Select
                        value={field.value?.toString() || ""}
                        onValueChange={handleProjectChange}
                        disabled={!selectedClient}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={selectedClient ? "Sélectionner un projet" : "Sélectionnez d'abord un client"} />
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
                
                {selectedProject && (
                  <div className="bg-slate-50 p-4 rounded-md text-sm">
                    <p className="font-medium">{selectedProject.name}</p>
                    <p>{selectedProject.description}</p>
                    <p>{selectedProject.address}</p>
                    <p>{selectedProject.zipCode} {selectedProject.city}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Totals */}
          <Card className="lg:col-span-1">
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Récapitulatif</h3>
              
              <div className="bg-slate-50 p-4 rounded-md text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Total HT:</span>
                  <span className="font-medium">{form.watch("totalHT")} €</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Total TVA:</span>
                  <span className="font-medium">{form.watch("totalTVA")} €</span>
                </div>
                
                <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
                  <span className="font-medium">Total TTC:</span>
                  <span className="font-bold">{form.watch("totalTTC")} €</span>
                </div>
                
                {form.watch("depositPercent") > 0 && (
                  <div className="flex justify-between border-t border-slate-200 pt-2 mt-2 text-primary-700">
                    <span>Acompte ({form.watch("depositPercent")}%):</span>
                    <span className="font-medium">{form.watch("deposit")} €</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Line Items */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-4">Contenu du devis</h3>
            
            <QuoteLineItems 
              lineItems={form.watch("lineItems") || []} 
              onChange={handleLineItemsChange} 
            />
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
