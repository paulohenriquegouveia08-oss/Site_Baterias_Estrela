import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import { PublicProduct, PublicCategory, buildWhatsAppLink } from '@baterias-estrela/shared';
import { ProductCard } from '../../components/common/ProductCard';
import { BatteryLoader } from '../../components/common/BatteryLoader';
import { WhatsAppIcon } from '../../components/common/WhatsAppIcon';
import { useSite } from '../../contexts/SiteContext';
import { trackEvent, handleWhatsAppClick } from '../../lib/analytics';
import { Search, Filter, RotateCcw, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';

export const Catalog: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { defaultWhatsApp } = useSite();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const selectedBrand = searchParams.get('brand') || '';
  const selectedCategory = searchParams.get('categoryId') || '';
  const selectedTech = searchParams.get('technology') || '';
  const selectedPolarity = searchParams.get('polarity') || '';
  const selectedMinAh = searchParams.get('minAh') || '';
  const selectedMaxAh = searchParams.get('maxAh') || '';
  const sortBy = searchParams.get('sortBy') || 'featured';
  const sortOrder = searchParams.get('sortOrder') || 'desc';
  const page = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    trackEvent('page_view', { path: '/baterias' });
  }, []);

  // Busca categorias para o filtro
  const { data: categoriesData } = useQuery({
    queryKey: ['public-categories'],
    queryFn: () => apiFetch<{ data: PublicCategory[] }>('/categories'),
  });

  // Monta querystring para produtos
  const queryParts = [
    `page=${page}`,
    `limit=12`,
    sortBy !== 'featured' ? `sortBy=${sortBy}&sortOrder=${sortOrder}` : '',
    searchTerm ? `search=${encodeURIComponent(searchTerm)}` : '',
    selectedBrand ? `brand=${encodeURIComponent(selectedBrand)}` : '',
    selectedCategory ? `categoryId=${selectedCategory}` : '',
    selectedTech ? `technology=${selectedTech}` : '',
    selectedPolarity ? `polarity=${selectedPolarity}` : '',
    selectedMinAh ? `minAh=${selectedMinAh}` : '',
    selectedMaxAh ? `maxAh=${selectedMaxAh}` : '',
  ].filter(Boolean);

  const queryString = queryParts.join('&');

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['catalog-products', queryString],
    queryFn: () =>
      apiFetch<{
        data: PublicProduct[];
        meta: { total: number; page: number; limit: number; totalPages: number };
      }>(`/products?${queryString}`),
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchTerm.trim()) {
      newParams.set('search', searchTerm.trim());
      trackEvent('catalog_search', {
        path: '/baterias',
        metadata: { query: searchTerm.trim() },
      });
    } else {
      newParams.delete('search');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const updateAmperageFilter = (min: string, max: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (min) newParams.set('minAh', min);
    else newParams.delete('minAh');

    if (max) newParams.set('maxAh', max);
    else newParams.delete('maxAh');

    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSearchParams(new URLSearchParams());
  };

  const brands = ['Moura', 'Zetta', 'Heliar', 'Pioneiro', 'Eletran', 'Bralmax', 'Cral'];
  const amperages = [
    { label: 'Todas as capacidades', min: '', max: '' },
    { label: '40 a 50 Ah (Compactos)', min: '40', max: '50' },
    { label: '60 Ah (Médios e Sedãs)', min: '55', max: '65' },
    { label: '70 a 75 Ah (SUVs / Pickups)', min: '70', max: '75' },
    { label: '90 Ah ou mais (Pesados)', min: '85', max: '200' },
  ];

  // Contagem de filtros ativos
  const activeFiltersCount = [
    selectedBrand,
    selectedCategory,
    selectedTech,
    selectedPolarity,
    selectedMinAh,
    searchTerm,
  ].filter(Boolean).length;

  const onConsultGenericWhatsApp = () => {
    const url = buildWhatsAppLink(
      defaultWhatsApp.number,
      `Olá! Estou procurando uma bateria no site da Baterias Estrela para o termo: "${searchTerm || 'Bateria automotiva'}" e gostaria de consultar modelos e preços.`
    );
    handleWhatsAppClick(url, { path: '/baterias', metadata: { action: 'catalog_empty_whatsapp' } });
  };

  // Renderizador dos blocos de filtros (usado tanto na sidebar desktop quanto no accordion mobile)
  const renderFilterControls = () => (
    <div className="space-y-6">
      {/* Botão de Limpar */}
      {activeFiltersCount > 0 && (
        <button
          onClick={clearAllFilters}
          className="w-full py-1.5 px-3 rounded-lg bg-estrela-card hover:bg-white/10 text-xs text-estrela-gray-300 hover:text-white flex items-center justify-center gap-1.5 transition border border-white/10"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Limpar {activeFiltersCount} filtro(s) ativo(s)</span>
        </button>
      )}

      {/* Marcas */}
      <div>
        <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2">
          Marca
        </label>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => updateFilter('brand', '')}
            className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md transition ${
              !selectedBrand ? 'bg-estrela-red text-white font-bold' : 'text-estrela-gray-300 hover:bg-white/5'
            }`}
          >
            Todas as marcas
          </button>
          {brands.map((b) => (
            <button
              key={b}
              onClick={() => updateFilter('brand', b)}
              className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md transition ${
                selectedBrand === b ? 'bg-estrela-red text-white font-bold' : 'text-estrela-gray-300 hover:bg-white/5'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Amperagem (Ah) */}
      <div>
        <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2">
          Capacidade (Amperagem)
        </label>
        <div className="flex flex-col gap-1">
          {amperages.map((amp) => {
            const isSelected = selectedMinAh === amp.min && selectedMaxAh === amp.max;
            return (
              <button
                key={amp.label}
                onClick={() => updateAmperageFilter(amp.min, amp.max)}
                className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md transition ${
                  isSelected ? 'bg-estrela-red text-white font-bold' : 'text-estrela-gray-300 hover:bg-white/5'
                }`}
              >
                {amp.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Categorias */}
      {categoriesData?.data && categoriesData.data.length > 0 && (
        <div>
          <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2">
            Aplicação
          </label>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => updateFilter('categoryId', '')}
              className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md transition ${
                !selectedCategory ? 'bg-estrela-red text-white font-bold' : 'text-estrela-gray-300 hover:bg-white/5'
              }`}
            >
              Todas as aplicações
            </button>
            {categoriesData.data.map((cat) => (
              <button
                key={cat.id}
                onClick={() => updateFilter('categoryId', cat.id)}
                className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md transition ${
                  selectedCategory === cat.id ? 'bg-estrela-red text-white font-bold' : 'text-estrela-gray-300 hover:bg-white/5'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tecnologia */}
      <div>
        <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2">
          Tecnologia
        </label>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => updateFilter('technology', '')}
            className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md transition ${
              !selectedTech ? 'bg-estrela-red text-white font-bold' : 'text-estrela-gray-300 hover:bg-white/5'
            }`}
          >
            Todas as tecnologias
          </button>
          <button
            onClick={() => updateFilter('technology', 'SLI')}
            className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md transition ${
              selectedTech === 'SLI' ? 'bg-estrela-red text-white font-bold' : 'text-estrela-gray-300 hover:bg-white/5'
            }`}
          >
            SLI Convencional
          </button>
          <button
            onClick={() => updateFilter('technology', 'EFB')}
            className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md transition ${
              selectedTech === 'EFB' ? 'bg-estrela-red text-white font-bold' : 'text-estrela-gray-300 hover:bg-white/5'
            }`}
          >
            EFB (Start-Stop)
          </button>
          <button
            onClick={() => updateFilter('technology', 'AGM')}
            className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md transition ${
              selectedTech === 'AGM' ? 'bg-estrela-red text-white font-bold' : 'text-estrela-gray-300 hover:bg-white/5'
            }`}
          >
            AGM (Start-Stop Avançado)
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Cabeçalho do Catálogo */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white">Catálogo de Baterias Automotivas</h1>
        <p className="text-sm text-estrela-gray-400 mt-1">
          Baterias originais com especificações técnicas oficiais. Consulte preços e entrega grátis pelo WhatsApp.
        </p>
      </div>

      {/* FILTRO MOBILE RECOLHIDO (Accordion que aparece no topo no celular sem tomar espaço) */}
      <div className="lg:hidden mb-6">
        <button
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          className="w-full py-3 px-4 rounded-xl bg-estrela-dark border border-white/10 hover:border-estrela-red text-white text-xs font-bold flex items-center justify-between transition shadow"
        >
          <span className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-estrela-red" />
            <span>Filtrar Baterias {activeFiltersCount > 0 ? `(${activeFiltersCount} aplicado${activeFiltersCount > 1 ? 's' : ''})` : ''}</span>
          </span>
          {mobileFilterOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {mobileFilterOpen && (
          <div className="mt-3 p-5 rounded-xl bg-estrela-dark border border-white/10 shadow-xl space-y-6">
            {renderFilterControls()}
          </div>
        )}
      </div>

      {/* ESTRUTURA PRINCIPAL: FILTRO DO LADO ESQUERDO NO DESKTOP */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* COLUNA ESQUERDA: FILTROS FIXOS NO DESKTOP */}
        <aside className="hidden lg:block lg:col-span-1 sticky top-28 bg-estrela-dark border border-white/10 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
            <span className="text-sm font-bold text-white flex items-center gap-2">
              <Filter className="w-4 h-4 text-estrela-red" />
              Filtros
            </span>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-[11px] text-estrela-gray-400 hover:text-estrela-red flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Limpar
              </button>
            )}
          </div>
          {renderFilterControls()}
        </aside>

        {/* COLUNA DIREITA: BUSCA, ORDENAÇÃO E GRADE DE PRODUTOS */}
        <div className="lg:col-span-3 space-y-6">
          {/* Barra de Pesquisa e Ordenação */}
          <div className="bg-estrela-dark border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <form onSubmit={handleSearchSubmit} className="w-full sm:flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-estrela-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar modelo, marca ou SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-estrela-card border border-white/10 rounded-lg pl-10 pr-3 py-2 text-sm text-white placeholder-estrela-gray-500 focus:outline-none focus:border-estrela-red"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-estrela-red hover:bg-estrela-red-hover text-white text-xs sm:text-sm font-semibold transition"
              >
                Buscar
              </button>
            </form>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end text-xs">
              <span className="text-estrela-gray-400 shrink-0">Ordenar:</span>
              <select
                value={sortBy}
                onChange={(e) => updateFilter('sortBy', e.target.value)}
                className="bg-estrela-card border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-estrela-red cursor-pointer"
              >
                <option value="featured">Destaques</option>
                <option value="amperage">Amperagem (Ah)</option>
                <option value="brand">Marca</option>
                <option value="name">Nome</option>
              </select>
            </div>
          </div>

          {/* LISTAGEM DE PRODUTOS */}
          {isLoading ? (
            <div className="py-20">
              <BatteryLoader label="Carregando baterias..." />
            </div>
          ) : productsData?.data && productsData.data.length > 0 ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {productsData.data.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Paginação */}
              {productsData.meta.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6 border-t border-white/10">
                  <button
                    onClick={() => updateFilter('page', String(page - 1))}
                    disabled={page <= 1}
                    className="p-2 rounded-lg bg-estrela-dark border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-estrela-gray-400 px-4">
                    Página <strong className="text-white">{page}</strong> de <strong className="text-white">{productsData.meta.totalPages}</strong>
                  </span>
                  <button
                    onClick={() => updateFilter('page', String(page + 1))}
                    disabled={page >= productsData.meta.totalPages}
                    className="p-2 rounded-lg bg-estrela-dark border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Estado Vazio */
            <div className="py-16 px-6 bg-estrela-dark border border-white/10 rounded-2xl text-center space-y-4">
              <h3 className="text-lg font-bold text-white">Nenhuma bateria encontrada com esses filtros</h3>
              <p className="text-xs text-estrela-gray-400 max-w-md mx-auto">
                Temos diversos outros modelos em estoque na loja que podem atender seu veículo. Fale com nossos especialistas pelo WhatsApp!
              </p>
              <button
                onClick={onConsultGenericWhatsApp}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold transition shadow"
              >
                <WhatsAppIcon className="w-4 h-4 fill-white" />
                <span>Consultar Bateria no WhatsApp</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
