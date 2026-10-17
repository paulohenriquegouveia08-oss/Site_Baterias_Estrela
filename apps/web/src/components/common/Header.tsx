import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Phone, Menu, X, ShieldAlert } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { useSite } from '../../contexts/SiteContext';
import { formatPhoneNumber, buildTelLink, buildWhatsAppLink } from '@baterias-estrela/shared';
import { handlePhoneClick, handleWhatsAppClick } from '../../lib/analytics';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { headerPhone, headerWhatsApp } = useSite();

  const navLinks = [
    { label: 'Início', path: '/' },
    { label: 'Baterias', path: '/baterias' },
    { label: 'Encontrar Bateria', path: '/encontrar-bateria' },
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

  // Dois cliques na logo abrem o painel administrativo de forma discreta
  const handleLogoDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/admin/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-estrela-black border-b border-white/10 shadow-lg">
      {/* Top Banner de Horário e Atendimento */}
      <div className="bg-estrela-dark py-1.5 px-4 text-xs text-estrela-gray-300 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex justify-between sm:justify-end items-center gap-3 sm:gap-4 text-[11px] sm:text-xs">
          <span className="text-estrela-gray-400">
            Seg a Sex: 08h às 19h | Sáb: 08h às 13h
          </span>
          <span className="hidden sm:inline text-white/10">|</span>
          <button
            onClick={onCallClick}
            className="hover:text-white transition font-bold text-estrela-red flex items-center gap-1.5 shrink-0"
          >
            <Phone className="w-3 h-3" />
            {formatPhoneNumber(headerPhone)}
          </button>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logotipo Oficial Baterias Estrela Mendes (Dois cliques abre Admin) */}
        <div
          onDoubleClick={handleLogoDoubleClick}
          className="cursor-pointer select-none"
          title="Baterias Estrela Mendes - Arapongas"
        >
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/logo.webp"
              alt="Baterias Estrela Mendes"
              className="h-12 sm:h-14 w-auto object-contain transition-transform hover:scale-[1.02]"
              width="240"
              height="56"
              loading="eager"
              // @ts-expect-error React standard HTML attribute
              fetchpriority="high"
              decoding="sync"
            />
          </Link>
        </div>

        {/* Links Desktop */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            if (link.alert) {
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className="ml-2 px-3.5 py-1.5 rounded-lg bg-estrela-red text-white font-bold text-sm hover:bg-estrela-red-hover transition flex items-center gap-1.5 shadow"
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
                className={`px-3 py-2 rounded-md text-sm font-semibold transition ${
                  isActive
                    ? 'text-white bg-white/10'
                    : 'text-estrela-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* CTAs Diretos Desktop com WhatsApp Verde Oficial */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={onCallClick}
            className="p-2.5 rounded-lg border border-white/15 bg-estrela-dark hover:border-white/30 text-white transition flex items-center justify-center"
            title="Ligar agora"
          >
            <Phone className="w-4 h-4 text-white" />
          </button>

          <button
            onClick={onWhatsAppHeaderClick}
            className="px-4 py-2.5 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white text-sm font-bold transition flex items-center gap-2 shadow-md active:scale-95"
          >
            <WhatsAppIcon className="w-4 h-4 fill-white" />
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
              className="w-full py-2.5 px-4 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white font-bold flex items-center justify-center gap-2 shadow-md"
            >
              <WhatsAppIcon className="w-4 h-4 fill-white" />
              Chamar no WhatsApp
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
