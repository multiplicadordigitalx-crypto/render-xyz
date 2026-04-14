import React, { useState } from 'react';
import { RenderTool } from '../components/RenderTool';
import { HistorySidebar } from '../components/HistorySidebar';
import { CpfModal } from '../components/CpfModal';
import { AppUser, CreditPackage, LandingSettings, PricingPlan, RenderHistoryItem, RenderStyle } from '../types';
import { LogOut, User, Coins, Plus, ShieldCheck, Download, Trash2, Menu, Key, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

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

    // Helper to fetch image blob (handles CORS/Proxy)
    const fetchImageBlob = async (url: string): Promise<Blob> => {
        // Use the local proxy if running locally or the deployed one
        const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`;

        try {
            const response = await fetch(proxyUrl);
            if (!response.ok) throw new Error('Falha no proxy de imagem');
            return await response.blob();
        } catch (e) {
            console.error("Proxy failed, trying direct fetch (fallback)", e);
            const response = await fetch(url);
            return await response.blob();
        }
    };

    // Helper for download
    const downloadHistoryImage = async (url: string, style: RenderStyle) => {
        const loadingToast = toast.loading('Preparando download...');
        try {
            const blob = await fetchImageBlob(url);
            const objectUrl = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = objectUrl;
            link.download = `renderxyz-render-${style.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            window.URL.revokeObjectURL(objectUrl);
            toast.success('Download concluído!', { id: loadingToast });
        } catch (error) {
            console.error("Erro no download:", error);
            toast.error("Falha ao baixar imagem.", { id: loadingToast });

            // Fallback to simple link method if blob fails
            const link = document.createElement('a');
            link.href = url;
            link.target = '_blank';
            link.download = `renderxyz-render-${style}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
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
            <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
                <div className="max-w-xl w-full bg-white border border-neutral-200 rounded-[35px] p-8 md:p-12 text-center shadow-2xl">
                    <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-8"><Key className="text-white w-8 h-8" /></div>
                    <h2 className="text-2xl md:text-4xl font-black uppercase mb-4 tracking-tighter">Ativação</h2>
                    <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest mb-10">Vincule uma chave API Studio para iniciar.</p>

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

                    <button onClick={onLogout} className="mt-8 text-[9px] font-black uppercase tracking-widest text-neutral-500 hover:text-black">Sair</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-200 text-black flex flex-col overflow-y-auto md:overflow-hidden">
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
            <header className="h-14 border-b border-neutral-200 bg-white flex items-center justify-between px-4 z-40 shrink-0">
                <div className="flex items-center space-x-4">
                    <a href="/dashboard" className="flex items-center hover:opacity-80 transition-opacity">
                        <img src="/assets/logo.png" alt="Render XYZ" className="h-5 md:h-6" />
                    </a>
                    <div className="h-4 w-px bg-neutral-300" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Studio Pro</span>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="flex items-center bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-200 px-3 py-1.5 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-all group" onClick={() => navigate('/planos')}>
                        <Coins className="w-4 h-4 mr-2 text-blue-600 group-hover:scale-110 transition-transform" />
                        <div className="flex flex-col justify-center mr-3">
                            <span className="text-sm font-black text-blue-950 leading-none">{credits}</span>
                            <span className="text-[8px] font-black text-blue-700 uppercase tracking-widest">Créditos</span>
                        </div>
                        <button className="bg-blue-600 text-white p-1.5 rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center shadow-md">
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex items-center space-x-2">
                        {user.role === 'admin' && (
                            <button
                                onClick={() => navigate('/admin')}
                                className="p-2 hover:bg-neutral-100 rounded-lg transition-all text-neutral-500 hover:text-black"
                                title="Painel Admin"
                            >
                                <ShieldCheck className="w-4 h-4" />
                            </button>
                        )}
                        <button
                            onClick={() => navigate('/contato')}
                            className="p-2 hover:bg-neutral-100 rounded-lg transition-all text-neutral-500 hover:text-black"
                            title="Suporte / Contato"
                        >
                            <Mail className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => navigate('/perfil')}
                            className="p-2 hover:bg-neutral-100 rounded-lg transition-all text-neutral-500 hover:text-black"
                            title="Perfil"
                        >
                            <User className="w-4 h-4" />
                        </button>
                        <button onClick={onLogout} className="p-2 hover:bg-neutral-100 rounded-lg transition-all text-neutral-500 hover:text-red-600" title="Sair"><LogOut className="w-4 h-4" /></button>
                    </div>
                </div>
            </header>

            {/* Main Studio Area */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                {/* Render Tool (Top Canvas) */}
                <div className="flex-1 p-4 overflow-hidden flex flex-col min-h-0">
                    <RenderTool
                        onRenderComplete={onRenderComplete}
                        credits={credits}
                        userPlan={user.plan || 'free'}
                        onKeyReset={() => setHasApiKey(false)}
                        onUpgrade={() => navigate('/planos')}
                        isAdmin={user.role === 'admin'}
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
                        onRefine={(item) => {
                            const element = document.getElementById('render-tool-root');
                            if (element) element.scrollIntoView({ behavior: 'smooth' });
                            window.dispatchEvent(new CustomEvent('load-image-for-refine', { detail: item.url }));
                        }}
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
