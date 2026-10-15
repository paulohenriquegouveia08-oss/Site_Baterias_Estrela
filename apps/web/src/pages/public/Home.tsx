import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import { PublicProduct, PublicCategory, PublicService, buildWhatsAppLink } from '@baterias-estrela/shared';
import { ProductCard } from '../../components/common/ProductCard';
import { VehicleFinderWidget } from '../../components/common/VehicleFinderWidget';
import { BatteryLoader } from '../../components/common/BatteryLoader';
import { useSite } from '../../contexts/SiteContext';
import { trackEvent, handleWhatsAppClick } from '../../lib/analytics';
import {
  Zap,
  ShieldCheck,
  Truck,
  Gauge,
  MessageCircle,
  ChevronRight,
  ShieldAlert,
  MapPin,
  Check,
} from 'lucide-react';

export const Home: React.FC = () => {
  const { settings, defaultWhatsApp } = useSite();

  useEffect(() => {
    trackEvent('page_view', { path: '/' });
  }, []);

  // Busca produtos em destaque
  const { data: featuredData, isLoading: loadingFeatured } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => apiFetch<{ data: PublicProduct[] }>('/products?featured=true&limit=6'),
  });

  // Busca categorias ativas
  const { data: categoriesData } = useQuery({
    queryKey: ['public-categories'],
    queryFn: () => apiFetch<{ data: PublicCategory[] }>('/categories'),
  });

  // Busca serviços ativos
  const { data: servicesData } = useQuery({
    queryKey: ['public-services'],
    queryFn: () => apiFetch<{ data: PublicService[] }>('/services'),
  });

  const onConsultWhatsApp = () => {
    const url = buildWhatsAppLink(
      defaultWhatsApp.number,
      'Olá! Gostaria de consultar preços e baterias disponíveis na loja de Arapongas.'
    );
    handleWhatsAppClick(url, { path: '/', metadata: { action: 'hero_whatsapp_click' } });
  };

  return (
    <div className="space-y-16 lg:space-y-24 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24 border-b border-estrela-dark">
        {/* Glow de fundo sutil */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-estrela-red/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-estrela-dark border border-white/10 text-xs font-semibold text-estrela-gray-300">
              <span className="w-2 h-2 rounded-full bg-estrela-red animate-pulse" />
              <span>Arapongas e Região - Loja Física e Socorro Móvel</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight uppercase leading-[1.1]">
              A Bateria Certa para o seu Carro{' '}
              <span className="text-estrela-red">sem Sair de Casa</span>
            </h1>

            <p className="text-base sm:text-lg text-estrela-gray-300 leading-relaxed font-normal">
              Trabalhamos com marcas líderes como <strong>Moura</strong>, <strong>Heliar</strong>, <strong>Bralmax</strong> e <strong>Zetta</strong>. 
              Entrega e instalação técnica gratuita em toda Arapongas com teste computadorizado do alternador.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onConsultWhatsApp}
                className="px-6 py-3.5 rounded-xl bg-estrela-red hover:bg-estrela-red-hover text-white font-bold text-sm sm:text-base flex items-center gap-2.5 shadow-xl shadow-estrela-red/20 transition active:scale-95"
              >
                <MessageCircle className="w-5 h-5 fill-white" />
                <span>Consultar Bateria pelo WhatsApp</span>
              </button>

              <Link
                to="/socorro"
                className="px-6 py-3.5 rounded-xl bg-estrela-dark hover:bg-white/10 border border-white/15 text-white font-semibold text-sm sm:text-base flex items-center gap-2 transition"
              >
                <ShieldAlert className="w-5 h-5 text-estrela-red" />
                <span>Precisa de Socorro Rápido?</span>
              </Link>
            </div>

            {/* Micro badges de garantia e entrega */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-estrela-gray-400">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" /> Entrega Grátis em Arapongas
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" /> Instalação com Protetor de Memória
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" /> Teste do Alternador Gratuito
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* BUSCA TÉCNICA POR VEÍCULO EM DESTAQUE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <VehicleFinderWidget />
      </section>

      {/* PRODUTOS EM DESTAQUE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold text-estrela-red uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Zap className="w-4 h-4" />
              <span>Garantia de Qualidade e Partida Imediata</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Baterias Automotivas em Destaque
            </h2>
            <p className="text-sm text-estrela-gray-400 mt-1">
              Consulte condições especiais, garantia de até 2 anos e bônus na troca pela sua sucata.
            </p>
          </div>

          <Link
            to="/baterias"
            className="inline-flex items-center gap-1 text-sm font-bold text-white hover:text-estrela-red transition group"
          >
            <span>Ver Catálogo Completo</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </Link>
        </div>

        {loadingFeatured ? (
          <div className="py-12">
            <BatteryLoader label="Carregando baterias em destaque..." />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredData?.data.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* CATEGORIAS CADASTRADAS */}
      {categoriesData?.data && categoriesData.data.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl font-extrabold text-white">Categorias e Aplicações</h2>
            <p className="text-sm text-estrela-gray-400 mt-1">
              Encontre o modelo ideal para o porte e tecnologia elétrica do seu veículo.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categoriesData.data.map((cat) => (
              <Link
                key={cat.id}
                to={`/baterias?categoryId=${cat.id}`}
                className="group p-5 rounded-xl bg-estrela-dark border border-estrela-card hover:border-estrela-red/50 transition flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-estrela-card flex items-center justify-center text-estrela-red mb-3 group-hover:bg-estrela-red group-hover:text-white transition">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-estrela-red transition">
                    {cat.name}
                  </h3>
                  {cat.description && (
                    <p className="text-xs text-estrela-gray-400 mt-1 line-clamp-2">
                      {cat.description}
                    </p>
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between text-xs font-semibold text-estrela-gray-400 group-hover:text-white">
                  <span>Explorar modelos</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* SERVIÇOS ATIVOS */}
      <section className="bg-estrela-dark/40 py-16 border-y border-estrela-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <div className="text-xs font-bold text-estrela-red uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Truck className="w-4 h-4" />
              <span>Atendimento em Arapongas e Região</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Serviços Automotivos Especializados
            </h2>
            <p className="text-sm text-estrela-gray-400 mt-1">
              Mais do que vender baterias: prestamos suporte técnico completo para você nunca ficar a pé.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {servicesData?.data.map((srv) => (
              <div
                key={srv.id}
                className="bg-estrela-dark border border-estrela-card rounded-xl p-6 flex flex-col justify-between hover:border-white/20 transition"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-estrela-card border border-white/5 flex items-center justify-center text-estrela-red mb-4">
                    {srv.iconName === 'Zap' ? <Zap className="w-6 h-6" /> :
                     srv.iconName === 'Truck' ? <Truck className="w-6 h-6" /> :
                     srv.iconName === 'Gauge' ? <Gauge className="w-6 h-6" /> :
                     <ShieldCheck className="w-6 h-6" />}
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{srv.name}</h3>
                  <p className="text-xs text-estrela-gray-400 leading-relaxed">{srv.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-estrela-card">
                  <Link
                    to="/servicos"
                    className="text-xs font-bold text-estrela-red hover:underline flex items-center gap-1"
                  >
                    <span>{srv.ctaText || 'Saiba mais'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIFERENCIAIS VERDADEIROS DE ARAPONGAS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-estrela-dark via-estrela-card to-estrela-dark border border-white/10 rounded-2xl p-8 sm:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-estrela-red">
                Por que escolher a Baterias Estrela?
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Compromisso com sua Segurança e Economia em Arapongas
              </h2>
              <p className="text-sm text-estrela-gray-300 leading-relaxed">
                Nossa loja é referência no fornecimento de acumuladores elétricos na cidade. Seguimos rigorosamente as especificações do fabricante do seu veículo, evitando danos à injeção eletrônica e aos módulos de bordo.
              </p>

              <div className="pt-2 space-y-2.5 text-sm text-estrela-gray-300">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span><strong>Sem surpresas no preço:</strong> Orçamento claro e transparente pelo WhatsApp.</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span><strong>Desconto na sucata:</strong> Sua bateria usada vale desconto imediato na compra da nova.</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span><strong>Diagnóstico honesto:</strong> Só trocamos sua bateria se ela realmente estiver condenada.</span>
                </div>
              </div>
            </div>

            {/* Card Localização e Contato */}
            <div className="bg-estrela-black/80 border border-white/10 rounded-xl p-6 sm:p-8 space-y-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-estrela-red" />
                <span>Venha nos Visitar</span>
              </h3>
              <p className="text-sm text-estrela-gray-300">
                {settings.address || 'Rua Taperaçu 165, Vila Sampaio'}<br />
                {settings.city || 'Arapongas'} - {settings.state || 'PR'}
              </p>
              <div className="text-xs text-estrela-gray-400 border-t border-white/10 pt-3">
                <strong>Horário de Funcionamento:</strong><br />
                {settings.workingHours || 'Segunda a Sexta: 08:00 às 18:00 | Sábado: 08:00 às 12:30'}
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={onConsultWhatsApp}
                  className="flex-1 py-2.5 px-4 rounded-lg bg-estrela-red hover:bg-estrela-red-hover text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Falar pelo WhatsApp</span>
                </button>
                <Link
                  to="/contato"
                  className="py-2.5 px-4 rounded-lg border border-white/20 text-white hover:bg-white/10 text-xs font-semibold transition text-center"
                >
                  Ver Mapa e Rota
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
