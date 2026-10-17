import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import { PublicService } from '@baterias-estrela/shared';
import { BatteryLoader } from '../../components/common/BatteryLoader';
import { Wrench, Plus, Edit, Trash2, X, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export const AdminServices: React.FC = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<PublicService | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [iconName, setIconName] = useState('Zap');
  const [regionServed, setRegionServed] = useState('Arapongas e região');
  const [workingHours, setWorkingHours] = useState('Seg a Sex 08h às 18h | Sáb até 12h30');
  const [ctaText, setCtaText] = useState('Solicitar Atendimento');
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [status, setStatus] = useState('active');

  const { data, isLoading } = useQuery<{ data: (PublicService & { status: string })[] }>({
    queryKey: ['admin-services'],
    queryFn: () => apiFetch('/admin/services'),
  });

  const saveMutation = useMutation({
    mutationFn: (payload: any) => {
      if (editingService) {
        return apiFetch(`/admin/services/${editingService.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      }
      return apiFetch('/admin/services', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      setModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/admin/services/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
    },
  });

  const handleOpenModal = (srv?: PublicService) => {
    if (srv) {
      setEditingService(srv);
      setName(srv.name);
      setDescription(srv.description);
      setIconName(srv.iconName || 'Zap');
      setRegionServed(srv.regionServed);
      setWorkingHours(srv.workingHours || '');
      setCtaText(srv.ctaText || 'Solicitar Atendimento');
      setWhatsappMessage(srv.whatsappMessage || '');
      setDisplayOrder(String(srv.displayOrder || 0));
      setStatus((srv as any).status || 'active');
    } else {
      setEditingService(null);
      setName('');
      setDescription('');
      setIconName('Zap');
      setRegionServed('Arapongas e região');
      setWorkingHours('Seg a Sex 08h às 18h | Sáb até 12h30');
      setCtaText('Solicitar Atendimento');
      setWhatsappMessage('');
      setDisplayOrder('0');
      setStatus('active');
    }
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      name,
      description,
      iconName,
      regionServed,
      workingHours: workingHours || null,
      ctaText: ctaText || 'Solicitar Atendimento',
      whatsappMessage: whatsappMessage || null,
      displayOrder: parseInt(displayOrder, 10),
      status,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-6 border-b border-estrela-card">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Wrench className="w-6 h-6 text-estrela-red" />
            Serviços Automotivos Oferecidos
          </h1>
          <p className="text-xs text-estrela-gray-400 mt-1">
            Cadastre, edite, ative ou desative serviços exibidos no site público.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 rounded-lg bg-estrela-red hover:bg-estrela-red-hover text-white text-xs font-bold transition flex items-center gap-2 shadow"
        >
          <Plus className="w-4 h-4" />
          Novo Serviço
        </button>
      </div>

      <div className="bg-estrela-dark border border-estrela-card rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="py-16">
            <BatteryLoader label="Carregando serviços..." />
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-estrela-card/60 text-estrela-gray-400 border-b border-white/10">
              <tr>
                <th className="py-3 px-4 font-semibold">Ordem</th>
                <th className="py-3 px-4 font-semibold">Serviço</th>
                <th className="py-3 px-4 font-semibold">Região Atendida</th>
                <th className="py-3 px-4 font-semibold">Horários</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data?.data?.map((srv) => (
                <tr key={srv.id} className="hover:bg-white/5">
                  <td className="py-3 px-4 font-bold text-estrela-red">{srv.displayOrder}</td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-white block">{srv.name}</span>
                    <span className="text-[10px] text-estrela-gray-400 line-clamp-1">{srv.description}</span>
                  </td>
                  <td className="py-3 px-4 text-estrela-gray-300">{srv.regionServed}</td>
                  <td className="py-3 px-4 text-estrela-gray-400">{srv.workingHours || '-'}</td>
                  <td className="py-3 px-4 text-center">
                    {srv.status === 'active' ? (
                      <span className="text-emerald-400 font-bold flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ativo
                      </span>
                    ) : (
                      <span className="text-estrela-gray-500 font-bold">Inativo</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(srv)}
                        className="p-1.5 rounded-lg bg-estrela-card text-blue-400 hover:text-white"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          toast.confirm({
                            title: 'Remover Serviço',
                            message: `Deseja realmente remover o serviço "${srv.name}"?`,
                            confirmText: 'Remover Serviço',
                            isDanger: true,
                            onConfirm: () => deleteMutation.mutateAsync(srv.id),
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

      {/* Modal Serviço */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-estrela-dark border border-estrela-card rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-base font-bold text-white">
                {editingService ? 'Editar Serviço' : 'Novo Serviço'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-estrela-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-estrela-gray-300 font-semibold mb-1">Nome do Serviço *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Entrega e Instalação Grátis em Arapongas"
                  className="w-full bg-estrela-card border border-white/10 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-estrela-gray-300 font-semibold mb-1">Descrição Completa *</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-estrela-card border border-white/10 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-estrela-gray-300 font-semibold mb-1">Ícone</label>
                  <select
                    value={iconName}
                    onChange={(e) => setIconName(e.target.value)}
                    className="w-full bg-estrela-card border border-white/10 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="Zap">Raio (Zap)</option>
                    <option value="Truck">Caminhão (Truck)</option>
                    <option value="Gauge">Manômetro / Teste (Gauge)</option>
                    <option value="ShieldCheck">Escudo / Garantia (ShieldCheck)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-estrela-gray-300 font-semibold mb-1">Região Atendida</label>
                  <input
                    type="text"
                    value={regionServed}
                    onChange={(e) => setRegionServed(e.target.value)}
                    placeholder="Ex: Arapongas e proximidades"
                    className="w-full bg-estrela-card border border-white/10 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-estrela-gray-300 font-semibold mb-1">Texto do Botão (CTA)</label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="Ex: Chamar Socorro"
                    className="w-full bg-estrela-card border border-white/10 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-estrela-gray-300 font-semibold mb-1">Ordem / Status</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={displayOrder}
                      onChange={(e) => setDisplayOrder(e.target.value)}
                      className="w-20 bg-estrela-card border border-white/10 rounded-lg px-3 py-2 text-white"
                    />
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="flex-1 bg-estrela-card border border-white/10 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="active">Ativo</option>
                      <option value="inactive">Inativo</option>
                    </select>
                  </div>
                </div>
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
