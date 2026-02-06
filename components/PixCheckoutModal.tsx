
import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Loader2, QrCode } from 'lucide-react';
import { asaasService } from '../services/asaasService';
import { CreditPackage, AppUser } from '../types';
import { toast } from 'react-hot-toast';

interface PixCheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedPackage: CreditPackage;
    user: AppUser;
}

export const PixCheckoutModal: React.FC<PixCheckoutModalProps> = ({ isOpen, onClose, selectedPackage, user }) => {
    const [loading, setLoading] = useState(true);
    const [qrCodeData, setQrCodeData] = useState<{ encodedImage: string; payload: string } | null>(null);
    const [paymentId, setPaymentId] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isOpen && selectedPackage && user) {
            generatePix();
        }
    }, [isOpen, selectedPackage]);

    const generatePix = async () => {
        setLoading(true);
        try {
            // Converter preço "R$ 29,90" para centavos
            const priceString = selectedPackage.price.replace('R$', '').trim().replace(',', '.');
            const amountCents = Math.round(parseFloat(priceString) * 100);

            // 1. Criar cobrança
            const charge = await asaasService.createPixCharge({
                amount: amountCents,
                description: `${selectedPackage.amount} Créditos RenderXYZ - ${selectedPackage.description}`,
                customer: {
                    name: user.displayName || 'Cliente RenderXYZ',
                    email: user.email,
                    cpfCnpj: user.cpf || '' // Precisamos do CPF para PIX no Asaas geralmente
                },
                userId: user.id,
                credits: selectedPackage.amount
            });

            setPaymentId(charge.id);

            // 2. Buscar QR Code
            const qrData = await asaasService.getPixQrCode(charge.id);
            setQrCodeData(qrData);

        } catch (error: any) {
            console.error('Erro ao gerar PIX:', error);
            toast.error(error.message || 'Erro ao gerar QR Code PIX');
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const copyPayload = () => {
        if (qrCodeData?.payload) {
            navigator.clipboard.writeText(qrCodeData.payload);
            setCopied(true);
            toast.success('Código PIX copiado!');
            setTimeout(() => setCopied(false), 3000);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="bg-white rounded-[30px] w-full max-w-md overflow-hidden animate-in zoom-in-95 fade-in duration-200">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-6 text-white flex justify-between items-center">
                    <h3 className="font-black uppercase tracking-widest text-sm flex items-center gap-2">
                        <QrCode className="w-5 h-5" /> Pagamento via PIX
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8 flex flex-col items-center text-center">
                    {loading ? (
                        <div className="py-12 flex flex-col items-center">
                            <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-4" />
                            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Gerando QR Code...</p>
                        </div>
                    ) : (
                        <>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-6">
                                Escaneie para pagar <span className="text-black">{selectedPackage.price}</span>
                            </p>

                            {qrCodeData?.encodedImage && (
                                <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-200 mb-6">
                                    <img src={`data:image/png;base64,${qrCodeData.encodedImage}`} alt="QR Code PIX" className="w-48 h-48" />
                                </div>
                            )}

                            <div className="w-full bg-gray-50 p-4 rounded-xl mb-6 relative group">
                                <p className="text-[10px] text-gray-500 break-all line-clamp-2 font-mono text-left">
                                    {qrCodeData?.payload}
                                </p>
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-transparent to-transparent flex items-end justify-center pb-2 pointer-events-none group-hover:via-gray-50/50 transition-all" />
                            </div>

                            <button
                                onClick={copyPayload}
                                className="w-full bg-black text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                {copied ? 'Copiado!' : 'Copiar Código Pix'}
                            </button>

                            <p className="mt-6 text-[10px] text-gray-400 max-w-xs leading-relaxed">
                                Após o pagamento, seus créditos serão adicionados automaticamente em alguns instantes.
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
