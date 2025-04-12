import { useState } from "react";
import { QuoteItem } from "@shared/schema";
import { formatCurrency, calculateItemTotal, calculateSubtotal, calculateTotalTax, calculateTotal } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Trash2 } from "lucide-react";

interface QuoteItemsListProps {
  items: QuoteItem[];
  onChange: (items: QuoteItem[]) => void;
}

const QuoteItemsList: React.FC<QuoteItemsListProps> = ({ items, onChange }) => {
  const addItem = () => {
    onChange([
      ...items,
      { description: "", quantity: 1, unit_price: 0, tax_rate: 20 }
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = [...items];
      newItems.splice(index, 1);
      onChange(newItems);
    }
  };

  const updateItem = (index: number, field: keyof QuoteItem, value: string | number) => {
    const newItems = [...items];
    
    // Convert string to number for numeric fields
    if (field === 'quantity' || field === 'unit_price' || field === 'tax_rate') {
      newItems[index][field] = Number(value);
    } else {
      newItems[index][field] = value as string;
    }
    
    onChange(newItems);
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Quantité</TableHead>
              <TableHead>Prix unitaire</TableHead>
              <TableHead>TVA (%)</TableHead>
              <TableHead>Total HT</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    placeholder="Description de l'article ou du service"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">€</span>
                    </div>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      className="pl-7"
                      value={item.unit_price}
                      onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <Select
                    value={item.tax_rate.toString()}
                    onValueChange={(value) => updateItem(index, 'tax_rate', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Taux de TVA" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0 %</SelectItem>
                      <SelectItem value="5.5">5.5 %</SelectItem>
                      <SelectItem value="10">10 %</SelectItem>
                      <SelectItem value="20">20 %</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {formatCurrency(calculateItemTotal(item))}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="mt-4">
        <Button variant="outline" onClick={addItem}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Ajouter un article
        </Button>
      </div>
      
      <div className="mt-8 bg-gray-50 p-4 rounded-md">
        <div className="flex justify-end">
          <dl className="space-y-2 text-sm text-gray-500">
            <div className="flex justify-between">
              <dt>Sous-total HT</dt>
              <dd className="text-gray-900">{formatCurrency(calculateSubtotal(items))}</dd>
            </div>
            <div className="flex justify-between">
              <dt>TVA</dt>
              <dd className="text-gray-900">{formatCurrency(calculateTotalTax(items))}</dd>
            </div>
            <div className="border-t border-gray-200 pt-2 flex justify-between">
              <dt className="font-medium text-black">Total TTC</dt>
              <dd className="font-bold text-primary-600">{formatCurrency(calculateTotal(items))}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default QuoteItemsList;
