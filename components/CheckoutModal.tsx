
import React, { useState } from 'react';
import { X, CheckCircle, ArrowRight, ShieldCheck, CreditCard, Loader2, QrCode } from 'lucide-react';
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
    const [step, setStep] = useState<'review' | 'selection'>('review');
    const [loadingMethod, setLoadingMethod] = useState<'card' | 'pix' | null>(null);

    const handleStripeCheckout = async (method: 'card' | 'pix') => {
        if (!plan.stripePriceId) {
            toast.error("Plano indisponível para compra online.");
            return;
        }

        setLoadingMethod(method);
        try {
            // Direct checkout - supports both guest and logged-in users
            await stripeService.redirectToCheckout({
                priceId: plan.stripePriceId,
                mode: 'subscription',
                successUrl: `${window.location.origin}/?payment=success`,
                cancelUrl: `${window.location.origin}/?payment=canceled`,
                planName: plan.name, // Pass plan name for metadata
                customerEmail: auth.currentUser?.email || undefined,
                userId: auth.currentUser?.uid,
                paymentMethod: method
            });
        } catch (error) {
            console.error(error);
            toast.error("Erro ao iniciar pagamento.");
            setLoadingMethod(null);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !loadingMethod && onClose()} />
            <div className="relative bg-[#F2F2F2] w-full max-w-2xl rounded-[35px] overflow-hidden shadow-2xl">
                <div className="p-8 md:p-12">
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">Checkout Pro</h2>
                        <button onClick={onClose} disabled={!!loadingMethod} className="p-2 bg-[#EAE4D5] rounded-full disabled:opacity-50"><X className="w-6 h-6" /></button>
                    </div>

                    {step === 'review' ? (
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

                            <button
                                onClick={() => setStep('selection')}
                                className="w-full py-6 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl flex items-center justify-center group"
                            >
                                Selecionar Pagamento <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                            <div className="text-center mb-6">
                                <h3 className="text-xl font-black uppercase tracking-tight mb-2">Como deseja pagar?</h3>
                                <p className="text-[#7A756A] text-[10px] font-bold uppercase tracking-widest">Selecione uma opção segura abaixo</p>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {/* PIX OPTION */}
                                <button
                                    onClick={() => handleStripeCheckout('pix')}
                                    disabled={!!loadingMethod}
                                    className={`relative p-6 rounded-[25px] border-2 text-left transition-all group ${loadingMethod === 'pix' ? 'bg-black text-white border-black' : 'bg-white border-[#B6B09F]/20 hover:border-black hover:shadow-lg'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${loadingMethod === 'pix' ? 'bg-white/20' : 'bg-[#F2F2F2]'}`}>
                                                <QrCode className={`w-5 h-5 ${loadingMethod === 'pix' ? 'text-white' : 'text-black'}`} />
                                            </div>
                                            <span className="font-black uppercase tracking-tight text-sm">Pix Instantâneo</span>
                                        </div>
                                        {loadingMethod === 'pix' && <Loader2 className="w-5 h-5 animate-spin" />}
                                    </div>
                                    <p className={`text-[10px] font-bold uppercase tracking-widest pl-[52px] ${loadingMethod === 'pix' ? 'text-white/60' : 'text-[#7A756A]'}`}>
                                        Aprovação imediata via QR Code
                                    </p>
                                </button>

                                {/* CARD OPTION */}
                                <button
                                    onClick={() => handleStripeCheckout('card')}
                                    disabled={!!loadingMethod}
                                    className={`relative p-6 rounded-[25px] border-2 text-left transition-all group ${loadingMethod === 'card' ? 'bg-black text-white border-black' : 'bg-white border-[#B6B09F]/20 hover:border-black hover:shadow-lg'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${loadingMethod === 'card' ? 'bg-white/20' : 'bg-[#F2F2F2]'}`}>
                                                <CreditCard className={`w-5 h-5 ${loadingMethod === 'card' ? 'text-white' : 'text-black'}`} />
                                            </div>
                                            <span className="font-black uppercase tracking-tight text-sm">Cartão de Crédito</span>
                                        </div>
                                        {loadingMethod === 'card' && <Loader2 className="w-5 h-5 animate-spin" />}
                                    </div>
                                    <p className={`text-[10px] font-bold uppercase tracking-widest pl-[52px] ${loadingMethod === 'card' ? 'text-white/60' : 'text-[#7A756A]'}`}>
                                        Crédito ou Débito
                                    </p>
                                </button>
                            </div>

                            <div className="p-4 bg-green-50 border border-green-100 rounded-2xl flex items-start space-x-3">
                                <ShieldCheck className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                                <p className="text-[9px] font-bold uppercase text-green-700 leading-relaxed">
                                    Ambiente 100% seguro. Seus dados são processados diretamente pelo Stripe.
                                </p>
                            </div>

                            <button
                                onClick={() => setStep('review')}
                                disabled={!!loadingMethod}
                                className="w-full text-[9px] font-black uppercase tracking-widest text-[#7A756A] disabled:opacity-50"
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
