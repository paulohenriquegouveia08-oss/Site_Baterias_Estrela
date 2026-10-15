import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Phone, MessageCircle, Menu, X, ShieldAlert, Zap } from 'lucide-react';
import { useSite } from '../../contexts/SiteContext';
import { formatPhoneNumber, buildTelLink, buildWhatsAppLink } from '@baterias-estrela/shared';
import { handlePhoneClick, handleWhatsAppClick } from '../../lib/analytics';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { headerPhone, headerWhatsApp } = useSite();

  const navLinks = [
    { label: 'Início', path: '/' },
    { label: 'Baterias', path: '/baterias' },
    { label: 'Encontrar Bateria', path: '/encontrar-bateria', highlight: true },
    { label: 'Serviços', path: '/servicos' },
    { label: 'Socorro Rápido', path: '/socorro', alert: true },
    { label: 'Contato', path: '/contato' },
  ];

  const onCallClick = () => {
    handlePhoneClick(buildTelLink(headerPhone), { path: location.pathname });
  };

  const onWhatsAppHeaderClick = () => {
    const url = buildWhatsAppLink(
      headerWhatsApp,
      'Olá! Gostaria de falar com o atendimento da Baterias Estrela em Arapongas.'
    );
    handleWhatsAppClick(url, { path: location.pathname });
  };

  return (
    <header className="sticky top-0 z-50 bg-estrela-black/95 backdrop-blur-md border-b border-estrela-dark">
      {/* Top Banner Informativo */}
      <div className="bg-estrela-dark py-1.5 px-4 text-xs text-estrela-gray-300 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-estrela-red opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-estrela-red"></span>
            </span>
            <span>⚡ <strong>Entrega e Instalação Grátis</strong> em toda Arapongas - PR</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:inline">Plantão e Vendas:</span>
            <button
              onClick={onCallClick}
              className="hover:text-estrela-red transition font-semibold flex items-center gap-1"
            >
              <Phone className="w-3 h-3 text-estrela-red" />
              {formatPhoneNumber(headerPhone)}
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logotipo Premium */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-lg bg-estrela-dark border border-white/10 flex items-center justify-center p-2 group-hover:border-estrela-red transition shadow-inner">
            <div className="relative">
              <Zap className="w-7 h-7 text-estrela-red fill-estrela-red" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-white uppercase flex items-center gap-1">
              Baterias <span className="text-estrela-red">Estrela</span>
            </span>
            <span className="text-[10px] tracking-widest text-estrela-gray-400 font-medium uppercase">
              Arapongas - Paraná
            </span>
          </div>
        </Link>

        {/* Links Desktop */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            if (link.alert) {
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className="ml-2 px-3.5 py-1.5 rounded-full bg-estrela-red/15 border border-estrela-red text-estrela-red font-bold text-sm hover:bg-estrela-red hover:text-white transition flex items-center gap-1.5"
                >
                  <ShieldAlert className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            }
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                  isActive
                    ? 'text-white bg-white/10 font-semibold'
                    : 'text-estrela-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* CTAs Diretos Desktop */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={onCallClick}
            className="p-2.5 rounded-lg border border-white/10 bg-estrela-dark hover:border-white/30 text-white transition flex items-center justify-center"
            title="Ligar agora"
          >
            <Phone className="w-4 h-4 text-white" />
          </button>

          <button
            onClick={onWhatsAppHeaderClick}
            className="px-4 py-2.5 rounded-lg bg-estrela-red hover:bg-estrela-red-hover text-white text-sm font-semibold transition flex items-center gap-2 shadow-lg shadow-estrela-red/20 active:scale-95"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>WhatsApp</span>
          </button>
        </div>

        {/* Botão Menu Mobile */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg text-estrela-gray-300 hover:text-white hover:bg-white/10"
          aria-label="Abrir menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Menu Mobile */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-estrela-dark border-b border-estrela-card px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2.5 rounded-md text-base font-medium ${
                location.pathname === link.path
                  ? 'bg-estrela-red text-white font-bold'
                  : 'text-estrela-gray-200 hover:bg-white/10'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onCallClick();
              }}
              className="w-full py-2.5 px-4 rounded-lg border border-white/20 bg-estrela-black text-white font-medium flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4 text-estrela-red" />
              Ligar ({formatPhoneNumber(headerPhone)})
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onWhatsAppHeaderClick();
              }}
              className="w-full py-2.5 px-4 rounded-lg bg-estrela-red text-white font-semibold flex items-center justify-center gap-2 shadow-md"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              Consultar via WhatsApp
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
