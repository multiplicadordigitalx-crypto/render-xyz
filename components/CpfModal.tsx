
import React, { useState } from 'react';
import { ShieldCheck, Loader2, ArrowRight, AlertCircle, X } from 'lucide-react';
import { authService, validateCPF } from '../services/authService';
import { toast } from 'react-hot-toast';
import { AppUser } from '../types';

interface CpfModalProps {
    user: AppUser;
    onSuccess: (updatedUser: AppUser) => void;
    onClose: () => void;
    isBlocking?: boolean; // If true, hide close button (for critical flows)
}

export const CpfModal: React.FC<CpfModalProps> = ({ user, onSuccess, onClose, isBlocking = false }) => {
    const [cpf, setCpf] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length <= 11) {
            value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
            setCpf(value);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (!cpf) throw new Error("Informe seu CPF para continuar.");
            if (!validateCPF(cpf)) throw new Error("CPF inválido.");

            const updatedUser = await authService.updateProfileCpf(user.id, cpf);
            toast.success("CPF vinculado com sucesso!");
            onSuccess(updatedUser);
            onClose();
        } catch (err: any) {
            setError(err.message || "Erro ao atualizar CPF.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[30px] w-full max-w-md p-8 relative shadow-2xl animate-in zoom-in-95 duration-200">
                {!isBlocking && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-black/5 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-zinc-400" />
                    </button>
                )}

                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-black rounded-xl mb-4 shadow-xl">
                        <ShieldCheck className="text-white w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Segurança</h2>
                    <p className="text-[#B6B09F] text-[10px] font-black uppercase tracking-widest leading-relaxed">
                        Para sua segurança e conformidade, precisamos que você vincule seu CPF à conta antes de continuar.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center space-x-3 text-red-700 text-[9px] font-black uppercase tracking-widest leading-relaxed">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative group">
                        <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B6B09F] group-focus-within:text-black transition-colors" />
                        <input
                            type="text"
                            required
                            placeholder="SEU CPF"
                            className="w-full pl-14 pr-6 py-4 bg-[#F2F2F2] border border-transparent rounded-2xl text-[11px] font-bold focus:bg-white focus:border-[#B6B09F]/30 focus:outline-none transition-all placeholder:text-[#B6B09F]/60"
                            value={cpf}
                            onChange={handleCpfChange}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-black text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] shadow-xl hover:bg-zinc-800 transition-all flex items-center justify-center space-x-3 disabled:bg-zinc-300 disabled:cursor-not-allowed group"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <span>VINCULAR CPF</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};
