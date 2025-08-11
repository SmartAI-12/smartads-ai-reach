import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import CampaignsPage from "./pages/CampaignsPage";
import CreateCampaignPage from "./pages/CreateCampaignPage";
import ClientsPage from "./pages/ClientsPage";
import ClientDetailPage from "./pages/ClientDetailPage";
import CreateClientPage from "./pages/CreateClientPage";
import TasksPage from "./pages/TasksPage";
import CreateTaskPage from "./pages/CreateTaskPage";
import ExpensesPage from "./pages/ExpensesPage";
import CreateExpensePage from "./pages/CreateExpensePage";
import LeadsPage from "./pages/LeadsPage";
import CreateLeadPage from "./pages/CreateLeadPage";
import ExecutionReportsPage from "./pages/ExecutionReportsPage";
import CreateExecutionReportPage from "./pages/CreateExecutionReportPage";
import UsersPage from "./pages/UsersPage";
import VendorsPage from "./pages/VendorsPage";
import ProfilePage from "./pages/ProfilePage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
          <Routes>
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Index />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/campaigns" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <CampaignsPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/campaigns/create" 
              element={
                <ProtectedRoute requiredRole="manager">
                  <AppLayout>
                    <CreateCampaignPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/campaigns/new" 
              element={
                <ProtectedRoute requiredRole="manager">
                  <AppLayout>
                    <CreateCampaignPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/clients" 
              element={
                <ProtectedRoute requiredRole="manager">
                  <AppLayout>
                    <ClientsPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/clients/create" 
              element={
                <ProtectedRoute requiredRole="manager">
                  <AppLayout>
                    <CreateClientPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/clients/:id" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ClientDetailPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tasks" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <TasksPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tasks/create" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <CreateTaskPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tasks/new" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <CreateTaskPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/expenses" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ExpensesPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/expenses/new" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <CreateExpensePage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/expenses/create" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <CreateExpensePage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/leads" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <LeadsPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/leads/create" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <CreateLeadPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/reports" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ExecutionReportsPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/reports/create" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <CreateExecutionReportPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/users" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AppLayout>
                    <UsersPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/vendors" 
              element={
                <ProtectedRoute requiredRole="manager">
                  <AppLayout>
                    <VendorsPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ProfilePage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <AnalyticsPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </BrowserRouter>
          </TooltipProvider>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
