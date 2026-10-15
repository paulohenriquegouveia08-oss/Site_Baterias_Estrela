import React, { useEffect } from 'react';
import { VehicleFinderWidget } from '../../components/common/VehicleFinderWidget';
import { trackEvent } from '../../lib/analytics';
import { Car, Zap, CheckCircle2 } from 'lucide-react';

export const VehicleFinderPage: React.FC = () => {
  useEffect(() => {
    trackEvent('page_view', { path: '/encontrar-bateria' });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-estrela-dark border border-white/10 text-xs font-semibold text-estrela-red mb-3">
          <Car className="w-3.5 h-3.5" />
          <span>Catálogo Técnico de Aplicação</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Encontre a Bateria Exata para o seu Veículo
        </h1>
        <p className="text-sm text-estrela-gray-300 mt-2 leading-relaxed">
          Evite erros comuns de amperagem insuficiente, dimensões incompatíveis com a bandeja ou polaridade invertida. Selecione seu veículo abaixo para ver modelos 100% recomendados.
        </p>
      </div>

      <VehicleFinderWidget />

      {/* Dicas Técnicas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-estrela-dark">
        <div className="bg-estrela-dark border border-estrela-card rounded-xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-estrela-red font-bold text-sm">
            <Zap className="w-4 h-4" />
            <span>Sistema Start-Stop</span>
          </div>
          <p className="text-xs text-estrela-gray-300 leading-relaxed">
            Veículos com Start-Stop (que desligam o motor nas paradas) exigem baterias com tecnologia <strong>EFB</strong> ou <strong>AGM</strong>. A instalação de baterias convencionais nesses carros anula a garantia e pode travar a eletrônica.
          </p>
        </div>

        <div className="bg-estrela-dark border border-estrela-card rounded-xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-estrela-red font-bold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>Polaridade dos Pólos</span>
          </div>
          <p className="text-xs text-estrela-gray-300 leading-relaxed">
            A maioria dos carros nacionais utiliza pólo positivo direito (D), mas vários modelos utilizam pólo positivo esquerdo (E). Nosso sistema valida a posição exata para não esticar os cabos originais.
          </p>
        </div>

        <div className="bg-estrela-dark border border-estrela-card rounded-xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-estrela-red font-bold text-sm">
            <Car className="w-4 h-4" />
            <span>Bancos de Memória OBD</span>
          </div>
          <p className="text-xs text-estrela-gray-300 leading-relaxed">
            Na troca realizada pela Baterias Estrela em Arapongas, conectamos uma fonte auxiliar durante a substituição para que o rádio, vidros elétricos e parâmetros de injeção não desconfigurem.
          </p>
        </div>
      </div>
    </div>
  );
};
