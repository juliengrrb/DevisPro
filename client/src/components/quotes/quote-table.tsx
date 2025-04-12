import { useState } from "react";
import { CircleDot, GripVertical, Plus, Settings, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatPrice } from "@/lib/utils";

interface LineItem {
  type: string;
  title: string | null;
  description: string | null;
  quantity: string | number | null;
  unit: string | null;
  unitPrice: string | number | null;
  vatRate: string | number | null;
  totalHT: string | number | null;
  position: number;
  level?: number | string;
  subtotal?: string | number;
  details?: string[];
}

interface QuoteTableProps {
  lineItems: LineItem[];
  onChange: (lineItems: LineItem[]) => void;
}

export function QuoteTable({ lineItems, onChange }: QuoteTableProps) {
  const [draggedItem, setDraggedItem] = useState<LineItem | null>(null);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [currentItemIndex, setCurrentItemIndex] = useState<number | null>(null);
  const [newDetailText, setNewDetailText] = useState("");

  // Get the next position number
  const getNextPosition = (): number => {
    if (lineItems.length === 0) return 1;
    return Math.max(...lineItems.map(item => item.position)) + 1;
  };

  // Format the item number based on its level
  const formatItemNumber = (item: LineItem, index: number): string => {
    if (typeof item.level === 'number') {
      if (item.level === 0) return `${index + 1}`;
      if (item.level === 1) return `${Math.floor(index / 10) + 1}.${(index % 10) + 1}`;
      if (item.level === 2) return `${Math.floor(index / 100) + 1}.${Math.floor((index % 100) / 10) + 1}.${(index % 10) + 1}`;
    }
    
    return `${index + 1}`;
  };

  // Add line item
  const addLineItem = (type: string) => {
    const newPosition = getNextPosition();
    const level = type === "title" ? 0 : type === "subtitle" ? 1 : 2;
    
    const newItem: LineItem = {
      type,
      title: "",
      description: null,
      quantity: type === "title" || type === "subtitle" || type === "text" ? null : "1",
      unit: type === "title" || type === "subtitle" || type === "text" ? null : "u",
      unitPrice: type === "title" || type === "subtitle" || type === "text" ? null : "0",
      vatRate: type === "title" || type === "subtitle" || type === "text" ? null : "20",
      totalHT: type === "title" || type === "subtitle" || type === "text" ? null : "0",
      position: newPosition,
      level,
    };
    
    const updatedItems = [...lineItems, newItem];
    recalculateSubtotals(updatedItems);
    onChange(updatedItems);
  };

  // Remove line item
  const removeLineItem = (index: number) => {
    const updatedItems = lineItems.filter((_, i) => i !== index);
    recalculateSubtotals(updatedItems);
    onChange(updatedItems);
  };

  // Update line item
  const updateLineItem = (index: number, field: string, value: string | number) => {
    const updatedItems = [...lineItems];
    const item = { ...updatedItems[index] };
    
    // Update the field
    (item as any)[field] = value;
    
    // Calculate total if needed
    if (field === "quantity" || field === "unitPrice") {
      const quantity = parseFloat(item.quantity as string) || 0;
      const unitPrice = parseFloat(item.unitPrice as string) || 0;
      item.totalHT = (quantity * unitPrice).toFixed(2);
    }
    
    updatedItems[index] = item;
    
    // Recalculate subtotals
    recalculateSubtotals(updatedItems);
    
    onChange(updatedItems);
  };

  // Add technical detail to item
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

  // Remove technical detail from item
  const removeTechnicalDetail = (itemIndex: number, detailIndex: number) => {
    const updatedItems = [...lineItems];
    const item = { ...updatedItems[itemIndex] };
    
    if (item.details) {
      item.details = item.details.filter((_, i) => i !== detailIndex);
    }
    
    updatedItems[itemIndex] = item;
    
    onChange(updatedItems);
  };

  // Recalculate subtotals for titles
  const recalculateSubtotals = (items: LineItem[]) => {
    // Initialize all subtotals to 0
    items.forEach(item => {
      if (item.type === "title" || item.type === "subtitle") {
        item.subtotal = "0";
      }
    });
    
    // Calculate subtotals
    items.forEach(item => {
      if (item.type !== "title" && item.type !== "subtitle" && item.totalHT) {
        // Find the parent title
        const titleIndex = findParentTitleIndex(items, item);
        if (titleIndex !== -1) {
          const titleItem = items[titleIndex];
          const currentSubtotal = parseFloat(titleItem.subtotal as string) || 0;
          const itemTotal = parseFloat(item.totalHT as string) || 0;
          titleItem.subtotal = (currentSubtotal + itemTotal).toFixed(2);
        }
        
        // Also update parent subtitle if exists
        const subtitleIndex = findParentSubtitleIndex(items, item);
        if (subtitleIndex !== -1) {
          const subtitleItem = items[subtitleIndex];
          const currentSubtotal = parseFloat(subtitleItem.subtotal as string) || 0;
          const itemTotal = parseFloat(item.totalHT as string) || 0;
          subtitleItem.subtotal = (currentSubtotal + itemTotal).toFixed(2);
        }
      }
    });
  };

  // Find parent title index
  const findParentTitleIndex = (items: LineItem[], item: LineItem): number => {
    // Loop backward from item position
    for (let i = items.indexOf(item) - 1; i >= 0; i--) {
      if (items[i].type === "title") {
        return i;
      }
    }
    return -1;
  };

  // Find parent subtitle index
  const findParentSubtitleIndex = (items: LineItem[], item: LineItem): number => {
    // Loop backward from item position
    for (let i = items.indexOf(item) - 1; i >= 0; i--) {
      if (items[i].type === "subtitle") {
        return i;
      }
      if (items[i].type === "title") {
        // Stop if we reach a title before finding a subtitle
        return -1;
      }
    }
    return -1;
  };

  // Handle drag operations
  const handleDragStart = (item: LineItem) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetItem: LineItem) => {
    if (!draggedItem) return;
    
    const updatedItems = [...lineItems];
    const sourceIndex = updatedItems.findIndex(item => item === draggedItem);
    const targetIndex = updatedItems.findIndex(item => item === targetItem);
    
    // Swap the positions
    const draggedItemPosition = draggedItem.position;
    updatedItems[sourceIndex].position = targetItem.position;
    updatedItems[targetIndex].position = draggedItemPosition;
    
    // Sort by position
    updatedItems.sort((a, b) => a.position - b.position);
    
    // Recalculate subtotals
    recalculateSubtotals(updatedItems);
    
    setDraggedItem(null);
    onChange(updatedItems);
  };

  return (
    <div className="space-y-4">
      <table className="w-full border-collapse">
        <thead className="bg-blue-600 text-white">
          <tr>
            <th className="py-2 px-3 text-left w-12">N°</th>
            <th className="py-2 px-3 text-left">Désignation</th>
            <th className="py-2 px-3 text-center w-16">Qté</th>
            <th className="py-2 px-3 text-center w-16">Unité</th>
            <th className="py-2 px-3 text-center w-24">Prix U. HT</th>
            <th className="py-2 px-3 text-center w-16">TVA</th>
            <th className="py-2 px-3 text-right w-24">Total HT</th>
            <th className="py-2 px-3 w-10"></th>
          </tr>
        </thead>
        <tbody>
          {lineItems.length === 0 ? (
            <tr>
              <td colSpan={8} className="h-24 text-center text-gray-500">
                Aucun élément. Ajoutez votre premier élément ci-dessous.
              </td>
            </tr>
          ) : (
            lineItems.map((item, index) => {
              const isTitle = item.type === "title";
              const isSubtitle = item.type === "subtitle";
              const itemNumber = formatItemNumber(item, index);
              
              return (
                <tr
                  key={index}
                  draggable
                  onDragStart={() => handleDragStart(item)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(item)}
                  className={`${draggedItem === item ? "opacity-50" : ""} 
                    ${isTitle ? "bg-blue-100" : isSubtitle ? "bg-blue-50" : ""}`}
                >
                  <td className="py-2 px-3 font-mono border border-slate-200">
                    <div className="flex items-center gap-1">
                      <GripVertical className="h-4 w-4 text-slate-400 cursor-move" />
                      {itemNumber}
                    </div>
                  </td>
                  <td className="py-2 px-3 border border-slate-200">
                    {isTitle || isSubtitle ? (
                      <span className={`font-medium ${isTitle ? "text-blue-700" : ""}`}>
                        {item.title || ""}
                      </span>
                    ) : item.type === "text" ? (
                      item.description || ""
                    ) : (
                      <div>
                        <div className="font-medium">{item.title || ""}</div>
                        {item.description && (
                          <div className="text-sm text-slate-600 mt-1">{item.description}</div>
                        )}
                        {(item.type === "material" || item.type === "work") && item.details && item.details.length > 0 && (
                          <div className="text-xs text-slate-600 mt-1">
                            {item.details.map((detail, detailIndex) => (
                              <div key={detailIndex} className="flex items-start pl-3 py-0.5">
                                <span className="mr-1 inline-block">-</span> 
                                <span className="inline-block">{detail}</span>
                              </div>
                            ))}
                            <button 
                              className="text-xs text-blue-500 flex items-center gap-1 mt-1"
                              onClick={() => {
                                setCurrentItemIndex(index);
                                setIsConfigDialogOpen(true);
                                setNewDetailText("");
                              }}
                            >
                              <Settings className="h-3 w-3" />
                              Configurer les éléments de l'ouvrage
                            </button>
                          </div>
                        )}
                        {(item.type === "material" || item.type === "work") && (!item.details || item.details.length === 0) && (
                          <div className="text-xs text-slate-600 mt-1">
                            <button 
                              className="text-xs text-blue-500 flex items-center gap-1"
                              onClick={() => {
                                setCurrentItemIndex(index);
                                setIsConfigDialogOpen(true);
                                setNewDetailText("");
                              }}
                            >
                              <Settings className="h-3 w-3" />
                              Ajouter des éléments à l'ouvrage
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="py-2 px-3 text-center border border-slate-200">
                    {(item.type === "material" || item.type === "labor" || item.type === "work") && (
                      <Input 
                        type="number"
                        step="0.01"
                        value={item.quantity?.toString() || ""}
                        onChange={(e) => updateLineItem(index, "quantity", e.target.value)}
                        className="h-8 w-16 text-center border-gray-300"
                      />
                    )}
                  </td>
                  <td className="py-2 px-3 text-center border border-slate-200">
                    {(item.type === "material" || item.type === "labor" || item.type === "work") && (
                      <div className="relative">
                        <Select
                          value={item.unit?.toString() || ""}
                          onValueChange={(value) => updateLineItem(index, "unit", value)}
                        >
                          <SelectTrigger className="h-8 w-16 border-gray-300">
                            <SelectValue placeholder="u" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="u">u</SelectItem>
                            <SelectItem value="m²">m²</SelectItem>
                            <SelectItem value="m">m</SelectItem>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="h">h</SelectItem>
                            <SelectItem value="j">j</SelectItem>
                            <SelectItem value="forfait">forfait</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </td>
                  <td className="py-2 px-3 text-center border border-slate-200">
                    {(item.type === "material" || item.type === "labor" || item.type === "work") && (
                      <div className="flex items-center justify-center">
                        <Input 
                          type="number"
                          step="0.01"
                          value={item.unitPrice?.toString() || ""}
                          onChange={(e) => updateLineItem(index, "unitPrice", e.target.value)}
                          className="h-8 w-20 text-right border-gray-300"
                        />
                        <span className="ml-1">€</span>
                      </div>
                    )}
                  </td>
                  <td className="py-2 px-3 text-center border border-slate-200">
                    {(item.type === "material" || item.type === "labor" || item.type === "work") && (
                      <div className="relative">
                        <Select
                          value={item.vatRate?.toString() || ""}
                          onValueChange={(value) => updateLineItem(index, "vatRate", value)}
                        >
                          <SelectTrigger className="h-8 w-16 border-gray-300">
                            <SelectValue placeholder="20 %" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">0 %</SelectItem>
                            <SelectItem value="5.5">5,5 %</SelectItem>
                            <SelectItem value="10">10 %</SelectItem>
                            <SelectItem value="20">20 %</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </td>
                  <td className="py-2 px-3 text-right font-medium border border-slate-200">
                    {isTitle || isSubtitle ? (
                      <span className="text-blue-600">Sous-total : {formatPrice(item.subtotal || 0)}</span>
                    ) : (item.type === "material" || item.type === "labor" || item.type === "work") ? (
                      formatPrice(item.totalHT || 0)
                    ) : null}
                  </td>
                  <td className="py-2 px-3 border border-slate-200">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLineItem(index)}
                      className="h-7 w-7 p-0"
                    >
                      <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                    </Button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      <div className="flex flex-wrap gap-2 mt-3">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => addLineItem("material")}
          className="flex items-center text-xs h-8 px-3 py-1 border-gray-300"
        >
          <Plus className="h-3 w-3 mr-1" />
          Fourniture
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => addLineItem("labor")}
          className="flex items-center text-xs h-8 px-3 py-1 border-gray-300"
        >
          <Plus className="h-3 w-3 mr-1" />
          Main d'œuvre
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => addLineItem("work")}
          className="flex items-center text-xs h-8 px-3 py-1 border-gray-300"
        >
          <Plus className="h-3 w-3 mr-1" />
          Ouvrage
        </Button>
        <div className="flex-1"></div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => addLineItem("title")}
          className="flex items-center text-xs h-8"
        >
          Titre
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => addLineItem("subtitle")}
          className="flex items-center text-xs h-8"
        >
          Sous-titre
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => addLineItem("text")}
          className="flex items-center text-xs h-8"
        >
          Texte
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center text-xs h-8"
        >
          Saut de page
        </Button>
      </div>

      {/* Configuration Dialog */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Configurer les éléments de l'ouvrage</DialogTitle>
            <DialogDescription>
              Ajoutez les détails techniques pour cet élément
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {currentItemIndex !== null && lineItems[currentItemIndex]?.details?.length ? (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Détails existants</h4>
                <div className="border rounded-md p-3 space-y-2">
                  {lineItems[currentItemIndex].details?.map((detail, detailIndex) => (
                    <div key={detailIndex} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CircleDot className="h-3 w-3 mr-2 text-slate-400" />
                        <span>{detail}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => currentItemIndex !== null && removeTechnicalDetail(currentItemIndex, detailIndex)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-sm text-slate-500 py-2">
                Aucun détail technique. Ajoutez votre premier détail ci-dessous.
              </div>
            )}
            
            <div className="flex space-x-2">
              <Input
                placeholder="Ajoutez un détail technique..."
                value={newDetailText}
                onChange={(e) => setNewDetailText(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={() => {
                  if (newDetailText.trim() && currentItemIndex !== null) {
                    addTechnicalDetail(currentItemIndex, newDetailText.trim());
                    setNewDetailText("");
                  }
                }}
                disabled={!newDetailText.trim()}
              >
                Ajouter
              </Button>
            </div>
            
            <div className="bg-slate-50 text-slate-700 rounded-md p-3 text-sm">
              <p>Exemples de détails techniques :</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>BA13 standard sur ossature métallique x 1 (m²)</li>
                <li>Rail R90 et double montant M48 x 1 (m²)</li>
                <li>Isolation GR80 x 1 (m²)</li>
              </ul>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-end">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Fermer
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}