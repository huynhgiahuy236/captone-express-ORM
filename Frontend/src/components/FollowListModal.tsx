"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { X, Loader2, Users, UserPlus, UserCheck, Search, ImageOff } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface FollowUserItem {
  nguoi_dung_id: number;
  ho_ten?: string | null;
  email: string;
  anh_dai_dien?: string | null;
  mo_ta?: string | null;
  isFollowing?: boolean;
  followedAt?: string;
}

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  initialTab?: "followers" | "following";
  userName?: string;
  onFollowChange?: () => void;
}

export const FollowListModal: React.FC<FollowListModalProps> = ({
  isOpen,
  onClose,
  userId,
  initialTab = "followers",
  userName,
  onFollowChange,
}) => {
  const { user: currentUser, openAuthModal } = useAuth();
  const [activeTab, setActiveTab] = useState<"followers" | "following">(initialTab);
  const [followers, setFollowers] = useState<FollowUserItem[]>([]);
  const [following, setFollowing] = useState<FollowUserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setSearchQuery("");
      loadData();
    }
  }, [isOpen, userId, initialTab]);

  const loadData = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [followersRes, followingRes] = await Promise.all([
        api.get(`/follow/followers/${userId}`).catch(() => ({ data: { data: [] } })),
        api.get(`/follow/following/${userId}`).catch(() => ({ data: { data: [] } })),
      ]);

      setFollowers(Array.isArray(followersRes.data?.data) ? followersRes.data.data : []);
      setFollowing(Array.isArray(followingRes.data?.data) ? followingRes.data.data : []);
    } catch (err) {
      console.error("Lỗi khi tải danh sách follow:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentList = activeTab === "followers" ? followers : following;

  const filteredList = currentList.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (item.ho_ten || "").toLowerCase().includes(q) ||
      (item.email || "").toLowerCase().includes(q) ||
      (item.mo_ta || "").toLowerCase().includes(q)
    );
  });

  const handleToggleFollowItem = async (targetUser: FollowUserItem) => {
    if (!currentUser) {
      openAuthModal("login");
      return;
    }

    if (actionLoadingId === targetUser.nguoi_dung_id) return;
    setActionLoadingId(targetUser.nguoi_dung_id);

    try {
      const res = await api.post(`/follow/${targetUser.nguoi_dung_id}`);
      if (res.data?.data) {
        const nextIsFollowing = res.data.data.isFollowing;
        toast.success(res.data.data.message || (nextIsFollowing ? "Đã theo dõi!" : "Đã hủy theo dõi!"));

        // Update local states
        const updater = (list: FollowUserItem[]) =>
          list.map((u) =>
            u.nguoi_dung_id === targetUser.nguoi_dung_id
              ? { ...u, isFollowing: nextIsFollowing }
              : u
          );

        setFollowers(updater);
        setFollowing(updater);
        onFollowChange?.();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể thực hiện thao tác");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-md my-auto max-h-[88vh] flex flex-col rounded-3xl bg-white dark:bg-[#1c2136] border border-gray-100 dark:border-[#2d2f40] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 pb-3 border-b border-gray-100 dark:border-[#2d2f40] relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-2 text-gray-400 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#252A42] hover:text-gray-700 dark:hover:text-white transition cursor-pointer"
          >
            <X size={18} />
          </button>

          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {userName ? `${userName}` : "Danh sách tương tác"}
          </h3>

          {/* Tabs */}
          <div className="flex items-center gap-2 p-1 mt-3 rounded-2xl bg-gray-100 dark:bg-[#252A42]">
            <button
              type="button"
              onClick={() => {
                setActiveTab("followers");
                setSearchQuery("");
              }}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer text-center ${
                activeTab === "followers"
                  ? "bg-white dark:bg-[#1c2136] text-[#0052cc] dark:text-blue-400 shadow-xs"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Người theo dõi ({followers.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("following");
                setSearchQuery("");
              }}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer text-center ${
                activeTab === "following"
                  ? "bg-white dark:bg-[#1c2136] text-[#0052cc] dark:text-blue-400 shadow-xs"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Đang theo dõi ({following.length})
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative mt-3 flex items-center">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Tìm trong ${activeTab === "followers" ? "người theo dõi" : "đang theo dõi"}...`}
              className="w-full rounded-2xl bg-gray-50 dark:bg-[#181C31] border border-gray-200 dark:border-[#2d2f40] py-2 pl-9 pr-8 text-xs font-medium text-gray-900 dark:text-white placeholder-gray-400 outline-hidden focus:border-[#0052cc]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 [scrollbar-width:none] min-h-[260px] max-h-[50vh]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#0052cc]" />
              <p className="mt-3 text-xs font-semibold text-gray-400">Đang tải danh sách...</p>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-[#252A42] text-gray-400 mb-3">
                <Users size={22} />
              </div>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                {searchQuery
                  ? "Không tìm thấy người dùng phù hợp"
                  : activeTab === "followers"
                  ? "Chưa có người theo dõi nào"
                  : "Chưa theo dõi người dùng nào"}
              </p>
              <p className="text-xs text-gray-400 mt-1 max-w-xs leading-relaxed">
                {activeTab === "followers"
                  ? "Chưa có người theo dõi hoặc tác giả đã đặt quyền riêng tư cho danh sách này."
                  : "Chưa theo dõi ai hoặc tác giả đã đặt quyền riêng tư cho danh sách này."}
              </p>
            </div>
          ) : (
            filteredList.map((item) => {
              const isSelf = currentUser?.nguoi_dung_id === item.nguoi_dung_id;
              const profileLink = isSelf ? "/profile" : `/profile/${item.nguoi_dung_id}`;
              const isItemLoading = actionLoadingId === item.nguoi_dung_id;

              return (
                <div
                  key={item.nguoi_dung_id}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-gray-50 dark:bg-[#181C31] border border-gray-100 dark:border-[#2d2f40] hover:border-[#0052cc]/30 transition"
                >
                  <Link
                    href={profileLink}
                    onClick={onClose}
                    className="flex items-center gap-3 min-w-0 flex-1 group"
                  >
                    <div className="h-10 w-10 overflow-hidden rounded-full border border-gray-200 dark:border-[#2d2f40] bg-gray-100 dark:bg-[#252A42] shrink-0">
                      {item.anh_dai_dien ? (
                        <img
                          src={item.anh_dai_dien}
                          alt={item.ho_ten || "User"}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-blue-50 dark:bg-[#252A42] font-bold text-[#0052cc] dark:text-blue-400 text-sm">
                          {(item.ho_ten || item.email || "U")[0].toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white group-hover:text-[#0052cc] dark:group-hover:text-blue-400 transition truncate">
                        {item.ho_ten || "Người dùng"}
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                        {item.mo_ta || item.email}
                      </p>
                    </div>
                  </Link>

                  {!isSelf && (
                    <button
                      type="button"
                      disabled={isItemLoading}
                      onClick={() => handleToggleFollowItem(item)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0 ${
                        item.isFollowing
                          ? "bg-gray-200 dark:bg-[#252A42] text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-[#2e3450]"
                          : "bg-[#0052cc] hover:bg-[#0041a8] text-white shadow-xs"
                      }`}
                    >
                      {isItemLoading ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : item.isFollowing ? (
                        <>
                          <UserCheck size={12} className="text-[#0052cc] dark:text-blue-400" />
                          <span>Đang theo dõi</span>
                        </>
                      ) : (
                        <>
                          <UserPlus size={12} />
                          <span>Theo dõi</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
