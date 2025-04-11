import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { ReactNode } from "react";
import { useMobile } from "@/hooks/use-mobile";
import { 
  Home, 
  FileText, 
  CreditCard, 
  Users, 
  Building2, 
  Settings, 
  Menu, 
  X 
} from "lucide-react";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SidebarLinkProps {
  href: string;
  icon: ReactNode;
  children: ReactNode;
  active: boolean;
  onClick?: () => void;
}

function SidebarLink({ href, icon, children, active, onClick }: SidebarLinkProps) {
  return (
    <Link href={href} onClick={onClick}>
      <a
        className={cn(
          "flex items-center px-3 py-2 text-sm font-medium rounded-md",
          active
            ? "bg-primary-50 text-primary-700"
            : "text-slate-700 hover:bg-slate-50"
        )}
      >
        <span className="mr-3 h-5 w-5">{icon}</span>
        {children}
      </a>
    </Link>
  );
}

export function Sidebar() {
  const [location] = useLocation();
  const isMobile = useMobile();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  // Mobile top navigation
  if (isMobile) {
    return (
      <>
        <div className="fixed top-0 left-0 right-0 z-30 bg-white border-b border-slate-200">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <svg className="h-8 w-8 text-primary-700" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" />
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="ml-2 text-xl font-bold text-slate-900">DevisPro</span>
            </div>
            <button
              onClick={toggleSidebar}
              className="rounded-md p-2 text-slate-500 hover:bg-slate-100"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile menu overlay */}
        {isOpen && (
          <div className="fixed inset-0 z-40 bg-black bg-opacity-50" onClick={closeSidebar} />
        )}

        {/* Mobile menu */}
        <div
          className={cn(
            "fixed top-0 right-0 bottom-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out",
            isOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex justify-between items-center px-4 py-3 border-b border-slate-200">
            <span className="text-xl font-bold text-slate-900">Menu</span>
            <button
              onClick={closeSidebar}
              className="rounded-md p-2 text-slate-500 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="px-4 pt-5 pb-4">
            <div className="space-y-1">
              <SidebarLink
                href="/"
                icon={<Home className="text-slate-600" />}
                active={location === "/"}
                onClick={closeSidebar}
              >
                Tableau de bord
              </SidebarLink>
              <SidebarLink
                href="/quotes"
                icon={<FileText className="text-slate-600" />}
                active={location.startsWith("/quotes")}
                onClick={closeSidebar}
              >
                Devis
              </SidebarLink>
              <SidebarLink
                href="/invoices"
                icon={<CreditCard className="text-slate-600" />}
                active={location.startsWith("/invoices")}
                onClick={closeSidebar}
              >
                Factures
              </SidebarLink>
              <SidebarLink
                href="/clients"
                icon={<Users className="text-slate-600" />}
                active={location.startsWith("/clients")}
                onClick={closeSidebar}
              >
                Clients
              </SidebarLink>
              <SidebarLink
                href="/projects"
                icon={<Building2 className="text-slate-600" />}
                active={location.startsWith("/projects")}
                onClick={closeSidebar}
              >
                Chantiers
              </SidebarLink>
              <SidebarLink
                href="/settings"
                icon={<Settings className="text-slate-600" />}
                active={location.startsWith("/settings")}
                onClick={closeSidebar}
              >
                Paramètres
              </SidebarLink>
            </div>
          </nav>

          <Separator />

          <div className="px-4 py-4">
            <div className="flex items-center">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>MD</AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <p className="text-sm font-medium text-slate-900">Martin Dubois</p>
                <p className="text-xs text-slate-500">Admin</p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Desktop sidebar
  return (
    <aside className="hidden md:flex md:w-64 flex-col fixed inset-y-0 z-50 bg-white border-r border-slate-200">
      <div className="flex flex-col flex-grow pt-5 overflow-y-auto">
        <div className="px-4 pb-4 flex items-center">
          <div className="shrink-0 flex items-center">
            <svg className="h-8 w-8 text-primary-700" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" />
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="ml-2 text-xl font-bold text-slate-900">DevisPro BTP</span>
          </div>
        </div>
        <nav className="px-4 mt-5 flex-1">
          <div className="space-y-1">
            <SidebarLink
              href="/"
              icon={<Home className="text-slate-600" />}
              active={location === "/"}
              onClick={closeSidebar}
            >
              Tableau de bord
            </SidebarLink>
            <SidebarLink
              href="/quotes"
              icon={<FileText className="text-slate-600" />}
              active={location.startsWith("/quotes")}
              onClick={closeSidebar}
            >
              Devis
            </SidebarLink>
            <SidebarLink
              href="/invoices"
              icon={<CreditCard className="text-slate-600" />}
              active={location.startsWith("/invoices")}
              onClick={closeSidebar}
            >
              Factures
            </SidebarLink>
            <SidebarLink
              href="/clients"
              icon={<Users className="text-slate-600" />}
              active={location.startsWith("/clients")}
              onClick={closeSidebar}
            >
              Clients
            </SidebarLink>
            <SidebarLink
              href="/projects"
              icon={<Building2 className="text-slate-600" />}
              active={location.startsWith("/projects")}
              onClick={closeSidebar}
            >
              Chantiers
            </SidebarLink>
            <SidebarLink
              href="/settings"
              icon={<Settings className="text-slate-600" />}
              active={location.startsWith("/settings")}
              onClick={closeSidebar}
            >
              Paramètres
            </SidebarLink>
          </div>
        </nav>
      </div>
      <div className="px-4 py-4 border-t border-slate-200">
        <div className="flex items-center">
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>MD</AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <p className="text-sm font-medium text-slate-900">Martin Dubois</p>
            <p className="text-xs text-slate-500">Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
