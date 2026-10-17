import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiFetch } from '../../lib/api';
import { Lock, Mail, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal de esqueci a senha
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await apiFetch<{ token: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      login(res.token, res.user);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Credenciais inválidas. Verifique os dados informados.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;

    try {
      await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: forgotEmail }),
      });
      setForgotSubmitted(true);
    } catch {
      setForgotSubmitted(true); // Resposta genérica segura
    }
  };

  return (
    <div className="min-h-screen bg-estrela-black flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Identificação da Loja com a Logo Oficial */}
        <div className="text-center space-y-3">
          <Link to="/" className="inline-block transition-transform hover:scale-105" title="Voltar ao site público">
            <img
              src="/logo.png"
              alt="Baterias Estrela Mendes"
              className="h-16 sm:h-20 w-auto mx-auto object-contain drop-shadow-2xl"
            />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              Painel Administrativo
            </h1>
            <p className="text-xs text-estrela-gray-400">
              Acesso restrito para gestão comercial e operacional
            </p>
          </div>
        </div>

        {/* Card de Login */}
        <div className="bg-estrela-dark border border-estrela-card rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800 text-red-200 text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-estrela-red" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-estrela-gray-300 uppercase tracking-wider mb-1.5">
                E-mail do Administrador
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-estrela-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@bateriasestrela.com.br"
                  className="w-full bg-estrela-card border border-white/10 rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-estrela-gray-600 focus:outline-none focus:border-estrela-red transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-estrela-gray-300 uppercase tracking-wider">
                  Senha
                </label>
                <button
                  type="button"
                  onClick={() => setForgotOpen(true)}
                  className="text-[11px] text-estrela-gray-400 hover:text-estrela-red transition"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-estrela-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-estrela-card border border-white/10 rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-estrela-gray-600 focus:outline-none focus:border-estrela-red transition"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-estrela-red hover:bg-estrela-red-hover text-white text-sm font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-estrela-red/20 disabled:opacity-50 active:scale-95"
              >
                <span>{loading ? 'Validando acesso...' : 'Acessar Painel'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          <div className="pt-2 border-t border-estrela-card text-center">
            <span className="text-[11px] text-estrela-gray-500 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Sessão protegida por criptografia e cookies seguros HttpOnly
            </span>
          </div>
        </div>
      </div>

      {/* Modal Esqueci a Senha */}
      {forgotOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-estrela-dark border border-estrela-card rounded-2xl w-full max-w-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Recuperação de Senha</h3>
            {forgotSubmitted ? (
              <div className="space-y-3 text-xs text-estrela-gray-300">
                <p>
                  Se o e-mail informado estiver cadastrado na base de administradores, as instruções foram geradas com segurança.
                </p>
                <button
                  onClick={() => {
                    setForgotOpen(false);
                    setForgotSubmitted(false);
                  }}
                  className="w-full py-2 bg-estrela-red text-white font-bold rounded-lg"
                >
                  Fechar
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <p className="text-xs text-estrela-gray-400">
                  Informe o e-mail da conta de administrador para receber o link de redefinição.
                </p>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="seu-email@bateriasestrela.com.br"
                  className="w-full bg-estrela-card border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-estrela-red"
                />
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotOpen(false)}
                    className="flex-1 py-2 rounded-lg border border-white/10 text-xs text-white hover:bg-white/5"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-lg bg-estrela-red text-xs text-white font-bold"
                  >
                    Enviar Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
