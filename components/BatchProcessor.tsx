import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, CheckCircle2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { RenderStyle } from '../types';

interface BatchProcessorProps {
    onRender: (file: File) => Promise<void>;
    isProcessing: boolean;
    style: RenderStyle;
    userPlan: string;
    onUpgrade: () => void;
}

interface BatchItem {
    id: string;
    file: File;
    status: 'pending' | 'processing' | 'completed' | 'error';
    previewUrl: string;
}

export const BatchProcessor: React.FC<BatchProcessorProps> = ({ onRender, isProcessing: globalProcessing, style, userPlan, onUpgrade }) => {
    const [queue, setQueue] = useState<BatchItem[]>([]);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isElite = userPlan === 'elite';

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            if (!isElite) {
                onUpgrade();
                return;
            }

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
                await onRender(item.file);
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
        <div className="w-full max-w-2xl mx-auto mb-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between mb-4">
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

            <div
                className={`relative border-2 border-dashed rounded-3xl p-8 transition-all duration-300 text-center
                    ${!isElite ? 'border-[#B6B09F]/30 bg-[#EAE4D5]/20' :
                        queue.length > 0 ? 'border-black bg-white' : 'border-[#B6B09F] hover:border-black hover:bg-white'}
                `}
            >
                {!isElite && (
                    <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center rounded-3xl">
                        <div className="bg-black text-white p-6 rounded-2xl shadow-2xl max-w-xs text-center transform hover:scale-105 transition-transform">
                            <span className="block text-2xl mb-2">💎</span>
                            <h4 className="text-lg font-black uppercase mb-2">Exclusivo Elite</h4>
                            <p className="text-[10px] font-bold text-white/70 mb-4 uppercase">Renderize dezenas de imagens automaticamente enquanto você descansa.</p>
                            <button onClick={onUpgrade} className="w-full bg-white text-black py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#F2F2F2]">
                                Fazer Upgrade
                            </button>
                        </div>
                    </div>
                )}

                <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileSelect}
                    accept="image/*"
                />

                {queue.length === 0 ? (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="cursor-pointer space-y-4 py-8"
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
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {queue.map(item => (
                                <div key={item.id} className="flex items-center bg-[#F2F2F2] p-3 rounded-xl gap-4">
                                    <img src={item.previewUrl} className="w-12 h-12 object-cover rounded-lg bg-white" />
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
                                            <button onClick={() => removeQueueItem(item.id)} className="ml-3 p-1 hover:bg-black/10 rounded-full">
                                                <X className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-[#B6B09F]/20">
                            <button
                                onClick={processQueue}
                                disabled={!!processingId || queue.filter(i => i.status === 'pending').length === 0}
                                className="flex-1 bg-black text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-800 transition-colors"
                            >
                                {processingId ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        Processando...
                                    </>
                                ) : (
                                    "Iniciar Renderização em Lote"
                                )}
                            </button>
                            <button
                                onClick={() => { setQueue([]); setProcessingId(null); }}
                                disabled={!!processingId}
                                className="px-6 border-2 border-black/10 hover:border-black rounded-xl font-black text-xs uppercase tracking-widest disabled:opacity-30"
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
