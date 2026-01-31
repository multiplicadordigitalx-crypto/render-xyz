
import React from 'react';
import { CheckCircle, X, Zap, Crown, Coins, Sparkles, Clock, Shield } from 'lucide-react';
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
                    <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">Escolha seu Caminho</h2>
                    <p className="text-[#B6B09F] text-[10px] font-black uppercase tracking-widest max-w-xl mx-auto leading-relaxed">
                        Para quem usa todo mês ou só de vez em quando — temos a opção certa para você
                    </p>
                </div>

                {/* SUBSCRIPTIONS SECTION */}
                <div className="mb-20 md:mb-32">
                    <div className="text-center mb-10 md:mb-16">
                        <div className="inline-flex items-center gap-3 bg-black text-white px-6 py-3 rounded-full mb-6">
                            <Crown className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Recomendado para Escritórios</span>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-3">Assinatura Mensal</h3>
                        <p className="text-[#B6B09F] text-[10px] font-bold uppercase tracking-widest">
                            Créditos todo mês • Benefícios exclusivos • Cancele quando quiser
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-12">
                        {plans.map((plan, i) => (
                            <div
                                key={i}
                                className={`relative bg-[#F2F2F2] border ${plan.isPopular ? 'border-black shadow-2xl scale-100 md:scale-105 z-10' : 'border-[#B6B09F]/30'} rounded-[35px] md:rounded-[50px] p-10 md:p-12 flex flex-col reveal reveal-fade stagger-${i + 1}`}
                            >
                                {plan.isPopular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black text-white px-8 py-2.5 rounded-full text-[9px] font-black tracking-widest flex items-center gap-2">
                                        <Sparkles className="w-3 h-3" />
                                        MAIS ESCOLHIDO
                                    </div>
                                )}
                                <div className="mb-8 md:mb-10 text-center">
                                    <h3 className="text-xl font-black mb-4 uppercase tracking-widest">{plan.name}</h3>
                                    <div className="flex items-baseline justify-center">
                                        {plan.price === "0" ? (
                                            <span className="text-4xl md:text-5xl font-black">Grátis</span>
                                        ) : (
                                            <>
                                                <span className="text-4xl md:text-5xl font-black">R$ {plan.price}</span>
                                                <span className="text-[#B6B09F] ml-2 text-[10px] font-black uppercase">{plan.period}</span>
                                            </>
                                        )}
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
                        <h4 className="text-center text-sm font-black uppercase tracking-widest mb-8">Compare os Benefícios</h4>
                        <div className="grid grid-cols-4 gap-4 text-center text-[9px] font-black uppercase">
                            <div></div>
                            <div className="text-[#B6B09F]">Grátis</div>
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

                            <div className="text-left text-[#B6B09F]">Créditos Acumulam</div>
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
                <div className="flex items-center justify-center gap-6 mb-20 md:mb-32">
                    <div className="flex-1 h-px bg-[#B6B09F]/30" />
                    <div className="bg-[#F2F2F2] px-6 py-3 rounded-full border border-[#B6B09F]/20">
                        <span className="text-[#B6B09F] text-[10px] font-black uppercase tracking-widest">Prefere Flexibilidade?</span>
                    </div>
                    <div className="flex-1 h-px bg-[#B6B09F]/30" />
                </div>

                {/* CREDITS SECTION */}
                <div>
                    <div className="text-center mb-10 md:mb-16">
                        <div className="inline-flex items-center gap-3 bg-[#F2F2F2] text-black px-6 py-3 rounded-full border border-[#B6B09F]/30 mb-6">
                            <Coins className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Ideal para Freelancers</span>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-3">Créditos Avulsos</h3>
                        <p className="text-[#B6B09F] text-[10px] font-bold uppercase tracking-widest">
                            Sem assinatura • Compre quando precisar • Nunca expiram
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto mb-12">
                        {creditPackages.map((pkg, i) => (
                            <div
                                key={pkg.id}
                                className={`bg-[#F2F2F2] border border-[#B6B09F]/30 rounded-[30px] p-8 text-center hover:border-black transition-all reveal reveal-fade stagger-${i + 1}`}
                            >
                                <h4 className="text-3xl font-black mb-2">{pkg.amount}</h4>
                                <p className="text-[#B6B09F] text-[9px] font-black uppercase tracking-widest mb-6">Créditos</p>
                                <div className="text-2xl font-black mb-2">R$ {pkg.price}</div>
                                <p className="text-[#B6B09F] text-[9px] font-bold uppercase tracking-widest mb-8">{pkg.description}</p>
                                <button
                                    onClick={onBuyCredits}
                                    className="w-full py-4 bg-[#EAE4D5] text-black rounded-xl font-black text-[10px] uppercase tracking-widest border border-[#B6B09F]/30 hover:border-black hover:bg-black hover:text-white transition-all"
                                >
                                    Adquirir
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Credits benefits */}
                    <div className="flex flex-wrap justify-center gap-4 md:gap-8">
                        <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-[#B6B09F]">
                            <Clock className="w-3 h-3" />
                            <span>Sem data de validade</span>
                        </div>
                        <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-[#B6B09F]">
                            <Shield className="w-3 h-3" />
                            <span>Resolução até 2K</span>
                        </div>
                        <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-[#B6B09F]">
                            <Coins className="w-3 h-3" />
                            <span>1 Crédito = 1 Render</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
