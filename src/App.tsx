import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppDataProvider } from "@/contexts/AppDataContext";
import { AppSidebar } from "@/components/AppSidebar";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import ApplicationsPage from "@/pages/ApplicationsPage";
import NewApplicationPage from "@/pages/NewApplicationPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import AdminPage from "@/pages/AdminPage";
import CAMReportPage from "@/pages/CAMReportPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const AuthenticatedApp = () => {
  const { user } = useAuth();
  if (!user) return <LoginPage />;

  return (
    <AppDataProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 p-6 overflow-auto">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/applications" element={<ApplicationsPage />} />
            <Route path="/new-application" element={<NewApplicationPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </AppDataProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AuthenticatedApp />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
