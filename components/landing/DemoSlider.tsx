
import React from 'react';
import { BeforeAfterSlider } from '../BeforeAfterSlider';

interface DemoSliderProps {
    showcaseBefore: string;
    showcaseAfter: string;
}

export const DemoSlider: React.FC<DemoSliderProps> = ({ showcaseBefore, showcaseAfter }) => {
    return (
        <section id="demo" className="py-20 md:py-36 px-4 bg-[#EAE4D5]/40">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12 md:mb-24 px-4">
                    <h2 className="text-3xl md:text-5xl font-black mb-4 uppercase tracking-tighter">Comparação Real</h2>
                    <div className="w-16 h-1 bg-black mx-auto mb-6 rounded-full" />
                    <p className="text-[#B6B09F] text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] max-w-xl mx-auto leading-relaxed">
                        Fidelidade extrema preservando cada centímetro da sua geometria
                    </p>
                </div>
                <div className="reveal reveal-zoom">
                    <BeforeAfterSlider before={showcaseBefore} after={showcaseAfter} />
                </div>
            </div>
        </section>
    );
};
