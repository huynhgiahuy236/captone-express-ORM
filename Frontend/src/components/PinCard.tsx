"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ImageItem } from "@/types";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Bookmark, Share2, Heart } from "lucide-react";

interface PinCardProps {
  pin: ImageItem;
  onSaveToggle?: (pinId: number, isSaved: boolean) => void;
}

export const PinCard: React.FC<PinCardProps> = ({ pin, onSaveToggle }) => {
  const { user, openAuthModal } = useAuth();
  const [isSaved, setIsSaved] = useState<boolean>(pin.isSaved || false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLiked, setIsLiked] = useState<boolean>(pin.isLiked || false);
  const [likeCount, setLikeCount] = useState<number>(pin.likeCount || 0);
  const [isLiking, setIsLiking] = useState(false);

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      openAuthModal("login");
      return;
    }

    setIsSaving(true);
    try {
      const res = await api.post(`/saved-images/toggle/${pin.hinh_id}`);
      const savedStatus = res.data?.data?.isSaved ?? !isSaved;
      setIsSaved(savedStatus);
      if (savedStatus) {
        toast.success("Đã lưu vào hồ sơ của bạn!");
      } else {
        toast("Đã bỏ lưu ảnh", { icon: "🗑️" });
      }
      onSaveToggle?.(pin.hinh_id, savedStatus);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể thực hiện thao tác lưu");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      openAuthModal("login");
      return;
    }
    if (isLiking) return;
    setIsLiking(true);

    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikeCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const res = await api.post(`/likes/image/toggle/${pin.hinh_id}`);
      if (res.data?.data) {
        setIsLiked(res.data.data.isLiked);
        setLikeCount(res.data.data.likeCount);
        if (res.data.data.isLiked) {
          toast.success("Đã thả tim ý tưởng!");
        } else {
          toast("Đã bỏ thả tim", { icon: "🤍" });
        }
      }
    } catch (err: any) {
      setIsLiked(!nextState);
      setLikeCount((prev) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
      toast.error(err.response?.data?.message || "Không thể thả tim ảnh");
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(`${window.location.origin}/pin/${pin.hinh_id}`);
      toast.success("Đã sao chép liên kết ảnh!");
    }
  };

  return (
    <div className="group relative mb-4 break-inside-avoid">
      <Link href={`/pin/${pin.hinh_id}`} className="block">
        <div className="relative overflow-hidden rounded-2xl bg-gray-100 dark:bg-[#1c2136] dark:ring-1 dark:ring-[#2d2f40] shadow-xs transition duration-300 group-hover:shadow-lg">
          {/* Main Image with Brand Fallback */}
          <img
            src={pin.duong_dan}
            alt={pin.ten_hinh}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.src = "/fallback-pin.jpg";
            }}
            className="w-full object-cover transition-transform duration-300 group-hover:scale-101"
          />

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/30 opacity-0 transition-opacity duration-200 group-hover:opacity-100 p-3 flex flex-col justify-between pointer-events-none">
            {/* Top Bar inside image (Heart Like & Bookmark Save) */}
            <div className="flex items-center justify-between pointer-events-auto">
              {/* Heart Like Button (Circular) */}
              <button
                type="button"
                onClick={handleLikeToggle}
                disabled={isLiking}
                className={`flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md shadow-md transition active:scale-90 cursor-pointer ${
                  isLiked
                    ? "bg-rose-500 text-white"
                    : "bg-white/90 hover:bg-white dark:bg-[#1c2136]/90 dark:hover:bg-[#1c2136] text-gray-800 dark:text-white"
                }`}
                title={isLiked ? "Bỏ thích" : "Thả tim"}
              >
                <Heart
                  size={16}
                  className={`transition-transform duration-200 ${
                    isLiked ? "fill-white text-white scale-110" : "text-rose-500"
                  }`}
                />
              </button>

              {/* Save Button */}
              <button
                type="button"
                onClick={handleSaveToggle}
                disabled={isSaving}
                className={`rounded-full px-4 py-1.5 text-xs sm:text-sm font-bold shadow-md transition active:scale-95 cursor-pointer ${
                  isSaved
                    ? "bg-[#181C31] text-white hover:bg-[#252A42] border border-[#2d2f40]"
                    : "bg-[#0052cc] text-white hover:bg-[#0041a8]"
                }`}
              >
                {isSaving ? "..." : isSaved ? "Đã lưu" : "Lưu"}
              </button>
            </div>

            {/* Bottom Actions inside image */}
            <div className="flex justify-end items-center gap-2 pointer-events-auto">
              <button
                type="button"
                onClick={handleShare}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 dark:bg-[#1c2136]/90 text-gray-800 dark:text-white backdrop-blur-xs hover:bg-white active:scale-90 transition shadow-sm cursor-pointer"
                title="Chia sẻ liên kết"
              >
                <Share2 size={15} />
              </button>
            </div>
          </div>
        </div>
      </Link>

      {/* Pin Meta Info (Title & Author) */}
      <div className="mt-2 px-1">
        <h3 className="font-semibold text-sm line-clamp-1 break-words [overflow-wrap:anywhere]">
          <Link href={`/pin/${pin.hinh_id}`} className="text-gray-900 dark:text-white hover:text-[#0052cc] dark:hover:text-blue-400 transition-colors">
            {pin.ten_hinh}
          </Link>
        </h3>

        {pin.nguoi_dung && (
          <div className="mt-1 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-6 w-6 overflow-hidden rounded-full bg-gray-200 dark:bg-[#252A42] shrink-0 border border-gray-200 dark:border-[#2d2f40]">
                {pin.nguoi_dung.anh_dai_dien ? (
                  <img
                    src={pin.nguoi_dung.anh_dai_dien}
                    alt={pin.nguoi_dung.ho_ten || "User"}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-blue-100 dark:bg-blue-950 text-[10px] font-bold text-[#0052cc] dark:text-blue-400">
                    {(pin.nguoi_dung.ho_ten || pin.nguoi_dung.email || "U")[0].toUpperCase()}
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400 truncate font-medium">
                {pin.nguoi_dung.ho_ten || pin.nguoi_dung.email.split("@")[0]}
              </span>
            </div>

            {likeCount > 0 && (
              <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-500 shrink-0">
                <Heart size={11} className={isLiked ? "fill-rose-500" : ""} />
                <span>{likeCount}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
