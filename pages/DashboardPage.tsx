import React, { useState } from 'react';
import { RenderTool } from '../components/RenderTool';
import { CpfModal } from '../components/CpfModal';
import { AppUser, CreditPackage, LandingSettings, PricingPlan, RenderHistoryItem, RenderStyle } from '../types';
import { LogOut, User, Coins, Plus, ShieldCheck, Download, Trash2, Menu, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardProps {
    user: AppUser;
    credits: number;
    history: RenderHistoryItem[];
    onRenderComplete: (url: string, style: RenderStyle, cost?: number) => void;
    onLogout: () => void;
    isAdminMode: boolean; // Keep for now as a prop if App decides, but mostly likely unused or used for internal logic? 
    // Actually, AdminPage is now a route. Dashboard doesn't need to know about admin mode potentially, 
    // unless it shows the admin button.
    // landingSettings etc are needed if we want to pass them to AdminPage via route state or if AdminPage fetches them?
    // AdminPage needs them. Dashboard doesn't need to pass them to AdminPage if AdminPage is a separate route content in App.tsx.
    // So Dashboard doesn't need these props anymore EXCEPT to show the button if user is admin.

    // We can remove setters from here since Dashboard won't render AdminPanel.
    // But wait, App.tsx renders Dashboard. App.tsx passes these props. 
    // I need to clean up the interface.

    hasApiKey: boolean;
    handleOpenSelectKey: () => void;
    setHasApiKey: (has: boolean) => void;
    onDeleteHistory: (id: string) => void;
}

export const DashboardPage: React.FC<DashboardProps> = ({
    user, credits, history, onRenderComplete, onLogout,
    hasApiKey, handleOpenSelectKey, setHasApiKey,
    onDeleteHistory
}) => {
    const navigate = useNavigate();
    const [showCpfModal, setShowCpfModal] = useState(false);
    const [cpfBlocking, setCpfBlocking] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Helper for download
    const downloadHistoryImage = (url: string, style: RenderStyle) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = `renderxyz-render-${style.toLowerCase().replace(/\s+/g, '-')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!hasApiKey) {
        return (
            <div className="min-h-screen bg-[#F2F2F2] flex items-center justify-center p-4">
                <div className="max-w-xl w-full bg-[#EAE4D5] border border-[#B6B09F]/30 rounded-[35px] p-8 md:p-12 text-center">
                    <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-8"><Key className="text-white w-8 h-8" /></div>
                    <h2 className="text-2xl md:text-4xl font-black uppercase mb-4 tracking-tighter">Ativação</h2>
                    <p className="text-[#7A756A] text-xs font-bold uppercase tracking-widest mb-10">Vincule uma chave API Studio para iniciar.</p>
                    <button onClick={handleOpenSelectKey} className="w-full py-5 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Selecionar Chave</button>
                    <button onClick={onLogout} className="mt-8 text-[9px] font-black uppercase tracking-widest text-[#7A756A]">Sair</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F2F2F2] text-black">
            <div className="sticky top-0 z-50">
                {user.cpf === "" && (
                    <div
                        onClick={() => { setCpfBlocking(false); setShowCpfModal(true); }}
                        className="bg-orange-500 text-white py-2 text-center text-[9px] font-black uppercase tracking-widest cursor-pointer hover:bg-orange-600 transition-colors"
                    >
                        <span className="flex items-center justify-center gap-2">
                            <ShieldCheck className="w-3 h-3" />
                            Ação Necessária: Vincule seu CPF para liberar todas as funcionalidades. <span className="underline">Resolver Agora</span>
                        </span>
                    </div>
                )}
                <header className="h-16 md:h-20 border-b border-[#B6B09F]/20 bg-[#EAE4D5]/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8">
                    <a href="/dashboard" className="flex items-center hover:opacity-80 transition-opacity">
                        <img src="/assets/logo.png" alt="Render XYZ" className="h-6 md:h-8" />
                    </a>
                    <div className="flex items-center space-x-4 md:space-x-8">
                        {user.role === 'admin' && (
                            <button
                                onClick={() => navigate('/admin')}
                                className="p-2 bg-black text-white rounded-full hover:bg-zinc-800 transition-all flex items-center justify-center"
                                title="Painel Admin"
                            >
                                <ShieldCheck className="w-4 h-4" />
                            </button>
                        )}
                        <button
                            onClick={() => navigate('/perfil')}
                            className="p-2 bg-black/5 rounded-full hover:bg-black/10 transition-all"
                        >
                            <User className="w-4 h-4" />
                        </button>
                        <div className="flex items-center bg-black text-white px-3 md:px-5 py-1.5 md:py-2 rounded-xl shadow-lg">
                            <Coins className="w-3 h-3 md:w-4 md:h-4 mr-2 text-[#7A756A]" />
                            <span className="text-xs md:text-sm font-black">{credits}</span>
                            <span className="text-[8px] md:text-[9px] font-bold text-[#7A756A] ml-1 uppercase">créditos</span>
                            <button onClick={() => navigate('/planos')} className="ml-3 md:ml-6 bg-[#B6B09F] text-black p-1 rounded transition-all"><Plus className="w-3 h-3" /></button>
                        </div>
                        <button onClick={onLogout} className="p-2 bg-black/5 rounded-full"><LogOut className="w-3 h-3" /></button>
                    </div>
                </header>
            </div>

            {showCpfModal && user && (
                <CpfModal
                    user={user}
                    onSuccess={() => setShowCpfModal(false)}
                    onClose={() => setShowCpfModal(false)}
                    isBlocking={cpfBlocking}
                />
            )}

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
                <section className="mb-12 md:mb-20">
                    <div className="mb-6 md:mb-10 flex flex-col md:items-end md:flex-row justify-between border-b border-[#B6B09F]/20 pb-4 md:pb-6">
                        <div><h1 className="text-2xl md:text-4xl font-black tracking-tighter uppercase">Studio Pro</h1><p className="text-[#7A756A] text-[9px] md:text-[11px] font-black uppercase tracking-widest">Fidelidade Extrema Ativa</p></div>
                        <div className="mt-4 md:mt-0 flex items-center bg-[#B6B09F]/10 px-4 py-2 rounded-xl text-[9px] font-black uppercase"><div className="w-2 h-2 bg-black rounded-full mr-2 animate-pulse" />ONLINE</div>
                    </div>
                    <div className="bg-[#EAE4D5] border border-[#B6B09F]/30 p-4 md:p-10 rounded-[35px] md:rounded-[50px]">
                        <RenderTool
                            onRenderComplete={onRenderComplete}
                            credits={credits}
                            userPlan={user.plan || 'free'}
                            onKeyReset={() => setHasApiKey(false)}
                            onUpgrade={() => navigate('/planos')}
                        />
                    </div>
                </section>

                <section>
                    <div className="mb-6 border-b border-[#B6B09F]/20 pb-4"><h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter">Galeria Recente</h2></div>
                    {history.length === 0 ? (
                        <div className="bg-[#EAE4D5]/40 border border-dashed border-[#B6B09F]/40 rounded-[30px] p-20 text-center text-[#7A756A] font-black uppercase tracking-widest text-[10px]">Aguardando primeiro render</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                            {history.map((item) => (
                                <div key={item.id} className="group bg-[#EAE4D5] border border-[#B6B09F]/30 rounded-[25px] overflow-hidden hover:border-black transition-all">
                                    <div className="aspect-[4/3] relative">
                                        <img src={item.url} alt="Render" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center space-x-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => downloadHistoryImage(item.url, item.style)} className="p-3 bg-white rounded-xl"><Download className="w-5 h-5" /></button>
                                            <button onClick={() => onDeleteHistory(item.id)} className="p-3 bg-black text-white rounded-xl"><Trash2 className="w-5 h-5" /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div >
    );
};
