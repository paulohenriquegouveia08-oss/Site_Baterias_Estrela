import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import { PublicContactChannel, formatPhoneNumber } from '@baterias-estrela/shared';
import { BatteryLoader } from '../../components/common/BatteryLoader';
import { Phone, Plus, Edit, Trash2, X, MessageCircle, Star, CheckCircle2 } from 'lucide-react';

export const AdminContacts: React.FC = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<PublicContactChannel | null>(null);

  const [label, setLabel] = useState('');
  const [number, setNumber] = useState('');
  const [type, setType] = useState<'whatsapp' | 'phone'>('whatsapp');
  const [placement, setPlacement] = useState<'all' | 'header' | 'footer' | 'contact' | 'services'>('all');
  const [isDefault, setIsDefault] = useState(false);
  const [displayOrder, setDisplayOrder] = useState('0');
  const [status, setStatus] = useState('active');

  const { data, isLoading } = useQuery<{ data: (PublicContactChannel & { status: string })[] }>({
    queryKey: ['admin-contacts'],
    queryFn: () => apiFetch('/admin/contacts'),
  });

  const saveMutation = useMutation({
    mutationFn: (payload: any) => {
      if (editingContact) {
        return apiFetch(`/admin/contacts/${editingContact.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      }
      return apiFetch('/admin/contacts', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-contacts'] });
      queryClient.invalidateQueries({ queryKey: ['site-public-settings'] });
      setModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/admin/contacts/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-contacts'] });
      queryClient.invalidateQueries({ queryKey: ['site-public-settings'] });
    },
  });

  const handleOpenModal = (contact?: PublicContactChannel) => {
    if (contact) {
      setEditingContact(contact);
      setLabel(contact.label);
      setNumber(contact.number);
      setType(contact.type);
      setPlacement(contact.placement);
      setIsDefault(contact.isDefault);
      setDisplayOrder(String(contact.displayOrder || 0));
      setStatus((contact as any).status || 'active');
    } else {
      setEditingContact(null);
      setLabel('');
      setNumber('');
      setType('whatsapp');
      setPlacement('all');
      setIsDefault(false);
      setDisplayOrder('0');
      setStatus('active');
    }
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      label,
      number,
      type,
      placement,
      isDefault,
      displayOrder: parseInt(displayOrder, 10),
      status,
    });
  };

  const placementLabels: Record<string, string> = {
    all: 'Em Todo o Site',
    header: 'Apenas Cabeçalho',
    footer: 'Apenas Rodapé',
    contact: 'Apenas Página de Contato',
    services: 'Apenas Seção de Serviços',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-6 border-b border-estrela-card">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Phone className="w-6 h-6 text-estrela-red" />
            Canais de Contato (WhatsApp e Telefone)
          </h1>
          <p className="text-xs text-estrela-gray-400 mt-1">
            Configure números e defina onde cada canal deve ser exibido na vitrine pública.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 rounded-lg bg-estrela-red hover:bg-estrela-red-hover text-white text-xs font-bold transition flex items-center gap-2 shadow"
        >
          <Plus className="w-4 h-4" />
          Novo Canal
        </button>
      </div>

      <div className="bg-estrela-dark border border-estrela-card rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="py-16">
            <BatteryLoader label="Carregando canais de contato..." />
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-estrela-card/60 text-estrela-gray-400 border-b border-white/10">
              <tr>
                <th className="py-3 px-4 font-semibold">Tipo</th>
                <th className="py-3 px-4 font-semibold">Rótulo / Nome</th>
                <th className="py-3 px-4 font-semibold">Número Formatado</th>
                <th className="py-3 px-4 font-semibold">Onde Aparece</th>
                <th className="py-3 px-4 font-semibold text-center">Padrão</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data?.data?.map((c) => (
                <tr key={c.id} className="hover:bg-white/5">
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold ${
                      c.type === 'whatsapp' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800' : 'bg-blue-950/60 text-blue-400 border border-blue-800'
                    }`}>
                      {c.type === 'whatsapp' ? <MessageCircle className="w-3 h-3 fill-current" /> : <Phone className="w-3 h-3" />}
                      {c.type === 'whatsapp' ? 'WhatsApp' : 'Telefone'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-white">{c.label}</td>
                  <td className="py-3 px-4 font-mono font-bold text-white">{formatPhoneNumber(c.number)}</td>
                  <td className="py-3 px-4 text-estrela-gray-300">{placementLabels[c.placement] || c.placement}</td>
                  <td className="py-3 px-4 text-center">
                    {c.isDefault ? (
                      <span className="text-amber-400 font-bold flex items-center justify-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-current" /> Sim
                      </span>
                    ) : (
                      <span className="text-estrela-gray-600">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {c.status === 'active' ? (
                      <span className="text-emerald-400 font-semibold flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ativo
                      </span>
                    ) : (
                      <span className="text-estrela-gray-500 font-semibold">Inativo</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(c)}
                        className="p-1.5 rounded-lg bg-estrela-card text-blue-400 hover:text-white"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Remover canal "${c.label}"?`)) {
                            deleteMutation.mutate(c.id);
                          }
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

      {/* Modal Canal de Contato */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-estrela-dark border border-estrela-card rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-base font-bold text-white">
                {editingContact ? 'Editar Canal de Contato' : 'Novo Canal de Contato'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-estrela-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-estrela-gray-300 font-semibold mb-1">Rótulo / Nome de Exibição *</label>
                <input
                  type="text"
                  required
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Ex: WhatsApp Vendas e Socorro"
                  className="w-full bg-estrela-card border border-white/10 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-estrela-gray-300 font-semibold mb-1">Número com DDD *</label>
                <input
                  type="text"
                  required
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  placeholder="Ex: 43996110253"
                  className="w-full bg-estrela-card border border-white/10 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-estrela-gray-300 font-semibold mb-1">Tipo de Canal</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-estrela-card border border-white/10 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="phone">Telefone (Ligação)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-estrela-gray-300 font-semibold mb-1">Onde Exibir no Site</label>
                  <select
                    value={placement}
                    onChange={(e) => setPlacement(e.target.value as any)}
                    className="w-full bg-estrela-card border border-white/10 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="all">Em todo o site</option>
                    <option value="header">Cabeçalho</option>
                    <option value="footer">Rodapé</option>
                    <option value="contact">Página de Contato</option>
                    <option value="services">Página de Serviços</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded border-white/20 text-estrela-red focus:ring-0"
                />
                <label htmlFor="isDefault" className="font-semibold text-white cursor-pointer">
                  Definir como número principal padrão
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
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
                  Salvar Canal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
