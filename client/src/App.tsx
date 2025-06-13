import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import SubmitRound from "@/pages/submit-round";
import PracticePlan from "@/pages/practice-plan";
import Resources from "@/pages/resources";
import Onboarding from "@/pages/onboarding";
import Navigation from "@/components/navigation";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/submit-round" component={SubmitRound} />
      <Route path="/practice-plan" component={PracticePlan} />
      <Route path="/resources" component={Resources} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 pb-20 md:pb-8">
            <Router />
          </main>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
