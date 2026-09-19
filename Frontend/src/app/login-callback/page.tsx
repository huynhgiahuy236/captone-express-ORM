"use client";

import React, { useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

function LoginCallbackContent() {
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
        const redirectUrl =
          (typeof window !== "undefined" ? sessionStorage.getItem("auth_redirect") : null) || "/";
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("auth_redirect");
        }
        router.replace(redirectUrl);
      });
    } else {
      toast.error("Đăng nhập Google không thành công, vui lòng thử lại!", { id: "google-login-error" });
      router.replace("/login");
    }
  }, [searchParams, router, refreshUserInfo]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-[#181C31]">
      <Loader2 className="h-12 w-12 animate-spin text-[#0052cc]" />
      <p className="mt-4 text-sm font-bold text-gray-700 dark:text-gray-200">
        Đang hoàn tất đăng nhập Google...
      </p>
    </div>
  );
}

export default function LoginCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-white dark:bg-[#181C31]">
          <Loader2 className="h-12 w-12 animate-spin text-[#0052cc]" />
        </div>
      }
    >
      <LoginCallbackContent />
    </Suspense>
  );
}
