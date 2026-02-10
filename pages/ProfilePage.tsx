import React from 'react';
import { User, Mail, Calendar, CreditCard, Shield, LogOut, ArrowLeft } from 'lucide-react';
import { AppUser } from '../types';
import { useNavigate } from 'react-router-dom';

interface ProfilePageProps {
    user: AppUser;
    onLogout: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, onLogout }) => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#F2F2F2] p-4 md:p-8 flex items-center justify-center">
            <div className="max-w-xl w-full">
                <button onClick={() => navigate(-1)} className="mb-6 flex items-center text-sm font-bold text-gray-500 hover:text-black transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                </button>

                <div className="bg-white rounded-[35px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                    <div className="p-8 md:p-12">
                        <div className="mb-10 text-center">
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">Minha Conta</h2>
                            <p className="text-[#7A756A] text-xs font-bold uppercase tracking-widest mt-1">Gerencie suas informações</p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center space-x-6 p-6 bg-[#F8F6F1] rounded-[25px] border border-[#B6B09F]/20">
                                <div className="w-20 h-20 bg-black rounded-3xl flex items-center justify-center shadow-lg">
                                    <User className="text-white w-10 h-10" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black uppercase">{user.name}</h3>
                                    <p className="text-[10px] font-black text-[#7A756A] uppercase tracking-widest mt-1">{user.plan || 'Plano Free'}</p>
                                    <div className="mt-2 inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-[9px] font-bold uppercase tracking-widest">
                                        Ativo
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="p-5 bg-white border border-[#F2F2F2] hover:border-[#B6B09F]/30 rounded-2xl flex items-center space-x-4 transition-colors">
                                    <div className="p-3 bg-[#F2F2F2] rounded-xl"><Mail className="w-4 h-4 text-[#7A756A]" /></div>
                                    <div className="flex-1">
                                        <p className="text-[8px] font-black uppercase text-[#7A756A] mb-0.5">E-mail</p>
                                        <p className="text-xs font-bold">{user.email}</p>
                                    </div>
                                </div>

                                <div className="p-5 bg-white border border-[#F2F2F2] hover:border-[#B6B09F]/30 rounded-2xl flex items-center space-x-4 transition-colors">
                                    <div className="p-3 bg-[#F2F2F2] rounded-xl"><Shield className="w-4 h-4 text-[#7A756A]" /></div>
                                    <div className="flex-1">
                                        <p className="text-[8px] font-black uppercase text-[#7A756A] mb-0.5">CPF</p>
                                        <p className="text-xs font-bold font-mono">
                                            {user.cpf ? user.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.***.***-$4") : "Não informado"}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-5 bg-white border border-[#F2F2F2] hover:border-[#B6B09F]/30 rounded-2xl flex items-center space-x-4 transition-colors">
                                    <div className="p-3 bg-[#F2F2F2] rounded-xl"><Calendar className="w-4 h-4 text-[#7A756A]" /></div>
                                    <div className="flex-1">
                                        <p className="text-[8px] font-black uppercase text-[#7A756A] mb-0.5">Membro desde</p>
                                        <p className="text-xs font-bold">{new Date(user.joinedAt).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-[#F2F2F2] flex flex-col space-y-4">
                                <button
                                    onClick={onLogout}
                                    className="w-full py-4 bg-red-50 text-red-600 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center hover:bg-red-100 transition-all border border-transparent hover:border-red-200"
                                >
                                    <LogOut className="w-4 h-4 mr-3" /> Encerrar Sessão
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
