import React from 'react';
import { BeforeAfterSlider } from '../BeforeAfterSlider';
import { motion } from 'framer-motion';

export const ComparisonSection = () => {
    return (
        <section className="py-24 bg-neutral-900 text-white overflow-hidden" id="demo">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    {/* Text / Context */}
                    <div className="lg:w-1/3">
                        <div className="inline-flex items-center bg-white/10 border border-white/20 px-4 py-2 rounded-full mb-8">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white">Resultados Reais</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-6 leading-[1.1] font-sans">
                            Não é mágica<br />
                            É <span className="text-neutral-500">Tecnologia</span>
                        </h2>
                        <p className="text-lg text-neutral-400 leading-relaxed mb-8">
                            Veja como um SketchUp básico se transforma em uma imagem de revista em segundos.
                            Sem pós-produção no Photoshop, sem horas de espera.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-start">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-4 mt-1 font-bold text-sm">1</div>
                                <div>
                                    <h4 className="font-bold text-lg mb-1">Upload do Modelo</h4>
                                    <p className="text-neutral-500 text-sm">Arraste seu print do SketchUp, Revit ou CAD.</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-4 mt-1 font-bold text-sm">2</div>
                                <div>
                                    <h4 className="font-bold text-lg mb-1">Escolha o Estilo</h4>
                                    <p className="text-neutral-500 text-sm">Realista, Artístico, Minimalista...</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center mr-4 mt-1 font-bold text-sm text-black">3</div>
                                <div>
                                    <h4 className="font-bold text-lg mb-1 text-white">Pronto!</h4>
                                    <p className="text-neutral-500 text-sm">Baixe sua imagem em 4K.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Slider */}
                    <div className="lg:w-2/3 w-full">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
                        >
                            <BeforeAfterSlider
                                before="/assets/projeto-sem-render.webp"
                                after="/assets/renderxyz-noite.png"
                                className="w-full h-full"
                            />

                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 pointer-events-none">
                                <p className="text-[10px] uppercase tracking-widest font-bold">Arraste para comparar</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};
