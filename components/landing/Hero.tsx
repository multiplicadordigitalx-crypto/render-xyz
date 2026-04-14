import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedGridPattern } from "@/components/ui/AnimatedGridPattern";
import { cn } from "@/lib/utils";

interface HeroProps {
    onStartNow: () => void;
    onSeeInAction: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartNow, onSeeInAction }) => {
    const [titleNumber, setTitleNumber] = useState(0);
    const titles = useMemo(
        () => ["qualidade", "fidelidade", "rapidez", "realismo", "precisão"],
        []
    );

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (titleNumber === titles.length - 1) {
                setTitleNumber(0);
            } else {
                setTitleNumber(titleNumber + 1);
            }
        }, 2000);
        return () => clearTimeout(timeoutId);
    }, [titleNumber, titles]);

    return (
        <section className="relative w-full pt-32 md:pt-48 pb-20 md:pb-32 overflow-hidden">
            <div className="absolute inset-0 w-full h-full bg-white z-0 pointer-events-none" />

            <AnimatedGridPattern
                numSquares={30}
                maxOpacity={0.1}
                duration={3}
                repeatDelay={1}
                className={cn(
                    "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
                    "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12"
                )}
            />

            <div className="relative z-30 container mx-auto px-4">
                <div className="flex gap-8 py-10 lg:py-20 items-center justify-center flex-col">
                    <div>
                        <div className="inline-flex items-center bg-neutral-100 border border-neutral-200 px-4 md:px-6 py-2 rounded-full cursor-default shadow-sm hover:bg-neutral-200 transition-colors">
                            <img
                                src="https://flagcdn.com/w40/br.png"
                                alt="Brasil"
                                className="w-4 h-4 rounded-full mr-3 object-cover shadow-sm"
                            />
                            <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-foreground">Desenvolvido para Brasileiros</span>
                            <MoveRight className="w-4 h-4 ml-2 opacity-50" />
                        </div>
                    </div>
                    <div className="flex gap-4 flex-col items-center">
                        <h1 className="text-4xl md:text-7xl max-w-4xl tracking-tighter text-center font-regular leading-[1.1] md:leading-[1.1] font-sans">
                            <span className="text-foreground">Renderize imagens com</span>
                            <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1 min-h-[1.2em]">
                                &nbsp;
                                {titles.map((title, index) => (
                                    <motion.span
                                        key={index}
                                        className="absolute font-semibold bg-clip-text text-transparent bg-gradient-to-r from-neutral-800 via-neutral-600 to-neutral-800"
                                        initial={{ opacity: 0, y: "-100%" }}
                                        transition={{ type: "spring", stiffness: 50 }}
                                        animate={
                                            titleNumber === index
                                                ? {
                                                    y: 0,
                                                    opacity: 1,
                                                }
                                                : {
                                                    y: titleNumber > index ? "-150%" : "150%",
                                                    opacity: 0,
                                                }
                                        }
                                    >
                                        {title}
                                    </motion.span>
                                ))}
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl leading-relaxed tracking-tight text-neutral-600 max-w-2xl text-center font-medium">
                            Clientes estão deixando de fazer renders manuais e substituindo com o lançamento do RenderXYZ, o único capaz de entregar renders realistas para arquitetos, engenheiros e designers.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mt-4">
                        <Button
                            size="lg"
                            className="gap-4 text-white bg-black hover:bg-black/90 rounded-full h-14 px-8 text-base font-bold tracking-wide shadow-xl"
                            onClick={onStartNow}
                        >
                            Começar Agora <MoveRight className="w-4 h-4" />
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="gap-4 border-neutral-300 hover:bg-neutral-100 rounded-full h-14 px-8 text-base font-bold tracking-wide"
                            onClick={onSeeInAction} // Changed to use the prop
                        >
                            Veja em Ação <PlayCircle className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
