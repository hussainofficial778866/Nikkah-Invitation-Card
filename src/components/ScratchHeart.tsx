import React, { useCallback, useEffect, useRef, useState } from 'react';

interface ScratchHeartProps {
  onRevealed: () => void;
  resetSignal: number;
}

export const ScratchHeart: React.FC<ScratchHeartProps> = ({ onRevealed, resetSignal }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const checkCounterRef = useRef(0);

  const [revealed, setRevealed] = useState(false);
  const [foilReady, setFoilReady] = useState(false);
  const [scratchProgress, setScratchProgress] = useState(0);

  const drawFoilLayer = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 280;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, size, size);

    // Clip into a crisp symmetrical heart path
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(140, 250);
    ctx.bezierCurveTo(60, 198, 16, 146, 16, 88);
    ctx.bezierCurveTo(16, 44, 52, 20, 88, 20);
    ctx.bezierCurveTo(114, 20, 132, 34, 140, 52);
    ctx.bezierCurveTo(148, 34, 166, 20, 192, 20);
    ctx.bezierCurveTo(228, 20, 264, 44, 264, 88);
    ctx.bezierCurveTo(264, 146, 220, 198, 140, 250);
    ctx.closePath();
    ctx.clip();

    // Luxury sky-blue + soft white + light-red brushed foil surface
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, '#5FA2CF');
    grad.addColorStop(0.38, '#8CC4E8');
    grad.addColorStop(0.68, '#F6F9FC');
    grad.addColorStop(1, '#DF8B97');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Subtle metallic diagonal sheen lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.2;
    for (let i = -size; i < size * 2; i += 10) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + size, size);
      ctx.stroke();
    }

    // Inner delicate dashed heart outline
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.72)';
    ctx.lineWidth = 1.6;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(140, 232);
    ctx.bezierCurveTo(72, 186, 32, 140, 32, 90);
    ctx.bezierCurveTo(32, 56, 60, 36, 90, 36);
    ctx.bezierCurveTo(114, 36, 132, 50, 140, 68);
    ctx.bezierCurveTo(148, 50, 166, 36, 190, 36);
    ctx.bezierCurveTo(220, 36, 248, 56, 248, 90);
    ctx.bezierCurveTo(248, 140, 208, 186, 140, 232);
    ctx.stroke();
    ctx.setLineDash([]);

    // Text on foil
    ctx.fillStyle = '#183750';
    ctx.font = '600 18px "Cormorant Garamond", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('SCRATCH ME', 140, 122);

    ctx.fillStyle = '#2B5374';
    ctx.font = '500 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Scratch to reveal the date', 140, 144);

    ctx.restore();
    setFoilReady(true);
  }, []);

  useEffect(() => {
    setFoilReady(false);
    setRevealed(false);
    setScratchProgress(0);
    drawFoilLayer();
  }, [resetSignal, drawFoilLayer]);

  const measureScratchedRatio = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 0;

    const { width, height } = canvas;
    const data = ctx.getImageData(0, 0, width, height).data;

    // Sample pixels every 6 steps inside the central heart bounding box
    let totalSampled = 0;
    let cleared = 0;
    const xMin = Math.floor(width * 0.16);
    const xMax = Math.floor(width * 0.84);
    const yMin = Math.floor(height * 0.16);
    const yMax = Math.floor(height * 0.82);

    for (let y = yMin; y < yMax; y += 6) {
      for (let x = xMin; x < xMax; x += 6) {
        totalSampled++;
        const alpha = data[(y * width + x) * 4 + 3];
        if (alpha < 40) cleared++;
      }
    }
    return totalSampled > 0 ? cleared / totalSampled : 0;
  }, []);

  const scratchAt = (clientX: number, clientY: number) => {
    if (revealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = 280 / rect.width;
    const scaleY = 280 / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 34;

    if (lastPointRef.current) {
      ctx.beginPath();
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(x, y, 17, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    lastPointRef.current = { x, y };

    checkCounterRef.current += 1;
    if (checkCounterRef.current % 5 === 0) {
      const ratio = measureScratchedRatio();
      setScratchProgress(ratio);
      if (ratio >= 0.38) {
        setRevealed(true);
        onRevealed();
      }
    }
  };

  const handleRevealImmediately = () => {
    if (!revealed) {
      setRevealed(true);
      setScratchProgress(1);
      onRevealed();
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex h-[220px] w-[220px] items-center justify-center sm:h-[236px] sm:w-[236px]">
        {/* Soft heart halo glow */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-4 rounded-full bg-gradient-to-br from-[#9ED2F0]/45 via-[#FDFBF7] to-[#EA9BA5]/45 blur-xl transition-opacity duration-700 ${
            revealed ? 'opacity-100' : 'opacity-60'
          }`}
        />

        {/* SVG decorative heart frame behind canvas */}
        <svg
          viewBox="0 0 280 280"
          className="pointer-events-none absolute inset-0 h-full w-full drop-shadow-[0_12px_26px_rgba(68,125,168,0.18)]"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="heartBaseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EFF7FC" />
              <stop offset="55%" stopColor="#FCF8F4" />
              <stop offset="100%" stopColor="#FBECEF" />
            </linearGradient>
            <linearGradient id="heartRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#62A5D2" />
              <stop offset="55%" stopColor="#D7EBF8" />
              <stop offset="100%" stopColor="#D46573" />
            </linearGradient>
          </defs>
          <path
            d="M140 250 C60 198 16 146 16 88 C16 44 52 20 88 20 C114 20 132 34 140 52 C148 34 166 20 192 20 C228 20 264 44 264 88 C264 146 220 198 140 250 Z"
            fill="url(#heartBaseGrad)"
            stroke="url(#heartRimGrad)"
            strokeWidth="3.5"
          />
        </svg>

        {/* Hidden Wedding Date underneath opaque scratch foil */}
        <div
          className={`pointer-events-none relative z-10 -mt-3 flex select-none flex-col items-center justify-center px-8 text-center transition-all duration-700 ${
            foilReady ? 'opacity-100' : 'opacity-0'
          } ${revealed ? 'scale-105' : 'scale-100'}`}
        >
          <p className="font-editorial text-2xl font-semibold leading-tight text-[#1A354C] sm:text-[26px]">
            23 December 2026
          </p>
        </div>

        {/* Interactive Scratch Canvas */}
        <canvas
          ref={canvasRef}
          aria-label="Scratch the heart to reveal the wedding date"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleRevealImmediately();
            }
          }}
          onPointerDown={(e) => {
            if (revealed) return;
            isDrawingRef.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
            lastPointRef.current = null;
            scratchAt(e.clientX, e.clientY);
          }}
          onPointerMove={(e) => {
            if (!isDrawingRef.current || revealed) return;
            scratchAt(e.clientX, e.clientY);
          }}
          onPointerUp={() => {
            isDrawingRef.current = false;
            lastPointRef.current = null;
            if (!revealed) {
              const ratio = measureScratchedRatio();
              setScratchProgress(ratio);
              if (ratio >= 0.38) {
                setRevealed(true);
                onRevealed();
              }
            }
          }}
          onPointerCancel={() => {
            isDrawingRef.current = false;
            lastPointRef.current = null;
          }}
          className={`absolute inset-0 z-20 h-full w-full touch-none select-none transition-opacity duration-700 ${
            revealed ? 'pointer-events-none opacity-0' : 'cursor-grab active:cursor-grabbing opacity-100'
          }`}
        />
      </div>

      {/* Helper prompt only before reveal — zero duplicate date below heart */}
      {!revealed && (
        <div className="mt-2.5 flex min-h-[20px] items-center justify-center">
          <p className="text-xs text-[#4C6D88]">
            Scratch the heart to reveal the date
            {scratchProgress > 0.05 ? ` · ${Math.min(99, Math.round((scratchProgress / 0.38) * 100))}%` : ''}
          </p>
        </div>
      )}
    </div>
  );
};
