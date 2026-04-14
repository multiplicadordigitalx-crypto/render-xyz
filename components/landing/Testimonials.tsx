import React from 'react';
import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1";
import { motion } from "motion/react";

const testimonials = [
    {
        text: "O Render XYZ mudou completamente meu escritório. O que levava 4 horas agora faço em segundos. A qualidade é absurda.",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100&h=100",
        name: "Mariana Costa",
        role: "Arquiteta Sênior",
    },
    {
        text: "Não preciso mais de PC gamer de 20 mil reais. Faço tudo pelo navegador no meu notebook básico. Simplesmente genial.",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100",
        name: "Pedro Alencar",
        role: "Designer de Interiores",
    },
    {
        text: "A facilidade de uso é incrível. Enviei um print do SketchUp e recebi uma imagem fotorealista pronta para o cliente.",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100&h=100",
        name: "Fernanda Lima",
        role: "Estudante de Arquitetura",
    },
    {
        text: "Meus clientes ficam impressionados com a velocidade. Consigo apresentar várias opções de materiais na hora da reunião.",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100&h=100",
        name: "Ricardo Santos",
        role: "Engenheiro Civil",
    },
    {
        text: "O suporte é nota 10 e a ferramenta evolui toda semana. É a melhor assinatura que fiz esse ano pro meu negócio.",
        image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=100&h=100",
        name: "Camila Rocha",
        role: "Visualizadora 3D",
    },
    {
        text: "A qualidade das texturas e iluminação supera muito o que eu conseguia fazer manualmente no Lumion. Recomendo demais.",
        image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=100&h=100",
        name: "Lucas Ferreira",
        role: "Arquiteto",
    },
    {
        text: "Finalmente uma IA que entende de arquitetura brasileira. Os resultados são muito fiéis ao projeto original.",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100",
        name: "Juliana Martins",
        role: "Paisagista",
    },
    {
        text: "O custo-benefício é imbatível. Pagar por crédito faz muito sentido para quem tem fluxo variável de projetos.",
        image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100&h=100",
        name: "André Souza",
        role: "Freelancer 3D",
    },
    {
        text: "Interface limpa, rápida e direta ao ponto. Sem configurações complexas de render. É clicar e pronto.",
        image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=100&h=100",
        name: "Beatriz Oliveira",
        role: "Decoradora",
    },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

export const Testimonials = () => {
    return (
        <section className="bg-background py-24 relative overflow-hidden">
            <div className="container z-10 mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center justify-center max-w-[540px] mx-auto mb-16"
                >
                    <div className="flex justify-center mb-6">
                        <div className="bg-neutral-100 border border-neutral-200 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-neutral-600">Depoimentos</div>
                    </div>

                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-center text-neutral-900 font-sans">
                        O que dizem nossos usuários
                    </h2>
                    <p className="text-center mt-6 text-lg text-neutral-600 leading-relaxed font-sans">
                        Junte-se a milhares de arquitetos e designers que já transformaram seu fluxo de trabalho.
                    </p>
                </motion.div>

                <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
                    <TestimonialsColumn testimonials={firstColumn} duration={15} />
                    <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
                    <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
                </div>
            </div>
        </section>
    );
};
