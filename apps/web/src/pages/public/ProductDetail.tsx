import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import {
  PublicProductDetail,
  PublicProduct,
  buildWhatsAppProductMessage,
  buildWhatsAppLink,
  formatPolarityLabel,
  formatTechnologyLabel,
  formatWarrantyLabel,
} from '@baterias-estrela/shared';
import { BatteryLoader } from '../../components/common/BatteryLoader';
import { ProductCard } from '../../components/common/ProductCard';
import { useSite } from '../../contexts/SiteContext';
import { trackEvent, handleWhatsAppClick } from '../../lib/analytics';
import { WhatsAppIcon } from '../../components/common/WhatsAppIcon';
import {
  Zap,
  Shield,
  Truck,
  Car,
  ChevronRight,
  ShieldAlert,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { defaultWhatsApp } = useSite();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ['product-detail', slug],
    queryFn: () =>
      apiFetch<{
        product: PublicProductDetail;
        relatedProducts: PublicProduct[];
      }>(`/products/${slug}`),
    enabled: !!slug,
  });

  const product = data?.product;
  const relatedProducts = data?.relatedProducts || [];

  // Rastreia evento product_view
  useEffect(() => {
    if (product) {
      trackEvent('product_view', {
        path: `/baterias/${slug}`,
        productId: product.id,
        metadata: {
          name: product.name,
          brand: product.brand,
          amperageAh: product.amperageAh,
        },
      });
    }
  }, [product, slug]);

  if (isLoading) {
    return (
      <div className="py-24">
        <BatteryLoader size="lg" label="Carregando especificações da bateria..." />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-estrela-card flex items-center justify-center text-estrela-red mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Bateria não encontrada</h2>
        <p className="text-sm text-estrela-gray-400">
          O modelo solicitado não está disponível ou foi retirado de linha.
        </p>
        <Link
          to="/baterias"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-estrela-red text-white text-xs font-bold hover:bg-estrela-red-hover transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Catálogo
        </Link>
      </div>
    );
  }

  const activeImage = product.images[activeImageIndex]?.url || product.images[0]?.url;
  const hasValidImage = activeImage && !activeImage.includes('unsplash');

  const onConsultWhatsApp = () => {
    const msg = buildWhatsAppProductMessage({
      productName: product.name,
      sku: product.sku,
      brand: product.brand,
      amperageAh: product.amperageAh,
    });

    const url = buildWhatsAppLink(defaultWhatsApp.number, msg);
    handleWhatsAppClick(url, {
      productId: product.id,
      path: window.location.pathname,
      metadata: { action: 'product_detail_whatsapp_click' },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Navegação Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-estrela-gray-400">
        <Link to="/" className="hover:text-white transition">Início</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/baterias" className="hover:text-white transition">Baterias</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-white font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* DETALHES PRINCIPAIS: GALERIA E FICHA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Galeria de Fotos */}
        <div className="space-y-4">
          <div className="relative aspect-[4/3] bg-estrela-dark border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center">
            {hasValidImage ? (
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-neutral-900 via-estrela-card to-neutral-950 p-8 text-center select-none">
                <div className="w-24 h-16 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center relative mb-3">
                  <div className="absolute -top-2 flex gap-6">
                    <span className="w-3.5 h-2 bg-white/40 rounded-t-sm" />
                    <span className="w-3.5 h-2 bg-white/40 rounded-t-sm" />
                  </div>
                  <span className="text-xs font-black text-estrela-red tracking-wider uppercase">
                    {product.brand}
                  </span>
                </div>
                <span className="text-sm font-bold text-estrela-gray-300 tracking-wider uppercase">
                  Imagem produto
                </span>
                <span className="text-xs text-estrela-gray-500 mt-1">
                  {product.name}
                </span>
              </div>
            )}
            {product.isFeatured && (
              <span className="absolute top-4 left-4 bg-estrela-red text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded shadow-lg">
                Destaque
              </span>
            )}
            <div className="absolute bottom-4 right-4 bg-estrela-black/90 backdrop-blur-md border border-white/10 text-white font-black text-base px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-estrela-red fill-estrela-red" />
              {product.amperageAh} Ah
            </div>
          </div>

          {/* Miniaturas de Fotos */}
          {hasValidImage && product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border transition shrink-0 ${
                    activeImageIndex === idx ? 'border-estrela-red scale-105' : 'border-white/10 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt={img.altText || product.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Destaque Técnico de Instalação e Memória */}
          <div className="p-4 rounded-xl bg-estrela-dark border border-white/10 flex items-start gap-3">
            <Truck className="w-5 h-5 text-estrela-red shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-white block">Entrega e Troca Técnica em Arapongas</span>
              <span className="text-estrela-gray-300">
                Levamos até você e utilizamos bateria auxiliar durante a substituição para preservar as memórias de injeção e áudio do veículo.
              </span>
            </div>
          </div>
        </div>

        {/* Informações Técnicas e Botão de Ação */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-3 text-xs text-estrela-gray-400 uppercase tracking-widest mb-1.5">
              <span className="text-estrela-red font-bold">{product.brand}</span>
              {product.sku && <span>SKU: {product.sku}</span>}
              <span>•</span>
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Pronta Entrega na Loja
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              {product.name}
            </h1>
          </div>

          {/* Descrição Comercial */}
          <div className="text-sm text-estrela-gray-300 leading-relaxed space-y-3 bg-estrela-dark/60 p-5 rounded-xl border border-white/5">
            <p>{product.description}</p>
          </div>

          {/* TABELA DE ESPECIFICAÇÕES TÉCNICAS */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-estrela-red" />
              Especificações Técnicas
            </h3>

            <div className="rounded-xl border border-white/10 overflow-hidden bg-estrela-dark divide-y divide-white/5 text-xs">
              <div className="grid grid-cols-2 p-3">
                <span className="text-estrela-gray-400">Capacidade Nominal (C20)</span>
                <span className="font-bold text-white">{product.amperageAh} Ah</span>
              </div>
              <div className="grid grid-cols-2 p-3">
                <span className="text-estrela-gray-400">Tensão Nominal</span>
                <span className="font-bold text-white">{product.voltageV} Volts</span>
              </div>
              {product.ccaA && (
                <div className="grid grid-cols-2 p-3">
                  <span className="text-estrela-gray-400">Corrente de Partida a Frio (CCA -18°C)</span>
                  <span className="font-bold text-white">{product.ccaA} A</span>
                </div>
              )}
              <div className="grid grid-cols-2 p-3">
                <span className="text-estrela-gray-400">Tecnologia da Bateria</span>
                <span className="font-bold text-white">{formatTechnologyLabel(product.technology)}</span>
              </div>
              <div className="grid grid-cols-2 p-3">
                <span className="text-estrela-gray-400">Polaridade dos Pólos</span>
                <span className="font-bold text-white">{formatPolarityLabel(product.polarity)}</span>
              </div>
              {product.dimensionsMm && (
                <div className="grid grid-cols-2 p-3">
                  <span className="text-estrela-gray-400">Dimensões (Comp x Larg x Alt)</span>
                  <span className="font-bold text-white">{product.dimensionsMm}</span>
                </div>
              )}
              <div className="grid grid-cols-2 p-3">
                <span className="text-estrela-gray-400">Garantia Nacional</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" />
                  {formatWarrantyLabel(product.warrantyMonths)}
                </span>
              </div>
            </div>
          </div>

          {/* CTA WHATSAPP (SEM PREÇO PÚBLICO E COM COR OFICIAL) */}
          <div className="p-6 rounded-2xl bg-estrela-dark border border-white/10 space-y-4 shadow-xl">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-estrela-red">
                Atendimento Direto da Loja
              </span>
              <h4 className="text-lg font-bold text-white mt-0.5">
                Consulte Preço e Instalação Grátis em Arapongas
              </h4>
              <p className="text-xs text-estrela-gray-400 mt-1">
                Entregamos e instalamos gratuitamente em qualquer bairro de Arapongas. Tire dúvidas e consulte condições no WhatsApp.
              </p>
            </div>

            <button
              onClick={onConsultWhatsApp}
              className="w-full py-4 px-6 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-base font-extrabold transition flex items-center justify-center gap-3 shadow-xl shadow-[#25D366]/20 active:scale-95"
            >
              <WhatsAppIcon className="w-5 h-5 fill-white" />
              <span>Consultar Preço e Disponibilidade no WhatsApp</span>
            </button>
          </div>
        </div>
      </div>

      {/* COMPATIBILIDADES VEICULARES VALIDADAS */}
      {product.compatibilities && product.compatibilities.length > 0 && (
        <section className="bg-estrela-dark border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-estrela-red" />
            <h3 className="text-xl font-bold text-white">
              Veículos com Compatibilidade Homologada
            </h3>
          </div>
          <p className="text-xs text-estrela-gray-400">
            Abaixo estão algumas das principais aplicações verificadas para esta bateria. Se seu veículo não estiver listado, fale conosco pelo WhatsApp.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {product.compatibilities.map((comp) => (
              <div
                key={comp.id}
                className="p-4 rounded-xl bg-estrela-card/60 border border-white/5 space-y-1.5"
              >
                <div className="text-[11px] font-bold text-estrela-red uppercase">
                  {comp.vehicleMake}
                </div>
                <div className="text-sm font-bold text-white">
                  {comp.vehicleModel} - {comp.variantName}
                </div>
                <div className="text-xs text-estrela-gray-400">
                  Anos: {comp.years}
                </div>
                {comp.technicalNotes && (
                  <div className="text-[11px] text-estrela-gray-300 italic pt-1 border-t border-white/5">
                    {comp.technicalNotes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* PRODUTOS RELACIONADOS */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6">
          <h3 className="text-xl font-bold text-white">Outras Opções Relacionadas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
