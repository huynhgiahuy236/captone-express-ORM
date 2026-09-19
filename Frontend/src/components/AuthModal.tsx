"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { X, Lock, Mail, User as UserIcon, Calendar, AlertCircle } from "lucide-react";
import { HukiLogo } from "@/components/HukiLogo";
import { DateOfBirthSelect } from "@/components/DateOfBirthSelect";
import {
  validateFullName,
  validateEmail,
  validatePassword,
  validateDMY,
} from "@/lib/validation";

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, authModalMode, closeAuthModal, openAuthModal, login, signup } = useAuth();

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

  // Real-time calculation of age from Day, Month, Year
  const dmyResult = validateDMY(dobDay, dobMonth, dobYear);
  const calculatedAge = dmyResult.isValid ? dmyResult.age : undefined;

  if (!isAuthModalOpen) return null;

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

    if (authModalMode === "signup") {
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
      if (authModalMode === "login") {
        const success = await login(email, password);
        if (!success) {
          setErrors({
            general: "Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!",
          });
        }
      } else {
        const success = await signup(email, password, fullName, calculatedAge);
        if (!success) {
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
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3069";
    window.location.href = `${serverUrl}/api/auth/google`;
  };

  const handleSwitchTab = (mode: "login" | "signup") => {
    setErrors({});
    openAuthModal(mode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-md my-auto max-h-[96vh] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden rounded-3xl bg-white dark:bg-[#1c2136] border border-gray-100 dark:border-[#2d2f40] p-5 sm:p-7 shadow-2xl transition-all">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-[#252A42] hover:text-gray-700 dark:hover:text-white transition cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Logo & Header */}
        <div className="text-center pt-2 pb-4">
          <div className="flex justify-center mb-2">
            <HukiLogo size="md" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-white">
            {authModalMode === "login" ? "Chào mừng trở lại!" : "Tạo tài khoản HUKI"}
          </h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {authModalMode === "login"
              ? "Khám phá hàng triệu ý tưởng sáng tạo tuyệt vời"
              : "Bắt đầu lưu trữ và chia sẻ những tác phẩm của bạn"}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-full bg-gray-100 dark:bg-[#252A42] p-1 mb-5">
          <button
            type="button"
            onClick={() => handleSwitchTab("login")}
            className={`flex-1 rounded-full py-1.5 text-xs font-bold transition cursor-pointer ${
              authModalMode === "login"
                ? "bg-white dark:bg-[#1c2136] text-[#0052cc] dark:text-blue-400 shadow-xs"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => handleSwitchTab("signup")}
            className={`flex-1 rounded-full py-1.5 text-xs font-bold transition cursor-pointer ${
              authModalMode === "signup"
                ? "bg-white dark:bg-[#1c2136] text-[#0052cc] dark:text-blue-400 shadow-xs"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Đăng ký
          </button>
        </div>

        {/* General Error Banner */}
        {errors.general && (
          <div className="mb-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-3 flex items-start gap-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 animate-in fade-in">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span>{errors.general}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
          {authModalMode === "signup" && (
            <>
              {/* Full Name */}
              <div>
                <label className="block text-[11px] sm:text-xs font-semibold text-gray-700 dark:text-gray-300 mb-0.5 sm:mb-1">
                  Họ và tên <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-2.5 sm:top-3 h-4 w-4 text-gray-400 dark:text-gray-400" />
                  <input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={fullName}
                    onChange={handleFullNameChange}
                    className={`w-full rounded-2xl border ${
                      errors.fullName
                        ? "border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                        : "border-gray-200 dark:border-[#2d2f40] focus:border-[#0052cc] focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-900/40"
                    } bg-white dark:bg-[#181C31] py-2 sm:py-2.5 pl-10 pr-4 text-xs sm:text-sm text-gray-900 dark:text-white outline-hidden transition`}
                  />
                </div>
                {errors.fullName && (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 font-medium animate-in fade-in duration-150">
                    <AlertCircle size={12} className="shrink-0" />
                    <span>{errors.fullName}</span>
                  </p>
                )}
              </div>

              {/* Date of Birth with 3 Dropdowns (Day, Month, Year) */}
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
            <label className="block text-[11px] sm:text-xs font-semibold text-gray-700 dark:text-gray-300 mb-0.5 sm:mb-1">
              Email <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-2.5 sm:top-3 h-4 w-4 text-gray-400 dark:text-gray-400" />
              <input
                type="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={handleEmailChange}
                className={`w-full rounded-2xl border ${
                  errors.email
                    ? "border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    : "border-gray-200 dark:border-[#2d2f40] focus:border-[#0052cc] focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-900/40"
                } bg-white dark:bg-[#181C31] py-2 sm:py-2.5 pl-10 pr-4 text-xs sm:text-sm text-gray-900 dark:text-white outline-hidden transition`}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 font-medium animate-in fade-in duration-150">
                <AlertCircle size={12} className="shrink-0" />
                <span>{errors.email}</span>
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-[11px] sm:text-xs font-semibold text-gray-700 dark:text-gray-300 mb-0.5 sm:mb-1">
              Mật khẩu <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-2.5 sm:top-3 h-4 w-4 text-gray-400 dark:text-gray-400" />
              <input
                type="password"
                placeholder="•••••••• (tối thiểu 8 ký tự)"
                value={password}
                onChange={handlePasswordChange}
                className={`w-full rounded-2xl border ${
                  errors.password
                    ? "border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    : "border-gray-200 dark:border-[#2d2f40] focus:border-[#0052cc] focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-900/40"
                } bg-white dark:bg-[#181C31] py-2 sm:py-2.5 pl-10 pr-4 text-xs sm:text-sm text-gray-900 dark:text-white outline-hidden transition`}
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 font-medium animate-in fade-in duration-150">
                <AlertCircle size={12} className="shrink-0" />
                <span>{errors.password}</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-1.5 sm:mt-2 rounded-full bg-[#0052cc] hover:bg-[#0041a8] py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-xs active:scale-98 transition disabled:opacity-50 cursor-pointer"
          >
            {submitting ? "Đang xử lý..." : authModalMode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-3 sm:my-4 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-[#2d2f40]" />
          </div>
          <span className="relative bg-white dark:bg-[#1c2136] px-3 text-[11px] sm:text-xs font-medium text-gray-400 dark:text-gray-400 uppercase">Hoặc</span>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="flex w-full items-center justify-center gap-2.5 rounded-full border border-gray-200 dark:border-[#2d2f40] bg-white dark:bg-[#252A42] py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#2e3450] active:scale-98 transition cursor-pointer"
        >
          <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
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
          Tiếp tục với Google
        </button>

        {/* Hint footer */}
        <p className="mt-3 sm:mt-4 text-center text-[10px] sm:text-xs text-gray-400 dark:text-gray-400">
          Tài khoản mẫu: <span className="font-semibold text-gray-600 dark:text-gray-300">sangnguyen@gmail.com</span> /{" "}
          <span className="font-semibold text-gray-600 dark:text-gray-300">123456</span>
        </p>
      </div>
    </div>
  );
};
