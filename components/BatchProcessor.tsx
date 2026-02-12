import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Loader2, CheckCircle2, Image as ImageIcon, AlertCircle, Coins, ShoppingCart } from 'lucide-react';
import { RenderStyle } from '../types';

interface BatchProcessorProps {
    onRender: (file: File, style: RenderStyle, resolution: any) => Promise<void>;
    isProcessing: boolean;
    style: RenderStyle;
    resolution: any;
    credits: number;
    costPerRender: number;
}

interface BatchItem {
    id: string;
    file: File;
    status: 'pending' | 'processing' | 'completed' | 'error';
    previewUrl: string;
}

// Batch mode costs +1 credit per render
const BATCH_SURCHARGE = 1;

export const BatchProcessor: React.FC<BatchProcessorProps> = ({
    onRender,
    isProcessing: globalProcessing,
    style,
    resolution,
    credits,
    costPerRender
}) => {
    const [queue, setQueue] = useState<BatchItem[]>([]);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    const totalCostPerItem = costPerRender + BATCH_SURCHARGE;
    const pendingCount = queue.filter(i => i.status === 'pending').length;
    const totalCostNeeded = pendingCount * totalCostPerItem;
    const hasEnoughCredits = credits >= totalCostNeeded;

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files).map((file: File) => ({
                id: Math.random().toString(36).substr(2, 9),
                file,
                status: 'pending' as const,
                previewUrl: URL.createObjectURL(file)
            }));
            setQueue(prev => [...prev, ...newFiles]);
        }
    };

    const removeQueueItem = (id: string) => {
        setQueue(prev => {
            const newQueue = prev.filter(item => item.id !== id);
            return newQueue;
        });
    };

    const processQueue = async () => {
        if (!queue.length) return;

        // Find first pending item
        const pendingItems = queue.filter(item => item.status === 'pending');
        if (pendingItems.length === 0) return;

        for (const item of pendingItems) {
            setProcessingId(item.id);
            updateItemStatus(item.id, 'processing');

            try {
                await onRender(item.file, style, resolution);
                updateItemStatus(item.id, 'completed');
            } catch (error) {
                console.error("Error processing batch item:", error);
                updateItemStatus(item.id, 'error');
            }
        }
        setProcessingId(null);
    };

    const updateItemStatus = (id: string, status: BatchItem['status']) => {
        setQueue(prev => prev.map(item => item.id === id ? { ...item, status } : item));
    };

    const completedCount = queue.filter(i => i.status === 'completed').length;

    return (
        <div className="w-full max-w-2xl mx-auto h-full flex flex-col animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between mb-4 shrink-0">
                <div className="flex items-center space-x-2">
                    <div className="bg-black text-white px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">BETA</div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-[#7A756A]">Renderização em Lote</h3>
                </div>
                {queue.length > 0 && (
                    <span className="text-[10px] font-bold uppercase text-[#7A756A]">
                        {completedCount} / {queue.length} Concluídos
                    </span>
                )}
            </div>

            {/* Cost indicator */}
            <div className={`rounded-xl p-3 mb-4 shrink-0 ${!hasEnoughCredits && pendingCount > 0 ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200'}`}>
                <div className="flex items-center justify-between">
                    <div className={`flex items-center space-x-2 text-[10px] font-bold uppercase ${!hasEnoughCredits && pendingCount > 0 ? 'text-red-700' : 'text-amber-700'}`}>
                        <Coins className="w-4 h-4" />
                        <span>Custo Lote: {totalCostPerItem} créditos por imagem (Incluso taxa de lote de 1 crédito)</span>
                    </div>
                    {pendingCount > 0 && (
                        <span className={`text-[10px] font-black uppercase ${!hasEnoughCredits ? 'text-red-800' : 'text-amber-800'}`}>
                            Total: {totalCostNeeded} créditos
                        </span>
                    )}
                </div>

                {/* Insufficient credits warning */}
                {!hasEnoughCredits && pendingCount > 0 && (
                    <div className="mt-3 pt-3 border-t border-red-200 text-center flex flex-col items-center">
                        <p className="text-red-700 text-[11px] font-black uppercase mb-2">
                            ⚠️ Você tem {credits} créditos, precisa de {totalCostNeeded}
                        </p>
                        <p className="text-red-600 text-[10px] font-bold mb-3">
                            Faltam {totalCostNeeded - credits} créditos para processar {pendingCount} {pendingCount === 1 ? 'imagem' : 'imagens'}
                        </p>
                        <button
                            onClick={() => navigate('/planos')}
                            className="bg-red-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-colors flex items-center shadow-lg transform hover:scale-105"
                        >
                            <ShoppingCart className="w-3 h-3 mr-2" />
                            Comprar Pacote de Créditos
                        </button>
                    </div>
                )}
            </div>

            <div
                className={`relative border-2 border-dashed rounded-3xl p-8 transition-all duration-300 text-center flex flex-col items-center justify-center flex-1 min-h-0 overflow-hidden
                    ${queue.length > 0 ? 'border-black bg-white' : 'border-[#B6B09F] hover:border-black hover:bg-white'}
                `}
            >
                <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileSelect}
                    accept="image/*"
                    aria-label="Upload files for batch processing"
                />

                {queue.length === 0 ? (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="cursor-pointer space-y-4 py-8 w-full h-full flex flex-col items-center justify-center"
                        role="button"
                        aria-label="Click to upload files"
                        tabIndex={0}
                    >
                        <div className="w-16 h-16 bg-[#F2F2F2] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <Upload className="w-8 h-8 text-[#7A756A]" />
                        </div>
                        <div>
                            <p className="text-sm font-black uppercase tracking-widest">Arraste múltiplos arquivos</p>
                            <p className="text-[10px] font-bold uppercase text-[#7A756A] mt-2">ou clique para selecionar (JPG, PNG)</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 w-full h-full flex flex-col">
                        <div className="grid grid-cols-1 gap-3 overflow-y-auto pr-2 custom-scrollbar flex-1 content-start">
                            {queue.map(item => (
                                <div key={item.id} className="flex items-center bg-[#F2F2F2] p-3 rounded-xl gap-4 shrink-0">
                                    <img
                                        src={item.previewUrl}
                                        alt={item.file.name}
                                        className="w-12 h-12 object-cover rounded-lg bg-white"
                                    />
                                    <div className="flex-1 text-left overflow-hidden">
                                        <p className="text-[10px] font-bold truncate">{item.file.name}</p>
                                        <p className="text-[9px] font-bold uppercase text-[#7A756A]">
                                            {item.status === 'pending' && 'Aguardando'}
                                            {item.status === 'processing' && 'Renderizando...'}
                                            {item.status === 'completed' && 'Concluído'}
                                            {item.status === 'error' && 'Erro'}
                                        </p>
                                    </div>
                                    <div className="flex items-center">
                                        {item.status === 'pending' && <div className="w-2 h-2 rounded-full bg-gray-300" />}
                                        {item.status === 'processing' && <Loader2 className="w-4 h-4 animate-spin text-black" />}
                                        {item.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                                        {item.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}

                                        {item.status === 'pending' && (
                                            <button
                                                onClick={() => removeQueueItem(item.id)}
                                                className="ml-3 p-1 hover:bg-black/10 rounded-full"
                                                aria-label="Remove item"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-[#B6B09F]/20 shrink-0">
                            <button
                                onClick={processQueue}
                                disabled={!!processingId || pendingCount === 0 || !hasEnoughCredits}
                                className="flex-1 bg-black text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-800 transition-colors"
                                aria-label="Start batch processing"
                            >
                                {processingId ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        Processando...
                                    </>
                                ) : !hasEnoughCredits ? (
                                    `Créditos insuficientes (${totalCostNeeded} necessários)`
                                ) : (
                                    `Iniciar Lote (${totalCostNeeded} créditos)`
                                )}
                            </button>
                            <button
                                onClick={() => { setQueue([]); setProcessingId(null); }}
                                disabled={!!processingId}
                                className="px-6 border-2 border-black/10 hover:border-black rounded-xl font-black text-xs uppercase tracking-widest disabled:opacity-30"
                                aria-label="Clear queue"
                            >
                                Limpar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
