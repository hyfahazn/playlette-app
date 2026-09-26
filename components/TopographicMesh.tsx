'use client';

import React, { useEffect, useRef } from 'react';

interface TopographicMeshProps {
  isPlaying?: boolean;
  opacity?: number;
  className?: string;
}

/**
 * 3D Topographic Wireframe Mesh / Cybernetic Terrain (matching Image 4)
 * High-contrast fine wireframe grid with organic valleys, ridges, and depth contours.
 */
export const TopographicMesh: React.FC<TopographicMeshProps> = ({
  isPlaying = false,
  opacity = 0.5,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let time = 0;

    const handleResize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      width = parent.clientWidth;
      height = parent.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) / width - 0.5,
        y: (e.clientY - rect.top) / height - 0.5,
      };
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Grid parameters for 3D terrain
    const gridCols = 48;
    const gridRows = 38;

    const render = () => {
      time += isPlaying ? 0.02 : 0.008;

      ctx.clearRect(0, 0, width, height);

      // Coordinate transformation for 3D perspective wireframe
      const centerX = width * 0.5 + mouseRef.current.x * 40;
      const centerY = height * 0.5 + mouseRef.current.y * 30;

      // Point projection function: (col, row) -> {x, y, elevation}
      const getPoint = (c: number, r: number) => {
        const u = (c / (gridCols - 1) - 0.5) * 2; // -1 to 1
        const v = (r / (gridRows - 1) - 0.5) * 2; // -1 to 1

        // Elevation function: multiple harmonic crater/valley waves matching Image 4
        const distCenter = Math.sqrt(u * u + v * v);
        const crater1 = Math.sin(u * 3.5 + time) * Math.cos(v * 3.5 - time * 0.8) * 45;
        const crater2 = Math.cos(distCenter * 5.0 - time) * 35;
        const ridge = Math.sin(u * 6.0 + v * 4.0 + time * 1.5) * 20;

        const elevation = (crater1 + crater2 + ridge) * (1 - Math.min(1, distCenter * 0.6));

        // 3D Isometric projection
        const scaleX = width * 0.42;
        const scaleY = height * 0.28;
        const px = centerX + (u - v * 0.35) * scaleX;
        const py = centerY + (u * 0.35 + v * 0.85) * scaleY - elevation;

        return { x: px, y: py, elevation };
      };

      // Draw Rows (Horizontal Wireframe Lines)
      ctx.lineWidth = 0.85;

      for (let r = 0; r < gridRows; r++) {
        ctx.beginPath();
        for (let c = 0; c < gridCols; c++) {
          const pt = getPoint(c, r);
          if (c === 0) {
            ctx.moveTo(pt.x, pt.y);
          } else {
            ctx.lineTo(pt.x, pt.y);
          }
        }
        // Alpha based on depth and position
        const depthAlpha = 0.12 + (r / gridRows) * 0.45;
        ctx.strokeStyle = `rgba(255, 255, 255, ${depthAlpha})`;
        ctx.stroke();
      }

      // Draw Cols (Vertical Wireframe Lines)
      for (let c = 0; c < gridCols; c++) {
        ctx.beginPath();
        for (let r = 0; r < gridRows; r++) {
          const pt = getPoint(c, r);
          if (r === 0) {
            ctx.moveTo(pt.x, pt.y);
          } else {
            ctx.lineTo(pt.x, pt.y);
          }
        }
        const sideAlpha = 0.08 + (c % 2 === 0 ? 0.25 : 0.15);
        ctx.strokeStyle = `rgba(255, 255, 255, ${sideAlpha})`;
        ctx.stroke();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <div
      style={{ opacity }}
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none ${className}`}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
