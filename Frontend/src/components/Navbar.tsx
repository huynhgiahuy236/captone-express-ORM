"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
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
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const isInitialMount = useRef(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const TRENDING_SUGGESTIONS = [
    { label: "Anime Wallpaper", icon: "🎨", query: "Anime" },
    { label: "Xe thể thao Porsche", icon: "🏎️", query: "Porsche" },
    { label: "Mèo con dễ thương", icon: "🐱", query: "Mèo" },
    { label: "Cyberpunk & Game", icon: "🚀", query: "Cyberpunk" },
    { label: "Setup Công nghệ", icon: "💻", query: "Công nghệ" },
    { label: "Ẩm thực & Cà phê", icon: "☕", query: "Cà phê" },
    { label: "Thiên nhiên 4K", icon: "🌿", query: "Thiên nhiên" },
    { label: "Thiết kế Nội thất", icon: "🏠", query: "Nội thất" },
  ];

  const POPULAR_KEYWORDS = [
    "Anime", "Manga", "Gundam", "Cyberpunk", "Porsche", "Mustang", "Ferrari", "BMW",
    "Chó cún", "Mèo con", "Pet", "Công nghệ", "Laptop", "Bàn phím cơ", "Setup PC",
    "Thiên nhiên", "Hoàng hôn", "Biển", "Phong cảnh", "Ẩm thực", "Bánh ngọt", "Cà phê",
    "Nghệ thuật", "Concept Art", "3D Render", "Nội thất", "Kiến trúc", "Thời trang"
  ];

  // Load search history from localStorage
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("huki_search_history");
      if (saved) {
        setSearchHistory(JSON.parse(saved));
      }
    } catch (e) {}
  }, []);

  const saveToHistory = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) return;
    setSearchHistory((prev) => {
      const updated = [trimmed, ...prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())].slice(0, 8);
      try {
        localStorage.setItem("huki_search_history", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const removeFromHistory = (queryToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchHistory((prev) => {
      const updated = prev.filter((item) => item !== queryToRemove);
      try {
        localStorage.setItem("huki_search_history", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const clearAllHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchHistory([]);
    try {
      localStorage.removeItem("huki_search_history");
    } catch (e) {}
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Sync with searchParams if changed from external navigation
  useEffect(() => {
    setSearchTerm(searchParams.get("search") || "");
  }, [searchParams]);

  // Automatic 1-second Debounce search (tự động tìm kiếm sau 1s)
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
          saveToHistory(trimmed);
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
    setIsSearchFocused(false);
    if (trimmed) {
      saveToHistory(trimmed);
      router.push(`/?search=${encodeURIComponent(trimmed)}`);
    } else {
      router.push(`/`);
    }
  };

  const handleSelectQuery = (query: string) => {
    setSearchTerm(query);
    saveToHistory(query);
    setIsSearchFocused(false);
    router.push(`/?search=${encodeURIComponent(query)}`);
  };

  // Live filtered suggestions when typing
  const liveSuggestions = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const query = searchTerm.toLowerCase().trim();
    return POPULAR_KEYWORDS.filter((kw) => kw.toLowerCase().includes(query) && kw.toLowerCase() !== query).slice(0, 5);
  }, [searchTerm]);

  return (
    <header className="sticky top-0 z-40 flex h-16 sm:h-20 items-center justify-between gap-2 sm:gap-3 bg-white dark:bg-[#181C31] px-3 sm:px-6 shadow-xs border-b border-gray-100 dark:border-[#2d2f40] transition-colors">
      {/* Left section: Logo */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <HukiLogo size="md" />
      </div>

      {/* Middle section: Large Search Bar with Auto-Suggestions & Search History */}
      <div ref={searchContainerRef} className="relative flex-1 max-w-4xl min-w-0 mx-1 sm:mx-2">
        <form onSubmit={handleSearchSubmit} className="w-full">
          <div className="relative flex items-center">
            <Search className="absolute left-3 sm:left-4 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm kiếm ý tưởng, anime, ẩm thực (tự động tìm kiếm)..."
              value={searchTerm}
              onFocus={() => setIsSearchFocused(true)}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (!isSearchFocused) setIsSearchFocused(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setIsSearchFocused(false);
                }
              }}
              className="h-9 sm:h-12 w-full rounded-full bg-gray-100 dark:bg-[#1c2136] pl-9 sm:pl-12 pr-9 sm:pr-11 text-xs sm:text-sm font-medium text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 outline-hidden border border-transparent dark:border-[#2d2f40] hover:bg-gray-200/80 dark:hover:bg-[#252A42] focus:bg-white dark:focus:bg-[#252A42] focus:border-[#0052cc] focus:ring-2 focus:ring-blue-600/30 transition shadow-2xs"
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

        {/* Auto-suggestions & Recent History Dropdown Modal */}
        {isSearchFocused && (
          <div className="absolute top-full left-0 right-0 mt-2 rounded-3xl bg-white dark:bg-[#1c2136] border border-gray-200 dark:border-[#2d2f40] shadow-2xl p-4 sm:p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200 max-h-[80vh] overflow-y-auto [scrollbar-width:none]">
            
            {/* 1. Live suggestions matching current input */}
            {searchTerm.trim() && liveSuggestions.length > 0 && (
              <div className="mb-4">
                <span className="text-[11px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider block mb-2 px-1">
                  Gợi ý từ khóa
                </span>
                <div className="space-y-1">
                  {liveSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectQuery(suggestion)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-[#252A42] hover:text-[#0052cc] dark:hover:text-blue-400 transition cursor-pointer group"
                    >
                      <Search size={14} className="text-gray-400 group-hover:text-[#0052cc] dark:group-hover:text-blue-400 shrink-0" />
                      <span>{suggestion}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Recent Search History */}
            {searchHistory.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between px-1 mb-2">
                  <span className="text-[11px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider block">
                    Lịch sử tìm kiếm gần đây
                  </span>
                  <button
                    type="button"
                    onClick={clearAllHistory}
                    className="text-[11px] font-bold text-rose-500 hover:text-rose-600 hover:underline cursor-pointer"
                  >
                    Xóa tất cả
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {searchHistory.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectQuery(item)}
                      className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-[#252A42] hover:bg-blue-50 dark:hover:bg-[#2e3555] border border-gray-200/60 dark:border-[#2d2f40] text-xs font-semibold text-gray-800 dark:text-gray-200 hover:text-[#0052cc] dark:hover:text-blue-400 transition cursor-pointer"
                    >
                      <Search size={12} className="text-gray-400 group-hover:text-[#0052cc] shrink-0" />
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={(e) => removeFromHistory(item, e)}
                        className="ml-1 text-gray-400 hover:text-rose-500 hover:bg-gray-200 dark:hover:bg-[#181C31] rounded-full p-0.5 transition cursor-pointer"
                        title="Xóa mục này"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Trending & Hot Topics */}
            <div>
              <span className="text-[11px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider block mb-2.5 px-1">
                🔥 Khám phá xu hướng thịnh hành
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TRENDING_SUGGESTIONS.map((topic, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectQuery(topic.query)}
                    className="flex items-center gap-2 p-2.5 rounded-2xl bg-gray-50 dark:bg-[#252A42]/70 hover:bg-blue-50 dark:hover:bg-[#2e3555] border border-gray-100 dark:border-[#2d2f40] text-left transition cursor-pointer group active:scale-97"
                  >
                    <span className="text-base shrink-0">{topic.icon}</span>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-200 group-hover:text-[#0052cc] dark:group-hover:text-blue-400 truncate">
                      {topic.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>

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


