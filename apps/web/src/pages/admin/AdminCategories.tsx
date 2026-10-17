import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import { PublicCategory } from '@baterias-estrela/shared';
import { BatteryLoader } from '../../components/common/BatteryLoader';
import { Layers, Plus, Edit, Trash2, X } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export const AdminCategories: React.FC = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<PublicCategory | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [status, setStatus] = useState('active');

  const { data, isLoading } = useQuery<{ data: (PublicCategory & { status: string; productsCount: number })[] }>({
    queryKey: ['admin-categories'],
    queryFn: () => apiFetch('/admin/categories'),
  });

  const saveMutation = useMutation({
    mutationFn: (payload: any) => {
      if (editingCategory) {
        return apiFetch(`/admin/categories/${editingCategory.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      }
      return apiFetch('/admin/categories', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/admin/categories/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    },
  });

  const handleOpenModal = (cat?: PublicCategory) => {
    if (cat) {
      setEditingCategory(cat);
      setName(cat.name);
      setDescription(cat.description || '');
      setDisplayOrder(String(cat.displayOrder || 0));
      setStatus((cat as any).status || 'active');
    } else {
      setEditingCategory(null);
      setName('');
      setDescription('');
      setDisplayOrder('0');
      setStatus('active');
    }
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      name,
      description: description || null,
      displayOrder: parseInt(displayOrder, 10),
      status,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-6 border-b border-estrela-card">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-estrela-red" />
            Categorias de Baterias
          </h1>
          <p className="text-xs text-estrela-gray-400 mt-1">
            Organização do catálogo público por finalidade e tecnologia.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 rounded-lg bg-estrela-red hover:bg-estrela-red-hover text-white text-xs font-bold transition flex items-center gap-2 shadow"
        >
          <Plus className="w-4 h-4" />
          Nova Categoria
        </button>
      </div>

      <div className="bg-estrela-dark border border-estrela-card rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="py-16">
            <BatteryLoader label="Carregando categorias..." />
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-estrela-card/60 text-estrela-gray-400 border-b border-white/10">
              <tr>
                <th className="py-3 px-4 font-semibold">Ordem</th>
                <th className="py-3 px-4 font-semibold">Nome</th>
                <th className="py-3 px-4 font-semibold">Slug</th>
                <th className="py-3 px-4 font-semibold">Descrição</th>
                <th className="py-3 px-4 font-semibold text-center">Produtos Vinculados</th>
                <th className="py-3 px-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data?.data?.map((cat) => (
                <tr key={cat.id} className="hover:bg-white/5">
                  <td className="py-3 px-4 font-bold text-estrela-red">{cat.displayOrder}</td>
                  <td className="py-3 px-4 font-bold text-white">{cat.name}</td>
                  <td className="py-3 px-4 font-mono text-estrela-gray-400">{cat.slug}</td>
                  <td className="py-3 px-4 text-estrela-gray-300 max-w-sm truncate">{cat.description || '-'}</td>
                  <td className="py-3 px-4 text-center font-bold text-white">{cat.productsCount || 0}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(cat)}
                        className="p-1.5 rounded-lg bg-estrela-card text-blue-400 hover:text-white"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          toast.confirm({
                            title: 'Excluir Categoria',
                            message: `Deseja realmente excluir a categoria "${cat.name}"?`,
                            confirmText: 'Excluir Categoria',
                            isDanger: true,
                            onConfirm: () => deleteMutation.mutateAsync(cat.id),
                          });
                        }}
                        className="p-1.5 rounded-lg bg-estrela-card text-red-400 hover:text-white"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Categoria */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-estrela-dark border border-estrela-card rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-base font-bold text-white">
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-estrela-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-estrela-gray-300 font-semibold mb-1">Nome *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Baterias para SUV e Utilitários"
                  className="w-full bg-estrela-card border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-estrela-red"
                />
              </div>

              <div>
                <label className="block text-estrela-gray-300 font-semibold mb-1">Descrição</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-estrela-card border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-estrela-red"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-estrela-gray-300 font-semibold mb-1">Ordem de Exibição</label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(e.target.value)}
                    className="w-full bg-estrela-card border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-estrela-red"
                  />
                </div>

                <div>
                  <label className="block text-estrela-gray-300 font-semibold mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-estrela-card border border-white/10 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-white/10 text-white font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="px-5 py-2 rounded-lg bg-estrela-red text-white font-bold"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
