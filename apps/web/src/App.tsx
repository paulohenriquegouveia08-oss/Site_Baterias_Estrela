import React from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SiteProvider } from './contexts/SiteContext';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';

// Layouts e Componentes Globais
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';

// Página Inicial no bundle principal para abertura instantânea (0ms de atraso para o cliente)
import { Home } from './pages/public/Home';

// Demais Páginas Públicas com carregamento assíncrono (Code-Splitting)
const Catalog = React.lazy(() => import('./pages/public/Catalog').then(m => ({ default: m.Catalog })));
const ProductDetail = React.lazy(() => import('./pages/public/ProductDetail').then(m => ({ default: m.ProductDetail })));
const VehicleFinderPage = React.lazy(() => import('./pages/public/VehicleFinderPage').then(m => ({ default: m.VehicleFinderPage })));
const ServicesPage = React.lazy(() => import('./pages/public/ServicesPage').then(m => ({ default: m.ServicesPage })));
const RescuePage = React.lazy(() => import('./pages/public/RescuePage').then(m => ({ default: m.RescuePage })));
const ContactPage = React.lazy(() => import('./pages/public/ContactPage').then(m => ({ default: m.ContactPage })));
const PrivacyPage = React.lazy(() => import('./pages/public/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const NotFound = React.lazy(() => import('./pages/public/NotFound').then(m => ({ default: m.NotFound })));

// Painel Administrativo com carregamento sob demanda (isola bibliotecas pesadas como Recharts)
const AdminLayout = React.lazy(() => import('./components/admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AdminLogin = React.lazy(() => import('./pages/admin/AdminLogin').then(m => ({ default: m.AdminLogin })));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminProducts = React.lazy(() => import('./pages/admin/AdminProducts').then(m => ({ default: m.AdminProducts })));
const AdminCategories = React.lazy(() => import('./pages/admin/AdminCategories').then(m => ({ default: m.AdminCategories })));
const AdminVehicles = React.lazy(() => import('./pages/admin/AdminVehicles').then(m => ({ default: m.AdminVehicles })));
const AdminServices = React.lazy(() => import('./pages/admin/AdminServices').then(m => ({ default: m.AdminServices })));
const AdminContacts = React.lazy(() => import('./pages/admin/AdminContacts').then(m => ({ default: m.AdminContacts })));
const AdminSettings = React.lazy(() => import('./pages/admin/AdminSettings').then(m => ({ default: m.AdminSettings })));
const AdminServiceRequests = React.lazy(() => import('./pages/admin/AdminServiceRequests').then(m => ({ default: m.AdminServiceRequests })));
const AdminAuditLogs = React.lazy(() => import('./pages/admin/AdminAuditLogs').then(m => ({ default: m.AdminAuditLogs })));

const PageLoader: React.FC = () => (
  <div className="min-h-[40vh] flex items-center justify-center p-8">
    <div className="w-8 h-8 rounded-full border-2 border-estrela-red/20 border-t-estrela-red animate-spin" />
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutos de cache em memória
      gcTime: 30 * 60 * 1000,    // 30 minutos retido em memória
      retry: 1,
    },
  },
});

const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-estrela-black text-white">
      <Header />
      <main className="flex-1">
        <React.Suspense fallback={<PageLoader />}>
          <Outlet />
        </React.Suspense>
      </main>
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SiteProvider>
        <AuthProvider>
          <ToastProvider>
            <BrowserRouter>
              <React.Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Rotas Públicas da Loja */}
                  <Route element={<PublicLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/baterias" element={<Catalog />} />
                    <Route path="/baterias/:slug" element={<ProductDetail />} />
                    <Route path="/encontrar-bateria" element={<VehicleFinderPage />} />
                    <Route path="/servicos" element={<ServicesPage />} />
                    <Route path="/socorro" element={<RescuePage />} />
                    <Route path="/contato" element={<ContactPage />} />
                    <Route path="/privacidade" element={<PrivacyPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>

                  {/* Login do Administrador */}
                  <Route path="/admin/login" element={<AdminLogin />} />

                  {/* Área Administrativa Protegida */}
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="produtos" element={<AdminProducts />} />
                    <Route path="categorias" element={<AdminCategories />} />
                    <Route path="veiculos" element={<AdminVehicles />} />
                    <Route path="servicos" element={<AdminServices />} />
                    <Route path="contatos" element={<AdminContacts />} />
                    <Route path="solicitacoes" element={<AdminServiceRequests />} />
                    <Route path="configuracoes" element={<AdminSettings />} />
                    <Route path="auditoria" element={<AdminAuditLogs />} />
                  </Route>
                </Routes>
              </React.Suspense>
            </BrowserRouter>
          </ToastProvider>
        </AuthProvider>
      </SiteProvider>
    </QueryClientProvider>
  );
};
