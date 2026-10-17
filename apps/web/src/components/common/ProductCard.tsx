import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Zap, CheckCircle2 } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { PublicProduct, buildWhatsAppProductMessage, buildWhatsAppLink, formatWarrantyLabel, formatTechnologyLabel } from '@baterias-estrela/shared';
import { useSite } from '../../contexts/SiteContext';
import { handleWhatsAppClick } from '../../lib/analytics';
import { resolveMediaUrl } from '../../lib/media';

interface ProductCardProps {
  product: PublicProduct;
  vehicleName?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, vehicleName }) => {
  const { defaultWhatsApp } = useSite();

  const rawCover = product.images?.find((img) => img.isCover)?.url || product.images?.[0]?.url;
  const coverImage = resolveMediaUrl(rawCover);
  const hasValidImage = Boolean(coverImage && !coverImage.includes('unsplash'));

  const onConsultWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const msg = buildWhatsAppProductMessage({
      productName: product.name,
      sku: product.sku,
      brand: product.brand,
      amperageAh: product.amperageAh,
      vehicleName: vehicleName || undefined,
    });

    const url = buildWhatsAppLink(defaultWhatsApp.number, msg);
    handleWhatsAppClick(url, {
      productId: product.id,
      path: window.location.pathname,
      metadata: { action: 'product_card_whatsapp_click' },
    });
  };

  return (
    <div className="group bg-estrela-dark border border-white/10 hover:border-estrela-red/60 rounded-xl overflow-hidden flex flex-col transition-all duration-200 hover:shadow-xl">
      {/* Imagem do Produto */}
      <Link to={`/baterias/${product.slug}`} className="relative block aspect-[4/3] bg-estrela-card overflow-hidden">
        {hasValidImage ? (
          <img
            src={coverImage}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-neutral-900 via-estrela-card to-neutral-950 p-6 text-center select-none group-hover:border-estrela-red/30 transition">
            <div className="w-16 h-11 border-2 border-dashed border-white/20 rounded-md flex flex-col items-center justify-center relative mb-2.5">
              <div className="absolute -top-1.5 flex gap-4">
                <span className="w-2.5 h-1.5 bg-white/30 rounded-t-sm" />
                <span className="w-2.5 h-1.5 bg-white/30 rounded-t-sm" />
              </div>
              <span className="text-[10px] font-black text-estrela-red tracking-wider uppercase">
                {product.brand}
              </span>
            </div>
            <span className="text-xs font-bold text-estrela-gray-300 tracking-wider uppercase">
              Imagem produto
            </span>
            <span className="text-[11px] text-estrela-gray-500 mt-0.5 line-clamp-1">
              {product.name}
            </span>
          </div>
        )}

        {/* Badges superiores funcionais */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {product.isFeatured && (
            <span className="bg-estrela-red text-white text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow">
              Destaque
            </span>
          )}
          {product.technology !== 'SLI' && (
            <span className="bg-amber-500 text-black text-[11px] font-extrabold uppercase px-2 py-0.5 rounded shadow flex items-center gap-1">
              <Zap className="w-3 h-3 fill-current" />
              {product.technology}
            </span>
          )}
        </div>

        {/* Amperagem em destaque */}
        <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-sm border border-white/15 text-white font-extrabold text-sm px-2.5 py-1 rounded shadow flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 text-estrela-red fill-estrela-red" />
          {product.amperageAh} Ah
        </div>
      </Link>

      {/* Conteúdo Técnico */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Marca e SKU */}
          <div className="flex items-center justify-between text-xs text-estrela-gray-400 mb-1.5">
            <span className="font-bold text-white uppercase tracking-wider">{product.brand}</span>
            {product.sku && <span className="font-mono text-estrela-gray-400">SKU: {product.sku}</span>}
          </div>

          {/* Nome */}
          <Link to={`/baterias/${product.slug}`}>
            <h3 className="text-base font-bold text-white group-hover:text-estrela-red transition line-clamp-2">
              {product.name}
            </h3>
          </Link>

          {/* Especificações resumidas limpas */}
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-estrela-gray-300 bg-estrela-card/40 p-2.5 rounded-lg border border-white/5">
            <div>
              <span className="block text-[10px] text-estrela-gray-400 uppercase">Tecnologia</span>
              <span className="font-medium text-white">{formatTechnologyLabel(product.technology)}</span>
            </div>
            {product.ccaA && (
              <div>
                <span className="block text-[10px] text-estrela-gray-400 uppercase">Corrente (CCA)</span>
                <span className="font-medium text-white">{product.ccaA} A</span>
              </div>
            )}
            <div>
              <span className="block text-[10px] text-estrela-gray-400 uppercase">Garantia</span>
              <span className="font-medium text-white flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-400" />
                {formatWarrantyLabel(product.warrantyMonths)}
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-estrela-gray-400 uppercase">Disponibilidade</span>
              <span className="font-medium text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Em Estoque
              </span>
            </div>
          </div>
        </div>

        {/* Botão de WhatsApp Oficial Verde */}
        <div className="mt-5 pt-4 border-t border-white/10">
          <button
            onClick={onConsultWhatsApp}
            className="w-full py-2.5 px-4 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 shadow-md active:scale-95"
          >
            <WhatsAppIcon className="w-4 h-4 fill-white shrink-0" />
            <span>Consultar Preço no WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
