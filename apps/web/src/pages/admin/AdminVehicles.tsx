import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, API_BASE_URL } from '../../lib/api';
import {
  PublicVehicleMake,
  PublicVehicleModel,
  PublicVehicleVariant,
} from '@baterias-estrela/shared';
import { BatteryLoader } from '../../components/common/BatteryLoader';
import { Car, Plus, Download, Upload, Trash2, Search } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export const AdminVehicles: React.FC = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [tab, setTab] = useState<'variants' | 'makes' | 'models'>('variants');
  const [searchTerm, setSearchTerm] = useState('');

  // Modais
  const [newMakeModal, setNewMakeModal] = useState(false);
  const [makeName, setMakeName] = useState('');

  const [newModelModal, setNewModelModal] = useState(false);
  const [modelMakeId, setModelMakeId] = useState('');
  const [modelName, setModelName] = useState('');

  const [newVariantModal, setNewVariantModal] = useState(false);
  const [variantModelId, setVariantModelId] = useState('');
  const [variantName, setVariantName] = useState('');
  const [variantYearStart, setVariantYearStart] = useState('2018');
  const [variantYearEnd, setVariantYearEnd] = useState('');
  const [variantEngine, setVariantEngine] = useState('');
  const [variantFuel, setVariantFuel] = useState('Flex');
  const [variantNotes, setVariantNotes] = useState('');

  const [importReport, setImportReport] = useState<any | null>(null);
  const [importing, setImporting] = useState(false);

  // Consultas
  const { data: makesData } = useQuery<{ data: PublicVehicleMake[] }>({
    queryKey: ['admin-makes'],
    queryFn: () => apiFetch('/admin/vehicles/makes'),
  });

  const { data: modelsData } = useQuery<{ data: (PublicVehicleModel & { make: any; _count: any })[] }>({
    queryKey: ['admin-models'],
    queryFn: () => apiFetch('/admin/vehicles/models'),
  });

  const { data: variantsData, isLoading } = useQuery<{ data: PublicVehicleVariant[] }>({
    queryKey: ['admin-variants', searchTerm],
    queryFn: () => apiFetch(`/admin/vehicles/variants?search=${encodeURIComponent(searchTerm)}`),
  });

  // Mutações
  const createMakeMutation = useMutation({
    mutationFn: (name: string) => apiFetch('/admin/vehicles/makes', { method: 'POST', body: JSON.stringify({ name }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-makes'] });
      setNewMakeModal(false);
      setMakeName('');
    },
  });

  const createModelMutation = useMutation({
    mutationFn: (body: any) => apiFetch('/admin/vehicles/models', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-models'] });
      setNewModelModal(false);
      setModelName('');
    },
  });

  const createVariantMutation = useMutation({
    mutationFn: (body: any) => apiFetch('/admin/vehicles/variants', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-variants'] });
      setNewVariantModal(false);
    },
  });

  const deleteVariantMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/admin/vehicles/variants/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-variants'] });
    },
  });

  const handleExportCsv = async () => {
    try {
      const blob = await apiFetch<Blob>('/admin/vehicles/export-csv');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `veiculos-baterias-estrela-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success('Download concluído', 'Arquivo CSV de veículos gerado.');
    } catch {
      toast.error('Erro na exportação', 'Falha ao exportar CSV de veículos.');
    }
  };

  const handleImportCsv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_BASE_URL}/admin/vehicles/import-csv`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('estrela_admin_token') || ''}`,
        },
        credentials: 'include',
        body: formData,
      });
      const data = await res.json();
      setImportReport(data.report);
      queryClient.invalidateQueries({ queryKey: ['admin-variants'] });
      queryClient.invalidateQueries({ queryKey: ['admin-models'] });
      queryClient.invalidateQueries({ queryKey: ['admin-makes'] });
      toast.success('CSV importado com sucesso!');
    } catch {
      toast.error('Erro no envio do CSV', 'Verifique a formatação do arquivo.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-estrela-card">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Car className="w-6 h-6 text-estrela-red" />
            Base de Veículos e Aplicações
          </h1>
          <p className="text-xs text-estrela-gray-400 mt-1">
            Catálogo técnico de montadoras, modelos e versões homologadas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="px-3 py-2 rounded-lg bg-estrela-dark hover:bg-white/10 border border-white/15 text-xs font-semibold text-white transition flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar CSV
          </button>

          <label className="px-3 py-2 rounded-lg bg-estrela-dark hover:bg-white/10 border border-white/15 text-xs font-semibold text-white transition flex items-center gap-2 cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>{importing ? 'Importando...' : 'Importar CSV'}</span>
            <input type="file" accept=".csv" onChange={handleImportCsv} className="hidden" />
          </label>

          <button
            onClick={() => setNewVariantModal(true)}
            className="px-4 py-2 rounded-lg bg-estrela-red hover:bg-estrela-red-hover text-white text-xs font-bold transition flex items-center gap-2 shadow"
          >
            <Plus className="w-4 h-4" />
            Nova Versão / Motor
          </button>
        </div>
      </div>

      {importReport && (
        <div className="p-4 rounded-xl bg-estrela-card text-xs space-y-2 border border-white/10">
          <div className="flex items-center justify-between font-bold text-white">
            <span>Relatório de Importação de Veículos:</span>
            <span>{importReport.totalRows} linhas analisadas</span>
          </div>
          <div className="flex gap-4 text-estrela-gray-300">
            <span className="text-emerald-400">Criadas: {importReport.createdVariants}</span>
            <span className="text-blue-400">Existentes (Ignoradas): {importReport.existingSkipped}</span>
            <span className="text-rose-400">Erros: {importReport.errors.length}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-estrela-card pb-2">
        <button
          onClick={() => setTab('variants')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
            tab === 'variants' ? 'bg-estrela-red text-white' : 'text-estrela-gray-400 hover:text-white'
          }`}
        >
          Versões e Motores
        </button>
        <button
          onClick={() => setTab('models')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
            tab === 'models' ? 'bg-estrela-red text-white' : 'text-estrela-gray-400 hover:text-white'
          }`}
        >
          Modelos de Carros
        </button>
        <button
          onClick={() => setTab('makes')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
            tab === 'makes' ? 'bg-estrela-red text-white' : 'text-estrela-gray-400 hover:text-white'
          }`}
        >
          Montadoras (Fabricantes)
        </button>
      </div>

      {/* TAB 1: VERSÕES / VARIANTES */}
      {tab === 'variants' && (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 text-estrela-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar versão, motor ou modelo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-estrela-card border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-estrela-gray-500 focus:outline-none focus:border-estrela-red"
            />
          </div>

          <div className="bg-estrela-dark border border-estrela-card rounded-2xl overflow-hidden">
            {isLoading ? (
              <div className="py-16">
                <BatteryLoader label="Carregando versões de veículos..." />
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-estrela-card/60 text-estrela-gray-400 border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Montadora / Modelo</th>
                    <th className="py-3 px-4 font-semibold">Versão e Motorização</th>
                    <th className="py-3 px-4 font-semibold text-center">Anos</th>
                    <th className="py-3 px-4 font-semibold">Observações Técnicas</th>
                    <th className="py-3 px-4 font-semibold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {variantsData?.data?.map((v: any) => (
                    <tr key={v.id} className="hover:bg-white/5">
                      <td className="py-3 px-4 font-bold text-white">
                        <span className="text-estrela-red">{v.makeName}</span> {v.modelName}
                      </td>
                      <td className="py-3 px-4 font-medium text-estrela-gray-200">
                        {v.name} {v.engine && <span className="text-estrela-gray-400">({v.engine})</span>}
                      </td>
                      <td className="py-3 px-4 text-center font-mono">
                        {v.yearStart} a {v.yearEnd || 'atual'}
                      </td>
                      <td className="py-3 px-4 text-estrela-gray-400 max-w-xs truncate">
                        {v.technicalNotes || '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            toast.confirm({
                              title: 'Remover Versão do Veículo',
                              message: `Deseja realmente remover a versão "${v.name}"?`,
                              confirmText: 'Remover Versão',
                              isDanger: true,
                              onConfirm: () => deleteVariantMutation.mutateAsync(v.id),
                            });
                          }}
                          className="p-1 rounded text-red-400 hover:bg-white/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MODELOS */}
      {tab === 'models' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setNewModelModal(true)}
              className="px-3 py-1.5 rounded-lg bg-estrela-red text-white text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Novo Modelo
            </button>
          </div>

          <div className="bg-estrela-dark border border-estrela-card rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-estrela-card/60 text-estrela-gray-400 border-b border-white/10">
                <tr>
                  <th className="py-3 px-4 font-semibold">Montadora</th>
                  <th className="py-3 px-4 font-semibold">Modelo</th>
                  <th className="py-3 px-4 font-semibold">Slug</th>
                  <th className="py-3 px-4 font-semibold text-center">Versões Cadastradas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {modelsData?.data?.map((m) => (
                  <tr key={m.id} className="hover:bg-white/5">
                    <td className="py-3 px-4 font-bold text-estrela-red">{m.make?.name}</td>
                    <td className="py-3 px-4 font-bold text-white">{m.name}</td>
                    <td className="py-3 px-4 font-mono text-estrela-gray-400">{m.slug}</td>
                    <td className="py-3 px-4 text-center font-bold text-white">{m._count?.variants || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MONTADORAS */}
      {tab === 'makes' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setNewMakeModal(true)}
              className="px-3 py-1.5 rounded-lg bg-estrela-red text-white text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Nova Montadora
            </button>
          </div>

          <div className="bg-estrela-dark border border-estrela-card rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-estrela-card/60 text-estrela-gray-400 border-b border-white/10">
                <tr>
                  <th className="py-3 px-4 font-semibold">Nome</th>
                  <th className="py-3 px-4 font-semibold">Slug</th>
                  <th className="py-3 px-4 font-semibold text-center">Modelos Cadastrados</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {makesData?.data?.map((mk: any) => (
                  <tr key={mk.id} className="hover:bg-white/5">
                    <td className="py-3 px-4 font-bold text-white">{mk.name}</td>
                    <td className="py-3 px-4 font-mono text-estrela-gray-400">{mk.slug}</td>
                    <td className="py-3 px-4 text-center font-bold text-white">{mk._count?.models || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Nova Montadora */}
      {newMakeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-estrela-dark border border-estrela-card rounded-2xl w-full max-w-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Adicionar Montadora</h3>
            <input
              type="text"
              required
              value={makeName}
              onChange={(e) => setMakeName(e.target.value)}
              placeholder="Ex: Honda, Jeep, Nissan"
              className="w-full bg-estrela-card border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setNewMakeModal(false)} className="px-3 py-1.5 text-xs text-white">Cancelar</button>
              <button
                onClick={() => createMakeMutation.mutate(makeName)}
                disabled={!makeName}
                className="px-4 py-1.5 bg-estrela-red text-white text-xs font-bold rounded-lg"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Novo Modelo */}
      {newModelModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-estrela-dark border border-estrela-card rounded-2xl w-full max-w-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Adicionar Modelo</h3>
            <select
              value={modelMakeId}
              onChange={(e) => setModelMakeId(e.target.value)}
              className="w-full bg-estrela-card border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
            >
              <option value="">Selecione a montadora...</option>
              {makesData?.data.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            <input
              type="text"
              required
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder="Ex: Civic, Compass, Kicks"
              className="w-full bg-estrela-card border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setNewModelModal(false)} className="px-3 py-1.5 text-xs text-white">Cancelar</button>
              <button
                onClick={() => createModelMutation.mutate({ makeId: modelMakeId, name: modelName })}
                disabled={!modelMakeId || !modelName}
                className="px-4 py-1.5 bg-estrela-red text-white text-xs font-bold rounded-lg"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Nova Versão / Motor */}
      {newVariantModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-estrela-dark border border-estrela-card rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Cadastrar Versão / Motorização</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-estrela-gray-300 mb-1">Modelo *</label>
                <select
                  value={variantModelId}
                  onChange={(e) => setVariantModelId(e.target.value)}
                  className="w-full bg-estrela-card border border-white/10 rounded-lg px-3 py-2 text-white"
                >
                  <option value="">Selecione o modelo...</option>
                  {modelsData?.data.map((m) => (
                    <option key={m.id} value={m.id}>{m.make?.name} {m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-estrela-gray-300 mb-1">Nome da Versão *</label>
                <input
                  type="text"
                  value={variantName}
                  onChange={(e) => setVariantName(e.target.value)}
                  placeholder="Ex: 2.0 16V Flex Dual VVT-i"
                  className="w-full bg-estrela-card border border-white/10 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-estrela-gray-300 mb-1">Ano Inicial *</label>
                  <input
                    type="number"
                    value={variantYearStart}
                    onChange={(e) => setVariantYearStart(e.target.value)}
                    className="w-full bg-estrela-card border border-white/10 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-estrela-gray-300 mb-1">Ano Final (Vazio = Atual)</label>
                  <input
                    type="number"
                    value={variantYearEnd}
                    onChange={(e) => setVariantYearEnd(e.target.value)}
                    placeholder="Ex: 2024"
                    className="w-full bg-estrela-card border border-white/10 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-estrela-gray-300 mb-1">Motorização</label>
                  <input
                    type="text"
                    value={variantEngine}
                    onChange={(e) => setVariantEngine(e.target.value)}
                    placeholder="Ex: 1.0 Flex"
                    className="w-full bg-estrela-card border border-white/10 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-estrela-gray-300 mb-1">Combustível</label>
                  <input
                    type="text"
                    value={variantFuel}
                    onChange={(e) => setVariantFuel(e.target.value)}
                    placeholder="Ex: Flex / Gasolina / Diesel"
                    className="w-full bg-estrela-card border border-white/10 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-estrela-gray-300 mb-1">Observações Técnicas</label>
                <textarea
                  rows={2}
                  value={variantNotes}
                  onChange={(e) => setVariantNotes(e.target.value)}
                  placeholder="Ex: Caixa JIS asiática pólo positivo direito."
                  className="w-full bg-estrela-card border border-white/10 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button onClick={() => setNewVariantModal(false)} className="px-3 py-1.5 text-xs text-white">Cancelar</button>
              <button
                onClick={() =>
                  createVariantMutation.mutate({
                    modelId: variantModelId,
                    name: variantName,
                    yearStart: parseInt(variantYearStart, 10),
                    yearEnd: variantYearEnd ? parseInt(variantYearEnd, 10) : null,
                    engine: variantEngine || null,
                    fuel: variantFuel || null,
                    technicalNotes: variantNotes || null,
                  })
                }
                disabled={!variantModelId || !variantName}
                className="px-4 py-1.5 bg-estrela-red text-white text-xs font-bold rounded-lg"
              >
                Cadastrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
