import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import { BatteryLoader } from '../../components/common/BatteryLoader';
import { formatPhoneNumber, buildWhatsAppLink } from '@baterias-estrela/shared';
import { Bell, MessageCircle } from 'lucide-react';

export const AdminServiceRequests: React.FC = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ data: any[]; meta: any }>({
    queryKey: ['admin-service-requests'],
    queryFn: () => apiFetch('/admin/service-requests'),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiFetch(`/admin/service-requests/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-service-requests'] });
    },
  });

  const onOpenClientWhatsApp = (phone: string, name: string) => {
    const url = buildWhatsAppLink(phone, `Olá ${name}! Somos da Baterias Estrela em Arapongas. Vimos sua solicitação no site.`);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-estrela-card">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Bell className="w-6 h-6 text-estrela-red" />
          Solicitações e Chamados Recebidos
        </h1>
        <p className="text-xs text-estrela-gray-400 mt-1">
          Histórico de pedidos de socorro, orçamentos e agendamentos enviados pelo site.
        </p>
      </div>

      <div className="bg-estrela-dark border border-estrela-card rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="py-20">
            <BatteryLoader label="Carregando chamados..." />
          </div>
        ) : data?.data && data.data.length > 0 ? (
          <table className="w-full text-left text-xs">
            <thead className="bg-estrela-card/60 text-estrela-gray-400 border-b border-white/10">
              <tr>
                <th className="py-3 px-4 font-semibold">Data / Hora</th>
                <th className="py-3 px-4 font-semibold">Cliente</th>
                <th className="py-3 px-4 font-semibold">Contato</th>
                <th className="py-3 px-4 font-semibold">Veículo / Local</th>
                <th className="py-3 px-4 font-semibold">Serviço / Mensagem</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.data.map((req) => (
                <tr key={req.id} className="hover:bg-white/5">
                  <td className="py-3 px-4 text-estrela-gray-400 font-mono text-[11px]">
                    {new Date(req.createdAt).toLocaleString('pt-BR')}
                  </td>
                  <td className="py-3 px-4 font-bold text-white">{req.name}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-white">
                    {formatPhoneNumber(req.phone)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-white block font-medium">{req.vehicle || '-'}</span>
                    <span className="text-[10px] text-estrela-gray-400 block">{req.addressReference}</span>
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    {req.service && <span className="font-bold text-estrela-red block">{req.service.name}</span>}
                    <span className="text-estrela-gray-300 text-[11px] line-clamp-2">{req.notes || '-'}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <select
                      value={req.status}
                      onChange={(e) => updateStatusMutation.mutate({ id: req.id, status: e.target.value })}
                      className="bg-estrela-card border border-white/10 rounded px-2 py-1 text-xs text-white cursor-pointer"
                    >
                      <option value="new">Novo</option>
                      <option value="contacted">Em Atendimento</option>
                      <option value="completed">Concluído</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onOpenClientWhatsApp(req.phone, req.name)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-current" />
                      <span>WhatsApp</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-12 text-center text-xs text-estrela-gray-400">
            Nenhuma solicitação recebida até o momento.
          </div>
        )}
      </div>
    </div>
  );
};
