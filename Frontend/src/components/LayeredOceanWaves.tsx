"use client";

import React from "react";

export const LayeredOceanWaves: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
      {/* SVG Gradient & Filter Definitions */}
      <svg className="absolute w-0 h-0" aria-hidden="true" focusable="false">
        <defs>
          {/* Main Papercut Layer Gradients */}
          <linearGradient id="waveDeepNavy" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0B132B" />
            <stop offset="50%" stopColor="#1C2541" />
            <stop offset="100%" stopColor="#0E1B38" />
          </linearGradient>

          <linearGradient id="waveOceanBlue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0F3D78" />
            <stop offset="100%" stopColor="#0353A4" />
          </linearGradient>

          <linearGradient id="waveRoyalBlue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0052cc" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>

          <linearGradient id="waveSkyBlue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>

          <linearGradient id="waveFoam" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#BAE6FD" />
            <stop offset="100%" stopColor="#E0F2FE" />
          </linearGradient>

          {/* Planet & Orb Gradients */}
          <radialGradient id="orbGrad1" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#93C5FD" />
            <stop offset="35%" stopColor="#3B82F6" />
            <stop offset="75%" stopColor="#1E3A8A" />
            <stop offset="100%" stopColor="#0A1128" />
          </radialGradient>

          <radialGradient id="orbGrad2" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#67E8F9" />
            <stop offset="45%" stopColor="#06B6D4" />
            <stop offset="85%" stopColor="#0E7490" />
            <stop offset="100%" stopColor="#164E63" />
          </radialGradient>

          <radialGradient id="orbGrad3" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#A5B4FC" />
            <stop offset="50%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#312E81" />
          </radialGradient>

          {/* Soft Papercut Drop Shadow Filter */}
          <filter id="paperShadow" x="-10%" y="-10%" width="125%" height="130%">
            <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#000000" floodOpacity="0.45" />
          </filter>
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
      </svg>

      {/* Ambient background illumination */}
      <div className="absolute top-1/4 -left-12 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

      {/* Floating 3D Spheres / Orbs crossing and decorating */}
      {/* Orb 1: Top Right */}
      <div className="absolute top-10 right-10 w-24 h-24 sm:w-32 sm:h-32 opacity-85 animate-pulse duration-3000">
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-xl">
          <circle cx="50" cy="50" r="44" fill="url(#orbGrad1)" />
          <ellipse cx="50" cy="46" rx="42" ry="7" fill="#ffffff" opacity="0.3" />
          <ellipse cx="50" cy="56" rx="36" ry="5" fill="#ffffff" opacity="0.15" />
        </svg>
      </div>

      {/* Orb 2: Mid-Left Floating */}
      <div className="absolute top-1/3 left-8 w-16 h-16 sm:w-20 sm:h-20 opacity-75">
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-lg">
          <circle cx="50" cy="50" r="42" fill="url(#orbGrad2)" />
          <ellipse cx="50" cy="50" rx="40" ry="6" fill="#ffffff" opacity="0.25" />
        </svg>
      </div>

      {/* Orb 3: Bottom Center Overlapping */}
      <div className="absolute bottom-16 right-1/4 w-20 h-20 sm:w-28 sm:h-28 opacity-80">
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-2xl">
          <circle cx="50" cy="50" r="44" fill="url(#orbGrad3)" />
          <ellipse cx="50" cy="52" rx="42" ry="7" fill="#ffffff" opacity="0.2" />
        </svg>
      </div>

      {/* Papercut Water Splashes & Droplets (Bọt nước & Giọt sóng trôi nổi) */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1000 1000"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        {/* Floating Droplets with papercut shadow */}
        {/* Top-right splash cloud */}
        <g filter="url(#paperShadow)">
          <circle cx="780" cy="220" r="14" fill="#38BDF8" opacity="0.9" />
          <circle cx="810" cy="200" r="9" fill="#7DD3FC" opacity="0.8" />
          <circle cx="830" cy="235" r="16" fill="#0284C7" opacity="0.85" />
          <circle cx="760" cy="250" r="8" fill="#BAE6FD" opacity="0.9" />
          <circle cx="860" cy="210" r="12" fill="#38BDF8" opacity="0.75" />
        </g>

        {/* Center-right wave splash cluster */}
        <g filter="url(#paperShadow)">
          <path
            d="M620,440 C630,420 655,420 665,440 C675,460 650,480 635,475 C620,470 610,460 620,440 Z"
            fill="#38BDF8"
            opacity="0.85"
          />
          <circle cx="690" cy="420" r="12" fill="#BAE6FD" opacity="0.9" />
          <circle cx="715" cy="445" r="7" fill="#7DD3FC" opacity="0.85" />
          <circle cx="590" cy="460" r="15" fill="#0284C7" opacity="0.8" />
          <circle cx="560" cy="440" r="9" fill="#38BDF8" opacity="0.9" />
          <circle cx="640" cy="490" r="11" fill="#E0F2FE" opacity="0.95" />
        </g>

        {/* Mid-bottom droplets */}
        <g filter="url(#paperShadow)">
          <circle cx="340" cy="680" r="10" fill="#7DD3FC" opacity="0.85" />
          <circle cx="370" cy="650" r="16" fill="#0052cc" opacity="0.75" />
          <circle cx="410" cy="690" r="12" fill="#38BDF8" opacity="0.9" />
          <circle cx="450" cy="660" r="8" fill="#BAE6FD" opacity="0.8" />
          <circle cx="310" cy="710" r="14" fill="#0284C7" opacity="0.7" />
        </g>

        {/* ================= MULTI-LAYER PAPERCUT OCEAN WAVE CRESTS (Sóng biển cuộn lớp) ================= */}

        {/* Deep Back Layer: Dark Ocean Indigo Base */}
        <path
          filter="url(#paperShadow)"
          d="M0,520 
             C180,480 260,620 420,580 
             C560,540 640,430 780,460 
             C890,480 940,420 1000,380 
             L1000,1000 L0,1000 Z"
          fill="url(#waveDeepNavy)"
        />

        {/* Mid Layer 1: Ocean Blue Wave with Curl Crests */}
        <path
          filter="url(#paperShadow)"
          d="M0,640 
             C120,600 220,720 380,680 
             C520,640 590,520 720,550 
             C810,570 880,510 1000,470 
             L1000,1000 L0,1000 Z"
          fill="url(#waveOceanBlue)"
        />

        {/* Wave Curl Accent 1 (Ngọn sóng cuộn ukiyo-e) */}
        <path
          filter="url(#paperShadow)"
          d="M720,550 
             C700,530 680,490 710,470 
             C735,450 765,470 760,500 
             C755,530 735,545 720,550 Z"
          fill="#0052cc"
        />

        {/* Mid Layer 2: Vibrant Royal / HUKI Blue */}
        <path
          filter="url(#paperShadow)"
          d="M0,740 
             C150,710 260,820 440,780 
             C580,740 660,630 800,660 
             C900,680 940,620 1000,580 
             L1000,1000 L0,1000 Z"
          fill="url(#waveRoyalBlue)"
        />

        {/* Wave Curl Accent 2 */}
        <path
          filter="url(#paperShadow)"
          d="M440,780 
             C420,760 405,720 435,700 
             C460,685 485,705 480,735 
             C475,760 455,775 440,780 Z"
          fill="#38BDF8"
        />

        {/* Foreground Layer 3: Cyan / Sky Blue Surf */}
        <path
          filter="url(#paperShadow)"
          d="M0,860 
             C140,830 240,920 410,890 
             C550,860 630,760 760,790 
             C870,810 930,750 1000,710 
             L1000,1000 L0,1000 Z"
          fill="url(#waveSkyBlue)"
        />

        {/* Foam Crest Trim: Seafoam White / Light Cyan */}
        <path
          filter="url(#paperShadow)"
          d="M0,950 
             C120,930 210,990 360,960 
             C490,930 580,850 710,880 
             C820,900 890,850 1000,820 
             L1000,1000 L0,1000 Z"
          fill="url(#waveFoam)"
          opacity="0.9"
        />
      </svg>
    </div>
  );
};
