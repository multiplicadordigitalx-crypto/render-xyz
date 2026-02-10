import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AppUser, CreditPackage } from '../types';
import { asaasService } from '../services/asaasService';
import { stripeService } from '../services/stripeService';
import { toast } from 'react-hot-toast';
import { CreditCard, QrCode, Loader2, ArrowLeft, Check, Copy } from 'lucide-react';

interface CheckoutPageProps {
    creditPackages: CreditPackage[];
    user: AppUser | null;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ creditPackages, user }) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const pkgId = searchParams.get('pkg');
    const selectedPackage = creditPackages.find(p => p.id === pkgId);

    const [paymentMethod, setPaymentMethod] = useState<'select' | 'pix' | 'card'>('select');
    const [loading, setLoading] = useState(false);

    // PIX State
    const [qrCodeData, setQrCodeData] = useState<{ encodedImage: string; payload: string } | null>(null);
    const [paymentId, setPaymentId] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!selectedPackage) {
            toast.error("Pacote não encontrado");
            navigate('/planos');
        }
    }, [selectedPackage, navigate]);

    if (!selectedPackage || !user) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

    const handleCardPayment = async () => {
        setLoading(true);
        try {
            const priceString = selectedPackage.price.replace(',', '.');
            const amountInCentavos = Math.round(parseFloat(priceString) * 100);

            await stripeService.createCheckoutSession({
                amount: amountInCentavos,
                credits: selectedPackage.amount,
                customerEmail: user.email,
                userId: user.id
            });
        } catch (error) {
            console.error("Stripe Error", error);
            toast.error("Erro ao iniciar pagamento com cartão");
            setLoading(false);
        }
    };

    const handlePixPayment = async () => {
        setPaymentMethod('pix');
        setLoading(true);
        try {
            const priceString = selectedPackage.price.replace('R$', '').trim().replace(',', '.');
            const amountCents = Math.round(parseFloat(priceString) * 100);

            const charge = await asaasService.createPixCharge({
                amount: amountCents,
                description: `${selectedPackage.amount} Créditos RenderXYZ - ${selectedPackage.description}`,
                customer: {
                    name: user.name || 'Cliente RenderXYZ',
                    email: user.email,
                    cpfCnpj: user.cpf || ''
                },
                userId: user.id,
                credits: selectedPackage.amount
            });

            setPaymentId(charge.id);
            const qrData = await asaasService.getPixQrCode(charge.id);
            setQrCodeData(qrData);

        } catch (error: any) {
            console.error('Erro ao gerar PIX:', error);
            toast.error(error.message || 'Erro ao gerar QR Code PIX');
            setPaymentMethod('select'); // Go back
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

    return (
        <div className="min-h-screen bg-[#F2F2F2] p-4 md:p-8 flex items-center justify-center">
            <div className="max-w-md w-full">
                <button onClick={() => navigate(-1)} className="mb-6 flex items-center text-sm font-bold text-gray-500 hover:text-black transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                </button>

                <div className="bg-white rounded-[35px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                    <div className="bg-gradient-to-r from-black to-zinc-800 p-8 text-white">
                        <h2 className="text-xl font-black uppercase tracking-widest">Checkout</h2>
                        <p className="text-[10px] text-zinc-400 mt-1">{selectedPackage.amount} Créditos - R$ {selectedPackage.price}</p>
                    </div>

                    <div className="p-8">
                        {paymentMethod === 'select' && (
                            <div className="space-y-4">
                                <button
                                    onClick={handleCardPayment}
                                    disabled={loading}
                                    className="w-full bg-gray-50 hover:bg-gray-100 border border-transparent hover:border-black/5 p-4 rounded-2xl flex items-center justify-between group transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-black group-hover:scale-110 transition-transform">
                                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <CreditCard className="w-6 h-6" />}
                                        </div>
                                        <div className="text-left">
                                            <p className="font-black uppercase text-xs tracking-wide">Cartão de Crédito</p>
                                            <p className="text-[10px] text-gray-500">Aprovação imediata</p>
                                        </div>
                                    </div>
                                    <div className="w-4 h-4 rounded-full border-2 border-gray-300 group-hover:border-black" />
                                </button>

                                <button
                                    onClick={handlePixPayment}
                                    disabled={loading}
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
                        )}

                        {paymentMethod === 'pix' && (
                            <div className="flex flex-col items-center text-center">
                                {loading ? (
                                    <div className="py-12 flex flex-col items-center">
                                        <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-4" />
                                        <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Gerando QR Code...</p>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-6">
                                            Escaneie para pagar <span className="text-black">R$ {selectedPackage.price}</span>
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
                                        </div>

                                        <button
                                            onClick={copyPayload}
                                            className="w-full bg-black text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
                                        >
                                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                            {copied ? 'Copiado!' : 'Copiar Código Pix'}
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
