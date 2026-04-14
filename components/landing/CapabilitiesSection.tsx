import React from 'react';
import { motion } from 'framer-motion';
import { Layers, Wand2, PenTool } from 'lucide-react';
import { cn } from '@/lib/utils';

const capabilities = [
    {
        title: "Render para interiores e exteriores",
        description: "Simples, adicione o seu 3D, diga para a IA se é interior ou exterior, clique em gerar e aguarde 30 segundos. Esses vão ser os resultados que o Render XYZ vai te entregar.",
        icon: <Layers className="w-8 h-8 text-neutral-900" />,
        image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop", // Modern interior
        delay: 0.1
    },
    {
        title: "Melhorar render",
        description: "Adicione um render que não ficou tão bom, pode ser do Lumion, Promob, Enscape, Vray, Unreal, D5 Render ou qualquer outro programa que você use, o Render XYZ vai fazer ajustes de textura, iluminação e melhoria nos blocos visando melhorar a imagem, mantendo a fidelidade do projeto.",
        icon: <Wand2 className="w-8 h-8 text-neutral-900" />,
        image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=2070&auto=format&fit=crop", // Enhanced look
        delay: 0.2
    },
    {
        title: "Render a partir de traços",
        description: "Transforme um esboço ou rascunho do seu projeto em realidade com esta ferramenta poderosa. O Render XYZ criará imagens realistas do seu ambiente ideal em poucos segundos.",
        icon: <PenTool className="w-8 h-8 text-neutral-900" />,
        image: "/assets/sketch-to-render.jpg", // Sketchy / Architectural
        delay: 0.3
    }
];

export const CapabilitiesSection = () => {
    return (
        <section id="how-it-works" className="py-24 bg-white relative overflow-hidden">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="mb-20 text-center max-w-3xl mx-auto">
                    <span className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4 block">Funcionalidades</span>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-neutral-900 font-sans mb-6">
                        Tudo que você precisa <br />
                        <span className="text-neutral-400">em um só lugar</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {capabilities.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: item.delay, duration: 0.5 }}
                            className="group relative bg-neutral-50 rounded-3xl overflow-hidden border border-neutral-200 hover:border-neutral-300 transition-all duration-300 hover:shadow-xl flex flex-col h-full"
                        >
                            {/* Image Area */}
                            <div className="relative h-64 overflow-hidden">
                                <div className="absolute inset-0 bg-neutral-900/10 group-hover:bg-neutral-900/0 transition-colors z-10" />
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-sm z-20">
                                    {item.icon}
                                </div>
                            </div>

                            {/* Content Area */}
                            <div className="p-8 flex-1 flex flex-col">
                                <h3 className="text-xl font-bold text-neutral-900 mb-4 font-sans tracking-tight">
                                    {item.title}
                                </h3>
                                <p className="text-neutral-600 leading-relaxed text-sm font-medium flex-1">
                                    {item.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
