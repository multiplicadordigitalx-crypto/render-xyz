
import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  User, 
  Fingerprint, 
  ArrowRight, 
  ChevronLeft, 
  AlertCircle,
  Loader2,
  CheckCircle2,
  Zap,
  Star,
  Clock,
  Layout,
  Target
} from 'lucide-react';
import { AuthViewMode } from '../types';
import { authService, validateCPF } from '../services/authService';

interface AuthViewProps {
  initialMode?: AuthViewMode;
  onSuccess: (user: any) => void;
  onBack: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ initialMode = 'login', onSuccess, onBack }) => {
  const [mode, setMode] = useState<AuthViewMode>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf: '',
    password: '',
    confirmPassword: '',
    terms: false
  });

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      // Máscara dinâmica: 000.000.000-00
      value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
      setFormData({ ...formData, cpf: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'register') {
        if (!formData.name || !formData.email || !formData.cpf || !formData.password) {
          throw new Error("Preencha todos os campos obrigatórios.");
        }
        if (formData.password !== formData.confirmPassword) {
          throw new Error("As senhas informadas não coincidem.");
        }
        if (!formData.terms) {
          throw new Error("Você precisa aceitar os termos de uso para continuar.");
        }
        if (!validateCPF(formData.cpf)) {
          throw new Error("O CPF informado é inválido matematicamente.");
        }
        const user = await authService.register(formData);
        setSuccessMessage("Conta configurada com sucesso! Redirecionando...");
        setTimeout(() => onSuccess(user), 2000);
      } else if (mode === 'login') {
        const user = await authService.login(formData.email, formData.password);
        onSuccess(user);
      } else if (mode === 'forgot-password') {
        await authService.requestPasswordReset(formData.email);
        setSuccessMessage("Se o e-mail existir, um link de recuperação foi enviado.");
      }
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro inesperado na autenticação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F2F2F2]">
      
      {/* PAINEL DE BENEFÍCIOS (ESQUERDA) - Visível apenas em Desktop */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-black overflow-hidden flex-col justify-between p-16">
        <div className="absolute inset-0 z-0 opacity-40">
          <img 
            src="https://images.unsplash.com/photo-1600607687940-47a04b629753?q=80&w=2070&auto=format&fit=crop" 
            alt="High-end Architecture" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black via-black/80 to-transparent" />
        </div>

        <div className="relative z-10 flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#B6B09F] rounded-xl flex items-center justify-center">
            <Zap className="text-black w-6 h-6 fill-current" />
          </div>
          <span className="text-white text-2xl font-black tracking-tighter uppercase">Render XYZ</span>
        </div>

        <div className="relative z-10">
          <h2 className="text-6xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-12">
            Arquitetura de <br /> <span className="text-[#B6B09F]">Próximo Nível</span>
          </h2>
          
          <div className="space-y-8">
            <div className="flex items-start space-x-5 group">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10 group-hover:bg-[#B6B09F] transition-all">
                <Zap className="text-white group-hover:text-black w-5 h-5" />
              </div>
              <div>
                <h3 className="text-white text-sm font-black uppercase tracking-widest mb-1">Velocidade Extrema</h3>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider leading-relaxed">Renders profissionais entregues em menos de 10 segundos.</p>
              </div>
            </div>

            <div className="flex items-start space-x-5 group">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10 group-hover:bg-[#B6B09F] transition-all">
                <Star className="text-white group-hover:text-black w-5 h-5" />
              </div>
              <div>
                <h3 className="text-white text-sm font-black uppercase tracking-widest mb-1">Fidelidade 4K</h3>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider leading-relaxed">O mesmo realismo de horas de processamento, agora instantâneo.</p>
              </div>
            </div>

            <div className="flex items-start space-x-5 group">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10 group-hover:bg-[#B6B09F] transition-all">
                <Target className="text-white group-hover:text-black w-5 h-5" />
              </div>
              <div>
                <h3 className="text-white text-sm font-black uppercase tracking-widest mb-1">Foco Profissional</h3>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider leading-relaxed">Interface otimizada para arquitetos e designers de interiores.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-8">
          <div className="flex -space-x-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-zinc-800 overflow-hidden shadow-xl">
                <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
              </div>
            ))}
          </div>
          <div className="text-right">
            <p className="text-white text-[10px] font-black uppercase tracking-[0.2em]">+10.000 Renders</p>
            <p className="text-[#B6B09F] text-[8px] font-bold uppercase tracking-[0.1em]">Processados com Sucesso</p>
          </div>
        </div>
      </div>

      {/* FORMULÁRIO (DIREITA) */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 lg:p-20 relative overflow-y-auto">
        <button 
          onClick={onBack}
          className="absolute top-8 left-8 flex items-center text-[#B6B09F] hover:text-black text-[9px] font-black uppercase tracking-[0.3em] transition-all z-20"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
        </button>

        <div className="w-full max-w-md py-12">
          <div className="bg-white border border-[#B6B09F]/20 rounded-[40px] md:rounded-[60px] p-10 md:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
            
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-black rounded-2xl mb-6 shadow-xl">
                {mode === 'login' ? <Fingerprint className="text-white w-7 h-7" /> : <User className="text-white w-7 h-7" />}
              </div>
              <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">
                {mode === 'login' ? 'Entrar' : mode === 'register' ? 'Criar Conta' : 'Recuperar'}
              </h1>
              <p className="text-[#B6B09F] text-[9px] font-black uppercase tracking-widest">
                {mode === 'login' ? 'Bem-vindo ao Workspace' : 'Inicie sua jornada gratuita'}
              </p>
            </div>

            {error && (
              <div className="mb-8 p-5 bg-red-50 border border-red-100 rounded-2xl flex items-center space-x-3 text-red-700 text-[9px] font-black uppercase tracking-widest leading-relaxed">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-8 p-5 bg-green-50 border border-green-100 rounded-2xl flex items-center space-x-3 text-green-700 text-[9px] font-black uppercase tracking-widest leading-relaxed">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === 'register' && (
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B6B09F]" />
                  <input 
                    type="text" required placeholder="NOME COMPLETO"
                    className="w-full pl-14 pr-6 py-5 bg-[#F2F2F2] border border-transparent rounded-2xl text-[10px] font-bold focus:bg-white focus:border-[#B6B09F]/30 focus:outline-none transition-all placeholder:text-[#B6B09F]/60"
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B6B09F]" />
                <input 
                  type="email" required placeholder="E-MAIL"
                  className="w-full pl-14 pr-6 py-5 bg-[#F2F2F2] border border-transparent rounded-2xl text-[10px] font-bold focus:bg-white focus:border-[#B6B09F]/30 focus:outline-none transition-all placeholder:text-[#B6B09F]/60"
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>

              {mode === 'register' && (
                <div className="relative">
                  <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B6B09F]" />
                  <input 
                    type="text" required placeholder="CPF"
                    className="w-full pl-14 pr-6 py-5 bg-[#F2F2F2] border border-transparent rounded-2xl text-[10px] font-bold focus:bg-white focus:border-[#B6B09F]/30 focus:outline-none transition-all placeholder:text-[#B6B09F]/60"
                    value={formData.cpf} onChange={handleCpfChange}
                  />
                </div>
              )}

              {mode !== 'forgot-password' && (
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B6B09F]" />
                  <input 
                    type="password" required placeholder="SENHA DE ACESSO"
                    className="w-full pl-14 pr-6 py-5 bg-[#F2F2F2] border border-transparent rounded-2xl text-[10px] font-bold focus:bg-white focus:border-[#B6B09F]/30 focus:outline-none transition-all placeholder:text-[#B6B09F]/60"
                    value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              )}

              {mode === 'register' && (
                <div className="space-y-4">
                  <div className="relative">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B6B09F]" />
                    <input 
                      type="password" required placeholder="CONFIRMAR SENHA"
                      className="w-full pl-14 pr-6 py-5 bg-[#F2F2F2] border border-transparent rounded-2xl text-[10px] font-bold focus:bg-white focus:border-[#B6B09F]/30 focus:outline-none transition-all placeholder:text-[#B6B09F]/60"
                      value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                    />
                  </div>
                  <div className="flex items-start space-x-3 p-2 bg-[#F2F2F2]/50 rounded-xl">
                    <input 
                      type="checkbox" id="terms" required
                      className="mt-1 w-4 h-4 accent-black" 
                      checked={formData.terms} onChange={e => setFormData({...formData, terms: e.target.checked})} 
                    />
                    <label htmlFor="terms" className="text-[8px] font-bold text-[#B6B09F] uppercase tracking-widest leading-relaxed">
                      Eu li e concordo com os <span className="text-black underline cursor-pointer">Termos de Uso</span> e a <span className="text-black underline cursor-pointer">Política de Privacidade</span>.
                    </label>
                  </div>
                </div>
              )}

              <button
                type="submit" disabled={loading}
                className="w-full py-5 md:py-6 bg-black text-white rounded-[20px] font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl hover:bg-zinc-800 transition-all flex items-center justify-center space-x-3 disabled:bg-zinc-300 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>{mode === 'login' ? 'ENTRAR NO DASHBOARD' : mode === 'register' ? 'CRIAR MINHA CONTA' : 'ENVIAR LINK'}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-12 pt-8 border-t border-[#B6B09F]/10 text-center">
              {mode === 'login' ? (
                <div className="space-y-4">
                  <button onClick={() => setMode('register')} className="text-[10px] font-black text-[#B6B09F] uppercase tracking-widest hover:text-black transition-all">Ainda não tem acesso? <span className="underline">Cadastre-se grátis</span></button>
                  <br />
                  <button onClick={() => setMode('forgot-password')} className="text-[9px] font-black text-[#B6B09F]/50 uppercase tracking-widest hover:text-black transition-all">Esqueceu sua senha?</button>
                </div>
              ) : (
                <button onClick={() => setMode('login')} className="text-[10px] font-black text-[#B6B09F] uppercase tracking-widest hover:text-black transition-all">Já possui uma conta? <span className="underline">Fazer Login</span></button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
