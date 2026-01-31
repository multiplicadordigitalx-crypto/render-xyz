
import React from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';

interface CTAProps {
    onStartNow: () => void;
}

export const CTA: React.FC<CTAProps> = ({ onStartNow }) => {
    return (
        <section className="py-32 md:py-48 px-4 text-center bg-[#EAE4D5] border-t border-[#B6B09F]/20 relative overflow-hidden">
            <div className="max-w-5xl mx-auto relative z-10">
                <h2 className="text-5xl md:text-[8rem] font-black mb-12 md:mb-16 leading-[1] md:leading-[0.9] tracking-tighter uppercase">
                    Alcance o <br className="hidden md:block" /> Realismo
                </h2>
                <div className="flex flex-col items-center space-y-8">
                    <button
                        onClick={onStartNow}
                        className="bg-black text-white px-12 py-7 md:px-16 md:py-8 rounded-[35px] md:rounded-[45px] font-black text-lg md:text-xl shadow-2xl transition-all flex items-center uppercase tracking-widest"
                    >
                        Criar Conta Agora <ArrowRight className="ml-4 w-6 h-6 md:w-8 md:h-8" />
                    </button>
                    <p className="text-[#7A756A] text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] flex items-center">
                        <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 mr-3" /> Transações Seguras SSL/LGPD
                    </p>
                </div>
            </div>
        </section>
    );
};
