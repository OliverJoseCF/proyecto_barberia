import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardCardSkeleton } from "@/components/ui/loading-skeletons";

// Lazy loading de páginas para code splitting
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminLogin = lazy(() => import("./pages/admin/Login"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AllAppointments = lazy(() => import("./pages/admin/AllAppointments"));
const CalendarView = lazy(() => import("./pages/admin/Calendar"));
const Statistics = lazy(() => import("./pages/admin/Statistics"));
const Auditoria = lazy(() => import("./pages/admin/Auditoria"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));
const ServiceManagement = lazy(() => import("./pages/admin/ServiceManagement"));
const ScheduleManagement = lazy(() => import("./pages/admin/ScheduleManagement"));
const BarberManagement = lazy(() => import("./pages/admin/BarberManagement"));
const BusinessSettings = lazy(() => import("./pages/admin/BusinessSettings"));
const GalleryManagement = lazy(() => import("./pages/admin/GalleryManagement"));
const NotificationSettings = lazy(() => import("./pages/admin/NotificationSettings"));
const ReportsManagement = lazy(() => import("./pages/admin/ReportsManagement"));
const ClientManagement = lazy(() => import("./pages/admin/ClientManagement"));
const BookingSettings = lazy(() => import("./pages/admin/BookingSettings"));

// Configuración optimizada de QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos (antes cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Componente de fallback para lazy loading con tema consistente
const LazyFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin h-8 w-8 border-2 border-gold border-t-transparent rounded-full"></div>
      <p className="text-gold font-elegant animate-pulse">Cargando...</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider delayDuration={200}>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<LazyFallback />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/citas" element={<AllAppointments />} />
            <Route path="/admin/calendario" element={<CalendarView />} />
            <Route path="/admin/estadisticas" element={<Statistics />} />
            <Route path="/admin/auditoria" element={<Auditoria />} />
            <Route path="/admin/configuracion" element={<AdminSettings />} />
            <Route path="/admin/configuracion/servicios" element={<ServiceManagement />} />
            <Route path="/admin/configuracion/horarios" element={<ScheduleManagement />} />
            <Route path="/admin/configuracion/barberos" element={<BarberManagement />} />
            <Route path="/admin/configuracion/empresa" element={<BusinessSettings />} />
            <Route path="/admin/configuracion/galeria" element={<GalleryManagement />} />
            <Route path="/admin/configuracion/notificaciones" element={<NotificationSettings />} />
            <Route path="/admin/configuracion/reportes" element={<ReportsManagement />} />
            <Route path="/admin/configuracion/clientes" element={<ClientManagement />} />
            <Route path="/admin/configuracion/reservas" element={<BookingSettings />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
