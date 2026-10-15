import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, API_BASE_URL } from '../../lib/api';
import {
  AdminProduct,
  PublicCategory,
  PublicVehicleVariant,
} from '@baterias-estrela/shared';
import { BatteryLoader } from '../../components/common/BatteryLoader';
import {
  Package,
  Plus,
  Download,
  Upload,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  Image,
  Car,
  X,
  Star,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const AdminProducts: React.FC = () => {
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [page, setPage] = useState(1);

  // Modais de Gestão
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);

  const [photosModalOpen, setPhotosModalOpen] = useState(false);
  const [activeProductForPhotos, setActiveProductForPhotos] = useState<AdminProduct | null>(null);

  const [compatModalOpen, setCompatModalOpen] = useState(false);
  const [activeProductForCompat, setActiveProductForCompat] = useState<AdminProduct | null>(null);

  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importReport, setImportReport] = useState<any | null>(null);
  const [importing, setImporting] = useState(false);

  // Busca lista de produtos
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['admin-products', statusFilter, searchTerm, page],
    queryFn: () =>
      apiFetch<{
        data: AdminProduct[];
        meta: { total: number; page: number; limit: number; totalPages: number };
      }>(`/admin/products?status=${statusFilter}&search=${encodeURIComponent(searchTerm)}&page=${page}`),
  });

  // Busca categorias
  const { data: categoriesData } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => apiFetch<{ data: PublicCategory[] }>('/admin/categories'),
  });

  // MUTAÇÃO: Arquivar Produto
  const archiveMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/admin/products/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });

  // Download do CSV
  const handleExportCsv = async () => {
    try {
      const blob = await apiFetch<Blob>('/admin/products/export-csv');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `produtos-baterias-estrela-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      alert('Falha ao exportar CSV.');
    }
  };

  // Upload CSV
  const handleImportCsv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportReport(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_BASE_URL}/admin/products/import-csv`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('estrela_admin_token') || ''}`,
        },
        credentials: 'include',
        body: formData,
      });
      const data = await res.json();
      setImportReport(data.report);
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    } catch {
      alert('Erro ao enviar arquivo CSV.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-estrela-card">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-estrela-red" />
            Catálogo e Estoque de Baterias
          </h1>
          <p className="text-xs text-estrela-gray-400 mt-1">
            Gerenciamento completo das baterias, especificações, compatibilidades veiculares e fotos.
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

          <button
            onClick={() => {
              setImportReport(null);
              setImportModalOpen(true);
            }}
            className="px-3 py-2 rounded-lg bg-estrela-dark hover:bg-white/10 border border-white/15 text-xs font-semibold text-white transition flex items-center gap-2"
          >
            <Upload className="w-3.5 h-3.5" />
            Importar CSV
          </button>

          <button
            onClick={() => {
              setEditingProduct(null);
              setFormModalOpen(true);
            }}
            className="px-4 py-2 rounded-lg bg-estrela-red hover:bg-estrela-red-hover text-white text-xs font-bold transition flex items-center gap-2 shadow-md shadow-estrela-red/20"
          >
            <Plus className="w-4 h-4" />
            Novo Produto
          </button>
        </div>
      </div>

      {/* Barra de Filtro e Busca */}
      <div className="bg-estrela-dark border border-estrela-card rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-estrela-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filtrar por nome, marca ou SKU..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full bg-estrela-card border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-estrela-gray-500 focus:outline-none focus:border-estrela-red"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              statusFilter === 'active' ? 'bg-estrela-red text-white' : 'text-estrela-gray-400 hover:text-white'
            }`}
          >
            Ativos
          </button>
          <button
            onClick={() => setStatusFilter('draft')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              statusFilter === 'draft' ? 'bg-estrela-red text-white' : 'text-estrela-gray-400 hover:text-white'
            }`}
          >
            Rascunhos
          </button>
          <button
            onClick={() => setStatusFilter('archived')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              statusFilter === 'archived' ? 'bg-estrela-red text-white' : 'text-estrela-gray-400 hover:text-white'
            }`}
          >
            Arquivados
          </button>
        </div>
      </div>

      {/* TABELA DE PRODUTOS */}
      <div className="bg-estrela-dark border border-estrela-card rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="py-20">
            <BatteryLoader label="Carregando produtos..." />
          </div>
        ) : productsData?.data && productsData.data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-estrela-card/60 text-estrela-gray-400 border-b border-white/10">
                <tr>
                  <th className="py-3 px-4 font-semibold">Produto</th>
                  <th className="py-3 px-4 font-semibold">Marca / SKU</th>
                  <th className="py-3 px-4 font-semibold text-center">Capacidade</th>
                  <th className="py-3 px-4 font-semibold text-center">Tecnologia</th>
                  <th className="py-3 px-4 font-semibold text-center">Compatibilidades</th>
                  <th className="py-3 px-4 font-semibold text-center">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {productsData.data.map((p) => {
                  const cover = p.images.find((img) => img.isCover)?.url || p.images[0]?.url;
                  return (
                    <tr key={p.id} className="hover:bg-white/5 transition">
                      {/* Foto e Nome */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-10 rounded bg-estrela-card overflow-hidden shrink-0 border border-white/10">
                            {cover ? (
                              <img src={cover} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-estrela-gray-600">
                                <Image className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-white block max-w-xs truncate">{p.name}</span>
                            <span className="text-[10px] text-estrela-gray-400 block font-mono">/{p.slug}</span>
                          </div>
                        </div>
                      </td>

                      {/* Marca / SKU */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-white block">{p.brand}</span>
                        <span className="text-[10px] text-estrela-gray-400 font-mono">{p.sku || '-'}</span>
                      </td>

                      {/* Capacidade */}
                      <td className="py-3 px-4 text-center">
                        <span className="font-black text-white">{p.amperageAh} Ah</span>
                        {p.ccaA && <span className="block text-[10px] text-estrela-gray-400">{p.ccaA} A CCA</span>}
                      </td>

                      {/* Tecnologia */}
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded bg-estrela-card text-estrela-gray-300 font-medium">
                          {p.technology}
                        </span>
                      </td>

                      {/* Compatibilidades */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => {
                            setActiveProductForCompat(p);
                            setCompatModalOpen(true);
                          }}
                          className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-white font-semibold transition inline-flex items-center gap-1"
                        >
                          <Car className="w-3.5 h-3.5 text-estrela-red" />
                          <span>{p.compatibilitiesCount || 0} modelos</span>
                        </button>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        {p.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" /> Ativo
                          </span>
                        ) : p.status === 'draft' ? (
                          <span className="text-[11px] font-bold text-amber-400">Rascunho</span>
                        ) : (
                          <span className="text-[11px] font-bold text-estrela-gray-500">Arquivado</span>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Ver no site */}
                          <a
                            href={`/baterias/${p.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Pré-visualizar no site"
                            className="p-1.5 rounded-lg bg-estrela-card hover:bg-white/10 text-estrela-gray-400 hover:text-white"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          {/* Gerenciar Fotos */}
                          <button
                            onClick={() => {
                              setActiveProductForPhotos(p);
                              setPhotosModalOpen(true);
                            }}
                            title="Fotos do Produto"
                            className="p-1.5 rounded-lg bg-estrela-card hover:bg-white/10 text-estrela-gray-400 hover:text-white"
                          >
                            <Image className="w-3.5 h-3.5" />
                          </button>

                          {/* Editar */}
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setFormModalOpen(true);
                            }}
                            title="Editar Dados Técnicos"
                            className="p-1.5 rounded-lg bg-estrela-card hover:bg-white/10 text-blue-400"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Arquivar */}
                          {p.status !== 'archived' && (
                            <button
                              onClick={() => {
                                if (confirm(`Deseja arquivar a bateria "${p.name}"?`)) {
                                  archiveMutation.mutate(p.id);
                                }
                              }}
                              title="Arquivar Produto"
                              className="p-1.5 rounded-lg bg-estrela-card hover:bg-red-950 text-red-400"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-estrela-gray-400">
            Nenhum produto cadastrado com os critérios informados.
          </div>
        )}
      </div>

      {/* MODAL 1: FORMULÁRIO DE PRODUTO (NOVO OU EDITAR) */}
      {formModalOpen && (
        <ProductFormModal
          product={editingProduct}
          categories={categoriesData?.data || []}
          onClose={() => setFormModalOpen(false)}
          onSuccess={() => {
            setFormModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
          }}
        />
      )}

      {/* MODAL 2: GESTÃO DE FOTOS */}
      {photosModalOpen && activeProductForPhotos && (
        <ProductPhotosModal
          product={activeProductForPhotos}
          onClose={() => setPhotosModalOpen(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
          }}
        />
      )}

      {/* MODAL 3: GESTÃO DE COMPATIBILIDADES VEICULARES */}
      {compatModalOpen && activeProductForCompat && (
        <ProductCompatModal
          product={activeProductForCompat}
          onClose={() => setCompatModalOpen(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
          }}
        />
      )}

      {/* MODAL 4: IMPORTAÇÃO CSV */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-estrela-dark border border-estrela-card rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-estrela-red" />
                Importar Produtos via Arquivo CSV
              </h3>
              <button onClick={() => setImportModalOpen(false)} className="text-estrela-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-estrela-gray-400">
              O arquivo CSV deve conter as colunas: <code>Nome</code>, <code>Marca</code>, <code>Amperagem_Ah</code>, <code>SKU</code>, <code>Polo</code>, <code>Tecnologia</code> e <code>Descricao</code>.
            </p>

            <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={handleImportCsv}
                disabled={importing}
                className="text-xs text-estrela-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-estrela-red file:text-white hover:file:bg-estrela-red-hover cursor-pointer"
              />
              {importing && <p className="text-xs text-estrela-red mt-2 animate-pulse">Processando linhas do CSV...</p>}
            </div>

            {importReport && (
              <div className="p-4 rounded-xl bg-estrela-card text-xs space-y-2">
                <div className="flex items-center justify-between font-bold text-white">
                  <span>Resultado do Processamento:</span>
                  <span>{importReport.totalRows} linhas analisadas</span>
                </div>
                <div className="flex gap-4 text-estrela-gray-300">
                  <span className="text-emerald-400">Criados: {importReport.created}</span>
                  <span className="text-blue-400">Atualizados: {importReport.updated}</span>
                  <span className="text-rose-400">Erros: {importReport.errors.length}</span>
                </div>
                {importReport.errors.length > 0 && (
                  <div className="max-h-32 overflow-y-auto space-y-1 pt-2 border-t border-white/5 text-[11px] text-rose-300">
                    {importReport.errors.map((err: any, i: number) => (
                      <div key={i}>Linha {err.row}: {err.error}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setImportModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-estrela-card text-white text-xs font-semibold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- SUB-COMPONENTE: MODAL DE FORMULÁRIO DO PRODUTO ---
interface ProductFormModalProps {
  product: AdminProduct | null;
  categories: PublicCategory[];
  onClose: () => void;
  onSuccess: () => void;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  product,
  categories,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState(product?.name || '');
  const [brand, setBrand] = useState(product?.brand || 'Moura');
  const [sku, setSku] = useState(product?.sku || '');
  const [description, setDescription] = useState(product?.description || '');
  const [amperageAh, setAmperageAh] = useState(String(product?.amperageAh || 60));
  const [voltageV, setVoltageV] = useState(String(product?.voltageV || 12));
  const [ccaA, setCcaA] = useState(String(product?.ccaA || ''));
  const [dimensionsMm, setDimensionsMm] = useState(product?.dimensionsMm || '');
  const [warrantyMonths, setWarrantyMonths] = useState(String(product?.warrantyMonths || 18));
  const [polarity, setPolarity] = useState(product?.polarity || 'POSITIVE_RIGHT');
  const [technology, setTechnology] = useState(product?.technology || 'SLI');
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured || false);
  const [stockStatus, setStockStatus] = useState(product?.stockStatus || 'in_stock');
  const [status, setStatus] = useState(product?.status || 'active');
  const [internalCostNotes, setInternalCostNotes] = useState(product?.internalCostNotes || '');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    product?.categories?.map((c) => c.id) || []
  );

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');

    const payload = {
      name,
      brand,
      sku: sku || null,
      description,
      amperageAh: parseFloat(amperageAh),
      voltageV: parseInt(voltageV, 10),
      ccaA: ccaA ? parseInt(ccaA, 10) : null,
      dimensionsMm: dimensionsMm || null,
      warrantyMonths: warrantyMonths ? parseInt(warrantyMonths, 10) : null,
      polarity,
      technology,
      isFeatured,
      stockStatus,
      status,
      internalCostNotes: internalCostNotes || null,
      categoryIds: selectedCategoryIds,
    };

    try {
      if (product) {
        await apiFetch(`/admin/products/${product.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch('/admin/products', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao salvar produto.');
    } finally {
      setSaving(false);
    }
  };

  const toggleCategory = (id: string) => {
    if (selectedCategoryIds.includes(id)) {
      setSelectedCategoryIds(selectedCategoryIds.filter((cid) => cid !== id));
    } else {
      setSelectedCategoryIds([...selectedCategoryIds, id]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-estrela-dark border border-estrela-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-estrela-red" />
            {product ? 'Editar Bateria' : 'Cadastrar Nova Bateria'}
          </h3>
          <button onClick={onClose} className="text-estrela-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-red-950/40 border border-red-800 text-red-200 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-estrela-gray-300 mb-1">Nome do Produto *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Bateria Moura 60Ah M60GD"
                className="w-full bg-estrela-card border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-estrela-red"
              />
            </div>

            <div>
              <label className="block font-semibold text-estrela-gray-300 mb-1">Marca *</label>
              <input
                type="text"
                required
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Ex: Moura, Heliar, Bralmax"
                className="w-full bg-estrela-card border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-estrela-red"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block font-semibold text-estrela-gray-300 mb-1">Código / SKU</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="Ex: M60GD"
                className="w-full bg-estrela-card border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-estrela-red"
              />
            </div>

            <div>
              <label className="block font-semibold text-estrela-gray-300 mb-1">Amperagem (Ah) *</label>
              <input
                type="number"
                step="any"
                required
                value={amperageAh}
                onChange={(e) => setAmperageAh(e.target.value)}
                className="w-full bg-estrela-card border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-estrela-red"
              />
            </div>

            <div>
              <label className="block font-semibold text-estrela-gray-300 mb-1">Tensão (Volts) *</label>
              <input
                type="number"
                required
                value={voltageV}
                onChange={(e) => setVoltageV(e.target.value)}
                className="w-full bg-estrela-card border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-estrela-red"
              />
            </div>

            <div>
              <label className="block font-semibold text-estrela-gray-300 mb-1">Corrente CCA (-18°C)</label>
              <input
                type="number"
                value={ccaA}
                onChange={(e) => setCcaA(e.target.value)}
                placeholder="Ex: 460"
                className="w-full bg-estrela-card border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-estrela-red"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-estrela-gray-300 mb-1">Tecnologia</label>
              <select
                value={technology}
                onChange={(e) => setTechnology(e.target.value as any)}
                className="w-full bg-estrela-card border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-estrela-red cursor-pointer"
              >
                <option value="SLI">Convencional (SLI)</option>
                <option value="EFB">EFB (Start-Stop)</option>
                <option value="AGM">AGM (Alta Performance)</option>
                <option value="GEL">GEL / Tracionária</option>
                <option value="VRLA">VRLA Selada</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-estrela-gray-300 mb-1">Polaridade</label>
              <select
                value={polarity}
                onChange={(e) => setPolarity(e.target.value as any)}
                className="w-full bg-estrela-card border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-estrela-red cursor-pointer"
              >
                <option value="POSITIVE_RIGHT">Positivo Direito (D)</option>
                <option value="POSITIVE_LEFT">Positivo Esquerdo (E)</option>
                <option value="CENTER">Pólos Centrais</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-estrela-gray-300 mb-1">Garantia (Meses)</label>
              <input
                type="number"
                value={warrantyMonths}
                onChange={(e) => setWarrantyMonths(e.target.value)}
                placeholder="Ex: 18 ou 24"
                className="w-full bg-estrela-card border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-estrela-red"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-estrela-gray-300 mb-1">Dimensões (mm)</label>
            <input
              type="text"
              value={dimensionsMm}
              onChange={(e) => setDimensionsMm(e.target.value)}
              placeholder="Ex: 242 x 175 x 175 mm"
              className="w-full bg-estrela-card border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-estrela-red"
            />
          </div>

          <div>
            <label className="block font-semibold text-estrela-gray-300 mb-1">Descrição Técnica e Comercial *</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-estrela-card border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-estrela-red"
            />
          </div>

          {/* Categorias */}
          <div>
            <label className="block font-semibold text-estrela-gray-300 mb-1">Categorias Associadas</label>
            <div className="flex flex-wrap gap-2 pt-1">
              {categories.map((c) => {
                const isSelected = selectedCategoryIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCategory(c.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                      isSelected
                        ? 'bg-estrela-red text-white'
                        : 'bg-estrela-card text-estrela-gray-400 hover:text-white'
                    }`}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notas de Custo Internas (NUNCA VAI PARA API PÚBLICA) */}
          <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/40 space-y-1">
            <span className="font-bold text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Notas de Custo Internas (Uso Exclusivo do Administrador)
            </span>
            <p className="text-[11px] text-estrela-gray-400">
              Campo seguro. Nunca é exposto nos endpoints públicos de catálogo.
            </p>
            <input
              type="text"
              value={internalCostNotes}
              onChange={(e) => setInternalCostNotes(e.target.value)}
              placeholder="Ex: Custo R$ 380 com fornecedor. Preço balcão R$ 510 com sucata."
              className="w-full bg-estrela-black/80 border border-white/10 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-estrela-red mt-1"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block font-semibold text-estrela-gray-300 mb-1">Status de Publicação</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-estrela-card border border-white/10 rounded-lg px-3 py-2 text-white"
              >
                <option value="active">Ativo (Publicado)</option>
                <option value="draft">Rascunho (Oculto)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-estrela-gray-300 mb-1">Disponibilidade de Estoque</label>
              <select
                value={stockStatus}
                onChange={(e) => setStockStatus(e.target.value as any)}
                className="w-full bg-estrela-card border border-white/10 rounded-lg px-3 py-2 text-white"
              >
                <option value="in_stock">Pronta Entrega (Em Estoque)</option>
                <option value="on_demand">Sob Encomenda</option>
                <option value="out_of_stock">Esgotado</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="isFeatured"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded border-white/20 text-estrela-red focus:ring-0"
              />
              <label htmlFor="isFeatured" className="font-semibold text-white cursor-pointer">
                Destacar na Página Inicial
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-white/10 text-white font-semibold hover:bg-white/5"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 rounded-lg bg-estrela-red hover:bg-estrela-red-hover text-white font-bold transition disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Salvar Bateria'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTE: GESTÃO DE FOTOS ---
interface ProductPhotosModalProps {
  product: AdminProduct;
  onClose: () => void;
  onSuccess: () => void;
}

const ProductPhotosModal: React.FC<ProductPhotosModalProps> = ({ product, onClose, onSuccess }) => {
  const [images, setImages] = useState(product.images || []);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_BASE_URL}/admin/products/${product.id}/images`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('estrela_admin_token') || ''}`,
        },
        credentials: 'include',
        body: formData,
      });

      if (!res.ok) throw new Error('Falha no upload');
      const data = await res.json();
      setImages([...images, data.image]);
      onSuccess();
    } catch {
      alert('Erro ao enviar imagem. Verifique se o arquivo tem até 5MB.');
    } finally {
      setUploading(false);
    }
  };

  const handleSetCover = async (imageId: string) => {
    try {
      await apiFetch(`/admin/products/${product.id}/images/${imageId}`, {
        method: 'PUT',
        body: JSON.stringify({ isCover: true }),
      });
      setImages(images.map((img) => ({ ...img, isCover: img.id === imageId })));
      onSuccess();
    } catch {
      alert('Erro ao definir foto de capa.');
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Deseja excluir esta imagem?')) return;
    try {
      await apiFetch(`/admin/products/${product.id}/images/${imageId}`, {
        method: 'DELETE',
      });
      setImages(images.filter((img) => img.id !== imageId));
      onSuccess();
    } catch {
      alert('Erro ao remover imagem.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-estrela-dark border border-estrela-card rounded-2xl w-full max-w-xl p-6 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Image className="w-5 h-5 text-estrela-red" />
              Fotos do Produto
            </h3>
            <span className="text-xs text-estrela-gray-400">{product.name}</span>
          </div>
          <button onClick={onClose} className="text-estrela-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload de nova foto */}
        <div className="border-2 border-dashed border-white/10 rounded-xl p-4 text-center">
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={handleUpload}
            className="text-xs text-estrela-gray-300 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-estrela-red file:text-white hover:file:bg-estrela-red-hover cursor-pointer"
          />
          {uploading && <p className="text-xs text-estrela-red mt-2 animate-pulse">Enviando foto...</p>}
        </div>

        {/* Grade de fotos existentes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="relative aspect-square rounded-xl bg-estrela-card overflow-hidden border border-white/10 group"
            >
              <img src={img.url} alt="" className="w-full h-full object-cover" />

              {img.isCover && (
                <span className="absolute top-2 left-2 bg-estrela-red text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                  Capa
                </span>
              )}

              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                {!img.isCover && (
                  <button
                    onClick={() => handleSetCover(img.id)}
                    title="Definir como capa"
                    className="p-1.5 rounded-lg bg-estrela-red text-white text-xs font-semibold"
                  >
                    <Star className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => handleDeleteImage(img.id)}
                  title="Excluir foto"
                  className="p-1.5 rounded-lg bg-red-800 text-white"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-estrela-card text-white text-xs font-semibold"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTE: GESTÃO DE COMPATIBILIDADES ---
interface ProductCompatModalProps {
  product: AdminProduct;
  onClose: () => void;
  onSuccess: () => void;
}

const ProductCompatModal: React.FC<ProductCompatModalProps> = ({ product, onClose, onSuccess }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [notes, setNotes] = useState('');
  const [adding, setAdding] = useState(false);

  // Busca versões veiculares para vincular
  const { data: variantsData } = useQuery({
    queryKey: ['admin-variants-search', searchTerm],
    queryFn: () => apiFetch<{ data: PublicVehicleVariant[] }>(`/admin/vehicles/variants?search=${encodeURIComponent(searchTerm)}`),
  });

  // Busca detalhes do produto para ver compatibilidades atuais
  const { data: productDetail, refetch } = useQuery({
    queryKey: ['admin-product-detail-compats', product.id],
    queryFn: () => apiFetch<{ product: any }>(`/admin/products/${product.id}`),
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVariantId) return;

    setAdding(true);
    try {
      await apiFetch(`/admin/products/${product.id}/compatibilities`, {
        method: 'POST',
        body: JSON.stringify({
          vehicleVariantId: selectedVariantId,
          technicalNotes: notes || null,
          validationStatus: 'verified',
        }),
      });
      setSelectedVariantId('');
      setNotes('');
      refetch();
      onSuccess();
    } catch {
      alert('Falha ao adicionar compatibilidade.');
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (variantId: string) => {
    try {
      await apiFetch(`/admin/products/${product.id}/compatibilities/${variantId}`, {
        method: 'DELETE',
      });
      refetch();
      onSuccess();
    } catch {
      alert('Falha ao desvincular veículo.');
    }
  };

  const currentCompats = productDetail?.product?.compatibilities || [];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-estrela-dark border border-estrela-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Car className="w-5 h-5 text-estrela-red" />
              Veículos Compatíveis com a Bateria
            </h3>
            <span className="text-xs text-estrela-gray-400">{product.name} ({product.amperageAh} Ah)</span>
          </div>
          <button onClick={onClose} className="text-estrela-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário para Adicionar Compatibilidade */}
        <form onSubmit={handleAdd} className="bg-estrela-card/60 p-4 rounded-xl border border-white/5 space-y-3 text-xs">
          <span className="font-bold text-white block">Vincular Novo Modelo de Carro</span>

          <div className="space-y-2">
            <input
              type="text"
              placeholder="Filtrar modelos por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-estrela-dark border border-white/10 rounded-lg px-3 py-1.5 text-white placeholder-estrela-gray-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-estrela-gray-300 mb-1">Buscar e Selecionar Versão *</label>
              <select
                required
                value={selectedVariantId}
                onChange={(e) => setSelectedVariantId(e.target.value)}
                className="w-full bg-estrela-dark border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-estrela-red cursor-pointer"
              >
                <option value="">Selecione a versão...</option>
                {variantsData?.data.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.makeName} {v.modelName} - {v.name} ({v.yearStart}{v.yearEnd ? `-${v.yearEnd}` : '+'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-estrela-gray-300 mb-1">Observações Técnicas de Instalação</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Recomendada para versões com ar-condicionado."
                className="w-full bg-estrela-dark border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-estrela-red"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={adding || !selectedVariantId}
              className="px-4 py-2 rounded-lg bg-estrela-red hover:bg-estrela-red-hover text-white font-bold transition disabled:opacity-50"
            >
              {adding ? 'Vinculando...' : 'Adicionar Compatibilidade'}
            </button>
          </div>
        </form>

        {/* Lista de Compatibilidades Atuais */}
        <div className="space-y-3">
          <span className="font-bold text-white text-xs block">
            Aplicações Atualmente Cadastradas ({currentCompats.length})
          </span>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {currentCompats.map((c: any) => (
              <div
                key={c.id}
                className="p-3 rounded-lg bg-estrela-card border border-white/5 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-white">
                    {c.vehicleVariant?.model?.make?.name} {c.vehicleVariant?.model?.name} - {c.vehicleVariant?.name}
                  </span>
                  <span className="text-estrela-gray-400 block text-[11px]">
                    Anos: {c.vehicleVariant?.yearStart} a {c.vehicleVariant?.yearEnd || 'atual'}
                    {c.technicalNotes && ` • ${c.technicalNotes}`}
                  </span>
                </div>
                <button
                  onClick={() => handleRemove(c.vehicleVariantId)}
                  className="p-1 rounded text-red-400 hover:bg-white/10"
                  title="Desvincular"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-estrela-card text-white text-xs font-semibold"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
