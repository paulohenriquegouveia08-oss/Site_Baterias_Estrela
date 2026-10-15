import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import {
  AnalyticsSummary,
  TimeSeriesPoint,
  TopProductItem,
  TopPageItem,
  TrafficSourceItem,
} from '@baterias-estrela/shared';
import { BatteryLoader } from '../../components/common/BatteryLoader';
import {
  Users,
  Eye,
  MessageCircle,
  Phone,
  Search,
  AlertCircle,
  Wrench,
  TrendingUp,
  Globe,
  Package,
  Calendar,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const [period, setPeriod] = useState<'today' | '7d' | '30d'>('7d');

  // 1. Resumo de Métricas
  const { data: summary, isLoading: loadingSummary } = useQuery<AnalyticsSummary>({
    queryKey: ['admin-summary', period],
    queryFn: () => apiFetch<AnalyticsSummary>(`/admin/analytics/summary?period=${period}`),
  });

  // 2. Série Temporal para Gráficos
  const { data: timeseriesData } = useQuery<{ data: TimeSeriesPoint[] }>({
    queryKey: ['admin-timeseries', period],
    queryFn: () => apiFetch<{ data: TimeSeriesPoint[] }>(`/admin/analytics/timeseries?period=${period}`),
  });

  // 3. Top Produtos
  const { data: topProductsData } = useQuery<{ data: TopProductItem[] }>({
    queryKey: ['admin-top-products', period],
    queryFn: () => apiFetch<{ data: TopProductItem[] }>(`/admin/analytics/top-products?period=${period}`),
  });

  // 4. Top Páginas
  const { data: topPagesData } = useQuery<{ data: TopPageItem[] }>({
    queryKey: ['admin-top-pages', period],
    queryFn: () => apiFetch<{ data: TopPageItem[] }>(`/admin/analytics/top-pages?period=${period}`),
  });

  // 5. Origem de Tráfego
  const { data: sourcesData } = useQuery<{ data: TrafficSourceItem[] }>({
    queryKey: ['admin-sources', period],
    queryFn: () => apiFetch<{ data: TrafficSourceItem[] }>(`/admin/analytics/sources?period=${period}`),
  });

  if (loadingSummary) {
    return (
      <div className="py-24">
        <BatteryLoader size="lg" label="Calculando métricas reais do banco de dados..." />
      </div>
    );
  }

  const kpis = [
    {
      label: 'Visitas Totais (Views)',
      value: summary?.totalPageViews || 0,
      icon: Eye,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Visitantes Únicos Estimados',
      value: summary?.estimatedUniqueVisitors || 0,
      icon: Users,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
    },
    {
      label: 'Cliques no WhatsApp',
      value: summary?.whatsappClicks || 0,
      icon: MessageCircle,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Cliques para Ligar',
      value: summary?.phoneClicks || 0,
      icon: Phone,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'Consultas de Baterias',
      value: summary?.productViews || 0,
      icon: Package,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
    },
    {
      label: 'Buscas por Veículo',
      value: summary?.vehicleSearches || 0,
      icon: Search,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
    {
      label: 'Buscas Sem Resultado',
      value: summary?.unmatchedVehicleSearches || 0,
      icon: AlertCircle,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
    },
    {
      label: 'Interações com Serviços',
      value: summary?.serviceInteractions || 0,
      icon: Wrench,
      color: 'text-teal-400',
      bg: 'bg-teal-500/10',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Header do Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-estrela-card">
        <div>
          <h1 className="text-2xl font-black text-white">Dashboard de Desempenho</h1>
          <p className="text-xs text-estrela-gray-400 mt-1">
            Métricas em tempo real geradas a partir de eventos analíticos pseudonimizados.
          </p>
        </div>

        {/* Seletor de Período */}
        <div className="flex items-center gap-2 bg-estrela-dark border border-estrela-card p-1 rounded-xl">
          <Calendar className="w-4 h-4 text-estrela-gray-400 ml-2" />
          <button
            onClick={() => setPeriod('today')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              period === 'today' ? 'bg-estrela-red text-white' : 'text-estrela-gray-400 hover:text-white'
            }`}
          >
            Hoje
          </button>
          <button
            onClick={() => setPeriod('7d')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              period === '7d' ? 'bg-estrela-red text-white' : 'text-estrela-gray-400 hover:text-white'
            }`}
          >
            7 dias
          </button>
          <button
            onClick={() => setPeriod('30d')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              period === '30d' ? 'bg-estrela-red text-white' : 'text-estrela-gray-400 hover:text-white'
            }`}
          >
            30 dias
          </button>
        </div>
      </div>

      {/* Destaque Taxa de Conversão */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-estrela-dark via-estrela-card to-estrela-dark border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-estrela-red/20 text-estrela-red flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-estrela-gray-400 uppercase font-semibold">
              Taxa Estimada de Contato Comercial
            </span>
            <h3 className="text-2xl font-black text-white">
              {summary?.contactConversionRatePct || 0}%
            </h3>
            <span className="text-xs text-estrela-gray-300">
              Proporção de visitantes únicos que acionaram o WhatsApp ou telefone.
            </span>
          </div>
        </div>
      </div>

      {/* GRADE DE KPIS REAIS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="bg-estrela-dark border border-estrela-card rounded-xl p-4 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-estrela-gray-400 font-medium">{kpi.label}</span>
                <div className={`p-2 rounded-lg ${kpi.bg} ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <span className="text-2xl font-black text-white">{kpi.value.toLocaleString()}</span>
            </div>
          );
        })}
      </div>

      {/* GRÁFICO DE EVOLUÇÃO TEMPORAL */}
      <div className="bg-estrela-dark border border-estrela-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-estrela-red" />
            Evolução Temporal no Período
          </h2>
          <div className="flex items-center gap-4 text-xs text-estrela-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Visualizações
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Cliques WhatsApp
            </span>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          {timeseriesData?.data && timeseriesData.data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeseriesData.data}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorWa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="date" stroke="#666" fontSize={11} tickLine={false} />
                <YAxis stroke="#666" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    borderColor: '#333',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="pageViews"
                  name="Visualizações"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorViews)"
                />
                <Area
                  type="monotone"
                  dataKey="whatsappClicks"
                  name="Cliques WhatsApp"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorWa)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-estrela-gray-500">
              Nenhum evento registrado no intervalo.
            </div>
          )}
        </div>
      </div>

      {/* TABELAS COMPLEMENTARES: TOP PRODUTOS E TOP PÁGINAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Produtos */}
        <div className="bg-estrela-dark border border-estrela-card rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Package className="w-4 h-4 text-estrela-red" />
            Baterias Mais Acessadas e Consultadas
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-estrela-gray-400">
                  <th className="pb-2.5 font-semibold">Produto</th>
                  <th className="pb-2.5 font-semibold text-center">Visualizações</th>
                  <th className="pb-2.5 font-semibold text-center">WhatsApp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {topProductsData?.data && topProductsData.data.length > 0 ? (
                  topProductsData.data.map((prod) => (
                    <tr key={prod.id} className="hover:bg-white/5">
                      <td className="py-2.5">
                        <span className="font-bold text-white block">{prod.name}</span>
                        <span className="text-[10px] text-estrela-gray-400">{prod.brand}</span>
                      </td>
                      <td className="py-2.5 text-center font-bold text-white">{prod.views}</td>
                      <td className="py-2.5 text-center font-bold text-emerald-400">
                        {prod.whatsappClicks}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-estrela-gray-500">
                      Nenhum produto consultado no período.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Páginas & Origens */}
        <div className="space-y-6">
          {/* Páginas Mais Acessadas */}
          <div className="bg-estrela-dark border border-estrela-card rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-400" />
              Páginas Mais Acessadas
            </h2>
            <div className="space-y-2 text-xs">
              {topPagesData?.data?.map((page, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/5">
                  <span className="font-mono text-estrela-gray-300 truncate max-w-xs">{page.path}</span>
                  <span className="font-bold text-white bg-estrela-card px-2 py-0.5 rounded">{page.views} views</span>
                </div>
              ))}
            </div>
          </div>

          {/* Origem de Tráfego */}
          <div className="bg-estrela-dark border border-estrela-card rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-400" />
              Origens de Tráfego
            </h2>
            <div className="space-y-2 text-xs">
              {sourcesData?.data && sourcesData.data.length > 0 ? (
                sourcesData.data.map((src, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/5">
                    <span className="text-estrela-gray-300">{src.source}</span>
                    <span className="font-bold text-white">{src.percentage}% ({src.count})</span>
                  </div>
                ))
              ) : (
                <span className="text-estrela-gray-500">Sem dados de origem.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
