
import React, { useState, useRef, useEffect, useCallback } from 'react';

interface BeforeAfterSliderProps {
  before: string;
  after: string;
  className?: string; // Allow custom styling/dimensions from parent
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({ before, after, className = "" }) => {
  const [position, setPosition] = useState(50);
  const [hasInteracted, setHasInteracted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);

  // Animação automática de "boas-vindas" - Movimento senoidal suave
  useEffect(() => {
    if (hasInteracted) return;

    let startTime: number | null = null;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      // Movimento elegante entre 35% e 65%
      const newPos = 50 + 15 * Math.sin(elapsed / 1000);
      setPosition(newPos);

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [hasInteracted]);

  const [containerWidth, setContainerWidth] = useState(0);

  // ResizeObserver para manter a largura da imagem interna sincronizada
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const handleMove = useCallback((clientX: number) => {
    if (containerRef.current) {
      const { left, width } = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - left, width));
      const newPercentage = (x / width) * 100;

      // Update state immediately for maximum fluidity
      setPosition(newPercentage);
      if (!hasInteracted) setHasInteracted(true);
    }
  }, [hasInteracted]);

  const onMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden cursor-none select-none shadow-2xl group bg-neutral-900 touch-none ${className}`}
      onMouseMove={onMouseMove}
      onTouchMove={onTouchMove}
      onMouseEnter={() => setHasInteracted(true)}
    >
      {/* Imagem de Fundo (After/Render) */}
      <img
        src={after}
        alt="Render Final"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />

      {/* Imagem Superior (Before/Estrutura) com Clip */}
      <div
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{
          width: `${position}%`,
          willChange: 'width' // Otimização de performance
        }}
      >
        <div className="absolute inset-0 w-full h-full"> {/* Wrapper to contain absolute image inside clipped div */}
          <img
            src={before}
            alt="Original"
            className="absolute top-0 bottom-0 left-0 h-full max-w-none object-cover filter contrast-125 brightness-90 saturate-50"
            style={{ width: containerWidth ? `${containerWidth}px` : '100%' }}
          />
        </div>
      </div>

      {/* Legendas com transição suave para não "piscarem" */}
      <div
        className="absolute top-4 left-4 md:top-8 md:left-8 pointer-events-none z-30 transition-opacity duration-300"
        style={{
          opacity: Math.max(0, Math.min(1, (position - 20) / 15)),
        }}
      >
        <div className="bg-black/80 text-white px-3 py-1.5 md:px-6 md:py-2 rounded-full text-[7px] md:text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md border border-white/10 flex items-center shadow-2xl">
          <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-white rounded-full mr-2 md:mr-3 animate-pulse" />
          ANTES
        </div>
      </div>

      <div
        className="absolute top-4 right-4 md:top-8 md:right-8 pointer-events-none z-30 transition-opacity duration-300"
        style={{
          opacity: Math.max(0, Math.min(1, (80 - position) / 15)),
        }}
      >
        <div className="bg-white/90 text-black px-3 py-1.5 md:px-6 md:py-2 rounded-full text-[7px] md:text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md border border-black/5 flex items-center shadow-2xl">
          <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-black rounded-full mr-2 md:mr-3" />
          DEPOIS
        </div>
      </div>

      {/* Linha e Botão do Slider */}
      <div
        className="absolute inset-y-0 w-0.5 md:w-1 bg-white/50 backdrop-blur-sm shadow-[0_0_15px_rgba(255,255,255,0.5)] z-40 pointer-events-none"
        style={{
          left: `${position}%`,
          willChange: 'left' // Otimização de performance
        }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center shadow-[0_10px_40px_rgba(0,0,0,0.5)] border-2 md:border-4 border-transparent transition-transform duration-200 group-hover:scale-110">
          <div className="flex space-x-0.5 md:space-x-1">
            <div className="w-0.5 md:w-1 h-3 md:h-5 bg-neutral-400 rounded-full" />
            <div className="w-0.5 md:w-1 h-5 md:h-8 bg-neutral-800 rounded-full" />
            <div className="w-0.5 md:w-1 h-3 md:h-5 bg-neutral-400 rounded-full" />
          </div>
        </div>
      </div>

      {/* Cursor Customizado (Só aparece no hover em desktop) */}
      <div className="hidden md:block absolute inset-0 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div
          className="absolute w-20 h-20 flex items-center justify-center"
          style={{ left: `${position}%`, top: '50%', transform: 'translate(-50%, -50%)' }}
        >
          <div className="flex space-x-12 text-white font-black text-xs drop-shadow-lg">
            <span className="animate-pulse">←</span>
            <span className="animate-pulse">→</span>
          </div>
        </div>
      </div>

      {/* Instrução Centralizada (Esconde após interação) */}
      {/* Instrução Centralizada (Removida conforme solicitado) */}
    </div>
  );
};
