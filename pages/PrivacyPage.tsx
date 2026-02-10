import React from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PrivacyPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#F2F2F2] p-4 md:p-8 font-sans">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate('/')}
                    className="mb-8 flex items-center text-sm font-bold text-gray-500 hover:text-black transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                </button>

                <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden p-8 md:p-12 border border-[#B6B09F]/20">
                    <div className="flex items-center space-x-4 mb-10">
                        <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Política de Privacidade</h1>
                    </div>

                    <div className="prose prose-zinc max-w-none text-gray-600 space-y-6">
                        <p className="font-bold">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

                        <section>
                            <h3 className="text-black font-black uppercase tracking-wide text-lg mb-3">1. Coleta de Dados</h3>
                            <p>Coletamos apenas as informações necessárias para operar nosso serviço, incluindo nome, e-mail e dados de uso da plataforma. Não armazenamos informações de cartão de crédito em nossos servidores.</p>
                        </section>

                        <section>
                            <h3 className="text-black font-black uppercase tracking-wide text-lg mb-3">2. Uso das Informações</h3>
                            <p>Utilizamos seus dados para fornecer, manter e melhorar nossos serviços, processar transações e enviar comunicações relacionadas à sua conta.</p>
                        </section>

                        <section>
                            <h3 className="text-black font-black uppercase tracking-wide text-lg mb-3">3. Compartilhamento de Dados</h3>
                            <p>Não vendemos ou alugamos seus dados pessoais para terceiros. Compartilhamos informações apenas com prestadores de serviços confiáveis (como processadores de pagamento) necessários para a operação do negócio.</p>
                        </section>

                        <section>
                            <h3 className="text-black font-black uppercase tracking-wide text-lg mb-3">4. Segurança</h3>
                            <p>Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados contra acesso não autorizado, alteração ou destruição.</p>
                        </section>

                        <section>
                            <h3 className="text-black font-black uppercase tracking-wide text-lg mb-3">5. Seus Direitos (LGPD)</h3>
                            <p>Você tem o direito de acessar, corrigir ou solicitar a exclusão de seus dados pessoais a qualquer momento. Entre em contato conosco para exercer esses direitos.</p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};
