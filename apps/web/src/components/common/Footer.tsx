import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Clock, ShieldCheck, Zap } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
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
      {/* Faixa de Diferenciais de Arapongas - Sem fundos de IA artificiais */}
      <div className="border-b border-white/10 bg-estrela-dark py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="flex items-center gap-3.5 justify-center md:justify-start">
            <Zap className="w-6 h-6 text-estrela-red shrink-0" />
            <div>
              <h4 className="text-white font-bold text-sm">Instalação com Proteção de Memória</h4>
              <p className="text-xs text-estrela-gray-400">Usamos bateria auxiliar para não desconfigurar rádio e injeção.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 justify-center md:justify-start">
            <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <h4 className="text-white font-bold text-sm">Garantia Nacional das Fabricantes</h4>
              <p className="text-xs text-estrela-gray-400">Baterias originais <strong className="text-estrela-red font-bold">Moura</strong>, <strong className="text-estrela-red font-bold">Zetta</strong>, <strong className="text-estrela-red font-bold">Heliar</strong>, <strong className="text-estrela-red font-bold">Pioneiro</strong>, <strong className="text-estrela-red font-bold">Eletran</strong> e multimarcas com procedência e garantia.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 justify-center md:justify-start">
            <Clock className="w-6 h-6 text-estrela-red shrink-0" />
            <div>
              <h4 className="text-white font-bold text-sm">Socorro de Bateria das 08h às 19h</h4>
              <p className="text-xs text-estrela-gray-400">Atendimento móvel rápido para panes de bateria em Arapongas.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal do Rodapé */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Coluna 1: Loja e Apresentação com Logo Oficial */}
        <div className="space-y-4">
          <Link to="/" className="inline-block">
            <img
              src="/logo.png"
              alt="Baterias Estrela Mendes"
              className="h-12 w-auto object-contain"
            />
          </Link>
          <p className="text-xs text-estrela-gray-400 leading-relaxed">
            Loja especializada em baterias automotivas, diagnóstico de alternador e socorro móvel em Arapongas - PR.
          </p>
          <div className="text-xs text-estrela-gray-400 space-y-1">
            <p><strong>CNPJ:</strong> 84.987.379/0001-65</p>
            <p>Baterias Estrela Mendes Ltda</p>
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
              <Link to="/servicos" className="hover:text-white transition">Serviços da Loja</Link>
            </li>
            <li>
              <Link to="/socorro" className="hover:text-estrela-red transition font-medium">Socorro Rápido (8h às 19h)</Link>
            </li>
            <li>
              <Link to="/contato" className="hover:text-white transition">Fale Conosco</Link>
            </li>
            <li>
              <Link to="/privacidade" className="hover:text-white transition text-xs text-estrela-gray-500">Política de Privacidade</Link>
            </li>
          </ul>
        </div>

        {/* Coluna 3: Localização e Horários Reais */}
        <div>
          <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4 border-l-2 border-estrela-red pl-2.5">
            Onde Estamos
          </h4>
          <div className="space-y-3 text-sm">
            <a
              href="https://www.google.com/maps/search/?api=1&query=Rua+Tapera%C3%A7u+165+Vila+Sampaio+Arapongas+PR"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2.5 hover:text-white transition group"
              title="Abrir no Google Maps"
            >
              <MapPin className="w-4 h-4 text-estrela-red shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
              <span>
                {settings.address || 'Rua Taperaçu 165, Vila Sampaio'}<br />
                {settings.city || 'Arapongas'} - {settings.state || 'PR'}<br />
                CEP: {settings.postalCode || '86700-000'}
              </span>
            </a>

            <div className="flex items-start gap-2.5 pt-1">
              <Clock className="w-4 h-4 text-estrela-red shrink-0 mt-0.5" />
              <div>
                <span className="text-white font-medium block">Horário da Loja:</span>
                <span>Seg a Sex: 08h às 19h</span><br />
                <span>Sábado: 08h às 13h</span>
              </div>
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
              className="w-full py-2.5 px-3 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white font-bold transition flex items-center gap-3 text-left shadow-md"
            >
              <WhatsAppIcon className="w-5 h-5 fill-white shrink-0" />
              <div>
                <span className="block text-[11px] text-white/90">WhatsApp Oficial</span>
                <span className="text-sm">{formatPhoneNumber(footerWhatsApp)}</span>
              </div>
            </button>

            <button
              onClick={onCall}
              className="w-full py-2.5 px-3 rounded-lg bg-estrela-dark hover:bg-white/10 border border-white/15 transition flex items-center gap-3 text-left"
            >
              <Phone className="w-4 h-4 text-white shrink-0" />
              <div>
                <span className="block text-xs text-estrela-gray-400">Plantão Telefônico</span>
                <span className="text-white font-semibold">{formatPhoneNumber(footerPhone)}</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Copyright e CNPJ - Sem link público para Admin */}
      <div className="border-t border-estrela-dark py-6 px-4 sm:px-6 lg:px-8 text-xs text-estrela-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>© {new Date().getFullYear()} Baterias Estrela Mendes — CNPJ: 84.987.379/0001-65. Arapongas - PR. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4">
            <Link to="/privacidade" className="hover:text-estrela-gray-300 transition">Privacidade e Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
