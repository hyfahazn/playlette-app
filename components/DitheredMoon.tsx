'use client';

import React from 'react';

interface DitheredMoonProps {
  className?: string;
  size?: number;
  animate?: boolean;
}

export const DitheredMoon: React.FC<DitheredMoonProps> = ({
  className = '',
  size = 280,
  animate = false,
}) => {
  return (
    <div
      className={`relative select-none flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Outer ambient glow */}
      <div className="absolute inset-0 rounded-full bg-white/5 blur-xl pointer-events-none" />

      {/* SVG 1-Bit Dithered Celestial Moon (Inspired directly by Reference Image 1) */}
      <svg
        viewBox="0 0 160 160"
        className={`w-full h-full filter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] ${
          animate ? 'animate-spin-slow' : ''
        }`}
        style={{ imageRendering: 'pixelated' }}
      >
        <defs>
          {/* Halftone Dot Dither Pattern */}
          <pattern id="ditherLight" width="4" height="4" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="1.5" height="1.5" fill="#ffffff" />
            <rect x="2" y="2" width="1.5" height="1.5" fill="#ffffff" />
          </pattern>
          <pattern id="ditherDense" width="2" height="2" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="1" height="1" fill="#ffffff" />
          </pattern>
          <pattern id="ditherDark" width="4" height="4" patternUnits="userSpaceOnUse">
            <rect x="1" y="1" width="1" height="1" fill="#ffffff" />
          </pattern>

          {/* Clip path for circular moon boundary */}
          <clipPath id="moonClip">
            <circle cx="80" cy="80" r="76" />
          </clipPath>
        </defs>

        {/* Circular Moon Body */}
        <g clipPath="url(#moonClip)">
          {/* Base Black Sphere */}
          <circle cx="80" cy="80" r="76" fill="#09090b" />

          {/* Dithered Ambient Halftone Filling */}
          <circle cx="80" cy="80" r="76" fill="url(#ditherDark)" opacity="0.8" />

          {/* Major High-Contrast White Lunar Continents & Craters */}
          <path
            d="M 20 80 Q 30 40 70 30 T 130 50 Q 150 90 120 130 T 50 140 Q 15 110 20 80 Z"
            fill="url(#ditherLight)"
          />

          {/* Solid White Highlights */}
          <path
            d="M 60 40 Q 80 35 100 45 Q 120 60 115 85 Q 95 105 75 95 Q 55 80 60 40 Z"
            fill="#ffffff"
            opacity="0.9"
          />

          <path
            d="M 35 85 Q 45 75 60 80 Q 70 95 65 115 Q 45 125 35 110 Z"
            fill="#ffffff"
            opacity="0.85"
          />

          <path
            d="M 90 100 Q 115 105 125 125 Q 105 145 85 135 Q 75 120 90 100 Z"
            fill="#ffffff"
            opacity="0.75"
          />

          {/* Dark Craters / Mare Seas (Matching Image 1) */}
          <circle cx="95" cy="65" r="14" fill="#000000" />
          <circle cx="95" cy="65" r="12" fill="url(#ditherDark)" opacity="0.6" />

          <circle cx="115" cy="85" r="9" fill="#000000" />
          <circle cx="108" cy="105" r="7" fill="#000000" />

          <path
            d="M 45 55 Q 55 45 68 52 Q 62 68 50 72 Z"
            fill="#000000"
          />

          <path
            d="M 72 82 Q 85 75 88 90 Q 78 98 70 92 Z"
            fill="#000000"
          />

          {/* Radiant 8-Point Star Explosion on Upper-Left (Iconic motif in Image 1) */}
          <g transform="translate(56, 68)">
            {/* Center flash */}
            <circle cx="0" cy="0" r="3" fill="#ffffff" />
            <circle cx="0" cy="0" r="5" fill="none" stroke="#ffffff" strokeWidth="0.8" strokeDasharray="1,1" />

            {/* Cardinal Rays */}
            <line x1="0" y1="-18" x2="0" y2="18" stroke="#ffffff" strokeWidth="1.2" />
            <line x1="-18" y1="0" x2="18" y2="0" stroke="#ffffff" strokeWidth="1.2" />

            {/* Diagonal Rays */}
            <line x1="-12" y1="-12" x2="12" y2="12" stroke="#ffffff" strokeWidth="0.9" />
            <line x1="-12" y1="12" x2="12" y2="-12" stroke="#ffffff" strokeWidth="0.9" />

            {/* Dithered Star Points */}
            <rect x="-1" y="-22" width="2" height="2" fill="#ffffff" />
            <rect x="-1" y="20" width="2" height="2" fill="#ffffff" />
            <rect x="-22" y="-1" width="2" height="2" fill="#ffffff" />
            <rect x="20" y="-1" width="2" height="2" fill="#ffffff" />
          </g>

          {/* Secondary Star Twinkle */}
          <g transform="translate(122, 50)">
            <circle cx="0" cy="0" r="1.5" fill="#ffffff" />
            <line x1="0" y1="-7" x2="0" y2="7" stroke="#ffffff" strokeWidth="0.8" />
            <line x1="-7" y1="0" x2="7" y2="0" stroke="#ffffff" strokeWidth="0.8" />
          </g>

          <g transform="translate(40, 110)">
            <circle cx="0" cy="0" r="1.5" fill="#ffffff" />
            <line x1="0" y1="-6" x2="0" y2="6" stroke="#ffffff" strokeWidth="0.8" />
            <line x1="-6" y1="0" x2="6" y2="0" stroke="#ffffff" strokeWidth="0.8" />
          </g>

          {/* Dithered Pixel Border Grid Arc (stippled rim matching Image 1) */}
          <circle
            cx="80"
            cy="80"
            r="75"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeDasharray="2,2"
            opacity="0.9"
          />
        </g>

        {/* Outer Fine Hairline Border */}
        <circle
          cx="80"
          cy="80"
          r="76"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1"
          opacity="0.7"
        />
      </svg>
    </div>
  );
};
