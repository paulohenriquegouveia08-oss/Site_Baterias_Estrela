import React, { useState, useEffect } from 'react';
import { useSite } from '../../contexts/SiteContext';
import { apiFetch } from '../../lib/api';
import { formatPhoneNumber, buildTelLink, buildWhatsAppLink } from '@baterias-estrela/shared';
import { trackEvent, handleWhatsAppClick, handlePhoneClick } from '../../lib/analytics';
import { WhatsAppIcon } from '../../components/common/WhatsAppIcon';
import { useToast } from '../../contexts/ToastContext';
import {
  MapPin,
  Phone,
  Clock,
  Send,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { settings, contacts } = useSite();
  const toast = useToast();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    trackEvent('page_view', { path: '/contato' });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    setSubmitting(true);
    try {
      await apiFetch('/service-requests', {
        method: 'POST',
        body: JSON.stringify({ name, phone, notes }),
      });
      setSubmitted(true);
      toast.success('Mensagem enviada com sucesso!', 'Nossa equipe responderá em breve.');
    } catch {
      toast.error('Falha ao enviar mensagem', 'Por favor, tente entrar em contato pelo nosso WhatsApp.');
    } finally {
      setSubmitting(false);
    }
  };

  const onCall = (number: string) => {
    handlePhoneClick(buildTelLink(number), { path: '/contato' });
  };

  const onWhatsApp = (number: string) => {
    const url = buildWhatsAppLink(number, 'Olá! Gostaria de falar com o atendimento da Baterias Estrela em Arapongas.');
    handleWhatsAppClick(url, { path: '/contato' });
  };

  const googleMapsUrl = 'https://www.google.com/maps/search/?api=1&query=Baterias+Estrela+Tapera%C3%A7u+165+Arapongas+PR';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <div className="max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Fale com a Baterias Estrela</h1>
        <p className="text-sm text-estrela-gray-300 mt-2 leading-relaxed">
          Atendimento direto em nossa loja física em Arapongas ou pelo socorro e entrega técnica no seu endereço.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Informações da Loja e Contatos */}
        <div className="space-y-6">
          <div className="bg-estrela-dark border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            <h2 className="text-xl font-bold text-white border-l-2 border-estrela-red pl-3">
              Canais Oficiais
            </h2>

            <div className="space-y-3">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-estrela-card border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    {contact.type === 'whatsapp' ? (
                      <WhatsAppIcon className="w-5 h-5 fill-[#25D366] shrink-0" />
                    ) : (
                      <Phone className="w-5 h-5 text-estrela-red shrink-0" />
                    )}
                    <div>
                      <span className="block text-xs text-estrela-gray-400">{contact.label}</span>
                      <span className="text-sm font-bold text-white">{formatPhoneNumber(contact.number)}</span>
                    </div>
                  </div>

                  {contact.type === 'whatsapp' ? (
                    <button
                      onClick={() => onWhatsApp(contact.number)}
                      className="px-4 py-2 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
                    >
                      <WhatsAppIcon className="w-3.5 h-3.5 fill-white" />
                      Chamar
                    </button>
                  ) : (
                    <button
                      onClick={() => onCall(contact.number)}
                      className="px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10 text-xs font-semibold transition flex items-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      Ligar
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Endereço, CNPJ e Horários */}
            <div className="pt-4 border-t border-white/10 space-y-3.5 text-xs sm:text-sm text-estrela-gray-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-estrela-red shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Endereço da Loja:</strong>
                  <span>{settings.address || 'Rua Taperaçu, 165 - Vila Sampaio'}</span><br />
                  <span>{settings.city || 'Arapongas'} - {settings.state || 'PR'} | CEP: {settings.postalCode || '86700-000'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-estrela-red shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Horário de Funcionamento:</strong>
                  <span>Segunda a Sexta: <strong>08:00 às 19:00</strong></span><br />
                  <span>Sábado: <strong>08:00 às 13:00</strong></span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 text-xs text-estrela-gray-400">
                <span>CNPJ: <strong className="text-estrela-gray-200">84.987.379/0001-65</strong></span>
              </div>
            </div>
          </div>

          {/* Mapa Clicável Diretamente para o Perfil no Google Maps */}
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group block bg-estrela-dark border border-white/10 hover:border-estrela-red/50 rounded-2xl overflow-hidden transition shadow-xl"
            title="Clique para abrir diretamente no Google Maps"
          >
            <div className="relative h-44 bg-neutral-900 overflow-hidden">
              <iframe
                title="Localização da Loja no Google Maps"
                src="https://maps.google.com/maps?q=Rua%20Tapera%C3%A7u,%20165,%20Arapongas%20-%20PR&t=&z=16&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full border-0 pointer-events-none opacity-80 group-hover:opacity-100 transition"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-estrela-black via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-estrela-red" />
                  <span className="text-xs font-bold">Rua Taperaçu, 165 - Arapongas</span>
                </div>
                <span className="text-[11px] font-bold text-estrela-red group-hover:underline flex items-center gap-1">
                  Abrir no Google Maps
                  <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </div>
          </a>
        </div>

        {/* Formulário de Mensagem */}
        <div className="bg-estrela-dark border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <h2 className="text-xl font-bold text-white border-l-2 border-estrela-red pl-3">
            Envie sua Mensagem
          </h2>

          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white">Mensagem Recebida!</h3>
              <p className="text-sm text-estrela-gray-300">
                Agradecemos pelo contato. Retornaremos sua mensagem o mais rápido possível pelo telefone informado.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-6 py-2.5 rounded-lg bg-estrela-red text-white text-xs font-bold"
              >
                Enviar Outra Mensagem
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-estrela-gray-300 mb-1">Seu Nome *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="w-full bg-estrela-card border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-estrela-red"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-estrela-gray-300 mb-1">Seu Telefone / WhatsApp *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(43) 99999-9999"
                  className="w-full bg-estrela-card border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-estrela-red"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-estrela-gray-300 mb-1">Mensagem ou Dúvida</label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Como podemos te ajudar? Ex: Gostaria de confirmar se há bateria 60Ah para entrega no Jardim Aeroporto."
                  className="w-full bg-estrela-card border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-estrela-red"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl bg-estrela-red hover:bg-estrela-red-hover text-white text-sm font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-estrela-red/20 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Enviando...' : 'Enviar Mensagem'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
