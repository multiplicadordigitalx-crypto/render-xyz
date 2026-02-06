
import React from 'react';
import { CheckCircle, Zap, Coins, Sparkles, Clock, Shield, Gift, TrendingUp, Image } from 'lucide-react';
import { CreditPackage } from '../../types';

interface PricingProps {
    creditPackages: CreditPackage[];
    onBuyCredits: (pkg: CreditPackage) => void;
}

export const Pricing: React.FC<PricingProps> = ({ creditPackages, onBuyCredits }) => {
    // Calculate price per credit for each package
    const getPricePerCredit = (price: string, amount: number) => {
        const numericPrice = parseFloat(price.replace(',', '.'));
        return (numericPrice / amount).toFixed(2).replace('.', ',');
    };

    // Determine if package is the best value
    const getBestValue = (index: number) => index === 2; // Third package is best value

    return (
        <section id="pricing" className="py-20 md:py-36 px-4 bg-gradient-to-b from-[#EAE4D5] to-[#F2F2F2]">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16 md:mb-20">
                    <div className="inline-flex items-center gap-3 bg-black text-white px-6 py-3 rounded-full mb-8">
                        <Coins className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Simples & Flexível</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6">
                        Compre Créditos
                    </h2>
                    <p className="text-[#7A756A] text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                        Sem assinatura, sem compromisso. Compre créditos quando precisar e use no seu ritmo.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 mt-6">
                        <div className="bg-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-[#B6B09F]/30">
                            1K = 1 crédito
                        </div>
                        <div className="bg-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-[#B6B09F]/30">
                            2K = 2 créditos
                        </div>
                        <div className="bg-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-[#B6B09F]/30">
                            4K = 3 créditos
                        </div>
                    </div>
                </div>

                {/* Free Credits Banner */}
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-[25px] p-6 md:p-8 mb-12 text-white text-center reveal reveal-fade">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                        <Gift className="w-8 h-8" />
                        <div>
                            <h3 className="text-lg md:text-xl font-black uppercase tracking-tight">
                                Comece Grátis com 3 Créditos!
                            </h3>
                            <p className="text-white/80 text-[10px] md:text-xs font-bold uppercase tracking-widest">
                                Crie sua conta e teste o poder do Render XYZ sem pagar nada
                            </p>
                        </div>
                    </div>
                </div>

                {/* Credit Packages */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16">
                    {creditPackages.map((pkg, i) => {
                        const isBestValue = getBestValue(i);
                        const isPopular = i === 1;

                        return (
                            <div
                                key={pkg.id}
                                className={`relative bg-white border-2 ${isBestValue
                                    ? 'border-emerald-500 shadow-2xl shadow-emerald-500/20 scale-100 md:scale-105 z-10'
                                    : isPopular
                                        ? 'border-black shadow-xl'
                                        : 'border-[#B6B09F]/30'
                                    } rounded-[35px] p-8 md:p-10 flex flex-col reveal reveal-fade stagger-${i + 1} transition-all hover:shadow-xl`}
                            >
                                {/* Badge */}
                                {isBestValue && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-2 rounded-full text-[9px] font-black tracking-widest flex items-center gap-2 shadow-lg">
                                        <TrendingUp className="w-3 h-3" />
                                        CUSTO-BENEFÍCIO
                                    </div>
                                )}
                                {isPopular && !isBestValue && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-2 rounded-full text-[9px] font-black tracking-widest flex items-center gap-2">
                                        <Sparkles className="w-3 h-3" />
                                        MAIS POPULAR
                                    </div>
                                )}

                                {/* Credits Amount */}
                                <div className="text-center mb-6">
                                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#EAE4D5] to-[#F2F2F2] rounded-full mb-4">
                                        <span className="text-3xl font-black">{pkg.amount}</span>
                                    </div>
                                    <p className="text-[#7A756A] text-[10px] font-black uppercase tracking-widest">
                                        Créditos
                                    </p>
                                </div>

                                {/* Price */}
                                <div className="text-center mb-6">
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className="text-[#7A756A] text-lg">R$</span>
                                        <span className="text-5xl font-black">{pkg.price}</span>
                                    </div>
                                    <p className="text-[#7A756A] text-[10px] font-bold mt-2">
                                        R$ {getPricePerCredit(pkg.price, pkg.amount)} por crédito
                                    </p>
                                </div>

                                {/* Description */}
                                <div className="flex-1 mb-8">
                                    <p className="text-center text-sm font-bold text-[#7A756A] mb-6">
                                        {pkg.description}
                                    </p>

                                    {/* Features based on package tier */}
                                    <div className="space-y-3">
                                        {/* All packages */}
                                        <div className="flex items-center text-[11px] font-bold">
                                            <CheckCircle className="w-4 h-4 mr-3 text-emerald-500 shrink-0" />
                                            <span>Resolução até 4K Ultra HD</span>
                                        </div>
                                        <div className="flex items-center text-[11px] font-bold">
                                            <CheckCircle className="w-4 h-4 mr-3 text-emerald-500 shrink-0" />
                                            <span>Sem marca d'água</span>
                                        </div>
                                        <div className="flex items-center text-[11px] font-bold">
                                            <CheckCircle className="w-4 h-4 mr-3 text-emerald-500 shrink-0" />
                                            <span>Créditos nunca expiram</span>
                                        </div>

                                        {/* Professional and Office */}
                                        {i >= 1 && (
                                            <div className="flex items-center text-[11px] font-bold">
                                                <CheckCircle className="w-4 h-4 mr-3 text-emerald-500 shrink-0" />
                                                <span>Suporte prioritário</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* CTA Button */}
                                <button
                                    onClick={() => onBuyCredits(pkg)}
                                    className={`w-full py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${isBestValue
                                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-[1.02]'
                                        : isPopular
                                            ? 'bg-black text-white hover:bg-zinc-800'
                                            : 'bg-[#EAE4D5] text-black border border-[#B6B09F]/30 hover:border-black hover:bg-black hover:text-white'
                                        }`}
                                >
                                    Comprar Agora
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Trust Badges */}
                <div className="bg-white rounded-[25px] p-8 md:p-10 border border-[#B6B09F]/20">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-[#EAE4D5] rounded-xl flex items-center justify-center mx-auto mb-3">
                                <Clock className="w-6 h-6" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest">Nunca Expiram</p>
                            <p className="text-[9px] text-[#7A756A] mt-1">Use quando quiser</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-[#EAE4D5] rounded-xl flex items-center justify-center mx-auto mb-3">
                                <Image className="w-6 h-6" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest">Alta Qualidade</p>
                            <p className="text-[9px] text-[#7A756A] mt-1">Até 4K Ultra HD</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-[#EAE4D5] rounded-xl flex items-center justify-center mx-auto mb-3">
                                <Zap className="w-6 h-6" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest">Resultado Rápido</p>
                            <p className="text-[9px] text-[#7A756A] mt-1">Renders em segundos</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-[#EAE4D5] rounded-xl flex items-center justify-center mx-auto mb-3">
                                <Shield className="w-6 h-6" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest">Pagamento Seguro</p>
                            <p className="text-[9px] text-[#7A756A] mt-1">PIX ou Cartão</p>
                        </div>
                    </div>
                </div>

                {/* Money Back Guarantee */}
                <div className="text-center mt-10">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#7A756A]">
                        🔒 Satisfação garantida ou seu dinheiro de volta em até 7 dias
                    </p>
                </div>
            </div>
        </section>
    );
};
