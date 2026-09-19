"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Heart, MessageSquare, CheckCheck, Loader2, Sparkles } from "lucide-react";
import api from "@/lib/api";
import { NotificationItem } from "@/types";
import { useAuth } from "@/lib/auth-context";

export const NotificationDropdown: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchUnreadCount = async () => {
    if (!user) return;
    try {
      const res = await api.get("/notifications/unread-count");
      if (res.data?.data) {
        setUnreadCount(res.data.data.unreadCount || 0);
      }
    } catch {
      // Ignore when not logged in or on error
    }
  };

  const fetchNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.get("/notifications");
      if (res.data?.data) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  };

  // Poll for unread count only if user is logged in
  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      setNotifications([]);
      return;
    }
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [user]);

  // Fetch full notifications list when opening dropdown
  useEffect(() => {
    if (isOpen && user) {
      fetchNotifications();
    }
  }, [isOpen, user]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleMarkAllAsRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, da_doc: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  const handleNotificationClick = async (item: NotificationItem) => {
    if (!item.da_doc) {
      try {
        await api.put(`/notifications/${item.thong_bao_id}/read`);
        setNotifications((prev) =>
          prev.map((n) =>
            n.thong_bao_id === item.thong_bao_id ? { ...n, da_doc: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error("Failed to mark notification as read", err);
      }
    }
    setIsOpen(false);
    if (item.hinh_id) {
      router.push(`/pin/${item.hinh_id}`);
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return "Vừa xong";
      if (diffMins < 60) return `${diffMins} phút trước`;
      if (diffHours < 24) return `${diffHours} giờ trước`;
      if (diffDays < 7) return `${diffDays} ngày trước`;
      return date.toLocaleDateString("vi-VN");
    } catch {
      return "";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#252A42] active:scale-95 transition cursor-pointer"
        title="Thông báo"
      >
        <Bell size={18} className="sm:w-5 sm:h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-black text-white shadow-md animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 max-h-[480px] rounded-2xl bg-white dark:bg-[#1c2136] shadow-2xl ring-1 ring-black/10 dark:ring-[#2d2f40] border border-gray-100 dark:border-[#2d2f40] overflow-hidden flex flex-col z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-[#2d2f40] bg-gray-50/70 dark:bg-[#181C31]/80">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Thông báo</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-[#252A42] text-[#0052cc] dark:text-blue-400">
                  {unreadCount} mới
                </span>
              )}
            </div>
            {notifications.length > 0 && unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-1 text-[11px] font-semibold text-[#0052cc] dark:text-blue-400 hover:underline cursor-pointer"
              >
                <CheckCheck size={13} />
                <span>Đã đọc tất cả</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1 divide-y divide-gray-100 dark:divide-[#2d2f40] [scrollbar-width:thin]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <Loader2 size={24} className="animate-spin text-[#0052cc]" />
                <span className="text-xs mt-2 font-medium">Đang tải thông báo...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="h-12 w-12 rounded-full bg-blue-50 dark:bg-[#252A42] flex items-center justify-center text-[#0052cc] dark:text-blue-400 mb-2.5">
                  <Sparkles size={22} />
                </div>
                <p className="text-xs font-bold text-gray-700 dark:text-gray-200">Chưa có thông báo nào</p>
                <p className="text-[11px] text-gray-400 dark:text-gray-400 mt-0.5 max-w-[220px]">
                  Khi ai đó thích hoặc bình luận trên tác phẩm của bạn, bạn sẽ nhận được thông báo tại đây.
                </p>
              </div>
            ) : (
              notifications.map((item) => {
                const sender = item.nguoi_gui;
                const isLike = item.loai === "LIKE";

                return (
                  <div
                    key={item.thong_bao_id}
                    onClick={() => handleNotificationClick(item)}
                    className={`flex items-start gap-3 p-3.5 hover:bg-gray-50 dark:hover:bg-[#252A42] transition cursor-pointer relative ${
                      !item.da_doc
                        ? "bg-blue-50/40 dark:bg-blue-950/30"
                        : "bg-transparent"
                    }`}
                  >
                    {/* Unread indicator */}
                    {!item.da_doc && (
                      <span className="absolute left-1.5 top-5 h-2 w-2 rounded-full bg-[#0052cc]" />
                    )}

                    {/* Sender Avatar with Interaction Badge */}
                    <div className="relative shrink-0 ml-1">
                      <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100 dark:bg-[#252A42] border border-gray-200 dark:border-[#2d2f40]">
                        {sender?.anh_dai_dien ? (
                          <img
                            src={sender.anh_dai_dien}
                            alt={sender.ho_ten || "Avatar"}
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-blue-50 dark:bg-[#252A42] text-xs font-bold text-[#0052cc] dark:text-blue-400">
                            {(sender?.ho_ten || sender?.email || "U")[0].toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Icon Badge */}
                      <span
                        className={`absolute -bottom-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full text-white shadow-xs ${
                          isLike ? "bg-rose-500" : "bg-[#0052cc]"
                        }`}
                      >
                        {isLike ? <Heart size={9} fill="currentColor" /> : <MessageSquare size={9} fill="currentColor" />}
                      </span>
                    </div>

                    {/* Content Text */}
                    <div className="flex-1 min-w-0 pr-1">
                      <p className="text-xs text-gray-800 dark:text-gray-100 leading-snug break-words">
                        {item.noi_dung}
                      </p>
                      <span className="text-[10px] font-medium text-gray-400 dark:text-gray-400 mt-1 block">
                        {formatTimeAgo(item.createdAt)}
                      </span>
                    </div>

                    {/* Image Thumbnail Preview if available */}
                    {item.hinh_anh?.duong_dan && (
                      <div className="shrink-0 h-11 w-11 rounded-lg overflow-hidden border border-gray-100 dark:border-[#2d2f40] bg-gray-50 dark:bg-[#181C31]">
                        <img
                          src={item.hinh_anh.duong_dan}
                          alt={item.hinh_anh.ten_hinh}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
