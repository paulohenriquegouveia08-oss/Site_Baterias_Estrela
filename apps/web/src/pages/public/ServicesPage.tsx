import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import { PublicService, buildWhatsAppServiceMessage, buildWhatsAppLink } from '@baterias-estrela/shared';
import { BatteryLoader } from '../../components/common/BatteryLoader';
import { useSite } from '../../contexts/SiteContext';
import { trackEvent, handleWhatsAppClick } from '../../lib/analytics';
import { WhatsAppIcon } from '../../components/common/WhatsAppIcon';
import { useToast } from '../../contexts/ToastContext';
import {
  Truck,
  Zap,
  Gauge,
  ShieldCheck,
  Clock,
  MapPin,
  X,
  CheckCircle2,
  Info,
} from 'lucide-react';

export const ServicesPage: React.FC = () => {
  const { defaultWhatsApp, settings } = useSite();
  const toast = useToast();
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
    const isTestService = service.slug?.includes('teste') || service.name.toLowerCase().includes('teste');
    const msg = isTestService
      ? 'Olá! Gostaria de tirar dúvidas sobre o teste computadorizado de bateria e alternador na loja física da Baterias Estrela em Arapongas.'
      : service.whatsappMessage || buildWhatsAppServiceMessage({ serviceName: service.name });

    const url = buildWhatsAppLink(defaultWhatsApp.number, msg);
    handleWhatsAppClick(url, {
      path: '/servicos',
      serviceId: service.id,
      metadata: { action: 'service_whatsapp_click', serviceName: service.name },
    });
  };

  const openGoogleMaps = () => {
    const addressQuery = encodeURIComponent(`${settings.address || 'Rua Taperaçu 165'}, ${settings.city || 'Arapongas'} - ${settings.state || 'PR'}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${addressQuery}`, '_blank');
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
      toast.success('Solicitação registrada com sucesso!', 'Em instantes nossa equipe entrará em contato.');
    } catch {
      toast.error('Falha ao registrar solicitação', 'Por favor entre em contato direto pelo nosso WhatsApp.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <div className="max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Serviços Especializados</h1>
        <p className="text-sm text-estrela-gray-300 mt-2 leading-relaxed">
          Atendimento técnico de baterias automotivas em Arapongas e região com preservação de memória veicular e diagnóstico com equipamentos de ponta.
        </p>
      </div>

      {isLoading ? (
        <div className="py-20">
          <BatteryLoader label="Carregando serviços..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {servicesData?.data.map((service) => {
            const isTestService = service.slug?.includes('teste') || service.name.toLowerCase().includes('teste');

            return (
              <div
                key={service.id}
                className="bg-estrela-dark border border-white/10 hover:border-white/20 rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition shadow-xl"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-estrela-red">
                      {service.iconName === 'Zap' ? <Zap className="w-6 h-6" /> :
                       service.iconName === 'Truck' ? <Truck className="w-6 h-6" /> :
                       service.iconName === 'Gauge' ? <Gauge className="w-6 h-6" /> :
                       <ShieldCheck className="w-6 h-6" />}
                      <span className="text-xs font-bold uppercase tracking-wider text-white">
                        {service.slug === 'entrega-e-instalacao-gratis' ? 'Atendimento Móvel' :
                         service.slug?.includes('socorro') ? 'Emergência' :
                         isTestService ? 'Diagnóstico na Loja' : 'Diferencial Técnico'}
                      </span>
                    </div>

                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Disponível
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{service.name}</h3>
                    <p className="text-sm text-estrela-gray-300 leading-relaxed">{service.description}</p>
                  </div>

                  {/* Informação sobre local e horários */}
                  <div className="space-y-2 pt-2 text-xs text-estrela-gray-400 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-estrela-red shrink-0" />
                      <span>Região: <strong className="text-white">{service.regionServed}</strong></span>
                    </div>
                    {service.workingHours && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-estrela-red shrink-0" />
                        <span>Horários: <strong className="text-white">{service.workingHours}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Aviso explicativo para Teste Computadorizado */}
                  {isTestService && (
                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-estrela-gray-300 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-white">
                        <Info className="w-3.5 h-3.5 text-estrela-red" />
                        <span>Como funciona o teste gratuito:</span>
                      </div>
                      <p className="text-estrela-gray-400">
                        O teste de condutância e carga do alternador é 100% gratuito e realizado <strong>diretamente em nossa loja física</strong> ou <strong>incluso durante os atendimentos de entrega/socorro</strong>. Não realizamos deslocamento isolado apenas para teste sem intenção de troca.
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-3">
                  {isTestService ? (
                    <>
                      <button
                        onClick={openGoogleMaps}
                        className="flex-1 py-3 px-4 rounded-xl bg-white hover:bg-estrela-gray-100 text-estrela-black text-xs font-extrabold transition flex items-center justify-center gap-2 shadow"
                      >
                        <MapPin className="w-4 h-4 text-estrela-red" />
                        <span>Ver Localização da Loja no Maps</span>
                      </button>
                      <button
                        onClick={() => onDirectWhatsApp(service)}
                        className="py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow"
                      >
                        <WhatsAppIcon className="w-4 h-4 fill-white" />
                        <span>Tirar Dúvidas</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => onDirectWhatsApp(service)}
                        className="flex-1 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-extrabold transition flex items-center justify-center gap-2 shadow"
                      >
                        <WhatsAppIcon className="w-4 h-4 fill-white" />
                        <span>{service.ctaText || 'Solicitar via WhatsApp'}</span>
                      </button>

                      <button
                        onClick={() => onOpenRequestModal(service)}
                        className="py-3 px-4 rounded-xl bg-estrela-card hover:bg-white/10 text-white text-xs font-semibold transition"
                      >
                        Preencher Formulário
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DE SOLICITAÇÃO DE ATENDIMENTO */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-estrela-dark border border-white/10 rounded-2xl w-full max-w-lg p-6 sm:p-8 relative shadow-2xl">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-estrela-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {formSubmitted ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7" />
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
                  <label className="block text-xs font-semibold text-estrela-gray-300 mb-1">Endereço / Bairro em Arapongas</label>
                  <input
                    type="text"
                    value={addressReference}
                    onChange={(e) => setAddressReference(e.target.value)}
                    placeholder="Ex: Rua Taperaçu, 165 - Vila Sampaio"
                    className="w-full bg-estrela-card border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-estrela-red"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-estrela-gray-300 mb-1">Observações Adicionais</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ex: Carro não dá partida, preciso de atendimento no período da manhã."
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
