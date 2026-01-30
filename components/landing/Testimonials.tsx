
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Star } from 'lucide-react';

const testimonials = [
    {
        quote:
            "A velocidade do Render XYZ mudou completamente nosso fluxo de trabalho. Conseguimos entregar prévias para clientes em minutos durante reuniões.",
        name: "Ana Silva",
        designation: "Arquiteta Senior na Studio Arch",
        src: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1888&auto=format&fit=crop",
    },
    {
        quote:
            "A qualidade 4K é impressionante. Paramos de usar nossa renderfarm interna porque o custo-benefício aqui é muito superior.",
        name: "Carlos Mendes",
        designation: "Diretor de Arte na Vixel",
        src: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=2070&auto=format&fit=crop",
    },
    {
        quote:
            "Interface limpa e direta. Meus estagiários aprenderam a usar em menos de 1 minuto. A biblioteca de estilos é um salva-vidas.",
        name: "Isabella Rossi",
        designation: "Designer de Interiores",
        src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1888&auto=format&fit=crop",
    },
    {
        quote:
            "O suporte é fantástico e a ferramenta está sempre evoluindo. É raro ver uma plataforma que ouve tanto os usuários.",
        name: "Flávio Cardoso",
        designation: "Visualizador 3D Freelancer",
        src: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=1887&auto=format&fit=crop",
    },
    {
        quote:
            "Reduzimos nosso tempo de entrega em 40%. O retorno sobre o investimento foi imediato logo no primeiro projeto grande.",
        name: "Fernanda Costa",
        designation: "Sócia na Costa & Arquitetos",
        src: "https://images.unsplash.com/photo-1557053910-d9eadeed1c58?q=80&w=1887&auto=format&fit=crop",
    },
];

export const Testimonials = ({ autoplay = true }: { autoplay?: boolean }) => {
    const [active, setActive] = useState(0);

    const handleNext = useCallback(() => {
        setActive((prev) => (prev + 1) % testimonials.length);
    }, []);

    const handlePrev = () => {
        setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    useEffect(() => {
        if (!autoplay) return;
        const interval = setInterval(handleNext, 6000);
        return () => clearInterval(interval);
    }, [autoplay, handleNext]);

    const isActive = (index: number) => index === active;
    const randomRotate = () => `${Math.floor(Math.random() * 10) - 5}deg`;

    return (
        <section className="py-24 bg-[#F2F2F2] overflow-hidden relative">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#B6B09F]/50 to-transparent" />

            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="mb-20 text-center">
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4">
                        O que dizem <span className="text-[#B6B09F]">os Experts</span>
                    </h2>
                    <p className="text-[#B6B09F] font-black uppercase tracking-widest text-[10px] md:text-xs">
                        Junte-se a mais de 10.000 profissionais
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
                    {/* Image Section */}
                    <div className="relative h-[400px] w-full flex items-center justify-center">
                        <AnimatePresence>
                            {testimonials.map((testimonial, index) => (
                                <motion.div
                                    key={testimonial.src}
                                    initial={{ opacity: 0, scale: 0.9, y: 20, rotate: randomRotate() }}
                                    animate={{
                                        opacity: isActive(index) ? 1 : 0.7,
                                        scale: isActive(index) ? 1 : 0.95,
                                        y: isActive(index) ? 0 : 10,
                                        zIndex: isActive(index) ? 10 : 0,
                                        rotate: isActive(index) ? '0deg' : randomRotate(),
                                    }}
                                    exit={{ opacity: 0, scale: 0.9, y: -20 }}
                                    transition={{ duration: 0.4, ease: "easeInOut" }}
                                    className="absolute max-w-sm w-full"
                                >
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-black rounded-[30px] rotate-2 opacity-10 group-hover:rotate-3 transition-transform duration-500" />
                                        <img
                                            src={testimonial.src}
                                            alt={testimonial.name}
                                            className="relative z-10 w-full h-auto aspect-square object-cover rounded-[25px] border-4 border-[#EAE4D5] shadow-2xl"
                                            draggable={false}
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Text Section */}
                    <div className="flex flex-col justify-center relative z-10">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={active}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-8"
                            >
                                <div>
                                    <div className="flex space-x-1 mb-6">
                                        {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-5 h-5 fill-black text-black" />)}
                                    </div>
                                    <h3 className="text-xl md:text-3xl font-bold leading-relaxed tracking-tight text-neutral-800 mb-8 italic">
                                        "{testimonials[active].quote}"
                                    </h3>
                                    <div>
                                        <p className="text-lg font-bold uppercase tracking-wide">{testimonials[active].name}</p>
                                        <p className="text-[#B6B09F] font-bold uppercase tracking-widest text-[10px] mt-1">
                                            {testimonials[active].designation}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        <div className="flex gap-4 pt-12">
                            <button
                                onClick={handlePrev}
                                className="group flex h-14 w-14 items-center justify-center rounded-full border border-black/10 hover:bg-black hover:text-white transition-all bg-white"
                                aria-label="Previous"
                            >
                                <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={handleNext}
                                className="group flex h-14 w-14 items-center justify-center rounded-full border border-black/10 hover:bg-black hover:text-white transition-all bg-white"
                                aria-label="Next"
                            >
                                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
