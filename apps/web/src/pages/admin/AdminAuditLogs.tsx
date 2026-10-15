import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import { BatteryLoader } from '../../components/common/BatteryLoader';
import { ShieldCheck } from 'lucide-react';

export const AdminAuditLogs: React.FC = () => {
  const { data, isLoading } = useQuery<{ data: any[]; meta: any }>({
    queryKey: ['admin-audit-logs'],
    queryFn: () => apiFetch('/admin/audit-logs'),
  });

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-estrela-card">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-estrela-red" />
          Trilha de Auditoria e Segurança
        </h1>
        <p className="text-xs text-estrela-gray-400 mt-1">
          Registro de ações críticas executadas por administradores para conformidade e rastreabilidade.
        </p>
      </div>

      <div className="bg-estrela-dark border border-estrela-card rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="py-20">
            <BatteryLoader label="Carregando registros de auditoria..." />
          </div>
        ) : data?.data && data.data.length > 0 ? (
          <table className="w-full text-left text-xs">
            <thead className="bg-estrela-card/60 text-estrela-gray-400 border-b border-white/10">
              <tr>
                <th className="py-3 px-4 font-semibold">Data / Hora</th>
                <th className="py-3 px-4 font-semibold">Administrador</th>
                <th className="py-3 px-4 font-semibold">Ação</th>
                <th className="py-3 px-4 font-semibold">Entidade</th>
                <th className="py-3 px-4 font-semibold">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.data.map((log) => (
                <tr key={log.id} className="hover:bg-white/5">
                  <td className="py-3 px-4 text-estrela-gray-400 font-mono text-[11px]">
                    {new Date(log.createdAt).toLocaleString('pt-BR')}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-white block">{log.adminUser?.name || 'Sistema'}</span>
                    <span className="text-[10px] text-estrela-gray-400">{log.adminUser?.email || '-'}</span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold">
                    <span className="px-2 py-0.5 rounded bg-estrela-card text-estrela-red">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white font-medium">{log.entityType}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-estrela-gray-400 max-w-md truncate">
                    {log.details ? JSON.stringify(log.details) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-12 text-center text-xs text-estrela-gray-400">
            Nenhum registro de auditoria gravado até o momento.
          </div>
        )}
      </div>
    </div>
  );
};
