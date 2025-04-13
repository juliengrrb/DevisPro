import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState, useEffect } from "react";

export interface QuoteNumberFormat {
  prefix: string;
  separator: string;
  dateFormat: string;
  numberLength: number;
  currentNumber: string;
  formattedNumber: string;
}

interface QuoteNumberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentNumber: string;
  onSave: (format: QuoteNumberFormat) => void;
}

export function QuoteNumberModal({
  open,
  onOpenChange,
  currentNumber,
  onSave,
}: QuoteNumberModalProps) {
  // Default values for the format
  const [prefix, setPrefix] = useState("DEVIS");
  const [separator, setSeparator] = useState("-");
  const [dateFormat, setDateFormat] = useState("year");
  const [numberLength, setNumberLength] = useState(3);
  const [number, setNumber] = useState("001");
  
  // Extract current values from the current number format on open
  useEffect(() => {
    if (open && currentNumber) {
      try {
        // Try to parse the current number format
        // This is a simple parsing logic and might need adjustments based on your format
        const parts = currentNumber.split(/[-_/]/);
        
        if (parts.length >= 2) {
          // If we have at least a prefix and a second part
          setPrefix(parts[0]);
          
          // Determine the separator
          const separatorMatch = currentNumber.match(/[-_/]/);
          if (separatorMatch) {
            setSeparator(separatorMatch[0]);
          }
          
          // Check if second part contains a year (4 digits)
          const yearMatch = parts[1].match(/\d{4}/);
          if (yearMatch) {
            setDateFormat("year");
            
            // If there's a third part, it should be the number
            if (parts.length >= 3) {
              setNumber(parts[2]);
              setNumberLength(parts[2].length);
            }
          } else {
            // If no year, the second part is likely the number
            setDateFormat("none");
            setNumber(parts[1]);
            setNumberLength(parts[1].length);
          }
        } else {
          // If only one part, use it as the number
          setPrefix("");
          setNumber(parts[0]);
          setNumberLength(parts[0].length);
        }
      } catch (e) {
        // If parsing fails, use default values
        console.error("Error parsing quote number", e);
      }
    }
  }, [open, currentNumber]);
  
  // Generate the formatted number based on the current settings
  const getFormattedNumber = (): string => {
    let result = "";
    
    // Add prefix if provided
    if (prefix) {
      result += prefix;
    }
    
    // Add separator if needed
    if (prefix && (dateFormat !== "none" || number)) {
      result += separator;
    }
    
    // Add date component
    if (dateFormat === "year") {
      result += new Date().getFullYear();
    } else if (dateFormat === "yearMonth") {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      result += `${year}${month}`;
    }
    
    // Add separator between date and number if both exist
    if (dateFormat !== "none" && number) {
      result += separator;
    }
    
    // Add the number with the correct padding
    if (number) {
      const numericValue = parseInt(number, 10);
      if (!isNaN(numericValue)) {
        result += String(numericValue).padStart(numberLength, "0");
      } else {
        result += number;
      }
    }
    
    return result;
  };
  
  // Format when saving
  const handleSave = () => {
    const formattedNumber = getFormattedNumber();
    onSave({
      prefix,
      separator,
      dateFormat,
      numberLength,
      currentNumber: number,
      formattedNumber,
    });
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Format du numéro de devis</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="prefix">Préfixe</Label>
            <Input
              id="prefix"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              placeholder="Ex: DEVIS, DEV, etc."
            />
          </div>
          
          <div className="grid gap-2">
            <Label>Séparateur</Label>
            <RadioGroup
              value={separator}
              onValueChange={setSeparator}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="-" id="separator-dash" />
                <Label htmlFor="separator-dash">-</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="/" id="separator-slash" />
                <Label htmlFor="separator-slash">/</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="" id="separator-none" />
                <Label htmlFor="separator-none">Aucun</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="grid gap-2">
            <Label>Format de la date</Label>
            <RadioGroup
              value={dateFormat}
              onValueChange={setDateFormat}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="year" id="date-year" />
                <Label htmlFor="date-year">Année</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yearMonth" id="date-year-month" />
                <Label htmlFor="date-year-month">Année + Mois</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="date-none" />
                <Label htmlFor="date-none">Aucun</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="grid gap-2">
            <Label>Longueur de numérotation</Label>
            <RadioGroup
              value={numberLength.toString()}
              onValueChange={(value) => setNumberLength(parseInt(value, 10))}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3" id="length-3" />
                <Label htmlFor="length-3">3</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="4" id="length-4" />
                <Label htmlFor="length-4">4</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="5" id="length-5" />
                <Label htmlFor="length-5">5</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="6" id="length-6" />
                <Label htmlFor="length-6">6</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="number">Numéro courant</Label>
            <Input
              id="number"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              type="number"
            />
          </div>
          
          <div className="mt-2 p-4 bg-slate-50 rounded-md">
            <Label>Aperçu</Label>
            <p className="text-lg font-semibold">{getFormattedNumber()}</p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave}>
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}