import React, { useEffect, useState } from 'react';
import { ArrowLeft, Grid, ZoomIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { PortfolioItem } from '../types';

export const PortfolioPage: React.FC = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState<PortfolioItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        const fetchPortfolio = async () => {
            try {
                const q = query(collection(db, 'portfolio'), orderBy('createdAt', 'desc'));
                const snapshot = await getDocs(q);
                const portfolioData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as PortfolioItem[];
                setItems(portfolioData);
            } catch (error) {
                console.error("Error fetching portfolio:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPortfolio();
    }, []);

    return (
        <div className="min-h-screen bg-[#F2F2F2] p-4 md:p-8 font-sans">
            <button
                onClick={() => navigate('/')}
                className="mb-8 flex items-center text-sm font-bold text-gray-500 hover:text-black transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
            </button>

            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <span className="inline-block px-3 py-1 rounded-full bg-black/5 text-[10px] font-black uppercase tracking-widest text-[#7A756A]">
                        Nossos Trabalhos
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
                        Portfólio <span className="text-[#7A756A]">Render XYZ</span>
                    </h1>
                    <p className="max-w-xl mx-auto text-sm text-[#7A756A] font-medium leading-relaxed">
                        Explore uma seleção de imagens geradas por nossa inteligência artificial para arquitetos e designers.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-12 h-12 border-4 border-[#B6B09F]/30 border-t-black rounded-full animate-spin" />
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-20 opacity-40">
                        <Grid className="w-16 h-16 mx-auto mb-4 text-[#7A756A]" />
                        <p className="font-black uppercase tracking-widest text-xs text-[#7A756A]">Em breve</p>
                    </div>
                ) : (
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="break-inside-avoid relative group rounded-[30px] overflow-hidden cursor-zoom-in shadow-sm hover:shadow-2xl transition-all duration-500"
                                onClick={() => setSelectedImage(item.imageUrl)}
                            >
                                <img
                                    src={item.imageUrl}
                                    alt={item.title}
                                    className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full flex items-center shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                        <ZoomIn className="w-4 h-4 mr-2" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Ampliar</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Lightbox */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in"
                    onClick={() => setSelectedImage(null)}
                >
                    <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">
                        <ArrowLeft className="w-8 h-8 rotate-180" /> {/* Close icon visual metaphor */}
                    </button>
                    <img
                        src={selectedImage}
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
};
