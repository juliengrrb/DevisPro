import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  increaseBadge?: {
    value: string | number;
    label: string;
  };
  progressBar?: {
    value: number;
    label: string;
  };
  iconColor?: "primary" | "blue" | "green" | "construction" | "red";
}

export function StatsCard({
  title,
  value,
  icon,
  increaseBadge,
  progressBar,
  iconColor = "primary",
}: StatsCardProps) {
  // Color mapping for icon background
  const colorMap = {
    primary: "bg-primary-100 text-primary-700",
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    construction: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
  };

  // Progress bar color
  const progressBarColor = {
    primary: "bg-primary-500",
    blue: "bg-blue-500",
    green: "bg-green-500",
    construction: "bg-amber-500",
    red: "bg-red-500",
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="p-5">
        <div className="flex justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-3xl font-semibold text-slate-900">{value}</p>
          </div>
          <div
            className={`h-12 w-12 rounded-full flex items-center justify-center ${colorMap[iconColor]}`}
          >
            {icon}
          </div>
        </div>

        {increaseBadge && (
          <p className="mt-4 text-sm text-green-600 flex items-center">
            <svg
              className="h-4 w-4 mr-1"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
            <span>
              {increaseBadge.value}% {increaseBadge.label}
            </span>
          </p>
        )}

        {progressBar && (
          <>
            <div className="mt-4 w-full bg-slate-100 rounded-full h-2.5">
              <div
                className={`${progressBarColor[iconColor]} h-2.5 rounded-full`}
                style={{ width: `${progressBar.value}%` }}
              ></div>
            </div>
            <p className="mt-1 text-sm text-slate-500">{progressBar.label}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
