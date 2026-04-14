import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Sparkles, MousePointerClick, Clock, ShieldCheck, Image as ImageIcon } from 'lucide-react';

const features = [
    {
        icon: <Zap className="w-6 h-6 text-amber-500" />,
        title: "Velocidade Absurda",
        description: "Enquanto um render tradicional leva horas, nossa IA entrega resultados em segundos. Ganhe tempo para o que importa."
    },
    {
        icon: <Sparkles className="w-6 h-6 text-emerald-500" />,
        title: "Qualidade Fotorealista",
        description: "Iluminação perfeita, texturas reais e reflexos precisos. Nível V-Ray sem precisar configurar nada."
    },
    {
        icon: <MousePointerClick className="w-6 h-6 text-blue-500" />,
        title: "Zero Curva de Aprendizado",
        description: "Esqueça configurações complexas. Se você sabe subir uma imagem, você sabe usar o Render XYZ."
    },
    {
        icon: <Clock className="w-6 h-6 text-purple-500" />,
        title: "Iteração em Tempo Real",
        description: "Teste 10 variações de materiais no tempo que levaria para configurar uma única cena no Lumion."
    },
    {
        icon: <ImageIcon className="w-6 h-6 text-rose-500" />,
        title: "Upscaling 4K",
        description: "Gere em baixa resolução para testar e finalize em 4K Ultra HD para impressionar seu cliente."
    },
    {
        icon: <ShieldCheck className="w-6 h-6 text-indigo-500" />,
        title: "100% Seu",
        description: "Todos os direitos comerciais das imagens geradas são seus. Use em portfólios, apresentações e vendas."
    }
];

export const Features = () => {
    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <span className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4 block">Porque escolher o Render XYZ</span>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-6 text-neutral-900 font-sans">
                        Deixe a tecnologia trabalhar <br className="hidden md:block" />
                        <span className="text-neutral-500">enquanto você cria</span>
                    </h2>
                    <p className="text-lg text-neutral-600 leading-relaxed">
                        A primeira ferramenta feita para arquitetos que valorizam seu tempo.
                        Eliminamos a complexidade técnica para você focar puramente no design.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1, duration: 0.5 }}
                            className="group p-8 rounded-3xl border border-neutral-200 bg-neutral-50 hover:bg-white hover:border-neutral-300 hover:shadow-xl transition-all duration-300"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-white border border-neutral-100 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-neutral-900 tracking-tight">{feature.title}</h3>
                            <p className="text-neutral-600 leading-relaxed text-sm font-medium">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
