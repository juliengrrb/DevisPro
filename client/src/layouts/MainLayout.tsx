import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  FileText, 
  Home, 
  PlusCircle, 
  Users, 
  Menu, 
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  const routes = [
    { path: "/", label: "Tableau de bord", icon: <Home className="mr-3 h-5 w-5" /> },
    { path: "/devis", label: "Mes devis", icon: <FileText className="mr-3 h-5 w-5" /> },
    { path: "/nouveau-devis", label: "Nouveau devis", icon: <PlusCircle className="mr-3 h-5 w-5" /> },
    { path: "/clients", label: "Clients", icon: <Users className="mr-3 h-5 w-5" /> },
  ];

  const NavLink = ({ path, label, icon }: { path: string, label: string, icon: React.ReactNode }) => {
    const isActive = location === path;
    return (
      <Link href={path}>
        <a
          className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
            isActive 
              ? "bg-primary-50 text-primary-600" 
              : "text-gray-600 hover:bg-gray-50"
          }`}
          onClick={() => setOpen(false)}
        >
          {icon}
          {label}
        </a>
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden mr-2">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[240px] sm:w-[300px]">
                <div className="py-6 px-2">
                  <div className="px-4 py-2">
                    <h2 className="text-lg font-medium text-gray-900">Menu</h2>
                  </div>
                  <div className="mt-6 px-2 space-y-1">
                    {routes.map((route) => (
                      <NavLink 
                        key={route.path} 
                        path={route.path} 
                        label={route.label} 
                        icon={route.icon} 
                      />
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            <Link href="/">
              <a className="flex items-center">
                <FileText className="h-8 w-8 text-primary-600" />
                <span className="ml-2 text-xl font-semibold text-gray-900">DevisPro</span>
              </a>
            </Link>
          </div>
          
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
              JD
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Desktop */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
            <div className="h-0 flex-1 flex flex-col overflow-y-auto">
              <div className="px-4 py-6 border-b border-gray-200">
                <div className="text-lg font-medium text-gray-900">Menu</div>
              </div>
              <nav className="flex-1 px-4 py-4 bg-white space-y-1">
                {routes.map((route) => (
                  <NavLink 
                    key={route.path} 
                    path={route.path} 
                    label={route.label} 
                    icon={route.icon} 
                  />
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
