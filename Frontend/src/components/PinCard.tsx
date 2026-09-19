"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ImageItem } from "@/types";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Bookmark, Share2, Heart, Check } from "lucide-react";

interface PinCardProps {
  pin: ImageItem;
  onSaveToggle?: (pinId: number, isSaved: boolean) => void;
  isSelectMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (pinId: number) => void;
}

export const PinCard: React.FC<PinCardProps> = ({
  pin,
  onSaveToggle,
  isSelectMode = false,
  isSelected = false,
  onToggleSelect,
}) => {
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

  const handleCardClick = (e: React.MouseEvent) => {
    if (isSelectMode) {
      e.preventDefault();
      e.stopPropagation();
      onToggleSelect?.(pin.hinh_id);
    }
  };

  return (
    <div
      className={`group relative mb-4 break-inside-avoid transition-all duration-200 ${
        isSelectMode ? "cursor-pointer select-none" : ""
      }`}
      onClick={isSelectMode ? handleCardClick : undefined}
    >
      {/* If select mode, render a div wrapper instead of active Link */}
      {isSelectMode ? (
        <div className="block">
          <div
            className={`relative overflow-hidden rounded-2xl bg-gray-100 dark:bg-[#1c2136] shadow-xs transition duration-300 ${
              isSelected
                ? "ring-4 ring-[#0052cc] dark:ring-blue-500 shadow-xl scale-[0.98]"
                : "hover:ring-2 hover:ring-gray-300 dark:hover:ring-gray-600 dark:ring-1 dark:ring-[#2d2f40]"
            }`}
          >
            {/* Main Image */}
            <img
              src={pin.duong_dan}
              alt={pin.ten_hinh}
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = "/fallback-pin.jpg";
              }}
              className="w-full object-cover"
            />

            {/* Selection Checkbox Badge on Top-Left */}
            <div className="absolute top-3 left-3 z-10">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full shadow-md transition-all duration-200 ${
                  isSelected
                    ? "bg-[#0052cc] text-white ring-2 ring-white scale-110"
                    : "bg-black/40 backdrop-blur-xs text-white/50 border-2 border-white/70 hover:bg-black/60 hover:text-white"
                }`}
              >
                {isSelected ? <Check size={16} strokeWidth={3} /> : null}
              </div>
            </div>

            {/* Overlay if selected */}
            {isSelected && (
              <div className="absolute inset-0 bg-[#0052cc]/15 pointer-events-none" />
            )}

            {/* Category Tag */}
            {pin.the_loai && (
              <div className="absolute bottom-3 left-3 pointer-events-none">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/65 text-white backdrop-blur-md shadow-xs border border-white/10">
                  {pin.the_loai}
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
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

              {/* Bottom Actions inside image (Category Badge & Share Button) */}
              <div className="flex justify-between items-center gap-2 pointer-events-auto">
                {pin.the_loai ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.location.href = `/category/${encodeURIComponent(pin.the_loai!)}`;
                    }}
                    className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/65 hover:bg-black/90 text-white backdrop-blur-md shadow-xs border border-white/10 hover:border-white/30 transition cursor-pointer"
                    title={`Xem thể loại ${pin.the_loai}`}
                  >
                    {pin.the_loai}
                  </button>
                ) : <div />}
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
      )}

      {/* Pin Meta Info (Title & Author) */}
      <div className="mt-2 px-1">
        <h3 className="font-semibold text-sm line-clamp-1 break-words [overflow-wrap:anywhere]">
          {isSelectMode ? (
            <span className="text-gray-900 dark:text-white">{pin.ten_hinh}</span>
          ) : (
            <Link href={`/pin/${pin.hinh_id}`} className="text-gray-900 dark:text-white hover:text-[#0052cc] dark:hover:text-blue-400 transition-colors">
              {pin.ten_hinh}
            </Link>
          )}
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
