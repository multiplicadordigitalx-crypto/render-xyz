import React from 'react';
import { RenderHistoryItem, RenderStyle } from '../types';
import { Download, Trash2, Clock, RotateCcw, X, Wand2 } from 'lucide-react';

interface HistorySidebarProps {
    history: RenderHistoryItem[];
    onSelect: (item: RenderHistoryItem) => void;
    onDelete: (id: string) => void;
    onDownload: (url: string, style: RenderStyle) => void;
    onRefine?: (item: RenderHistoryItem) => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ history, onSelect, onDelete, onDownload, onRefine }) => {
    const [selectedImage, setSelectedImage] = React.useState<RenderHistoryItem | null>(null);

    return (
        <div className="w-full bg-[#EAE4D5] border-t border-[#B6B09F]/20 flex flex-col shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.05)] z-20">
            <div className="px-6 py-4 border-b border-[#B6B09F]/20 bg-[#EAE4D5] flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest flex items-center text-[#7A756A]">
                    <Clock className="w-4 h-4 mr-2" />
                    Histórico & Portfólio
                </h3>
            </div>

            <div className="flex-1 overflow-x-auto p-4 custom-scrollbar">
                <div className="flex space-x-4 min-w-max pb-2">
                    {history.length === 0 ? (
                        <div className="w-full py-8 flex flex-col items-center justify-center text-[#7A756A] opacity-50 px-12">
                            <Clock className="w-6 h-6 mb-2" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-center">Nenhum render recente</p>
                        </div>
                    ) : (
                        history.map((item) => (
                            <div key={item.id} className="group relative w-64 bg-[#F2F2F2] rounded-xl overflow-hidden border border-[#B6B09F]/20 hover:border-black transition-all flex-none shadow-sm hover:shadow-md">
                                <div
                                    className="aspect-video cursor-pointer"
                                    onClick={() => setSelectedImage(item)}
                                >
                                    <img src={item.url} alt="Render" className="w-full h-full object-cover" />
                                </div>
                                <div className="p-3 bg-white">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] font-black uppercase tracking-wider text-[#7A756A] truncate max-w-[80px]">{item.style}</span>
                                        <div className="flex space-x-1">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onDownload(item.url, item.style); }}
                                                className="p-1.5 hover:bg-black hover:text-white rounded-lg transition-colors bg-black/5 text-black"
                                                title="Baixar"
                                            >
                                                <Download className="w-3 h-3" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                                                className="p-1.5 hover:bg-red-500 hover:text-white rounded-lg transition-colors bg-red-50 text-red-500"
                                                title="Excluir"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            {/* Lightbox Overlay */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-12 animate-in fade-in zoom-in duration-300"
                    onClick={() => setSelectedImage(null)}
                >
                    {/* Top Right Close Button */}
                    <div className="absolute top-6 right-6">
                        <button
                            className="bg-white/10 hover:bg-white/20 p-3 rounded-full text-white transition-colors"
                            onClick={() => setSelectedImage(null)}
                            title="Fechar"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Main Content */}
                    <div className="flex flex-col items-center max-w-5xl w-full h-full" onClick={(e) => e.stopPropagation()}>
                        <div className="relative flex-1 w-full h-0 flex items-center justify-center min-h-0">
                            <img
                                src={selectedImage.url}
                                alt="Expanded Render"
                                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                            />
                        </div>

                        {/* Bottom Actions */}
                        <div className="mt-8 flex gap-4 shrink-0">
                            <button
                                onClick={() => { if (onRefine) onRefine(selectedImage); setSelectedImage(null); }}
                                className="px-6 py-3 bg-amber-500 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-amber-600 transition-all flex items-center"
                            >
                                <Wand2 className="w-4 h-4 mr-2" />
                                Refinar
                            </button>
                            <button
                                onClick={() => onDownload(selectedImage.url, selectedImage.style)}
                                className="px-6 py-3 bg-white text-black rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-gray-200 transition-all flex items-center"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download
                            </button>
                        </div>
                        <p className="text-white/30 text-[9px] uppercase tracking-widest mt-4 font-bold">Clique no X para fechar</p>
                    </div>
                </div>
            )}
        </div>
    );
};
