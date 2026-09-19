"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { ImageItem } from "@/types";
import { MasonryGrid } from "@/components/MasonryGrid";
import { ArrowLeft, Loader2, ImageOff, Layers } from "lucide-react";

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const rawCategory = String(params.category || "");
  const categoryName = decodeURIComponent(rawCategory);

  const [pins, setPins] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCategoryPins = async () => {
    if (!categoryName) return;
    setLoading(true);
    try {
      const res = await api.get("/images?pageSize=50");
      const allItems: ImageItem[] = res.data?.data?.items || res.data?.data || [];
      
      const targetLower = categoryName.trim().toLowerCase();
      const filtered = allItems.filter(
        (p) => (p.the_loai || "").trim().toLowerCase() === targetLower
      );

      setPins(filtered);
    } catch (err) {
      console.error("Failed to load category pins", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategoryPins();
  }, [categoryName]);

  return (
    <div className="max-w-[1920px] 2xl:max-w-[2100px] w-full mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8">
      {/* Category Header Banner */}
      <div className="mb-8 pb-6 border-b border-gray-100 dark:border-[#2d2f40]">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-4 transition cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Quay lại</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-[#252A42] text-[#0052cc] dark:text-blue-400 shrink-0">
                <Layers size={22} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                  {categoryName || "Thể loại"}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Tất cả các ý tưởng và tác phẩm thuộc chủ đề {categoryName}
                </p>
              </div>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-[#252A42] text-xs font-bold text-gray-700 dark:text-gray-200 self-start sm:self-center">
            <span>Tổng cộng:</span>
            <span className="text-[#0052cc] dark:text-blue-400 font-extrabold">{pins.length} tác phẩm</span>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="h-10 w-10 animate-spin text-[#0052cc]" />
          <p className="mt-4 text-xs font-semibold text-gray-500 dark:text-gray-400">
            Đang tải tác phẩm chủ đề {categoryName}...
          </p>
        </div>
      ) : pins.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl bg-gray-50/60 dark:bg-[#1c2136]/50 border border-dashed border-gray-200 dark:border-[#2d2f40]">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 dark:bg-[#252A42] text-[#0052cc] dark:text-blue-400 mb-3.5">
            <ImageOff size={28} />
          </div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
            Chưa có hình ảnh nào thuộc thể loại "{categoryName}"
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
            Hãy là người đầu tiên tạo và chia sẻ tác phẩm thuộc chủ đề này!
          </p>
          <Link
            href="/create"
            className="mt-5 rounded-full bg-[#0052cc] hover:bg-[#0041a8] px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs transition active:scale-95 cursor-pointer"
          >
            Tạo Ghim ngay
          </Link>
        </div>
      ) : (
        <MasonryGrid pins={pins} onSaveToggle={loadCategoryPins} />
      )}
    </div>
  );
}
