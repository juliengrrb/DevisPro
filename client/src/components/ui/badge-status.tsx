import { Badge, BadgeProps } from "@/components/ui/badge";
import { cn, translateStatus } from "@/lib/utils";

interface BadgeStatusProps extends BadgeProps {
  status: string;
}

export function BadgeStatus({ status, className, ...props }: BadgeStatusProps) {
  // Status variant mapping
  const variantMap: Record<string, string> = {
    draft: "bg-slate-100 text-slate-800 hover:bg-slate-100 hover:text-slate-800",
    sent: "bg-blue-100 text-blue-800 hover:bg-blue-100 hover:text-blue-800",
    signed: "bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800",
    rejected: "bg-red-100 text-red-800 hover:bg-red-100 hover:text-red-800",
    pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 hover:text-yellow-800",
    paid: "bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800",
  };

  // Get the variant class
  const variantClass = variantMap[status.toLowerCase()] || "bg-slate-100 text-slate-800";

  return (
    <Badge 
      variant="outline"
      className={cn(variantClass, className)}
      {...props}
    >
      {translateStatus(status)}
    </Badge>
  );
}
