
import React from 'react';
import { CheckCircle, X, Zap, Crown, Coins } from 'lucide-react';
import { PricingPlan, CreditPackage } from '../../types';

interface PricingProps {
    plans: PricingPlan[];
    creditPackages: CreditPackage[];
    onSelectPlan: (plan: PricingPlan) => void;
    onBuyCredits: () => void;
}

export const Pricing: React.FC<PricingProps> = ({ plans, creditPackages, onSelectPlan, onBuyCredits }) => {
    return (
        <section id="pricing" className="py-20 md:py-36 px-4 bg-[#EAE4D5]">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16 md:mb-24">
                    <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">Investimento</h2>
                    <p className="text-[#B6B09F] text-[10px] font-black uppercase tracking-widest">
                        Escolha entre assinaturas mensais ou créditos avulsos
                    </p>
                </div>

                {/* SUBSCRIPTIONS SECTION */}
                <div className="mb-20 md:mb-32">
                    <div className="flex items-center justify-center gap-3 mb-10 md:mb-16">
                        <Crown className="w-5 h-5" />
                        <h3 className="text-xl md:text-2xl font-black uppercase tracking-widest">Assinaturas Mensais</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-12">
                        {plans.map((plan, i) => (
                            <div
                                key={i}
                                className={`relative bg-[#F2F2F2] border ${plan.isPopular ? 'border-black shadow-2xl scale-100 md:scale-105 z-10' : 'border-[#B6B09F]/30'} rounded-[35px] md:rounded-[50px] p-10 md:p-12 flex flex-col reveal reveal-fade stagger-${i + 1}`}
                            >
                                {plan.isPopular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black text-white px-8 py-2.5 rounded-full text-[9px] font-black tracking-widest">
                                        MAIS POPULAR
                                    </div>
                                )}
                                <div className="mb-8 md:mb-10">
                                    <h3 className="text-xl font-black mb-4 uppercase tracking-widest">{plan.name}</h3>
                                    <div className="flex items-baseline justify-center">
                                        <span className="text-5xl md:text-6xl font-black">R$ {plan.price}</span>
                                        <span className="text-[#B6B09F] ml-2 text-[10px] font-black uppercase">{plan.period}</span>
                                    </div>
                                </div>
                                <div className="flex-1 space-y-4 md:space-y-5 mb-10 text-left">
                                    {plan.features.map((feat, j) => (
                                        <div key={j} className="flex items-center text-[10px] font-bold uppercase tracking-widest">
                                            <CheckCircle className="w-4 h-4 mr-4 text-green-600 shrink-0" />
                                            {feat}
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => onSelectPlan(plan)}
                                    className={`w-full py-5 md:py-6 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${plan.isPopular ? 'bg-black text-white hover:bg-zinc-800' : 'bg-[#EAE4D5] text-black border border-[#B6B09F]/30 hover:border-black'
                                        }`}
                                >
                                    {plan.buttonText}
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Benefits comparison table */}
                    <div className="bg-[#F2F2F2] rounded-[30px] p-8 md:p-12 border border-[#B6B09F]/20">
                        <h4 className="text-center text-sm font-black uppercase tracking-widest mb-8">Benefícios Exclusivos de Assinantes</h4>
                        <div className="grid grid-cols-4 gap-4 text-center text-[9px] font-black uppercase">
                            <div></div>
                            <div className="text-[#B6B09F]">Essencial</div>
                            <div>Estúdio</div>
                            <div className="text-black">Elite</div>

                            <div className="text-left text-[#B6B09F]">Resolução Máxima</div>
                            <div>1K</div>
                            <div className="text-green-600">2K HD</div>
                            <div className="text-green-600">4K Ultra</div>

                            <div className="text-left text-[#B6B09F]">Sem Marca d'água</div>
                            <div><X className="w-3 h-3 mx-auto text-red-400" /></div>
                            <div><CheckCircle className="w-3 h-3 mx-auto text-green-600" /></div>
                            <div><CheckCircle className="w-3 h-3 mx-auto text-green-600" /></div>

                            <div className="text-left text-[#B6B09F]">Fila Prioritária</div>
                            <div><X className="w-3 h-3 mx-auto text-red-400" /></div>
                            <div><CheckCircle className="w-3 h-3 mx-auto text-green-600" /></div>
                            <div><Zap className="w-3 h-3 mx-auto text-yellow-500" /></div>

                            <div className="text-left text-[#B6B09F]">Créditos Acumulativos</div>
                            <div><X className="w-3 h-3 mx-auto text-red-400" /></div>
                            <div><CheckCircle className="w-3 h-3 mx-auto text-green-600" /></div>
                            <div><CheckCircle className="w-3 h-3 mx-auto text-green-600" /></div>

                            <div className="text-left text-[#B6B09F]">Suporte VIP</div>
                            <div><X className="w-3 h-3 mx-auto text-red-400" /></div>
                            <div><X className="w-3 h-3 mx-auto text-red-400" /></div>
                            <div><CheckCircle className="w-3 h-3 mx-auto text-green-600" /></div>
                        </div>
                    </div>
                </div>

                {/* DIVIDER */}
                <div className="flex items-center justify-center gap-4 mb-20 md:mb-32">
                    <div className="flex-1 h-px bg-[#B6B09F]/30" />
                    <span className="text-[#B6B09F] text-[10px] font-black uppercase tracking-widest">ou</span>
                    <div className="flex-1 h-px bg-[#B6B09F]/30" />
                </div>

                {/* CREDITS SECTION */}
                <div>
                    <div className="flex items-center justify-center gap-3 mb-6 md:mb-10">
                        <Coins className="w-5 h-5" />
                        <h3 className="text-xl md:text-2xl font-black uppercase tracking-widest">Créditos Avulsos</h3>
                    </div>
                    <p className="text-center text-[#B6B09F] text-[10px] font-black uppercase tracking-widest mb-10 md:mb-16">
                        Para uso ocasional • Sem compromisso mensal • Pague só quando usar
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
                        {creditPackages.map((pkg, i) => (
                            <div
                                key={pkg.id}
                                className={`bg-[#F2F2F2] border border-[#B6B09F]/30 rounded-[30px] p-8 text-center hover:border-black transition-all reveal reveal-fade stagger-${i + 1}`}
                            >
                                <h4 className="text-2xl font-black mb-1">{pkg.amount} Créditos</h4>
                                <p className="text-[#B6B09F] text-[9px] font-black uppercase tracking-widest mb-6">{pkg.description}</p>
                                <div className="text-3xl font-black mb-6">R$ {pkg.price}</div>
                                <p className="text-[#B6B09F] text-[8px] font-bold uppercase mb-6">
                                    R$ {(parseFloat(pkg.price.replace(',', '.')) / pkg.amount).toFixed(2).replace('.', ',')}/render
                                </p>
                                <button
                                    onClick={onBuyCredits}
                                    className="w-full py-4 bg-[#EAE4D5] text-black rounded-xl font-black text-[10px] uppercase tracking-widest border border-[#B6B09F]/30 hover:border-black transition-all"
                                >
                                    Comprar
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Credits info */}
                    <div className="mt-12 text-center">
                        <p className="text-[#B6B09F] text-[9px] font-bold uppercase tracking-widest">
                            Créditos avulsos • Resolução até 2K • Sem expiração
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};
