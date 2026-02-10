
import React from 'react';
import { Zap, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
    return (
        <footer className="py-16 md:py-24 px-4 border-t border-[#B6B09F]/20 bg-[#EAE4D5]">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-[#7A756A] text-[9px] md:text-[10px] font-black uppercase tracking-widest">
                <Link to="/" className="flex items-center mb-8 md:mb-0 hover:opacity-80 transition-opacity">
                    <img src="/assets/logo.png" alt="Render XYZ" className="h-6 md:h-8 grayscale hover:grayscale-0 transition-all" />
                </Link>
                <div className="flex space-x-8 md:space-x-12 mb-8 md:mb-0">
                    <Link to="/portfolio" className="hover:text-black transition-colors">Portfólio</Link>
                    <Link to="/termos" className="hover:text-black transition-colors">Termos</Link>
                    <Link to="/privacidade" className="hover:text-black transition-colors">Privacidade</Link>
                </div>
                <div className="flex flex-col items-center md:items-end space-y-2">
                    <p className="opacity-50 text-center md:text-right">© 2026 – Excelência Aplicada</p>
                </div>
            </div>
        </footer>
    );
};
