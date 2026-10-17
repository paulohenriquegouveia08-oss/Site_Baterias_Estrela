import React from 'react';

export interface BrandItem {
  id: string;
  name: string;
  logo: string;
  heightClass?: string;
}

export const OFFICIAL_BRANDS: BrandItem[] = [
  { id: 'moura', name: 'Baterias Moura', logo: '/brands/moura.png', heightClass: 'h-10 sm:h-12' },
  { id: 'zetta', name: 'Baterias Zetta', logo: '/brands/zetta.png', heightClass: 'h-9 sm:h-11' },
  { id: 'heliar', name: 'Baterias Heliar', logo: '/brands/heliar.png', heightClass: 'h-8 sm:h-10' },
  { id: 'pioneiro', name: 'Pioneiro Baterias', logo: '/brands/pioneiro.png', heightClass: 'h-8 sm:h-9' },
  { id: 'eletran', name: 'Baterias Eletran', logo: '/brands/eletran.png', heightClass: 'h-9 sm:h-11' },
];

export const BrandMarquee: React.FC = () => {
  // Duplicamos os itens 4 vezes para garantir transição contínua e sem quebras em telas ultrawide
  const marqueeList = [...OFFICIAL_BRANDS, ...OFFICIAL_BRANDS, ...OFFICIAL_BRANDS, ...OFFICIAL_BRANDS];

  return (
    <section className="relative w-full bg-estrela-dark/80 border-y border-white/10 py-6 overflow-hidden select-none">
      {/* Gradientes laterais de fade suave */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-estrela-black to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-estrela-black to-transparent z-10" />

      <div className="max-w-7xl mx-auto px-4 mb-3 flex items-center justify-center">
        <span className="text-[11px] sm:text-xs font-bold text-estrela-gray-400 uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-estrela-red animate-pulse" />
          <span>Principais Marcas Homologadas com Garantia de Fábrica</span>
          <span className="w-2 h-2 rounded-full bg-estrela-red animate-pulse" />
        </span>
      </div>

      {/* Faixa animada passando continuamente da direita para a esquerda */}
      <div className="flex overflow-hidden">
        <div className="animate-marquee flex items-center gap-12 sm:gap-20 py-2">
          {marqueeList.map((brand, index) => (
            <div
              key={`${brand.id}-${index}`}
              className="flex items-center justify-center shrink-0 grayscale hover:grayscale-0 opacity-80 hover:opacity-100 transition duration-300 transform hover:scale-105"
              title={brand.name}
            >
              <img
                src={brand.logo}
                alt={brand.name}
                className={`${brand.heightClass || 'h-9 sm:h-11'} w-auto object-contain max-w-[150px] sm:max-w-[180px] drop-shadow-md`}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
