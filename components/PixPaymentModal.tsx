
import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Loader2, QrCode } from 'lucide-react';
import { abacatePayService } from '../services/abacatePayService';

interface PixPaymentModalProps {
    planName: string;
    amount: number;
    onSuccess: () => void;
    onClose: () => void;
}

export const PixPaymentModal: React.FC<PixPaymentModalProps> = ({
    planName,
    amount,
    onSuccess,
    onClose
}) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pixData, setPixData] = useState<{
        id: string;
        brCode: string;
        qrCodeBase64: string;
        expiresAt: string;
    } | null>(null);
    const [copied, setCopied] = useState(false);
    const [checkingPayment, setCheckingPayment] = useState(false);

    // Generate PIX on mount
    useEffect(() => {
        const generatePix = async () => {
            try {
                setLoading(true);
                setError(null);

                const data = await abacatePayService.createCheckoutSession({
                    amount,
                    planName,
                    description: `Assinatura ${planName} - RenderXYZ`
                });

                setPixData({
                    id: data.id,
                    brCode: data.brCode,
                    qrCodeBase64: data.qrCodeBase64,
                    expiresAt: data.expiresAt
                });
            } catch (err: any) {
                setError(err.message || 'Erro ao gerar pagamento');
            } finally {
                setLoading(false);
            }
        };

        generatePix();
    }, [amount, planName]);

    // Poll for payment status
    useEffect(() => {
        if (!pixData?.id) return;

        const interval = setInterval(async () => {
            try {
                setCheckingPayment(true);
                const status = await abacatePayService.checkPaymentStatus(pixData.id);

                if (status.status === 'PAID') {
                    clearInterval(interval);
                    onSuccess();
                }
            } catch (err) {
                console.error('Error checking payment:', err);
            } finally {
                setCheckingPayment(false);
            }
        }, 5000); // Check every 5 seconds

        return () => clearInterval(interval);
    }, [pixData?.id, onSuccess]);

    const copyToClipboard = async () => {
        if (!pixData?.brCode) return;

        try {
            await navigator.clipboard.writeText(pixData.brCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const formatAmount = (cents: number) => {
        return (cents / 100).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#F2F2F2] rounded-[35px] max-w-md w-full p-8 relative">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 hover:bg-black/5 rounded-full transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <QrCode className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-black uppercase tracking-tight mb-2">
                        Pagamento PIX
                    </h2>
                    <p className="text-[#7A756A] text-[10px] font-bold uppercase tracking-widest">
                        {planName} • {formatAmount(amount)}
                    </p>
                </div>

                {/* Content */}
                {loading && (
                    <div className="flex flex-col items-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-black mb-4" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#7A756A]">
                            Gerando QR Code...
                        </p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                        <p className="text-red-600 text-sm font-bold mb-4">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
                        >
                            Tentar Novamente
                        </button>
                    </div>
                )}

                {pixData && !loading && !error && (
                    <div className="space-y-6">
                        {/* QR Code */}
                        <div className="bg-white rounded-2xl p-6 flex justify-center">
                            {pixData.qrCodeBase64 ? (
                                <img
                                    src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                                    alt="QR Code PIX"
                                    className="w-48 h-48"
                                />
                            ) : (
                                <div className="w-48 h-48 bg-gray-100 flex items-center justify-center rounded-xl">
                                    <QrCode className="w-12 h-12 text-gray-400" />
                                </div>
                            )}
                        </div>

                        {/* Copy code button */}
                        <button
                            onClick={copyToClipboard}
                            className="w-full py-4 bg-black text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    Código Copiado!
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4" />
                                    Copiar Código PIX
                                </>
                            )}
                        </button>

                        {/* Status indicator */}
                        <div className="flex items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-widest text-[#7A756A]">
                            {checkingPayment ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            )}
                            Aguardando pagamento...
                        </div>

                        {/* Instructions */}
                        <div className="text-center text-[9px] text-[#7A756A] space-y-1">
                            <p>1. Abra o app do seu banco</p>
                            <p>2. Escaneie o QR Code ou copie o código</p>
                            <p>3. Confirme o pagamento</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
