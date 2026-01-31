
import React, { useState } from 'react';
import { X, CheckCircle, ArrowRight, ShieldCheck, CreditCard, Loader2 } from 'lucide-react';
import { PricingPlan } from '../types';
import { stripeService } from '../services/stripeService';
import { toast } from 'react-hot-toast';
import { auth } from '../services/firebase';

interface CheckoutModalProps {
    plan: PricingPlan;
    onConfirm: () => void;
    onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ plan, onConfirm, onClose }) => {
    const [step, setStep] = useState<'review' | 'payment'>('review');
    const [loading, setLoading] = useState(false);

    const handleStripeCheckout = async () => {
        if (!plan.stripePriceId) {
            toast.error("Plano indisponível para compra online.");
            return;
        }

        setLoading(true);
        try {
            await stripeService.redirectToCheckout({
                priceId: plan.stripePriceId,
                mode: 'subscription',
                successUrl: `${window.location.origin}/?success=true`,
                cancelUrl: `${window.location.origin}/?canceled=true`,
                customerEmail: auth.currentUser?.email || undefined,
                userId: auth.currentUser?.uid
            });
        } catch (error) {
            console.error(error);
            toast.error("Erro ao iniciar pagamento.");
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-[#F2F2F2] w-full max-w-2xl rounded-[35px] overflow-hidden shadow-2xl">
                <div className="p-8 md:p-12">
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">Checkout Pro</h2>
                        <button onClick={onClose} className="p-2 bg-[#EAE4D5] rounded-full"><X className="w-6 h-6" /></button>
                    </div>

                    {step === 'review' ? (
                        <div className="space-y-8">
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

                            <button
                                onClick={() => setStep('payment')}
                                className="w-full py-6 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl flex items-center justify-center"
                            >
                                Prosseguir para Pagamento <ArrowRight className="ml-3 w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                            <div className="space-y-6">
                                <div className="bg-white p-6 rounded-2xl border border-[#B6B09F]/20 flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-[#F2F2F2] rounded-xl flex items-center justify-center"><CreditCard className="w-6 h-6" /></div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black uppercase text-[#7A756A]">Forma de Pagamento</p>
                                        <p className="text-xs font-black uppercase">Cartão de Crédito ou Pix</p>
                                    </div>
                                    <ArrowRight className="w-4 h-4 opacity-20" />
                                </div>
                            </div>

                            <div className="p-6 bg-yellow-50 border border-yellow-100 rounded-2xl flex items-start space-x-3">
                                <ShieldCheck className="w-5 h-5 text-yellow-600 shrink-0" />
                                <p className="text-[9px] font-bold uppercase text-yellow-700 leading-relaxed">
                                    Esta é uma demonstração de checkout. Ao clicar em confirmar, o plano será simulado em sua conta de teste.
                                </p>
                            </div>

                            <button
                                onClick={handleStripeCheckout}
                                disabled={loading}
                                className="w-full py-6 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl flex items-center justify-center disabled:opacity-70"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirmar Assinatura"}
                            </button>

                            <button
                                onClick={() => setStep('review')}
                                className="w-full text-[9px] font-black uppercase tracking-widest text-[#7A756A]"
                            >
                                Voltar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
