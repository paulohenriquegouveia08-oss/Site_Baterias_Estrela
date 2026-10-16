import React, { useState, useEffect } from 'react';
import { useSite } from '../../contexts/SiteContext';
import { buildWhatsAppRescueMessage, buildWhatsAppLink, buildTelLink, formatPhoneNumber } from '@baterias-estrela/shared';
import { trackEvent, handleWhatsAppClick, handlePhoneClick } from '../../lib/analytics';
import { WhatsAppIcon } from '../../components/common/WhatsAppIcon';
import {
  ShieldAlert,
  Phone,
  MapPin,
  Compass,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Info,
} from 'lucide-react';

export const RescuePage: React.FC = () => {
  const { footerWhatsApp, headerPhone } = useSite();

  const [problemType, setProblemType] = useState('Bateria arriada / sem partida');
  const [vehicle, setVehicle] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [addressReference, setAddressReference] = useState('');
  const [description, setDescription] = useState('');
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    trackEvent('page_view', { path: '/socorro' });
  }, []);

  const handleShareGps = () => {
    if (!navigator.geolocation) {
      setLocationError('Seu navegador não suporta geolocalização.');
      return;
    }

    setGettingLocation(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setGettingLocation(false);
      },
      (err) => {
        setGettingLocation(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError('Permissão de GPS negada. Preencha seu endereço nos campos abaixo.');
        } else {
          setLocationError('Não foi possível obter o GPS com precisão. Preencha seu endereço abaixo.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleTriggerRescue = () => {
    if (!streetAddress.trim() || !neighborhood.trim()) {
      setFormError('Por favor, informe a Rua/Número e o Bairro para envio da equipe.');
      return;
    }
    setFormError('');

    const fullAddress = `${streetAddress.trim()}, Bairro ${neighborhood.trim()}${
      addressReference.trim() ? ` (Ponto de ref: ${addressReference.trim()})` : ''
    }`;

    const msg = buildWhatsAppRescueMessage({
      problemType,
      vehicle: vehicle || undefined,
      description: description || undefined,
      latitude: gpsLocation?.lat,
      longitude: gpsLocation?.lng,
      addressReference: fullAddress,
    });

    const url = buildWhatsAppLink(footerWhatsApp, msg);
    handleWhatsAppClick(url, {
      path: '/socorro',
      metadata: { action: 'rescue_whatsapp_trigger', problemType, vehicle, fullAddress },
    });
  };

  const handleEmergencyCall = () => {
    handlePhoneClick(buildTelLink(headerPhone), { path: '/socorro', metadata: { action: 'rescue_phone_call' } });
  };

  const problemOptions = [
    'Bateria arriada / sem partida',
    'Carro não liga e painel fraco/apagado',
    'Bateria descarregou (farol ou rádio ligado)',
    'Estalo ao dar a partida sem girar o motor',
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Banner Emergencial */}
      <div className="p-6 sm:p-8 rounded-2xl bg-estrela-dark border border-estrela-red/40 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-estrela-red text-white text-xs font-bold uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" />
              <span>Socorro de Bateria Automotiva</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              O Carro Não Pega? Levamos a Bateria até Você
            </h1>
            <p className="text-xs sm:text-sm text-estrela-gray-300">
              Atendimento ágil em residências, empresas, garagens e vias de Arapongas.
            </p>
            <div className="flex items-center gap-2 text-xs font-medium text-estrela-gray-400 pt-1">
              <Clock className="w-4 h-4 text-estrela-red" />
              <span>Horário do Socorro: <strong>Segunda a Sábado, das 08:00 às 19:00</strong></span>
            </div>
          </div>

          <button
            onClick={handleEmergencyCall}
            className="px-5 py-3 rounded-xl bg-white hover:bg-estrela-gray-100 text-estrela-black font-extrabold text-sm transition flex items-center gap-2 shrink-0 shadow-lg active:scale-95"
          >
            <Phone className="w-4 h-4 text-estrela-red" />
            <span>Ligar ({formatPhoneNumber(headerPhone)})</span>
          </button>
        </div>
      </div>

      {/* Alerta de Escopo de Atendimento Exclusivo */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs sm:text-sm flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white block font-bold">Importante sobre nosso atendimento móvel:</strong>
          <span>
            Nosso socorro é <strong>exclusivo para problemas de bateria</strong> (teste, carga auxiliar e substituição com bateria nova). Não realizamos reparos de mecânica pesada, motor de partida, ignição ou outros defeitos elétricos gerais.
          </span>
        </div>
      </div>

      {/* Formulário de Socorro */}
      <div className="bg-estrela-dark border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div>
          <h2 className="text-lg font-bold text-white mb-1">Preencha os Dados para Deslocamento</h2>
          <p className="text-xs text-estrela-gray-400">
            Informe o problema e o local exato onde o carro está para enviarmos o técnico com o modelo de bateria correto.
          </p>
        </div>

        {/* 1. Tipo de Problema */}
        <div>
          <label className="block text-xs font-semibold text-estrela-gray-300 uppercase tracking-wider mb-2">
            1. O que está acontecendo com a bateria? *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {problemOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setProblemType(opt)}
                className={`text-left text-xs p-3.5 rounded-lg border transition ${
                  problemType === opt
                    ? 'border-estrela-red bg-estrela-red/20 text-white font-bold'
                    : 'border-white/10 bg-estrela-card text-estrela-gray-300 hover:border-white/30'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Veículo */}
        <div>
          <label className="block text-xs font-semibold text-estrela-gray-300 uppercase tracking-wider mb-1.5">
            2. Modelo e Ano do Veículo
          </label>
          <input
            type="text"
            value={vehicle}
            onChange={(e) => setVehicle(e.target.value)}
            placeholder="Ex: Fiat Strada 1.4 2019 / Corolla 2.0 2021"
            className="w-full bg-estrela-card border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-estrela-gray-500 focus:outline-none focus:border-estrela-red"
          />
        </div>

        {/* 3. Endereço Obrigatório */}
        <div className="space-y-3 pt-2 border-t border-white/5">
          <label className="block text-xs font-semibold text-estrela-gray-300 uppercase tracking-wider">
            3. Endereço Onde o Carro Está Parado *
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="block text-[11px] text-estrela-gray-400 mb-1">Rua / Avenida e Número *</span>
              <input
                type="text"
                required
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                placeholder="Ex: Rua Taperaçu, 165"
                className="w-full bg-estrela-card border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-estrela-gray-500 focus:outline-none focus:border-estrela-red"
              />
            </div>
            <div>
              <span className="block text-[11px] text-estrela-gray-400 mb-1">Bairro *</span>
              <input
                type="text"
                required
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="Ex: Centro / Vila Sampaio / Jd. Primavera"
                className="w-full bg-estrela-card border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-estrela-gray-500 focus:outline-none focus:border-estrela-red"
              />
            </div>
          </div>

          <div>
            <span className="block text-[11px] text-estrela-gray-400 mb-1">Ponto de Referência (Opcional)</span>
            <input
              type="text"
              value={addressReference}
              onChange={(e) => setAddressReference(e.target.value)}
              placeholder="Ex: Em frente ao posto de combustível / Próximo ao supermercado"
              className="w-full bg-estrela-card border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-estrela-gray-500 focus:outline-none focus:border-estrela-red"
            />
          </div>
        </div>

        {/* 4. Compartilhamento de GPS (Opcional de apoio) */}
        <div className="bg-estrela-card/40 border border-white/10 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-estrela-red" />
              Localização GPS do Navegador (Opcional)
            </span>
            {gpsLocation && (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                GPS Capturado!
              </span>
            )}
          </div>

          <p className="text-xs text-estrela-gray-400">
            Você pode enviar o link do GPS junto ao endereço para agilizar a localização da nossa equipe.
          </p>

          <button
            type="button"
            onClick={handleShareGps}
            disabled={gettingLocation}
            className="px-4 py-2 rounded-lg bg-estrela-dark hover:bg-white/10 border border-white/20 text-xs text-white font-semibold flex items-center gap-2 transition"
          >
            <MapPin className="w-3.5 h-3.5 text-estrela-red" />
            <span>{gettingLocation ? 'Obtendo GPS...' : gpsLocation ? 'Atualizar Minha Posição' : 'Adicionar Minha Localização GPS'}</span>
          </button>

          {locationError && (
            <p className="text-xs text-amber-400">{locationError}</p>
          )}
        </div>

        {/* 5. Observação Adicional */}
        <div>
          <label className="block text-xs font-semibold text-estrela-gray-300 uppercase tracking-wider mb-1.5">
            5. Detalhes Adicionais (Opcional)
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: O carro é automático / A bateria fica embaixo do banco ou no porta-malas."
            className="w-full bg-estrela-card border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-estrela-gray-500 focus:outline-none focus:border-estrela-red"
          />
        </div>

        {formError && (
          <p className="text-xs font-bold text-estrela-red bg-estrela-red/10 p-3 rounded-lg border border-estrela-red/20">
            {formError}
          </p>
        )}

        {/* Botão de Envio WhatsApp com Cor Oficial #25D366 */}
        <div className="pt-2">
          <button
            onClick={handleTriggerRescue}
            className="w-full py-4 px-6 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-base font-extrabold transition flex items-center justify-center gap-3 shadow-xl shadow-[#25D366]/20 active:scale-95"
          >
            <WhatsAppIcon className="w-5 h-5 fill-white" />
            <span>Enviar Pedido de Socorro pelo WhatsApp</span>
          </button>
        </div>

        {/* Nota técnica */}
        <div className="p-4 rounded-xl bg-estrela-card/30 border border-white/5 flex items-start gap-3 text-xs text-estrela-gray-400">
          <Clock className="w-4 h-4 text-estrela-gray-400 shrink-0 mt-0.5" />
          <span>
            <strong>Atendimento imediato:</strong> Ao clicar no botão, uma mensagem pré-formatada com o endereço e os dados do veículo será enviada ao nosso WhatsApp de plantão para resposta rápida e confirmação do tempo de deslocamento.
          </span>
        </div>
      </div>

      {/* Dicas de Segurança para Panes */}
      <div className="bg-estrela-dark border border-white/10 rounded-xl p-6 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          Recomendações de Segurança se o carro parou na rua:
        </h3>
        <ul className="text-xs text-estrela-gray-300 space-y-1.5 list-disc pl-5 leading-relaxed">
          <li>Ligue o pisca-alerta imediatamente.</li>
          <li>Posicione o triângulo de sinalização a uma distância segura do veículo.</li>
          <li>Permaneça em local seguro, preferencialmente fora da pista ou na calçada.</li>
          <li>Em veículos modernos com injeção eletrônica ou câmbio automático, <strong>não dê tranco</strong> para evitar danos ao catalisador e à correia.</li>
        </ul>
      </div>
    </div>
  );
};
