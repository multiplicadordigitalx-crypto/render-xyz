
import React, { useState } from 'react';
import { Upload, Wand2, Download, RotateCcw, AlertCircle, CheckCircle2, Coins, ShieldCheck, Lock, Maximize2, Image as ImageIcon, Zap, Layers } from 'lucide-react';
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
  { label: '2K', cost: 2 },
  { label: '4K', cost: 3 },
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
      toast.error('Erro na renderização', { id: loadingToast });
      const errorMsg = err.message || "";
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

  const downloadResult = () => {
    if (result) {
      const link = document.createElement('a');
      link.href = result;
      link.download = `renderxyz-${style.toLowerCase()}.png`;
      link.click();
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-[#EAE4D5] rounded-[20px] md:rounded-[30px] overflow-hidden border border-[#B6B09F]/30 shadow-2xl relative">
      {/* Sidebar Controls */}
      <div className="w-full md:w-80 h-[50%] md:h-full bg-white/50 backdrop-blur-sm border-t md:border-t-0 md:border-r border-[#B6B09F]/20 flex flex-col p-4 md:p-6 overflow-y-auto custom-scrollbar z-10 order-2 md:order-1">
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

        <div className="mt-auto">
          {mode === 'single' && (
            <>
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
                  className="w-full py-4 rounded-2xl border-2 border-dashed border-[#B6B09F]/40 flex flex-col items-center justify-center cursor-pointer hover:border-black hover:bg-white/60 transition-all group mb-4"
                >
                  <Upload className="w-5 h-5 text-[#7A756A] group-hover:text-black mb-2" />
                  <span className="text-[9px] font-black uppercase text-[#7A756A] tracking-widest">Carregar Projeto</span>
                </label>
              ) : (
                <button
                  onClick={handleGenerate}
                  disabled={isRendering || credits <= 0}
                  className={`w-full py-5 rounded-2xl flex items-center justify-center font-black text-xs uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all ${isRendering || credits <= 0 ? 'bg-zinc-300 text-zinc-500 cursor-not-allowed' : 'bg-black text-white'
                    }`}
                >
                  {isRendering ? (
                    <span className="animate-pulse">Renderizando...</span>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Renderizar Agora
                    </>
                  )}
                </button>
              )}
            </>
          )}

          {shouldShowWatermark(userPlan) && (
            <div className="mt-4 text-center">
              <p className="text-[8px] font-bold uppercase tracking-widest text-[#7A756A] opacity-60">Plano Grátis • Com marca d'água</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 bg-[#dcd7c9] relative flex flex-col">
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
          <div className="absolute inset-0 flex items-center justify-center p-8">
            {result ? (
              <div className="relative w-full h-full flex flex-col">
                <div className="flex-1 flex items-center justify-center overflow-hidden">
                  <img src={result} alt="Resultado" className="max-w-full max-h-full object-contain shadow-2xl rounded-lg" />
                </div>
                <div className="mt-6 flex justify-center gap-4">
                  <button onClick={() => { setResult(null); setImage(null) }} className="px-6 py-3 bg-white text-black rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-gray-50 transition-all">Novo Render</button>
                  <button onClick={downloadResult} className="px-8 py-3 bg-black text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg flex items-center hover:bg-neutral-800 transition-all">
                    <Download className="w-4 h-4 mr-2" /> Download
                  </button>
                </div>
              </div>
            ) : image ? (
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                <img src={image} alt="Preview" className="max-w-full max-h-full object-contain opacity-50 blur-sm rounded-lg" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <label htmlFor="image-upload" className="bg-black/80 text-white px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest cursor-pointer hover:bg-black transition-all backdrop-blur-md flex items-center">
                    <RotateCcw className="w-3 h-3 mr-2" /> Trocar Imagem
                  </label>
                </div>
              </div>
            ) : (
              <div className="text-center text-[#7A756A] opacity-40">
                <ImageIcon className="w-24 h-24 mx-auto mb-4" />
                <p className="text-sm font-black uppercase tracking-[0.2em]">Área de Trabalho Vazia</p>
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
    </div>
  );
};
