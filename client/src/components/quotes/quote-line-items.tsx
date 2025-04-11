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
  ChevronDown,
  Trash2,
  GripVertical,
  Hammer,
  PackageOpen,
  Type,
  ListOrdered,
  AlignLeft,
  Settings,
  Plus,
  CircleDot,
} from "lucide-react";
import { calculateLineItemTotal, formatPrice } from "@/lib/utils";

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
  details?: string[]; // Pour les détails techniques (comme BA13, etc.)
  subtotal?: string | number | null; // Pour montrer des sous-totaux à chaque niveau
  level?: number; // Niveau hiérarchique (1, 1.1, 1.1.1)
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

  // Format the item number based on its level
  const formatItemNumber = (item: LineItem, index: number): string => {
    // Si c'est un item de niveau 1
    if (!item.level) return `${index + 1}`;
    
    // Pour les sous-niveaux
    if (typeof item.level === 'string') {
      return item.level;
    }
    
    // Trouver le parent
    const parentIndex = lineItems.findIndex(
      (parentItem) => parentItem.position < item.position && !parentItem.level
    );
    
    if (parentIndex >= 0) {
      const subIndex = index - parentIndex;
      return `${parentIndex + 1}.${subIndex}`;
    }
    
    return `${index + 1}`;
  };

  // Get the hierarchy level based on item type
  const getItemLevel = (item: LineItem): number => {
    switch (item.type) {
      case "title":
        return 0; // Premier niveau
      case "subtitle":
        return 1; // Sous-niveau
      default:
        return 2; // Élément standard
    }
  };

  // Add a new line item
  const addLineItem = (type: string) => {
    const newItem: LineItem = {
      type,
      title: type === "title" || type === "subtitle" ? "" : null,
      description: type === "text" ? "" : null,
      quantity: type === "material" || type === "labor" || type === "work" ? "1" : null,
      unit: type === "material" || type === "labor" || type === "work" ? "u" : null,
      unitPrice: type === "material" || type === "labor" || type === "work" ? "0" : null,
      vatRate: type === "material" || type === "labor" || type === "work" ? "20" : null,
      totalHT: type === "material" || type === "labor" || type === "work" ? "0" : null,
      position: getNextPosition(),
      details: type === "material" || type === "work" ? [] : undefined,
      level: type === "subtitle" ? 1 : (type === "title" ? undefined : 2),
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
    
    // Recalculate subtotals for all sections
    recalculateSubtotals(updatedItems);
    
    onChange(updatedItems);
  };

  // Recalculate subtotals for sections and subsections
  const recalculateSubtotals = (items: LineItem[]) => {
    // Structure pour suivre les totaux par section
    const sectionTotals: { [key: string]: number } = {};
    
    // Première passe: calculer les totaux pour chaque section
    items.forEach((item, index) => {
      if (item.type === "material" || item.type === "labor" || item.type === "work") {
        // Trouver à quelle section cet élément appartient
        let sectionIndex = -1;
        
        // Remonter pour trouver le titre parent
        for (let i = index - 1; i >= 0; i--) {
          if (items[i].type === "title") {
            sectionIndex = i;
            break;
          }
        }
        
        if (sectionIndex >= 0) {
          const sectionId = `section_${sectionIndex}`;
          sectionTotals[sectionId] = (sectionTotals[sectionId] || 0) + parseFloat(item.totalHT?.toString() || "0");
        }
      }
    });
    
    // Deuxième passe: assigner les sous-totaux
    items.forEach((item, index) => {
      if (item.type === "title") {
        const sectionId = `section_${index}`;
        item.subtotal = sectionTotals[sectionId] || 0;
      }
    });
  };

  // Add technical details to a line item
  const addTechnicalDetail = (index: number, detail: string) => {
    const updatedItems = [...lineItems];
    const item = { ...updatedItems[index] };
    
    if (!item.details) {
      item.details = [];
    }
    
    item.details.push(detail);
    updatedItems[index] = item;
    onChange(updatedItems);
  };

  // Remove technical detail from a line item
  const removeTechnicalDetail = (itemIndex: number, detailIndex: number) => {
    const updatedItems = [...lineItems];
    const item = { ...updatedItems[itemIndex] };
    
    if (item.details && item.details.length > detailIndex) {
      item.details.splice(detailIndex, 1);
      updatedItems[itemIndex] = item;
      onChange(updatedItems);
    }
  };

  // Handle drag and drop
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
    
    // Recalculate subtotals
    recalculateSubtotals(updatedItems);
    
    setDraggedItem(null);
    onChange(updatedItems);
  };

  return (
    <div className="space-y-4">
      <Table className="border border-slate-200 rounded-md overflow-hidden">
        <TableHeader className="bg-blue-600 text-white">
          <TableRow>
            <TableHead className="text-white font-medium w-12">N°</TableHead>
            <TableHead className="text-white font-medium">Désignation</TableHead>
            <TableHead className="text-white font-medium w-16 text-center">Qté</TableHead>
            <TableHead className="text-white font-medium w-16 text-center">Unité</TableHead>
            <TableHead className="text-white font-medium w-24 text-center">Prix U. HT</TableHead>
            <TableHead className="text-white font-medium w-16 text-center">TVA</TableHead>
            <TableHead className="text-white font-medium w-24 text-right">Total HT</TableHead>
            <TableHead className="text-white font-medium w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lineItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                Aucun élément. Ajoutez votre premier élément ci-dessous.
              </TableCell>
            </TableRow>
          ) : (
            lineItems.map((item, index) => {
              const isTitle = item.type === "title";
              const isSubtitle = item.type === "subtitle";
              const isItemWithDetails = item.details && item.details.length > 0;
              const itemNumber = formatItemNumber(item, index);
              
              return (
                <>
                  <TableRow 
                    key={index}
                    draggable 
                    onDragStart={() => handleDragStart(item)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(item)}
                    className={`${draggedItem === item ? "opacity-50" : ""} ${isTitle ? "bg-slate-100 font-medium" : ""}`}
                  >
                    <TableCell className="font-mono">
                      <div className="flex items-center">
                        <GripVertical className="h-4 w-4 text-slate-400 cursor-move mr-2" />
                        {itemNumber}
                      </div>
                    </TableCell>
                    <TableCell>
                      {isTitle || isSubtitle ? (
                        item.title || ""
                      ) : item.type === "text" ? (
                        item.description || ""
                      ) : (
                        <div>
                          {item.title || ""}
                          {item.description && (
                            <div className="text-sm text-slate-500 mt-1">{item.description}</div>
                          )}
                          {isItemWithDetails && (
                            <div className="text-xs text-slate-500 mt-1 pl-4">
                              {item.details?.map((detail, detailIndex) => (
                                <div key={detailIndex} className="flex items-center">
                                  <CircleDot className="h-2 w-2 mr-1" /> {detail}
                                </div>
                              ))}
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="mt-1 text-xs h-6 px-2 py-0"
                                onClick={() => addTechnicalDetail(index, "Nouveau détail technique")}
                              >
                                <Settings className="h-3 w-3 mr-1" />
                                Configurer les éléments de l'ouvrage
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {(item.type === "material" || item.type === "labor" || item.type === "work") && (
                        item.quantity || ""
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {(item.type === "material" || item.type === "labor" || item.type === "work") && (
                        item.unit || ""
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {(item.type === "material" || item.type === "labor" || item.type === "work") && (
                        formatPrice(item.unitPrice || 0)
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {(item.type === "material" || item.type === "labor" || item.type === "work") && (
                        `${item.vatRate} %`
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {isTitle && item.subtotal ? (
                        <>Sous-total : {formatPrice(item.subtotal)}</>
                      ) : (item.type === "material" || item.type === "labor" || item.type === "work") ? (
                        formatPrice(item.totalHT || 0)
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLineItem(index)}
                        className="h-7 w-7"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                </>
              );
            })
          )}
        </TableBody>
      </Table>

      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => addLineItem("material")}
          className="flex items-center"
        >
          <Plus className="h-3 w-3 mr-1" />
          Fourniture
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => addLineItem("labor")}
          className="flex items-center"
        >
          <Plus className="h-3 w-3 mr-1" />
          Main d'œuvre
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => addLineItem("work")}
          className="flex items-center"
        >
          <Plus className="h-3 w-3 mr-1" />
          Ouvrage
        </Button>
        <div className="flex-1"></div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => addLineItem("title")}
          className="flex items-center"
        >
          Titre
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => addLineItem("subtitle")}
          className="flex items-center"
        >
          Sous-titre
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => addLineItem("text")}
          className="flex items-center"
        >
          Texte
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center"
        >
          Saut de page
        </Button>
      </div>
    </div>
  );
}
