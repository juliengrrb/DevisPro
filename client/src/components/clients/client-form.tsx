import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { insertClientSchema } from "@shared/schema";

interface ClientFormProps {
  onSubmit: (data: any) => void;
  isPending: boolean;
  defaultValues?: any;
}

export function ClientForm({ onSubmit, isPending, defaultValues }: ClientFormProps) {
  const [clientType, setClientType] = useState(defaultValues?.type || "individual");

  // Extend the insertClientSchema with client validation
  const formSchema = insertClientSchema.extend({
    type: z.enum(["individual", "company"], {
      required_error: "Le type de client est requis",
    }),
    firstName: z.string().min(1, "Le prénom est requis").optional().nullable(),
    lastName: z.string().min(1, "Le nom est requis").optional().nullable(),
    companyName: z.string().min(1, "Le nom de l'entreprise est requis").optional().nullable(),
    email: z.string().email("Email invalide").optional().nullable(),
    phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    zipCode: z.string().optional().nullable(),
    country: z.string().default("France").optional().nullable(),
    siret: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
  }).refine((data) => {
    if (data.type === "individual") {
      return !!data.firstName && !!data.lastName;
    }
    if (data.type === "company") {
      return !!data.companyName;
    }
    return true;
  }, {
    message: "Information requise selon le type de client",
    path: ["firstName", "lastName", "companyName"],
  });

  // Initialize form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: defaultValues?.type || "individual",
      firstName: defaultValues?.firstName || "",
      lastName: defaultValues?.lastName || "",
      companyName: defaultValues?.companyName || "",
      email: defaultValues?.email || "",
      phone: defaultValues?.phone || "",
      address: defaultValues?.address || "",
      city: defaultValues?.city || "",
      zipCode: defaultValues?.zipCode || "",
      country: defaultValues?.country || "France",
      siret: defaultValues?.siret || "",
      notes: defaultValues?.notes || "",
    },
  });

  const handleClientTypeChange = (value: string) => {
    setClientType(value);
    form.setValue("type", value as "individual" | "company");
  };

  // Handle form submission
  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Type de client</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(value) => {
                    field.onChange(value);
                    handleClientTypeChange(value);
                  }}
                  defaultValue={field.value}
                  className="flex space-x-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="individual" />
                    </FormControl>
                    <FormLabel className="font-normal">Particulier</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="company" />
                    </FormControl>
                    <FormLabel className="font-normal">Entreprise</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {clientType === "company" && (
          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom de l'entreprise*</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Nom de l'entreprise" value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prénom{clientType === "individual" ? "*" : ""}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Prénom" value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom{clientType === "individual" ? "*" : ""}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Nom" value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} type="email" placeholder="email@example.com" value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Téléphone</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Téléphone" value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adresse</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Adresse" value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="zipCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Code postal</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Code postal" value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-2">
                <FormLabel>Ville</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ville" value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {clientType === "company" && (
          <FormField
            control={form.control}
            name="siret"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SIRET</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Numéro SIRET" value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Notes supplémentaires" rows={3} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <LoadingSpinner className="mr-2" />
                Traitement...
              </>
            ) : defaultValues ? "Mettre à jour" : "Créer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
