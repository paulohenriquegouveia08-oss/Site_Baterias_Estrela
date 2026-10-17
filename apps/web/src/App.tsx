import React from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SiteProvider } from './contexts/SiteContext';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';

// Layouts e Componentes Globais
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';

// Páginas Públicas
import { Home } from './pages/public/Home';
import { Catalog } from './pages/public/Catalog';
import { ProductDetail } from './pages/public/ProductDetail';
import { VehicleFinderPage } from './pages/public/VehicleFinderPage';
import { ServicesPage } from './pages/public/ServicesPage';
import { RescuePage } from './pages/public/RescuePage';
import { ContactPage } from './pages/public/ContactPage';
import { PrivacyPage } from './pages/public/PrivacyPage';
import { NotFound } from './pages/public/NotFound';

// Painel Administrativo
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminVehicles } from './pages/admin/AdminVehicles';
import { AdminServices } from './pages/admin/AdminServices';
import { AdminContacts } from './pages/admin/AdminContacts';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminServiceRequests } from './pages/admin/AdminServiceRequests';
import { AdminAuditLogs } from './pages/admin/AdminAuditLogs';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-estrela-black text-white">
      <Header />
      <main className="flex-1">
        <Outlet />
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
            </BrowserRouter>
          </ToastProvider>
        </AuthProvider>
      </SiteProvider>
    </QueryClientProvider>
  );
};
