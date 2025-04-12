import { EditIcon } from "lucide-react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EditSectionButtonProps extends ButtonProps {
  onClick: () => void;
  className?: string;
}

export function EditSectionButton({ onClick, className, ...props }: EditSectionButtonProps) {
  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      className={cn("absolute top-2 right-2 p-2 h-auto text-slate-500 hover:text-slate-800 hover:bg-slate-100", className)}
      onClick={onClick}
      {...props}
    >
      <EditIcon className="h-4 w-4" />
    </Button>
  );
}