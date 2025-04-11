import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function Settings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("company");

  // Fetch user profile
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["/api/users/1"], // For demo, we use user with ID 1
  });

  // Company information schema
  const companySchema = z.object({
    companyName: z.string().min(1, "Le nom de l'entreprise est requis"),
    email: z.string().email("Email invalide").optional().nullable(),
    phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    website: z.string().url("URL invalide").optional().nullable().or(z.literal('')),
    siret: z.string().optional().nullable(),
    rcs: z.string().optional().nullable(),
    naf: z.string().optional().nullable(),
    vatNumber: z.string().optional().nullable(),
    capitalSocial: z.string().optional().nullable(),
    primaryColor: z.string().optional().nullable(),
  });

  // Legal information schema
  const legalSchema = z.object({
    decennaleInsurance: z.string().optional().nullable(),
    biennaleInsurance: z.string().optional().nullable(),
    legalMentions: z.string().optional().nullable(),
  });

  // Company form
  const companyForm = useForm<z.infer<typeof companySchema>>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      companyName: profile?.companyName || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
      address: profile?.address || "",
      website: profile?.website || "",
      siret: profile?.siret || "",
      rcs: profile?.rcs || "",
      naf: profile?.naf || "",
      vatNumber: profile?.vatNumber || "",
      capitalSocial: profile?.capitalSocial || "",
      primaryColor: profile?.primaryColor || "hsl(172, 80%, 29%)",
    },
  });

  // Legal form
  const legalForm = useForm<z.infer<typeof legalSchema>>({
    resolver: zodResolver(legalSchema),
    defaultValues: {
      decennaleInsurance: profile?.decennaleInsurance || "",
      biennaleInsurance: profile?.biennaleInsurance || "",
      legalMentions: profile?.legalMentions || "",
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PUT", "/api/users/1", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/1"] });
      toast({
        title: "Paramètres mis à jour",
        description: "Vos paramètres ont été mis à jour avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la mise à jour des paramètres: ${error}`,
        variant: "destructive",
      });
    }
  });

  // Update company information
  const onCompanySubmit = (data: z.infer<typeof companySchema>) => {
    updateProfileMutation.mutate(data);
  };

  // Update legal information
  const onLegalSubmit = (data: z.infer<typeof legalSchema>) => {
    updateProfileMutation.mutate(data);
  };

  // Update forms when profile data is loaded
  React.useEffect(() => {
    if (profile) {
      companyForm.reset({
        companyName: profile.companyName || "",
        email: profile.email || "",
        phone: profile.phone || "",
        address: profile.address || "",
        website: profile.website || "",
        siret: profile.siret || "",
        rcs: profile.rcs || "",
        naf: profile.naf || "",
        vatNumber: profile.vatNumber || "",
        capitalSocial: profile.capitalSocial || "",
        primaryColor: profile.primaryColor || "hsl(172, 80%, 29%)",
      });

      legalForm.reset({
        decennaleInsurance: profile.decennaleInsurance || "",
        biennaleInsurance: profile.biennaleInsurance || "",
        legalMentions: profile.legalMentions || "",
      });
    }
  }, [profile]);

  if (isLoadingProfile) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8 mt-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Paramètres</h1>
            <p className="mt-1 text-sm text-slate-600">
              Personnalisez les informations de votre entreprise
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="company">Entreprise</TabsTrigger>
          <TabsTrigger value="legal">Mentions légales</TabsTrigger>
          <TabsTrigger value="display">Affichage</TabsTrigger>
        </TabsList>
        
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Informations de l'entreprise</CardTitle>
              <CardDescription>
                Ces informations apparaîtront sur vos devis et factures.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...companyForm}>
                <form onSubmit={companyForm.handleSubmit(onCompanySubmit)} className="space-y-4">
                  <FormField
                    control={companyForm.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom de l'entreprise*</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nom de l'entreprise" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={companyForm.control}
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
                      control={companyForm.control}
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
                    control={companyForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adresse</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Adresse complète" rows={3} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={companyForm.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Site internet</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://www.example.com" value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={companyForm.control}
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

                    <FormField
                      control={companyForm.control}
                      name="rcs"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>RCS</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="RCS" value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={companyForm.control}
                      name="naf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Code NAF/APE</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Code NAF/APE" value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={companyForm.control}
                      name="vatNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Numéro de TVA</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="FR 12 345678901" value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={companyForm.control}
                    name="capitalSocial"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capital social</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="10 000 €" value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={updateProfileMutation.isPending || !companyForm.formState.isDirty}
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <LoadingSpinner className="mr-2" />
                          Enregistrement...
                        </>
                      ) : "Enregistrer"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="legal">
          <Card>
            <CardHeader>
              <CardTitle>Mentions légales</CardTitle>
              <CardDescription>
                Ces informations apparaîtront sur vos devis et factures.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...legalForm}>
                <form onSubmit={legalForm.handleSubmit(onLegalSubmit)} className="space-y-4">
                  <FormField
                    control={legalForm.control}
                    name="decennaleInsurance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assurance décennale</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: AXA Assurances n°1234567890" value={field.value || ""} />
                        </FormControl>
                        <FormDescription>
                          Information sur votre assurance décennale
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={legalForm.control}
                    name="biennaleInsurance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assurance biennale</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: AXA Assurances n°0987654321" value={field.value || ""} />
                        </FormControl>
                        <FormDescription>
                          Information sur votre assurance biennale
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={legalForm.control}
                    name="legalMentions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mentions légales</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Mentions légales à afficher sur vos documents" 
                            rows={5}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          Mentions légales obligatoires (TVA, etc.)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={updateProfileMutation.isPending || !legalForm.formState.isDirty}
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <LoadingSpinner className="mr-2" />
                          Enregistrement...
                        </>
                      ) : "Enregistrer"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="display">
          <Card>
            <CardHeader>
              <CardTitle>Personnalisation de l'affichage</CardTitle>
              <CardDescription>
                Personnalisez l'apparence de vos documents.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...companyForm}>
                <form onSubmit={companyForm.handleSubmit(onCompanySubmit)} className="space-y-4">
                  <FormField
                    control={companyForm.control}
                    name="primaryColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Couleur principale</FormLabel>
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-10 h-10 rounded-md border"
                            style={{ backgroundColor: field.value || "hsl(172, 80%, 29%)" }}
                          />
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline">Choisir une couleur</Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-3">
                              <HexColorPicker
                                color={field.value || "hsl(172, 80%, 29%)"}
                                onChange={field.onChange}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <FormDescription>
                          Cette couleur sera utilisée pour les éléments principaux de vos documents.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={updateProfileMutation.isPending || !companyForm.formState.isDirty}
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <LoadingSpinner className="mr-2" />
                          Enregistrement...
                        </>
                      ) : "Enregistrer"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
