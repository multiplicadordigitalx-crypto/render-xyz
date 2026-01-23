
import React from 'react';
import { Zap, Settings } from 'lucide-react';

export const Footer: React.FC = () => {
    return (
        <footer className="py-16 md:py-24 px-4 border-t border-[#B6B09F]/20 bg-[#EAE4D5]">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-[#B6B09F] text-[9px] md:text-[10px] font-black uppercase tracking-widest">
                <a href="/" className="flex items-center mb-8 md:mb-0 hover:opacity-80 transition-opacity">
                    <img src="/assets/logo.png" alt="Render XYZ" className="h-6 md:h-8 grayscale hover:grayscale-0 transition-all" />
                </a>
                <div className="flex space-x-8 md:space-x-12 mb-8 md:mb-0">
                    <a href="#" className="hover:text-black">Portfólio</a>
                    <a href="#" className="hover:text-black">Termos</a>
                    <a href="#" className="hover:text-black">Privacidade</a>
                </div>
                <div className="flex flex-col items-center md:items-end space-y-2">
                    <p className="opacity-50 text-center md:text-right">© 2026 – Excelência Aplicada</p>
                </div>
            </div>
        </footer>
    );
};
