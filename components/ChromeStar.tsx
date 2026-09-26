'use client';

import React from 'react';

interface ChromeStarProps {
  size?: number;
  className?: string;
  glow?: boolean;
  spinning?: boolean;
  onClick?: () => void;
}

/**
 * Liquid Chrome 4-Point Star (matching Image 2)
 * High-gloss liquid chrome with metallic specular reflections, bevels, and fluid curves.
 */
export const ChromeStar: React.FC<ChromeStarProps> = ({
  size = 40,
  className = '',
  glow = true,
  spinning = false,
  onClick,
}) => {
  const starId = React.useId().replace(/:/g, '');

  return (
    <div
      onClick={onClick}
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center flex-shrink-0 select-none ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Outer ambient glow if enabled */}
      {glow && (
        <div
          className="absolute inset-0 rounded-full bg-white/20 blur-md pointer-events-none scale-125"
          style={{
            background:
              'radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, rgba(200, 220, 255, 0.15) 50%, transparent 80%)',
          }}
        />
      )}

      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full relative z-10 filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)] ${
          spinning ? 'animate-spin-slow' : ''
        }`}
      >
        <defs>
          {/* Chrome Surface Main Gradient */}
          <linearGradient
            id={`chromeMain-${starId}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="18%" stopColor="#d4d4d8" />
            <stop offset="35%" stopColor="#71717a" />
            <stop offset="50%" stopColor="#18181b" />
            <stop offset="68%" stopColor="#e4e4e7" />
            <stop offset="85%" stopColor="#a1a1aa" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>

          {/* Chrome Vertical Highlight Gradient */}
          <linearGradient
            id={`chromeVert-${starId}`}
            x1="50%"
            y1="0%"
            x2="50%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#a1a1aa" />
            <stop offset="48%" stopColor="#ffffff" />
            <stop offset="52%" stopColor="#27272a" />
            <stop offset="75%" stopColor="#d4d4d8" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>

          {/* High Specular Edge Gleam */}
          <linearGradient
            id={`chromeGleam-${starId}`}
            x1="0%"
            y1="50%"
            x2="100%"
            y2="50%"
          >
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#27272a" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.9" />
          </linearGradient>

          {/* Liquid Metal Radial Center Bloom */}
          <radialGradient
            id={`centerBloom-${starId}`}
            cx="50%"
            cy="50%"
            r="45%"
          >
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="35%" stopColor="#e4e4e7" stopOpacity="0.8" />
            <stop offset="70%" stopColor="#71717a" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#09090b" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 1. Base 4-Point Star Silhouette */}
        {/* Curvature matching Image 2: wide body gracefully swooping to sharp needles */}
        <path
          d="M 100 6 
             C 102 55, 145 98, 194 100 
             C 145 102, 102 145, 100 194 
             C 98 145, 55 102, 6 100 
             C 55 98, 98 55, 100 6 Z"
          fill={`url(#chromeMain-${starId})`}
          stroke="rgba(255, 255, 255, 0.7)"
          strokeWidth="1.2"
        />

        {/* 2. Top-Left & Bottom-Right Specular Ridge Highlight */}
        <path
          d="M 100 8
             C 101 56, 142 97, 192 100
             C 140 100, 101 60, 100 8 Z"
          fill="#ffffff"
          opacity="0.75"
        />
        <path
          d="M 100 192
             C 99 144, 58 103, 8 100
             C 60 100, 99 140, 100 192 Z"
          fill="#ffffff"
          opacity="0.6"
        />

        {/* 3. Deep Liquid Metallic Facet Curves (Image 2's interior cross grooves) */}
        {/* Vertical ridge */}
        <path
          d="M 100 12 L 100 188"
          stroke={`url(#chromeVert-${starId})`}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Horizontal ridge */}
        <path
          d="M 12 100 L 188 100"
          stroke={`url(#chromeGleam-${starId})`}
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* 4. Secondary liquid diagonal flares */}
        <path
          d="M 100 100 
             Q 135 65 170 30 
             M 100 100 
             Q 65 135 30 170"
          stroke="#ffffff"
          strokeWidth="1"
          opacity="0.3"
        />

        {/* 5. Center Liquid Bevel Core (Crucial detail from Image 2) */}
        <circle
          cx="100"
          cy="100"
          r="26"
          fill={`url(#centerBloom-${starId})`}
        />
        <circle
          cx="100"
          cy="100"
          r="14"
          fill="#ffffff"
          opacity="0.85"
          filter="blur(1px)"
        />
        <circle
          cx="100"
          cy="100"
          r="6"
          fill="#000000"
          stroke="#ffffff"
          strokeWidth="1"
        />
        <circle
          cx="100"
          cy="100"
          r="2"
          fill="#ffffff"
        />
      </svg>
    </div>
  );
};
