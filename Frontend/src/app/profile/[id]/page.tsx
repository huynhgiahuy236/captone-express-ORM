"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { User, ImageItem, CommentItem } from "@/types";
import { MasonryGrid } from "@/components/MasonryGrid";
import {
  Loader2,
  ArrowLeft,
  ImageOff,
  Share2,
  Sparkles,
  Layers,
  Calendar,
  Heart,
  MessageCircle,
  ExternalLink,
  Search,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

function ProfileTabSkeleton({ isComments = false }: { isComments?: boolean }) {
  if (isComments) {
    return (
      <div className="space-y-3.5 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-4 rounded-2xl bg-white dark:bg-[#1c2136] border border-gray-100 dark:border-[#2d2f40] shadow-xs flex flex-col sm:flex-row items-start gap-4"
          >
            <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl bg-gray-200 dark:bg-[#252A42] shrink-0" />
            <div className="flex-1 min-w-0 w-full space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-[#252A42]" />
                  <div className="h-3.5 w-24 rounded-md bg-gray-200 dark:bg-[#252A42]" />
                </div>
                <div className="h-3 w-16 rounded-md bg-gray-200 dark:bg-[#252A42]" />
              </div>
              <div className="h-3.5 w-full rounded-md bg-gray-200 dark:bg-[#252A42]" />
              <div className="h-3.5 w-3/4 rounded-md bg-gray-200 dark:bg-[#252A42]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full columns-2 sm:columns-3 md:columns-4 lg:columns-4 xl:columns-5 2xl:columns-6 gap-4 [column-fill:_balance] animate-pulse">
      {[180, 260, 210, 300, 190, 240, 280, 200, 230, 270].map((h, i) => (
        <div
          key={i}
          className="mb-4 rounded-2xl bg-gray-200 dark:bg-[#252A42] overflow-hidden"
          style={{ height: `${h}px` }}
        />
      ))}
    </div>
  );
}

export default function PublicUserProfilePage() {
  const params = useParams();
  const userId = params?.id as string;
  const router = useRouter();

  const [author, setAuthor] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<"created" | "liked_pins" | "liked_comments">("created");
  const [createdPins, setCreatedPins] = useState<ImageItem[]>([]);
  const [likedPins, setLikedPins] = useState<ImageItem[]>([]);
  const [likedComments, setLikedComments] = useState<CommentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isFiltering, setIsFiltering] = useState(false);
  const [loading, setLoading] = useState(true);

  // 2-second Debounce Effect for search query
  useEffect(() => {
    if (searchQuery !== debouncedQuery) {
      setIsFiltering(true);
      const timer = setTimeout(() => {
        setDebouncedQuery(searchQuery);
        setIsFiltering(false);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setIsFiltering(false);
    }
  }, [searchQuery, debouncedQuery]);

  // Filtered lists based on 2s debounced search query
  const filteredCreatedPins = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return createdPins;
    return createdPins.filter(
      (p) =>
        p.ten_hinh?.toLowerCase().includes(q) ||
        p.mo_ta?.toLowerCase().includes(q)
    );
  }, [createdPins, debouncedQuery]);

  const filteredLikedPins = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return likedPins;
    return likedPins.filter(
      (p) =>
        p.ten_hinh?.toLowerCase().includes(q) ||
        p.mo_ta?.toLowerCase().includes(q)
    );
  }, [likedPins, debouncedQuery]);

  const filteredLikedComments = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return likedComments;
    return likedComments.filter(
      (c) =>
        c.noi_dung?.toLowerCase().includes(q) ||
        c.nguoi_dung?.ho_ten?.toLowerCase().includes(q) ||
        c.hinh_anh?.ten_hinh?.toLowerCase().includes(q)
    );
  }, [likedComments, debouncedQuery]);

  useEffect(() => {
    if (!userId) return;

    const loadAuthorData = async () => {
      setLoading(true);
      try {
        const [userRes, pinsRes, likedPinsRes, likedCommentsRes] = await Promise.all([
          api.get(`/users/${userId}`).catch(() => ({ data: { data: null } })),
          api.get(`/users/created-images/${userId}`).catch(() => ({ data: { data: [] } })),
          api.get(`/users/liked-images/${userId}`).catch(() => ({ data: { data: [] } })),
          api.get(`/users/liked-comments/${userId}`).catch(() => ({ data: { data: [] } })),
        ]);

        if (userRes.data?.data) {
          setAuthor(userRes.data.data);
        }

        const pins = pinsRes.data?.data || [];
        setCreatedPins(pins);
        setLikedPins(likedPinsRes.data?.data || []);
        setLikedComments(likedCommentsRes.data?.data || []);

        if (!author && pins.length > 0 && pins[0].nguoi_dung) {
          setAuthor(pins[0].nguoi_dung);
        }
      } catch (err) {
        console.error("Failed to load author profile", err);
      } finally {
        setLoading(false);
      }
    };

    loadAuthorData();
  }, [userId]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Đã sao chép liên kết trang cá nhân tác giả!");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh]">
        <Loader2 className="h-10 w-10 animate-spin text-[#0052cc]" />
        <p className="mt-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Đang tải hồ sơ nhà sáng tạo...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1920px] 2xl:max-w-[2100px] w-full mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 py-4 sm:py-6">
      
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="mb-4 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-bold bg-white dark:bg-[#1c2136] border border-gray-200 dark:border-[#2d2f40] hover:bg-gray-100 dark:hover:bg-[#252A42] text-gray-700 dark:text-gray-200 transition cursor-pointer"
      >
        <ArrowLeft size={16} />
        <span>Quay lại</span>
      </button>

      {/* Two-Column Split Layout */}
      <div className="flex flex-col lg:flex-row items-start gap-6 xl:gap-8 min-w-0 max-w-full">
        
        {/* ================= LEFT COLUMN: Author Info Sidebar ================= */}
        <div className="w-full lg:w-[440px] xl:w-[480px] 2xl:w-[520px] shrink-0 min-w-0 lg:sticky lg:top-24 space-y-5">
          <div className="rounded-3xl bg-white dark:bg-[#1c2136] border border-gray-100 dark:border-[#2d2f40] p-6 sm:p-8 shadow-sm text-center relative overflow-hidden">

            {/* Avatar */}
            <div className="relative inline-block mt-2">
              <div className="relative h-32 w-32 sm:h-36 sm:w-36 rounded-full border-4 border-white dark:border-[#1c2136] shadow-md overflow-hidden bg-gray-100 dark:bg-[#252A42] ring-2 ring-[#0052cc]/30">
                {author?.anh_dai_dien ? (
                  <img
                    src={author.anh_dai_dien}
                    alt={author.ho_ten || "Avatar"}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-blue-50 dark:bg-[#252A42] text-4xl sm:text-5xl font-black text-[#0052cc] dark:text-blue-400">
                    {(author?.ho_ten || author?.email || "U")[0]?.toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Name & Details */}
            <h1 className="mt-4 text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {author?.ho_ten || "Tác giả sáng tạo"}
            </h1>
            {author?.email && (
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mt-1 truncate">
                {author.email}
              </p>
            )}

            {author?.tuoi && (
              <div className="inline-flex items-center gap-1.5 mt-2.5 px-3.5 py-1 rounded-full text-xs font-bold text-[#0052cc] dark:text-blue-400 bg-blue-50 dark:bg-[#252A42] border border-blue-100 dark:border-[#2d2f40]">
                🎂 {author.tuoi} tuổi
              </div>
            )}

            {/* Bio / Status Box */}
            <div className="mt-6 rounded-2xl bg-gray-50 dark:bg-[#252A42] border border-gray-100 dark:border-[#2d2f40] p-4 sm:p-5 text-left">
              <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <Sparkles size={13} className="text-[#0052cc] dark:text-blue-400" />
                Tiểu sử tác giả
              </span>
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-200 italic leading-relaxed">
                {author?.mo_ta ? (
                  `"${author.mo_ta}"`
                ) : (
                  <span className="text-gray-400 dark:text-gray-400 not-italic">
                    Nhà sáng tạo nội dung trên nền tảng HUKI Inspire.
                  </span>
                )}
              </p>
            </div>

            {/* Interactive 3-Grid Stats */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              <div
                onClick={() => setActiveTab("created")}
                className={`rounded-2xl p-3.5 text-center border cursor-pointer transition ${
                  activeTab === "created"
                    ? "bg-blue-50/70 dark:bg-[#2d3352] border-[#0052cc]/40 ring-1 ring-[#0052cc]/30"
                    : "bg-gray-50 dark:bg-[#252A42] border-gray-100 dark:border-[#2d2f40] hover:border-[#0052cc]/30"
                }`}
              >
                <span className="text-xl font-black text-gray-900 dark:text-white block">
                  {createdPins.length}
                </span>
                <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                  Tác phẩm
                </span>
              </div>
              <div
                onClick={() => setActiveTab("liked_pins")}
                className={`rounded-2xl p-3.5 text-center border cursor-pointer transition ${
                  activeTab === "liked_pins"
                    ? "bg-rose-50/70 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900/50 ring-1 ring-rose-500/30"
                    : "bg-gray-50 dark:bg-[#252A42] border-gray-100 dark:border-[#2d2f40] hover:border-rose-300/40"
                }`}
              >
                <span className="text-xl font-black text-rose-500 dark:text-rose-400 block">
                  {likedPins.length}
                </span>
                <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                  Ảnh thích
                </span>
              </div>
              <div
                onClick={() => setActiveTab("liked_comments")}
                className={`rounded-2xl p-3.5 text-center border cursor-pointer transition ${
                  activeTab === "liked_comments"
                    ? "bg-rose-50/70 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900/50 ring-1 ring-rose-500/30"
                    : "bg-gray-50 dark:bg-[#252A42] border-gray-100 dark:border-[#2d2f40] hover:border-rose-300/40"
                }`}
              >
                <span className="text-xl font-black text-rose-500 dark:text-rose-400 block">
                  {likedComments.length}
                </span>
                <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                  Bình luận
                </span>
              </div>
            </div>

            {/* Share Button */}
            <div className="mt-6">
              <button
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-[#0052cc] hover:bg-[#0041a8] py-3 px-4 text-xs sm:text-sm font-bold text-white shadow-xs active:scale-98 transition cursor-pointer"
              >
                <Share2 size={15} />
                <span>Chia sẻ tác giả</span>
              </button>
            </div>

          </div>
        </div>

        {/* ================= RIGHT COLUMN: Pins Grid & Tabs ================= */}
        <div className="flex-1 min-w-0 w-full">
          
          {/* Tabs & Search Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-gray-200 dark:border-[#2d2f40] pb-3 mb-6">
            
            {/* Tabs List */}
            <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto [scrollbar-width:none] shrink-0">
              <button
                onClick={() => setActiveTab("created")}
                className={`pb-2 text-xs sm:text-sm font-bold transition relative cursor-pointer ${
                  activeTab === "created"
                    ? "text-[#0052cc] dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-white"
                }`}
              >
                <span>Tác phẩm đã tạo</span>
                <span className="ml-1 text-xs opacity-75">
                  ({searchQuery.trim() ? `${filteredCreatedPins.length}/${createdPins.length}` : createdPins.length})
                </span>
                {activeTab === "created" && (
                  <span className="absolute -bottom-3 left-0 right-0 h-1 bg-[#0052cc] dark:bg-blue-400 rounded-full" />
                )}
              </button>

              <button
                onClick={() => setActiveTab("liked_pins")}
                className={`pb-2 text-xs sm:text-sm font-bold transition relative cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "liked_pins"
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-rose-500"
                }`}
              >
                <Heart size={14} className={activeTab === "liked_pins" ? "fill-rose-500 text-rose-500" : ""} />
                <span>Ảnh đã thích</span>
                <span className="text-xs opacity-75">
                  ({searchQuery.trim() ? `${filteredLikedPins.length}/${likedPins.length}` : likedPins.length})
                </span>
                {activeTab === "liked_pins" && (
                  <span className="absolute -bottom-3 left-0 right-0 h-1 bg-rose-500 rounded-full" />
                )}
              </button>

              <button
                onClick={() => setActiveTab("liked_comments")}
                className={`pb-2 text-xs sm:text-sm font-bold transition relative cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "liked_comments"
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-rose-500"
                }`}
              >
                <MessageCircle size={14} />
                <span>Bình luận đã thích</span>
                <span className="text-xs opacity-75">
                  ({searchQuery.trim() ? `${filteredLikedComments.length}/${likedComments.length}` : likedComments.length})
                </span>
                {activeTab === "liked_comments" && (
                  <span className="absolute -bottom-3 left-0 right-0 h-1 bg-rose-500 rounded-full" />
                )}
              </button>
            </div>

            {/* Quick Search Filter Input with 2s debounce loading indicator */}
            <div className="relative flex items-center w-full md:w-auto min-w-[200px] sm:min-w-[250px]">
              <Search size={14} className="absolute left-3 text-gray-400 dark:text-gray-500 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === "created"
                    ? "Lọc tác phẩm..."
                    : activeTab === "liked_pins"
                    ? "Lọc ảnh đã thích..."
                    : "Lọc bình luận..."
                }
                className="w-full pl-8 pr-8 py-1.5 rounded-full bg-gray-100 dark:bg-[#252A42] border border-transparent focus:border-[#0052cc] text-xs font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-hidden transition shadow-2xs"
              />
              <div className="absolute right-2.5 flex items-center gap-1.5">
                {isFiltering ? (
                  <Loader2 size={14} className="animate-spin text-[#0052cc] dark:text-blue-400" />
                ) : searchQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setDebouncedQuery("");
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                    title="Xóa tìm kiếm"
                  >
                    <X size={13} />
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          {/* Tab 1: Created Pins */}
          {activeTab === "created" && (
            isFiltering ? (
              <ProfileTabSkeleton />
            ) : createdPins.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-3xl bg-gray-50/60 dark:bg-[#1c2136]/50 border border-dashed border-gray-200 dark:border-[#2d2f40]">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 dark:bg-[#252A42] text-[#0052cc] dark:text-blue-400 mb-3.5">
                  <ImageOff size={26} />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200">
                  Tác giả này chưa đăng tác phẩm nào
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
                  Hãy quay lại sau để theo dõi những cảm hứng sáng tạo mới nhất từ tác giả!
                </p>
              </div>
            ) : filteredCreatedPins.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 px-4 text-center rounded-3xl bg-gray-50/60 dark:bg-[#1c2136]/50 border border-dashed border-gray-200 dark:border-[#2d2f40]">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-[#252A42] text-gray-400 mb-3">
                  <Search size={20} />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-200">
                  Không tìm thấy tác phẩm phù hợp với &quot;{debouncedQuery || searchQuery}&quot;
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setDebouncedQuery("");
                  }}
                  className="mt-2.5 text-xs font-bold text-[#0052cc] dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Xóa bộ lọc tìm kiếm
                </button>
              </div>
            ) : (
              <MasonryGrid
                pins={filteredCreatedPins}
                className="w-full columns-2 sm:columns-3 md:columns-4 lg:columns-4 xl:columns-5 2xl:columns-6 gap-4 [column-fill:_balance]"
              />
            )
          )}

          {/* Tab 2: Liked Pins */}
          {activeTab === "liked_pins" && (
            isFiltering ? (
              <ProfileTabSkeleton />
            ) : likedPins.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-3xl bg-gray-50/60 dark:bg-[#1c2136]/50 border border-dashed border-gray-200 dark:border-[#2d2f40]">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 mb-3.5">
                  <Heart size={26} />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200">
                  Chưa có ảnh nào được tác giả thả tim
                </h3>
              </div>
            ) : filteredLikedPins.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 px-4 text-center rounded-3xl bg-gray-50/60 dark:bg-[#1c2136]/50 border border-dashed border-gray-200 dark:border-[#2d2f40]">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-400 mb-3">
                  <Search size={20} />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-200">
                  Không tìm thấy ảnh đã thích phù hợp với &quot;{debouncedQuery || searchQuery}&quot;
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setDebouncedQuery("");
                  }}
                  className="mt-2.5 text-xs font-bold text-[#0052cc] dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Xóa bộ lọc tìm kiếm
                </button>
              </div>
            ) : (
              <MasonryGrid
                pins={filteredLikedPins}
                className="w-full columns-2 sm:columns-3 md:columns-4 lg:columns-4 xl:columns-5 2xl:columns-6 gap-4 [column-fill:_balance]"
              />
            )
          )}

          {/* Tab 3: Liked Comments */}
          {activeTab === "liked_comments" && (
            isFiltering ? (
              <ProfileTabSkeleton isComments />
            ) : likedComments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-3xl bg-gray-50/60 dark:bg-[#1c2136]/50 border border-dashed border-gray-200 dark:border-[#2d2f40]">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 mb-3.5">
                  <MessageCircle size={26} />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200">
                  Chưa có bình luận nào được tác giả thả tim
                </h3>
              </div>
            ) : filteredLikedComments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 px-4 text-center rounded-3xl bg-gray-50/60 dark:bg-[#1c2136]/50 border border-dashed border-gray-200 dark:border-[#2d2f40]">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-400 mb-3">
                  <Search size={20} />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-200">
                  Không tìm thấy bình luận phù hợp với &quot;{debouncedQuery || searchQuery}&quot;
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setDebouncedQuery("");
                  }}
                  className="mt-2.5 text-xs font-bold text-[#0052cc] dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Xóa bộ lọc tìm kiếm
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredLikedComments.map((c) => (
                  <div
                    key={c.binh_luan_id}
                    className="p-4 rounded-2xl bg-white dark:bg-[#1c2136] border border-gray-100 dark:border-[#2d2f40] shadow-xs flex flex-col sm:flex-row items-start gap-4 transition hover:border-[#0052cc]/30"
                  >
                    {c.hinh_anh && (
                      <Link
                        href={`/pin/${c.hinh_id}`}
                        className="group/thumb relative h-20 w-20 sm:h-24 sm:w-24 rounded-xl overflow-hidden bg-gray-100 dark:bg-[#252A42] shrink-0 border border-gray-200/60 dark:border-white/5"
                      >
                        <img
                          src={c.hinh_anh.duong_dan}
                          alt={c.hinh_anh.ten_hinh}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover/thumb:scale-105"
                          onError={(e) => {
                            e.currentTarget.src = "/fallback-pin.jpg";
                          }}
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/thumb:opacity-100 transition flex items-center justify-center text-white">
                          <ExternalLink size={16} />
                        </div>
                      </Link>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="h-6 w-6 rounded-full overflow-hidden bg-gray-200 dark:bg-[#252A42] shrink-0">
                            {c.nguoi_dung?.anh_dai_dien ? (
                              <img
                                src={c.nguoi_dung.anh_dai_dien}
                                alt={c.nguoi_dung.ho_ten || "Author"}
                                referrerPolicy="no-referrer"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-[10px] font-bold bg-blue-100 dark:bg-[#252A42] text-[#0052cc] dark:text-blue-400">
                                {(c.nguoi_dung?.ho_ten || c.nguoi_dung?.email || "U")[0].toUpperCase()}
                              </div>
                            )}
                          </div>
                          <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                            {c.nguoi_dung?.ho_ten || c.nguoi_dung?.email || "Người dùng"}
                          </span>
                        </div>

                        <span className="text-[10px] text-gray-400 shrink-0">
                          {new Date(c.ngay_binh_luan).toLocaleDateString("vi-VN")}
                        </span>
                      </div>

                      <p className="mt-2 text-xs sm:text-sm text-gray-800 dark:text-gray-200 leading-relaxed break-words [overflow-wrap:anywhere] whitespace-pre-wrap">
                        {c.noi_dung}
                      </p>

                      {c.hinh_anh && (
                        <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-100 dark:border-white/5">
                          <Link
                            href={`/pin/${c.hinh_id}`}
                            className="text-xs font-semibold text-[#0052cc] dark:text-blue-400 hover:underline truncate flex items-center gap-1"
                          >
                            <span>Ghim: {c.hinh_anh.ten_hinh}</span>
                          </Link>
                          <div className="inline-flex items-center gap-1 text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full shrink-0">
                            <Heart size={11} className="fill-rose-500" />
                            <span>Đã thả tim</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

        </div>

      </div>

    </div>
  );
}
