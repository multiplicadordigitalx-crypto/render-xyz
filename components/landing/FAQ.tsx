import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

interface FAQItem {
    q: string;
    a: string;
}

const faqs: FAQItem[] = [
    {
        q: "Qual a diferença para outros renderizadores de mercado?",
        a: "A principal diferença é a simplicidade e a tecnologia. Enquanto softwares tradicionais exigem placas de vídeo potentes, conhecimento técnico avançado e horas de configuração, nossa plataforma utiliza Inteligência Artificial em nuvem. Isso significa que você não precisa de um computador caro e consegue resultados profissionais em segundos, apenas descrevendo o que deseja ou enviando seu modelo básico."
    },
    {
        q: "Como funcionam os créditos?",
        a: "Cada imagem gerada consome 1 crédito. Ao criar sua conta, você ganha 3 créditos gratuitos para testar. Nossos pacotes de créditos não têm validade, ou seja, você pode comprar hoje e usar daqui a um mês ou um ano. Você só paga pelo que realmente usar, sem mensalidades recorrentes."
    },
    {
        q: "Posso usar as imagens comercialmente?",
        a: "Sim, absolutamente. Todas as imagens geradas na plataforma são de sua propriedade intelectual total. Você tem liberdade irrestrita para utilizá-las em apresentações de clientes, portfólio, redes sociais, outdoors ou qualquer outro meio comercial."
    },
    {
        q: "Preciso enviar o arquivo 3D do meu projeto?",
        a: "Não necessariamente. Nossa IA trabalha visualmente. Você pode enviar um 'print' da tela do seu modelador (SketchUp, Revit, etc.), um desenho feito à mão ou apenas descrever textualmente o que deseja. Claro, enviar a imagem base do seu modelo ajuda a IA a manter a fidelidade das formas e proporções do seu projeto."
    },
    {
        q: "E se eu não gostar do resultado?",
        a: "Oferecemos garantia de satisfação de 7 dias na compra de qualquer pacote de créditos. Se sentir que a ferramenta não atende às suas necessidades, devolvemos seu dinheiro integralmente."
    },
    {
        q: "Qual a resolução das imagens?",
        a: "Você pode gerar prévias rápidas e, ao finalizar, fazer o 'upscale' para resolução 4K Ultra HD, garantindo nitidez para impressões em grandes formatos e apresentações em telas de alta definição."
    }
];

export const FAQ = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section className="py-24 bg-white" id="faq">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-16">
                    <span className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4 block">Dúvidas Frequentes</span>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-neutral-900 font-sans">
                        Tudo explicado
                    </h2>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <div
                            key={i}
                            className="border border-neutral-200 rounded-2xl bg-neutral-50 overflow-hidden transition-all duration-300 hover:border-neutral-300"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                className="w-full flex items-center justify-between p-6 text-left"
                            >
                                <span className="font-bold text-neutral-900 text-sm md:text-base pr-8">{faq.q}</span>
                                <div className={`shrink-0 text-neutral-400 transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`}>
                                    {openIndex === i ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                </div>
                            </button>

                            <div
                                className={`grid transition-[grid-template-rows] duration-300 ease-out ${openIndex === i ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                            >
                                <div className="overflow-hidden">
                                    <div className="px-6 pb-6 text-neutral-600 text-sm leading-relaxed">
                                        {faq.a}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
