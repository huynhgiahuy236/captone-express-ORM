"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import {
  Lock,
  Mail,
  User as UserIcon,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Sun,
  Moon,
} from "lucide-react";
import { HukiLogo } from "@/components/HukiLogo";
import { DateOfBirthSelect } from "@/components/DateOfBirthSelect";
import {
  validateFullName,
  validateEmail,
  validatePassword,
  validateDMY,
} from "@/lib/validation";

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";

  const { user, login, signup, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [dobDay, setDobDay] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobYear, setDobYear] = useState("");
  const [birthDateStr, setBirthDateStr] = useState("");
  const [errors, setErrors] = useState<{
    fullName?: string;
    birthDate?: string;
    email?: string;
    password?: string;
    general?: string;
  }>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync mode with query parameter if present
  useEffect(() => {
    const qMode = searchParams.get("mode");
    if (qMode === "signup" || qMode === "login") {
      setMode(qMode);
    }
  }, [searchParams]);

  // Get redirect target
  const getRedirectTarget = (): string => {
    const qRedirect = searchParams.get("redirect");
    if (qRedirect && !qRedirect.startsWith("/login")) {
      return qRedirect;
    }
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("auth_redirect");
      if (stored && !stored.startsWith("/login")) {
        return stored;
      }
    }
    return "/";
  };

  // If already logged in, redirect to home or previous page
  useEffect(() => {
    if (!isLoading && user) {
      const target = getRedirectTarget();
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("auth_redirect");
      }
      router.push(target);
    }
  }, [user, isLoading, router, searchParams]);

  // Real-time calculation of age from Day / Month / Year
  const dmyResult = validateDMY(dobDay, dobMonth, dobYear);
  const calculatedAge = dmyResult.isValid ? dmyResult.age : undefined;

  const handleDobChange = (d: string, m: string, y: string, formattedStr: string) => {
    setDobDay(d);
    setDobMonth(m);
    setDobYear(y);
    setBirthDateStr(formattedStr);
    if (errors.birthDate) {
      setErrors((prev) => ({ ...prev, birthDate: undefined }));
    }
  };

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(e.target.value);
    if (errors.fullName) {
      setErrors((prev) => ({ ...prev, fullName: undefined }));
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: undefined }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {
      fullName?: string;
      birthDate?: string;
      email?: string;
      password?: string;
    } = {};

    const emailErr = validateEmail(email);
    if (emailErr) newErrors.email = emailErr;

    if (mode === "signup") {
      const nameErr = validateFullName(fullName);
      if (nameErr) newErrors.fullName = nameErr;

      const dobCheck = validateDMY(dobDay, dobMonth, dobYear);
      if (!dobCheck.isValid) {
        newErrors.birthDate = dobCheck.error;
      }

      const passErr = validatePassword(password, true);
      if (passErr) newErrors.password = passErr;
    } else {
      const passErr = validatePassword(password, false);
      if (passErr) newErrors.password = passErr;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const target = getRedirectTarget();
      if (mode === "login") {
        const success = await login(email, password);
        if (success) {
          if (typeof window !== "undefined") {
            sessionStorage.removeItem("auth_redirect");
          }
          router.push(target);
        } else {
          setErrors({
            general: "Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!",
          });
        }
      } else {
        const success = await signup(email, password, fullName, calculatedAge);
        if (success) {
          if (typeof window !== "undefined") {
            sessionStorage.removeItem("auth_redirect");
          }
          router.push(target);
        } else {
          setErrors({
            general: "Đăng ký không thành công. Email này có thể đã được đăng ký trên hệ thống.",
          });
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    const target = getRedirectTarget();
    if (typeof window !== "undefined") {
      sessionStorage.setItem("auth_redirect", target);
    }
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3069";
    window.location.href = `${serverUrl}/api/auth/google`;
  };

  const switchMode = (newMode: "login" | "signup") => {
    setErrors({});
    setMode(newMode);
    const qRedirect = searchParams.get("redirect");
    const redirectQuery = qRedirect ? `&redirect=${encodeURIComponent(qRedirect)}` : "";
    router.replace(`/login?mode=${newMode}${redirectQuery}`);
  };

  return (
    <div
      className="min-h-screen w-full relative flex flex-col justify-between p-4 sm:p-6 lg:p-10 overflow-x-hidden bg-[#070B19] bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/login-bg-ocean.jpg')",
      }}
    >
      {/* Subtle ambient lighting overlay */}
      <div className="absolute inset-0 bg-black/15 dark:bg-black/35 pointer-events-none" />

      {/* Top Header Bar */}
      <div className="relative z-20 flex items-center justify-between w-full max-w-7xl mx-auto">
        <HukiLogo size="md" lightModeText={true} />

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dark / Light Mode Switcher */}
          <button
            onClick={toggleTheme}
            type="button"
            className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 text-white transition active:scale-95 cursor-pointer shadow-xs"
            title={mounted && theme === "dark" ? "Chuyển sang chế độ Sáng" : "Chuyển sang chế độ Tối"}
          >
            {mounted && theme === "dark" ? (
              <Sun size={18} className="text-yellow-300 animate-in spin-in-180 duration-200" />
            ) : (
              <Moon size={18} className="text-cyan-200 animate-in spin-in-180 duration-200" />
            )}
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 text-white text-xs font-bold transition duration-200 group shadow-xs cursor-pointer"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            <span>Trang chủ</span>
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-20 w-full max-w-7xl mx-auto my-auto py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

        {/* Left Headline Area */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-4 text-white pl-2 pr-6">
          <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black tracking-tight leading-tight text-white drop-shadow-md">
            Khám phá ý tưởng <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-300 to-sky-200">
              Nghệ thuật & Thiết kế
            </span>
          </h1>

          <p className="text-sm text-slate-200/90 leading-relaxed max-w-md">
            Nền tảng chia sẻ và lưu trữ những khoảnh khắc sáng tạo, kết nối cộng đồng đam mê nghệ thuật thị giác.
          </p>
        </div>

        {/* Right Form Card */}
        <div className="lg:col-span-6 flex justify-center lg:justify-end w-full">
          <div className="w-full max-w-md bg-white/95 dark:bg-[#181C31]/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/60 dark:border-[#2d2f40]/80 transition-all">

            {/* Header Title */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                {mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {mode === "login"
                  ? "Nhập thông tin để tiếp tục trải nghiệm HUKI."
                  : "Bắt đầu hành trình lưu giữ và chia sẻ ý tưởng của bạn."}
              </p>
            </div>

            {/* Error General Banner */}
            {errors.general && (
              <div className="mt-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 p-3 flex items-start gap-2.5 text-xs font-semibold text-rose-600 dark:text-rose-300 animate-in fade-in">
                <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-500" />
                <span>{errors.general}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-3">
              {mode === "signup" && (
                <>
                  {/* Full Name */}
                  <div>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Họ và tên của bạn"
                        value={fullName}
                        onChange={handleFullNameChange}
                        className={`w-full rounded-2xl bg-gray-50 dark:bg-[#252A42] text-gray-900 dark:text-white placeholder:text-gray-400 py-3 pl-11 pr-4 text-xs sm:text-sm font-medium outline-hidden border transition ${
                          errors.fullName
                            ? "border-rose-400 bg-rose-50/40 dark:bg-rose-950/20 ring-2 ring-rose-100 dark:ring-rose-900/30"
                            : "border-gray-200 dark:border-[#2d2f40] hover:border-gray-300 focus:bg-white dark:focus:bg-[#252A42] focus:border-[#0052cc] focus:ring-2 focus:ring-blue-500/20"
                        }`}
                      />
                    </div>
                    {errors.fullName && (
                      <div className="mt-1 ml-3 flex items-center gap-1.5 text-[11px] font-medium text-rose-500 dark:text-rose-400 animate-in fade-in">
                        <AlertCircle size={13} className="shrink-0 text-rose-500" />
                        <span>{errors.fullName}</span>
                      </div>
                    )}
                  </div>

                  {/* Date of Birth with 3 Dropdowns */}
                  <DateOfBirthSelect
                    day={dobDay}
                    month={dobMonth}
                    year={dobYear}
                    onChange={handleDobChange}
                    error={errors.birthDate}
                    required={true}
                  />
                </>
              )}

              {/* Email */}
              <div>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="Địa chỉ email (vd: name@gmail.com)"
                    value={email}
                    onChange={handleEmailChange}
                    className={`w-full rounded-full bg-gray-50 dark:bg-[#252A42] text-gray-900 dark:text-white placeholder:text-gray-400 py-3 pl-11 pr-4 text-xs sm:text-sm font-medium outline-hidden border transition ${
                      errors.email
                        ? "border-rose-400 bg-rose-50/40 dark:bg-rose-950/20 ring-2 ring-rose-100 dark:ring-rose-900/30"
                        : "border-gray-200 dark:border-[#2d2f40] hover:border-gray-300 focus:bg-white dark:focus:bg-[#252A42] focus:border-[#0052cc] focus:ring-2 focus:ring-blue-500/20"
                    }`}
                  />
                </div>
                {errors.email && (
                  <div className="mt-1 ml-3 flex items-center gap-1.5 text-[11px] font-medium text-rose-500 dark:text-rose-400 animate-in fade-in">
                    <AlertCircle size={13} className="shrink-0 text-rose-500" />
                    <span>{errors.email}</span>
                  </div>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
                  <input
                    type="password"
                    placeholder="Mật khẩu bảo mật"
                    value={password}
                    onChange={handlePasswordChange}
                    className={`w-full rounded-full bg-gray-50 dark:bg-[#252A42] text-gray-900 dark:text-white placeholder:text-gray-400 py-3 pl-11 pr-4 text-xs sm:text-sm font-medium outline-hidden border transition ${
                      errors.password
                        ? "border-rose-400 bg-rose-50/40 dark:bg-rose-950/20 ring-2 ring-rose-100 dark:ring-rose-900/30"
                        : "border-gray-200 dark:border-[#2d2f40] hover:border-gray-300 focus:bg-white dark:focus:bg-[#252A42] focus:border-[#0052cc] focus:ring-2 focus:ring-blue-500/20"
                    }`}
                  />
                </div>
                {errors.password && (
                  <div className="mt-1 ml-3 flex items-center gap-1.5 text-[11px] font-medium text-rose-500 dark:text-rose-400 animate-in fade-in">
                    <AlertCircle size={13} className="shrink-0 text-rose-500" />
                    <span>{errors.password}</span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 rounded-full bg-[#0052cc] hover:bg-[#0041a8] text-white py-3 text-sm font-bold shadow-md hover:shadow-lg active:scale-98 transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <span>{mode === "login" ? "Đăng nhập ngay" : "Tạo tài khoản HUKI"}</span>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-[#2d2f40]" />
              </div>
              <span className="relative bg-white dark:bg-[#181C31] px-3 text-[10px] font-bold text-gray-400 uppercase">
                Hoặc
              </span>
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="flex w-full items-center justify-center gap-2.5 rounded-full bg-white dark:bg-[#252A42] border border-gray-200 dark:border-[#2d2f40] hover:bg-gray-50 dark:hover:bg-[#2e3450] text-gray-700 dark:text-gray-200 py-2.5 text-xs sm:text-sm font-bold shadow-2xs hover:shadow-xs active:scale-98 transition cursor-pointer"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Tiếp tục với Google</span>
            </button>

            {/* Bottom Switch Link */}
            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => switchMode(mode === "login" ? "signup" : "login")}
                className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition cursor-pointer"
              >
                {mode === "login" ? (
                  <>
                    Chưa có tài khoản?{" "}
                    <span className="text-[#0052cc] dark:text-blue-400 font-bold hover:underline">
                      Đăng ký ngay
                    </span>
                  </>
                ) : (
                  <>
                    Đã có tài khoản?{" "}
                    <span className="text-[#0052cc] dark:text-blue-400 font-bold hover:underline">
                      Đăng nhập ngay
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Footer copyright */}
      <div className="relative z-20 w-full max-w-7xl mx-auto pt-4 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between text-xs text-slate-200/80">
        <span>© 2026 HUKI Inspire. Tất cả quyền được bảo lưu.</span>
        <span className="mt-1 sm:mt-0">Khám phá • Kết nối • Tỏa sáng</span>
      </div>

    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-[#0052cc]" />
        </div>
      }
    >
      <AuthPageContent />
    </Suspense>
  );
}
