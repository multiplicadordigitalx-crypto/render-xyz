
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Wand2, Download, RotateCcw, AlertCircle, CheckCircle2, Coins, ShieldCheck, Lock, Maximize2, Image as ImageIcon, Zap, Layers, ShoppingCart } from 'lucide-react';
import { RenderStyle, RenderResolution, UserPlan } from '../types';
import { renderImage } from '../services/geminiService';
import { storageService } from '../services/storageService';
import { toast } from 'react-hot-toast';
import { BatchProcessor } from './BatchProcessor';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const STYLES: RenderStyle[] = ['Dia', 'Noite', 'Fim de Tarde', 'Nublado'];

const RESOLUTIONS: { label: RenderResolution; cost: number }[] = [
  { label: '1K', cost: 1 },
  { label: '2K', cost: 3 },
  { label: '4K', cost: 5 },
];

interface RenderToolProps {
  onRenderComplete: (url: string, style: RenderStyle, cost: number) => void;
  credits: number;
  userPlan: UserPlan;
  onKeyReset: () => void;
  onUpgrade?: () => void;
}

const shouldShowWatermark = (userPlan: UserPlan): boolean => {
  return userPlan === 'free';
};

export const RenderTool: React.FC<RenderToolProps> = ({ onRenderComplete, credits, userPlan, onKeyReset, onUpgrade }) => {
  const [mode, setMode] = useState<'single' | 'batch'>('single');
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [style, setStyle] = useState<RenderStyle>('Dia');
  const [resolution, setResolution] = useState<RenderResolution>('1K');
  const [isRendering, setIsRendering] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const navigate = useNavigate();

  // Helper to convert URL to Base64 using proxy to avoid CORS
  const urlToBase64 = async (url: string): Promise<string> => {
    // Use the local proxy if running locally or the deployed one
    const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`;

    try {
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error('Falha no proxy de imagem');

      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.error("Proxy failed, trying direct fetch (fallback)", e);
      // Fallback for local development if proxy isn't set up
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
  };

  // Listen for external refine requests
  React.useEffect(() => {
    const handleLoadImage = async (e: CustomEvent) => {
      try {
        const loadingToast = toast.loading('Carregando imagem...');
        const base64 = await urlToBase64(e.detail);
        setImage(base64);
        setMode('single');
        setResult(null);
        toast.success('Imagem carregada!', { id: loadingToast });
      } catch (err) {
        toast.error('Erro ao carregar imagem para refino.');
        console.error(err);
      }
    };
    window.addEventListener('load-image-for-refine' as any, handleLoadImage as any);
    return () => window.removeEventListener('load-image-for-refine' as any, handleLoadImage as any);
  }, []);

  const [fileName, setFileName] = useState<string>('');

  const selectedRes = RESOLUTIONS.find(r => r.label === resolution) || RESOLUTIONS[0];

  const processBatchImage = async (file: File) => {
    if (credits < selectedRes.cost) {
      throw new Error(`Créditos insuficientes (${selectedRes.cost} necessários)`);
    }
    const base64 = await fileToBase64(file);
    const type = file.type;
    const rendered = await renderImage(base64, type, style, resolution);
    const response = await fetch(rendered);
    const blob = await response.blob();
    const filename = `render-${Date.now()}-${Math.random().toString(36).substr(2, 5)}.png`;
    const uploadFile = new File([blob], filename, { type: "image/png" });
    const publicUrl = await storageService.uploadImage(uploadFile, "renders");
    onRenderComplete(publicUrl, style, selectedRes.cost);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("Máximo 10MB");
        return;
      }
      setMimeType(file.type);
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!image) return;
    if (credits < selectedRes.cost) {
      toast.error(`Créditos insuficientes (${selectedRes.cost} necessários)`);
      return;
    }

    setIsRendering(true);
    setError(null);
    const loadingToast = toast.loading('IA Trabalhando...', {
      style: { background: '#000', color: '#fff' }
    });

    try {
      const rendered = await renderImage(image, mimeType, style, resolution);
      const response = await fetch(rendered);
      const blob = await response.blob();
      const filename = `render-${Date.now()}.png`;
      const file = new File([blob], filename, { type: "image/png" });
      const publicUrl = await storageService.uploadImage(file, "renders");

      setResult(publicUrl);
      onRenderComplete(publicUrl, style, selectedRes.cost);
      toast.success('Pronto!', { id: loadingToast });
    } catch (err: any) {
      const errorMsg = err.message || "Erro desconhecido";
      toast.error(`Erro: ${errorMsg}`, { id: loadingToast, duration: 5000 });
      if (errorMsg.includes("Requested entity was not found")) {
        setError("Chave inválida. Selecione novamente.");
        onKeyReset();
      } else {
        setError("Erro ao processar imagem.");
      }
    } finally {
      setIsRendering(false);
    }
  };

  const downloadResult = async () => {
    if (result) {
      try {
        const loadingToast = toast.loading('Preparando download...');
        const response = await fetch(result);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `renderxyz-${style.toLowerCase()}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success('Download concluído!', { id: loadingToast });
      } catch (err) {
        console.error("Erro no download:", err);
        toast.error("Falha ao baixar imagem.");
      }
    }
  };

  const handleRefine = async () => {
    if (result) {
      try {
        const loadingToast = toast.loading('Preparando para refinar...');
        const base64 = await urlToBase64(result);
        setImage(base64);
        setResult(null);
        toast.success('Pronto para refinar!', { id: loadingToast });
      } catch (err) {
        toast.error('Erro ao preparar imagem.');
      }
    }
  };

  return (
    <div id="render-tool-root" className="flex flex-col md:flex-row h-auto md:h-full w-full bg-[#EAE4D5] rounded-[20px] md:rounded-[30px] overflow-hidden border border-[#B6B09F]/30 shadow-2xl relative">
      {/* Sidebar Controls */}
      <div className="w-full md:w-80 h-auto md:h-full bg-white/50 backdrop-blur-sm border-t md:border-t-0 md:border-r border-[#B6B09F]/20 flex flex-col p-4 md:p-6 md:overflow-y-auto custom-scrollbar z-10 shrink-0">
        <div className="mb-8">
          <h3 className="text-xs font-black uppercase tracking-widest text-[#7A756A] mb-4 flex items-center">
            <Layers className="w-4 h-4 mr-2" />
            Modo de Trabalho
          </h3>
          <div className="flex bg-[#F2F2F2] rounded-xl p-1">
            <button
              onClick={() => setMode('single')}
              className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${mode === 'single' ? 'bg-black text-white shadow-md' : 'text-[#7A756A] hover:bg-black/5'}`}
            >
              Única
            </button>
            <button
              onClick={() => setMode('batch')}
              className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${mode === 'batch' ? 'bg-black text-white shadow-md' : 'text-[#7A756A] hover:bg-black/5'}`}
            >
              Lote
            </button>
          </div>
        </div>

        <div className="mb-8 space-y-6">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-[#000] mb-3 flex items-center">
              <Zap className="w-3 h-3 mr-2" />
              Estilo Atmosférico
            </label>
            <div className="grid grid-cols-2 gap-2">
              {STYLES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={`px-3 py-3 rounded-xl text-[9px] font-black transition-all uppercase tracking-widest border text-left ${style === s
                    ? 'bg-black text-white border-black shadow-lg scale-105'
                    : 'bg-white text-[#7A756A] border-transparent hover:border-[#B6B09F]/30 hover:bg-white/80'
                    }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-[#000] mb-3 flex items-center">
              <Maximize2 className="w-3 h-3 mr-2" />
              Resolução de Saída
            </label>
            <div className="space-y-2">
              {RESOLUTIONS.map((r) => (
                <button
                  key={r.label}
                  onClick={() => setResolution(r.label)}
                  className={`w-full px-4 py-3 rounded-xl text-[9px] font-black transition-all uppercase tracking-widest border flex justify-between items-center ${resolution === r.label
                    ? 'bg-black text-white border-black shadow-lg scale-105'
                    : 'bg-white text-[#7A756A] border-transparent hover:border-[#B6B09F]/30 hover:bg-white/80'
                    }`}
                >
                  <span>{r.label}</span>
                  <span className="opacity-60">{r.cost} {r.cost === 1 ? 'crédito' : 'créditos'}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="w-full md:flex-1 bg-[#dcd7c9] relative flex flex-col min-h-[400px] md:h-auto shrink-0 overflow-y-auto">
        {mode === 'batch' ? (
          <div className="absolute inset-0 p-8 overflow-y-auto">
            <BatchProcessor
              onRender={processBatchImage}
              isProcessing={isRendering}
              style={style}
              credits={credits}
              costPerRender={selectedRes.cost}
            />
          </div>
        ) : (
          <div className={`absolute inset-0 p-8 ${result ? 'flex items-center justify-center' : 'overflow-y-auto'}`}>
            {result ? (
              <div className="relative w-full h-full flex flex-col">
                <div className="flex-1 flex items-center justify-center overflow-hidden cursor-zoom-in group" onClick={() => setIsLightboxOpen(true)}>
                  <img src={result} alt="Resultado" className="max-w-full max-h-full object-contain shadow-2xl rounded-lg transition-transform duration-300 group-hover:scale-[1.02]" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
                    <Maximize2 className="text-white opacity-0 group-hover:opacity-100 w-12 h-12 transition-opacity" />
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap justify-center gap-4">
                  <button onClick={() => { setResult(null); setImage(null); setFileName(''); }} className="px-6 py-3 bg-white text-black rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-gray-50 transition-all border border-black/5">Novo Render</button>
                  <button onClick={handleRefine} className="px-6 py-3 bg-amber-500 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-amber-600 transition-all flex items-center">
                    <Wand2 className="w-4 h-4 mr-2" /> Refinar Render
                  </button>
                  <button onClick={downloadResult} className="px-8 py-3 bg-black text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg flex items-center hover:bg-neutral-800 transition-all">
                    <Download className="w-4 h-4 mr-2" /> Download
                  </button>
                </div>
              </div>
            ) : (
              // Single Mode Preparation UI (Matches Batch UI)
              <div className="w-full max-w-2xl mx-auto mb-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-black uppercase tracking-widest text-[#7A756A]">Renderização Única</h3>
                  </div>
                </div>

                {/* Cost indicator */}
                <div className={`rounded-xl p-3 mb-4 ${credits < selectedRes.cost ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200'}`}>
                  <div className="flex items-center justify-between">
                    <div className={`flex items-center space-x-2 text-[10px] font-bold uppercase ${credits < selectedRes.cost ? 'text-red-700' : 'text-amber-700'}`}>
                      <Coins className="w-4 h-4" />
                      <span>Custo: {selectedRes.cost} {selectedRes.cost === 1 ? 'crédito' : 'créditos'}</span>
                    </div>
                    {credits < selectedRes.cost && (
                      <div className="flex items-center space-x-3">
                        <span className="text-red-600 text-[10px] font-black uppercase">
                          Faltam {selectedRes.cost - credits} créditos
                        </span>
                        <button
                          onClick={() => navigate('/planos')}
                          className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-red-700 transition-colors flex items-center shadow-sm"
                        >
                          <ShoppingCart className="w-3 h-3 mr-1" />
                          Comprar Agora
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className={`relative border-2 border-dashed rounded-3xl p-8 transition-all duration-300 text-center
                            ${image ? 'border-black bg-white' : 'border-[#B6B09F] hover:border-black hover:bg-white'}
                        `}
                >
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="image-upload"
                    accept="image/*"
                  />

                  {!image ? (
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer space-y-4 py-8 block"
                    >
                      <div className="w-16 h-16 bg-[#F2F2F2] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Upload className="w-8 h-8 text-[#7A756A]" />
                      </div>
                      <div>
                        <p className="text-sm font-black uppercase tracking-widest">Arraste uma imagem</p>
                        <p className="text-[10px] font-bold uppercase text-[#7A756A] mt-2">ou clique para selecionar (JPG, PNG)</p>
                      </div>
                    </label>
                  ) : (
                    // File List Item Style
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center bg-[#F2F2F2] p-3 rounded-xl gap-4">
                          <img src={image} className="w-12 h-12 object-cover rounded-lg bg-white" />
                          <div className="flex-1 text-left overflow-hidden">
                            <p className="text-[10px] font-bold truncate">{fileName || "Imagem Selecionada"}</p>
                            <p className="text-[9px] font-bold uppercase text-[#7A756A]">
                              {isRendering ? 'Renderizando...' : 'Aguardando'}
                            </p>
                          </div>
                          <div className="flex items-center">
                            {isRendering ? (
                              <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                            ) : (
                              <button onClick={() => { setImage(null); setFileName(''); }} className="ml-3 p-1 hover:bg-black/10 rounded-full">
                                <RotateCcw className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4 border-t border-[#B6B09F]/20">
                        <button
                          onClick={handleGenerate}
                          disabled={isRendering || credits < selectedRes.cost}
                          className="flex-1 bg-black text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-800 transition-colors"
                        >
                          {isRendering ? 'Processando...' : `Renderizar Agora (${selectedRes.cost} créditos)`}
                        </button>
                        <button
                          onClick={() => { setImage(null); setFileName(''); }}
                          disabled={isRendering}
                          className="px-6 border-2 border-black/10 hover:border-black rounded-xl font-black text-xs uppercase tracking-widest disabled:opacity-30"
                        >
                          Limpar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {isRendering && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center z-50 text-white">
                <div className="w-20 h-20 border-4 border-white/20 border-t-white rounded-full animate-spin mb-6" />
                <p className="font-black text-2xl uppercase tracking-widest animate-pulse">Renderizando</p>
                <p className="text-xs uppercase tracking-widest mt-2 opacity-70">A mágica está acontecendo...</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lightbox / Expansion */}
      {isLightboxOpen && result && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-12 animate-in fade-in zoom-in duration-300"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div className="absolute top-6 right-6 flex gap-4">
            <button
              onClick={(e) => { e.stopPropagation(); downloadResult(); }}
              className="bg-white/10 hover:bg-white/20 p-4 rounded-full text-white transition-colors"
              title="Download"
            >
              <Download className="w-6 h-6" />
            </button>
            <button
              className="bg-white/10 hover:bg-white/20 p-4 rounded-full text-white transition-colors"
              onClick={() => setIsLightboxOpen(false)}
            >
              <RotateCcw className="w-6 h-6" />
            </button>
          </div>
          <img
            src={result}
            alt="Expanded Render"
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="text-white/50 text-[10px] uppercase tracking-widest mt-6 font-bold">Clique fora para fechar</p>
        </div>
      )}
    </div>
  );
};
