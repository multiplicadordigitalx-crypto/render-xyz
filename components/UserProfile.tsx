
import React from 'react';
import { User, Mail, Calendar, CreditCard, Shield, LogOut, X } from 'lucide-react';
import { AppUser } from '../types';

interface UserProfileProps {
    user: AppUser;
    onClose: () => void;
    onLogout: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, onClose, onLogout }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-[#F2F2F2] w-full max-w-xl rounded-[35px] overflow-hidden shadow-2xl">
                <div className="p-8 md:p-12">
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">Minha Conta</h2>
                        <button onClick={onClose} className="p-2 bg-[#EAE4D5] rounded-full"><X className="w-6 h-6" /></button>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center space-x-6 p-6 bg-white rounded-[25px] border border-[#B6B09F]/20">
                            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center">
                                <User className="text-white w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black uppercase">{user.name}</h3>
                                <p className="text-[10px] font-black text-[#7A756A] uppercase tracking-widest">{user.plan || 'Plano Free'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="p-5 bg-[#EAE4D5]/50 rounded-2xl flex items-center space-x-4 border border-[#B6B09F]/20">
                                <Mail className="w-4 h-4 text-[#7A756A]" />
                                <div className="flex-1">
                                    <p className="text-[8px] font-black uppercase text-[#7A756A]">E-mail</p>
                                    <p className="text-[10px] font-bold">{user.email}</p>
                                </div>
                            </div>

                            <div className="p-5 bg-[#EAE4D5]/50 rounded-2xl flex items-center space-x-4 border border-[#B6B09F]/20">
                                <Shield className="w-4 h-4 text-[#7A756A]" />
                                <div className="flex-1">
                                    <p className="text-[8px] font-black uppercase text-[#7A756A]">CPF</p>
                                    <p className="text-[10px] font-bold">
                                        {user.cpf ? user.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.***.***-$4") : "Não informado"}
                                    </p>
                                </div>
                            </div>

                            <div className="p-5 bg-[#EAE4D5]/50 rounded-2xl flex items-center space-x-4 border border-[#B6B09F]/20">
                                <Calendar className="w-4 h-4 text-[#7A756A]" />
                                <div className="flex-1">
                                    <p className="text-[8px] font-black uppercase text-[#7A756A]">Membro desde</p>
                                    <p className="text-[10px] font-bold">{new Date(user.joinedAt).toLocaleDateString('pt-BR')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-[#B6B09F]/20 flex flex-col space-y-4">
                            <button
                                onClick={onLogout}
                                className="w-full py-4 bg-red-50 text-red-600 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center hover:bg-red-100 transition-all"
                            >
                                <LogOut className="w-4 h-4 mr-3" /> Encerrar Sessão
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
