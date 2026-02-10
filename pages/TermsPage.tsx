import React from 'react';
import { ArrowLeft, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TermsPage: React.FC = () => {
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
                            <FileText className="w-6 h-6" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Termos de Uso</h1>
                    </div>

                    <div className="prose prose-zinc max-w-none text-gray-600 space-y-6">
                        <p className="font-bold">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

                        <section>
                            <h3 className="text-black font-black uppercase tracking-wide text-lg mb-3">1. Aceitação dos Termos</h3>
                            <p>Ao acessar e utilizar a plataforma Render XYZ, você concorda em cumprir e estar vinculado aos seguintes termos e condições de uso.</p>
                        </section>

                        <section>
                            <h3 className="text-black font-black uppercase tracking-wide text-lg mb-3">2. Serviços Oferecidos</h3>
                            <p>A Render XYZ fornece serviços de renderização de imagens arquitetônicas assistidos por Inteligência Artificial. Os resultados podem variar e dependem da qualidade dos inputs fornecidos pelo usuário.</p>
                        </section>

                        <section>
                            <h3 className="text-black font-black uppercase tracking-wide text-lg mb-3">3. Créditos e Pagamentos</h3>
                            <p>O uso da plataforma é baseado em créditos pré-pagos. Os créditos adquiridos não são reembolsáveis, exceto conforme exigido por lei. Os preços estão sujeitos a alterações sem aviso prévio.</p>
                        </section>

                        <section>
                            <h3 className="text-black font-black uppercase tracking-wide text-lg mb-3">4. Propriedade Intelectual</h3>
                            <p>Você mantém os direitos sobre as imagens originais enviadas. A Render XYZ concede a você uma licença perpétua e irrevogável para usar as imagens geradas para qualquer finalidade, comercial ou não.</p>
                        </section>

                        <section>
                            <h3 className="text-black font-black uppercase tracking-wide text-lg mb-3">5. Limitação de Responsabilidade</h3>
                            <p>A Render XYZ não se responsabiliza por danos diretos, indiretos, incidentais ou consequentes resultantes do uso ou da incapacidade de usar nossos serviços.</p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};
