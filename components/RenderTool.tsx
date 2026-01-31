
import React, { useState } from 'react';
import { Upload, Wand2, Download, RotateCcw, AlertCircle, CheckCircle2, Coins, ShieldCheck, Lock } from 'lucide-react';
import { RenderStyle, RenderResolution, UserPlan } from '../types';
import { renderImage } from '../services/geminiService';
import { storageService } from '../services/storageService';
import { toast } from 'react-hot-toast';

const STYLES: RenderStyle[] = ['Dia', 'Noite', 'Fim de Tarde', 'Nublado'];

// Resolution config with plan requirements
const RESOLUTIONS: { label: RenderResolution; cost: number; minPlan: UserPlan | null }[] = [
  { label: '1K', cost: 1, minPlan: null }, // Available to all
  { label: '2K', cost: 2, minPlan: null }, // Available to all (credits or studio+)
  { label: '4K', cost: 4, minPlan: 'elite' }, // Elite only
];

interface RenderToolProps {
  onRenderComplete: (url: string, style: RenderStyle, cost: number) => void;
  credits: number;
  userPlan: UserPlan;
  onKeyReset: () => void;
}

// Helper to check if user can use a resolution
const canUseResolution = (resolution: RenderResolution, userPlan: UserPlan): boolean => {
  if (resolution === '4K') {
    return userPlan === 'elite';
  }
  return true; // 1K and 2K available to everyone
};

// Check if user is on free plan (for watermark)
const shouldShowWatermark = (userPlan: UserPlan): boolean => {
  return userPlan === 'free';
};

export const RenderTool: React.FC<RenderToolProps> = ({ onRenderComplete, credits, userPlan, onKeyReset }) => {
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [style, setStyle] = useState<RenderStyle>('Dia');
  const [resolution, setResolution] = useState<RenderResolution>('1K');
  const [isRendering, setIsRendering] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedRes = RESOLUTIONS.find(r => r.label === resolution) || RESOLUTIONS[0];

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

    // Check resolution access
    if (!canUseResolution(resolution, userPlan)) {
      toast.error('Resolução 4K disponível apenas no plano Elite', {
        style: {
          borderRadius: '15px',
          background: '#000',
          color: '#fff',
          fontSize: '10px',
          fontWeight: '900',
          textTransform: 'uppercase'
        }
      });
      return;
    }

    if (credits < selectedRes.cost) {
      toast.error(`Créditos insuficientes (${selectedRes.cost} necessários)`, {
        style: {
          borderRadius: '15px',
          background: '#000',
          color: '#fff',
          fontSize: '10px',
          fontWeight: '900',
          textTransform: 'uppercase'
        }
      });
      return;
    }

    setIsRendering(true);
    setError(null);
    const loadingToast = toast.loading('Processando render com IA...', {
      style: {
        borderRadius: '15px',
        background: '#000',
        color: '#fff',
        fontSize: '10px',
        fontWeight: '900',
        textTransform: 'uppercase'
      }
    });

    try {
      const rendered = await renderImage(image, mimeType, style, resolution);

      // Upload para R2
      const response = await fetch(rendered);
      const blob = await response.blob();
      const filename = `render-${Date.now()}.png`;
      const file = new File([blob], filename, { type: "image/png" });

      const publicUrl = await storageService.uploadImage(file, "renders");

      setResult(publicUrl);
      onRenderComplete(publicUrl, style, selectedRes.cost);
      toast.success('Renderizado e salvo com sucesso!', { id: loadingToast });
    } catch (err: any) {
      toast.error('Erro ao processar imagem.', { id: loadingToast });
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
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start relative">
        {/* Controls */}
        <div className="lg:col-span-4 space-y-4 md:space-y-6">
          <div className="bg-[#EAE4D5] border border-[#B6B09F]/20 p-5 md:p-8 rounded-2xl md:rounded-3xl shadow-sm">
            <label className="block text-[9px] md:text-[10px] font-black text-[#000000] mb-4 md:mb-5 uppercase tracking-widest">Atmosfera</label>
            <div className="grid grid-cols-2 gap-2 md:gap-3">
              {STYLES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={`px-3 py-2.5 md:py-3 rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-black transition-all uppercase tracking-widest border ${style === s
                    ? 'bg-[#000000] text-white border-[#000000] shadow-lg'
                    : 'bg-[#F2F2F2] text-[#000000] border-[#B6B09F]/20 hover:border-[#B6B09F]/50'
                    }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#EAE4D5] border border-[#B6B09F]/20 p-5 md:p-8 rounded-2xl md:rounded-3xl shadow-sm">
            <label className="block text-[9px] md:text-[10px] font-black text-[#000000] mb-4 md:mb-5 uppercase tracking-widest">Qualidade</label>
            <div className="grid grid-cols-3 gap-2 md:gap-3">
              {RESOLUTIONS.map((r) => {
                const isLocked = !canUseResolution(r.label, userPlan);
                return (
                  <button
                    key={r.label}
                    onClick={() => !isLocked && setResolution(r.label)}
                    disabled={isLocked}
                    className={`px-2 py-2.5 md:py-3 rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-black transition-all uppercase tracking-widest border flex flex-col items-center justify-center relative ${isLocked
                      ? 'bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed'
                      : resolution === r.label
                        ? 'bg-[#000000] text-white border-[#000000] shadow-lg'
                        : 'bg-[#F2F2F2] text-[#000000] border-[#B6B09F]/20 hover:border-[#B6B09F]/50'
                      }`}
                  >
                    {isLocked && <Lock className="absolute top-1 right-1 w-2.5 h-2.5 text-zinc-400" />}
                    <span>{r.label}</span>
                    <span className={`text-[6px] md:text-[7px] mt-1 ${isLocked ? 'text-zinc-400' : resolution === r.label ? 'opacity-70' : 'text-[#B6B09F]'}`}>
                      {isLocked ? 'Elite' : `${r.cost} ${r.cost === 1 ? 'crédito' : 'créditos'}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-[#EAE4D5] border border-[#B6B09F]/20 p-5 md:p-8 rounded-2xl md:rounded-3xl shadow-sm">
            <label className="block text-[9px] md:text-[10px] font-black text-[#000000] mb-4 md:mb-5 uppercase tracking-widest">Projeto</label>
            <div className="relative">
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                id="image-upload"
                accept="image/*"
              />
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center border-2 border-dashed border-[#B6B09F]/40 rounded-xl md:rounded-2xl p-6 md:p-10 cursor-pointer hover:border-[#000000] transition-all"
              >
                <Upload className="w-6 h-6 md:w-8 md:h-8 text-[#B6B09F] mb-2 md:mb-3" />
                <span className="text-[8px] md:text-[9px] font-black uppercase text-[#B6B09F] tracking-widest text-center">Selecionar Arquivo</span>
              </label>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!image || isRendering || credits <= 0}
            className={`w-full py-4 md:py-6 rounded-xl md:rounded-2xl flex items-center justify-center font-black text-xs md:text-sm uppercase tracking-widest transition-all ${!image || isRendering || credits <= 0
              ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed opacity-50'
              : 'bg-[#000000] hover:bg-zinc-800 text-white shadow-xl'
              }`}
          >
            {isRendering ? (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processando</span>
              </div>
            ) : (
              <>
                <img src="/assets/logo-icon.png" alt="" className="w-5 h-5 mr-3 invert" />
                Gerar Render
              </>
            )}
          </button>

          {/* Watermark notice for free users */}
          {shouldShowWatermark(userPlan) && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[8px] font-bold uppercase tracking-widest text-amber-700 text-center">
              Plano Grátis • Marca d'água será aplicada
            </div>
          )}

          {error && (
            <div className="p-3 md:p-4 bg-red-50 border border-red-100 rounded-xl flex items-center space-x-2 text-red-700 text-[8px] md:text-[9px] font-black uppercase tracking-widest">
              <AlertCircle className="w-3 h-3 md:w-4 md:h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Canvas Area */}
        <div className="lg:col-span-8 bg-[#EAE4D5] border border-[#B6B09F]/20 rounded-[30px] md:rounded-[40px] p-4 md:p-6 min-h-[400px] md:min-h-[550px] flex flex-col relative overflow-hidden shadow-sm">
          <div className="flex-1 relative flex items-center justify-center overflow-hidden rounded-2xl md:rounded-3xl bg-[#F2F2F2] border border-[#B6B09F]/10">
            {result ? (
              <img src={result} alt="Render Result" className="max-w-full max-h-full object-contain" />
            ) : image ? (
              <img src={image} alt="Original" className="max-w-full max-h-full object-contain opacity-30 blur-[1px]" />
            ) : (
              <div className="text-[#B6B09F] flex flex-col items-center text-center px-6">
                <Upload className="w-8 h-8 md:w-10 md:h-10 opacity-20 mb-4 md:mb-6" />
                <p className="font-black uppercase text-[9px] md:text-[11px] tracking-widest text-[#000000]">Mesa de Trabalho</p>
                <p className="text-[7px] md:text-[8px] text-[#B6B09F] mt-2 font-bold uppercase tracking-widest italic">Aguardando seu projeto</p>
              </div>
            )}

            {isRendering && (
              <div className="absolute inset-0 bg-[#F2F2F2]/90 backdrop-blur-md flex flex-col items-center justify-center space-y-8 z-20">
                <div className="relative">
                  <img src="/assets/logo-icon.png" alt="Processando" className="w-16 h-16 md:w-20 md:h-20 object-contain animate-bounce" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#B6B09F] rounded-full animate-ping" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-[#000000] font-black text-2xl md:text-3xl tracking-tighter uppercase animate-pulse">Processando</p>
                  <p className="text-[#B6B09F] font-black text-[9px] uppercase tracking-[0.3em]">IA em alta velocidade</p>
                </div>
                <div className="w-48 h-1 bg-black/10 rounded-full overflow-hidden">
                  <div className="h-full bg-black animate-progress" />
                </div>
              </div>
            )}
          </div>

          {result && !isRendering && (
            <div className="mt-4 md:mt-6 flex flex-col sm:flex-row gap-3 md:gap-4 justify-between items-center bg-white/40 p-4 rounded-xl md:rounded-2xl">
              <div className="text-[8px] md:text-[10px] font-black text-[#000000] uppercase tracking-widest flex items-center space-x-4">
                <span>ESTILO: {style}</span>
                <span className="opacity-30">|</span>
                <span>QUALIDADE: {resolution}</span>
              </div>
              <div className="flex w-full sm:w-auto gap-2 md:gap-4">
                <button
                  onClick={() => { setResult(null); setImage(null); }}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg bg-[#F2F2F2] border border-[#B6B09F]/20 text-[8px] md:text-[9px] font-black uppercase tracking-widest"
                >
                  LIMPAR
                </button>
                <button
                  onClick={downloadResult}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg bg-black text-white text-[8px] md:text-[9px] font-black uppercase tracking-widest shadow-lg"
                >
                  EXPORTAR
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
