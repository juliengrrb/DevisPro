import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QuoteLineItems } from "@/components/quotes/quote-line-items";

interface LineItemsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lineItems: any[];
  onSave: (lineItems: any[]) => void;
}

export function LineItemsModal({
  open,
  onOpenChange,
  lineItems,
  onSave,
}: LineItemsModalProps) {
  const [items, setItems] = useState([...lineItems]);

  // Handle change in line items
  const handleItemsChange = (updatedItems: any[]) => {
    setItems(updatedItems);
  };

  // Submit changes
  const handleSave = () => {
    onSave(items);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Modifier les éléments du devis</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <QuoteLineItems 
            lineItems={items} 
            onChange={handleItemsChange} 
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button type="button" onClick={handleSave}>
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}