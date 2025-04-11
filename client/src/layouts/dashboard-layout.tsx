import { ReactNode } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { useMobile } from "@/hooks/use-mobile";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const isMobile = useMobile();
  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col md:ml-64">
        <main className="flex-1 overflow-y-auto pt-6 md:pt-0 pb-10 px-4 md:px-8 mt-14 md:mt-0">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
