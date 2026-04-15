import React, { useState, useRef, useEffect } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X, Check, Droplet, Monitor, Smartphone, Maximize2 } from 'lucide-react';

interface ImageCropperModalProps {
  imageUrl: string;
  onClose: () => void;
  onCropComplete: (croppedBase64: string) => void;
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({ imageUrl, onClose, onCropComplete }) => {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
     // Bloqueia rolagem do body quando o modal abrir
     document.body.style.overflow = 'hidden';
     return () => {
         document.body.style.overflow = 'unset';
     }
  }, []);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  };

  const setCropAspect = (newAspect: number | undefined) => {
    setAspect(newAspect);
    if (imgRef.current) {
      if (newAspect) {
        setCrop(centerAspectCrop(imgRef.current.width, imgRef.current.height, newAspect));
      } else {
        setCrop(undefined); // Crop livre
      }
    }
  };

  const handleSave = async () => {
    if (!completedCrop || !imgRef.current) {
      onClose();
      return;
    }

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    // Configura as dimensões do canvas para o tamanho do recorte
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY
    );

    const base64Image = canvas.toDataURL('image/png', 1.0);
    onCropComplete(base64Image);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4">
      {/* Botão Fechar Global */}
      <button 
        onClick={onClose} 
        className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-50"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="w-full max-w-5xl bg-[#111] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Topbar com Proporções */}
        <div className="p-4 bg-black/50 border-b border-white/10 flex flex-wrap gap-2 justify-center shrink-0">
          <button 
            onClick={() => setCropAspect(undefined)}
            className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 ${!aspect ? 'bg-amber-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            <Maximize2 className="w-4 h-4" /> Livre
          </button>
          <button 
            onClick={() => setCropAspect(1)}
            className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 ${aspect === 1 ? 'bg-amber-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            <Droplet className="w-4 h-4" /> 1:1 Quadrado
          </button>
          <button 
            onClick={() => setCropAspect(16 / 9)}
            className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 ${aspect === 16 / 9 ? 'bg-amber-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            <Monitor className="w-4 h-4" /> 16:9 Desktop
          </button>
          <button 
            onClick={() => setCropAspect(9 / 16)}
            className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 ${aspect === 9 / 16 ? 'bg-amber-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            <Smartphone className="w-4 h-4" /> 9:16 Vertical
          </button>
        </div>

        {/* Área Central de Crop */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYNgvwMDwnxhMz2CgEQzUYxQNEsEwsH4eZOD9S4zQ0ICjBgxtMMg4GABM1wwB0xWn9AAAAABJRU5ErkJggg==')]">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspect}
            className="max-h-full"
          >
            <img
              ref={imgRef}
              alt="Crop"
              src={imageUrl}
              crossOrigin="anonymous"
              onLoad={onImageLoad}
              className="max-h-[60vh] max-w-full object-contain shadow-2xl"
            />
          </ReactCrop>
        </div>

        {/* Bottom Bar: Ação */}
        <div className="p-4 bg-black/50 border-t border-white/10 flex justify-end shrink-0">
          <button 
            onClick={handleSave}
            disabled={!completedCrop?.width || !completedCrop?.height}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-neutral-600 disabled:opacity-50 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl"
          >
            <Check className="w-4 h-4" /> Aplicar Corte
          </button>
        </div>
      </div>
    </div>
  );
}
