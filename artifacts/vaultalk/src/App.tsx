import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider } from "@/contexts/UserContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AuthPage from "@/pages/AuthPage";
import SellerDashboard from "@/pages/SellerDashboard";
import BuyerDashboard from "@/pages/BuyerDashboard";
import PayPage from "@/pages/PayPage";
import NegotiationRoom from "@/pages/NegotiationRoom";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 5000 },
  },
});

function DashboardRedirect() {
  const { account } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!account) {
      setLocation("/auth");
    } else if (account.role === "seller") {
      setLocation("/seller");
    } else {
      setLocation("/buyer");
    }
  }, [account, setLocation]);

  return null;
}

function HomeRedirect() {
  const { account } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (account) {
      setLocation("/dashboard");
    } else {
      setLocation("/auth");
    }
  }, [account, setLocation]);

  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomeRedirect} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/dashboard" component={DashboardRedirect} />
      <Route path="/seller" component={SellerDashboard} />
      <Route path="/buyer" component={BuyerDashboard} />
      <Route path="/pay" component={PayPage} />
      <Route path="/room/:roomId" component={NegotiationRoom} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <UserProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </UserProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
