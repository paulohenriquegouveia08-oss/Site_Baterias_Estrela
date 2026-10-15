import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import { PublicService, buildWhatsAppServiceMessage, buildWhatsAppLink } from '@baterias-estrela/shared';
import { BatteryLoader } from '../../components/common/BatteryLoader';
import { useSite } from '../../contexts/SiteContext';
import { trackEvent, handleWhatsAppClick } from '../../lib/analytics';
import {
  Truck,
  Zap,
  Gauge,
  ShieldCheck,
  Clock,
  MapPin,
  MessageCircle,
  X,
  CheckCircle2,
} from 'lucide-react';

export const ServicesPage: React.FC = () => {
  const { defaultWhatsApp } = useSite();
  const [selectedService, setSelectedService] = useState<PublicService | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Formulário de solicitação
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [notes, setNotes] = useState('');
  const [addressReference, setAddressReference] = useState('');

  useEffect(() => {
    trackEvent('page_view', { path: '/servicos' });
  }, []);

  const { data: servicesData, isLoading } = useQuery({
    queryKey: ['public-services'],
    queryFn: () => apiFetch<{ data: PublicService[] }>('/services'),
  });

  const onOpenRequestModal = (service: PublicService) => {
    setSelectedService(service);
    setFormSubmitted(false);
    setModalOpen(true);
    trackEvent('service_request_click', {
      path: '/servicos',
      serviceId: service.id,
      metadata: { serviceName: service.name },
    });
  };

  const onDirectWhatsApp = (service: PublicService) => {
    const msg = service.whatsappMessage || buildWhatsAppServiceMessage({
      serviceName: service.name,
    });
    const url = buildWhatsAppLink(defaultWhatsApp.number, msg);
    handleWhatsAppClick(url, {
      path: '/servicos',
      serviceId: service.id,
      metadata: { action: 'service_whatsapp_click', serviceName: service.name },
    });
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    setSubmitting(true);
    try {
      await apiFetch('/service-requests', {
        method: 'POST',
        body: JSON.stringify({
          name,
          phone,
          serviceId: selectedService?.id || null,
          vehicle: vehicle || null,
          notes: notes || null,
          addressReference: addressReference || null,
        }),
      });

      trackEvent('service_form_submit', {
        path: '/servicos',
        serviceId: selectedService?.id || null,
        metadata: { serviceName: selectedService?.name },
      });

      setFormSubmitted(true);
    } catch {
      alert('Falha ao registrar solicitação. Por favor entre em contato direto pelo WhatsApp.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <div className="max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Serviços Automotivos</h1>
        <p className="text-sm text-estrela-gray-300 mt-2 leading-relaxed">
          Atendimento ágil, transparente e seguro em Arapongas e municípios vizinhos. Conte com nossos profissionais treinados e ferramentas homologadas.
        </p>
      </div>

      {isLoading ? (
        <div className="py-20">
          <BatteryLoader label="Carregando serviços..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {servicesData?.data.map((service) => (
            <div
              key={service.id}
              className="bg-estrela-dark border border-estrela-card hover:border-estrela-red/40 rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition shadow-xl"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-estrela-card border border-white/5 flex items-center justify-center text-estrela-red shadow-inner">
                    {service.iconName === 'Zap' ? <Zap className="w-7 h-7" /> :
                     service.iconName === 'Truck' ? <Truck className="w-7 h-7" /> :
                     service.iconName === 'Gauge' ? <Gauge className="w-7 h-7" /> :
                     <ShieldCheck className="w-7 h-7" />}
                  </div>

                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Ativo em Arapongas
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{service.name}</h3>
                  <p className="text-sm text-estrela-gray-300 leading-relaxed">{service.description}</p>
                </div>

                <div className="space-y-2 pt-2 text-xs text-estrela-gray-400 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-estrela-red shrink-0" />
                    <span>Região: <strong>{service.regionServed}</strong></span>
                  </div>
                  {service.workingHours && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-estrela-red shrink-0" />
                      <span>Horários: {service.workingHours}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-estrela-card flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => onDirectWhatsApp(service)}
                  className="flex-1 py-3 px-4 rounded-xl bg-estrela-red hover:bg-estrela-red-hover text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>{service.ctaText || 'Solicitar via WhatsApp'}</span>
                </button>

                <button
                  onClick={() => onOpenRequestModal(service)}
                  className="py-3 px-4 rounded-xl bg-estrela-card hover:bg-white/10 text-white text-xs font-semibold transition"
                >
                  Preencher Formulário
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DE SOLICITAÇÃO DE ATENDIMENTO */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-estrela-dark border border-estrela-card rounded-2xl w-full max-w-lg p-6 sm:p-8 relative shadow-2xl">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-estrela-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {formSubmitted ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">Solicitação Enviada!</h3>
                <p className="text-sm text-estrela-gray-300">
                  Recebemos seus dados com sucesso. Nossa equipe entrará em contato pelo telefone informado em poucos instantes.
                </p>
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-6 py-2.5 rounded-lg bg-estrela-red text-white text-xs font-bold"
                >
                  Fechar
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitRequest} className="space-y-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-estrela-red">
                    Solicitar Serviço
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">
                    {selectedService?.name || 'Atendimento'}
                  </h3>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-estrela-gray-300 mb-1">Seu Nome *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: João da Silva"
                    className="w-full bg-estrela-card border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-estrela-red"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-estrela-gray-300 mb-1">Seu WhatsApp / Telefone *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ex: (43) 99999-9999"
                    className="w-full bg-estrela-card border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-estrela-red"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-estrela-gray-300 mb-1">Veículo (Modelo e Ano)</label>
                  <input
                    type="text"
                    value={vehicle}
                    onChange={(e) => setVehicle(e.target.value)}
                    placeholder="Ex: Gol 1.6 2018"
                    className="w-full bg-estrela-card border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-estrela-red"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-estrela-gray-300 mb-1">Endereço / Ponto de Referência em Arapongas</label>
                  <input
                    type="text"
                    value={addressReference}
                    onChange={(e) => setAddressReference(e.target.value)}
                    placeholder="Ex: Próximo à Igreja Matriz / Bairro Industrial"
                    className="w-full bg-estrela-card border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-estrela-red"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-estrela-gray-300 mb-1">Observações Adicionais</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ex: Carro não dá sinal de partida na chave."
                    className="w-full bg-estrela-card border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-estrela-red"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 py-2.5 rounded-lg border border-white/10 text-white text-xs font-medium hover:bg-white/5"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2.5 rounded-lg bg-estrela-red hover:bg-estrela-red-hover text-white text-xs font-bold transition disabled:opacity-50"
                  >
                    {submitting ? 'Enviando...' : 'Confirmar Solicitação'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
