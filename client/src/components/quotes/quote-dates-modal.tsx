import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { formatDate } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusIcon } from "lucide-react";

interface QuoteDatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  issueDate: string;
  validUntil?: string;
  onSave: (issueDate: string, validUntil: string) => void;
}

export function QuoteDatesModal({
  open,
  onOpenChange,
  issueDate,
  validUntil,
  onSave
}: QuoteDatesModalProps) {
  const [selectedIssueDate, setSelectedIssueDate] = useState(issueDate);
  const [selectedValidUntil, setSelectedValidUntil] = useState(validUntil || '');
  const [validityDuration, setValidityDuration] = useState('');
  const [showDurationMenu, setShowDurationMenu] = useState(false);

  const handleSelectDuration = (days: number) => {
    const date = new Date(selectedIssueDate);
    date.setDate(date.getDate() + days);
    
    // Format the date as YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    setSelectedValidUntil(`${year}-${month}-${day}`);
    setShowDurationMenu(false);
  };

  const handleSave = () => {
    onSave(selectedIssueDate, selectedValidUntil);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifier les dates du devis</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="issueDate" className="text-right whitespace-nowrap">
              Date d'émission
            </Label>
            <Input
              id="issueDate"
              type="date"
              value={selectedIssueDate}
              onChange={(e) => setSelectedIssueDate(e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="validUntil" className="text-right whitespace-nowrap">
              Valable jusqu'au
            </Label>
            <div className="col-span-3 relative">
              <Input
                id="validUntil"
                type="date"
                value={selectedValidUntil}
                onChange={(e) => setSelectedValidUntil(e.target.value)}
                className="w-full"
              />
              <div className="absolute top-0 right-[-35px] h-full flex items-center">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setShowDurationMenu(!showDurationMenu)}
                >
                  <span className="sr-only">Choisir une durée</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </Button>
              </div>
              
              {showDurationMenu && (
                <div className="absolute z-10 mt-2 w-40 bg-white border border-slate-200 rounded-md shadow-lg">
                  <ul className="py-1">
                    <li 
                      className="px-4 py-2 hover:bg-slate-100 cursor-pointer"
                      onClick={() => handleSelectDuration(15)}
                    >
                      15 jours
                    </li>
                    <li 
                      className="px-4 py-2 hover:bg-slate-100 cursor-pointer"
                      onClick={() => handleSelectDuration(30)}
                    >
                      30 jours
                    </li>
                    <li 
                      className="px-4 py-2 hover:bg-slate-100 cursor-pointer"
                      onClick={() => handleSelectDuration(45)}
                    >
                      45 jours
                    </li>
                    <li 
                      className="px-4 py-2 hover:bg-slate-100 cursor-pointer"
                      onClick={() => handleSelectDuration(60)}
                    >
                      60 jours
                    </li>
                    <li 
                      className="px-4 py-2 hover:bg-slate-100 cursor-pointer"
                      onClick={() => handleSelectDuration(90)}
                    >
                      90 jours
                    </li>
                    <li className="px-4 py-2 border-t border-slate-200 text-primary-600 hover:bg-slate-100 cursor-pointer">
                      Date personnalisée
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}