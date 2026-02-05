
import React, { useState } from 'react';
import { X, CheckCircle, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { PricingPlan } from '../types';
import { abacatePayService } from '../services/abacatePayService';
import { toast } from 'react-hot-toast';

import { auth } from '../services/firebase';

interface CheckoutModalProps {
    plan: PricingPlan;
    onConfirm: () => void;
    onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ plan, onConfirm, onClose }) => {
    const [loading, setLoading] = useState(false);

    const handleCheckout = async () => {
        setLoading(true);
        try {
            // Parse price string "29,90" -> 2990
            const priceString = plan.price.replace('R$', '').trim().replace('.', '').replace(',', '.');
            const amountInCentavos = Math.round(parseFloat(priceString) * 100);

            await abacatePayService.createCheckoutSession({
                priceId: plan.stripePriceId || 'plan', // Fallback
                amount: amountInCentavos,
                planName: plan.name,
                description: `Assinatura ${plan.name}`,
                customerEmail: auth.currentUser?.email || undefined,
                userId: auth.currentUser?.uid,
                frequency: 'MONTHLY' // Assuming plans are monthly
            });
        } catch (error) {
            console.error(error);
            toast.error("Erro ao iniciar pagamento.");
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !loading && onClose()} />
            <div className="relative bg-[#F2F2F2] w-full max-w-2xl rounded-[35px] overflow-hidden shadow-2xl">
                <div className="p-8 md:p-12">
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">Checkout Pro</h2>
                        <button onClick={onClose} disabled={loading} className="p-2 bg-[#EAE4D5] rounded-full disabled:opacity-50"><X className="w-6 h-6" /></button>
                    </div>

                    {/* Review Step - Only step now */}
                    <div className="space-y-8 animate-in fade-in slide-in-from-left-4">
                        <div className="bg-[#EAE4D5] p-8 rounded-[30px] border border-[#B6B09F]/30">
                            <p className="text-[10px] font-black uppercase text-[#7A756A] mb-2 tracking-widest">Plano Selecionado</p>
                            <div className="flex justify-between items-end">
                                <h3 className="text-3xl font-black uppercase">{plan.name}</h3>
                                <div className="text-right">
                                    <span className="text-3xl font-black">R$ {plan.price}</span>
                                    <span className="text-[#7A756A] text-[10px] font-black uppercase ml-1">{plan.period}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {plan.features.map((feat, i) => (
                                <div key={i} className="flex items-center text-xs font-bold uppercase tracking-widest text-[#7A756A]">
                                    <CheckCircle className="w-4 h-4 mr-3 text-black" /> {feat}
                                </div>
                            ))}
                        </div>

                        <div className="p-4 bg-green-50 border border-green-100 rounded-2xl flex items-start space-x-3">
                            <ShieldCheck className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                            <p className="text-[9px] font-bold uppercase text-green-700 leading-relaxed">
                                Ambiente 100% seguro. Pagamento via AbacatePay.
                            </p>
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={loading}
                            className="w-full py-6 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl flex items-center justify-center group disabled:opacity-70"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>
                                    Ir para Pagamento <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
