import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Client, QuoteItem, insertQuoteSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCreateQuote, useGenerateQuoteNumber } from "@/hooks/use-quotes";
import { calculateSubtotal, calculateTotalTax, calculateTotal, getCurrentDate, getDefaultValidUntilDate } from "@/lib/utils";
import { downloadQuotePdf } from "@/lib/pdf-generator";
import QuoteItemsList from "./QuoteItemsList";
import ClientSelection from "./ClientSelection";
import ClientForm from "./ClientForm";

const formSchema = insertQuoteSchema.extend({
  issue_date: z.string().min(1, "La date d'émission est requise"),
  valid_until: z.string().min(1, "La date de validité est requise"),
});

const QuoteForm = () => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([
    { description: "", quantity: 1, unit_price: 0, tax_rate: 20 }
  ]);
  const [showClientForm, setShowClientForm] = useState(false);
  const { data: quoteNumberData } = useGenerateQuoteNumber();
  const { toast } = useToast();
  const createQuote = useCreateQuote();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quote_number: quoteNumberData?.quote_number || "D-2023-001",
      issue_date: getCurrentDate(),
      valid_until: getDefaultValidUntilDate(),
      payment_terms: "30 jours",
      notes: "",
      status: "pending",
      client_id: 0,
      total_ht: 0,
      total_tax: 0,
      total_ttc: 0,
      items: []
    }
  });

  // Update quote number when data is loaded
  if (quoteNumberData?.quote_number && form.getValues('quote_number') !== quoteNumberData.quote_number) {
    form.setValue('quote_number', quoteNumberData.quote_number);
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!selectedClient) {
      toast({
        title: "Client requis",
        description: "Veuillez sélectionner un client pour le devis",
        variant: "destructive"
      });
      return;
    }

    // Check if any item has empty description
    if (quoteItems.some(item => !item.description.trim())) {
      toast({
        title: "Description requise",
        description: "Veuillez remplir la description pour tous les articles",
        variant: "destructive"
      });
      return;
    }

    try {
      // Calculate totals
      const totalHt = calculateSubtotal(quoteItems);
      const totalTax = calculateTotalTax(quoteItems);
      const totalTtc = calculateTotal(quoteItems);

      // Prepare submission data
      const submissionData = {
        ...values,
        client_id: selectedClient.id,
        total_ht: totalHt,
        total_tax: totalTax,
        total_ttc: totalTtc,
        items: quoteItems
      };

      // Create quote
      const newQuote = await createQuote.mutateAsync(submissionData);

      toast({
        title: "Devis créé",
        description: "Le devis a été créé avec succès."
      });

      // Download PDF
      downloadQuotePdf(newQuote, selectedClient, quoteItems);

      // Reset form
      form.reset({
        ...form.getValues(),
        notes: ""
      });
      setQuoteItems([{ description: "", quantity: 1, unit_price: 0, tax_rate: 20 }]);
      setSelectedClient(null);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du devis.",
        variant: "destructive"
      });
    }
  };

  const handleClientSelected = (client: Client | null) => {
    setSelectedClient(client);
    if (client) {
      form.setValue('client_id', client.id);
    } else {
      form.setValue('client_id', 0);
    }
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 divide-y divide-gray-200">
          <div className="space-y-8 divide-y divide-gray-200">
            {/* Client Information */}
            <div className="pt-4">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Informations client</h3>
                <p className="mt-1 text-sm text-gray-500">Sélectionnez un client existant ou créez-en un nouveau.</p>
              </div>
              
              <div className="mt-6">
                <ClientSelection 
                  selectedClient={selectedClient} 
                  onSelectClient={handleClientSelected}
                  onOpenAddClient={() => setShowClientForm(true)}
                />
              </div>
            </div>
            
            {/* Quote Information */}
            <div className="pt-6">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Informations du devis</h3>
              </div>
              
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <FormField
                    control={form.control}
                    name="quote_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Numéro de devis</FormLabel>
                        <FormControl>
                          <Input {...field} readOnly className="bg-gray-50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="sm:col-span-3">
                  <FormField
                    control={form.control}
                    name="issue_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date d'émission</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="sm:col-span-3">
                  <FormField
                    control={form.control}
                    name="valid_until"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valable jusqu'au</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="sm:col-span-3">
                  <FormField
                    control={form.control}
                    name="payment_terms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Conditions de paiement</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner les conditions de paiement" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="comptant">Paiement comptant</SelectItem>
                            <SelectItem value="15 jours">Paiement à 15 jours</SelectItem>
                            <SelectItem value="30 jours">Paiement à 30 jours</SelectItem>
                            <SelectItem value="45 jours">Paiement à 45 jours</SelectItem>
                            <SelectItem value="60 jours">Paiement à 60 jours</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
            
            {/* Quote Items */}
            <div className="pt-6">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Produits et services</h3>
                <p className="mt-1 text-sm text-gray-500">Ajoutez les articles et services de votre devis.</p>
              </div>
              
              <div className="mt-6">
                <QuoteItemsList 
                  items={quoteItems}
                  onChange={setQuoteItems}
                />
              </div>
            </div>
            
            {/* Additional Information */}
            <div className="pt-6">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Informations complémentaires</h3>
                <p className="mt-1 text-sm text-gray-500">Ajoutez des notes ou des conditions particulières à votre devis.</p>
              </div>
              
              <div className="mt-6">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes et conditions</FormLabel>
                      <FormControl>
                        <Textarea 
                          rows={4} 
                          placeholder="Exemple: Délai d'exécution, conditions particulières, etc."
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
          
          <div className="pt-5">
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline">
                Enregistrer en brouillon
              </Button>
              <Button 
                type="submit" 
                disabled={createQuote.isPending || !selectedClient}
              >
                Générer le devis
              </Button>
            </div>
          </div>
        </form>
      </Form>

      {/* Client Form Dialog */}
      <ClientForm 
        open={showClientForm}
        onOpenChange={setShowClientForm}
        onSuccess={handleClientSelected}
      />
    </div>
  );
};

export default QuoteForm;
