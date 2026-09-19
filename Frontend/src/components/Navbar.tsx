"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import {
  Search,
  Plus,
  User,
  LogOut,
  ChevronDown,
  Bell,
  MessageSquare,
  Sun,
  Moon,
  X,
  Bookmark,
  Heart,
  MessageCircle,
  Image as ImageIcon,
  PlusCircle,
  FolderHeart,
  Shield,
} from "lucide-react";

import { HukiLogo } from "@/components/HukiLogo";
import { NotificationDropdown } from "@/components/NotificationDropdown";

export const Navbar: React.FC = () => {
  const { user, openAuthModal, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isInitialMount = useRef(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  // Sync with searchParams if changed from external navigation
  useEffect(() => {
    setSearchTerm(searchParams.get("search") || "");
  }, [searchParams]);

  // Automatic 2-second Debounce search (tự động tìm kiếm sau 2s không cần ấn Enter)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timer = setTimeout(() => {
      const currentQuery = searchParams.get("search") || "";
      const trimmed = searchTerm.trim();

      if (trimmed !== currentQuery) {
        if (trimmed) {
          router.push(`/?search=${encodeURIComponent(trimmed)}`);
        } else if (pathname === "/") {
          router.push("/");
        }
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchTerm, router, searchParams, pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchTerm.trim();
    if (trimmed) {
      router.push(`/?search=${encodeURIComponent(trimmed)}`);
    } else {
      router.push(`/`);
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 sm:h-20 items-center justify-between gap-2 sm:gap-3 bg-white dark:bg-[#181C31] px-3 sm:px-6 shadow-xs border-b border-gray-100 dark:border-[#2d2f40] transition-colors">
      {/* Left section: Logo */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <HukiLogo size="md" />
      </div>

      {/* Middle section: Large Search Bar with 1s Auto-Debounce */}
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-4xl min-w-0 mx-1 sm:mx-2">
        <div className="relative flex items-center">
          <Search className="absolute left-3 sm:left-4 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm kiếm ý tưởng, anime, ẩm thực (tự động tìm kiếm)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 sm:h-12 w-full rounded-full bg-gray-100 dark:bg-[#1c2136] pl-9 sm:pl-12 pr-9 sm:pr-11 text-xs sm:text-sm font-medium text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 outline-hidden border border-transparent dark:border-[#2d2f40] hover:bg-gray-200/80 dark:hover:bg-[#252A42] focus:bg-white dark:focus:bg-[#252A42] focus:border-[#0052cc] focus:ring-2 focus:ring-blue-600/30 transition"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                router.push("/");
              }}
              className="absolute right-2.5 sm:right-3 flex h-6 w-6 items-center justify-center rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-[#2d2f40] transition cursor-pointer"
              title="Xóa tìm kiếm"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </form>

      {/* Right section: Theme Toggle, Notifications, Create Button & User Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Dark/Light Mode Switcher */}
        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1c2136] active:scale-95 transition duration-200 cursor-pointer"
          title={mounted && theme === "dark" ? "Chuyển sang chế độ Sáng" : "Chuyển sang chế độ Tối"}
        >
          {mounted && theme === "dark" ? (
            <Sun size={19} className="text-yellow-400 animate-in spin-in-180 duration-200 sm:w-5 sm:h-5" />
          ) : (
            <Moon size={19} className="text-gray-700 dark:text-gray-300 animate-in spin-in-180 duration-200 sm:w-5 sm:h-5" />
          )}
        </button>

        {!mounted ? (
          <div className="h-9 w-28 sm:w-36 animate-pulse rounded-full bg-gray-100 dark:bg-[#1c2136]" />
        ) : user ? (
          <>
            <NotificationDropdown />

            {/* Create Pin Button */}
            <Link
              href="/create"
              className={`flex h-9 sm:h-10 items-center gap-1.5 rounded-full px-3.5 sm:px-4 font-bold text-xs sm:text-sm transition duration-200 active:scale-95 ${pathname === "/create"
                  ? "bg-[#0041a8] text-white ring-2 ring-blue-500"
                  : "bg-[#0052cc] hover:bg-[#0041a8] text-white shadow-xs"
                }`}
              title="Tạo ý tưởng mới"
            >
              <Plus size={16} className="stroke-[2.5]" />
              <span className="hidden sm:inline">Tạo</span>
            </Link>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1 sm:gap-1.5 rounded-full p-0.5 sm:p-1 hover:bg-gray-100 dark:hover:bg-[#1c2136] transition cursor-pointer"
              >
                <div className="h-8 w-8 sm:h-9 sm:w-9 overflow-hidden rounded-full border border-gray-200 dark:border-[#2d2f40] bg-gray-100 dark:bg-[#1c2136] shrink-0">
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
                    <div className="flex h-full w-full items-center justify-center bg-[#0052cc] text-xs sm:text-sm font-bold text-white">
                      {(user.ho_ten || user.email || "U")[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <ChevronDown size={14} className="text-gray-500 dark:text-gray-400 hidden sm:block" />
              </button>

              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 sm:w-72 rounded-3xl bg-white dark:bg-[#1c2136] p-2.5 shadow-2xl ring-1 ring-black/10 dark:ring-[#2d2f40] border border-gray-100 dark:border-[#2d2f40] animate-in fade-in slide-in-from-top-2 duration-150 z-50 divide-y divide-gray-100 dark:divide-[#2d2f40]"
                >
                  {/* 1. Header: User Info Card */}
                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="p-3 mb-1 rounded-2xl bg-gray-50/80 dark:bg-[#252A42]/70 flex items-center gap-3 hover:bg-blue-50/50 dark:hover:bg-[#2d3352]/70 transition group"
                  >
                    <div className="h-10 w-10 overflow-hidden rounded-full border border-gray-200 dark:border-[#2d2f40] bg-gray-100 dark:bg-[#181C31] shrink-0">
                      {user.anh_dai_dien ? (
                        <img
                          src={user.anh_dai_dien}
                          alt={user.ho_ten || "Avatar"}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[#0052cc] text-sm font-bold text-white">
                          {(user.ho_ten || user.email || "U")[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm text-gray-900 dark:text-white truncate group-hover:text-[#0052cc] dark:group-hover:text-blue-400 transition">
                        {user.ho_ten || "Người dùng"}
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    </div>
                  </Link>

                  {/* 2. Group: Mục cá nhân & Bộ sưu tập */}
                  <div className="py-2 space-y-0.5">
                    <p className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-400">
                      Mục cá nhân
                    </p>

                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#252A42] hover:text-[#0052cc] dark:hover:text-blue-400 transition"
                    >
                      <User size={15} />
                      <span>Trang cá nhân</span>
                    </Link>

                    <Link
                      href="/profile?tab=created"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#252A42] hover:text-[#0052cc] dark:hover:text-blue-400 transition"
                    >
                      <ImageIcon size={15} />
                      <span>Tác phẩm đã tạo</span>
                    </Link>

                    <Link
                      href="/profile?tab=saved"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#252A42] hover:text-[#0052cc] dark:hover:text-blue-400 transition"
                    >
                      <FolderHeart size={15} />
                      <span>Folder & Ghim đã lưu</span>
                    </Link>

                    <Link
                      href="/profile?tab=liked_pins"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#252A42] hover:text-rose-500 dark:hover:text-rose-400 transition"
                    >
                      <Heart size={15} />
                      <span>Ảnh đã thích</span>
                    </Link>

                    <Link
                      href="/profile?tab=liked_comments"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#252A42] hover:text-rose-500 dark:hover:text-rose-400 transition"
                    >
                      <MessageCircle size={15} />
                      <span>Bình luận đã thích</span>
                    </Link>
                  </div>

                  {/* 3. Group: Tiện ích nhanh */}
                  <div className="py-2 space-y-0.5">
                    <p className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-400">
                      Tiện ích & Cài đặt
                    </p>

                    <Link
                      href="/create"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#252A42] hover:text-[#0052cc] dark:hover:text-blue-400 transition"
                    >
                      <PlusCircle size={15} className="text-[#0052cc] dark:text-blue-400" />
                      <span>Tạo Ghim / Ý tưởng mới</span>
                    </Link>

                    <Link
                      href="/profile?modal=privacy"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#252A42] hover:text-[#0052cc] dark:hover:text-blue-400 transition"
                    >
                      <Shield size={15} className="text-[#0052cc] dark:text-blue-400" />
                      <span>Cài đặt Quyền riêng tư</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        toggleTheme();
                      }}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#252A42] transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        {mounted && theme === "dark" ? <Sun size={15} className="text-yellow-400" /> : <Moon size={15} className="text-gray-600 dark:text-gray-300" />}
                        <span>Giao diện: {mounted && theme === "dark" ? "Tối" : "Sáng"}</span>
                      </div>
                      <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-[#181C31] px-2 py-0.5 rounded-full">
                        Đổi
                      </span>
                    </button>
                  </div>

                  {/* 4. Group: Tài khoản & Đăng xuất */}
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                    >
                      <LogOut size={15} />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-1.5 sm:gap-2">
            {(() => {
              const currentQuery = searchParams.toString() ? `?${searchParams.toString()}` : "";
              const currentUrl = `${pathname}${currentQuery}`;
              const redirectParam = currentUrl && !currentUrl.startsWith("/login") ? `&redirect=${encodeURIComponent(currentUrl)}` : "";
              return (
                <>
                  <Link
                    href={`/login?mode=login${redirectParam}`}
                    className="h-8 sm:h-10 rounded-full bg-[#0052cc] hover:bg-[#0041a8] px-3.5 sm:px-5 text-xs sm:text-sm font-bold text-white shadow-xs active:scale-95 transition whitespace-nowrap flex items-center justify-center cursor-pointer"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href={`/login?mode=signup${redirectParam}`}
                    className="h-8 sm:h-10 rounded-full bg-gray-100 dark:bg-[#1c2136] dark:text-white px-3.5 sm:px-5 text-xs sm:text-sm font-bold text-gray-900 hover:bg-gray-200 dark:hover:bg-[#252A42] active:scale-95 transition whitespace-nowrap flex items-center justify-center border border-transparent dark:border-[#2d2f40] cursor-pointer"
                  >
                    Đăng ký
                  </Link>
                </>
              );
            })()}
          </div>
        )}
      </div>
    </header>
  );
};


