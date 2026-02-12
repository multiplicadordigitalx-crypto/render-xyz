import React, { useState } from 'react';
import { RenderTool } from '../components/RenderTool';
import { HistorySidebar } from '../components/HistorySidebar';
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
    isAdminMode: boolean;
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

    // Helper for download
    const downloadHistoryImage = (url: string, style: RenderStyle) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = `renderxyz-render-${style.toLowerCase().replace(/\s+/g, '-')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const [manualKey, setManualKey] = useState("");

    // Only show API Key activation screen for Admins
    if (!hasApiKey && user.role === 'admin') {
        const handleManualKeySubmit = () => {
            if (manualKey.length > 30) {
                localStorage.setItem('gemini_api_key', manualKey);
                setHasApiKey(true);
                window.location.reload(); // Force reload to ensure service picks up the new key
            } else {
                alert("Chave muito curta. Verifique se copiou corretamente.");
            }
        };

        return (
            <div className="min-h-screen bg-[#EAE4D5] flex items-center justify-center p-4">
                <div className="max-w-xl w-full bg-[#F2F2F2] border border-[#B6B09F]/30 rounded-[35px] p-8 md:p-12 text-center shadow-2xl">
                    <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-8"><Key className="text-white w-8 h-8" /></div>
                    <h2 className="text-2xl md:text-4xl font-black uppercase mb-4 tracking-tighter">Ativação</h2>
                    <p className="text-[#7A756A] text-xs font-bold uppercase tracking-widest mb-10">Vincule uma chave API Studio para iniciar.</p>

                    <div className="space-y-3">
                        <button onClick={handleOpenSelectKey} className="w-full py-4 bg-black text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-zinc-800 transition-all flex items-center justify-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Via Extensão (AI Studio)
                        </button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-[#F2F2F2] px-2 text-gray-500 font-bold">Ou cole sua chave</span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={manualKey}
                                onChange={(e) => setManualKey(e.target.value)}
                                placeholder="AIzaSy..."
                                className="flex-1 p-3 rounded-xl border border-gray-300 text-xs font-mono focus:border-black outline-none"
                            />
                            <button
                                onClick={handleManualKeySubmit}
                                className="px-4 bg-gray-900 text-white rounded-xl font-bold text-xs uppercase hover:bg-black"
                            >
                                Salvar
                            </button>
                        </div>
                        <p className="text-[9px] text-gray-400 mt-2">A chave será salva no seu navegador (Local Storage).</p>
                    </div>

                    <button onClick={onLogout} className="mt-8 text-[9px] font-black uppercase tracking-widest text-[#7A756A] hover:text-black">Sair</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#dcd7c9] text-black flex flex-col overflow-y-auto md:overflow-hidden">
            {/* CPF Warning Bar */}
            {user.cpf === "" && (
                <div
                    onClick={() => { setCpfBlocking(false); setShowCpfModal(true); }}
                    className="bg-orange-500 text-white py-1 text-center text-[9px] font-black uppercase tracking-widest cursor-pointer hover:bg-orange-600 transition-colors z-50"
                >
                    <span className="flex items-center justify-center gap-2">
                        <ShieldCheck className="w-3 h-3" />
                        Ação Necessária: Vincule seu CPF para liberar todas as funcionalidades. <span className="underline">Resolver Agora</span>
                    </span>
                </div>
            )}

            {/* Studio Header */}
            <header className="h-14 border-b border-[#B6B09F]/20 bg-[#EAE4D5] flex items-center justify-between px-4 z-40 shrink-0">
                <div className="flex items-center space-x-4">
                    <a href="/dashboard" className="flex items-center hover:opacity-80 transition-opacity">
                        <img src="/assets/logo.png" alt="Render XYZ" className="h-5 md:h-6" />
                    </a>
                    <div className="h-4 w-px bg-[#B6B09F]/30" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#7A756A]">Studio Pro</span>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="flex items-center bg-[#F2F2F2] border border-[#B6B09F]/20 px-3 py-1.5 rounded-lg">
                        <Coins className="w-3 h-3 mr-2 text-[#7A756A]" />
                        <span className="text-xs font-black">{credits}</span>
                        <span className="text-[10px] font-black text-[#7A756A] ml-1">CRÉDITOS</span>
                        <button onClick={() => navigate('/planos')} className="ml-3 bg-black text-white p-0.5 rounded hover:bg-zinc-800 transition-all"><Plus className="w-3 h-3" /></button>
                    </div>

                    <div className="flex items-center space-x-2">
                        {user.role === 'admin' && (
                            <button
                                onClick={() => navigate('/admin')}
                                className="p-2 hover:bg-[#B6B09F]/20 rounded-lg transition-all text-[#7A756A] hover:text-black"
                                title="Painel Admin"
                            >
                                <ShieldCheck className="w-4 h-4" />
                            </button>
                        )}
                        <button
                            onClick={() => navigate('/perfil')}
                            className="p-2 hover:bg-[#B6B09F]/20 rounded-lg transition-all text-[#7A756A] hover:text-black"
                            title="Perfil"
                        >
                            <User className="w-4 h-4" />
                        </button>
                        <button onClick={onLogout} className="p-2 hover:bg-[#B6B09F]/20 rounded-lg transition-all text-[#7A756A] hover:text-red-600" title="Sair"><LogOut className="w-4 h-4" /></button>
                    </div>
                </div>
            </header>

            {/* Main Studio Area */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                {/* Render Tool (Top Canvas) */}
                <div className="flex-1 p-4 overflow-hidden flex flex-col">
                    <RenderTool
                        onRenderComplete={onRenderComplete}
                        credits={credits}
                        userPlan={user.plan || 'free'}
                        onKeyReset={() => setHasApiKey(false)}
                        onUpgrade={() => navigate('/planos')}
                    />
                </div>

                {/* History Sidebar (Bottom Scroll) */}
                <div className="w-full">
                    <HistorySidebar
                        history={history}
                        onSelect={(item) => {
                            downloadHistoryImage(item.url, item.style);
                        }}
                        onDownload={downloadHistoryImage}
                        onDelete={onDeleteHistory}
                    />
                </div>
            </main>

            {showCpfModal && user && (
                <CpfModal
                    user={user}
                    onSuccess={() => setShowCpfModal(false)}
                    onClose={() => setShowCpfModal(false)}
                    isBlocking={cpfBlocking}
                />
            )}
        </div>
    );
};
