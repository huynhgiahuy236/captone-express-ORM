"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { ImageItem } from "@/types";
import { MasonryGrid } from "@/components/MasonryGrid";
import { Loader2, SearchX, ChevronLeft, ChevronRight } from "lucide-react";

const BASE_PRESETS = [
  "Thú cưng",
  "Xe cộ",
  "Công nghệ",
  "Thiên nhiên",
  "Ẩm thực",
  "Nghệ thuật",
  "Kiến trúc",
  "Thời trang",
];

function HomeContent() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";

  const [allPins, setAllPins] = useState<ImageItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const fetchPins = async () => {
    setLoading(true);
    try {
      let endpoint = "/images?pageSize=50";
      if (search.trim()) {
        endpoint = `/images/search?name=${encodeURIComponent(search.trim())}`;
      }
      const res = await api.get(endpoint);
      const items = res.data?.data?.items || res.data?.data || [];
      setAllPins(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("Failed to load pins", err);
      setAllPins([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPins();
  }, [search]);

  // Tự động gom các thể loại đang có ảnh trong hệ thống
  const dynamicCategories = React.useMemo(() => {
    const list: { id: string; name: string }[] = [];
    const seen = new Set<string>();

    // 1. Nạp danh mục cơ sở có ảnh
    BASE_PRESETS.forEach((base) => {
      const lower = base.toLowerCase();
      const hasPins = allPins.some((p) => (p.the_loai || "").trim().toLowerCase() === lower);
      if (hasPins && !seen.has(lower)) {
        seen.add(lower);
        list.push({ id: lower, name: base });
      }
    });

    // 2. Tự động nảy thêm các thể loại mới do người dùng tự nhập (e.g. 'Trai đẹp', 'hay lắm'...)
    allPins.forEach((p) => {
      const cat = (p.the_loai || "").trim();
      if (cat) {
        const lower = cat.toLowerCase();
        if (!seen.has(lower)) {
          seen.add(lower);
          list.push({ id: lower, name: cat });
        }
      }
    });

    return list;
  }, [allPins]);

  // Kiểm tra vị trí cuộn để ẩn/hiện nút mũi tên
  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const el = scrollContainerRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll, { passive: true });
      window.addEventListener("resize", checkScroll);
      return () => {
        el.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, [dynamicCategories, allPins]);

  // Cuộn qua 3 mục (khoảng 360px) hoặc từng mục nếu còn ít
  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 360;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScroll, 350);
    }
  };

  // Lọc danh sách theo thể loại được chọn
  const filteredPins = allPins.filter((pin) => {
    if (selectedCategory === "all") return true;
    const catObj = dynamicCategories.find((c) => c.id === selectedCategory);
    if (!catObj) return true;
    return (pin.the_loai || "").trim().toLowerCase() === catObj.name.toLowerCase();
  });

  return (
    <div className="w-full max-w-[1920px] mx-auto py-2">
      {/* Category Filter Pills Bar with Fixed "Tất cả" & Arrow Navigation */}
      <div className="mb-6 flex items-center gap-2 relative">
        {/* Nút 'Tất cả' luôn Cố định ở góc trái */}
        <div className="shrink-0 flex items-center gap-2 pr-1">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-colors duration-150 cursor-pointer select-none border ${
              selectedCategory === "all"
                ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900 border-transparent"
                : "bg-gray-100 hover:bg-gray-200/90 text-gray-700 dark:bg-[#1C2136] dark:hover:bg-[#252A42] dark:text-gray-300 border-transparent"
            }`}
          >
            <span>Tất cả</span>
            {allPins.length > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  selectedCategory === "all"
                    ? "bg-white/20 text-white dark:bg-black/20 dark:text-gray-900"
                    : "bg-gray-200 text-gray-600 dark:bg-[#2D2F40] dark:text-gray-400"
                }`}
              >
                {allPins.length}
              </span>
            )}
          </button>

          {/* Vạch phân cách */}
          <div className="h-6 w-px bg-gray-200 dark:bg-[#2D2F40] mx-0.5 shrink-0" />
        </div>

        {/* Khung chứa các nút thể loại còn lại có nút mũi tên điều hướng */}
        <div className="relative flex-1 min-w-0 flex items-center">
          {/* Nút mũi tên Trái */}
          {canScrollLeft && (
            <div className="absolute left-0 z-10 flex items-center pr-4 bg-gradient-to-r from-white via-white/95 to-transparent dark:from-[#0B0F19] dark:via-[#0B0F19]/95 dark:to-transparent h-full">
              <button
                type="button"
                onClick={() => handleScroll("left")}
                aria-label="Cuộn về trước"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-[#1C2136] shadow-md border border-gray-200 dark:border-[#2D2F40] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#252A42] transition cursor-pointer"
              >
                <ChevronLeft size={18} />
              </button>
            </div>
          )}

          {/* Dãy nút Thể loại có thể cuộn ngang mượt mà */}
          <div
            ref={scrollContainerRef}
            className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar scroll-smooth py-1 w-full"
          >
            {dynamicCategories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              const count = allPins.filter(
                (p) => (p.the_loai || "").trim().toLowerCase() === cat.name.toLowerCase()
              ).length;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-colors duration-150 cursor-pointer select-none border ${
                    isActive
                      ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900 border-transparent"
                      : "bg-gray-100 hover:bg-gray-200/90 text-gray-700 dark:bg-[#1C2136] dark:hover:bg-[#252A42] dark:text-gray-300 border-transparent"
                  }`}
                >
                  <span>{cat.name}</span>
                  {count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive
                          ? "bg-white/20 text-white dark:bg-black/20 dark:text-gray-900"
                          : "bg-gray-200 text-gray-600 dark:bg-[#2D2F40] dark:text-gray-400"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Nút mũi tên Phải */}
          {canScrollRight && (
            <div className="absolute right-0 z-10 flex items-center pl-4 bg-gradient-to-l from-white via-white/95 to-transparent dark:from-[#0B0F19] dark:via-[#0B0F19]/95 dark:to-transparent h-full">
              <button
                type="button"
                onClick={() => handleScroll("right")}
                aria-label="Cuộn tiếp"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-[#1C2136] shadow-md border border-gray-200 dark:border-[#2D2F40] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#252A42] hover:scale-105 active:scale-95 transition cursor-pointer"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      {search && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Kết quả tìm kiếm cho: <span className="text-[#0052cc] dark:text-blue-400">"{search}"</span>
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{filteredPins.length} ý tưởng được tìm thấy</p>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="h-10 w-10 animate-spin text-[#0052cc]" />
          <p className="mt-4 text-sm font-semibold text-gray-500">Đang tải những ý tưởng tuyệt vời...</p>
        </div>
      ) : filteredPins.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-[#1c2136] text-gray-400 dark:text-gray-400 mb-4 border border-transparent dark:border-[#2d2f40]">
            <SearchX size={36} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Không tìm thấy ý tưởng nào phù hợp
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md">
            Chưa có hình ảnh nào thuộc thể loại này. Hãy thử bấm chọn thể loại khác hoặc "Tất cả"!
          </p>
        </div>
      ) : (
        <MasonryGrid pins={filteredPins} />
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-10 w-10 animate-spin text-[#0052cc]" />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
