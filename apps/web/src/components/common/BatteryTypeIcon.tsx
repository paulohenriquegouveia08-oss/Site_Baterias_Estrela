import React from 'react';

interface BatteryTypeIconProps {
  type: 'car' | 'start-stop' | 'truck' | 'moto' | string;
  className?: string;
}

/**
 * Ícone de Bateria Automotiva Convencional (Carros de Passeio)
 * Formato retangular padrão (48x36) com bornes superiores e tampa selada.
 */
export const CarBatteryIcon: React.FC<{ className?: string }> = ({ className = 'w-10 h-8 text-estrela-red' }) => (
  <svg
    viewBox="0 0 52 38"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Bateria de Carro Leve"
  >
    {/* Terminais (Pólos) */}
    <rect x="8" y="2" width="7" height="5" rx="1.5" fill="#9CA3AF" />
    <rect x="37" y="2" width="7" height="5" rx="1.5" fill="#EF4444" />
    {/* Marcadores de Polaridade */}
    <line x1="10" y1="4.5" x2="13" y2="4.5" stroke="#1F2937" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="39" y1="4.5" x2="42" y2="4.5" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="40.5" y1="3" x2="40.5" y2="6" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />

    {/* Tampa superior da bateria */}
    <rect x="3" y="6" width="46" height="5" rx="2" fill="currentColor" fillOpacity="0.85" />

    {/* Corpo principal da bateria (proporção de carro de passeio) */}
    <rect x="4" y="10" width="44" height="25" rx="2.5" fill="currentColor" />

    {/* Frisos e detalhes laterais de reforço */}
    <rect x="7" y="14" width="38" height="18" rx="1.5" fill="#111827" fillOpacity="0.4" />
    <line x1="16" y1="16" x2="16" y2="30" stroke="#FFFFFF" strokeOpacity="0.15" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="26" y1="16" x2="26" y2="30" stroke="#FFFFFF" strokeOpacity="0.15" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="36" y1="16" x2="36" y2="30" stroke="#FFFFFF" strokeOpacity="0.15" strokeWidth="1.5" strokeLinecap="round" />

    {/* Alça de transporte retrátil */}
    <path
      d="M13 11 C13 8, 39 8, 39 11"
      stroke="#FFFFFF"
      strokeOpacity="0.3"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

/**
 * Ícone de Bateria Start-Stop (EFB / AGM)
 * Formato de carro com o RAIO elétrico em destaque no centro.
 */
export const StartStopBatteryIcon: React.FC<{ className?: string }> = ({ className = 'w-10 h-8 text-estrela-red' }) => (
  <svg
    viewBox="0 0 52 38"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Bateria Start-Stop com Raio"
  >
    {/* Terminais Blindados */}
    <rect x="8" y="2" width="7" height="5" rx="1.5" fill="#9CA3AF" />
    <rect x="37" y="2" width="7" height="5" rx="1.5" fill="#EF4444" />
    {/* Polaridades */}
    <line x1="10" y1="4.5" x2="13" y2="4.5" stroke="#1F2937" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="39" y1="4.5" x2="42" y2="4.5" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="40.5" y1="3" x2="40.5" y2="6" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />

    {/* Tampa com degrau de vedação reforçada (AGM/EFB) */}
    <rect x="3" y="6" width="46" height="5" rx="2" fill="currentColor" fillOpacity="0.9" />

    {/* Corpo da bateria */}
    <rect x="4" y="10" width="44" height="25" rx="2.5" fill="currentColor" />

    {/* Fundo interno escuro */}
    <rect x="7" y="14" width="38" height="18" rx="1.5" fill="#0A0A0A" fillOpacity="0.6" />

    {/* Raio Elétrico Central em Destaque */}
    <path
      d="M28 15 L20 23 L25.5 23 L23 31 L32 22 L26.5 22 Z"
      fill="#FBBF24"
      stroke="#F59E0B"
      strokeWidth="0.8"
      strokeLinejoin="round"
      className="drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]"
    />
  </svg>
);

/**
 * Ícone de Bateria de Caminhão / Linha Pesada (100Ah a 220Ah)
 * Formato visivelmente mais LARGO e ALONGADO (proporção 64x30), com alças laterais
 * robustas e as tampas de células dos pesados.
 */
export const TruckBatteryIcon: React.FC<{ className?: string }> = ({ className = 'w-14 h-8 text-estrela-red' }) => (
  <svg
    viewBox="0 0 68 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Bateria de Caminhão e Pesados"
  >
    {/* Pólos de Alta Corrente */}
    <rect x="10" y="3" width="7" height="4" rx="1" fill="#9CA3AF" />
    <rect x="51" y="3" width="7" height="4" rx="1" fill="#EF4444" />

    {/* Tampas de Respiro dos 6 Vasos de Caminhão */}
    <circle cx="21" cy="6" r="2" fill="#374151" stroke="#111827" strokeWidth="0.8" />
    <circle cx="27" cy="6" r="2" fill="#374151" stroke="#111827" strokeWidth="0.8" />
    <circle cx="34" cy="6" r="2" fill="#374151" stroke="#111827" strokeWidth="0.8" />
    <circle cx="41" cy="6" r="2" fill="#374151" stroke="#111827" strokeWidth="0.8" />
    <circle cx="47" cy="6" r="2" fill="#374151" stroke="#111827" strokeWidth="0.8" />

    {/* Tampa superior alongada de Linha Pesada */}
    <rect x="5" y="7" width="58" height="5" rx="1.5" fill="currentColor" fillOpacity="0.85" />

    {/* Corpo Largo e Robusto de Caminhão */}
    <rect x="6" y="11" width="56" height="21" rx="2" fill="currentColor" />

    {/* Frisos reforçados estruturais de bateria pesada */}
    <rect x="9" y="14" width="50" height="15" rx="1" fill="#111827" fillOpacity="0.45" />
    <line x1="19" y1="15" x2="19" y2="28" stroke="#FFFFFF" strokeOpacity="0.15" strokeWidth="1.2" />
    <line x1="29" y1="15" x2="29" y2="28" stroke="#FFFFFF" strokeOpacity="0.15" strokeWidth="1.2" />
    <line x1="39" y1="15" x2="39" y2="28" stroke="#FFFFFF" strokeOpacity="0.15" strokeWidth="1.2" />
    <line x1="49" y1="15" x2="49" y2="28" stroke="#FFFFFF" strokeOpacity="0.15" strokeWidth="1.2" />

    {/* Alças de Transporte Laterais de Bateria Pesada */}
    <path
      d="M3 13 C1 13, 1 23, 3 23"
      stroke="#9CA3AF"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M65 13 C67 13, 67 23, 65 23"
      stroke="#9CA3AF"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

/**
 * Ícone de Bateria de Moto
 * Formato visivelmente MENOR, VERTICAL e COMPACTO (proporção 30x38), com bornes
 * frontais quadrados de fixação por parafuso típicos de motocicletas.
 */
export const MotoBatteryIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-8 text-estrela-red' }) => (
  <svg
    viewBox="0 0 34 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Bateria de Moto Compacta"
  >
    {/* Bornes Quadrados Tipo Parafuso de Motocicleta */}
    <rect x="5" y="2" width="6" height="5" rx="1" fill="#9CA3AF" />
    <circle cx="8" cy="4.5" r="1" fill="#1F2937" />

    <rect x="23" y="2" width="6" height="5" rx="1" fill="#EF4444" />
    <circle cx="26" cy="4.5" r="1" fill="#FFFFFF" />

    {/* Tampa de Moto Compacta */}
    <rect x="3" y="6" width="28" height="5" rx="1.5" fill="currentColor" fillOpacity="0.85" />

    {/* Corpo Vertical Compacto */}
    <rect x="4" y="10" width="26" height="26" rx="2" fill="currentColor" />

    {/* Painel Frontal Estreito de Moto */}
    <rect x="6" y="13" width="22" height="20" rx="1" fill="#111827" fillOpacity="0.45" />

    {/* Linha Indicadora de Eletrólito (UPPER / LOWER LEVEL) de Bateria de Moto */}
    <line x1="8" y1="17" x2="26" y2="17" stroke="#EF4444" strokeOpacity="0.7" strokeWidth="1" strokeDasharray="2 1" />
    <line x1="8" y1="21" x2="26" y2="21" stroke="#9CA3AF" strokeOpacity="0.5" strokeWidth="0.8" strokeDasharray="2 1" />

    {/* Mini indicador central */}
    <circle cx="17" cy="27" r="2" fill="#FBBF24" fillOpacity="0.9" />
  </svg>
);

/**
 * Seletor Dinâmico por Tipo ou Slug de Categoria
 */
export const BatteryTypeIcon: React.FC<BatteryTypeIconProps> = ({ type, className }) => {
  const normalized = (type || '').toLowerCase();

  if (normalized.includes('moto')) {
    return <MotoBatteryIcon className={className || 'w-7 h-8 text-estrela-red'} />;
  }

  if (normalized.includes('caminh') || normalized.includes('pesad') || normalized.includes('truck')) {
    return <TruckBatteryIcon className={className || 'w-12 h-7 text-estrela-red'} />;
  }

  if (normalized.includes('start') || normalized.includes('stop') || normalized.includes('efb') || normalized.includes('agm')) {
    return <StartStopBatteryIcon className={className || 'w-9 h-7 text-estrela-red'} />;
  }

  // Padrão: Bateria de Carro Leve
  return <CarBatteryIcon className={className || 'w-9 h-7 text-estrela-red'} />;
};
