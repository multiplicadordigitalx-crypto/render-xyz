import React, { useState } from 'react';
import { X, Loader2, Zap, Sparkles, TrendingUp, CreditCard, ArrowLeft } from 'lucide-react';
import { CreditPackage } from '../types';
import { useNavigate } from 'react-router-dom';

interface PricingPageProps {
    creditPackages: CreditPackage[];
}

export const PricingPage: React.FC<PricingPageProps> = ({ creditPackages }) => {
    const navigate = useNavigate();
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleBuy = (pkg: CreditPackage) => {
        setLoadingId(pkg.id);
        navigate(`/checkout?pkg=${pkg.id}`);
    };

    const getPackageStyle = (index: number) => {
        if (index === 2) return { badge: 'MELHOR VALOR', icon: TrendingUp, gradient: 'from-emerald-500 to-teal-600', highlight: true };
        if (index === 1) return { badge: 'MAIS POPULAR', icon: Sparkles, gradient: 'from-black to-zinc-800', highlight: false };
        return { badge: null, icon: Zap, gradient: '', highlight: false };
    };

    return (
        <div className="min-h-screen bg-[#F2F2F2] p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <button onClick={() => navigate(-1)} className="mb-6 flex items-center text-sm font-bold text-gray-500 hover:text-black transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                </button>

                <div className="bg-white w-full rounded-[35px] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-black to-zinc-800 p-8 md:p-12 text-center">
                        <h2 className="text-2xl md:text-4xl font-black uppercase tracking-widest text-white mb-2">Comprar Créditos</h2>
                        <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Escolha o pacote ideal para você</p>
                    </div>

                    {/* Packages Grid */}
                    <div className="p-8 md:p-12">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                            {creditPackages.map((pkg, index) => {
                                const style = getPackageStyle(index);
                                const IconComponent = style.icon;

                                return (
                                    <div
                                        key={pkg.id}
                                        className={`relative bg-gradient-to-br from-[#F8F6F1] to-[#EAE4D5] border-2 ${style.highlight
                                            ? 'border-emerald-500 shadow-xl shadow-emerald-500/20 scale-105 z-10'
                                            : index === 1
                                                ? 'border-black'
                                                : 'border-[#B6B09F]/30'
                                            } p-6 rounded-[25px] flex flex-col items-center text-center transition-all hover:shadow-lg`}
                                    >
                                        {/* Badge */}
                                        {style.badge && (
                                            <div className={`absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r ${style.gradient} text-white px-4 py-1.5 rounded-full text-[8px] font-black tracking-widest flex items-center gap-1.5 shadow-lg whitespace-nowrap`}>
                                                <IconComponent className="w-3 h-3" />
                                                {style.badge}
                                            </div>
                                        )}

                                        {/* Credits Circle */}
                                        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 mt-4 ${style.highlight
                                            ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
                                            : index === 1
                                                ? 'bg-black text-white'
                                                : 'bg-[#B6B09F]/30 text-black'
                                            }`}>
                                            <div className="text-center leading-tight">
                                                <span className="text-3xl font-black block">{pkg.amount}</span>
                                                <span className="text-[9px] font-bold uppercase opacity-80 -mt-1 block">créditos</span>
                                            </div>
                                        </div>

                                        {/* Package Name */}
                                        <p className="text-[#7A756A] text-[10px] font-black uppercase tracking-widest mb-6">{pkg.description}</p>

                                        {/* Price */}
                                        <div className="mb-8">
                                            <span className="text-[#7A756A] text-sm">R$</span>
                                            <span className="text-4xl font-black ml-1">{pkg.price}</span>
                                        </div>

                                        {/* Button */}
                                        <button
                                            onClick={() => handleBuy(pkg)}
                                            disabled={!!loadingId}
                                            className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-70 ${style.highlight
                                                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-lg hover:shadow-emerald-500/30'
                                                : 'bg-black text-white hover:bg-zinc-800'
                                                }`}
                                        >
                                            {loadingId === pkg.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <CreditCard className="w-4 h-4" />
                                                    Comprar Agora
                                                </>
                                            )}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Trust Badge */}
                        <p className="text-center text-[10px] font-bold uppercase tracking-widest text-[#7A756A] mt-10">
                            🔒 Pagamento 100% seguro via cartão • Créditos nunca expiram
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
