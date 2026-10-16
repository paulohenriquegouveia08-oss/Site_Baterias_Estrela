import React, { useEffect } from 'react';
import { trackEvent } from '../../lib/analytics';
import { Shield, Lock, EyeOff } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  useEffect(() => {
    trackEvent('page_view', { path: '/privacidade' });
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-estrela-gray-300">
      <div>
        <div className="flex items-center gap-2 text-estrela-red font-bold text-xs uppercase tracking-wider mb-2">
          <Shield className="w-4 h-4" />
          <span>Privacidade e Segurança de Dados</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Política de Privacidade e Cookies</h1>
        <p className="text-xs text-estrela-gray-400 mt-1">Última atualização: Outubro de 2026</p>
      </div>

      <div className="space-y-6 text-sm leading-relaxed bg-estrela-dark border border-estrela-card rounded-2xl p-6 sm:p-8">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-estrela-red" />
            1. Compromisso com a Privacidade (LGPD)
          </h2>
          <p>
            A <strong>Baterias Estrela</strong> (Arapongas - PR) valoriza a transparência e a segurança de todos os clientes e visitantes de nossa plataforma online. Esta política descreve como tratamos informações de navegação e contato.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-estrela-red" />
            2. Métricas Analíticas Anônimas e Pseudonimizadas
          </h2>
          <p>
            Para medir a eficiência de nosso catálogo e melhorar a experiência de busca por compatibilidade de veículos, coletamos eventos técnicos de navegação (como visualizações de página, buscas por montadora e cliques em canais de contato).
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-estrela-gray-400">
            <li><strong>Não armazenamos seu endereço IP bruto</strong> de forma persistente.</li>
            <li><strong>Não rastreamos o conteúdo de conversas privadas</strong> mantidas no WhatsApp ou por telefone.</li>
            <li>Utilizamos um identificador de sessão temporário (session ID) gerado no navegador, sem cruzamento com perfis de terceiros.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">3. Geolocalização Opcional</h2>
          <p>
            Na página de <em>Socorro Rápido</em>, o compartilhamento de coordenadas geográficas ocorre <strong>exclusivamente após ação explícita e autorização do usuário</strong> através da API de geolocalização do navegador. Essa informação é utilizada unicamente para formatar o link de mapa enviado por você ao socorrista via WhatsApp.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">4. Preços e Contato Comercial</h2>
          <p>
            Como parte de nossa política comercial em Arapongas e para garantir que o cliente receba a especificação correta com entrega e instalação técnica inclusas, <strong>não divulgamos preços públicos estáticos</strong>. Todas as cotações são fornecidas diretamente por nossa equipe pelo WhatsApp ou por telefone.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">5. Seus Direitos</h2>
          <p>
            Conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você pode a qualquer momento solicitar esclarecimentos ou a remoção de dados de formulários através do e-mail <code>contato@bateriasestrela.com.br</code> ou na nossa loja física na Rua Taperaçu 165, Vila Sampaio, Arapongas - PR.
          </p>
        </section>
      </div>
    </div>
  );
};
