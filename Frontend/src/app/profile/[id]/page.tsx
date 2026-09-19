"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { User, ImageItem, CommentItem } from "@/types";
import { MasonryGrid } from "@/components/MasonryGrid";
import { smartFilterPins, smartFilterComments } from "@/lib/smart-search";
import { useAuth } from "@/lib/auth-context";
import { FollowListModal } from "@/components/FollowListModal";
import {
  Loader2,
  ArrowLeft,
  ImageOff,
  Share2,
  Layers,
  Search,
  X,
  UserPlus,
  UserCheck,
  Bookmark,
  Heart,
  MessageCircle,
  Lock,
  ExternalLink,
  FolderHeart,
} from "lucide-react";
import toast from "react-hot-toast";

function PrivateBadge({ title = "Quyền riêng tư đã được bật" }: { title?: string }) {
  return (
    <span
      title={title}
      className="inline-flex items-center justify-center shrink-0 ml-1"
    >
      <img
        src="/icon-block-see.png"
        alt="Quyền riêng tư"
        className="h-4 w-4 object-contain opacity-75 dark:invert dark:opacity-85"
      />
    </span>
  );
}

function ProfileTabSkeleton({ isComments = false }: { isComments?: boolean }) {
  if (isComments) {
    return (
      <div className="space-y-3.5 animate-pulse">
        {[1, 2, 3].map((i) => (
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
  const { user: currentUser, openAuthModal } = useAuth();

  const [author, setAuthor] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<"created" | "saved" | "liked_pins" | "liked_comments">("created");
  const [createdPins, setCreatedPins] = useState<ImageItem[]>([]);
  const [savedPins, setSavedPins] = useState<ImageItem[]>([]);
  const [likedPins, setLikedPins] = useState<ImageItem[]>([]);
  const [likedComments, setLikedComments] = useState<CommentItem[]>([]);
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [isFollowLoading, setIsFollowLoading] = useState<boolean>(false);

  // Follow Modal state
  const [isFollowModalOpen, setIsFollowModalOpen] = useState(false);
  const [followModalInitialTab, setFollowModalInitialTab] = useState<"followers" | "following">("followers");

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isFiltering, setIsFiltering] = useState(false);
  const [loading, setLoading] = useState(true);

  // If author is current user, redirect to /profile
  useEffect(() => {
    if (currentUser && String(currentUser.nguoi_dung_id) === String(userId)) {
      router.replace("/profile");
    }
  }, [currentUser, userId, router]);

  // 1-second Debounce Effect for search query
  useEffect(() => {
    if (searchQuery !== debouncedQuery) {
      setIsFiltering(true);
      const timer = setTimeout(() => {
        setDebouncedQuery(searchQuery);
        setIsFiltering(false);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsFiltering(false);
    }
  }, [searchQuery, debouncedQuery]);

  // Smart Relevance Search: Filtered lists
  const filteredCreatedPins = useMemo(() => {
    return smartFilterPins(createdPins, debouncedQuery);
  }, [createdPins, debouncedQuery]);

  const filteredSavedPins = useMemo(() => {
    return smartFilterPins(savedPins, debouncedQuery);
  }, [savedPins, debouncedQuery]);

  const filteredLikedPins = useMemo(() => {
    return smartFilterPins(likedPins, debouncedQuery);
  }, [likedPins, debouncedQuery]);

  const filteredLikedComments = useMemo(() => {
    return smartFilterComments(likedComments, debouncedQuery);
  }, [likedComments, debouncedQuery]);

  const loadAuthorData = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const userRes = await api.get(`/users/${userId}`).catch(() => ({ data: { data: null } }));
      const u = userRes.data?.data;

      if (u) {
        setAuthor(u);
        setFollowersCount(u.followersCount || 0);
        setFollowingCount(u.followingCount || 0);
        setIsFollowing(Boolean(u.isFollowing));

        // Load tabs in parallel based on privacy permissions
        const promises = [
          u.canViewCreated
            ? api.get(`/users/created-images/${userId}`).catch(() => ({ data: { data: [] } }))
            : Promise.resolve({ data: { data: [] } }),
          u.canViewSaved
            ? api.get(`/users/saved-images/${userId}`).catch(() => ({ data: { data: [] } }))
            : Promise.resolve({ data: { data: [] } }),
          u.canViewLikedPins
            ? api.get(`/users/liked-images/${userId}`).catch(() => ({ data: { data: [] } }))
            : Promise.resolve({ data: { data: [] } }),
          u.canViewLikedComments
            ? api.get(`/users/liked-comments/${userId}`).catch(() => ({ data: { data: [] } }))
            : Promise.resolve({ data: { data: [] } }),
        ];

        const [createdRes, savedRes, likedPinsRes, likedCommentsRes] = await Promise.all(promises);
        setCreatedPins(createdRes?.data?.data || []);
        setSavedPins(savedRes?.data?.data || []);
        setLikedPins(likedPinsRes?.data?.data || []);
        setLikedComments(likedCommentsRes?.data?.data || []);
      }
    } catch (err) {
      console.error("Failed to load author profile", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuthorData();
  }, [userId, currentUser]);

  const handleToggleFollow = async () => {
    if (!currentUser) {
      openAuthModal("login");
      return;
    }

    if (isFollowLoading || !userId) return;

    setIsFollowLoading(true);
    try {
      const res = await api.post(`/follow/${userId}`);
      if (res.data?.data) {
        const nextState = res.data.data.isFollowing;
        setIsFollowing(nextState);
        setFollowersCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));
        toast.success(res.data.data.message || (nextState ? "Đã theo dõi tác giả!" : "Đã hủy theo dõi!"));
        // Re-evaluate privacy permissions and load newly unlocked tabs
        await loadAuthorData();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Không thể thực hiện thao tác theo dõi!";
      toast.error(msg);
    } finally {
      setIsFollowLoading(false);
    }
  };

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

  // Get current active tab privacy state
  const getCurrentTabPrivacy = () => {
    const priv = author?.privacySettings || {
      created: "PUBLIC",
      saved: "PUBLIC",
      liked_pins: "PUBLIC",
      liked_comments: "PUBLIC",
    };
    switch (activeTab) {
      case "created":
        return { isLocked: author?.canViewCreated === false, setting: priv.created || "PUBLIC", label: "Tác phẩm đã tạo" };
      case "saved":
        return { isLocked: author?.canViewSaved === false, setting: priv.saved || "PUBLIC", label: "Folder & Ghim đã lưu" };
      case "liked_pins":
        return { isLocked: author?.canViewLikedPins === false, setting: priv.liked_pins || "PUBLIC", label: "Ảnh đã thích" };
      case "liked_comments":
        return { isLocked: author?.canViewLikedComments === false, setting: priv.liked_comments || "PUBLIC", label: "Bình luận đã thích" };
    }
  };

  const currentTabPrivacy = getCurrentTabPrivacy();

  return (
    <div className="max-w-[1920px] 2xl:max-w-[2100px] w-full mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 py-4 sm:py-6 pb-28">
      
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

            {/* Follow Stats (Clickable to open FollowListModal if permitted) */}
            <div className="flex items-center justify-center gap-6 mt-4 py-2 px-4 rounded-2xl bg-gray-50/80 dark:bg-[#252A42]/60 border border-gray-100 dark:border-[#2d2f40]">
              <button
                type="button"
                onClick={() => {
                  if (author?.canViewFollowers === false) {
                    toast.error("Tác giả đã cài đặt riêng tư cho danh sách người theo dõi");
                    return;
                  }
                  setFollowModalInitialTab("followers");
                  setIsFollowModalOpen(true);
                }}
                className="text-center group cursor-pointer hover:opacity-80 transition"
                title={author?.canViewFollowers === false ? "Danh sách riêng tư" : "Xem danh sách người theo dõi"}
              >
                <div className="flex items-center justify-center gap-1">
                  <span className="block text-base sm:text-lg font-black text-gray-900 dark:text-white group-hover:text-[#0052cc] dark:group-hover:text-blue-400">
                    {followersCount}
                  </span>
                  {author?.canViewFollowers === false && <Lock size={12} className="text-amber-500 dark:text-amber-400" />}
                </div>
                <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                  Người theo dõi
                </span>
              </button>
              <div className="h-6 w-px bg-gray-200 dark:bg-[#2d2f40]" />
              <button
                type="button"
                onClick={() => {
                  if (author?.canViewFollowing === false) {
                    toast.error("Tác giả đã cài đặt riêng tư cho danh sách đang theo dõi");
                    return;
                  }
                  setFollowModalInitialTab("following");
                  setIsFollowModalOpen(true);
                }}
                className="text-center group cursor-pointer hover:opacity-80 transition"
                title={author?.canViewFollowing === false ? "Danh sách riêng tư" : "Xem danh sách đang theo dõi"}
              >
                <div className="flex items-center justify-center gap-1">
                  <span className="block text-base sm:text-lg font-black text-gray-900 dark:text-white group-hover:text-[#0052cc] dark:group-hover:text-blue-400">
                    {followingCount}
                  </span>
                  {author?.canViewFollowing === false && <Lock size={12} className="text-amber-500 dark:text-amber-400" />}
                </div>
                <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                  Đang theo dõi
                </span>
              </button>
            </div>

            {/* Bio / Status Box */}
            <div className="mt-5 rounded-2xl bg-gray-50 dark:bg-[#252A42] border border-gray-100 dark:border-[#2d2f40] p-4 sm:p-5 text-left">
              <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1.5">
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

            {/* Actions: Follow / Unfollow + Share */}
            <div className="mt-6 space-y-2.5">
              <button
                type="button"
                disabled={isFollowLoading}
                onClick={handleToggleFollow}
                className={`w-full flex items-center justify-center gap-2 rounded-full py-3 px-4 text-xs sm:text-sm font-bold shadow-xs active:scale-98 transition cursor-pointer ${
                  isFollowing
                    ? "bg-gray-100 dark:bg-[#252A42] hover:bg-gray-200 dark:hover:bg-[#2e3450] text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-[#2d2f40]"
                    : "bg-[#0052cc] hover:bg-[#0041a8] text-white"
                }`}
              >
                {isFollowLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : isFollowing ? (
                  <>
                    <UserCheck size={16} className="text-[#0052cc] dark:text-blue-400" />
                    <span>Đang theo dõi</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={16} />
                    <span>Theo dõi tác giả</span>
                  </>
                )}
              </button>

              <button
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-gray-100 dark:bg-[#252A42] hover:bg-gray-200 dark:hover:bg-[#2e3450] py-3 px-4 text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-200 active:scale-98 transition cursor-pointer border border-transparent dark:border-[#2d2f40]"
              >
                <Share2 size={15} />
                <span>Chia sẻ tác giả</span>
              </button>
            </div>

          </div>
        </div>

        {/* ================= RIGHT COLUMN: Author's Pins Grid & Dynamic Tabs ================= */}
        <div className="flex-1 min-w-0 w-full">
          
          {/* Section Header & Tabs & Smart Search Filter Bar */}
          <div className="flex flex-col gap-3 border-b border-gray-200 dark:border-[#2d2f40] pb-3 mb-6">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Dynamic Tabs based on Author Privacy Settings */}
              <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto [scrollbar-width:none] shrink-0">
                {/* 1. Created Pins Tab */}
                <button
                  type="button"
                  onClick={() => setActiveTab("created")}
                  className={`flex items-center gap-1.5 pb-2 text-xs sm:text-sm font-bold transition border-b-2 cursor-pointer ${
                    activeTab === "created"
                      ? "border-[#0052cc] text-[#0052cc] dark:text-blue-400"
                      : author?.canViewCreated === false
                      ? "border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                      : "border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <Layers size={17} />
                  <span>Tác phẩm đã tạo</span>
                  {author?.canViewCreated ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-[#252A42] font-semibold text-gray-600 dark:text-gray-300">
                      {createdPins.length}
                    </span>
                  ) : (
                    <PrivateBadge title="Tác giả đã cài đặt riêng tư" />
                  )}
                </button>

                {/* 2. Saved Pins Tab */}
                <button
                  type="button"
                  onClick={() => setActiveTab("saved")}
                  className={`flex items-center gap-1.5 pb-2 text-xs sm:text-sm font-bold transition border-b-2 cursor-pointer ${
                    activeTab === "saved"
                      ? "border-[#0052cc] text-[#0052cc] dark:text-blue-400"
                      : author?.canViewSaved === false
                      ? "border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                      : "border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <Bookmark size={17} />
                  <span>Folder & Ghim đã lưu</span>
                  {author?.canViewSaved ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-[#252A42] font-semibold text-gray-600 dark:text-gray-300">
                      {savedPins.length}
                    </span>
                  ) : (
                    <PrivateBadge title="Tác giả đã cài đặt riêng tư" />
                  )}
                </button>

                {/* 3. Liked Pins Tab */}
                <button
                  type="button"
                  onClick={() => setActiveTab("liked_pins")}
                  className={`flex items-center gap-1.5 pb-2 text-xs sm:text-sm font-bold transition border-b-2 cursor-pointer ${
                    activeTab === "liked_pins"
                      ? "border-[#0052cc] text-[#0052cc] dark:text-blue-400"
                      : author?.canViewLikedPins === false
                      ? "border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                      : "border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <Heart
                    size={17}
                    className={activeTab === "liked_pins" ? "fill-rose-500 text-rose-500" : ""}
                  />
                  <span>Ảnh đã thích</span>
                  {author?.canViewLikedPins ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-[#252A42] font-semibold text-gray-600 dark:text-gray-300">
                      {likedPins.length}
                    </span>
                  ) : (
                    <PrivateBadge title="Tác giả đã cài đặt riêng tư" />
                  )}
                </button>

                {/* 4. Liked Comments Tab */}
                <button
                  type="button"
                  onClick={() => setActiveTab("liked_comments")}
                  className={`flex items-center gap-1.5 pb-2 text-xs sm:text-sm font-bold transition border-b-2 cursor-pointer ${
                    activeTab === "liked_comments"
                      ? "border-[#0052cc] text-[#0052cc] dark:text-blue-400"
                      : author?.canViewLikedComments === false
                      ? "border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                      : "border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <MessageCircle size={17} />
                  <span>Bình luận đã thích</span>
                  {author?.canViewLikedComments ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-[#252A42] font-semibold text-gray-600 dark:text-gray-300">
                      {likedComments.length}
                    </span>
                  ) : (
                    <PrivateBadge title="Tác giả đã cài đặt riêng tư" />
                  )}
                </button>
              </div>

              {/* Smart Relevance Search Filter Input with 1s debounce */}
              {!currentTabPrivacy.isLocked && (
                <div className="relative flex items-center w-full md:w-auto min-w-[200px] sm:min-w-[240px]">
                  <Search size={14} className="absolute left-3 text-gray-400 dark:text-gray-500 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Tìm trong ${
                      activeTab === "created"
                        ? "tác phẩm..."
                        : activeTab === "saved"
                        ? "ghim đã lưu..."
                        : activeTab === "liked_pins"
                        ? "ảnh đã thích..."
                        : "bình luận..."
                    }`}
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
              )}
            </div>
          </div>

          {/* Locked Privacy State for Active Tab */}
          {currentTabPrivacy.isLocked ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center rounded-3xl bg-gray-50/70 dark:bg-[#1c2136]/60 border border-gray-200 dark:border-[#2d2f40] max-w-lg mx-auto my-6 shadow-xs animate-in fade-in">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-500 dark:text-amber-400 mb-4 border border-amber-200 dark:border-amber-900/50">
                <Lock size={28} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Mục {currentTabPrivacy.label} đang ở chế độ riêng tư
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed mb-6">
                {currentTabPrivacy.setting === "FOLLOWERS"
                  ? "Tác giả chỉ cho phép người theo dõi xem nội dung này. Hãy nhấn Theo dõi để mở khóa và khám phá bộ sưu tập!"
                  : "Tác giả đã cài đặt chế độ chỉ mình tôi cho mục này."}
              </p>
              {currentTabPrivacy.setting === "FOLLOWERS" && !isFollowing && (
                <button
                  type="button"
                  disabled={isFollowLoading}
                  onClick={handleToggleFollow}
                  className="flex items-center justify-center gap-2 rounded-full bg-[#0052cc] hover:bg-[#0041a8] text-white px-6 py-2.5 text-xs sm:text-sm font-bold shadow-xs active:scale-98 transition cursor-pointer"
                >
                  {isFollowLoading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                  <span>Theo dõi tác giả để xem</span>
                </button>
              )}
            </div>
          ) : isFiltering ? (
            <ProfileTabSkeleton isComments={activeTab === "liked_comments"} />
          ) : activeTab === "created" ? (
            createdPins.length === 0 ? (
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
              </div>
            ) : (
              <MasonryGrid
                pins={filteredCreatedPins}
                className="w-full columns-2 sm:columns-3 md:columns-4 lg:columns-4 xl:columns-5 2xl:columns-6 gap-4 [column-fill:_balance]"
              />
            )
          ) : activeTab === "saved" ? (
            savedPins.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-3xl bg-gray-50/60 dark:bg-[#1c2136]/50 border border-dashed border-gray-200 dark:border-[#2d2f40]">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 dark:bg-[#252A42] text-[#0052cc] dark:text-blue-400 mb-3.5">
                  <Bookmark size={26} />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200">
                  Tác giả chưa lưu ghim nào
                </h3>
              </div>
            ) : filteredSavedPins.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 px-4 text-center rounded-3xl bg-gray-50/60 dark:bg-[#1c2136]/50 border border-dashed border-gray-200 dark:border-[#2d2f40]">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-[#252A42] text-gray-400 mb-3">
                  <Search size={20} />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-200">
                  Không tìm thấy ghim phù hợp
                </h3>
              </div>
            ) : (
              <MasonryGrid
                pins={filteredSavedPins}
                className="w-full columns-2 sm:columns-3 md:columns-4 lg:columns-4 xl:columns-5 2xl:columns-6 gap-4 [column-fill:_balance]"
              />
            )
          ) : activeTab === "liked_pins" ? (
            likedPins.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-3xl bg-gray-50/60 dark:bg-[#1c2136]/50 border border-dashed border-gray-200 dark:border-[#2d2f40]">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 mb-3.5">
                  <Heart size={26} />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200">
                  Tác giả chưa thích ảnh nào
                </h3>
              </div>
            ) : filteredLikedPins.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 px-4 text-center rounded-3xl bg-gray-50/60 dark:bg-[#1c2136]/50 border border-dashed border-gray-200 dark:border-[#2d2f40]">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-[#252A42] text-gray-400 mb-3">
                  <Search size={20} />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-200">
                  Không tìm thấy ảnh phù hợp
                </h3>
              </div>
            ) : (
              <MasonryGrid
                pins={filteredLikedPins}
                className="w-full columns-2 sm:columns-3 md:columns-4 lg:columns-4 xl:columns-5 2xl:columns-6 gap-4 [column-fill:_balance]"
              />
            )
          ) : (
            likedComments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-3xl bg-gray-50/60 dark:bg-[#1c2136]/50 border border-dashed border-gray-200 dark:border-[#2d2f40]">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 mb-3.5">
                  <MessageCircle size={26} />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200">
                  Tác giả chưa thích bình luận nào
                </h3>
              </div>
            ) : filteredLikedComments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 px-4 text-center rounded-3xl bg-gray-50/60 dark:bg-[#1c2136]/50 border border-dashed border-gray-200 dark:border-[#2d2f40]">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-[#252A42] text-gray-400 mb-3">
                  <Search size={20} />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-200">
                  Không tìm thấy bình luận phù hợp
                </h3>
              </div>
            ) : (
              <div className="space-y-3.5 min-w-0">
                {filteredLikedComments.map((c) => (
                  <div
                    key={c.binh_luan_id}
                    className="p-4 rounded-2xl bg-white dark:bg-[#1c2136] border border-gray-100 dark:border-[#2d2f40] shadow-xs flex flex-col sm:flex-row items-start gap-4 transition duration-200 min-w-0 w-full overflow-hidden"
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
                      </Link>
                    )}

                    <div className="flex-1 min-w-0 w-full">
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

                      <p className="mt-2 text-xs sm:text-sm text-gray-800 dark:text-gray-200 leading-relaxed break-words [overflow-wrap:anywhere] break-all whitespace-pre-wrap">
                        {c.noi_dung}
                      </p>

                      {c.hinh_anh && (
                        <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-100 dark:border-white/5 gap-2 min-w-0">
                          <div>
                            <Link
                              href={`/pin/${c.hinh_id}`}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-[#0052cc] dark:text-blue-400 hover:underline"
                              title="Xem bài viết & bình luận"
                            >
                              <span>Xem bình luận</span>
                              <ExternalLink size={12} />
                            </Link>
                          </div>
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

      {/* Follow / Following Modal */}
      {author && (
        <FollowListModal
          isOpen={isFollowModalOpen}
          onClose={() => setIsFollowModalOpen(false)}
          userId={Number(userId)}
          initialTab={followModalInitialTab}
          userName={author.ho_ten || "Tác giả"}
          onFollowChange={loadAuthorData}
        />
      )}

    </div>
  );
}
