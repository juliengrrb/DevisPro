import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { FileText, Eye } from "lucide-react";

interface ProjectCardProps {
  id: number;
  name: string;
  client: string;
  startDate: string;
  endDate: string;
  progress: number;
  quoteLink?: string;
}

export function ProjectCard({
  id,
  name,
  client,
  startDate,
  endDate,
  progress,
  quoteLink,
}: ProjectCardProps) {
  return (
    <Card className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
      <div className="bg-slate-100 px-4 py-3 border-b border-slate-200">
        <h4 className="font-medium text-slate-900">{name}</h4>
      </div>
      <CardContent className="p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Client:</span>
          <span className="text-slate-900 font-medium">{client}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Début:</span>
          <span className="text-slate-900">{startDate}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Fin prévue:</span>
          <span className="text-slate-900">{endDate}</span>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-500">Avancement:</span>
            <span className="text-slate-900 font-medium">{progress}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5">
            <div
              className="bg-primary-600 h-2.5 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
      <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex justify-between">
        {quoteLink ? (
          <Link href={quoteLink}>
            <a className="text-sm text-primary-700 hover:text-primary-900 font-medium flex items-center">
              <FileText className="mr-1 h-4 w-4" />
              Devis
            </a>
          </Link>
        ) : (
          <button className="text-sm text-primary-700 hover:text-primary-900 font-medium flex items-center">
            <FileText className="mr-1 h-4 w-4" />
            Devis
          </button>
        )}
        <Link href={`/projects/${id}`}>
          <a className="text-sm text-primary-700 hover:text-primary-900 font-medium flex items-center">
            <Eye className="mr-1 h-4 w-4" />
            Détails
          </a>
        </Link>
      </div>
    </Card>
  );
}
