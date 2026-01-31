
import React from 'react';
import { X, Plus, Loader2 } from 'lucide-react';
import { CreditPackage } from '../types';
import { stripeService } from '../services/stripeService';
import { toast } from 'react-hot-toast';
import { auth } from '../services/firebase';

interface CreditModalProps {
    creditPackages: CreditPackage[];
    onBuyCredits: (amount: number) => void;
    onClose: () => void;
}

export const CreditModal: React.FC<CreditModalProps> = ({ creditPackages, onBuyCredits, onClose }) => {
    const [loadingId, setLoadingId] = React.useState<string | null>(null);

    const handleBuy = async (pkg: CreditPackage) => {
        if (!pkg.stripePriceId) {
            toast.error("Pacote indisponível.");
            return;
        }

        setLoadingId(pkg.id);
        try {
            await stripeService.redirectToCheckout({
                priceId: pkg.stripePriceId,
                mode: 'payment',
                successUrl: `${window.location.origin}/?payment_success=true&credits=${pkg.amount}`,
                cancelUrl: `${window.location.origin}/?canceled=true`,
                customerEmail: auth.currentUser?.email || undefined,
                userId: auth.currentUser?.uid,
                credits: pkg.amount
            });
        } catch (error) {
            console.error(error);
            toast.error("Erro ao processar.");
            setLoadingId(null);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-[#F2F2F2] w-full max-w-4xl rounded-[35px] max-h-[90vh] overflow-y-auto p-6 md:p-12 shadow-2xl">
                <div className="flex justify-between items-center mb-8 md:mb-12">
                    <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter">Comprar Créditos</h2>
                    <button onClick={onClose} className="p-2 bg-[#EAE4D5] rounded-full"><X className="w-6 h-6" /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    {creditPackages.map((pkg) => (
                        <div
                            key={pkg.id}
                            className="bg-[#EAE4D5] border border-[#B6B09F]/30 p-8 rounded-[40px] flex flex-col items-center text-center hover:border-black transition-all"
                        >
                            <h3 className="text-2xl font-black mb-1">{pkg.amount} Créditos</h3>
                            <p className="text-[#7A756A] text-[10px] font-black uppercase mb-6 tracking-widest">{pkg.description}</p>
                            <div className="mb-8"><span className="text-4xl font-black">R$ {pkg.price}</span></div>
                            <button
                                onClick={() => handleBuy(pkg)}
                                disabled={!!loadingId}
                                className="w-full py-4 bg-black text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center disabled:opacity-70"
                            >
                                {loadingId === pkg.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Adquirir"}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
