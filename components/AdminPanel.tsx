
import React, { useState, useRef } from 'react';
import {
    X,
    ShieldCheck,
    BarChart3,
    Users,
    DollarSign,
    Layers,
    Tag,
    Coins,
    Upload,
    Image as ImageIconLucide,
    FileVideo,
    Save,
    Plus
} from 'lucide-react';
import { doc, updateDoc, collection, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { PricingPlan, CreditPackage, AppUser, LandingSettings } from '../types';

interface AdminPanelProps {
    landingSettings: LandingSettings;
    setLandingSettings: (settings: LandingSettings) => void;
    pricingPlans: PricingPlan[];
    setPricingPlans: (plans: PricingPlan[]) => void;
    creditPackages: CreditPackage[];
    setCreditPackages: (packs: CreditPackage[]) => void;
    appUsers: AppUser[];
    setAppUsers: (users: AppUser[]) => void;
    onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
    landingSettings,
    setLandingSettings,
    pricingPlans,
    setPricingPlans,
    creditPackages,
    setCreditPackages,
    appUsers,
    setAppUsers,
    onClose
}) => {
    const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'content' | 'pricing'>('content');
    const [tempLanding, setTempLanding] = useState<LandingSettings>(landingSettings);
    const [tempCreditPackages, setTempCreditPackages] = useState<CreditPackage[]>(creditPackages);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUserForCredits, setSelectedUserForCredits] = useState<AppUser | null>(null);
    const [creditAmount, setCreditAmount] = useState('');

    const handleCreditOperation = async (type: 'add' | 'remove') => {
        if (!selectedUserForCredits || !creditAmount) return;

        const amount = parseInt(creditAmount);
        if (isNaN(amount) || amount <= 0) return;

        const currentCredits = selectedUserForCredits.credits || 0;
        const newCredits = type === 'add' ? currentCredits + amount : Math.max(0, currentCredits - amount);

        await handleUserUpdate(selectedUserForCredits.id, { credits: newCredits });

        // Update local selected user state to show new balance immediately if modal stays open (or close it)
        // Let's close it after operation for feedback
        alert(`Créditos ${type === 'add' ? 'adicionados' : 'removidos'} com sucesso!`);
        setSelectedUserForCredits(null);
        setCreditAmount('');
    };

    const fileInputBeforeRef = useRef<HTMLInputElement>(null);
    const fileInputAfterRef = useRef<HTMLInputElement>(null);
    const fileInputVideoRef = useRef<HTMLInputElement>(null);
    const fileInputPosterRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, key: keyof LandingSettings) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setTempLanding(prev => ({ ...prev, [key]: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCreditPriceChange = (index: number, price: string) => {
        const newPacks = [...tempCreditPackages];
        newPacks[index].price = price;
        setTempCreditPackages(newPacks);
    };

    const handleSaveAdmin = async () => {
        try {
            await setDoc(doc(db, "settings", "global"), {
                landing: tempLanding,
                credits: tempCreditPackages
            }, { merge: true });

            setLandingSettings(tempLanding);
            setCreditPackages(tempCreditPackages);
            onClose();
        } catch (error) {
            console.error("Error saving global settings:", error);
            alert("Erro ao salvar configurações no Firestore.");
        }
    };

    const handleUserUpdate = async (id: string, updates: Partial<AppUser>) => {
        try {
            await updateDoc(doc(db, "users", id), updates);
            // Local state will be updated if App.tsx uses a listener for users (optional)
            // For now let's update parents state manually to show change
            const updated = appUsers.map(u => u.id === id ? { ...u, ...updates } : u);
            setAppUsers(updated);
        } catch (error) {
            console.error("Error updating user:", error);
        }
    };

    const filteredUsers = appUsers.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-2 md:p-8">
            <div className="bg-[#F2F2F2] w-full max-w-6xl h-full max-h-[95vh] rounded-[30px] md:rounded-[40px] shadow-2xl overflow-hidden flex flex-col">
                <div className="p-4 md:p-8 border-b border-[#B6B09F]/20 flex justify-between items-center bg-white/50">
                    <a href="/" className="flex items-center space-x-3 md:space-x-4 hover:opacity-80 transition-opacity">
                        <img src="/assets/logo.png" alt="Render XYZ" className="h-8 md:h-12" />
                        <div className="hidden sm:block border-l border-[#B6B09F]/20 pl-4">
                            <h2 className="text-sm md:text-lg font-black uppercase tracking-tighter">Control</h2>
                            <p className="text-[8px] md:text-[9px] font-black text-[#7A756A] uppercase tracking-[0.2em]">Gestão</p>
                        </div>
                    </a>
                    <button onClick={onClose} className="p-3 md:p-4 bg-[#EAE4D5] rounded-full hover:bg-zinc-200 transition-all"><X className="w-5 h-5 md:w-6 md:h-6" /></button>
                </div>
                <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                    <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[#B6B09F]/20 p-2 md:p-6 flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-2 bg-[#EAE4D5]/20 overflow-x-auto whitespace-nowrap">
                        <button onClick={() => setActiveTab('stats')} className={`flex items-center space-x-3 p-3 md:p-4 rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest ${activeTab === 'stats' ? 'bg-black text-white' : 'text-[#7A756A] hover:bg-black/5'}`}>
                            <BarChart3 className="w-4 h-4" /><span>Estatísticas</span>
                        </button>
                        <button onClick={() => setActiveTab('users')} className={`flex items-center space-x-3 p-3 md:p-4 rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest ${activeTab === 'users' ? 'bg-black text-white' : 'text-[#7A756A] hover:bg-black/5'}`}>
                            <Users className="w-4 h-4" /><span>Usuários</span>
                        </button>
                        <button onClick={() => setActiveTab('pricing')} className={`flex items-center space-x-3 p-3 md:p-4 rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest ${activeTab === 'pricing' ? 'bg-black text-white' : 'text-[#7A756A] hover:bg-black/5'}`}>
                            <DollarSign className="w-4 h-4" /><span>Preços</span>
                        </button>
                        <button onClick={() => setActiveTab('content')} className={`flex items-center space-x-3 p-3 md:p-4 rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest ${activeTab === 'content' ? 'bg-black text-white' : 'text-[#7A756A] hover:bg-black/5'}`}>
                            <Layers className="w-4 h-4" /><span>Landing</span>
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-white/30">
                        {activeTab === 'pricing' && (
                            <div className="space-y-10 pb-10">

                                <div className="space-y-6">
                                    <h3 className="text-xl font-black uppercase tracking-tight flex items-center"><Coins className="w-5 h-5 mr-3" /> Pacotes de Créditos</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {tempCreditPackages.map((pkg, idx) => (
                                            <div key={idx} className="bg-white p-6 rounded-3xl border border-[#B6B09F]/20">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-[#7A756A] block mb-2">{pkg.amount} Créditos</label>
                                                <div className="flex items-center bg-[#F2F2F2] px-4 py-3 rounded-xl">
                                                    <span className="font-bold text-xs mr-2">R$</span>
                                                    <input type="text" value={pkg.price} onChange={(e) => handleCreditPriceChange(idx, e.target.value)} className="bg-transparent w-full text-xs font-black focus:outline-none" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <button onClick={handleSaveAdmin} className="w-full py-6 bg-black text-white rounded-[30px] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center shadow-xl"><Save className="w-5 h-5 mr-3" /> Salvar Configurações</button>
                            </div>
                        )}
                        {activeTab === 'content' && (
                            <div className="space-y-10 pb-10">
                                <div className="space-y-8">
                                    <h3 className="text-xl font-black uppercase tracking-tight flex items-center"><ImageIconLucide className="w-5 h-5 mr-3" /> Gerenciar Ativos da Landing</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="bg-white p-6 md:p-8 rounded-[30px] border border-[#B6B09F]/20 shadow-sm space-y-4">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-[#7A756A] block">Slider: Imagem Antes (Anexo)</label>
                                            <input type="file" ref={fileInputBeforeRef} onChange={(e) => handleFileUpload(e, 'showcaseBefore')} className="hidden" accept="image/*" />
                                            <button onClick={() => fileInputBeforeRef.current?.click()} className="w-full py-4 bg-[#F2F2F2] border-2 border-dashed border-[#B6B09F]/30 rounded-2xl flex items-center justify-center space-x-3 hover:border-black transition-all">
                                                <Upload className="w-5 h-5" /> <span className="text-[10px] font-black uppercase tracking-widest">Anexar Imagem</span>
                                            </button>
                                            <div className="aspect-video rounded-xl overflow-hidden border border-[#B6B09F]/10 bg-[#F2F2F2] group relative">
                                                <img src={tempLanding.showcaseBefore} alt="Preview Before" className="w-full h-full object-cover" />
                                            </div>
                                        </div>
                                        <div className="bg-white p-6 md:p-8 rounded-[30px] border border-[#B6B09F]/20 shadow-sm space-y-4">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-[#7A756A] block">Slider: Imagem Depois (Anexo)</label>
                                            <input type="file" ref={fileInputAfterRef} onChange={(e) => handleFileUpload(e, 'showcaseAfter')} className="hidden" accept="image/*" />
                                            <button onClick={() => fileInputAfterRef.current?.click()} className="w-full py-4 bg-[#F2F2F2] border-2 border-dashed border-[#B6B09F]/30 rounded-2xl flex items-center justify-center space-x-3 hover:border-black transition-all">
                                                <Upload className="w-5 h-5" /> <span className="text-[10px] font-black uppercase tracking-widest">Anexar Imagem</span>
                                            </button>
                                            <div className="aspect-video rounded-xl overflow-hidden border border-[#B6B09F]/10 bg-[#F2F2F2]">
                                                <img src={tempLanding.showcaseAfter} alt="Preview After" className="w-full h-full object-cover" />
                                            </div>
                                        </div>
                                        <div className="bg-white p-6 md:p-8 rounded-[30px] border border-[#B6B09F]/20 shadow-sm space-y-6">
                                            <div>
                                                <label className="text-[9px] font-black uppercase tracking-widest text-[#7A756A] block mb-2">Fluxo: Vídeo MP4 (Direto ou URL)</label>
                                                <div className="space-y-4">
                                                    <div className="flex flex-col space-y-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Cole aqui a URL do Vídeo (YouTube ou Direct .mp4)"
                                                            value={tempLanding.heroVideoUrl}
                                                            onChange={(e) => setTempLanding(prev => ({ ...prev, heroVideoUrl: e.target.value }))}
                                                            className="w-full py-4 px-6 bg-[#F2F2F2] rounded-2xl text-[11px] font-bold focus:outline-none border border-transparent focus:border-black transition-all"
                                                        />
                                                        <p className="text-[8px] font-black text-[#7A756A] uppercase tracking-widest pl-2">YouTube: use o link de compartilhamento ou da barra de endereços</p>
                                                    </div>

                                                    <div className="relative">
                                                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center px-4 pointer-events-none">
                                                            <div className="flex-1 border-t border-[#B6B09F]/20"></div>
                                                            <span className="mx-4 text-[8px] font-black text-[#7A756A]">OU ANEXAR ARQUIVO</span>
                                                            <div className="flex-1 border-t border-[#B6B09F]/20"></div>
                                                        </div>
                                                        <div className="h-8"></div>
                                                    </div>

                                                    <input type="file" ref={fileInputVideoRef} onChange={(e) => handleFileUpload(e, 'heroVideoUrl')} className="hidden" accept="video/mp4" />
                                                    <button onClick={() => fileInputVideoRef.current?.click()} className="w-full py-4 bg-[#F2F2F2] border-2 border-dashed border-[#B6B09F]/30 rounded-2xl flex items-center justify-center space-x-3 hover:border-black transition-all group">
                                                        <Upload className="w-5 h-5 text-[#7A756A] group-hover:text-black transition-colors" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Selecionar Arquivo MP4</span>
                                                    </button>
                                                    <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest text-center">Aviso: Arquivos {'>'} 1MB podem não salvar devido ao limite do banco de dados.</p>
                                                </div>
                                            </div>

                                            <div className="aspect-[9/16] max-w-[200px] mx-auto rounded-3xl overflow-hidden border-4 border-black bg-[#F2F2F2] flex items-center justify-center shadow-lg relative">
                                                {tempLanding.heroVideoUrl ? (
                                                    <div className="w-full h-full">
                                                        {tempLanding.heroVideoUrl.includes('youtube.com') || tempLanding.heroVideoUrl.includes('youtu.be') ? (
                                                            <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                                                                <FileVideo className="text-white/20 w-12 h-12" />
                                                            </div>
                                                        ) : (
                                                            <video key={tempLanding.heroVideoUrl} className="w-full h-full object-cover" muted autoPlay loop playsInline>
                                                                <source src={tempLanding.heroVideoUrl} />
                                                            </video>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="text-[9px] font-black text-[#7A756A] uppercase text-center px-4">Preview indisponível</div>
                                                )}
                                                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1 bg-black/20 rounded-full" />
                                            </div>
                                        </div>
                                        <div className="bg-white p-6 md:p-8 rounded-[30px] border border-[#B6B09F]/20 shadow-sm space-y-4">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-[#7A756A] block">Hero: Poster do Vídeo (Anexo)</label>
                                            <input type="file" ref={fileInputPosterRef} onChange={(e) => handleFileUpload(e, 'heroVideoPoster')} className="hidden" accept="image/*" />
                                            <button onClick={() => fileInputPosterRef.current?.click()} className="w-full py-4 bg-[#F2F2F2] border-2 border-dashed border-[#B6B09F]/30 rounded-2xl flex items-center justify-center space-x-3 hover:border-black transition-all">
                                                <ImageIconLucide className="w-5 h-5" /> <span className="text-[10px] font-black uppercase tracking-widest">Anexar Poster</span>
                                            </button>
                                            <div className="aspect-video rounded-xl overflow-hidden border border-[#B6B09F]/10 bg-[#F2F2F2]">
                                                <img src={tempLanding.heroVideoPoster} alt="Preview Poster" className="w-full h-full object-cover" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={handleSaveAdmin} className="w-full py-6 bg-black text-white rounded-[30px] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center shadow-xl"><Save className="w-5 h-5 mr-3" /> Salvar Conteúdo da Landing</button>
                            </div>
                        )}
                        {activeTab === 'stats' && <div className="text-center p-20 opacity-20"><BarChart3 className="w-20 h-20 mx-auto mb-4" /><p className="font-black uppercase tracking-widest text-xs">Aguardando dados de tráfego</p></div>}
                        {activeTab === 'users' && (
                            <div className="bg-white rounded-[30px] border border-[#B6B09F]/20 overflow-hidden shadow-sm relative">
                                <table className="w-full text-left">
                                    <thead className="bg-[#F2F2F2] border-b border-[#B6B09F]/10">
                                        <tr>
                                            <th className="px-6 py-5 text-[9px] font-black uppercase tracking-[0.3em] text-[#7A756A]">Usuário</th>
                                            <th className="px-6 py-5 text-[9px] font-black uppercase tracking-[0.3em] text-[#7A756A]">Créditos</th>
                                            <th className="px-6 py-5 text-[9px] font-black uppercase tracking-[0.3em] text-[#7A756A] text-right">Gerenciar Saldo</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#B6B09F]/10">
                                        {filteredUsers.map((u) => (
                                            <tr key={u.id}>
                                                <td className="px-6 py-6"><p className="text-xs font-black uppercase">{u.name}</p><p className="text-[9px] text-[#7A756A]">{u.email}</p></td>
                                                <td className="px-6 py-6 font-black">{u.credits}</td>
                                                <td className="px-6 py-6 text-right">
                                                    <button
                                                        onClick={() => { setSelectedUserForCredits(u); setCreditAmount(''); }}
                                                        className="px-4 py-2 bg-black text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-sm"
                                                    >
                                                        Ajustar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Credit Management Modal Overlay */}
                                {selectedUserForCredits && (
                                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20 animate-in fade-in">
                                        <div className="bg-white border border-[#B6B09F]/20 shadow-2xl rounded-3xl p-8 max-w-md w-full mx-4">
                                            <div className="text-center mb-6">
                                                <div className="w-12 h-12 bg-[#F2F2F2] rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <Coins className="w-6 h-6 text-[#7A756A]" />
                                                </div>
                                                <h3 className="text-lg font-black uppercase tracking-tight">Gerenciar Créditos</h3>
                                                <p className="text-xs text-[#7A756A] font-bold mt-1">{selectedUserForCredits.name}</p>
                                                <p className="text-[10px] text-[#7A756A] uppercase tracking-widest mt-2 bg-[#F2F2F2] py-1 px-3 rounded-full inline-block">
                                                    Saldo Atual: <span className="text-black font-black">{selectedUserForCredits.credits}</span>
                                                </p>
                                            </div>

                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-[9px] font-black uppercase tracking-widest text-[#7A756A] block mb-2">Quantidade para Ajustar</label>
                                                    <input
                                                        type="number"
                                                        value={creditAmount}
                                                        onChange={(e) => setCreditAmount(e.target.value)}
                                                        placeholder="0"
                                                        className="w-full bg-[#F2F2F2] rounded-xl px-4 py-3 text-center font-black text-lg focus:outline-none focus:ring-2 focus:ring-black/5"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-3 pt-2">
                                                    <button
                                                        onClick={() => handleCreditOperation('remove')}
                                                        disabled={!creditAmount || parseInt(creditAmount) <= 0}
                                                        className="py-3 bg-red-100 text-red-700 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-200 transition-colors disabled:opacity-50 flex items-center justify-center"
                                                    >
                                                        <span className="mr-2">-</span> Remover
                                                    </button>
                                                    <button
                                                        onClick={() => handleCreditOperation('add')}
                                                        disabled={!creditAmount || parseInt(creditAmount) <= 0}
                                                        className="py-3 bg-green-100 text-green-700 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-green-200 transition-colors disabled:opacity-50 flex items-center justify-center"
                                                    >
                                                        <span className="mr-2">+</span> Adicionar
                                                    </button>
                                                </div>

                                                <button
                                                    onClick={() => setSelectedUserForCredits(null)}
                                                    className="w-full py-3 text-[#7A756A] font-black text-[10px] uppercase tracking-widest hover:bg-[#F2F2F2] rounded-xl transition-colors mt-2"
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
