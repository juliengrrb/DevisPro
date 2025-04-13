import { PencilIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EditSectionButtonProps {
  onClick: () => void;
}

export function EditSectionButton({ onClick }: EditSectionButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="absolute top-2 right-2 h-7 w-7 p-0"
      onClick={onClick}
      title="Modifier cette section"
    >
      <PencilIcon className="h-4 w-4" />
    </Button>
  );
}