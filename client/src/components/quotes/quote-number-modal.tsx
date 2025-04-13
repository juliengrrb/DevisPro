import { useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";

interface QuoteNumberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentNumber: string;
  onSave: (data: QuoteNumberFormat) => void;
}

export interface QuoteNumberFormat {
  prefix: string;
  separator: "-" | "/" | "";
  dateFormat: "year" | "year-month";
  sequenceLength: 3 | 4 | 5 | 6;
  sequenceNumber: number;
  formattedNumber: string;
}

export function QuoteNumberModal({
  open,
  onOpenChange,
  currentNumber,
  onSave,
}: QuoteNumberModalProps) {
  // Parse the current number to initialize the form
  const parseQuoteNumber = (num: string): QuoteNumberFormat => {
    // Default values
    const result: QuoteNumberFormat = {
      prefix: "DEV",
      separator: "-",
      dateFormat: "year-month",
      sequenceLength: 5,
      sequenceNumber: 1,
      formattedNumber: "",
    };

    try {
      // Try to parse based on common patterns: PREFIX-YYYYMM-XXXXX or PREFIX/YYYYMM/XXXXX
      // Example: DEV-202504-00001 or DEV/202504/00001
      let separator = "-";
      if (num.includes("/")) separator = "/";
      if (!num.includes("-") && !num.includes("/")) separator = "";

      const parts = separator ? num.split(separator) : [num];
      
      if (parts.length >= 1) {
        result.prefix = parts[0];
      }
      
      // Determine date format
      if (parts.length >= 2) {
        const datePart = parts[1];
        if (datePart.length === 6) { // YYYYMM format
          result.dateFormat = "year-month";
        } else if (datePart.length === 4) { // YYYY format
          result.dateFormat = "year";
        }
      }
      
      // Get sequence number
      if (parts.length >= 3) {
        const sequencePart = parts[2];
        result.sequenceLength = sequencePart.length as 3 | 4 | 5 | 6;
        result.sequenceNumber = parseInt(sequencePart);
      }
      
      result.separator = separator as "-" | "/" | "";
    } catch (error) {
      console.error("Error parsing quote number", error);
    }
    
    return result;
  };

  // Generate formatted number based on settings
  const generateFormattedNumber = (data: Omit<QuoteNumberFormat, "formattedNumber">): string => {
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    
    const datePart = data.dateFormat === "year-month" ? `${year}${month}` : year;
    const sequencePart = data.sequenceNumber.toString().padStart(data.sequenceLength, "0");
    
    if (data.separator) {
      return `${data.prefix}${data.separator}${datePart}${data.separator}${sequencePart}`;
    } else {
      return `${data.prefix}${datePart}${sequencePart}`;
    }
  };

  const initialData = parseQuoteNumber(currentNumber);
  
  // Zod schema for form validation
  const formSchema = z.object({
    prefix: z.string(),
    separator: z.enum(["-", "/", ""]),
    dateFormat: z.enum(["year", "year-month"]),
    sequenceLength: z.union([
      z.literal(3),
      z.literal(4),
      z.literal(5),
      z.literal(6),
    ]),
    sequenceNumber: z.coerce.number().min(0),
  });

  // Initialize form with quote data
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prefix: initialData.prefix,
      separator: initialData.separator,
      dateFormat: initialData.dateFormat,
      sequenceLength: initialData.sequenceLength,
      sequenceNumber: initialData.sequenceNumber,
    },
  });

  // Preview the formatted number
  const [previewNumber, setPreviewNumber] = useState(currentNumber);

  // Update preview when form values change
  useEffect(() => {
    const formValues = form.getValues();
    const formatted = generateFormattedNumber(formValues);
    setPreviewNumber(formatted);
  }, [form.watch()]);

  // Handle form submission
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const formattedNumber = generateFormattedNumber(values);
    onSave({
      ...values,
      formattedNumber,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Format du numéro de devis</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="prefix"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Préfixe</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="separator"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Séparateur</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex items-center space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="-" />
                        </FormControl>
                        <FormLabel className="cursor-pointer">-</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="/" />
                        </FormControl>
                        <FormLabel className="cursor-pointer">/</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="" />
                        </FormControl>
                        <FormLabel className="cursor-pointer">Aucun</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateFormat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Format de la date</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex items-center space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="year" />
                        </FormControl>
                        <FormLabel className="cursor-pointer">Année</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="year-month" />
                        </FormControl>
                        <FormLabel className="cursor-pointer">Année + Mois</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sequenceLength"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Longueur de numérotation</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => field.onChange(parseInt(value) as 3 | 4 | 5 | 6)}
                      defaultValue={field.value.toString()}
                      className="flex items-center space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="3" />
                        </FormControl>
                        <FormLabel className="cursor-pointer">3</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="4" />
                        </FormControl>
                        <FormLabel className="cursor-pointer">4</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="5" />
                        </FormControl>
                        <FormLabel className="cursor-pointer">5</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="6" />
                        </FormControl>
                        <FormLabel className="cursor-pointer">6</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sequenceNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numéro courant</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="p-4 bg-slate-50 rounded-md">
              <h3 className="text-lg font-semibold mb-2">Aperçu</h3>
              <p className="text-xl">{previewNumber}</p>
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