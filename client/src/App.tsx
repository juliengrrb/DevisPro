import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import QuotesIndex from "@/pages/quotes/index";
import QuoteCreate from "@/pages/quotes/create";
import QuoteEdit from "@/pages/quotes/edit";
import QuoteView from "@/pages/quotes/view";
import InvoicesIndex from "@/pages/invoices/index";
import ClientsIndex from "@/pages/clients/index";
import ProjectsIndex from "@/pages/projects/index";
import Settings from "@/pages/settings";

function Router() {
  return (
    <Switch>
      {/* Dashboard */}
      <Route path="/" component={Dashboard} />
      
      {/* Quotes */}
      <Route path="/quotes" component={QuotesIndex} />
      <Route path="/quotes/create" component={QuoteCreate} />
      <Route path="/quotes/edit/:id" component={QuoteEdit} />
      <Route path="/quotes/:id" component={QuoteView} />
      
      {/* Invoices */}
      <Route path="/invoices" component={InvoicesIndex} />
      
      {/* Clients */}
      <Route path="/clients" component={ClientsIndex} />
      
      {/* Projects */}
      <Route path="/projects" component={ProjectsIndex} />
      
      {/* Settings */}
      <Route path="/settings" component={Settings} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
