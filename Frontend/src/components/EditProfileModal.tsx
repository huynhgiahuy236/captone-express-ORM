"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { X, Camera, User, Calendar, AlertCircle } from "lucide-react";
import { DateOfBirthSelect } from "@/components/DateOfBirthSelect";
import {
  validateFullName,
  validateDMY,
} from "@/lib/validation";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user, updateUser, refreshUserInfo } = useAuth();

  const [fullName, setFullName] = useState(user?.ho_ten || "");
  const [dobDay, setDobDay] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobYear, setDobYear] = useState("");
  const [birthDateStr, setBirthDateStr] = useState("");
  const [bio, setBio] = useState(user?.mo_ta || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(user?.anh_dai_dien || "");
  const [errors, setErrors] = useState<{
    fullName?: string;
    birthDate?: string;
    avatar?: string;
    general?: string;
  }>({});
  const [submitting, setSubmitting] = useState(false);

  // Real-time calculation of age from Day / Month / Year
  const dmyResult = validateDMY(dobDay, dobMonth, dobYear);
  const calculatedAge = dmyResult.isValid ? dmyResult.age : user?.tuoi;

  if (!isOpen || !user) return null;

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file format & size
      const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!validTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          avatar: "Chỉ chấp nhận file ảnh định dạng JPG, PNG, WEBP hoặc GIF",
        }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          avatar: "Dung lượng ảnh đại diện không được vượt quá 5MB",
        }));
        return;
      }

      setErrors((prev) => ({ ...prev, avatar: undefined }));
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {
      fullName?: string;
      birthDate?: string;
    } = {};

    const nameErr = validateFullName(fullName);
    if (nameErr) newErrors.fullName = nameErr;

    if (dobDay || dobMonth || dobYear) {
      const dobCheck = validateDMY(dobDay, dobMonth, dobYear);
      if (!dobCheck.isValid) newErrors.birthDate = dobCheck.error;
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
      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("bio", bio.trim());
      if (calculatedAge !== undefined) formData.append("age", String(calculatedAge));
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const res = await api.put("/users/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.data) {
        updateUser(res.data.data);
        await refreshUserInfo();
        toast.success("Cập nhật thông tin thành công!");
        onSuccess?.();
        onClose();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Không thể cập nhật hồ sơ, vui lòng thử lại";
      setErrors({ general: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg my-auto max-h-[96vh] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden rounded-3xl bg-white dark:bg-[#1c2136] border border-gray-100 dark:border-[#2d2f40] p-5 sm:p-7 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-3.5 top-3.5 rounded-full p-2 text-gray-400 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#252A42] hover:text-gray-700 dark:hover:text-white transition cursor-pointer"
        >
          <X size={18} />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Chỉnh sửa hồ sơ</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Cập nhật thông tin cá nhân và ảnh đại diện</p>

        {errors.general && (
          <div className="mb-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-3.5 flex items-start gap-2.5 text-xs font-medium text-rose-600 dark:text-rose-400 animate-in fade-in">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{errors.general}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* Avatar upload section */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-gray-100 dark:border-[#2d2f40] bg-gray-100 dark:bg-[#181C31] shadow-md">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview Avatar" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-blue-50 dark:bg-[#252A42] text-3xl font-bold text-[#0052cc] dark:text-blue-400">
                    {(fullName || user.email)[0]?.toUpperCase()}
                  </div>
                )}
              </div>

              <label
                htmlFor="avatar-upload"
                className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 cursor-pointer transition"
              >
                <Camera size={24} />
                <span className="text-[11px] font-semibold mt-1">Đổi ảnh</span>
              </label>

              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            <label
              htmlFor="avatar-upload"
              className="mt-3 cursor-pointer rounded-full bg-gray-100 dark:bg-[#252A42] px-4 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-[#2e3450] transition"
            >
              Chọn ảnh mới
            </label>
            {errors.avatar && (
              <p className="mt-2 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5 font-medium animate-in fade-in duration-150">
                <AlertCircle size={13} className="shrink-0" />
                <span>{errors.avatar}</span>
              </p>
            )}
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Họ và tên <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 h-4 w-4 text-gray-400 dark:text-gray-400" />
              <input
                type="text"
                value={fullName}
                onChange={handleFullNameChange}
                className={`w-full rounded-2xl border ${
                  errors.fullName
                    ? "border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    : "border-gray-200 dark:border-[#2d2f40] focus:border-[#0052cc] focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-900/40"
                } bg-white dark:bg-[#181C31] py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-white outline-hidden transition`}
              />
            </div>
            {errors.fullName && (
              <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5 font-medium animate-in fade-in duration-150">
                <AlertCircle size={13} className="shrink-0" />
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
            label="Ngày sinh (Cập nhật để tính tuổi)"
            required={false}
          />

          {/* Status / Bio */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Trạng thái & Tiểu sử (Status / Bio)
            </label>
            <textarea
              rows={3}
              placeholder="Chia sẻ vài dòng về bạn, sở thích hoặc phong cách sáng tạo..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 dark:border-[#2d2f40] bg-white dark:bg-[#181C31] p-3 text-sm text-gray-900 dark:text-white outline-hidden transition placeholder:text-gray-400 focus:border-[#0052cc] focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-900/40 resize-none"
            />
          </div>

          {/* Submit and Cancel Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-[#2d2f40]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-gray-100 dark:bg-[#252A42] px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-[#2e3450] transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-[#0052cc] hover:bg-[#0041a8] px-6 py-2.5 text-sm font-bold text-white shadow-xs active:scale-98 transition disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
