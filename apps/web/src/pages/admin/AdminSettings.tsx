import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import { BatteryLoader } from '../../components/common/BatteryLoader';
import { Settings, Save, CheckCircle2 } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState('');

  const { data, isLoading } = useQuery<{ settings: any }>({
    queryKey: ['admin-settings'],
    queryFn: () => apiFetch('/admin/settings'),
  });

  const [storeName, setStoreName] = useState('');
  const [tagline, setTagline] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [workingHours, setWorkingHours] = useState('');
  const [email, setEmail] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [homeHeroTitle, setHomeHeroTitle] = useState('');
  const [homeHeroSubtitle, setHomeHeroSubtitle] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  useEffect(() => {
    if (data?.settings) {
      const s = data.settings;
      setStoreName(s.storeName || '');
      setTagline(s.tagline || '');
      setAddress(s.address || '');
      setCity(s.city || '');
      setState(s.state || '');
      setPostalCode(s.postalCode || '');
      setWorkingHours(s.workingHours || '');
      setEmail(s.email || '');
      setFacebookUrl(s.facebookUrl || '');
      setInstagramUrl(s.instagramUrl || '');
      setGoogleMapsUrl(s.googleMapsUrl || '');
      setHomeHeroTitle(s.homeHeroTitle || '');
      setHomeHeroSubtitle(s.homeHeroSubtitle || '');
      setSeoTitle(s.seoTitle || '');
      setSeoDescription(s.seoDescription || '');
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: (body: any) =>
      apiFetch('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      queryClient.invalidateQueries({ queryKey: ['site-public-settings'] });
      setSuccessMsg('Configurações da loja salvas com sucesso!');
      setTimeout(() => setSuccessMsg(''), 4000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      storeName,
      tagline,
      address,
      city,
      state,
      postalCode,
      workingHours,
      email,
      facebookUrl: facebookUrl || null,
      instagramUrl: instagramUrl || null,
      googleMapsUrl: googleMapsUrl || null,
      homeHeroTitle,
      homeHeroSubtitle,
      seoTitle,
      seoDescription,
    });
  };

  if (isLoading) {
    return (
      <div className="py-20">
        <BatteryLoader label="Carregando configurações da loja..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-6 border-b border-estrela-card">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-estrela-red" />
          Configurações Gerais da Loja
        </h1>
        <p className="text-xs text-estrela-gray-400 mt-1">
          Edite as informações institucionais, endereço em Arapongas, horários e textos da vitrine.
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-estrela-dark border border-estrela-card rounded-2xl p-6 sm:p-8">
        {/* Bloco 1: Identidade da Loja */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider border-l-2 border-estrela-red pl-2.5">
            Dados Comerciais
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-estrela-gray-300 font-semibold mb-1">Nome Comercial da Loja</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-estrela-card border border-white/10 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-estrela-gray-300 font-semibold mb-1">Slogan / Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full bg-estrela-card border border-white/10 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>
        </div>

        {/* Bloco 2: Localização e Horários */}
        <div className="space-y-4 pt-4 border-t border-white/10">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider border-l-2 border-estrela-red pl-2.5">
            Endereço Físico e Atendimento
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block text-estrela-gray-300 font-semibold mb-1">Endereço (Rua e Número)</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ex: Rua Taperaçu 165, Vila Sampaio"
                className="w-full bg-estrela-card border border-white/10 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-estrela-gray-300 font-semibold mb-1">CEP</label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="Ex: 86700-000"
                className="w-full bg-estrela-card border border-white/10 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-estrela-gray-300 font-semibold mb-1">Cidade</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Arapongas"
                className="w-full bg-estrela-card border border-white/10 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-estrela-gray-300 font-semibold mb-1">Estado (UF)</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="PR"
                className="w-full bg-estrela-card border border-white/10 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-estrela-gray-300 font-semibold mb-1">Horário de Funcionamento</label>
              <input
                type="text"
                value={workingHours}
                onChange={(e) => setWorkingHours(e.target.value)}
                placeholder="Ex: Segunda a Sexta: 08:00 às 18:00 | Sábado: 08:00 às 12:30"
                className="w-full bg-estrela-card border border-white/10 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-estrela-gray-300 font-semibold mb-1">E-mail Comercial</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contato@bateriasestrela.com.br"
                className="w-full bg-estrela-card border border-white/10 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>
        </div>

        {/* Bloco 3: Textos Principais da Página Inicial */}
        <div className="space-y-4 pt-4 border-t border-white/10">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider border-l-2 border-estrela-red pl-2.5">
            Destaques da Página Inicial
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-estrela-gray-300 font-semibold mb-1">Título Principal (Hero)</label>
              <input
                type="text"
                value={homeHeroTitle}
                onChange={(e) => setHomeHeroTitle(e.target.value)}
                className="w-full bg-estrela-card border border-white/10 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-estrela-gray-300 font-semibold mb-1">Subtítulo (Hero)</label>
              <textarea
                rows={2}
                value={homeHeroSubtitle}
                onChange={(e) => setHomeHeroSubtitle(e.target.value)}
                className="w-full bg-estrela-card border border-white/10 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>
        </div>

        {/* Bloco 4: SEO Padrão */}
        <div className="space-y-4 pt-4 border-t border-white/10">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider border-l-2 border-estrela-red pl-2.5">
            Metadados para Mecanismos de Busca (SEO)
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-estrela-gray-300 font-semibold mb-1">Título Padrão (Title Tag)</label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className="w-full bg-estrela-card border border-white/10 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-estrela-gray-300 font-semibold mb-1">Meta Descrição</label>
              <textarea
                rows={2}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                className="w-full bg-estrela-card border border-white/10 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-white/10">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="px-6 py-2.5 rounded-xl bg-estrela-red hover:bg-estrela-red-hover text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-estrela-red/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{updateMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
