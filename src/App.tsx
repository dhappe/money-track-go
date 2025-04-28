
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { TransactionProvider } from "./contexts/TransactionContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Layout
import AppLayout from "./components/AppLayout";

// Pages
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import TransactionsPage from "./pages/TransactionsPage";
import TransactionFormPage from "./pages/TransactionFormPage";
import PlanningPage from "./pages/PlanningPage";
import AccountPage from "./pages/AccountPage";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";

const queryClient = new QueryClient();

// Fixed App component without TooltipProvider at the root level
const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TransactionProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            
            {/* App Routes */}
            <Route element={<AppLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/add-transaction" element={<TransactionFormPage />} />
              <Route path="/edit-transaction/:id" element={<TransactionFormPage />} />
              <Route path="/planning" element={<PlanningPage />} />
              <Route path="/account" element={<AccountPage />} />
            </Route>
            
            {/* Fallback Routes */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TransactionProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
