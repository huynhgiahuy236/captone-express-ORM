"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { Search, Plus, User, LogOut, ChevronDown, Bell, MessageSquare, Sun, Moon, X } from "lucide-react";

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

  useEffect(() => {
    setMounted(true);
  }, []);

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
    }, 2000);

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
      {/* Left section: Logo & Nav Links */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <HukiLogo size="md" />

        <Link
          href="/create"
          className={`flex h-9 sm:h-11 items-center gap-1.5 sm:gap-2 rounded-full px-3.5 sm:px-5 font-bold text-xs sm:text-sm transition duration-200 active:scale-95 ${
            pathname === "/create"
              ? "bg-[#0041a8] text-white ring-2 ring-blue-500"
              : "bg-[#0052cc] hover:bg-[#0041a8] text-white shadow-xs"
          }`}
          title="Tạo ý tưởng"
        >
          <Plus size={18} className="stroke-[2.5]" />
          <span className="hidden md:inline">Tạo ý tưởng</span>
        </Link>
      </div>

      {/* Middle section: Large Search Bar with 2s Auto-Debounce */}
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

      {/* Right section: Theme Toggle & User Profile / Auth Buttons */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
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

            {/* Profile Dropdown */}
            <div className="relative">
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
                  className="absolute right-0 mt-2 w-52 sm:w-56 rounded-2xl bg-white dark:bg-[#1c2136] p-2 shadow-xl ring-1 ring-black/5 dark:ring-[#2d2f40] border border-gray-100 dark:border-[#2d2f40] animate-in fade-in slide-in-from-top-2 duration-150 z-50"
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <div className="p-2.5 sm:p-3 border-b border-gray-100 dark:border-[#2d2f40]">
                    <p className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white truncate">{user.ho_ten || "Người dùng"}</p>
                    <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                  </div>

                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex w-full items-center gap-2.5 sm:gap-3 rounded-xl px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#252A42] transition"
                  >
                    <User size={15} />
                    Trang cá nhân
                  </Link>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-2.5 sm:gap-3 rounded-xl px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
                  >
                    <LogOut size={15} />
                    Đăng xuất
                  </button>
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


