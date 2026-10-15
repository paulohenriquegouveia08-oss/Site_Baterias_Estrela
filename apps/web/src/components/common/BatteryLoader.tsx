import React from 'react';

interface BatteryLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export const BatteryLoader: React.FC<BatteryLoaderProps> = ({
  size = 'md',
  label = 'Carregando...',
  className = '',
}) => {
  const dimensions = {
    sm: { width: 'w-10', height: 'h-5', terminal: 'w-1.5 h-2.5', text: 'text-xs' },
    md: { width: 'w-16', height: 'h-8', terminal: 'w-2 h-4', text: 'text-sm' },
    lg: { width: 'w-24', height: 'h-12', terminal: 'w-3 h-6', text: 'text-base' },
  }[size];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center p-4 gap-2.5 ${className}`}
    >
      <div className="flex items-center">
        {/* Corpo principal da bateria */}
        <div
          className={`relative ${dimensions.width} ${dimensions.height} border-2 border-white/80 rounded-md p-0.5 bg-estrela-dark overflow-hidden flex items-center shadow-lg`}
        >
          {/* Barra de carga com animação de preenchimento */}
          <div
            className="h-full rounded-sm bg-gradient-to-r from-estrela-red via-red-500 to-estrela-red transition-all duration-500 ease-out animate-charge-pulse motion-reduce:animate-none"
            style={{ width: '85%' }}
          />

          {/* Linhas indicadoras de células */}
          <div className="absolute inset-0 flex justify-evenly pointer-events-none opacity-20">
            <div className="w-[1px] h-full bg-white" />
            <div className="w-[1px] h-full bg-white" />
            <div className="w-[1px] h-full bg-white" />
          </div>
        </div>

        {/* Pólo positivo */}
        <div
          className={`${dimensions.terminal} bg-white/80 rounded-r-sm -ml-[1px]`}
        />
      </div>

      {label && (
        <span className={`${dimensions.text} font-medium text-estrela-gray-300 tracking-wide`}>
          {label}
        </span>
      )}
    </div>
  );
};
