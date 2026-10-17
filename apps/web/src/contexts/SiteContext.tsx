import React, { createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { PublicSiteSettings, PublicContactChannel } from '@baterias-estrela/shared';

interface SiteContextData {
  settings: PublicSiteSettings;
  contacts: PublicContactChannel[];
  defaultWhatsApp: { number: string; label: string };
  defaultPhone: { number: string; label: string };
  headerPhone: string;
  headerWhatsApp: string;
  footerPhone: string;
  footerWhatsApp: string;
  isLoading: boolean;
}

const defaultSettings: PublicSiteSettings = {
  storeName: 'Baterias Estrela',
  tagline: 'Sua loja de baterias automotivas em Arapongas - PR',
  address: 'Rua Taperaçu 165, Vila Sampaio',
  city: 'Arapongas',
  state: 'PR',
  postalCode: '86700-000',
  workingHours: 'Segunda a Sexta: 08h às 18h | Sábado: 08h às 12h30',
  email: 'contato@bateriasestrela.com.br',
  homeHeroTitle: 'A Bateria Certa para o seu Veículo com Entrega e Instalação Grátis em Arapongas',
  homeHeroSubtitle: 'Trabalhamos com marcas consagradas na região como Moura, Zetta, Heliar, Pioneiro e Eletran, entre muitas outras. Socorro de bateria, diagnóstico gratuito e garantia de fábrica.',
};

const SiteContext = createContext<SiteContextData>({
  settings: defaultSettings,
  contacts: [],
  defaultWhatsApp: { number: '43996110253', label: 'WhatsApp Estrela' },
  defaultPhone: { number: '43996110253', label: 'Telefone Estrela' },
  headerPhone: '43996110253',
  headerWhatsApp: '43996110253',
  footerPhone: '43996110253',
  footerWhatsApp: '43996110253',
  isLoading: false,
});

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['site-public-settings'],
    queryFn: () => apiFetch<{ settings: PublicSiteSettings; contacts: PublicContactChannel[]; defaultWhatsApp: any; defaultPhone: any }>('/settings/public'),
    staleTime: 5 * 60 * 1000,
  });

  const settings = data?.settings || defaultSettings;
  const contacts = data?.contacts || [];

  const defaultWhatsApp = data?.defaultWhatsApp || { number: '43996110253', label: 'WhatsApp Estrela' };
  const defaultPhone = data?.defaultPhone || { number: '43996110253', label: 'Telefone Estrela' };

  // Localiza canais específicos para cabeçalho e rodapé
  const headerPhoneChannel = contacts.find((c) => c.type === 'phone' && (c.placement === 'header' || c.placement === 'all'));
  const headerWaChannel = contacts.find((c) => c.type === 'whatsapp' && (c.placement === 'header' || c.placement === 'all'));

  const footerPhoneChannel = contacts.find((c) => c.type === 'phone' && (c.placement === 'footer' || c.placement === 'all'));
  const footerWaChannel = contacts.find((c) => c.type === 'whatsapp' && (c.placement === 'footer' || c.placement === 'all'));

  const headerPhone = headerPhoneChannel?.number || defaultPhone.number;
  const headerWhatsApp = headerWaChannel?.number || defaultWhatsApp.number;
  const footerPhone = footerPhoneChannel?.number || defaultPhone.number;
  const footerWhatsApp = footerWaChannel?.number || defaultWhatsApp.number;

  return (
    <SiteContext.Provider
      value={{
        settings,
        contacts,
        defaultWhatsApp,
        defaultPhone,
        headerPhone,
        headerWhatsApp,
        footerPhone,
        footerWhatsApp,
        isLoading,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
};

export const useSite = () => useContext(SiteContext);
