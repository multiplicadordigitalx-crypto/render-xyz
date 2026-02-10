import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
    onAuth: (mode: 'login' | 'register') => void;
}

export const Header: React.FC<HeaderProps> = ({ onAuth }) => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id: string) => {
        setMobileMenuOpen(false);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#EAE4D5]/80 backdrop-blur-md py-4 shadow-sm' : 'bg-transparent py-6'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
                <div
                    className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        navigate('/');
                    }}
                >
                    <img src="/assets/logo.png" alt="Render XYZ" className="h-8 md:h-10" />
                </div>

                {/* Desktop Menu */}
                <nav className="hidden md:flex items-center space-x-8">
                    <button onClick={() => scrollToSection('features')} className="text-sm font-bold uppercase tracking-widest hover:text-black/70 transition-colors">Funcionalidades</button>
                    <button onClick={() => scrollToSection('how-it-works')} className="text-sm font-bold uppercase tracking-widest hover:text-black/70 transition-colors">Como Funciona</button>
                    <button onClick={() => scrollToSection('pricing')} className="text-sm font-bold uppercase tracking-widest hover:text-black/70 transition-colors">Preços</button>
                    <button onClick={() => scrollToSection('faq')} className="text-sm font-bold uppercase tracking-widest hover:text-black/70 transition-colors">FAQ</button>
                </nav>

                <div className="hidden md:flex items-center space-x-4">
                    <button
                        onClick={() => onAuth('login')}
                        className="px-6 py-2 text-sm font-black uppercase tracking-widest hover:bg-black/5 rounded-full transition-colors"
                    >
                        Entrar
                    </button>
                    <button
                        onClick={() => onAuth('register')}
                        className="px-6 py-2 bg-black text-white rounded-full text-sm font-black uppercase tracking-widest hover:bg-zinc-800 transition-colors shadow-lg"
                    >
                        Começar Agora
                    </button>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-[#EAE4D5] border-b border-[#B6B09F]/20 p-4 flex flex-col space-y-4 shadow-xl">
                    <button onClick={() => scrollToSection('features')} className="text-left py-2 font-bold uppercase tracking-widest">Funcionalidades</button>
                    <button onClick={() => scrollToSection('how-it-works')} className="text-left py-2 font-bold uppercase tracking-widest">Como Funciona</button>
                    <button onClick={() => scrollToSection('pricing')} className="text-left py-2 font-bold uppercase tracking-widest">Preços</button>
                    <button onClick={() => scrollToSection('faq')} className="text-left py-2 font-bold uppercase tracking-widest">FAQ</button>
                    <hr className="border-[#B6B09F]/20" />
                    <button onClick={() => { setMobileMenuOpen(false); onAuth('login'); }} className="text-left py-2 font-black uppercase tracking-widest">Entrar</button>
                    <button onClick={() => { setMobileMenuOpen(false); onAuth('register'); }} className="py-3 bg-black text-white rounded-xl font-black uppercase tracking-widest text-center shadow-lg">Começar Agora</button>
                </div>
            )}
        </header>
    );
};
