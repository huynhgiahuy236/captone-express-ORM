"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { ImageItem } from "@/types";
import { MasonryGrid } from "@/components/MasonryGrid";
import { Loader2, SearchX } from "lucide-react";

function HomeContent() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";

  const [pins, setPins] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPins = async () => {
    setLoading(true);
    try {
      let endpoint = "/images?pageSize=50";
      if (search.trim()) {
        endpoint = `/images/search?name=${encodeURIComponent(search.trim())}`;
      }
      const res = await api.get(endpoint);
      const items = res.data?.data?.items || res.data?.data || [];
      setPins(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("Failed to load pins", err);
      setPins([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPins();
  }, [search]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-[#0052cc]" />
        <p className="mt-4 text-sm font-semibold text-gray-500">Đang tải những ý tưởng tuyệt vời...</p>
      </div>
    );
  }

  if (pins.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-[#1c2136] text-gray-400 dark:text-gray-400 mb-4 border border-transparent dark:border-[#2d2f40]">
          <SearchX size={36} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          {search ? `Không tìm thấy kết quả cho "${search}"` : "Chưa có ảnh nào được đăng tải"}
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md">
          {search
            ? "Thử tìm kiếm với các từ khóa khác như: anime, nature, wallpaper, art..."
            : "Hãy là người đầu tiên đăng tải tác phẩm và chia sẻ ý tưởng của bạn!"}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1920px] mx-auto py-2">
      {search && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Kết quả tìm kiếm cho: <span className="text-[#0052cc] dark:text-blue-400">"{search}"</span>
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{pins.length} ý tưởng được tìm thấy</p>
        </div>
      )}
      <MasonryGrid pins={pins} />
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
