import React from 'react';
import { RenderHistoryItem, RenderStyle } from '../types';
import { Download, Trash2, Clock } from 'lucide-react';

interface HistorySidebarProps {
    history: RenderHistoryItem[];
    onSelect: (item: RenderHistoryItem) => void;
    onDelete: (id: string) => void;
    onDownload: (url: string, style: RenderStyle) => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ history, onSelect, onDelete, onDownload }) => {
    return (
        <div className="h-full flex flex-col bg-[#EAE4D5] border-l border-[#B6B09F]/20 w-80 shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.1)]">
            <div className="p-6 border-b border-[#B6B09F]/20 bg-[#EAE4D5]">
                <h3 className="text-sm font-black uppercase tracking-widest flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Histórico
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {history.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-[#7A756A] opacity-50 p-8 text-center">
                        <Clock className="w-8 h-8 mb-3" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Nenhum render recente</p>
                    </div>
                ) : (
                    history.map((item) => (
                        <div key={item.id} className="group relative bg-[#F2F2F2] rounded-xl overflow-hidden border border-[#B6B09F]/20 hover:border-black transition-all">
                            <div
                                className="aspect-video cursor-pointer"
                                onClick={() => onSelect(item)}
                            >
                                <img src={item.url} alt="Render" className="w-full h-full object-cover" />
                            </div>
                            <div className="p-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-black uppercase tracking-wider text-[#7A756A]">{item.style}</span>
                                    <div className="flex space-x-1">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onDownload(item.url, item.style); }}
                                            className="p-1.5 hover:bg-black hover:text-white rounded-lg transition-colors"
                                            title="Baixar"
                                        >
                                            <Download className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                                            className="p-1.5 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
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
    );
};
