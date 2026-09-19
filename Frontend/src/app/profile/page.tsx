"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import { ImageItem, CommentItem } from "@/types";
import { MasonryGrid } from "@/components/MasonryGrid";
import { EditProfileModal } from "@/components/EditProfileModal";
import { FollowListModal } from "@/components/FollowListModal";
import { smartFilterPins, smartFilterComments } from "@/lib/smart-search";
import {
  Edit3,
  Share2,
  Loader2,
  ImageOff,
  Bookmark,
  Camera,
  Layers,
  Heart,
  Calendar,
  Sparkles,
  Quote,
  MessageCircle,
  ExternalLink,
  Search,
  X,
  CheckSquare,
  Square,
  Trash2,
  Check,
  AlertTriangle,
  Users,
  Shield,
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

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

export default function CurrentUserProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, updateUser, refreshUserInfo, isLoading: isAuthLoading, openAuthModal } = useAuth();

  const [activeTab, setActiveTab] = useState<"created" | "saved" | "liked_pins" | "liked_comments">("created");

  // Sync tab & modal from URL query params (e.g. /profile?tab=saved or /profile?modal=privacy)
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["created", "saved", "liked_pins", "liked_comments"].includes(tabParam)) {
      setActiveTab(tabParam as any);
      setSelectedIds([]);
    }

    const modalParam = searchParams.get("modal");
    if (modalParam === "privacy") {
      setEditModalInitialTab("privacy");
      setIsEditModalOpen(true);
    } else if (modalParam === "edit") {
      setEditModalInitialTab("info");
      setIsEditModalOpen(true);
    }
  }, [searchParams]);
  const [createdPins, setCreatedPins] = useState<ImageItem[]>([]);
  const [savedPins, setSavedPins] = useState<ImageItem[]>([]);
  const [likedPins, setLikedPins] = useState<ImageItem[]>([]);
  const [likedComments, setLikedComments] = useState<CommentItem[]>([]);
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [isFollowModalOpen, setIsFollowModalOpen] = useState(false);
  const [followModalInitialTab, setFollowModalInitialTab] = useState<"followers" | "following">("followers");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isFiltering, setIsFiltering] = useState(false);
  const [loadingContent, setLoadingContent] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editModalInitialTab, setEditModalInitialTab] = useState<"info" | "privacy">("info");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [mounted, setMounted] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Multi-Select Batch Deletion State
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBatchDeleting, setIsBatchDeleting] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [countdown, setCountdown] = useState(5);

  // 5-second countdown timer for confirmation modal
  useEffect(() => {
    let timer: any;
    if (isConfirmModalOpen) {
      setCountdown(5);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setCountdown(5);
    }
    return () => clearInterval(timer);
  }, [isConfirmModalOpen]);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Smart Relevance Search: Filtered lists with multi-tier relevance ranking
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

  // Danh sách IDs có thể chọn ở tab hiện tại
  const currentTabIds = useMemo(() => {
    if (activeTab === "created") return filteredCreatedPins.map((p) => p.hinh_id);
    if (activeTab === "saved") return filteredSavedPins.map((p) => p.hinh_id);
    if (activeTab === "liked_pins") return filteredLikedPins.map((p) => p.hinh_id);
    return filteredLikedComments.map((c) => c.binh_luan_id);
  }, [activeTab, filteredCreatedPins, filteredSavedPins, filteredLikedPins, filteredLikedComments]);

  const isAllSelected = currentTabIds.length > 0 && currentTabIds.every((id) => selectedIds.includes(id));

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllToggle = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(currentTabIds);
    }
  };

  const handleTabChange = (tab: "created" | "saved" | "liked_pins" | "liked_comments") => {
    setActiveTab(tab);
    setSelectedIds([]);
  };

  const loadUserPins = async () => {
    if (!user) return;
    setLoadingContent(true);
    try {
      // Fetch in parallel
      const [profileRes, createdRes, savedRes, likedPinsRes, likedCommentsRes] = await Promise.all([
        api.get("/users/profile").catch(() => ({ data: { data: null } })),
        api.get("/users/created-images").catch(() => ({ data: { data: [] } })),
        api.get("/users/saved-images").catch(() => ({ data: { data: [] } })),
        api.get("/users/liked-images").catch(() => ({ data: { data: [] } })),
        api.get("/users/liked-comments").catch(() => ({ data: { data: [] } })),
      ]);

      if (profileRes.data?.data) {
        setFollowersCount(profileRes.data.data.followersCount || 0);
        setFollowingCount(profileRes.data.data.followingCount || 0);
      }

      setCreatedPins(Array.isArray(createdRes.data?.data) ? createdRes.data.data : []);
      setSavedPins(Array.isArray(savedRes.data?.data) ? savedRes.data.data : []);
      setLikedPins(Array.isArray(likedPinsRes.data?.data) ? likedPinsRes.data.data : []);
      setLikedComments(Array.isArray(likedCommentsRes.data?.data) ? likedCommentsRes.data.data : []);
    } catch (err) {
      console.error("Failed to load user pins", err);
    } finally {
      setLoadingContent(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push("/login?mode=login");
    } else if (user) {
      loadUserPins();
    }
  }, [user, isAuthLoading, router]);

  const handleShareProfile = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Đã sao chép liên kết trang cá nhân!");
    }
  };

  const handleQuickAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate format & size
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      toast.error("Vui lòng chọn file ảnh định dạng JPG, PNG hoặc WEBP");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Dung lượng ảnh không được vượt quá 5MB");
      return;
    }

    setUploadingAvatar(true);
    const toastId = toast.loading("Đang tải ảnh đại diện lên Cloudinary...");
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await api.put("/users/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.data) {
        updateUser(res.data.data);
        await refreshUserInfo();
        toast.success("Cập nhật ảnh đại diện thành công!", { id: toastId });
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Không thể tải ảnh đại diện lên, vui lòng thử lại!";
      toast.error(msg, { id: toastId });
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) {
        avatarInputRef.current.value = "";
      }
    }
  };

  // Thực hiện thao tác xóa / bỏ lưu hàng loạt
  const handleBatchActionConfirm = async () => {
    if (selectedIds.length === 0) return;

    setIsBatchDeleting(true);
    const count = selectedIds.length;
    const toastId = toast.loading(`Đang xử lý ${count} mục đã chọn...`);

    try {
      if (activeTab === "created") {
        await api.post("/images/batch-delete", { ids: selectedIds });
        toast.success(`Đã xóa vĩnh viễn ${count} tác phẩm thành công!`, { id: toastId });
      } else if (activeTab === "saved") {
        await api.post("/saved-images/batch-unsave", { ids: selectedIds });
        toast.success(`Đã bỏ lưu ${count} ghim khỏi hồ sơ!`, { id: toastId });
      } else if (activeTab === "liked_pins") {
        await api.post("/likes/batch-unlike-images", { ids: selectedIds });
        toast.success(`Đã bỏ thích ${count} ảnh!`, { id: toastId });
      } else if (activeTab === "liked_comments") {
        await api.post("/likes/batch-unlike-comments", { ids: selectedIds });
        toast.success(`Đã bỏ thích ${count} bình luận!`, { id: toastId });
      }

      setSelectedIds([]);
      setIsConfirmModalOpen(false);
      await loadUserPins();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Không thể thực hiện thao tác xóa hàng loạt, vui lòng thử lại!";
      toast.error(msg, { id: toastId });
    } finally {
      setIsBatchDeleting(false);
    }
  };

  const handleUnlikeSingleComment = async (commentId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.post(`/like/comment/${commentId}`);
      setLikedComments((prev) => prev.filter((item) => item.binh_luan_id !== commentId));
      toast.success("Đã bỏ thả tim bình luận!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể bỏ thích bình luận");
    }
  };

  const openPrivacyModal = () => {
    setEditModalInitialTab("privacy");
    setIsEditModalOpen(true);
  };

  const openEditProfileModal = () => {
    setEditModalInitialTab("info");
    setIsEditModalOpen(true);
  };

  const getActionName = () => {
    if (activeTab === "created") return "Xóa tác phẩm";
    if (activeTab === "saved") return "Bỏ lưu ghim";
    return "Bỏ thích";
  };

  if (!mounted || isAuthLoading || (user && loadingContent)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh]">
        <Loader2 className="h-10 w-10 animate-spin text-[#0052cc]" />
        <p className="mt-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Đang tải hồ sơ của bạn...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Vui lòng đăng nhập để xem trang cá nhân</h2>
        <button
          onClick={() => openAuthModal("login")}
          className="mt-4 rounded-full bg-[#0052cc] hover:bg-[#0041a8] px-6 py-2.5 text-sm font-bold text-white shadow-xs cursor-pointer active:scale-98 transition"
        >
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1920px] 2xl:max-w-[2100px] w-full mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 py-4 sm:py-6 pb-28">
      {/* Two-Column Split Layout */}
      <div className="flex flex-col lg:flex-row items-start gap-6 xl:gap-8 min-w-0 max-w-full">
        
        {/* ================= LEFT COLUMN: User Info Sidebar ================= */}
        <div className="w-full lg:w-[440px] xl:w-[480px] 2xl:w-[520px] shrink-0 min-w-0 lg:sticky lg:top-24 space-y-5">
          <div className="rounded-3xl bg-white dark:bg-[#1c2136] border border-gray-100 dark:border-[#2d2f40] p-6 sm:p-8 shadow-sm text-center relative overflow-hidden">
            
            {/* Avatar with instant Cloudinary upload overlay */}
            <div className="relative inline-block mt-2">
              <div className="relative h-32 w-32 sm:h-36 sm:w-36 rounded-full border-4 border-white dark:border-[#1c2136] shadow-md overflow-hidden bg-gray-100 dark:bg-[#252A42] ring-2 ring-[#0052cc]/30">
                {user.anh_dai_dien ? (
                  <img
                    src={user.anh_dai_dien}
                    alt={user.ho_ten || "Avatar"}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-blue-50 dark:bg-[#252A42] text-4xl sm:text-5xl font-black text-[#0052cc] dark:text-blue-400">
                    {(user.ho_ten || user.email || "U")[0].toUpperCase()}
                  </div>
                )}

                {/* Hover overlay to change avatar */}
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute inset-0 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center text-white opacity-0 hover:opacity-100 transition-all duration-200 cursor-pointer"
                  title="Thay đổi ảnh đại diện"
                >
                  {uploadingAvatar ? (
                    <Loader2 size={24} className="animate-spin text-white" />
                  ) : (
                    <>
                      <Camera size={24} />
                      <span className="text-xs font-bold mt-1.5">Đổi ảnh</span>
                    </>
                  )}
                </button>
              </div>

              {/* Hidden file input */}
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleQuickAvatarUpload}
                className="hidden"
              />
            </div>

            {/* Name & Email */}
            <h1 className="mt-4 text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {user.ho_ten || "Người dùng HUKI"}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
              {user.email}
            </p>

            {user.tuoi && (
              <div className="inline-flex items-center gap-1.5 mt-2.5 px-3.5 py-1 rounded-full text-xs font-bold text-[#0052cc] dark:text-blue-400 bg-blue-50 dark:bg-[#252A42] border border-blue-100 dark:border-[#2d2f40]">
                🎂 {user.tuoi} tuổi
              </div>
            )}

            {/* Follow Stats - Clickable */}
            <div className="flex items-center justify-center gap-6 mt-4 py-2 px-4 rounded-2xl bg-gray-50/80 dark:bg-[#252A42]/60 border border-gray-100 dark:border-[#2d2f40]">
              <button
                type="button"
                onClick={() => {
                  setFollowModalInitialTab("followers");
                  setIsFollowModalOpen(true);
                }}
                className="text-center group/stat hover:opacity-80 transition cursor-pointer"
                title="Xem danh sách người theo dõi"
              >
                <span className="block text-base sm:text-lg font-black text-gray-900 dark:text-white group-hover/stat:text-[#0052cc] dark:group-hover/stat:text-blue-400 transition">
                  {followersCount}
                </span>
                <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                  Người theo dõi
                </span>
              </button>
              <div className="h-6 w-px bg-gray-200 dark:bg-[#2d2f40]" />
              <button
                type="button"
                onClick={() => {
                  setFollowModalInitialTab("following");
                  setIsFollowModalOpen(true);
                }}
                className="text-center group/stat hover:opacity-80 transition cursor-pointer"
                title="Xem danh sách đang theo dõi"
              >
                <span className="block text-base sm:text-lg font-black text-gray-900 dark:text-white group-hover/stat:text-[#0052cc] dark:group-hover/stat:text-blue-400 transition">
                  {followingCount}
                </span>
                <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                  Đang theo dõi
                </span>
              </button>
            </div>

            {/* Bio / Status Box */}
            <div className="mt-5 rounded-2xl bg-gray-50 dark:bg-[#252A42] border border-gray-100 dark:border-[#2d2f40] p-4 sm:p-5 text-left relative group">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                  Tiểu sử & Trạng thái
                </span>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="text-xs text-[#0052cc] dark:text-blue-400 hover:underline font-semibold cursor-pointer"
                >
                  Sửa
                </button>
              </div>
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-200 italic leading-relaxed">
                {user.mo_ta ? (
                  `"${user.mo_ta}"`
                ) : (
                  <span className="text-gray-400 dark:text-gray-400 not-italic">
                    Chưa có trạng thái. Hãy viết vài dòng chia sẻ phong cách sáng tạo của bạn!
                  </span>
                )}
              </p>
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-2.5">
              <button
                onClick={openEditProfileModal}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-[#0052cc] hover:bg-[#0041a8] py-2.5 px-4 text-xs sm:text-sm font-bold text-white shadow-xs active:scale-98 transition cursor-pointer"
              >
                <Edit3 size={15} />
                <span>Chỉnh sửa hồ sơ</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={openPrivacyModal}
                  className="flex items-center justify-center gap-1.5 rounded-full bg-blue-50 dark:bg-[#252A42] hover:bg-blue-100 dark:hover:bg-[#2d3352] text-[#0052cc] dark:text-blue-400 py-2.5 px-2 text-xs font-bold border border-blue-200/60 dark:border-[#2d2f40] active:scale-98 transition cursor-pointer"
                  title="Cài đặt Quyền riêng tư"
                >
                  <Shield size={14} className="shrink-0" />
                  <span className="truncate">Quyền riêng tư</span>
                </button>

                <button
                  onClick={handleShareProfile}
                  className="flex items-center justify-center gap-1.5 rounded-full bg-gray-100 dark:bg-[#252A42] hover:bg-gray-200 dark:hover:bg-[#2e3450] py-2.5 px-2 text-xs font-bold text-gray-700 dark:text-gray-200 active:scale-98 transition cursor-pointer border border-transparent dark:border-[#2d2f40]"
                  title="Chia sẻ trang cá nhân"
                >
                  <Share2 size={14} className="shrink-0" />
                  <span className="truncate">Chia sẻ</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT COLUMN: Pins Grid & Tabs ================= */}
        <div className="flex-1 min-w-0 w-full">
          
          {/* Tabs & Search Filter & Selection Bar */}
          <div className="flex flex-col gap-3 border-b border-gray-200 dark:border-[#2d2f40] pb-3 mb-6">
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Tabs List */}
              <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto [scrollbar-width:none] shrink-0">
                <button
                  onClick={() => handleTabChange("created")}
                  className={`pb-2 text-xs sm:text-sm font-bold transition relative cursor-pointer ${
                    activeTab === "created"
                      ? "text-[#0052cc] dark:text-blue-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
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
                  onClick={() => handleTabChange("saved")}
                  className={`pb-2 text-xs sm:text-sm font-bold transition relative cursor-pointer ${
                    activeTab === "saved"
                      ? "text-[#0052cc] dark:text-blue-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <span>Folder & Ghim đã lưu</span>
                  <span className="ml-1 text-xs opacity-75">
                    ({searchQuery.trim() ? `${filteredSavedPins.length}/${savedPins.length}` : savedPins.length})
                  </span>
                  {activeTab === "saved" && (
                    <span className="absolute -bottom-3 left-0 right-0 h-1 bg-[#0052cc] dark:bg-blue-400 rounded-full" />
                  )}
                </button>

                <button
                  onClick={() => handleTabChange("liked_pins")}
                  className={`pb-2 text-xs sm:text-sm font-bold transition relative cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "liked_pins"
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-rose-500 dark:hover:text-rose-400"
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
                  onClick={() => handleTabChange("liked_comments")}
                  className={`pb-2 text-xs sm:text-sm font-bold transition relative cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "liked_comments"
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-rose-500 dark:hover:text-rose-400"
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

              {/* Right: Actions (Search + Multi-select button) */}
              <div className="flex items-center gap-2.5 shrink-0">
                {/* Multi-Select Mode Toggle Button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsSelectMode(!isSelectMode);
                    setSelectedIds([]);
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer active:scale-95 ${
                    isSelectMode
                      ? "bg-[#0052cc] text-white shadow-xs"
                      : "bg-gray-100 dark:bg-[#252A42] hover:bg-gray-200 dark:hover:bg-[#2e3450] text-gray-700 dark:text-gray-200 border border-transparent dark:border-[#2d2f40]"
                  }`}
                  title="Chọn nhiều mục để xóa hoặc bỏ lưu"
                >
                  <CheckSquare size={14} />
                  <span>{isSelectMode ? "Đang chọn nhiều" : "Chọn nhiều"}</span>
                </button>

                {/* Quick Search Filter Input */}
                <div className="relative flex items-center w-full sm:w-auto min-w-[180px] sm:min-w-[220px]">
                  <Search size={14} className="absolute left-3 text-gray-400 dark:text-gray-500 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Lọc trong tab này..."
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
            </div>

            {/* In-header Selection Helper Bar (when isSelectMode is active) */}
            {isSelectMode && currentTabIds.length > 0 && (
              <div className="flex items-center justify-between pt-2 px-1 text-xs animate-in fade-in">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-700 dark:text-gray-200">
                    💡 Chế độ chọn nhiều:
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    Nhấp vào từng ảnh/bình luận để chọn hoặc bỏ chọn.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleSelectAllToggle}
                  className="font-bold text-[#0052cc] dark:text-blue-400 hover:underline cursor-pointer"
                >
                  {isAllSelected ? "Bỏ chọn tất cả" : `Chọn tất cả (${currentTabIds.length})`}
                </button>
              </div>
            )}
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
                  Chưa có Ghim nào được tạo
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
                  Bắt đầu tạo và chia sẻ tác phẩm của bạn đến với cộng đồng ngay hôm nay!
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
                onSaveToggle={loadUserPins}
                isSelectMode={isSelectMode}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                className="w-full columns-2 sm:columns-3 md:columns-4 lg:columns-4 xl:columns-5 2xl:columns-6 gap-4 [column-fill:_balance]"
              />
            )
          )}

          {/* Tab 2: Saved Pins */}
          {activeTab === "saved" && (
            isFiltering ? (
              <ProfileTabSkeleton />
            ) : savedPins.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-3xl bg-gray-50/60 dark:bg-[#1c2136]/50 border border-dashed border-gray-200 dark:border-[#2d2f40]">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 dark:bg-[#252A42] text-[#0052cc] dark:text-blue-400 mb-3.5">
                  <Bookmark size={26} />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200">
                  Chưa có Ghim nào được lưu
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
                  Lưu lại những bức ảnh và ý tưởng mà bạn yêu thích khi khám phá trang chủ.
                </p>
              </div>
            ) : filteredSavedPins.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 px-4 text-center rounded-3xl bg-gray-50/60 dark:bg-[#1c2136]/50 border border-dashed border-gray-200 dark:border-[#2d2f40]">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-[#252A42] text-gray-400 mb-3">
                  <Search size={20} />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-200">
                  Không tìm thấy ghim đã lưu phù hợp với &quot;{debouncedQuery || searchQuery}&quot;
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
                pins={filteredSavedPins}
                onSaveToggle={loadUserPins}
                isSelectMode={isSelectMode}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                className="w-full columns-2 sm:columns-3 md:columns-4 lg:columns-4 xl:columns-5 2xl:columns-6 gap-4 [column-fill:_balance]"
              />
            )
          )}

          {/* Tab 3: Liked Pins (Tym ảnh) */}
          {activeTab === "liked_pins" && (
            isFiltering ? (
              <ProfileTabSkeleton />
            ) : likedPins.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-3xl bg-gray-50/60 dark:bg-[#1c2136]/50 border border-dashed border-gray-200 dark:border-[#2d2f40]">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 mb-3.5">
                  <Heart size={26} />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200">
                  Chưa có ảnh nào được thả tim
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
                  Thả tim những hình ảnh truyền cảm hứng để lưu lại danh sách yêu thích riêng của bạn!
                </p>
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
                onSaveToggle={loadUserPins}
                isSelectMode={isSelectMode}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                className="w-full columns-2 sm:columns-3 md:columns-4 lg:columns-4 xl:columns-5 2xl:columns-6 gap-4 [column-fill:_balance]"
              />
            )
          )}

          {/* Tab 4: Liked Comments (Tym bình luận) */}
          {activeTab === "liked_comments" && (
            isFiltering ? (
              <ProfileTabSkeleton isComments />
            ) : likedComments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-3xl bg-gray-50/60 dark:bg-[#1c2136]/50 border border-dashed border-gray-200 dark:border-[#2d2f40]">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 mb-3.5">
                  <MessageCircle size={26} />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200">
                  Chưa có bình luận nào được thả tim
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
                  Bấm vào biểu tượng trái tim ở các bình luận hay để lưu lại tại đây.
                </p>
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
              <div className="space-y-3.5 min-w-0 w-full">
                {filteredLikedComments.map((c) => {
                  const isSelected = selectedIds.includes(c.binh_luan_id);
                  return (
                    <div
                      key={c.binh_luan_id}
                      onClick={isSelectMode ? () => handleToggleSelect(c.binh_luan_id) : undefined}
                      className={`p-4 rounded-2xl bg-white dark:bg-[#1c2136] shadow-xs flex flex-col sm:flex-row items-start gap-4 transition duration-200 min-w-0 w-full overflow-hidden ${
                        isSelectMode ? "cursor-pointer select-none" : ""
                      } ${
                        isSelected
                          ? "ring-3 ring-[#0052cc] dark:ring-blue-500 border-transparent bg-blue-50/30 dark:bg-[#252A42]"
                          : "border border-gray-100 dark:border-[#2d2f40] hover:border-[#0052cc]/30"
                      }`}
                    >
                      {/* Selection Checkbox */}
                      {isSelectMode && (
                        <div className="flex items-center justify-center shrink-0 mt-1">
                          <div
                            className={`flex h-6 w-6 items-center justify-center rounded-full transition-all duration-200 ${
                              isSelected
                                ? "bg-[#0052cc] text-white ring-2 ring-white shadow-xs"
                                : "border-2 border-gray-400 dark:border-gray-500 bg-transparent text-transparent"
                            }`}
                          >
                            {isSelected ? <Check size={14} strokeWidth={3} /> : null}
                          </div>
                        </div>
                      )}

                      {/* Linked Pin Thumbnail */}
                      {c.hinh_anh && (
                        <Link
                          href={isSelectMode ? "#" : `/pin/${c.hinh_id}`}
                          onClick={(e) => {
                            if (isSelectMode) e.preventDefault();
                          }}
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
                          {!isSelectMode && (
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/thumb:opacity-100 transition flex items-center justify-center text-white">
                              <ExternalLink size={16} />
                            </div>
                          )}
                        </Link>
                      )}

                      {/* Comment Content & Author Details */}
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
                              {isSelectMode ? (
                                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                  Xem bình luận
                                </span>
                              ) : (
                                <Link
                                  href={`/pin/${c.hinh_id}`}
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#0052cc] dark:text-blue-400 hover:underline"
                                  title="Xem bài viết & bình luận"
                                >
                                  <span>Xem bình luận</span>
                                  <ExternalLink size={12} />
                                </Link>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={(e) => handleUnlikeSingleComment(c.binh_luan_id, e)}
                              className="group/btn inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 border border-rose-200/50 dark:border-rose-900/30 px-2.5 py-1 rounded-full shrink-0 cursor-pointer active:scale-95 transition"
                              title="Nhấn để bỏ thích bình luận này"
                            >
                              <Heart size={12} className="fill-rose-500 group-hover/btn:scale-110 transition-transform" />
                              <span className="group-hover/btn:hidden">Đã thả tim</span>
                              <span className="hidden group-hover/btn:inline">Bỏ thích</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

        </div>

      </div>

      {/* ================= FLOATING MULTI-SELECT ACTION BAR ================= */}
      {isSelectMode && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-xl animate-in slide-in-from-bottom-6 duration-300">
          <div className="rounded-3xl bg-white/95 dark:bg-[#1c2136]/95 backdrop-blur-xl border border-gray-200 dark:border-[#2d2f40] shadow-2xl p-3 sm:px-6 sm:py-3.5 flex items-center justify-between gap-3">
            {/* Left: Counter badge */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 dark:bg-[#252A42] text-[#0052cc] dark:text-blue-400 font-black text-xs shrink-0">
                {selectedIds.length}
              </div>
              <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate">
                Đã chọn <span className="text-[#0052cc] dark:text-blue-400">{selectedIds.length}</span> mục
              </span>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleSelectAllToggle}
                className="px-3 py-2 rounded-full text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#252A42] transition cursor-pointer"
              >
                {isAllSelected ? "Bỏ chọn" : "Chọn hết"}
              </button>

              <button
                type="button"
                disabled={selectedIds.length === 0 || isBatchDeleting}
                onClick={() => setIsConfirmModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 transition disabled:opacity-40 disabled:pointer-events-none cursor-pointer shadow-md shadow-rose-600/20"
              >
                {isBatchDeleting ? (
                  <Loader2 size={14} className="animate-spin text-white" />
                ) : (
                  <Trash2 size={14} />
                )}
                <span>
                  {getActionName()} ({selectedIds.length})
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsSelectMode(false);
                  setSelectedIds([]);
                }}
                className="p-2 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#252A42] transition cursor-pointer"
                title="Đóng chế độ chọn"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= BATCH CONFIRMATION MODAL ================= */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#1c2136] border border-gray-100 dark:border-[#2d2f40] p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Xác nhận {getActionName().toLowerCase()}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Thao tác sẽ áp dụng cho {selectedIds.length} mục đã chọn
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              {activeTab === "created" ? (
                <span>
                  Bạn có chắc chắn muốn <b className="text-rose-600">xóa vĩnh viễn {selectedIds.length} tác phẩm</b> này khỏi hệ thống không? Hành động này không thể hoàn tác.
                </span>
              ) : activeTab === "saved" ? (
                <span>
                  Bạn có chắc chắn muốn <b className="text-[#0052cc] dark:text-blue-400">bỏ lưu {selectedIds.length} ghim</b> này khỏi hồ sơ của bạn không?
                </span>
              ) : activeTab === "liked_pins" ? (
                <span>
                  Bạn có chắc chắn muốn <b className="text-rose-600">bỏ thích {selectedIds.length} ảnh</b> này không?
                </span>
              ) : (
                <span>
                  Bạn có chắc chắn muốn <b className="text-rose-600">bỏ thích {selectedIds.length} bình luận</b> này không?
                </span>
              )}
            </p>

            {/* 5-second countdown progress bar */}
            <div className="w-full bg-gray-100 dark:bg-[#252A42] rounded-full h-1.5 mb-6 overflow-hidden">
              <div
                className="bg-rose-500 h-full transition-all duration-1000 ease-linear"
                style={{ width: `${((5 - countdown) / 5) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isBatchDeleting}
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-5 py-2.5 rounded-full text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-[#252A42] hover:bg-gray-200 dark:hover:bg-[#2e3450] transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isBatchDeleting || countdown > 0}
                onClick={handleBatchActionConfirm}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 transition cursor-pointer shadow-md shadow-rose-600/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400 dark:disabled:bg-gray-700"
              >
                {isBatchDeleting ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-white" />
                    <span>Đang xử lý...</span>
                  </>
                ) : countdown > 0 ? (
                  <>
                    <Trash2 size={14} />
                    <span>Xác nhận ({countdown}s)</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span>Xác nhận thực hiện ngay</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={loadUserPins}
        initialTab={editModalInitialTab}
      />

      {/* Followers & Following List Modal */}
      {user && (
        <FollowListModal
          isOpen={isFollowModalOpen}
          onClose={() => setIsFollowModalOpen(false)}
          userId={user.nguoi_dung_id}
          initialTab={followModalInitialTab}
          userName={user.ho_ten || "Trang cá nhân của bạn"}
          onFollowChange={loadUserPins}
        />
      )}
    </div>
  );
}
