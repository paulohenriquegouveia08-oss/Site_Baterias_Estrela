import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, MessageCircle, Clock, ShieldCheck, Zap } from 'lucide-react';
import { useSite } from '../../contexts/SiteContext';
import { formatPhoneNumber, buildTelLink, buildWhatsAppLink } from '@baterias-estrela/shared';
import { handlePhoneClick, handleWhatsAppClick } from '../../lib/analytics';

export const Footer: React.FC = () => {
  const { settings, footerPhone, footerWhatsApp } = useSite();

  const onCall = () => {
    handlePhoneClick(buildTelLink(footerPhone), { path: 'footer' });
  };

  const onWhatsApp = () => {
    const url = buildWhatsAppLink(
      footerWhatsApp,
      'Olá! Gostaria de tirar dúvidas com a equipe da Baterias Estrela em Arapongas.'
    );
    handleWhatsAppClick(url, { path: 'footer' });
  };

  return (
    <footer className="bg-estrela-black border-t border-estrela-dark text-estrela-gray-400">
      {/* Faixa de Diferenciais de Arapongas */}
      <div className="border-b border-estrela-dark/60 bg-estrela-dark/40 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-full bg-estrela-red/10 border border-estrela-red/20 flex items-center justify-center text-estrela-red shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Instalação Grátis em Arapongas</h4>
              <p className="text-xs text-estrela-gray-400">Troca rápida no local com salvador de memória de bordo.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-full bg-estrela-red/10 border border-estrela-red/20 flex items-center justify-center text-estrela-red shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Garantia Nacional de Fábrica</h4>
              <p className="text-xs text-estrela-gray-400">Produtos originais homologados pelas principais montadoras.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-full bg-estrela-red/10 border border-estrela-red/20 flex items-center justify-center text-estrela-red shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Plantão de Socorro Automotivo</h4>
              <p className="text-xs text-estrela-gray-400">Atendimento ágil para panes de bateria na cidade e rodovias.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal do Rodapé */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Coluna 1: Loja e Apresentação */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-estrela-dark border border-white/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-estrela-red fill-estrela-red" />
            </div>
            <span className="text-lg font-bold text-white uppercase tracking-tight">
              Baterias <span className="text-estrela-red">Estrela</span>
            </span>
          </div>
          <p className="text-sm text-estrela-gray-400 leading-relaxed">
            {settings.tagline || 'Especialistas em baterias automotivas, diagnóstico de carga e socorro emergencial em Arapongas - PR.'}
          </p>
          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-md">
              <ShieldCheck className="w-3.5 h-3.5" />
              Ponto Certificado de Descarte Ecológico
            </span>
          </div>
        </div>

        {/* Coluna 2: Navegação Rápida */}
        <div>
          <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4 border-l-2 border-estrela-red pl-2.5">
            Navegação
          </h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/baterias" className="hover:text-white transition">Catálogo de Baterias</Link>
            </li>
            <li>
              <Link to="/encontrar-bateria" className="hover:text-white transition">Buscar por Veículo</Link>
            </li>
            <li>
              <Link to="/servicos" className="hover:text-white transition">Nossos Serviços</Link>
            </li>
            <li>
              <Link to="/socorro" className="hover:text-estrela-red transition font-medium">Socorro Rápido Emergencial</Link>
            </li>
            <li>
              <Link to="/contato" className="hover:text-white transition">Fale Conosco</Link>
            </li>
            <li>
              <Link to="/privacidade" className="hover:text-white transition text-xs text-estrela-gray-500">Política de Privacidade</Link>
            </li>
          </ul>
        </div>

        {/* Coluna 3: Localização e Horários */}
        <div>
          <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4 border-l-2 border-estrela-red pl-2.5">
            Onde Estamos
          </h4>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-estrela-red shrink-0 mt-0.5" />
              <span>
                {settings.address || 'Rua Taperaçu 165, Vila Sampaio'}<br />
                {settings.city || 'Arapongas'} - {settings.state || 'PR'}<br />
                CEP: {settings.postalCode || '86700-000'}
              </span>
            </div>
            <div className="flex items-start gap-2.5 pt-1">
              <Clock className="w-4 h-4 text-estrela-red shrink-0 mt-0.5" />
              <span>{settings.workingHours || 'Seg a Sex: 08h às 18h | Sáb: 08h às 12h30'}</span>
            </div>
          </div>
        </div>

        {/* Coluna 4: Canais de Atendimento */}
        <div>
          <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4 border-l-2 border-estrela-red pl-2.5">
            Atendimento Rápido
          </h4>
          <div className="space-y-3 text-sm">
            <button
              onClick={onWhatsApp}
              className="w-full py-2.5 px-3 rounded-lg bg-estrela-dark hover:bg-white/10 border border-white/10 hover:border-estrela-red/50 transition flex items-center gap-3 text-left group"
            >
              <div className="w-8 h-8 rounded-full bg-estrela-red/20 flex items-center justify-center text-estrela-red group-hover:bg-estrela-red group-hover:text-white transition">
                <MessageCircle className="w-4 h-4 fill-current" />
              </div>
              <div>
                <span className="block text-xs text-estrela-gray-400">WhatsApp Oficial</span>
                <span className="text-white font-semibold">{formatPhoneNumber(footerWhatsApp)}</span>
              </div>
            </button>

            <button
              onClick={onCall}
              className="w-full py-2.5 px-3 rounded-lg bg-estrela-dark hover:bg-white/10 border border-white/10 hover:border-white/30 transition flex items-center gap-3 text-left"
            >
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-xs text-estrela-gray-400">Plantão Telefônico</span>
                <span className="text-white font-semibold">{formatPhoneNumber(footerPhone)}</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Copyright e Acesso Administrativo */}
      <div className="border-t border-estrela-dark py-6 px-4 sm:px-6 lg:px-8 text-xs text-estrela-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>© {new Date().getFullYear()} Baterias Estrela - Arapongas, PR. Todos os direitos reservados. Sem preços públicos divulgados online.</p>
          <div className="flex items-center gap-4">
            <Link to="/privacidade" className="hover:text-estrela-gray-300 transition">Privacidade e Cookies</Link>
            <span className="text-estrela-gray-700">|</span>
            <Link to="/admin/login" className="hover:text-estrela-red transition font-medium">Área Restrita (Admin)</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
