"use client";

import React from "react";
import Link from "next/link";

interface HukiLogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  lightModeText?: boolean;
}

export const HukiLogo: React.FC<HukiLogoProps> = ({
  className = "",
  showText = true,
  size = "md",
  lightModeText = false,
}) => {
  const iconSizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2.5 group ${className}`}
      title="HUKI Inspire - Discovery • Share • Inspire"
    >
      {/* Solid Deep Blue HUKI Logo Badge */}
      <div className={`relative shrink-0 ${iconSizes[size]} transition-transform duration-200 group-hover:scale-105`}>
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Background Rounded Shield / Folder */}
          <rect x="14" y="16" width="72" height="68" rx="18" fill="#0052cc" />
          
          {/* Top Folder Tab */}
          <path d="M 28 16 C 28 10, 36 8, 44 8 L 56 8 C 64 8, 72 10, 72 16 Z" fill="#0041a8" />

          {/* Minimal Solid Clean 'H' wave shape */}
          <path
            d="M 32 34 L 42 34 L 42 46 L 58 46 L 58 34 L 68 34 L 68 66 L 58 66 L 58 54 L 42 54 L 42 66 L 32 66 Z"
            fill="#FFFFFF"
          />
        </svg>
      </div>

      {/* Brand Typography & Tagline */}
      {showText && (
        <div className="flex flex-col select-none">
          <div className="flex items-center gap-1.5 leading-none">
            <span
              className={`font-black tracking-tight ${
                lightModeText
                  ? "text-white"
                  : "text-[#0052cc] dark:text-blue-400"
              } ${textSizes[size]} transition-colors`}
            >
              HUKI
            </span>
            <span
              className={`font-bold tracking-tight ${
                lightModeText
                  ? "text-gray-200"
                  : "text-gray-900 dark:text-white"
              } ${textSizes[size]} transition-colors`}
            >
              Inspire
            </span>
          </div>
          <span
            className={`text-[9px] font-semibold tracking-wider uppercase mt-0.5 ${
              lightModeText
                ? "text-gray-300"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            Discovery • Share • Inspire
          </span>
        </div>
      )}
    </Link>
  );
};
