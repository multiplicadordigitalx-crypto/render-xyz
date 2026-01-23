
import React from 'react';
import { Zap, Settings } from 'lucide-react';

interface FooterProps {
    onAdminClick: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onAdminClick }) => {
    return (
        <footer className="py-16 md:py-24 px-4 border-t border-[#B6B09F]/20 bg-[#EAE4D5]">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-[#B6B09F] text-[9px] md:text-[10px] font-black uppercase tracking-widest">
                <div className="flex items-center space-x-2 mb-8 md:mb-0">
                    <Zap className="text-black w-4 h-4" />
                    <span className="text-black text-xl font-black">Render XYZ</span>
                </div>
                <div className="flex space-x-8 md:space-x-12 mb-8 md:mb-0">
                    <a href="#" className="hover:text-black">Portfólio</a>
                    <a href="#" className="hover:text-black">Termos</a>
                    <a href="#" className="hover:text-black">Privacidade</a>
                </div>
                <div className="flex flex-col items-center md:items-end space-y-2">
                    <p className="opacity-50 text-center md:text-right">© 2026 – Excelência Aplicada</p>
                    <button
                        onClick={onAdminClick}
                        className="flex items-center space-x-1 opacity-20 hover:opacity-100"
                    >
                        <Settings className="w-3 h-3" />
                        <span>Painel Admin</span>
                    </button>
                </div>
            </div>
        </footer>
    );
};
