import React, { useState } from 'react';
import { Send, User, Mail, Phone, MessageSquare, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../services/firebase';
import { toast } from 'react-hot-toast';

export const ContactPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Salvar no Firestore (Log/Backup)
            await addDoc(collection(db, "contact_messages"), {
                ...formData,
                timestamp: Date.now(),
                status: 'unread'
            });
            
            // 2. Enviar E-mail via API
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao enviar e-mail.');
            }
            
            setSuccess(true);
            toast.success('Mensagem enviada com sucesso!');
        } catch (error: any) {
            console.error("Erro ao enviar contato:", error);
            toast.error(error.message || 'Erro ao enviar mensagem.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F2F2F2] p-4 md:p-8 flex items-center justify-center">
            <div className="max-w-2xl w-full">
                <button 
                    onClick={() => navigate(-1)} 
                    className="mb-8 flex items-center text-sm font-bold text-neutral-500 hover:text-black transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                </button>

                <div className="bg-white rounded-[35px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                    <div className="p-8 md:p-12">
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl mb-6 shadow-sm">
                                <Send className="w-8 h-8" />
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-black">Fale Conosco</h1>
                            <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest mt-3">
                                Envie sua dúvida ou sugestão e responderemos em breve.
                            </p>
                        </div>

                        {success ? (
                            <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-3xl text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full mb-6">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-black text-emerald-900 uppercase tracking-tight mb-2">Mensagem Recebida!</h3>
                                <p className="text-emerald-700 text-sm font-bold">Nossa equipe entrará em contato o mais rápido possível através do seu e-mail ou telefone.</p>
                                <button 
                                    onClick={() => navigate('/')}
                                    className="mt-8 px-8 py-3 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-colors"
                                >
                                    Voltar ao Início
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest flex items-center">
                                            <User className="w-3 h-3 mr-2" /> Nome Completo
                                        </label>
                                        <input 
                                            type="text" 
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Digite seu nome"
                                            className="w-full bg-[#F2F2F2] border-transparent focus:bg-white focus:border-black rounded-xl p-4 text-sm font-bold transition-all placeholder:font-medium placeholder:text-neutral-400 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest flex items-center">
                                            <Phone className="w-3 h-3 mr-2" /> Telefone / WhatsApp
                                        </label>
                                        <input 
                                            type="tel" 
                                            name="phone"
                                            required
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="(00) 00000-0000"
                                            className="w-full bg-[#F2F2F2] border-transparent focus:bg-white focus:border-black rounded-xl p-4 text-sm font-bold transition-all placeholder:font-medium placeholder:text-neutral-400 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest flex items-center">
                                        <Mail className="w-3 h-3 mr-2" /> E-mail
                                    </label>
                                    <input 
                                        type="email" 
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Seu melhor e-mail"
                                        className="w-full bg-[#F2F2F2] border-transparent focus:bg-white focus:border-black rounded-xl p-4 text-sm font-bold transition-all placeholder:font-medium placeholder:text-neutral-400 outline-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest flex items-center">
                                        <MessageSquare className="w-3 h-3 mr-2" /> Mensagem
                                    </label>
                                    <textarea 
                                        name="message"
                                        required
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder="Como podemos te ajudar hoje?"
                                        rows={5}
                                        className="w-full bg-[#F2F2F2] border-transparent focus:bg-white focus:border-black rounded-xl p-4 text-sm font-bold transition-all placeholder:font-medium placeholder:text-neutral-400 outline-none resize-none"
                                    ></textarea>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="w-full py-5 bg-black text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-xl group"
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            Enviar Mensagem
                                            <Send className="w-4 h-4 ml-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
