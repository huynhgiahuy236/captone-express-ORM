"use client";

import React from "react";
import { ImageItem } from "@/types";
import { PinCard } from "./PinCard";

interface MasonryGridProps {
  pins: ImageItem[];
  onSaveToggle?: (pinId: number, isSaved: boolean) => void;
  className?: string;
}

export const MasonryGrid: React.FC<MasonryGridProps> = ({ pins, onSaveToggle, className }) => {
  if (!pins || pins.length === 0) {
    return null;
  }

  return (
    <div
      className={
        className ||
        "w-full columns-2 gap-4 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 2xl:columns-7 [column-fill:_balance]"
      }
    >
      {pins.map((pin) => (
        <PinCard key={pin.hinh_id} pin={pin} onSaveToggle={onSaveToggle} />
      ))}
    </div>
  );
};
