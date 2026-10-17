import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import { PublicProduct, PublicCategory, PublicService, buildWhatsAppLink } from '@baterias-estrela/shared';
import { ProductCard } from '../../components/common/ProductCard';
import { VehicleFinderWidget } from '../../components/common/VehicleFinderWidget';
import { BatteryLoader } from '../../components/common/BatteryLoader';
import { WhatsAppIcon } from '../../components/common/WhatsAppIcon';
import { BatteryTypeIcon } from '../../components/common/BatteryTypeIcon';
import { useSite } from '../../contexts/SiteContext';
import { trackEvent, handleWhatsAppClick } from '../../lib/analytics';
import {
  Zap,
  ShieldCheck,
  Truck,
  Gauge,
  ChevronRight,
  ShieldAlert,
  MapPin,
  Check,
  Clock,
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
      'Olá! Gostaria de consultar preços e baterias disponíveis na Baterias Estrela em Arapongas.'
    );
    handleWhatsAppClick(url, { path: '/', metadata: { action: 'hero_whatsapp_click' } });
  };

  const googleMapsUrl = 'https://www.google.com/maps/search/?api=1&query=Rua+Tapera%C3%A7u+165+Vila+Sampaio+Arapongas+PR';

  return (
    <div className="space-y-16 lg:space-y-24 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-14 lg:pt-14 lg:pb-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl space-y-6">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight uppercase leading-[1.1]">
              A Bateria Certa para o seu Carro{' '}
              <span className="text-estrela-red">com Instalação Técnica</span>
            </h1>

            <p className="text-base sm:text-lg text-estrela-gray-300 leading-relaxed font-normal">
              Trabalhamos com as marcas mais conhecidas e confiáveis da região como <strong>Moura</strong>, <strong>Zetta</strong>, <strong>Heliar</strong>, <strong>Pioneiro</strong>, <strong>Eletran</strong>, entre muitas outras. 
              Entrega e instalação gratuita em Arapongas com teste de carga e preservação da memória de bordo.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onConsultWhatsApp}
                className="px-6 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm sm:text-base flex items-center gap-2.5 shadow-lg shadow-[#25D366]/20 transition active:scale-95"
              >
                <WhatsAppIcon className="w-5 h-5 fill-white" />
                <span>Consultar Bateria no WhatsApp</span>
              </button>

              <Link
                to="/socorro"
                className="px-6 py-3.5 rounded-xl bg-estrela-red hover:bg-estrela-red-hover text-white font-bold text-sm sm:text-base flex items-center gap-2 transition shadow-md"
              >
                <ShieldAlert className="w-5 h-5" />
                <span>Socorro de Bateria (8h às 19h)</span>
              </Link>
            </div>

            {/* Diferenciais diretos */}
            <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-estrela-gray-300">
              <span className="flex items-center gap-1.5 font-medium">
                <Check className="w-4 h-4 text-emerald-400" /> Entrega Grátis em Arapongas
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Check className="w-4 h-4 text-emerald-400" /> Bateria Auxiliar p/ Memória do Carro
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Check className="w-4 h-4 text-emerald-400" /> Teste de Alternador no Local
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* BUSCA TÉCNICA POR VEÍCULO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        <VehicleFinderWidget />
      </section>

      {/* PRODUTOS EM DESTAQUE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold text-estrela-red uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Zap className="w-4 h-4" />
              <span>Pronta Entrega com Instalação</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Baterias Automotivas em Destaque
            </h2>
            <p className="text-sm text-estrela-gray-400 mt-1">
              Modelos novos de alta durabilidade com garantia oficial de fábrica e entrega rápida.
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
          <div className="max-w-xl mb-8">
            <h2 className="text-2xl font-extrabold text-white">Linhas por Aplicação</h2>
            <p className="text-sm text-estrela-gray-400 mt-1">
              Baterias específicas para a tecnologia e demanda elétrica do seu veículo.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categoriesData.data.map((cat) => (
              <Link
                key={cat.id}
                to={`/baterias?categoryId=${cat.id}`}
                className="group p-5 rounded-xl bg-estrela-dark border border-white/10 hover:border-estrela-red/50 transition flex flex-col justify-between"
              >
                <div>
                  <div className="h-10 flex items-center mb-3">
                    <BatteryTypeIcon type={cat.slug || cat.name} />
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
                  <span>Ver modelos</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* SERVIÇOS ATIVOS */}
      <section className="bg-estrela-dark/60 py-16 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <div className="text-xs font-bold text-estrela-red uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Truck className="w-4 h-4" />
              <span>Atendimento em Arapongas</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Serviços Especializados da Loja
            </h2>
            <p className="text-sm text-estrela-gray-400 mt-1">
              Atendimento técnico no balcão e socorro móvel das 08h às 19h.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {servicesData?.data.map((srv) => (
              <div
                key={srv.id}
                className="bg-estrela-dark border border-white/10 rounded-xl p-6 flex flex-col justify-between hover:border-white/20 transition"
              >
                <div>
                  <div className="text-estrela-red mb-3">
                    {srv.iconName === 'Zap' ? <Zap className="w-6 h-6" /> :
                     srv.iconName === 'Truck' ? <Truck className="w-6 h-6" /> :
                     srv.iconName === 'Gauge' ? <Gauge className="w-6 h-6" /> :
                     <ShieldCheck className="w-6 h-6" />}
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{srv.name}</h3>
                  <p className="text-xs text-estrela-gray-300 leading-relaxed">{srv.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] text-estrela-gray-400">{srv.regionServed}</span>
                  <Link
                    to="/servicos"
                    className="text-xs font-bold text-estrela-red hover:underline flex items-center gap-1"
                  >
                    <span>Detalhes</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIFERENCIAIS VERDADEIROS E MAPA CLICÁVEL DO GOOGLE MAPS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-estrela-dark border border-white/10 rounded-2xl p-6 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Informações Técnicas e Diferenciais */}
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-estrela-red">
                Diferenciais da Loja
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Baterias Estrela Mendes em Arapongas
              </h2>
              <p className="text-sm text-estrela-gray-300 leading-relaxed">
                Toda instalação é feita com bateria auxiliar conectada, garantindo que o computador de bordo, o rádio, os vidros elétricos e o câmbio do seu carro não percam a memória de configuração.
              </p>

              <div className="pt-2 space-y-2.5 text-sm text-estrela-gray-300">
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Sem surpresas:</strong> Orçamento claro e transparente pelo WhatsApp.</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Preservação de Memória:</strong> Bateria auxiliar conectada durante a substituição.</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Diagnóstico Preciso:</strong> Só trocamos sua bateria se ela realmente não segurar carga.</span>
                </div>
              </div>

              <div className="pt-4 flex items-center gap-3">
                <button
                  onClick={onConsultWhatsApp}
                  className="py-3 px-5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs sm:text-sm font-bold transition flex items-center gap-2 shadow-md active:scale-95"
                >
                  <WhatsAppIcon className="w-4 h-4 fill-white" />
                  <span>Falar com Atendimento no WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Card Venha nos Visitar: MAPA DIRETO DO GOOGLE MAPS (Clicável) */}
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group block bg-black/60 border border-white/10 hover:border-estrela-red rounded-xl p-6 transition shadow-xl"
              title="Clique para abrir o perfil e traçar rota no Google Maps"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-white font-bold text-base">
                  <MapPin className="w-5 h-5 text-estrela-red" />
                  <span>Venha nos Visitar na Loja Física</span>
                </div>
                <span className="text-[11px] text-estrela-red font-semibold group-hover:underline flex items-center gap-1">
                  Abrir no Maps ➔
                </span>
              </div>

              {/* Iframe Mapa do Google Maps Clicável */}
              <div className="w-full h-48 rounded-lg overflow-hidden border border-white/10 relative mb-4 pointer-events-none">
                <iframe
                  title="Localização Baterias Estrela Mendes Arapongas"
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: 'grayscale(30%) contrast(1.1)' }}
                  loading="lazy"
                  src="https://maps.google.com/maps?q=Rua+Tapera%C3%A7u+165+Vila+Sampaio+Arapongas+PR&t=&z=16&ie=UTF8&iwloc=&output=embed"
                />
              </div>

              <div className="space-y-2 text-xs text-estrela-gray-300">
                <p className="font-semibold text-white">
                  {settings.address || 'Rua Taperaçu 165, Vila Sampaio'} — {settings.city || 'Arapongas'} - {settings.state || 'PR'}
                </p>
                <div className="flex items-center gap-1.5 text-estrela-gray-400">
                  <Clock className="w-3.5 h-3.5 text-estrela-red" />
                  <span>Segunda a Sexta: 08h às 19h | Sábado: 08h às 13h</span>
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
