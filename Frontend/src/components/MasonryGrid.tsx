"use client";

import React from "react";
import { ImageItem } from "@/types";
import { PinCard } from "./PinCard";

interface MasonryGridProps {
  pins: ImageItem[];
  onSaveToggle?: (pinId: number, isSaved: boolean) => void;
  className?: string;
  isSelectMode?: boolean;
  selectedIds?: number[];
  onToggleSelect?: (pinId: number) => void;
}

export const MasonryGrid: React.FC<MasonryGridProps> = ({
  pins,
  onSaveToggle,
  className,
  isSelectMode = false,
  selectedIds = [],
  onToggleSelect,
}) => {
  if (!pins || pins.length === 0) {
    return null;
  }

  const selectedSet = new Set(selectedIds);

  return (
    <div
      className={
        className ||
        "w-full columns-2 gap-4 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 2xl:columns-7 [column-fill:_balance]"
      }
    >
      {pins.map((pin) => (
        <PinCard
          key={pin.hinh_id}
          pin={pin}
          onSaveToggle={onSaveToggle}
          isSelectMode={isSelectMode}
          isSelected={selectedSet.has(pin.hinh_id)}
          onToggleSelect={onToggleSelect}
        />
      ))}
    </div>
  );
};
