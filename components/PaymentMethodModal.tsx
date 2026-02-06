
import React from 'react';
import { X, CreditCard, QrCode, Loader2 } from 'lucide-react';
import { CreditPackage } from '../types';

interface PaymentMethodModalProps {
    isOpen: boolean;
    onClose: () => void;
    package: CreditPackage;
    onSelectCard: () => void;
    onSelectPix: () => void;
    isLoading: boolean;
}

export const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({
    isOpen,
    onClose,
    package: pkg,
    onSelectCard,
    onSelectPix,
    isLoading
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="bg-white rounded-[30px] w-full max-w-md overflow-hidden animate-in zoom-in-95 fade-in duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-black to-zinc-800 p-6 text-white flex justify-between items-center">
                    <div>
                        <h3 className="font-black uppercase tracking-widest text-sm">Forma de Pagamento</h3>
                        <p className="text-[10px] text-zinc-400 mt-1">{pkg.amount} Créditos - {pkg.price}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {/* Cartão de Crédito */}
                    <button
                        onClick={onSelectCard}
                        disabled={isLoading}
                        className="w-full bg-gray-50 hover:bg-gray-100 border border-transparent hover:border-black/5 p-4 rounded-2xl flex items-center justify-between group transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-black group-hover:scale-110 transition-transform">
                                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <CreditCard className="w-6 h-6" />}
                            </div>
                            <div className="text-left">
                                <p className="font-black uppercase text-xs tracking-wide">Cartão de Crédito</p>
                                <p className="text-[10px] text-gray-500">Aprovação imediata via Stripe</p>
                            </div>
                        </div>
                        <div className="w-4 h-4 rounded-full border-2 border-gray-300 group-hover:border-black" />
                    </button>

                    {/* PIX */}
                    <button
                        onClick={onSelectPix}
                        disabled={isLoading}
                        className="w-full bg-emerald-50/50 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 p-4 rounded-2xl flex items-center justify-between group transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                                <QrCode className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <p className="font-black uppercase text-xs tracking-wide text-emerald-900">PIX</p>
                                <p className="text-[10px] text-emerald-600/70">Aprovação em segundos</p>
                            </div>
                        </div>
                        <div className="w-4 h-4 rounded-full border-2 border-emerald-200 group-hover:border-emerald-500" />
                    </button>
                </div>

                <div className="bg-gray-50 px-6 py-4 text-center">
                    <p className="text-[10px] text-gray-400 font-medium">Ambiente seguro e criptografado</p>
                </div>
            </div>
        </div>
    );
};
