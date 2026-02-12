
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
  Target,
  FileText,
  X

} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Boxes } from './ui/BackgroundBoxes';
import { AuthViewMode } from '../types';
import { authService, validateCPF } from '../services/authService';

// Password strength validation
const validatePassword = (password: string): { valid: boolean; message: string } => {
  if (password.length < 8) {
    return { valid: false, message: "A senha deve ter no mínimo 8 caracteres." };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "A senha deve conter pelo menos uma letra maiúscula." };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "A senha deve conter pelo menos uma letra minúscula." };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "A senha deve conter pelo menos um número." };
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { valid: false, message: "A senha deve conter pelo menos um caractere especial (!@#$%^&*)." };
  }
  return { valid: true, message: "" };
};

interface AuthViewProps {
  initialMode?: AuthViewMode;
  onSuccess: (user: any) => void;
  onBack: () => void;
  prefilledEmail?: string;
  lockedEmail?: boolean;
  pendingPlanName?: string;
}

export const AuthView: React.FC<AuthViewProps> = ({
  initialMode = 'login',
  onSuccess,
  onBack,
  prefilledEmail,
  lockedEmail = false,
  pendingPlanName
}) => {
  const [mode, setMode] = useState<AuthViewMode>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pendingGoogleUser, setPendingGoogleUser] = useState<any | null>(null);
  const [cpfForGoogle, setCpfForGoogle] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: prefilledEmail || '',
    cpf: '',
    password: '',
    confirmPassword: '',
    terms: false
  });
  const [showTerms, setShowTerms] = useState(false);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>, isGoogleFlow = false) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
      if (isGoogleFlow) {
        setCpfForGoogle(value);
      } else {
        setFormData({ ...formData, cpf: value });
      }
    }
  };

  const handleGoogleCompletion = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!cpfForGoogle) throw new Error("Informe seu CPF para continuar.");
      const updatedUser = await authService.updateProfileCpf(pendingGoogleUser.id, cpfForGoogle);
      setSuccessMessage("Cadastro completado com sucesso! Redirecionando...");
      setTimeout(() => onSuccess(updatedUser), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'register') {
        if (!formData.name || !formData.email || !formData.cpf || !formData.password) throw new Error("Preencha todos os campos obrigatórios.");
        if (formData.password !== formData.confirmPassword) throw new Error("As senhas informadas não coincidem.");
        const passwordCheck = validatePassword(formData.password);
        if (!passwordCheck.valid) throw new Error(passwordCheck.message);
        if (!formData.terms) throw new Error("Você precisa aceitar os termos de uso para continuar.");
        if (!validateCPF(formData.cpf)) throw new Error("O CPF informado é inválido matematicamente.");
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

  const variants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F2F2F2]">
      {/* LEFT SIDE: BRANDING */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-black overflow-hidden flex-col justify-between p-16">
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src="https://images.unsplash.com/photo-1600607687940-47a04b629753?q=80&w=2070&auto=format&fit=crop"
            alt="High-end Architecture"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black via-black/80 to-transparent" />
        </div>
        <a href="/" className="relative z-10 flex items-center hover:opacity-80 transition-opacity">
          <img src="/assets/logo.png" alt="Render XYZ" className="h-10 md:h-12 invert" />
        </a>
        <div className="relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h2 className="text-6xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-12">
              Arquitetura de <br /> <span className="text-[#7A756A]">Próximo Nível</span>
            </h2>
          </motion.div>
          <div className="space-y-8">
            {[
              { icon: Zap, title: "Velocidade Extrema", desc: "Renders profissionais entregues em menos de 10 segundos." },
              { icon: Star, title: "Fidelidade 4K", desc: "O mesmo realismo de horas de processamento, agora instantâneo." },
              { icon: Target, title: "Foco Profissional", desc: "Interface otimizada para arquitetos e designers de interiores." }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + (idx * 0.1) }}
                className="flex items-start space-x-5 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10 group-hover:bg-[#B6B09F] transition-all">
                  <item.icon className="text-white group-hover:text-black w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white text-sm font-black uppercase tracking-widest mb-1">{item.title}</h3>
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-8">
          <div className="flex -space-x-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-zinc-800 overflow-hidden shadow-xl">
                <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
              </div>
            ))}
          </div>
          <div className="text-right">
            <p className="text-white text-[10px] font-black uppercase tracking-[0.2em]">+10.000 Renders</p>
            <p className="text-[#7A756A] text-[8px] font-bold uppercase tracking-[0.1em]">Processados com Sucesso</p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: AUTH FORM */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative overflow-y-auto h-screen">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0 overflow-hidden bg-[#F2F2F2]"><Boxes /></div>


        <button
          onClick={() => pendingGoogleUser ? setPendingGoogleUser(null) : onBack()}
          className="absolute top-6 left-6 flex items-center text-[#7A756A] hover:text-black text-[9px] font-black uppercase tracking-[0.3em] transition-all z-20"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
        </button>

        <motion.div
          className="w-full max-w-md relative z-10"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white/80 backdrop-blur-md border border-white/50 rounded-[30px] md:rounded-[40px] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
            <AnimatePresence mode='wait'>
              {!pendingGoogleUser ? (
                <motion.div
                  key="auth-form"
                  variants={variants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-black rounded-xl mb-4 shadow-xl">
                      <motion.div
                        key={mode}
                        initial={{ scale: 0.8, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200 }}
                      >
                        {mode === 'login' ? <Fingerprint className="text-white w-6 h-6" /> : <User className="text-white w-6 h-6" />}
                      </motion.div>
                    </div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter mb-1">
                      {mode === 'login' ? 'Entrar' : mode === 'register' ? 'Criar Conta' : 'Recuperar'}
                    </h1>
                    <p className="text-[#7A756A] text-[9px] font-black uppercase tracking-widest">
                      {mode === 'login' ? 'Bem-vindo ao Workspace' : 'Inicie sua jornada gratuita'}
                    </p>
                  </div>

                  {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center space-x-3 text-red-700 text-[9px] font-black uppercase tracking-widest leading-relaxed">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                  {successMessage && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl flex items-center space-x-3 text-green-700 text-[9px] font-black uppercase tracking-widest leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{successMessage}</span>
                    </motion.div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {(mode === 'login' || mode === 'register') && (
                      <>
                        <button
                          type="button"
                          disabled={loading}
                          onClick={async () => {
                            setError(null);
                            setLoading(true);
                            try {
                              const user = await authService.loginWithGoogle();
                              // if (!user.cpf) { setPendingGoogleUser(user); return; } // Removed as per request
                              setSuccessMessage("Autenticação com Google realizada com sucesso!");
                              setTimeout(() => onSuccess(user), 1500);
                            } catch (err: any) { setError(err.message); setLoading(false); }
                          }}
                          className="w-full py-3.5 bg-white border border-[#B6B09F]/30 rounded-[15px] font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-gray-50 transition-all flex items-center justify-center space-x-3 group relative overflow-hidden"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                          <span>Entrar com Google</span>
                        </button>
                        <div className="relative flex items-center justify-center py-1">
                          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#B6B09F]/20"></div></div>
                          <span className="relative bg-white px-4 text-[9px] font-black text-[#7A756A]/50 uppercase tracking-widest">OU</span>
                        </div>
                      </>
                    )}
                    {mode === 'register' && (
                      <div className="relative group">
                        <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A756A] group-focus-within:text-black transition-colors" />
                        <input type="text" required placeholder="NOME COMPLETO" className="w-full pl-14 pr-6 py-3.5 bg-[#F2F2F2] border border-transparent rounded-2xl text-[10px] font-bold focus:bg-white focus:border-[#B6B09F]/30 focus:outline-none transition-all placeholder:text-[#7A756A]/60" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                      </div>
                    )}
                    {pendingPlanName && mode === 'register' && (
                      <div className="mb-4 p-3 bg-black/5 rounded-xl flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center bg-black rounded-lg">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-[9px] font-bold uppercase text-[#7A756A] tracking-wider">Ativando Plano</p>
                          <p className="text-xs font-black uppercase tracking-widest">{pendingPlanName}</p>
                        </div>
                      </div>
                    )}
                    <div className="relative group">
                      <Mail className={`absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${lockedEmail ? 'text-black' : 'text-[#7A756A] group-focus-within:text-black'}`} />
                      <input
                        type="email"
                        required
                        placeholder="E-MAIL"
                        disabled={lockedEmail}
                        readOnly={lockedEmail}
                        className={`w-full pl-14 pr-6 py-3.5 border rounded-2xl text-[10px] font-bold outline-none transition-all placeholder:text-[#7A756A]/60 ${lockedEmail
                          ? 'bg-black/5 border-black/10 text-black cursor-not-allowed opacity-70'
                          : 'bg-[#F2F2F2] border-transparent focus:bg-white focus:border-[#B6B09F]/30'
                          }`}
                        value={formData.email}
                        onChange={e => !lockedEmail && setFormData({ ...formData, email: e.target.value })}
                      />
                      {lockedEmail && <Lock className="absolute right-5 top-1/2 -translate-y-1/2 w-3 h-3 text-black/40" />}
                    </div>
                    {mode === 'register' && (
                      <div className="relative group">
                        <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A756A] group-focus-within:text-black transition-colors" />
                        <input type="text" required placeholder="CPF" className="w-full pl-14 pr-6 py-3.5 bg-[#F2F2F2] border border-transparent rounded-2xl text-[10px] font-bold focus:bg-white focus:border-[#B6B09F]/30 focus:outline-none transition-all placeholder:text-[#7A756A]/60" value={formData.cpf} onChange={handleCpfChange} />
                      </div>
                    )}
                    {mode !== 'forgot-password' && (
                      <div className="relative group">
                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A756A] group-focus-within:text-black transition-colors" />
                        <input type="password" required placeholder="SENHA DE ACESSO" className="w-full pl-14 pr-6 py-3.5 bg-[#F2F2F2] border border-transparent rounded-2xl text-[10px] font-bold focus:bg-white focus:border-[#B6B09F]/30 focus:outline-none transition-all placeholder:text-[#7A756A]/60" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                      </div>
                    )}
                    {mode === 'register' && (
                      <div className="space-y-4">
                        <div className="relative group">
                          <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A756A] group-focus-within:text-black transition-colors" />
                          <input type="password" required placeholder="CONFIRMAR SENHA" className="w-full pl-14 pr-6 py-3.5 bg-[#F2F2F2] border border-transparent rounded-2xl text-[10px] font-bold focus:bg-white focus:border-[#B6B09F]/30 focus:outline-none transition-all placeholder:text-[#7A756A]/60" value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} />
                        </div>
                        <div className="flex items-start space-x-3 p-2 bg-[#F2F2F2]/50 rounded-xl hover:bg-[#F2F2F2] transition-colors cursor-pointer" onClick={() => setFormData({ ...formData, terms: !formData.terms })}>
                          <input type="checkbox" id="terms" required className="mt-1 w-4 h-4 accent-black cursor-pointer" checked={formData.terms} onChange={e => setFormData({ ...formData, terms: e.target.checked })} />
                          <label className="text-[8px] font-bold text-[#7A756A] uppercase tracking-widest leading-relaxed cursor-pointer">Eu li e concordo com os <span className="text-black underline cursor-pointer hover:text-amber-600 transition-colors" onClick={(e) => { e.preventDefault(); setShowTerms(true); }}>Termos de Uso</span>.</label>
                        </div>
                      </div>
                    )}
                    <button type="submit" disabled={loading} className="w-full py-4 bg-black text-white rounded-[15px] font-black text-[11px] uppercase tracking-[0.3em] shadow-xl hover:bg-zinc-800 transition-all flex items-center justify-center space-x-3 disabled:bg-zinc-300 disabled:cursor-not-allowed group">
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>{mode === 'login' ? 'ENTRAR' : mode === 'register' ? 'CRIAR CONTA' : 'ENVIAR'}</span><ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
                    </button>
                  </form>

                  <div className="mt-6 pt-4 border-t border-[#B6B09F]/10 text-center">
                    {mode === 'login' ? (
                      <div className="space-y-3">
                        <button onClick={() => setMode('register')} className="text-[10px] font-black text-[#7A756A] uppercase tracking-widest hover:text-black transition-all">Novo aqui? <span className="underline">Criar conta grátis</span></button>
                        <br />
                        <button onClick={() => setMode('forgot-password')} className="text-[9px] font-black text-[#7A756A]/50 uppercase tracking-widest hover:text-black transition-all">Esqueci minha senha</button>
                      </div>
                    ) : (
                      <button onClick={() => setMode('login')} className="text-[10px] font-black text-[#7A756A] uppercase tracking-widest hover:text-black transition-all">Já tem conta? <span className="underline">Entrar agora</span></button>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div key="google-cpf" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-black rounded-xl mb-4 shadow-xl">
                      <ShieldCheck className="text-white w-6 h-6" />
                    </div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter mb-1">Segurança</h1>
                    <p className="text-[#7A756A] text-[9px] font-black uppercase tracking-widest">Confirme seu CPF para continuar.</p>
                  </div>
                  {error && <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center space-x-3 text-red-700 text-[9px] font-black uppercase tracking-widest leading-relaxed"><AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span></div>}
                  <form onSubmit={handleGoogleCompletion} className="space-y-4">
                    <div className="relative group">
                      <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A756A] group-focus-within:text-black transition-colors" />
                      <input type="text" required placeholder="SEU CPF" className="w-full pl-14 pr-6 py-3.5 bg-[#F2F2F2] border border-transparent rounded-2xl text-[10px] font-bold focus:bg-white focus:border-[#B6B09F]/30 focus:outline-none transition-all placeholder:text-[#7A756A]/60" value={cpfForGoogle} onChange={e => handleCpfChange(e, true)} />
                    </div>
                    <button type="submit" disabled={loading} className="w-full py-4 bg-black text-white rounded-[15px] font-black text-[11px] uppercase tracking-[0.3em] shadow-xl hover:bg-zinc-800 transition-all flex items-center justify-center space-x-3 disabled:bg-zinc-300 disabled:cursor-not-allowed group">
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>CONCLUIR</span><ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showTerms && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTerms(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[30px] shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden relative z-10"
            >
              <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-black uppercase tracking-tight">Termos de Uso</h2>
                </div>
                <button
                  onClick={() => setShowTerms(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400 hover:text-black" />
                </button>
              </div>

              <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar bg-gray-50/50">
                <div className="prose prose-sm max-w-none text-gray-600 space-y-6">
                  <p className="font-bold text-xs uppercase tracking-widest text-black">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

                  <section>
                    <h3 className="text-black font-black uppercase tracking-wide text-sm mb-2">1. Aceitação dos Termos</h3>
                    <p>Ao acessar e utilizar a plataforma Render XYZ, você concorda em cumprir e estar vinculado aos seguintes termos e condições de uso.</p>
                  </section>

                  <section>
                    <h3 className="text-black font-black uppercase tracking-wide text-sm mb-2">2. Serviços Oferecidos</h3>
                    <p>A Render XYZ fornece serviços de renderização de imagens arquitetônicas assistidos por Inteligência Artificial. Os resultados podem variar e dependem da qualidade dos inputs fornecidos pelo usuário.</p>
                  </section>

                  <section>
                    <h3 className="text-black font-black uppercase tracking-wide text-sm mb-2">3. Créditos e Pagamentos</h3>
                    <p>O uso da plataforma é baseado em créditos pré-pagos. Os créditos adquiridos não são reembolsáveis, exceto conforme exigido por lei. Os preços estão sujeitos a alterações sem aviso prévio.</p>
                  </section>

                  <section>
                    <h3 className="text-black font-black uppercase tracking-wide text-sm mb-2">4. Propriedade Intelectual</h3>
                    <p>Você mantém os direitos sobre as imagens originais enviadas. A Render XYZ concede a você uma licença perpétua e irrevogável para usar as imagens geradas para qualquer finalidade, comercial ou não.</p>
                  </section>

                  <section>
                    <h3 className="text-black font-black uppercase tracking-wide text-sm mb-2">5. Limitação de Responsabilidade</h3>
                    <p>A Render XYZ não se responsabiliza por danos diretos, indiretos, incidentais ou consequentes resultantes do uso ou da incapacidade de usar nossos serviços.</p>
                  </section>
                </div>
              </div>

              <div className="p-4 md:p-6 border-t border-gray-100 bg-white shrink-0 flex justify-end">
                <button
                  onClick={() => setShowTerms(false)}
                  className="px-8 py-3 bg-black text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-lg"
                >
                  Entendi
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
