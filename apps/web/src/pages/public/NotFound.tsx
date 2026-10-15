import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Home, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-6">
      <div className="w-20 h-20 rounded-full bg-estrela-dark border border-white/10 flex items-center justify-center text-estrela-red mx-auto shadow-2xl">
        <Zap className="w-10 h-10 fill-current" />
      </div>
      <div>
        <span className="text-4xl font-black text-estrela-red">404</span>
        <h1 className="text-2xl font-bold text-white mt-1">Página não encontrada</h1>
        <p className="text-sm text-estrela-gray-400 mt-2">
          O link que você tentou acessar não existe ou foi alterado.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
        <Link
          to="/"
          className="px-6 py-3 rounded-xl bg-estrela-red hover:bg-estrela-red-hover text-white text-xs font-bold transition flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" />
          <span>Ir para Página Inicial</span>
        </Link>
        <Link
          to="/baterias"
          className="px-6 py-3 rounded-xl bg-estrela-dark hover:bg-white/10 border border-white/15 text-white text-xs font-semibold transition flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Ver Catálogo</span>
        </Link>
      </div>
    </div>
  );
};
