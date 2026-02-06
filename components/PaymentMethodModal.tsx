import React, { useEffect } from 'react';
import { X, CreditCard, Smartphone, Zap, Shield, Loader2, ChevronRight } from 'lucide-react';
import { CreditPackage } from '../types';

interface PaymentMethodModalProps {
    isOpen: boolean;
    onClose: () => void;
    package: CreditPackage;
    onSelectCard: () => void;
    onSelectPix: () => void;
    isLoading?: boolean;
}

export const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({
    isOpen,
    onClose,
    package: pkg,
    onSelectCard,
    onSelectPix,
    isLoading = false
}) => {
    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="bg-white rounded-[30px] w-full max-w-md overflow-hidden animate-in zoom-in-95 fade-in duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-black to-zinc-800 p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-black uppercase tracking-widest">Finalizar Compra</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            disabled={isLoading}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Package Summary */}
                    <div className="bg-white/10 rounded-2xl p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                    <Zap className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-black text-lg">{pkg.amount} Créditos</p>
                                    <p className="text-white/60 text-[10px] font-bold uppercase">{pkg.description}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-black">R$ {pkg.price}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="p-6 space-y-4">
                    <p className="text-center text-[10px] font-bold uppercase tracking-widest text-[#7A756A] mb-2">
                        Escolha como pagar
                    </p>

                    {/* Card Button */}
                    <button
                        onClick={onSelectCard}
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-5 rounded-2xl flex items-center justify-between hover:shadow-lg hover:shadow-blue-500/30 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <CreditCard className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <p className="font-black text-sm uppercase tracking-wider">Cartão de Crédito</p>
                                <p className="text-white/70 text-[10px] font-bold">Visa, Mastercard, Elo, Amex</p>
                            </div>
                        </div>
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <ChevronRight className="w-5 h-5" />
                        )}
                    </button>

                    {/* PIX Button */}
                    <button
                        onClick={onSelectPix}
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-5 rounded-2xl flex items-center justify-between hover:shadow-lg hover:shadow-emerald-500/30 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <Smartphone className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <p className="font-black text-sm uppercase tracking-wider">PIX</p>
                                <p className="text-white/70 text-[10px] font-bold">Aprovação instantânea</p>
                            </div>
                        </div>
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <ChevronRight className="w-5 h-5" />
                        )}
                    </button>
                </div>

                {/* Security Badge */}
                <div className="px-6 pb-6">
                    <div className="flex items-center justify-center space-x-2 text-[#7A756A] text-[10px] font-bold uppercase">
                        <Shield className="w-4 h-4" />
                        <span>Pagamento 100% seguro e criptografado</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
