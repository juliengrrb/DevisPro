import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  LayoutGrid,
  Hammer,
  PackageOpen,
  Type,
  ListOrdered,
  AlignLeft,
} from "lucide-react";
import { calculateLineItemTotal } from "@/lib/utils";

interface LineItem {
  id?: number;
  type: string;
  title: string | null;
  description: string | null;
  quantity: string | number | null;
  unit: string | null;
  unitPrice: string | number | null;
  vatRate: string | number | null;
  totalHT: string | number | null;
  position: number;
}

interface QuoteLineItemsProps {
  lineItems: LineItem[];
  onChange: (lineItems: LineItem[]) => void;
}

export function QuoteLineItems({ lineItems, onChange }: QuoteLineItemsProps) {
  const [draggedItem, setDraggedItem] = useState<LineItem | null>(null);

  // Get the next position number
  const getNextPosition = (): number => {
    if (lineItems.length === 0) return 1;
    return Math.max(...lineItems.map(item => item.position)) + 1;
  };

  // Add a new line item
  const addLineItem = (type: string) => {
    const newItem: LineItem = {
      type,
      title: type === "title" || type === "subtitle" ? "" : null,
      description: type === "text" ? "" : null,
      quantity: type === "material" || type === "labor" || type === "work" ? "1" : null,
      unit: type === "material" || type === "labor" || type === "work" ? "" : null,
      unitPrice: type === "material" || type === "labor" || type === "work" ? "0" : null,
      vatRate: type === "material" || type === "labor" || type === "work" ? "20" : null,
      totalHT: type === "material" || type === "labor" || type === "work" ? "0" : null,
      position: getNextPosition(),
    };
    
    const updatedItems = [...lineItems, newItem];
    onChange(updatedItems);
  };

  // Remove a line item
  const removeLineItem = (index: number) => {
    const updatedItems = [...lineItems];
    updatedItems.splice(index, 1);
    onChange(updatedItems);
  };

  // Update a line item
  const updateLineItem = (index: number, field: string, value: any) => {
    const updatedItems = [...lineItems];
    const item = { ...updatedItems[index], [field]: value };
    
    // Auto-calculate total if necessary
    if ((field === "quantity" || field === "unitPrice") && 
        (item.type === "material" || item.type === "labor" || item.type === "work")) {
      item.totalHT = calculateLineItemTotal(item.quantity, item.unitPrice).toString();
    }
    
    updatedItems[index] = item;
    onChange(updatedItems);
  };

  // Move a line item up or down
  const moveLineItem = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === lineItems.length - 1)
    ) {
      return;
    }

    const updatedItems = [...lineItems];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    
    // Swap positions
    const currentPosition = updatedItems[index].position;
    updatedItems[index].position = updatedItems[targetIndex].position;
    updatedItems[targetIndex].position = currentPosition;
    
    // Sort by position
    updatedItems.sort((a, b) => a.position - b.position);
    
    onChange(updatedItems);
  };

  // Drag and drop functionality
  const handleDragStart = (item: LineItem) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>) => {
    e.preventDefault();
  };

  const handleDrop = (targetItem: LineItem) => {
    if (!draggedItem || draggedItem === targetItem) {
      setDraggedItem(null);
      return;
    }

    const updatedItems = [...lineItems];
    const sourceIndex = updatedItems.findIndex(item => item.position === draggedItem.position);
    const targetIndex = updatedItems.findIndex(item => item.position === targetItem.position);
    
    // Swap positions
    updatedItems[sourceIndex].position = targetItem.position;
    updatedItems[targetIndex].position = draggedItem.position;
    
    // Sort by position
    updatedItems.sort((a, b) => a.position - b.position);
    
    setDraggedItem(null);
    onChange(updatedItems);
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead style={{ width: "40px" }}></TableHead>
            <TableHead style={{ width: "120px" }}>Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead style={{ width: "100px" }}>Quantité</TableHead>
            <TableHead style={{ width: "100px" }}>Unité</TableHead>
            <TableHead style={{ width: "120px" }}>Prix HT</TableHead>
            <TableHead style={{ width: "100px" }}>TVA (%)</TableHead>
            <TableHead style={{ width: "120px" }}>Total HT</TableHead>
            <TableHead style={{ width: "100px" }}>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lineItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                Aucun élément. Ajoutez votre premier élément ci-dessous.
              </TableCell>
            </TableRow>
          ) : (
            lineItems.map((item, index) => (
              <TableRow 
                key={index}
                draggable 
                onDragStart={() => handleDragStart(item)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(item)}
                className={draggedItem === item ? "opacity-50" : ""}
              >
                <TableCell className="text-center">
                  <LayoutGrid className="h-4 w-4 text-slate-400 cursor-move" />
                </TableCell>
                <TableCell>
                  <Select
                    value={item.type}
                    onValueChange={(value) => updateLineItem(index, "type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="title">
                        <div className="flex items-center">
                          <Type className="h-4 w-4 mr-2" />
                          <span>Titre</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="subtitle">
                        <div className="flex items-center">
                          <ListOrdered className="h-4 w-4 mr-2" />
                          <span>Sous-titre</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="text">
                        <div className="flex items-center">
                          <AlignLeft className="h-4 w-4 mr-2" />
                          <span>Texte</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="material">
                        <div className="flex items-center">
                          <PackageOpen className="h-4 w-4 mr-2" />
                          <span>Matériel</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="labor">
                        <div className="flex items-center">
                          <Hammer className="h-4 w-4 mr-2" />
                          <span>Main d'œuvre</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="work">
                        <div className="flex items-center">
                          <LayoutGrid className="h-4 w-4 mr-2" />
                          <span>Ouvrage</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  {item.type === "title" || item.type === "subtitle" ? (
                    <Input
                      value={item.title || ""}
                      onChange={(e) => updateLineItem(index, "title", e.target.value)}
                      placeholder={item.type === "title" ? "Titre" : "Sous-titre"}
                    />
                  ) : item.type === "text" ? (
                    <Textarea
                      value={item.description || ""}
                      onChange={(e) => updateLineItem(index, "description", e.target.value)}
                      placeholder="Texte libre"
                      rows={2}
                    />
                  ) : (
                    <div className="space-y-2">
                      <Input
                        value={item.title || ""}
                        onChange={(e) => updateLineItem(index, "title", e.target.value)}
                        placeholder="Titre"
                      />
                      <Textarea
                        value={item.description || ""}
                        onChange={(e) => updateLineItem(index, "description", e.target.value)}
                        placeholder="Description"
                        rows={2}
                      />
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {(item.type === "material" || item.type === "labor" || item.type === "work") && (
                    <Input
                      type="number"
                      value={item.quantity || ""}
                      onChange={(e) => updateLineItem(index, "quantity", e.target.value)}
                      placeholder="Qté"
                      min="0"
                      step="0.01"
                    />
                  )}
                </TableCell>
                <TableCell>
                  {(item.type === "material" || item.type === "labor" || item.type === "work") && (
                    <Input
                      value={item.unit || ""}
                      onChange={(e) => updateLineItem(index, "unit", e.target.value)}
                      placeholder="Unité"
                    />
                  )}
                </TableCell>
                <TableCell>
                  {(item.type === "material" || item.type === "labor" || item.type === "work") && (
                    <Input
                      type="number"
                      value={item.unitPrice || ""}
                      onChange={(e) => updateLineItem(index, "unitPrice", e.target.value)}
                      placeholder="Prix unitaire"
                      min="0"
                      step="0.01"
                    />
                  )}
                </TableCell>
                <TableCell>
                  {(item.type === "material" || item.type === "labor" || item.type === "work") && (
                    <Input
                      type="number"
                      value={item.vatRate || ""}
                      onChange={(e) => updateLineItem(index, "vatRate", e.target.value)}
                      placeholder="TVA %"
                      min="0"
                      max="100"
                    />
                  )}
                </TableCell>
                <TableCell>
                  {(item.type === "material" || item.type === "labor" || item.type === "work") && (
                    <Input
                      type="number"
                      value={item.totalHT || ""}
                      onChange={(e) => updateLineItem(index, "totalHT", e.target.value)}
                      placeholder="Total HT"
                      min="0"
                      step="0.01"
                      readOnly
                    />
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => moveLineItem(index, "up")}
                      disabled={index === 0}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => moveLineItem(index, "down")}
                      disabled={index === lineItems.length - 1}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLineItem(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => addLineItem("title")}
          className="flex items-center"
        >
          <Type className="h-3 w-3 mr-1" />
          Titre
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => addLineItem("subtitle")}
          className="flex items-center"
        >
          <ListOrdered className="h-3 w-3 mr-1" />
          Sous-titre
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => addLineItem("text")}
          className="flex items-center"
        >
          <AlignLeft className="h-3 w-3 mr-1" />
          Texte
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => addLineItem("material")}
          className="flex items-center"
        >
          <PackageOpen className="h-3 w-3 mr-1" />
          Matériel
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => addLineItem("labor")}
          className="flex items-center"
        >
          <Hammer className="h-3 w-3 mr-1" />
          Main d'œuvre
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => addLineItem("work")}
          className="flex items-center"
        >
          <LayoutGrid className="h-3 w-3 mr-1" />
          Ouvrage
        </Button>
      </div>
    </div>
  );
}
