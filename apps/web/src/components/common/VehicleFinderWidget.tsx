import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import {
  PublicVehicleMake,
  PublicVehicleModel,
  PublicVehicleVariant,
  PublicProduct,
  buildWhatsAppProductMessage,
  buildWhatsAppLink,
} from '@baterias-estrela/shared';
import { ProductCard } from './ProductCard';
import { BatteryLoader } from './BatteryLoader';
import { useSite } from '../../contexts/SiteContext';
import { trackEvent, handleWhatsAppClick } from '../../lib/analytics';
import { Search, RotateCcw, AlertTriangle, MessageCircle, ChevronRight } from 'lucide-react';

interface VehicleFinderWidgetProps {
  initialCompact?: boolean;
}

export const VehicleFinderWidget: React.FC<VehicleFinderWidgetProps> = () => {
  const { defaultWhatsApp } = useSite();

  const [selectedMakeId, setSelectedMakeId] = useState<string>('');
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');

  // 1. Busca fabricantes
  const { data: makesData, isLoading: loadingMakes } = useQuery({
    queryKey: ['vehicles-makes'],
    queryFn: () => apiFetch<{ data: PublicVehicleMake[] }>('/vehicles/makes'),
  });

  // 2. Busca modelos quando fabricante selecionado
  const { data: modelsData, isLoading: loadingModels } = useQuery({
    queryKey: ['vehicles-models', selectedMakeId],
    queryFn: () => apiFetch<{ data: PublicVehicleModel[] }>(`/vehicles/models?makeId=${selectedMakeId}`),
    enabled: !!selectedMakeId,
  });

  // 3. Busca variantes quando modelo selecionado
  const { data: variantsData, isLoading: loadingVariants } = useQuery({
    queryKey: ['vehicles-variants', selectedModelId, selectedYear],
    queryFn: () => {
      let url = `/vehicles/variants?modelId=${selectedModelId}`;
      if (selectedYear) url += `&year=${selectedYear}`;
      return apiFetch<{ data: PublicVehicleVariant[] }>(url);
    },
    enabled: !!selectedModelId,
  });

  // 4. Busca produtos compatíveis quando variante selecionada
  const {
    data: compatibilityData,
    isLoading: loadingCompatibilities,
    isError: errorCompatibilities,
  } = useQuery({
    queryKey: ['vehicle-compatibility', selectedVariantId],
    queryFn: () => apiFetch<{
      matched: boolean;
      count: number;
      vehicle: any;
      products: PublicProduct[];
      message: string;
    }>(`/vehicles/variants/${selectedVariantId}/products`),
    enabled: !!selectedVariantId,
  });

  // Rastreia evento analítico ao consultar compatibilidade
  useEffect(() => {
    if (compatibilityData && selectedVariantId) {
      trackEvent('vehicle_search', {
        path: window.location.pathname,
        metadata: {
          variantId: selectedVariantId,
          vehicleFullName: compatibilityData.vehicle?.fullName,
          matchedCount: compatibilityData.count,
        },
      });

      trackEvent('compatibility_result', {
        path: window.location.pathname,
        metadata: {
          matched: compatibilityData.matched,
          count: compatibilityData.count,
        },
      });
    }
  }, [compatibilityData, selectedVariantId]);

  const resetAll = () => {
    setSelectedMakeId('');
    setSelectedModelId('');
    setSelectedYear('');
    setSelectedVariantId('');
  };

  const selectedMake = makesData?.data.find((m) => m.id === selectedMakeId);
  const selectedModel = modelsData?.data.find((m) => m.id === selectedModelId);
  const selectedVariant = variantsData?.data.find((v) => v.id === selectedVariantId);

  // Anos para seleção
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => String(currentYear - i));

  const vehicleSummaryName = [
    selectedMake?.name,
    selectedModel?.name,
    selectedYear,
    selectedVariant?.name,
  ]
    .filter(Boolean)
    .join(' ');

  const handleConsultVehicleWhatsApp = () => {
    const msg = buildWhatsAppProductMessage({
      productName: 'Bateria adequada para meu veículo',
      vehicleName: vehicleSummaryName || 'Veículo não listado no site',
      customNotes: 'Não localizei o modelo exato no catálogo e gostaria de conferir a amperagem original recomendada.',
    });
    const url = buildWhatsAppLink(defaultWhatsApp.number, msg);
    handleWhatsAppClick(url, {
      path: window.location.pathname,
      metadata: { action: 'unmatched_vehicle_whatsapp_click', vehicle: vehicleSummaryName },
    });
  };

  return (
    <div className="w-full bg-estrela-dark border border-estrela-card rounded-2xl p-6 sm:p-8 shadow-2xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-estrela-red font-bold text-xs uppercase tracking-wider mb-1">
            <Search className="w-4 h-4" />
            <span>Busca Técnica Inteligente</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            Encontre a Bateria Certa para o seu Veículo
          </h2>
          <p className="text-sm text-estrela-gray-400 mt-1">
            Recomendamos apenas modelos com compatibilidade técnica, amperagem e pólos validados em catálogo.
          </p>
        </div>

        {(selectedMakeId || selectedModelId || selectedVariantId) && (
          <button
            onClick={resetAll}
            className="flex items-center gap-1.5 text-xs text-estrela-gray-400 hover:text-estrela-red transition font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Limpar Busca
          </button>
        )}
      </div>

      {/* Seletor Passo a Passo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Passo 1: Fabricante */}
        <div>
          <label className="block text-xs font-semibold text-estrela-gray-300 uppercase tracking-wider mb-2">
            1. Fabricante (Montadora)
          </label>
          <select
            value={selectedMakeId}
            onChange={(e) => {
              setSelectedMakeId(e.target.value);
              setSelectedModelId('');
              setSelectedVariantId('');
            }}
            className="w-full bg-estrela-card border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-estrela-red transition cursor-pointer"
          >
            <option value="">Selecione o fabricante...</option>
            {loadingMakes ? (
              <option disabled>Carregando...</option>
            ) : (
              makesData?.data.map((make) => (
                <option key={make.id} value={make.id}>
                  {make.name}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Passo 2: Modelo */}
        <div>
          <label className="block text-xs font-semibold text-estrela-gray-300 uppercase tracking-wider mb-2">
            2. Modelo do Carro
          </label>
          <select
            value={selectedModelId}
            disabled={!selectedMakeId || loadingModels}
            onChange={(e) => {
              setSelectedModelId(e.target.value);
              setSelectedVariantId('');
            }}
            className="w-full bg-estrela-card border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-estrela-red transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <option value="">
              {!selectedMakeId ? 'Aguardando fabricante...' : loadingModels ? 'Carregando modelos...' : 'Selecione o modelo...'}
            </option>
            {modelsData?.data.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </div>

        {/* Passo 3: Ano (Opcional para filtrar versões) */}
        <div>
          <label className="block text-xs font-semibold text-estrela-gray-300 uppercase tracking-wider mb-2">
            3. Ano de Fabricação
          </label>
          <select
            value={selectedYear}
            disabled={!selectedModelId}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              setSelectedVariantId('');
            }}
            className="w-full bg-estrela-card border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-estrela-red transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <option value="">Qualquer ano</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Passo 4: Motorização / Versão */}
        <div>
          <label className="block text-xs font-semibold text-estrela-gray-300 uppercase tracking-wider mb-2">
            4. Versão / Motorização
          </label>
          <select
            value={selectedVariantId}
            disabled={!selectedModelId || loadingVariants}
            onChange={(e) => setSelectedVariantId(e.target.value)}
            className="w-full bg-estrela-card border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-estrela-red transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <option value="">
              {!selectedModelId
                ? 'Aguardando modelo...'
                : loadingVariants
                ? 'Carregando versões...'
                : 'Selecione a versão/motor...'}
            </option>
            {variantsData?.data.map((variant) => (
              <option key={variant.id} value={variant.id}>
                {variant.name} ({variant.yearStart}{variant.yearEnd ? `-${variant.yearEnd}` : '+'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Estados e Resultados da Busca */}
      <div className="mt-8">
        {loadingCompatibilities && (
          <div className="py-12">
            <BatteryLoader size="lg" label="Cruzando especificações técnicas com nosso banco de dados..." />
          </div>
        )}

        {errorCompatibilities && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-800 text-red-200 text-sm flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-estrela-red" />
            <span>Ocorreu um erro ao consultar as compatibilidades. Tente novamente ou consulte pelo WhatsApp.</span>
          </div>
        )}

        {compatibilityData && !loadingCompatibilities && (
          <div>
            {compatibilityData.matched ? (
              <div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs text-estrela-gray-400 uppercase font-semibold">Veículo Selecionado</span>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      {compatibilityData.vehicle.fullName}
                    </h3>
                    {compatibilityData.vehicle.technicalNotes && (
                      <p className="text-xs text-estrela-gray-300 mt-1">
                        <strong>Nota técnica:</strong> {compatibilityData.vehicle.technicalNotes}
                      </p>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1.5 rounded-lg shrink-0">
                    {compatibilityData.count} bateria(s) compatível(is)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {compatibilityData.products.map((prod) => (
                    <ProductCard key={prod.id} product={prod} vehicleName={compatibilityData.vehicle.fullName} />
                  ))}
                </div>
              </div>
            ) : (
              /* Caso NÃO haja compatibilidade cadastrada / validada */
              <div className="p-6 sm:p-8 rounded-2xl bg-estrela-card/60 border border-white/10 text-center max-w-2xl mx-auto space-y-4">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  Não foi possível confirmar a compatibilidade exata
                </h3>
                <p className="text-sm text-estrela-gray-300">
                  Para o veículo <strong>{vehicleSummaryName}</strong>, não possuímos compatibilidade validada com 100% de precisão em nosso catálogo automático. Por segurança e para não indicar amperagem incorreta, nossa equipe técnica em Arapongas fará a verificação manual da bateria original instalada.
                </p>
                <div className="pt-2">
                  <button
                    onClick={handleConsultVehicleWhatsApp}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-estrela-red hover:bg-estrela-red-hover text-white text-sm font-bold shadow-lg shadow-estrela-red/20 transition active:scale-95"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>Consultar Técnico pelo WhatsApp</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
