
import React from 'react';

interface HeroProps {
    onStartNow: () => void;
    onSeeInAction: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartNow, onSeeInAction }) => {
    return (
        <section className="relative pt-32 md:pt-52 pb-20 md:pb-28 px-4 text-center reveal reveal-fade">
            <div className="max-w-5xl mx-auto">
                <div className="inline-flex items-center bg-[#EAE4D5] border border-[#B6B09F]/40 px-4 md:px-6 py-2 rounded-full mb-8 md:mb-12">
                    <div className="w-2 h-2 bg-black rounded-full animate-pulse mr-3" />
                    <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em]">IA de Luxo Aplicada</span>
                </div>
                <h1 className="text-4xl md:text-[7rem] font-black mb-8 md:mb-12 leading-[1.1] md:leading-[0.85] tracking-tighter uppercase">
                    Render Realista <br className="hidden md:block" /> <span className="gradient-text">com um Clique</span>
                </h1>
                <p className="text-[#B6B09F] text-sm md:text-xl mb-10 md:mb-16 max-w-3xl mx-auto font-bold uppercase tracking-[0.1em] leading-relaxed">
                    Poupe semanas de trabalho e milhares de reais. Render XYZ entrega visualizações de elite instantaneamente.
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
