"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { ImageItem, CommentItem } from "@/types";
import { useAuth } from "@/lib/auth-context";
import { MasonryGrid } from "@/components/MasonryGrid";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  ArrowRight,
  Share2,
  Bookmark,
  Trash2,
  Send,
  Loader2,
  MessageCircle,
  AlertCircle,
  Sparkles,
  ChevronDown,
  Maximize2,
  Minimize2,
  X,
  Heart,
} from "lucide-react";

// Individual Comment Row with 3-line clamp, 'Xem thêm' / 'Thu gọn', and Heart Like toggle
function CommentItemRow({ comment }: { comment: CommentItem }) {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(comment.isLiked || false);
  const [likeCount, setLikeCount] = useState(comment.likeCount || 0);
  const [isLiking, setIsLiking] = useState(false);
  const isLong = comment.noi_dung.length > 120 || comment.noi_dung.split("\n").length > 3;

  const handleToggleCommentLike = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để thả tim bình luận!");
      return;
    }
    if (isLiking) return;
    setIsLiking(true);

    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikeCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const res = await api.post(`/likes/comment/toggle/${comment.binh_luan_id}`);
      if (res.data?.data) {
        setIsLiked(res.data.data.isLiked);
        setLikeCount(res.data.data.likeCount);
      }
    } catch (e: any) {
      // Revert on error
      setIsLiked(!nextState);
      setLikeCount((prev) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
      toast.error("Không thể thao tác thả tim bình luận");
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div className="flex items-start gap-3 min-w-0 max-w-full">
      <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-200 dark:bg-[#252A42] shrink-0 border border-gray-200 dark:border-[#2d2f40]">
        {comment.nguoi_dung?.anh_dai_dien ? (
          <img
            src={comment.nguoi_dung.anh_dai_dien}
            alt={comment.nguoi_dung.ho_ten || "Commenter"}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-300 dark:bg-[#181C31] text-xs font-bold text-gray-700 dark:text-gray-200">
            {(comment.nguoi_dung?.ho_ten || comment.nguoi_dung?.email || "U")[0].toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 max-w-full bg-gray-50 dark:bg-[#181C31] border border-transparent dark:border-[#2d2f40] rounded-2xl px-4 py-2.5 overflow-hidden">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
            {comment.nguoi_dung?.ho_ten || comment.nguoi_dung?.email || "Người dùng"}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] text-gray-400 dark:text-gray-400">
              {new Date(comment.ngay_binh_luan).toLocaleDateString("vi-VN")}
            </span>
            <button
              type="button"
              onClick={handleToggleCommentLike}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] font-semibold transition cursor-pointer ${
                isLiked
                  ? "text-rose-500 bg-rose-50 dark:bg-rose-950/40"
                  : "text-gray-400 hover:text-rose-500 hover:bg-gray-100 dark:hover:bg-[#252A42]"
              }`}
              title={isLiked ? "Bỏ thích bình luận" : "Thích bình luận"}
            >
              <Heart size={11} className={isLiked ? "fill-rose-500 text-rose-500" : ""} />
              {likeCount > 0 && <span>{likeCount}</span>}
            </button>
          </div>
        </div>
        <p
          className={`mt-1 text-sm text-gray-700 dark:text-gray-300 break-all break-words [overflow-wrap:anywhere] leading-relaxed whitespace-pre-wrap max-w-full overflow-hidden transition-all duration-200 ${
            !isExpanded && isLong ? "line-clamp-3" : ""
          }`}
        >
          {comment.noi_dung}
        </p>
        {isLong && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-1.5 inline-flex items-center gap-1 text-xs font-bold text-[#0052cc] dark:text-blue-400 hover:text-[#0041a8] transition-colors cursor-pointer"
          >
            <span>{isExpanded ? "Thu gọn" : "Xem thêm"}</span>
            <ChevronDown
              size={12}
              className={`stroke-[2.5] transition-transform duration-200 ease-out ${
                isExpanded ? "rotate-180" : "rotate-0"
              }`}
            />
          </button>
        )}
      </div>
    </div>
  );
}

export default function PinDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { user, openAuthModal } = useAuth();

  const [pin, setPin] = useState<ImageItem | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteCountdown, setDeleteCountdown] = useState(5);
  const [loading, setLoading] = useState(true);
  const [relatedPins, setRelatedPins] = useState<ImageItem[]>([]);
  const [isTitleExpanded, setIsTitleExpanded] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const commentsContainerRef = useRef<HTMLDivElement>(null);
  const commentTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsZoomed(false);
        setShowDeleteModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Auto-resize comment textarea dynamically as user types
  useEffect(() => {
    if (commentTextareaRef.current) {
      commentTextareaRef.current.style.height = "auto";
      commentTextareaRef.current.style.height = `${commentTextareaRef.current.scrollHeight}px`;
    }
  }, [newComment]);

  // 5-second countdown timer for delete modal
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showDeleteModal) {
      setDeleteCountdown(5);
      timer = setInterval(() => {
        setDeleteCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [showDeleteModal]);

  // Load Pin detail, save status, comments, and related pins
  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const pinRes = await api.get(`/images/${id}`);
      const pinData = pinRes.data?.data;
      setPin(pinData);
      setIsLiked(pinData?.isLiked || false);
      setLikeCount(pinData?.likeCount || 0);
      setIsSaved(pinData?.isSaved || false);

      // Fetch comments
      const commentRes = await api.get(`/comments/image/${id}`);
      setComments(commentRes.data?.data || []);

      // If logged in, check save status
      if (user) {
        try {
          const saveRes = await api.get(`/saved-images/check/${id}`);
          setIsSaved(saveRes.data?.data?.isSaved || false);
        } catch (e) {
          console.error("Check save error", e);
        }
      }

      // Fetch related pins with smart category & theme matching
      const relatedRes = await api.get("/images?pageSize=50");
      const allPins: ImageItem[] = relatedRes.data?.data?.items || relatedRes.data?.data || [];
      const otherPins = allPins.filter((p: ImageItem) => p.hinh_id !== Number(id));

      const targetCategory = (pinData?.the_loai || "").trim().toLowerCase();
      const targetAuthorId = pinData?.nguoi_dung_id;
      const targetWords = (pinData?.ten_hinh || "")
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, "")
        .split(/\s+/)
        .filter((w: string) => w.length > 2);

      const scoredPins = otherPins.map((p) => {
        let score = 0;
        const pCategory = (p.the_loai || "").trim().toLowerCase();

        // Cùng thể loại được ưu tiên hàng đầu (+15 điểm)
        if (targetCategory && pCategory && pCategory === targetCategory) {
          score += 15;
        }
        // Cùng tác giả tạo ảnh (+3 điểm)
        if (targetAuthorId && p.nguoi_dung_id === targetAuthorId) {
          score += 3;
        }
        // Khớp từ khóa trong tên ảnh (+2 điểm mỗi từ)
        const pTitle = (p.ten_hinh || "").toLowerCase();
        for (const word of targetWords) {
          if (pTitle.includes(word)) {
            score += 2;
          }
        }
        return { pin: p, score };
      });

      // Sắp xếp điểm cao nhất lên đầu (ảnh cùng loại đứng đầu)
      scoredPins.sort((a, b) => b.score - a.score);
      setRelatedPins(scoredPins.map((item) => item.pin));
    } catch (err: any) {
      if (err.response?.status === 404) {
        setPin(null);
      } else {
        toast.error("Không thể tải thông tin ảnh");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id, user]);

  const handleLikeToggle = async () => {
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
      const res = await api.post(`/likes/image/toggle/${id}`);
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

  const handleSaveToggle = async () => {
    if (!user) {
      openAuthModal("login");
      return;
    }

    setIsSaving(true);
    try {
      const res = await api.post(`/saved-images/toggle/${id}`);
      const savedStatus = res.data?.data?.isSaved ?? !isSaved;
      setIsSaved(savedStatus);
      if (savedStatus) {
        toast.success("Đã lưu ảnh vào hồ sơ của bạn!");
      } else {
        toast("Đã bỏ lưu ảnh", { icon: "🗑️" });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể lưu ảnh");
    } finally {
      setIsSaving(false);
    }
  };

  const [commentError, setCommentError] = useState<string | null>(null);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCommentError(null);

    if (!user) {
      openAuthModal("login");
      return;
    }

    const trimmed = newComment.trim();
    if (!trimmed) {
      setCommentError("Nội dung nhận xét không được để trống");
      return;
    }

    if (trimmed.length > 2000) {
      setCommentError("Nhận xét không được vượt quá 2000 ký tự");
      return;
    }

    setIsSubmittingComment(true);
    try {
      const res = await api.post("/comments", {
        imageId: Number(id),
        content: trimmed,
      });

      const createdComment = res.data?.data;
      if (createdComment) {
        setComments((prev) => [
          {
            ...createdComment,
            nguoi_dung: user,
          },
          ...prev,
        ]);
        setNewComment("");
        toast.success("Đã gửi bình luận!");
        setTimeout(() => {
          commentsContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
        }, 50);
      }
    } catch (err: any) {
      setCommentError(err.response?.data?.message || "Không thể gửi bình luận, vui lòng thử lại");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeletePin = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/images/${id}`);
      toast.success("Đã xóa ảnh thành công!");
      setShowDeleteModal(false);
      router.replace("/");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể xóa ảnh");
      setIsDeleting(false);
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Đã sao chép liên kết vào bộ nhớ tạm!");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="h-10 w-10 animate-spin text-[#0052cc]" />
        <p className="mt-4 text-sm font-semibold text-gray-500">Đang tải chi tiết ảnh...</p>
      </div>
    );
  }

  if (!pin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-xl font-bold text-gray-900">Không tìm thấy ảnh</h2>
        <button
          onClick={() => router.push("/")}
          className="mt-4 rounded-full bg-[#0052cc] hover:bg-[#0041a8] px-6 py-2.5 text-sm font-bold text-white shadow-xs"
        >
          Quay lại Trang chủ
        </button>
      </div>
    );
  }

  const isOwner = user && user.nguoi_dung_id === pin.nguoi_dung_id;
  const sidebarPins = relatedPins.slice(0, 4);
  const explorePins = relatedPins.slice(4);

  return (
    <div className="max-w-[1920px] 2xl:max-w-[2100px] w-full mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 py-4">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="mb-4 flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-[#1c2136] text-gray-700 dark:text-gray-200 transition cursor-pointer"
        title="Quay lại"
      >
        <ArrowLeft size={20} />
      </button>

      {/* Main Pinterest 2-Column Desktop Layout */}
      <div className="flex flex-col lg:flex-row items-start gap-6 xl:gap-8 min-w-0 max-w-full">
        {/* Left Column: Focused Main Pin Card with Image, Details & Comments */}
        <div className="w-full lg:w-[600px] xl:w-[700px] 2xl:w-[780px] shrink-0 min-w-0">
          <div className="overflow-hidden rounded-3xl bg-white dark:bg-[#1c2136] shadow-xl ring-1 ring-black/5 dark:ring-[#2d2f40] border border-transparent dark:border-[#2d2f40] p-4 sm:p-6 lg:p-7">
            {/* Top Action Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-[#2d2f40]">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-[#252A42] text-gray-700 dark:text-gray-200 transition cursor-pointer"
                  title="Chia sẻ"
                >
                  <Share2 size={18} />
                </button>
                {isOwner && (
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    disabled={isDeleting}
                    className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition cursor-pointer"
                    title="Xóa ảnh"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              {/* Action Buttons (Like & Save) */}
              <div className="flex items-center gap-2">
                {/* Heart / Like Button (Tym ảnh) */}
                <button
                  onClick={handleLikeToggle}
                  disabled={isLiking}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs sm:text-sm font-bold transition active:scale-95 cursor-pointer border ${
                    isLiked
                      ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 shadow-xs"
                      : "bg-gray-100 hover:bg-gray-200 dark:bg-[#252A42] dark:hover:bg-[#2d2f40] text-gray-700 dark:text-gray-300 border-transparent"
                  }`}
                  title={isLiked ? "Bỏ thích ảnh" : "Thả tim ảnh"}
                >
                  <Heart
                    size={16}
                    className={`transition-transform duration-200 ${
                      isLiked ? "fill-rose-500 text-rose-500 scale-110" : "text-gray-600 dark:text-gray-300"
                    }`}
                  />
                  <span>{likeCount > 0 ? likeCount : "Thích"}</span>
                </button>

                {/* Save Button (Lưu ảnh) */}
                <button
                  onClick={handleSaveToggle}
                  disabled={isSaving}
                  className={`rounded-full px-5 py-2 text-xs sm:text-sm font-bold shadow-xs transition active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                    isSaved
                      ? "bg-[#181C31] text-white hover:bg-[#252A42] border border-[#2d2f40]"
                      : "bg-[#0052cc] text-white hover:bg-[#0041a8]"
                  }`}
                >
                  <Bookmark size={15} className={isSaved ? "fill-white" : ""} />
                  <span>{isSaving ? "..." : isSaved ? "Đã lưu" : "Lưu"}</span>
                </button>
              </div>
            </div>

            {/* Main Pin Image with Zoom / Expand Button */}
            <div className="relative mt-4 overflow-hidden rounded-2xl bg-gray-50 dark:bg-[#181C31] flex items-center justify-center group/img">
              <img
                src={pin.duong_dan}
                alt={pin.ten_hinh}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = "/fallback-pin.jpg";
                }}
                className="w-full max-h-[75vh] object-contain rounded-2xl shadow-xs cursor-zoom-in transition-transform duration-300 group-hover/img:scale-[1.01]"
                onClick={() => setIsZoomed(true)}
              />

              {/* Square-rounded Zoom / Expand Button (Pinterest style) */}
              <button
                type="button"
                onClick={() => setIsZoomed(true)}
                className="absolute bottom-3.5 right-3.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/85 dark:bg-black/75 backdrop-blur-md text-gray-800 dark:text-white shadow-lg hover:bg-white dark:hover:bg-black/95 hover:scale-105 active:scale-95 transition-all duration-200 border border-white/30 dark:border-white/10 cursor-pointer"
                title="Phóng to ảnh"
                aria-label="Phóng to ảnh"
              >
                <Maximize2 size={18} />
              </button>
            </div>

            {/* Pin Title & Description with 4-line and 3-line clamp */}
            <div className="mt-5 space-y-2.5">
              {/* Title */}
              <div className="relative">
                <h1
                  className={`text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight break-words [overflow-wrap:anywhere] leading-snug transition-all duration-300 ${
                    !isTitleExpanded ? "line-clamp-4" : ""
                  }`}
                >
                  {pin.ten_hinh}
                </h1>
                {(pin.ten_hinh.length > 120 || pin.ten_hinh.split("\n").length > 4) && (
                  <button
                    type="button"
                    onClick={() => setIsTitleExpanded(!isTitleExpanded)}
                    className="mt-1.5 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold text-gray-700 dark:text-gray-200 hover:text-[#0052cc] dark:hover:text-blue-400 bg-gray-100 hover:bg-gray-200 dark:bg-[#252A42] dark:hover:bg-[#2d2f40] transition active:scale-95 cursor-pointer shadow-xs"
                    title={isTitleExpanded ? "Thu gọn tiêu đề" : "Xem toàn bộ tiêu đề"}
                  >
                    <span>{isTitleExpanded ? "Thu gọn" : "Xem thêm"}</span>
                    <ChevronDown
                      size={14}
                      className={`stroke-[2.5] transition-transform duration-300 ease-out ${
                        isTitleExpanded ? "rotate-180 text-[#0052cc] dark:text-blue-400" : "rotate-0"
                      }`}
                    />
                  </button>
                )}
              </div>

              {/* Description */}
              {pin.mo_ta && (
                <div className="relative pt-1">
                  <p
                    className={`text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed break-words [overflow-wrap:anywhere] transition-all duration-300 ${
                      !isDescriptionExpanded ? "line-clamp-3" : ""
                    }`}
                  >
                    {pin.mo_ta}
                  </p>
                  {(pin.mo_ta.length > 170 || pin.mo_ta.split("\n").length > 3) && (
                    <button
                      type="button"
                      onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                      className="mt-1.5 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold text-[#0052cc] dark:text-blue-400 hover:text-[#0041a8] bg-blue-50 hover:bg-blue-100/80 dark:bg-[#252A42] dark:hover:bg-[#2d2f40] transition active:scale-95 cursor-pointer shadow-xs"
                      title={isDescriptionExpanded ? "Thu gọn mô tả" : "Xem toàn bộ mô tả"}
                    >
                      <span>{isDescriptionExpanded ? "Thu gọn" : "Xem thêm"}</span>
                      <ChevronDown
                        size={14}
                        className={`stroke-[2.5] transition-transform duration-300 ease-out ${
                          isDescriptionExpanded ? "rotate-180" : "rotate-0"
                        }`}
                      />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Author Profile */}
            {pin.nguoi_dung && (
              <Link
                href={
                  user?.nguoi_dung_id === pin.nguoi_dung.nguoi_dung_id
                    ? "/profile"
                    : `/profile/${pin.nguoi_dung.nguoi_dung_id}`
                }
                className="mt-5 flex items-center gap-3 p-2.5 rounded-2xl bg-gray-50 dark:bg-[#181C31] border border-gray-100 dark:border-[#2d2f40] group hover:border-[#0052cc]/30 transition"
              >
                <div className="h-10 w-10 overflow-hidden rounded-full border border-gray-200 dark:border-[#2d2f40] bg-gray-100 dark:bg-[#181C31] shrink-0">
                  {pin.nguoi_dung.anh_dai_dien ? (
                    <img
                      src={pin.nguoi_dung.anh_dai_dien}
                      alt={pin.nguoi_dung.ho_ten || "Author"}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-blue-50 dark:bg-[#252A42] font-bold text-[#0052cc] dark:text-blue-400 text-sm">
                      {(pin.nguoi_dung.ho_ten || pin.nguoi_dung.email || "U")[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-[#0052cc] dark:group-hover:text-blue-400 transition truncate">
                    {pin.nguoi_dung.ho_ten || "Tác giả"}
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{pin.nguoi_dung.email}</p>
                </div>
              </Link>
            )}

            {/* Comments Section below Pin inside the Left Card */}
            <div className="mt-6 pt-5 border-t border-gray-100 dark:border-[#2d2f40]">
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle size={18} className="text-[#0052cc] dark:text-blue-400" />
                <h3 className="font-bold text-base text-gray-900 dark:text-white">
                  Nhận xét ({comments.length})
                </h3>
              </div>

              {/* Comment Input Prompt Box */}
              <div className="mb-4">
                <form
                  onSubmit={handleCommentSubmit}
                  className={`rounded-2xl bg-gray-50 dark:bg-[#181C31] border ${
                    commentError
                      ? "border-rose-500 ring-2 ring-rose-500/20"
                      : "border-gray-200/80 dark:border-[#2d2f40] focus-within:border-[#0052cc] focus-within:ring-2 focus-within:ring-blue-500/20 dark:focus-within:ring-blue-900/40"
                  } p-3 transition-all shadow-xs`}
                >
                  <textarea
                    ref={commentTextareaRef}
                    rows={1}
                    wrap="soft"
                    placeholder={user ? "Thêm nhận xét của bạn... (Enter gửi, Shift+Enter xuống dòng)" : "Đăng nhập để bình luận..."}
                    value={newComment}
                    onChange={(e) => {
                      setNewComment(e.target.value);
                      if (commentError) setCommentError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleCommentSubmit(e);
                      }
                    }}
                    disabled={!user || isSubmittingComment}
                    style={{ wordBreak: "break-all", overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}
                    className="w-full bg-transparent border-0 outline-hidden focus:outline-hidden focus:ring-0 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-400 text-xs sm:text-sm resize-none overflow-hidden min-h-[28px] max-h-[220px] leading-relaxed break-all block p-0"
                  />

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200/40 dark:border-white/5">
                    <span className="text-[10px] text-gray-400 dark:text-gray-400 font-medium select-none">
                      {newComment.length > 0 ? `${newComment.length}/2000 ký tự` : "Nhấn Enter để gửi"}
                    </span>
                    <button
                      type="submit"
                      disabled={!user || !newComment.trim() || isSubmittingComment}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0052cc] hover:bg-[#0041a8] text-white shadow-xs active:scale-90 transition disabled:opacity-30 cursor-pointer"
                      title="Gửi nhận xét"
                    >
                      <Send size={12} />
                    </button>
                  </div>
                </form>
                {commentError && (
                  <p className="mt-1.5 ml-2 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5 font-medium animate-in fade-in">
                    <AlertCircle size={12} className="shrink-0" />
                    <span>{commentError}</span>
                  </p>
                )}
              </div>

              {/* Comments List (Infinite / smooth Y-axis scroll) */}
              <div
                ref={commentsContainerRef}
                className="space-y-3 max-h-[480px] overflow-y-auto overflow-x-hidden pr-1.5 [scrollbar-width:thin] scroll-smooth min-w-0 max-w-full"
              >
                {comments.length === 0 ? (
                  <p className="text-xs text-gray-400 dark:text-gray-400 italic py-3 text-center">
                    Chưa có nhận xét nào. Hãy là người đầu tiên chia sẻ cảm nghĩ!
                  </p>
                ) : (
                  comments.map((c) => (
                    <CommentItemRow key={c.binh_luan_id} comment={c} />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Related Pins Masonry Grid (Sidebar flowing alongside the main pin) */}
        <div className="flex-1 min-w-0 w-full">
          <div className="mb-4 flex items-center justify-between pb-2 border-b border-gray-100 dark:border-[#2d2f40]">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="text-[#0052cc] dark:text-blue-400" size={18} />
              <span>Các ý tưởng liên quan</span>
            </h2>
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
              {sidebarPins.length} ý tưởng
            </span>
          </div>
          <MasonryGrid
            pins={sidebarPins}
            className="w-full columns-2 sm:columns-2 md:columns-2 lg:columns-2 xl:columns-4 gap-4 [column-fill:_balance]"
          />
        </div>
      </div>

      {/* Bottom Section: More to Explore (Full Width Discovery Section) */}
      {explorePins.length > 0 && (
        <div className="mt-16 pt-10 border-t border-gray-100 dark:border-[#2d2f40]">
          <div className="text-center mb-8 space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center justify-center gap-2">
              <Sparkles className="text-[#0052cc] dark:text-blue-400" size={22} />
              <span>Khám phá thêm nhiều ý tưởng</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Các nguồn cảm hứng đa dạng, phong phú được tuyển chọn dành cho bạn
            </p>
          </div>
          <MasonryGrid pins={explorePins} />
        </div>
      )}

      {/* 5-second countdown confirmation modal for deleting pin */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#1C2136] p-6 shadow-2xl border border-gray-100 dark:border-[#2D2F40] text-center animate-in zoom-in-95 duration-200">
            <div className="mx-auto w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3.5">
              <Trash2 size={24} />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Xác nhận xóa ảnh?
            </h3>
            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Ảnh <span className="font-semibold text-gray-700 dark:text-gray-300">"{pin.ten_hinh}"</span> sẽ bị xóa vĩnh viễn khỏi hệ thống và không thể hoàn tác.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-[#252A42] dark:hover:bg-[#2D2F40] text-gray-700 dark:text-gray-300 py-2.5 text-xs sm:text-sm font-semibold transition cursor-pointer"
              >
                Hủy bỏ
              </button>

              <button
                type="button"
                onClick={handleDeletePin}
                disabled={deleteCountdown > 0 || isDeleting}
                className={`flex-1 rounded-full py-2.5 text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 shadow-xs ${
                  deleteCountdown > 0 || isDeleting
                    ? "bg-gray-200 dark:bg-[#2D2F40] text-gray-400 dark:text-gray-500 cursor-not-allowed"
                    : "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20 active:scale-95 cursor-pointer"
                }`}
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Đang xóa...</span>
                  </>
                ) : deleteCountdown > 0 ? (
                  <span>Xác nhận ({deleteCountdown}s)</span>
                ) : (
                  <span>Xác nhận xóa</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Lightbox Zoom Modal (Bấm phóng to / thu nhỏ) */}
      {isZoomed && (
        <div
          onClick={() => setIsZoomed(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-md p-4 sm:p-8 animate-in fade-in duration-200 cursor-zoom-out"
        >
          {/* Top Right Floating Close / Minimize Button */}
          <div className="absolute top-5 right-5 z-50 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsZoomed(false)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 hover:bg-white/30 text-white backdrop-blur-md shadow-xl transition active:scale-90 cursor-pointer border border-white/20"
              title="Thu nhỏ lại (Đóng)"
              aria-label="Thu nhỏ ảnh"
            >
              <Minimize2 size={20} />
            </button>
          </div>

          {/* Zoomed Image Container */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[92vh] max-w-[92vw] flex items-center justify-center cursor-default"
          >
            <img
              src={pin.duong_dan}
              alt={pin.ten_hinh}
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = "/fallback-pin.jpg";
              }}
              className="max-h-[88vh] max-w-[88vw] object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 select-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
