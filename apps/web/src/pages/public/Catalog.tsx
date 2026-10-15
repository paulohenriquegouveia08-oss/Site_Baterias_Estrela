import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import { PublicProduct, PublicCategory, buildWhatsAppLink } from '@baterias-estrela/shared';
import { ProductCard } from '../../components/common/ProductCard';
import { BatteryLoader } from '../../components/common/BatteryLoader';
import { useSite } from '../../contexts/SiteContext';
import { trackEvent, handleWhatsAppClick } from '../../lib/analytics';
import { Search, Filter, RotateCcw, MessageCircle, ChevronLeft, ChevronRight, Zap } from 'lucide-react';

export const Catalog: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { defaultWhatsApp } = useSite();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
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

  const clearAllFilters = () => {
    setSearchTerm('');
    setSearchParams(new URLSearchParams());
  };

  const brands = ['Moura', 'Heliar', 'Bralmax', 'Zetta', 'Cral'];
  const amperages = [
    { label: 'Todas as capacidades', min: '', max: '' },
    { label: 'Até 50 Ah (Compactos)', min: '40', max: '50' },
    { label: '60 Ah (Médios e Sedãs)', min: '55', max: '65' },
    { label: '70 Ah a 75 Ah (SUVs)', min: '70', max: '75' },
    { label: '90 Ah ou mais (Pesados)', min: '85', max: '200' },
  ];

  const onConsultGenericWhatsApp = () => {
    const url = buildWhatsAppLink(
      defaultWhatsApp.number,
      `Olá! Estou no catálogo do site da Baterias Estrela e gostaria de consultar a disponibilidade para o termo: "${searchTerm || 'Bateria automotiva'}".`
    );
    handleWhatsAppClick(url, { path: '/baterias', metadata: { action: 'catalog_empty_whatsapp' } });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Cabeçalho da Página */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white">Catálogo de Baterias Automotivas</h1>
        <p className="text-sm text-estrela-gray-400 mt-1">
          Explore nossa linha completa com especificações técnicas oficiais. Consulte preços e condições pelo WhatsApp.
        </p>
      </div>

      {/* Barra de Pesquisa e Ordenação */}
      <div className="bg-estrela-dark border border-estrela-card rounded-xl p-4 mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="w-full md:w-96 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-estrela-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome, marca ou SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-estrela-card border border-white/10 rounded-lg pl-10 pr-3 py-2 text-sm text-white placeholder-estrela-gray-500 focus:outline-none focus:border-estrela-red"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-estrela-red hover:bg-estrela-red-hover text-white text-sm font-semibold transition"
          >
            Buscar
          </button>
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <span className="text-xs text-estrela-gray-400">Ordenar por:</span>
          <select
            value={sortBy}
            onChange={(e) => updateFilter('sortBy', e.target.value)}
            className="bg-estrela-card border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-estrela-red cursor-pointer"
          >
            <option value="featured">Destaques</option>
            <option value="amperage">Amperagem (Ah)</option>
            <option value="brand">Marca</option>
            <option value="name">Nome do Produto</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* FILTROS LATERAIS */}
        <aside className="space-y-6">
          <div className="bg-estrela-dark border border-estrela-card rounded-xl p-5 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Filter className="w-4 h-4 text-estrela-red" />
                Filtros
              </span>
              {(selectedBrand || selectedCategory || selectedTech || selectedPolarity || selectedMinAh || searchTerm) && (
                <button
                  onClick={clearAllFilters}
                  className="text-[11px] text-estrela-gray-400 hover:text-estrela-red flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Limpar
                </button>
              )}
            </div>

            {/* Marcas */}
            <div>
              <label className="block text-xs font-semibold text-estrela-gray-300 uppercase tracking-wider mb-2">
                Marca
              </label>
              <div className="space-y-1.5">
                <button
                  onClick={() => updateFilter('brand', '')}
                  className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md transition ${
                    !selectedBrand ? 'bg-estrela-red text-white font-bold' : 'text-estrela-gray-400 hover:bg-white/5'
                  }`}
                >
                  Todas as marcas
                </button>
                {brands.map((b) => (
                  <button
                    key={b}
                    onClick={() => updateFilter('brand', b)}
                    className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md transition ${
                      selectedBrand === b ? 'bg-estrela-red text-white font-bold' : 'text-estrela-gray-400 hover:bg-white/5'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Categorias */}
            {categoriesData?.data && categoriesData.data.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-estrela-gray-300 uppercase tracking-wider mb-2">
                  Categoria
                </label>
                <div className="space-y-1.5">
                  <button
                    onClick={() => updateFilter('categoryId', '')}
                    className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md transition ${
                      !selectedCategory ? 'bg-estrela-red text-white font-bold' : 'text-estrela-gray-400 hover:bg-white/5'
                    }`}
                  >
                    Todas as categorias
                  </button>
                  {categoriesData.data.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => updateFilter('categoryId', cat.id)}
                      className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md transition ${
                        selectedCategory === cat.id ? 'bg-estrela-red text-white font-bold' : 'text-estrela-gray-400 hover:bg-white/5'
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
              <label className="block text-xs font-semibold text-estrela-gray-300 uppercase tracking-wider mb-2">
                Tecnologia
              </label>
              <div className="space-y-1.5">
                <button
                  onClick={() => updateFilter('technology', '')}
                  className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md transition ${
                    !selectedTech ? 'bg-estrela-red text-white font-bold' : 'text-estrela-gray-400 hover:bg-white/5'
                  }`}
                >
                  Todas as tecnologias
                </button>
                <button
                  onClick={() => updateFilter('technology', 'SLI')}
                  className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md transition ${
                    selectedTech === 'SLI' ? 'bg-estrela-red text-white font-bold' : 'text-estrela-gray-400 hover:bg-white/5'
                  }`}
                >
                  Convencional (SLI)
                </button>
                <button
                  onClick={() => updateFilter('technology', 'EFB')}
                  className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md transition ${
                    selectedTech === 'EFB' ? 'bg-estrela-red text-white font-bold' : 'text-estrela-gray-400 hover:bg-white/5'
                  }`}
                >
                  EFB (Start-Stop)
                </button>
                <button
                  onClick={() => updateFilter('technology', 'AGM')}
                  className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md transition ${
                    selectedTech === 'AGM' ? 'bg-estrela-red text-white font-bold' : 'text-estrela-gray-400 hover:bg-white/5'
                  }`}
                >
                  AGM (Alta Performance)
                </button>
              </div>
            </div>

            {/* Amperagem */}
            <div>
              <label className="block text-xs font-semibold text-estrela-gray-300 uppercase tracking-wider mb-2">
                Capacidade (Ah)
              </label>
              <div className="space-y-1.5">
                {amperages.map((amp, idx) => {
                  const isSelected = selectedMinAh === amp.min && selectedMaxAh === amp.max;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        const newParams = new URLSearchParams(searchParams);
                        if (amp.min) newParams.set('minAh', amp.min);
                        else newParams.delete('minAh');
                        if (amp.max) newParams.set('maxAh', amp.max);
                        else newParams.delete('maxAh');
                        newParams.set('page', '1');
                        setSearchParams(newParams);
                      }}
                      className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md transition ${
                        isSelected ? 'bg-estrela-red text-white font-bold' : 'text-estrela-gray-400 hover:bg-white/5'
                      }`}
                    >
                      {amp.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* GRADE DE PRODUTOS */}
        <main className="lg:col-span-3">
          {isLoading ? (
            <div className="py-20">
              <BatteryLoader label="Carregando produtos do catálogo..." size="lg" />
            </div>
          ) : productsData?.data && productsData.data.length > 0 ? (
            <div>
              <div className="mb-4 text-xs text-estrela-gray-400">
                Mostrando <strong>{productsData.data.length}</strong> de <strong>{productsData.meta.total}</strong> baterias encontradas
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {productsData.data.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Paginação */}
              {productsData.meta.totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-3">
                  <button
                    disabled={page <= 1}
                    onClick={() => updateFilter('page', String(page - 1))}
                    className="p-2 rounded-lg bg-estrela-dark border border-white/10 hover:border-white/30 text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <span className="text-xs text-estrela-gray-300">
                    Página <strong>{page}</strong> de <strong>{productsData.meta.totalPages}</strong>
                  </span>

                  <button
                    disabled={page >= productsData.meta.totalPages}
                    onClick={() => updateFilter('page', String(page + 1))}
                    className="p-2 rounded-lg bg-estrela-dark border border-white/10 hover:border-white/30 text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Estado Vazio */
            <div className="bg-estrela-dark border border-estrela-card rounded-2xl p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-estrela-card flex items-center justify-center text-estrela-red mx-auto">
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white">Nenhuma bateria encontrada com esses filtros</h3>
              <p className="text-sm text-estrela-gray-400 max-w-md mx-auto">
                Podemos verificar em tempo real se temos o modelo desejado no estoque da nossa loja física em Arapongas.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
                <button
                  onClick={clearAllFilters}
                  className="px-5 py-2.5 rounded-lg border border-white/20 text-white text-xs font-semibold hover:bg-white/10 transition"
                >
                  Limpar Todos os Filtros
                </button>
                <button
                  onClick={onConsultGenericWhatsApp}
                  className="px-5 py-2.5 rounded-lg bg-estrela-red hover:bg-estrela-red-hover text-white text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Consultar no WhatsApp</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
