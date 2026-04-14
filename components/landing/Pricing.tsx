import React from 'react';
import { Check, Info, Sparkles } from 'lucide-react';
import { CreditPackage } from '../../types';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { CardSpotlight } from '@/components/ui/card-spotlight';

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

    return (
        <section id="pricing" className="py-24 bg-neutral-50 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-neutral-300 to-transparent opacity-50" />

            <div className="container mx-auto px-4 max-w-7xl relative z-10">
                {/* Header */}
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <div className="inline-flex items-center justify-center px-4 py-1.5 mb-6 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200 shadow-sm">
                        <span className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                            Preços Flexíveis <Sparkles className="w-3 h-3" />
                        </span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-6 text-neutral-900 font-sans">
                        Pague apenas pelo <br /> que <span className="text-neutral-400">você usa</span>
                    </h2>
                    <p className="text-lg text-neutral-600 leading-relaxed font-sans">
                        Sem assinaturas mensais ou contratos. Compre créditos e use quando quiser.
                        <b> Seus créditos nunca expiram.</b>
                    </p>
                </div>

                {/* Credit Packages */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {creditPackages.map((pkg, i) => {
                        const isPopular = i === 2; // Assuming the third one is popular/best value

                        return (
                            <motion.div
                                key={pkg.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                className="h-full"
                            >
                                <CardSpotlight
                                    className={`h-full flex flex-col p-8 md:p-10 ${isPopular
                                        ? 'bg-neutral-900 border-neutral-800 text-white hover:border-neutral-700'
                                        : 'bg-white text-neutral-900'
                                        }`}
                                    color={isPopular ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)"}
                                >
                                    {/* Popular Badge */}
                                    {isPopular && (
                                        <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-bl-xl">
                                            Mais Popular
                                        </div>
                                    )}

                                    {/* Header */}
                                    <div className="mb-8">
                                        <h3 className={`text-sm font-bold uppercase tracking-widest mb-2 ${isPopular ? 'text-neutral-400' : 'text-neutral-500'}`}>
                                            {pkg.name || "Pacote"}
                                        </h3>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-black tracking-tight">R$ {pkg.price}</span>
                                            <span className={`text-sm font-medium ${isPopular ? 'text-neutral-400' : 'text-neutral-500'}`}>/ único</span>
                                        </div>
                                        <p className={`text-sm font-medium mt-2 ${isPopular ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                            R$ {getPricePerCredit(pkg.price, pkg.amount)} por crédito
                                        </p>
                                    </div>

                                    {/* Credits Amount */}
                                    <div className={`mb-8 p-4 rounded-2xl border ${isPopular
                                        ? 'bg-neutral-800 border-neutral-700'
                                        : 'bg-neutral-50 border-neutral-100'
                                        }`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`text-sm font-bold ${isPopular ? 'text-neutral-300' : 'text-neutral-600'}`}>Você recebe</span>
                                            <span className={`text-2xl font-black ${isPopular ? 'text-white' : 'text-neutral-900'}`}>{pkg.amount} créditos</span>
                                        </div>
                                        <div className={`h-2 rounded-full overflow-hidden ${isPopular ? 'bg-neutral-700' : 'bg-neutral-200'}`}>
                                            <div style={{ width: '100%' }} className="h-full bg-gradient-to-r from-emerald-500 to-teal-400" />
                                        </div>
                                    </div>

                                    {/* Features */}
                                    <div className="flex-1 mb-8">
                                        <ul className="space-y-4">
                                            {[
                                                'Resolução até 4K',
                                                'Uso comercial liberado',
                                                'Suporte prioritário',
                                                'Atualizações gratuitas',
                                            ].map((feature, idx) => (
                                                <li key={idx} className="flex items-start gap-3 text-sm">
                                                    <div className={`mt-0.5 rounded-full p-0.5 ${isPopular ? 'bg-emerald-500/20 text-emerald-400' : 'bg-neutral-100 text-neutral-600'}`}>
                                                        <Check className="w-3 h-3" />
                                                    </div>
                                                    <span className={isPopular ? 'text-neutral-300' : 'text-neutral-600'}>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Action */}
                                    <Button
                                        onClick={() => onBuyCredits(pkg)}
                                        className={`w-full h-12 rounded-xl font-bold uppercase tracking-wide text-xs transition-all duration-300 ${isPopular
                                            ? 'bg-white text-neutral-900 hover:bg-neutral-100'
                                            : 'bg-neutral-900 text-white hover:bg-neutral-800 shadow-xl shadow-neutral-900/10'
                                            }`}
                                    >
                                        Comprar Créditos
                                    </Button>

                                    {/* Footer Info */}
                                    <div className="mt-6 pt-6 border-t border-neutral-200/10 text-center">
                                        <p className={`text-[10px] font-medium ${isPopular ? 'text-neutral-500' : 'text-neutral-400'}`}>
                                            Pagamento único via PIX ou Cartão
                                        </p>
                                    </div>
                                </CardSpotlight>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
