import React from 'react';
import { motion } from 'framer-motion';
import { VideoPlayer } from './VideoPlayer';

interface InterestSectionProps {
    heroVideoUrl: string;
    heroVideoPoster: string;
}

export const InterestSection: React.FC<InterestSectionProps> = ({ heroVideoUrl, heroVideoPoster }) => {
    return (
        <section id="interest" className="py-24 md:py-32 bg-neutral-50 relative overflow-hidden">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* Text Content - Focused on "Interest" / The Hook */}
                    <div className="order-2 lg:order-1 space-y-8">
                        <div>
                            <span className="inline-block px-4 py-2 bg-neutral-200 text-neutral-800 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                                Tecnologia Exclusiva
                            </span>
                            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-neutral-900 leading-[1.1] font-sans">
                                Deixe de renderizar <br />
                                <span className="text-neutral-400">Comece a criar</span>
                            </h2>
                        </div>

                        <p className="text-lg md:text-xl text-neutral-600 leading-relaxed font-medium max-w-xl">
                            O Render XYZ não é apenas mais uma ferramenta de renderização. É um motor de inteligência artificial que entende sua arquitetura e a transforma em realidade em segundos.
                        </p>

                        <div className="flex flex-col space-y-4">
                            {[
                                { title: "Velocidade Instantânea", desc: "Esqueça as horas de espera. Veja resultados em tempo real." },
                                { title: "Qualidade Fotorealista", desc: "Iluminação e texturas calculadas perfeitamente pela IA." },
                                { title: "Fluxo Sem Fricção", desc: "Do SketchUp para o 8K com apenas um clique." }
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-start space-x-4">
                                    <div className="w-1.5 h-1.5 mt-2.5 bg-black rounded-full shrink-0" />
                                    <div>
                                        <h3 className="font-bold text-neutral-900">{item.title}</h3>
                                        <p className="text-neutral-500 text-sm">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Visual Content - The Video Hook */}
                    <div className="order-1 lg:order-2 relative w-full">
                        {/* Decorative elements behind */}
                        <div className="absolute -inset-4 bg-gradient-to-tr from-neutral-200 to-transparent rounded-[40px] opacity-50 blur-2xl" />

                        <div className="relative aspect-video w-full max-w-2xl mx-auto bg-black rounded-3xl overflow-hidden shadow-2xl border-[6px] border-white ring-1 ring-neutral-200">
                            <VideoPlayer url={heroVideoUrl} poster={heroVideoPoster} />

                            {/* Overlay Badge */}

                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
