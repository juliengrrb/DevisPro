import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface QuoteEmailFormProps {
  quote: any;
  onSend: (data: any) => void;
  onCancel: () => void;
  isPending: boolean;
}

const formSchema = z.object({
  email: z.string().email("Veuillez entrer une adresse email valide"),
  subject: z.string().min(1, "Le sujet est requis"),
  message: z.string().min(1, "Le message est requis"),
});

export function QuoteEmailForm({ quote, onSend, onCancel, isPending }: QuoteEmailFormProps) {
  const [clientEmail, setClientEmail] = useState("");

  // Get client email from quote if available
  useEffect(() => {
    if (quote?.client?.email) {
      setClientEmail(quote.client.email);
    }
  }, [quote]);

  // Default subject and message
  const defaultSubject = `Devis ${quote?.number || 'N°'} - DevisPro BTP`;
  const defaultMessage = `Bonjour${quote?.client ? ' ' + quote.client.firstName : ''},

Veuillez trouver ci-joint le devis ${quote?.number || ''} pour ${quote?.project?.name || 'votre projet'}.

N'hésitez pas à me contacter pour toute question.

Cordialement,
DevisPro BTP`;

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: clientEmail,
      subject: defaultSubject,
      message: defaultMessage,
    },
  });

  // Update form when client email changes
  useEffect(() => {
    if (clientEmail) {
      form.setValue("email", clientEmail);
    }
  }, [clientEmail, form]);

  // Handle form submission
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    onSend(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email du destinataire</FormLabel>
              <FormControl>
                <Input {...field} placeholder="email@example.com" type="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sujet</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Sujet de l'email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Corps du message" rows={6} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Annuler
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <LoadingSpinner className="mr-2" />
                Envoi en cours...
              </>
            ) : (
              "Envoyer"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
