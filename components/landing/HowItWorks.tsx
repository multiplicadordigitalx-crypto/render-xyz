
import React from 'react';

interface HowItWorksProps {
    heroVideoUrl: string;
    heroVideoPoster: string;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ heroVideoUrl, heroVideoPoster }) => {
    const getYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const isYouTube = getYouTubeId(heroVideoUrl);

    return (
        <section id="how-it-works" className="py-20 md:py-36 px-4 bg-[#F2F2F2] overflow-hidden">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">
                <div className="order-2 lg:order-1 relative bg-[#EAE4D5] rounded-[40px] md:rounded-[60px] overflow-hidden shadow-2xl aspect-[9/16] max-w-[380px] mx-auto border-[12px] border-black reveal reveal-left">
                    {/* Smartphone Notch Decor */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-10 hidden md:block" />

                    {isYouTube ? (
                        <iframe
                            className="w-full h-full object-cover"
                            src={`https://www.youtube.com/embed/${isYouTube}?autoplay=1&mute=1&loop=1&playlist=${isYouTube}&controls=0&showinfo=0&rel=0&modestbranding=1`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    ) : (
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
                    )}

                    {/* Glossy Overlay effect */}
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/10 to-transparent opacity-30" />
                </div>
                <div className="order-1 lg:order-2 reveal reveal-right">
                    <h2 className="text-4xl md:text-7xl font-black mb-10 md:mb-12 uppercase tracking-tighter leading-tight">
                        Workflow de <br className="hidden md:block" /> Alta Performance
                    </h2>
                    <div className="space-y-8 md:space-y-12">
                        {[
                            { n: "1", t: "Input de Projeto", d: "Importe sua planta baixa, croqui ou modelagem 3D. Nossa IA interpreta geometria e materialidade instantaneamente." },
                            { n: "2", t: "Parametrização Atmosférica", d: "Defina o moodboard e as condições de iluminação. O motor ajusta a fotometria e o balanço de luz global." },
                            { n: "3", t: "Output em Alta Fidelidade", d: "Gere imagens em 4K prontas para portfólio. Texturas PBR e ray tracing simulado para apresentação final." }
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
