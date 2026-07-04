import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Index1 from "./pages/Index1";
import About from "./pages/About";
import Contact from "./pages/Contact";
import HomeMoving from "./pages/HomeMoving";
import Quote from "./pages/Quote";
import Services from "./pages/Services";
import NotFound from "./pages/NotFound";
import { AuthProvider, useAuth, ROLE_DASHBOARD } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext1";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  DashboardOverview,
  MyOrders,
  TrackOrder,
  Payments,
  Ratings,
  Profile,
  NewOrder,
} from "@/pages/dashboard";
import Login from "@/pages/login/Login";
import Register from "@/pages/login/Register";
import RegisterChoose from "@/pages/login/RegisterChoose";
import RegisterDriver from "@/pages/login/RegisterDriver";
import RegisterWorker from "@/pages/login/RegisterWorker";
import ForgotPassword from "@/pages/login/ForgotPassword";
import ResetPassword from "@/pages/login/ResetPassword";
import VerifyOtp from "@/pages/login/VerifyOtp";
import RegistrationPending from "@/pages/login/RegistrationPending";
import PaymentSuccess from "@/pages/PaymentSuccess";
import PaymentCancel from "@/pages/PaymentCancel";
import OrderSuccess from "@/pages/OrderSuccess";
import {
  AdminOverview,
  AdminOrders,
  AdminUsers,
  AdminVehicles,
  AdminTracking,
  AdminTrackingAlerts,
  AdminPayments,
  AdminRatings,
  AdminPerformanceAlerts,
  ApplicantsPage,
} from "@/pages/admin";
import { AdminLogin } from "@/pages/admin/AdminLogin";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { DriverLayout } from "@/components/driver/DriverLayout";
import {
  DriverOverview,
  DriverOrders,
  DriverActiveOrder,
  DriverTracking,
  DriverRatings,
} from "@/pages/driver";
import { WorkerLayout } from "@/components/worker/WorkerLayout";
import { WorkerOverview, WorkerTasks, WorkerTaskDetails } from "@/pages/worker";

const queryClient = new QueryClient();


// ProtectedRoute: blocks unauthenticated users. Optionally restricts by role.
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to their own dashboard instead of showing a blank/error page
    return <Navigate to={ROLE_DASHBOARD[user.role] ?? '/'} replace />;
  }

  return <>{children}</>;
};

// Dashboard wrapper with layout
const DashboardRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedRoles={['customer']}>
    <DashboardLayout>{children}</DashboardLayout>
  </ProtectedRoute>
);

const AppRoutes = () => (
  <Routes>
    {/* Landing Pages */}
    <Route path="/" element={<Index1 />} />
    <Route path="/about" element={<About />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/services" element={<Services />} />
    <Route path="/quote" element={<Index />} />
    <Route path="/services/home-moving" element={<HomeMoving />} />
    
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/register/choose" element={<RegisterChoose />} />
    <Route path="/register/driver" element={<RegisterDriver />} />
    <Route path="/register/worker" element={<RegisterWorker />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route path="/verify-otp" element={<VerifyOtp />} />
    <Route path="/register/pending" element={<RegistrationPending />} />
    <Route path="/payment-success" element={<PaymentSuccess />} />
    <Route path="/payment-cancel" element={<PaymentCancel />} />
    <Route path="/order-success" element={<OrderSuccess />} />

    {/* Dashboard routes - New Order redirects to main order page */}
    <Route path="/dashboard" element={<DashboardRoute><DashboardOverview /></DashboardRoute>} />
    <Route path="/dashboard/new-order" element={<DashboardRoute><NewOrder /></DashboardRoute>} />
    <Route path="/dashboard/orders" element={<DashboardRoute><MyOrders /></DashboardRoute>} />
    <Route path="/dashboard/orders/:orderId" element={<DashboardRoute><MyOrders /></DashboardRoute>} />
    <Route path="/dashboard/track" element={<DashboardRoute><TrackOrder /></DashboardRoute>} />
    <Route path="/dashboard/payments" element={<DashboardRoute><Payments /></DashboardRoute>} />
    <Route path="/dashboard/ratings" element={<DashboardRoute><Ratings /></DashboardRoute>} />
    <Route path="/dashboard/profile" element={<DashboardRoute><Profile /></DashboardRoute>} />

    {/* Admin Login */}
    <Route path="/admin/login" element={<AdminLogin />} />

    {/* Admin routes */}
    <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><AdminOverview /></AdminLayout></ProtectedRoute>} />
    <Route path="/admin/applicants" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><ApplicantsPage /></AdminLayout></ProtectedRoute>} />
    <Route path="/admin/orders" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><AdminOrders /></AdminLayout></ProtectedRoute>} />
    <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><AdminUsers /></AdminLayout></ProtectedRoute>} />
    <Route path="/admin/vehicles" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><AdminVehicles /></AdminLayout></ProtectedRoute>} />
    <Route path="/admin/tracking" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><AdminTracking /></AdminLayout></ProtectedRoute>} />
    <Route path="/admin/tracking-alerts" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><AdminTrackingAlerts /></AdminLayout></ProtectedRoute>} />
    <Route path="/admin/payments" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><AdminPayments /></AdminLayout></ProtectedRoute>} />
    <Route path="/admin/ratings" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><AdminRatings /></AdminLayout></ProtectedRoute>} />
    <Route path="/admin/performance-alerts" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><AdminPerformanceAlerts /></AdminLayout></ProtectedRoute>} />

    {/* Driver routes */}
    <Route path="/driver" element={<ProtectedRoute allowedRoles={['driver']}><DriverLayout><DriverOverview /></DriverLayout></ProtectedRoute>} />
    <Route path="/driver/orders" element={<ProtectedRoute allowedRoles={['driver']}><DriverLayout><DriverOrders /></DriverLayout></ProtectedRoute>} />
    <Route path="/driver/active" element={<ProtectedRoute allowedRoles={['driver']}><DriverLayout><DriverActiveOrder /></DriverLayout></ProtectedRoute>} />
    <Route path="/driver/tracking" element={<ProtectedRoute allowedRoles={['driver']}><DriverLayout><DriverTracking /></DriverLayout></ProtectedRoute>} />
    <Route path="/driver/ratings" element={<ProtectedRoute allowedRoles={['driver']}><DriverLayout><DriverRatings /></DriverLayout></ProtectedRoute>} />

    {/* Worker routes */}
    <Route path="/worker" element={<ProtectedRoute allowedRoles={['worker']}><WorkerLayout><WorkerOverview /></WorkerLayout></ProtectedRoute>} />
    <Route path="/worker/tasks" element={<ProtectedRoute allowedRoles={['worker']}><WorkerLayout><WorkerTasks /></WorkerLayout></ProtectedRoute>} />
    <Route path="/worker/tasks/:taskId" element={<ProtectedRoute allowedRoles={['worker']}><WorkerLayout><WorkerTaskDetails /></WorkerLayout></ProtectedRoute>} />

    {/* Catch-all */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <LanguageProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
