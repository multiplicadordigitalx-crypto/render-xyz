
import React from 'react';

interface HowItWorksProps {
    heroVideoUrl: string;
    heroVideoPoster: string;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ heroVideoUrl, heroVideoPoster }) => {
    return (
        <section id="how-it-works" className="py-20 md:py-36 px-4 bg-[#F2F2F2] overflow-hidden">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">
                <div className="order-2 lg:order-1 relative bg-[#EAE4D5] rounded-[40px] md:rounded-[60px] overflow-hidden shadow-2xl aspect-[9/16] max-w-[400px] mx-auto border-[10px] border-black reveal reveal-left">
                    <video
                        key={heroVideoUrl}
                        className="w-full h-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                        poster={heroVideoPoster}
                    >
                        <source src={heroVideoUrl} type="video/mp4" />
                    </video>
                </div>
                <div className="order-1 lg:order-2 reveal reveal-right">
                    <h2 className="text-4xl md:text-7xl font-black mb-10 md:mb-12 uppercase tracking-tighter leading-tight">
                        Fluxo de <br className="hidden md:block" /> Alta Velocidade
                    </h2>
                    <div className="space-y-8 md:space-y-12">
                        {[
                            { n: "1", t: "Input Digital", d: "Envie um print, sketch ou foto. Nossa rede neural identifica materiais e luz em milissegundos." },
                            { n: "2", t: "Estilo & Atmosfera", d: "Escolha entre Dia, Noite, Sunset ou Nublado. A IA ajusta a física da luz automaticamente." },
                            { n: "3", t: "Render 4K Pro", d: "Exporte em alta resolução. O render final é pronto para apresentações ou anúncios de venda." }
                        ].map((step, idx) => (
                            <div key={idx} className={`flex items-start space-x-6 md:space-x-8 reveal reveal-fade stagger-${idx + 1}`}>
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-black text-white rounded-2xl flex items-center justify-center shrink-0 font-black text-xl">{step.n}</div>
                                <div>
                                    <h3 className="text-lg md:text-xl font-black uppercase mb-2 tracking-widest">{step.t}</h3>
                                    <p className="text-[#B6B09F] text-xs font-bold uppercase tracking-wider leading-relaxed">{step.d}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
