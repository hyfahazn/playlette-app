'use client';

import React, { useEffect, useRef } from 'react';

interface PixelMatrixWaveProps {
  isPlaying?: boolean;
  opacity?: number;
  className?: string;
  intensity?: number;
}

/**
 * Undulating Digital Halftone / LED Pixel Matrix Wave (matching Image 3)
 * High-contrast square dot matrix with sweeping luminous wave ribbons.
 */
export const PixelMatrixWave: React.FC<PixelMatrixWaveProps> = ({
  isPlaying = false,
  opacity = 0.85,
  className = '',
  intensity = 1.0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let time = 0;

    const handleResize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      width = parent.clientWidth;
      height = parent.clientHeight;
      // Retain high DPI crispness
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const dotSize = 5; // square dot size
    const dotGap = 3; // gap between dots
    const step = dotSize + dotGap; // 8px cell step

    const render = () => {
      time += isPlaying ? 0.035 : 0.015;

      ctx.clearRect(0, 0, width, height);

      const cols = Math.ceil(width / step);
      const rows = Math.ceil(height / step);

      // Render each square LED dot in the matrix
      for (let c = 0; c < cols; c++) {
        const x = c * step;

        // Wave curve 1 (primary undulating ribbon matching Image 3)
        const wave1 =
          Math.sin(c * 0.045 + time) * 0.35 +
          Math.cos(c * 0.02 - time * 0.6) * 0.25;

        // Wave curve 2 (secondary diagonal sweep)
        const wave2 =
          Math.sin(c * 0.06 - time * 1.2) * 0.2 +
          Math.cos(c * 0.035 + time * 0.4) * 0.15;

        for (let r = 0; r < rows; r++) {
          const y = r * step;
          const normY = (r / rows) * 2 - 1; // -1 to 1

          // Calculate distance to the sinuous undulating wave crests
          const dist1 = Math.abs(normY - wave1);
          const dist2 = Math.abs(normY - (wave2 - 0.4));

          // Brightness evaluation: Gaussian falloff from the wave center
          const b1 = Math.exp(-dist1 * dist1 * 7.5);
          const b2 = Math.exp(-dist2 * dist2 * 9.0) * 0.7;
          const brightness = Math.min(1.0, (b1 + b2) * intensity);

          if (brightness > 0.08) {
            // Active luminous dot matching Image 3 (glow white / pale cyan / cream)
            let color = '';
            if (brightness > 0.85) {
              // Core of the wave: bright pure white
              color = `rgba(255, 255, 255, ${brightness * 0.95})`;
            } else if (brightness > 0.45) {
              // Mid-wave: pale ice blue or warm ivory glow
              const isCool = (c + r) % 2 === 0;
              color = isCool
                ? `rgba(215, 235, 255, ${brightness * 0.85})`
                : `rgba(255, 245, 235, ${brightness * 0.85})`;
            } else {
              // Edge of wave: dimmed blue-grey
              color = `rgba(160, 185, 215, ${brightness * 0.6})`;
            }

            ctx.fillStyle = color;
            ctx.fillRect(x, y, dotSize, dotSize);

            // Add subtle specular bloom for the highest intensity peaks
            if (brightness > 0.9) {
              ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 0.35})`;
              ctx.fillRect(x - 1, y - 1, dotSize + 2, dotSize + 2);
            }
          } else {
            // Ambient inactive LED dot (faint dark matrix pixel)
            ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
            ctx.fillRect(x, y, dotSize, dotSize);
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying, intensity]);

  return (
    <div
      style={{ opacity }}
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none ${className}`}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
