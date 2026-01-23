
import React from 'react';
import { CheckCircle } from 'lucide-react';
import { PricingPlan } from '../../types';

interface PricingProps {
    plans: PricingPlan[];
    onSelectPlan: (plan: PricingPlan) => void;
}

export const Pricing: React.FC<PricingProps> = ({ plans, onSelectPlan }) => {
    return (
        <section id="pricing" className="py-20 md:py-36 px-4 bg-[#EAE4D5]">
            <div className="max-w-7xl mx-auto text-center">
                <h2 className="text-4xl md:text-5xl font-black mb-16 md:mb-24 uppercase tracking-tighter">Investimento</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                    {plans.map((plan, i) => (
                        <div
                            key={i}
                            className={`relative bg-[#F2F2F2] border ${plan.isPopular ? 'border-black shadow-2xl scale-100 md:scale-105 z-10' : 'border-[#B6B09F]/30'} rounded-[35px] md:rounded-[50px] p-10 md:p-12 flex flex-col reveal reveal-fade stagger-${i + 1}`}
                        >
                            {plan.isPopular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black text-white px-8 py-2.5 rounded-full text-[9px] font-black tracking-widest">
                                    ESTUDIO PRO
                                </div>
                            )}
                            <div className="mb-10 md:mb-12">
                                <h3 className="text-xl font-black mb-4 uppercase tracking-widest">{plan.name}</h3>
                                <div className="flex items-baseline justify-center">
                                    <span className="text-5xl md:text-6xl font-black">R$ {plan.price}</span>
                                    <span className="text-[#B6B09F] ml-2 text-[10px] font-black uppercase">{plan.period}</span>
                                </div>
                            </div>
                            <div className="flex-1 space-y-4 md:space-y-6 mb-12 text-left">
                                {plan.features.map((feat, j) => (
                                    <div key={j} className="flex items-center text-[10px] font-bold uppercase tracking-widest">
                                        <CheckCircle className="w-4 h-4 mr-4 text-[#B6B09F] shrink-0" />
                                        {feat}
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => onSelectPlan(plan)}
                                className={`w-full py-5 md:py-6 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${plan.isPopular ? 'bg-black text-white' : 'bg-[#EAE4D5] text-black border border-[#B6B09F]/30'
                                    }`}
                            >
                                {plan.buttonText}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
