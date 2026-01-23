
import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface FAQItem {
    q: string;
    a: string;
}

interface FAQProps {
    items: FAQItem[];
}

export const FAQ: React.FC<FAQProps> = ({ items }) => {
    const [activeFaq, setActiveFaq] = useState<number | null>(null);

    return (
        <section className="py-20 md:py-36 px-4 bg-[#F2F2F2]">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl md:text-5xl font-black mb-16 md:mb-20 text-center uppercase tracking-tighter">FAQ Estratégico</h2>
                <div className="space-y-6 md:space-y-8">
                    {items.map((faq, i) => (
                        <div
                            key={i}
                            className="border border-[#B6B09F]/20 rounded-[30px] md:rounded-[40px] overflow-hidden bg-white shadow-sm transition-all hover:border-black"
                        >
                            <button
                                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                                className="w-full flex items-center justify-between p-8 md:p-10 text-left"
                            >
                                <span className="font-black text-black uppercase text-[11px] md:text-[12px] tracking-widest pr-4">{faq.q}</span>
                                <Plus className={`w-5 h-5 shrink-0 transition-transform ${activeFaq === i ? 'rotate-45' : ''}`} />
                            </button>
                            {activeFaq === i && (
                                <div className="px-8 md:px-10 pb-10 text-[#B6B09F] text-[11px] md:text-[12px] font-bold uppercase tracking-widest leading-loose animate-in slide-in-from-top-4">
                                    {faq.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
