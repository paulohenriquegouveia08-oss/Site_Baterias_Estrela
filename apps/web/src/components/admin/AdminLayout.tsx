import React from 'react';
import { Link, useLocation, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { BatteryLoader } from '../common/BatteryLoader';
import {
  LayoutDashboard,
  Package,
  Layers,
  Car,
  Wrench,
  Phone,
  Settings,
  Bell,
  ShieldCheck,
  LogOut,
  ExternalLink,
  Zap,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-estrela-black flex items-center justify-center">
        <BatteryLoader size="lg" label="Autenticando sessão administrativa..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  const menuItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Produtos e Estoque', path: '/admin/produtos', icon: Package },
    { label: 'Categorias', path: '/admin/categorias', icon: Layers },
    { label: 'Veículos e Aplicações', path: '/admin/veiculos', icon: Car },
    { label: 'Serviços Automotivos', path: '/admin/servicos', icon: Wrench },
    { label: 'Telefones e WhatsApp', path: '/admin/contatos', icon: Phone },
    { label: 'Solicitações Recebidas', path: '/admin/solicitacoes', icon: Bell },
    { label: 'Configurações da Loja', path: '/admin/configuracoes', icon: Settings },
    { label: 'Auditoria de Alterações', path: '/admin/auditoria', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-estrela-black text-white flex flex-col md:flex-row">
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-estrela-dark border-r border-estrela-card flex flex-col justify-between shrink-0">
        <div>
          {/* Logo e Identificação */}
          <div className="p-5 border-b border-estrela-card flex items-center justify-between">
            <Link to="/admin/dashboard" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-estrela-black border border-white/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-estrela-red fill-estrela-red" />
              </div>
              <div>
                <span className="font-extrabold text-sm uppercase tracking-tight block">
                  Estrela <span className="text-estrela-red">Admin</span>
                </span>
                <span className="text-[10px] text-estrela-gray-400 block -mt-0.5">Painel de Gestão</span>
              </div>
            </Link>
          </div>

          {/* Links do Menu */}
          <nav className="p-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
                    isActive
                      ? 'bg-estrela-red text-white shadow-md'
                      : 'text-estrela-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Rodapé da Sidebar: Usuário e Ações */}
        <div className="p-4 border-t border-estrela-card space-y-3">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-estrela-black/80 border border-white/5 text-xs text-estrela-gray-300 hover:text-white hover:border-white/20 transition"
          >
            <span>Ver Site da Loja</span>
            <ExternalLink className="w-3.5 h-3.5 text-estrela-red" />
          </Link>

          <div className="pt-1 flex items-center justify-between">
            <div className="truncate pr-2">
              <span className="block text-xs font-bold text-white truncate">{user?.name}</span>
              <span className="block text-[10px] text-estrela-gray-400 truncate">{user?.email}</span>
            </div>
            <button
              onClick={logout}
              title="Encerrar sessão"
              className="p-2 rounded-lg bg-estrela-card hover:bg-estrela-red text-estrela-gray-400 hover:text-white transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL DE CONTEÚDO */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
