import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth";
import { PlanBasedRoute } from "@/components/navigation/PlanBasedRoute";

// Public pages
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import SubscribePage from "./pages/SubscribePage";
import NotFound from "./pages/NotFound";

// Plan home pages
import { StartHome, ProHome, PremiumHome } from "./pages/plan-homes";

// Start plan pages (all plans)
import AgendaPage from "./pages/AgendaPage";
import CalendarPage from "./pages/CalendarPage";
import LocationsPage from "./pages/LocationsPage";
import PaymentsPage from "./pages/PaymentsPage";
import DashboardPage from "./pages/DashboardPage";
import ConfigPage from "./pages/ConfigPage";

// Pro plan pages
import ExpensesPage from "./pages/ExpensesPage";
import ReportsPage from "./pages/ReportsPage";
import GoalsPage from "./pages/GoalsPage";
import ExportPage from "./pages/ExportPage";
import ReceivablesPage from "./pages/ReceivablesPage";

// Premium plan pages
import AlertsPage from "./pages/AlertsPage";
import InsightsPage from "./pages/InsightsPage";
import NetResultPage from "./pages/NetResultPage";
import AccountantExportPage from "./pages/AccountantExportPage";
import SupportPage from "./pages/SupportPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/subscribe" element={<SubscribePage />} />
            
            {/* Plan home routes */}
            <Route
              path="/start"
              element={
                <PlanBasedRoute routePath="/start">
                  <StartHome />
                </PlanBasedRoute>
              }
            />
            <Route
              path="/pro"
              element={
                <PlanBasedRoute routePath="/pro">
                  <ProHome />
                </PlanBasedRoute>
              }
            />
            <Route
              path="/premium"
              element={
                <PlanBasedRoute routePath="/premium">
                  <PremiumHome />
                </PlanBasedRoute>
              }
            />
            
            {/* Start plan routes (all subscribed users) */}
            <Route
              path="/agenda"
              element={
                <PlanBasedRoute routePath="/agenda">
                  <AgendaPage />
                </PlanBasedRoute>
              }
            />
            <Route
              path="/calendario"
              element={
                <PlanBasedRoute routePath="/calendario">
                  <CalendarPage />
                </PlanBasedRoute>
              }
            />
            <Route
              path="/locais"
              element={
                <PlanBasedRoute routePath="/locais">
                  <LocationsPage />
                </PlanBasedRoute>
              }
            />
            <Route
              path="/pagamentos"
              element={
                <PlanBasedRoute routePath="/pagamentos">
                  <PaymentsPage />
                </PlanBasedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <PlanBasedRoute routePath="/dashboard">
                  <DashboardPage />
                </PlanBasedRoute>
              }
            />
            <Route
              path="/config"
              element={
                <PlanBasedRoute routePath="/config">
                  <ConfigPage />
                </PlanBasedRoute>
              }
            />
            
            {/* Pro plan routes */}
            <Route
              path="/recebimentos"
              element={
                <PlanBasedRoute routePath="/recebimentos">
                  <ReceivablesPage />
                </PlanBasedRoute>
              }
            />
            <Route
              path="/despesas"
              element={
                <PlanBasedRoute routePath="/despesas">
                  <ExpensesPage />
                </PlanBasedRoute>
              }
            />
            <Route
              path="/relatorios"
              element={
                <PlanBasedRoute routePath="/relatorios">
                  <ReportsPage />
                </PlanBasedRoute>
              }
            />
            <Route
              path="/metas"
              element={
                <PlanBasedRoute routePath="/metas">
                  <GoalsPage />
                </PlanBasedRoute>
              }
            />
            <Route
              path="/export"
              element={
                <PlanBasedRoute routePath="/export">
                  <ExportPage />
                </PlanBasedRoute>
              }
            />
            
            {/* Premium plan routes */}
            <Route
              path="/alertas-inteligentes"
              element={
                <PlanBasedRoute routePath="/alertas-inteligentes">
                  <AlertsPage />
                </PlanBasedRoute>
              }
            />
            <Route
              path="/insights"
              element={
                <PlanBasedRoute routePath="/insights">
                  <InsightsPage />
                </PlanBasedRoute>
              }
            />
            <Route
              path="/resultado-real"
              element={
                <PlanBasedRoute routePath="/resultado-real">
                  <NetResultPage />
                </PlanBasedRoute>
              }
            />
            <Route
              path="/contador"
              element={
                <PlanBasedRoute routePath="/contador">
                  <AccountantExportPage />
                </PlanBasedRoute>
              }
            />
            <Route
              path="/suporte"
              element={
                <PlanBasedRoute routePath="/suporte">
                  <SupportPage />
                </PlanBasedRoute>
              }
            />
            
            {/* Legacy routes - redirect to new structure */}
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <StartHome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/financas"
              element={
                <PlanBasedRoute routePath="/pagamentos">
                  <PaymentsPage />
                </PlanBasedRoute>
              }
            />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
