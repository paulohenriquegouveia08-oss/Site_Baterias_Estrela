import React, { useState, useEffect } from 'react';
import { useSite } from '../../contexts/SiteContext';
import { buildWhatsAppRescueMessage, buildWhatsAppLink, buildTelLink, formatPhoneNumber } from '@baterias-estrela/shared';
import { trackEvent, handleWhatsAppClick, handlePhoneClick } from '../../lib/analytics';
import {
  ShieldAlert,
  Phone,
  MessageCircle,
  MapPin,
  Compass,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export const RescuePage: React.FC = () => {
  const { footerWhatsApp, headerPhone } = useSite();

  const [problemType, setProblemType] = useState('Bateria arriada / sem partida');
  const [vehicle, setVehicle] = useState('');
  const [description, setDescription] = useState('');
  const [addressReference, setAddressReference] = useState('');
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    trackEvent('page_view', { path: '/socorro' });
  }, []);

  const handleShareGps = () => {
    if (!navigator.geolocation) {
      setLocationError('Seu navegador não suporta compartilhamento de geolocalização.');
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
          setLocationError('Permissão de localização negada pelo usuário.');
        } else {
          setLocationError('Não foi possível obter sua localização exata. Preencha o ponto de referência.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleTriggerRescue = () => {
    const msg = buildWhatsAppRescueMessage({
      problemType,
      vehicle: vehicle || undefined,
      description: description || undefined,
      latitude: gpsLocation?.lat,
      longitude: gpsLocation?.lng,
      addressReference: addressReference || undefined,
    });

    const url = buildWhatsAppLink(footerWhatsApp, msg);
    handleWhatsAppClick(url, {
      path: '/socorro',
      metadata: { action: 'rescue_whatsapp_trigger', problemType, vehicle },
    });
  };

  const handleEmergencyCall = () => {
    handlePhoneClick(buildTelLink(headerPhone), { path: '/socorro', metadata: { action: 'rescue_phone_call' } });
  };

  const problemOptions = [
    'Bateria arriada / sem partida',
    'Carro apagou no trânsito / parado na rua',
    'Luz da bateria acesa no painel (possível alternador)',
    'Estalo ao dar a partida sem girar o motor',
    'Outro problema elétrico emergencial',
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Banner Emergencial */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-red-950 via-estrela-dark to-estrela-dark border border-estrela-red/50 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-estrela-red text-white text-xs font-bold uppercase tracking-wider animate-pulse">
              <ShieldAlert className="w-4 h-4" />
              <span>Plantão de Socorro Automotivo</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              O Carro Parou? Nós Levamos a Bateria até Você
            </h1>
            <p className="text-xs sm:text-sm text-estrela-gray-300">
              Atendimento em domicílio, garagem, estacionamentos e vias públicas em Arapongas.
            </p>
          </div>

          <button
            onClick={handleEmergencyCall}
            className="px-5 py-3 rounded-xl bg-white hover:bg-estrela-gray-100 text-estrela-black font-extrabold text-sm transition flex items-center gap-2 shrink-0 shadow-lg active:scale-95"
          >
            <Phone className="w-4 h-4 text-estrela-red" />
            <span>Ligar Agora ({formatPhoneNumber(headerPhone)})</span>
          </button>
        </div>
      </div>

      {/* Formulário Interativo de Socorro */}
      <div className="bg-estrela-dark border border-estrela-card rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div>
          <h2 className="text-lg font-bold text-white mb-1">Dados para Envio do Socorro</h2>
          <p className="text-xs text-estrela-gray-400">
            Preencha os campos abaixo para que nossa equipe saia com o modelo correto e as ferramentas necessárias.
          </p>
        </div>

        {/* 1. Tipo de Problema */}
        <div>
          <label className="block text-xs font-semibold text-estrela-gray-300 uppercase tracking-wider mb-2">
            1. Qual o problema que está acontecendo? *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {problemOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setProblemType(opt)}
                className={`text-left text-xs p-3 rounded-lg border transition ${
                  problemType === opt
                    ? 'border-estrela-red bg-estrela-red/15 text-white font-bold'
                    : 'border-white/10 bg-estrela-card text-estrela-gray-300 hover:border-white/30'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Veículo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-estrela-gray-300 uppercase tracking-wider mb-1.5">
              2. Modelo e Ano do Veículo
            </label>
            <input
              type="text"
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              placeholder="Ex: Fiat Strada 1.4 2019"
              className="w-full bg-estrela-card border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-estrela-gray-500 focus:outline-none focus:border-estrela-red"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-estrela-gray-300 uppercase tracking-wider mb-1.5">
              3. Ponto de Referência em Arapongas
            </label>
            <input
              type="text"
              value={addressReference}
              onChange={(e) => setAddressReference(e.target.value)}
              placeholder="Ex: Av. Arapongas em frente ao banco / Bairro Industrial"
              className="w-full bg-estrela-card border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-estrela-gray-500 focus:outline-none focus:border-estrela-red"
            />
          </div>
        </div>

        {/* 3. Compartilhamento opcional de GPS */}
        <div className="bg-estrela-card/60 border border-white/10 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-estrela-red" />
              Compartilhar Localização GPS Exata (Opcional)
            </span>
            {gpsLocation && (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Localização Capturada!
              </span>
            )}
          </div>

          <p className="text-xs text-estrela-gray-400">
            Facilita a rota do socorrista até o local exato onde seu carro está parado. O navegador solicitará sua autorização.
          </p>

          <button
            type="button"
            onClick={handleShareGps}
            disabled={gettingLocation}
            className="px-4 py-2 rounded-lg bg-estrela-dark hover:bg-white/10 border border-white/20 text-xs text-white font-semibold flex items-center gap-2 transition"
          >
            <MapPin className="w-3.5 h-3.5 text-estrela-red" />
            <span>{gettingLocation ? 'Obtendo GPS...' : gpsLocation ? 'Atualizar Minha Posição' : 'Autorizar e Compartilhar Localização'}</span>
          </button>

          {locationError && (
            <p className="text-xs text-amber-400">{locationError}</p>
          )}
        </div>

        {/* Detalhes opcionais */}
        <div>
          <label className="block text-xs font-semibold text-estrela-gray-300 uppercase tracking-wider mb-1.5">
            4. Detalhes Adicionais (Opcional)
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Luz do painel enfraqueceu e fez barulho de tec-tec."
            className="w-full bg-estrela-card border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-estrela-gray-500 focus:outline-none focus:border-estrela-red"
          />
        </div>

        {/* Botão de Envio WhatsApp com mensagem pronta */}
        <div className="pt-2">
          <button
            onClick={handleTriggerRescue}
            className="w-full py-4 px-6 rounded-xl bg-estrela-red hover:bg-estrela-red-hover text-white text-base font-extrabold transition flex items-center justify-center gap-3 shadow-xl shadow-estrela-red/30 active:scale-95"
          >
            <MessageCircle className="w-5 h-5 fill-white" />
            <span>Enviar Pedido de Socorro pelo WhatsApp</span>
          </button>
        </div>

        {/* Nota de transparência técnica */}
        <div className="p-4 rounded-xl bg-estrela-card/40 border border-white/5 flex items-start gap-3 text-xs text-estrela-gray-400">
          <Clock className="w-4 h-4 text-estrela-gray-400 shrink-0 mt-0.5" />
          <span>
            <strong>Informação importante:</strong> O tempo exato de deslocamento dependerá do trânsito e da disponibilidade no momento do acionamento. Nossa equipe informará a previsão realista assim que responder sua mensagem no WhatsApp.
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
          <li>Não tente dar "tranco" em veículos modernos com injeção eletrônica ou câmbio automático para não danificar o catalisador.</li>
        </ul>
      </div>
    </div>
  );
};
