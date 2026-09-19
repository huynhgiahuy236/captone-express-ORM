"use client";

import React, { useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

function GoogleCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshUserInfo } = useAuth();
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    if (hasProcessedRef.current) return;
    hasProcessedRef.current = true;

    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");

    if (accessToken && refreshToken) {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      refreshUserInfo().then(() => {
        toast.success("Đăng nhập Google thành công!", { id: "google-login-success" });
        router.replace("/");
      });
    } else {
      toast.error("Đăng nhập Google không thành công, vui lòng thử lại!", { id: "google-login-error" });
      router.replace("/");
    }
  }, [searchParams, router, refreshUserInfo]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="h-10 w-10 animate-spin text-[#0052cc]" />
      <p className="mt-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Đang xử lý đăng nhập Google...</p>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-10 w-10 animate-spin text-[#0052cc]" />
        </div>
      }
    >
      <GoogleCallbackContent />
    </Suspense>
  );
}
