import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, CreditCard, Shield, LogOut, ArrowLeft, History, TrendingUp, TrendingDown, Coins, X, Plus } from 'lucide-react';
import { AppUser, CreditTransaction } from '../types';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';

interface ProfilePageProps {
    user: AppUser;
    onLogout: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, onLogout }) => {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user.id) return;

        const q = query(
            collection(db, "credit_transactions"),
            where("userId", "==", user.id),
            orderBy("timestamp", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const txList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as CreditTransaction));
            setTransactions(txList);
            setLoading(false);
        }, (error) => {
            console.error("Erro ao buscar transações de créditos:", error);
            setLoading(false); // Para o girino se der erro (ex: falta de permissão)
        });

        return () => unsubscribe();
    }, [user.id]);

    return (
        <div className="min-h-screen bg-[#F2F2F2] p-4 md:p-8 flex items-center justify-center">
            <div className="max-w-6xl w-full mx-auto"> {/* Increased max-width for better flow on desktop */}

                <button onClick={() => navigate(-1)} className="mb-6 flex items-center text-sm font-bold text-gray-500 hover:text-black transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-500">
                    {/* User Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-[35px] shadow-2xl overflow-hidden h-full">
                            <div className="p-8">
                                <div className="mb-8 text-center">
                                    <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter">Minha Conta</h2>
                                    <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest mt-1">Perfil do usuário</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex flex-col items-center p-6 bg-neutral-50 rounded-[25px] border border-neutral-200">
                                        <div className="w-20 h-20 bg-black rounded-3xl flex items-center justify-center shadow-lg mb-4">
                                            <User className="text-white w-10 h-10" />
                                        </div>
                                        <div className="text-center">
                                            <h3 className="text-lg font-black uppercase break-all">{user.name}</h3>
                                            <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest mt-1">{user.plan || 'Plano Free'}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-3 p-4 bg-white border border-[#F2F2F2] rounded-2xl">
                                            <Mail className="w-4 h-4 text-neutral-400" />
                                            <div className="overflow-hidden">
                                                <p className="text-[7px] font-black uppercase text-neutral-400">E-mail</p>
                                                <p className="text-[10px] font-bold truncate">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3 p-4 bg-white border border-[#F2F2F2] rounded-2xl">
                                            <Shield className="w-4 h-4 text-neutral-400" />
                                            <div>
                                                <p className="text-[7px] font-black uppercase text-neutral-400">CPF</p>
                                                <p className="text-[10px] font-bold">
                                                    {user.cpf ? user.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.***.***-$4") : "Pendente"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={onLogout}
                                        className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center hover:bg-red-100 transition-all border border-transparent hover:border-red-200"
                                    >
                                        <LogOut className="w-3 h-3 mr-2" /> Encerrar Sessão
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Credit History Card */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-[35px] shadow-2xl overflow-hidden h-full flex flex-col">
                            <div className="p-8 md:p-10 flex-1 flex flex-col">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter">Extrato de Créditos</h2>
                                        <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest mt-1">Histórico completo de uso</p>
                                    </div>
                                    <div className="flex items-center bg-amber-50 border border-amber-200 px-4 py-2 rounded-2xl">
                                        <Coins className="w-4 h-4 mr-2 text-amber-600" />
                                        <div>
                                            <p className="text-[7px] font-black uppercase text-amber-700">Saldo Atual</p>
                                            <p className="text-sm font-black text-amber-900 leading-none">{user.credits}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[400px]">
                                    {loading ? (
                                        <div className="h-full flex items-center justify-center py-20">
                                            <div className="w-8 h-8 border-2 border-neutral-200 border-t-black rounded-full animate-spin" />
                                        </div>
                                    ) : transactions.length > 0 ? (
                                        <div className="space-y-3">
                                            {transactions.map((tx) => (
                                                <div key={tx.id} className="flex items-center justify-between p-4 bg-neutral-50 border border-neutral-100 rounded-2xl">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`p-2 rounded-xl ${
                                                            tx.type === 'error' || tx.status === 'failed' ? 'bg-red-100 text-red-600' :
                                                            tx.type === 'purchase' || tx.type === 'bonus' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                                                        }`}>
                                                            {tx.type === 'error' || tx.status === 'failed' ? <X className="w-4 h-4" /> :
                                                             tx.type === 'purchase' || tx.type === 'bonus' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-[10px] font-black uppercase tracking-tight">{tx.description}</p>
                                                                {tx.status === 'failed' && <span className="bg-red-100 text-red-600 text-[7px] px-1.5 py-0.5 rounded font-black uppercase tracking-widest">Falhou</span>}
                                                            </div>
                                                            <p className="text-[8px] font-bold text-neutral-400 uppercase">
                                                                {new Date(tx.timestamp).toLocaleString('pt-BR', { 
                                                                    day: '2-digit', 
                                                                    month: '2-digit', 
                                                                    year: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                }).replace(',', ' •')}
                                                                {user.role === 'admin' && tx.modelUsed && ` • Modelo: ${tx.modelUsed}`}
                                                            </p>
                                                            {tx.errorMsg && <p className="text-[8px] mt-1 text-red-500 font-bold truncate max-w-[200px]" title={tx.errorMsg}>{tx.errorMsg}</p>}
                                                        </div>
                                                    </div>
                                                    <div className={`text-xs font-black ${
                                                        tx.type === 'error' || tx.status === 'failed' ? 'text-neutral-400' :
                                                        tx.type === 'purchase' || tx.type === 'bonus' ? 'text-emerald-600' : 'text-red-500'
                                                    }`}>
                                                        {tx.type === 'error' || tx.status === 'failed' ? '0' : 
                                                         tx.type === 'purchase' || tx.type === 'bonus' ? `+${tx.amount}` : `-${tx.amount}`}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center py-20 text-center opacity-40">
                                            <History className="w-12 h-12 mb-4" />
                                            <p className="text-xs font-black uppercase">Nenhuma transação encontrada</p>
                                        </div>
                                    )}
                                </div>

                                <button 
                                    onClick={() => navigate('/planos')}
                                    className="mt-8 w-full py-4 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-xl"
                                >
                                    <Plus className="w-4 h-4" /> Comprar mais créditos
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


