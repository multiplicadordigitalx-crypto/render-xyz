
import React, { useEffect, useState } from 'react';
import { X, Loader2, Zap, Sparkles, TrendingUp } from 'lucide-react';
import { CreditPackage } from '../types';
import { PaymentMethodModal } from './PaymentMethodModal';
import { stripeService } from '../services/stripeService';
import { abacatePayService } from '../services/abacatePayService';
import { toast } from 'react-hot-toast';
import { auth } from '../services/firebase';

interface CreditModalProps {
    creditPackages: CreditPackage[];
    onBuyCredits: (amount: number) => void;
    onClose: () => void;
}

export const CreditModal: React.FC<CreditModalProps> = ({ creditPackages, onBuyCredits, onClose }) => {
    const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);

    // Lock body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    const handleSelectPackage = (pkg: CreditPackage) => {
        setSelectedPackage(pkg);
        setShowPaymentModal(true);
    };

    const handlePayWithCard = async () => {
        if (!selectedPackage) return;

        const priceString = selectedPackage.price.replace(',', '.');
        const amountInCentavos = Math.round(parseFloat(priceString) * 100);

        setPaymentLoading(true);
        try {
            await stripeService.createCheckoutSession({
                amount: amountInCentavos,
                credits: selectedPackage.amount,
                customerEmail: auth.currentUser?.email || undefined,
                userId: auth.currentUser?.uid
            });
        } catch (error: any) {
            console.error('Stripe payment error:', error);
            toast.error(error.message || 'Erro ao iniciar pagamento com cartão');
            setPaymentLoading(false);
        }
    };

    const handlePayWithPix = async () => {
        if (!selectedPackage) return;

        const priceString = selectedPackage.price.replace(',', '.');
        const amountInCentavos = Math.round(parseFloat(priceString) * 100);

        setPaymentLoading(true);
        try {
            await abacatePayService.createCheckoutSession({
                amount: amountInCentavos,
                planName: `${selectedPackage.amount} Créditos`,
                description: `${selectedPackage.amount} Créditos RenderXYZ - ${selectedPackage.description}`,
                customerEmail: auth.currentUser?.email || undefined,
                customerName: auth.currentUser?.displayName || undefined,
                userId: auth.currentUser?.uid
            });
        } catch (error: any) {
            console.error('PIX payment error:', error);
            toast.error(error.message || 'Erro ao iniciar pagamento PIX');
            setPaymentLoading(false);
        }
    };

    const getPackageStyle = (index: number) => {
        if (index === 2) return { badge: 'MELHOR VALOR', icon: TrendingUp, gradient: 'from-emerald-500 to-teal-600', highlight: true };
        if (index === 1) return { badge: 'MAIS POPULAR', icon: Sparkles, gradient: 'from-black to-zinc-800', highlight: false };
        return { badge: null, icon: Zap, gradient: '', highlight: false };
    };

    return (
        <>
            {/* Payment Method Modal */}
            {selectedPackage && (
                <PaymentMethodModal
                    isOpen={showPaymentModal}
                    onClose={() => { setShowPaymentModal(false); setPaymentLoading(false); }}
                    package={selectedPackage}
                    onSelectCard={handlePayWithCard}
                    onSelectPix={handlePayWithPix}
                    isLoading={paymentLoading}
                />
            )}

            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
                <div className="relative bg-white w-full max-w-4xl rounded-[35px] max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 fade-in duration-200">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-black to-zinc-800 p-6 md:p-8 rounded-t-[35px]">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-xl md:text-2xl font-black uppercase tracking-widest text-white">Comprar Créditos</h2>
                                <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-1">Escolha o pacote ideal para você</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    </div>

                    {/* Packages Grid */}
                    <div className="p-6 md:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                            {creditPackages.map((pkg, index) => {
                                const style = getPackageStyle(index);
                                const IconComponent = style.icon;

                                return (
                                    <div
                                        key={pkg.id}
                                        className={`relative bg-gradient-to-br from-[#F8F6F1] to-[#EAE4D5] border-2 ${style.highlight
                                                ? 'border-emerald-500 shadow-xl shadow-emerald-500/20 scale-105'
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
                                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 mt-2 ${style.highlight
                                                ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
                                                : index === 1
                                                    ? 'bg-black text-white'
                                                    : 'bg-[#B6B09F]/30 text-black'
                                            }`}>
                                            <div className="text-center leading-tight">
                                                <span className="text-2xl font-black block">{pkg.amount}</span>
                                                <span className="text-[8px] font-bold uppercase opacity-80 -mt-1 block">créditos</span>
                                            </div>
                                        </div>

                                        {/* Package Name */}
                                        <p className="text-[#7A756A] text-[9px] font-black uppercase tracking-widest mb-4">{pkg.description}</p>

                                        {/* Price */}
                                        <div className="mb-6">
                                            <span className="text-[#7A756A] text-sm">R$</span>
                                            <span className="text-3xl font-black ml-1">{pkg.price}</span>
                                        </div>

                                        {/* Button */}
                                        <button
                                            onClick={() => handleSelectPackage(pkg)}
                                            className={`w-full py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center transition-all ${style.highlight
                                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-lg hover:shadow-emerald-500/30'
                                                    : 'bg-black text-white hover:bg-zinc-800'
                                                }`}
                                        >
                                            Comprar Agora
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Trust Badge */}
                        <p className="text-center text-[9px] font-bold uppercase tracking-widest text-[#7A756A] mt-6">
                            🔒 Pagamento 100% seguro • Créditos nunca expiram
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};
