
import React from 'react';
import { Boxes } from '../ui/BackgroundBoxes';

interface HeroProps {
    onStartNow: () => void;
    onSeeInAction: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartNow, onSeeInAction }) => {
    return (
        <section className="relative pt-32 md:pt-52 pb-20 md:pb-28 px-4 text-center reveal reveal-fade overflow-hidden">
            <div className="absolute inset-0 w-full h-full bg-[#F2F2F2] z-20 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />
            <Boxes />
            <div className="relative z-20 max-w-5xl mx-auto">
                <div className="inline-flex items-center bg-[#EAE4D5] border border-[#B6B09F]/40 px-4 md:px-6 py-2 rounded-full mb-8 md:mb-12">
                    <div className="w-2 h-2 bg-black rounded-full animate-pulse mr-3" />
                    <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em]">Inteligência Artificial Avançada</span>
                </div>
                <h1 className="text-4xl md:text-[6rem] font-black mb-8 md:mb-12 leading-[1.1] md:leading-[0.9] tracking-tighter uppercase">
                    A Nova Era da <br className="hidden md:block" /> <span className="gradient-text">Arquitetura</span>
                </h1>
                <p className="text-[#7A756A] text-sm md:text-xl mb-10 md:mb-16 max-w-3xl mx-auto font-bold uppercase tracking-[0.1em] leading-relaxed">
                    Diga adeus ao V-Ray, Lumion e computadores caros. A Render XYZ usa Inteligência Artificial para transformar seus rascunhos em imagens premiadas instantaneamente.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-8">
                    <button
                        onClick={onStartNow}
                        className="w-full sm:w-auto px-12 py-6 md:py-7 bg-black text-white rounded-[25px] md:rounded-[40px] font-black text-xs md:text-sm uppercase tracking-widest shadow-2xl"
                    >
                        Começar Agora
                    </button>
                    <a
                        href="#how-it-works"
                        onClick={(e) => {
                            e.preventDefault();
                            document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                            onSeeInAction();
                        }}
                        className="w-full sm:w-auto px-12 py-6 md:py-7 bg-white text-black border border-[#B6B09F]/30 rounded-[25px] md:rounded-[40px] font-black text-xs md:text-sm uppercase tracking-widest"
                    >
                        Veja em Ação
                    </a>
                </div>
            </div>
        </section>
    );
};
