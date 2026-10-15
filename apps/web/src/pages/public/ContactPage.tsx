import React, { useState, useEffect } from 'react';
import { useSite } from '../../contexts/SiteContext';
import { apiFetch } from '../../lib/api';
import { formatPhoneNumber, buildTelLink, buildWhatsAppLink } from '@baterias-estrela/shared';
import { trackEvent, handleWhatsAppClick, handlePhoneClick } from '../../lib/analytics';
import {
  MapPin,
  Phone,
  MessageCircle,
  Clock,
  Mail,
  Send,
  CheckCircle2,
  Navigation,
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { settings, contacts } = useSite();

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
    } catch {
      alert('Falha ao enviar mensagem. Por favor, tente pelo WhatsApp.');
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

  const openGoogleMaps = () => {
    const addressQuery = encodeURIComponent(`${settings.address}, ${settings.city} - ${settings.state}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${addressQuery}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <div className="max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Fale com a Baterias Estrela</h1>
        <p className="text-sm text-estrela-gray-300 mt-2 leading-relaxed">
          Estamos prontos para atender você com rapidez em nossa loja física em Arapongas ou pelo atendimento móvel.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Informações da Loja e Contatos */}
        <div className="space-y-8">
          <div className="bg-estrela-dark border border-estrela-card rounded-2xl p-6 sm:p-8 space-y-6">
            <h2 className="text-xl font-bold text-white border-l-2 border-estrela-red pl-3">
              Canais Oficiais de Atendimento
            </h2>

            <div className="space-y-4">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-estrela-card/60 border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-estrela-dark flex items-center justify-center text-estrela-red">
                      {contact.type === 'whatsapp' ? <MessageCircle className="w-5 h-5 fill-current" /> : <Phone className="w-5 h-5" />}
                    </div>
                    <div>
                      <span className="block text-xs text-estrela-gray-400">{contact.label}</span>
                      <span className="text-sm font-bold text-white">{formatPhoneNumber(contact.number)}</span>
                    </div>
                  </div>

                  {contact.type === 'whatsapp' ? (
                    <button
                      onClick={() => onWhatsApp(contact.number)}
                      className="px-3.5 py-1.5 rounded-lg bg-estrela-red hover:bg-estrela-red-hover text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-white" />
                      Conversar
                    </button>
                  ) : (
                    <button
                      onClick={() => onCall(contact.number)}
                      className="px-3.5 py-1.5 rounded-lg border border-white/20 text-white hover:bg-white/10 text-xs font-semibold transition flex items-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      Ligar
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Endereço e Horários */}
            <div className="pt-4 border-t border-white/10 space-y-4 text-sm text-estrela-gray-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-estrela-red shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Endereço da Loja:</strong>
                  <span>{settings.address || 'Rua Taperaçu 165, Vila Sampaio'}</span><br />
                  <span>{settings.city || 'Arapongas'} - {settings.state || 'PR'} | CEP: {settings.postalCode || '86700-000'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-estrela-red shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Horário de Atendimento:</strong>
                  <span>{settings.workingHours || 'Segunda a Sexta: 08:00 às 18:00 | Sábado: 08:00 às 12:30'}</span>
                </div>
              </div>

              {settings.email && (
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-estrela-red shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">E-mail:</strong>
                    <span>{settings.email}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={openGoogleMaps}
                className="w-full py-3 px-4 rounded-xl border border-white/20 hover:border-estrela-red bg-estrela-card text-white text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4 text-estrela-red" />
                <span>Traçar Rota no Google Maps</span>
              </button>
            </div>
          </div>
        </div>

        {/* Formulário de Mensagem */}
        <div className="bg-estrela-dark border border-estrela-card rounded-2xl p-6 sm:p-8 space-y-6">
          <h2 className="text-xl font-bold text-white border-l-2 border-estrela-red pl-3">
            Envie uma Mensagem
          </h2>

          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">Mensagem Recebida!</h3>
              <p className="text-sm text-estrela-gray-300">
                Agradecemos pelo contato. Um de nossos especialistas retornará sua mensagem o mais rápido possível.
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
                  placeholder="Como podemos te ajudar? Ex: Gostaria de saber se vocês têm bateria para Hilux 2020."
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
