"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import toast from "react-hot-toast";
import {
  X,
  Camera,
  User as UserIcon,
  Calendar,
  AlertCircle,
  Shield,
  Globe,
  Users,
  UserCheck,
  Lock,
  Layers,
  Bookmark,
  Heart,
  MessageCircle,
  FolderHeart,
} from "lucide-react";
import { DateOfBirthSelect } from "@/components/DateOfBirthSelect";
import { validateFullName, validateDMY } from "@/lib/validation";
import { PrivacySettings } from "@/types";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialTab?: "info" | "privacy";
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialTab = "info",
}) => {
  const { user, updateUser, refreshUserInfo } = useAuth();

  const [modalTab, setModalTab] = useState<"info" | "privacy">(initialTab);
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

  // Privacy Settings state
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    created: "PUBLIC",
    saved: "PUBLIC",
    liked_pins: "PUBLIC",
    liked_comments: "PUBLIC",
    followers: "PUBLIC",
    following: "PUBLIC",
  });

  useEffect(() => {
    if (isOpen) {
      setModalTab(initialTab);
    }
    if (user) {
      setFullName(user.ho_ten || "");
      setBio(user.mo_ta || "");
      setPreviewUrl(user.anh_dai_dien || "");
      if (user.privacySettings) {
        setPrivacy({
          created: user.privacySettings.created || "PUBLIC",
          saved: user.privacySettings.saved || "PUBLIC",
          liked_pins: user.privacySettings.liked_pins || "PUBLIC",
          liked_comments: user.privacySettings.liked_comments || "PUBLIC",
          followers: user.privacySettings.followers || "PUBLIC",
          following: user.privacySettings.following || "PUBLIC",
        });
      } else if (user.quyen_rieng_tu) {
        try {
          const parsed = JSON.parse(user.quyen_rieng_tu);
          setPrivacy((prev) => ({ ...prev, ...parsed }));
        } catch (e) {}
      }
    }
  }, [user, isOpen, initialTab]);

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
    setSubmitting(true);

    try {
      if (modalTab === "privacy") {
        // Lưu riêng quyền riêng tư khi đang ở tab Privacy
        const privacyRes = await api.put("/users/privacy", privacy);
        const updatedPrivacy = privacyRes.data?.data || privacy;
        updateUser({
          ...user,
          privacySettings: updatedPrivacy,
        });
        await refreshUserInfo();
        toast.success("Cập nhật quyền riêng tư thành công!");
        onSuccess?.();
        onClose();
        return;
      }

      // Tab Thông tin cá nhân: Validate thông tin
      if (!validateForm()) {
        setModalTab("info");
        setSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("bio", bio.trim());
      if (calculatedAge !== undefined && calculatedAge !== null && !isNaN(Number(calculatedAge))) {
        formData.append("age", String(calculatedAge));
      }
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const [profileRes, privacyRes] = await Promise.all([
        api.put("/users/profile", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        }),
        api.put("/users/privacy", privacy),
      ]);

      if (profileRes.data?.data) {
        updateUser({
          ...profileRes.data.data,
          privacySettings: privacyRes.data?.data || privacy,
        });
        await refreshUserInfo();
        toast.success("Cập nhật hồ sơ & quyền riêng tư thành công!");
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

  const privacyOptions: {
    key: "created" | "saved" | "liked_pins" | "liked_comments" | "followers" | "following";
    label: string;
    description: string;
    icon: React.ReactNode;
  }[] = [
    {
      key: "created",
      label: "Tác phẩm đã tạo",
      description: "Ai có thể xem những Ghim ảnh bạn đã tải lên trang cá nhân",
      icon: <Layers size={18} className="text-[#0052cc] dark:text-blue-400" />,
    },
    {
      key: "saved",
      label: "Folder / Thư mục & Ghim đã lưu",
      description: "Ai có thể xem danh sách Folder / Thư mục bộ sưu tập và các Ghim bạn đã lưu lại",
      icon: <FolderHeart size={18} className="text-amber-500" />,
    },
    {
      key: "liked_pins",
      label: "Ảnh đã thích (Tym ảnh)",
      description: "Ai có thể xem danh sách các ảnh mà bạn đã thả tim",
      icon: <Heart size={18} className="text-rose-500 fill-rose-500/20" />,
    },
    {
      key: "liked_comments",
      label: "Bình luận đã thích (Tym bình luận)",
      description: "Ai có thể xem danh sách các bình luận bạn đã thả tim",
      icon: <MessageCircle size={18} className="text-purple-500" />,
    },
    {
      key: "followers",
      label: "Danh sách Người theo dõi (Followers)",
      description: "Ai có thể xem danh sách những người đang theo dõi bạn",
      icon: <Users size={18} className="text-cyan-500" />,
    },
    {
      key: "following",
      label: "Danh sách Đang theo dõi (Following)",
      description: "Ai có thể xem danh sách những người bạn đang theo dõi",
      icon: <UserCheck size={18} className="text-emerald-500" />,
    },
  ];

  const levels: {
    value: "PUBLIC" | "FOLLOWERS" | "PRIVATE";
    label: string;
    icon: React.ReactNode;
  }[] = [
    { value: "PUBLIC", label: "Mọi người", icon: <Globe size={13} /> },
    { value: "FOLLOWERS", label: "Người theo dõi", icon: <Users size={13} /> },
    { value: "PRIVATE", label: "Chỉ mình tôi", icon: <Lock size={13} /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl my-auto max-h-[96vh] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden rounded-3xl bg-white dark:bg-[#1c2136] border border-gray-100 dark:border-[#2d2f40] p-5 sm:p-7 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-3.5 top-3.5 rounded-full p-2 text-gray-400 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#252A42] hover:text-gray-700 dark:hover:text-white transition cursor-pointer"
        >
          <X size={18} />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Cài đặt trang cá nhân</h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-5">
          Quản lý thông tin cá nhân và cài đặt quyền riêng tư cho các mục trong hồ sơ
        </p>

        {/* Modal Tabs Header */}
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-gray-100 dark:bg-[#252A42] mb-6">
          <button
            type="button"
            onClick={() => setModalTab("info")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              modalTab === "info"
                ? "bg-white dark:bg-[#1c2136] text-[#0052cc] dark:text-blue-400 shadow-xs"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <UserIcon size={15} />
            <span>Thông tin cá nhân</span>
          </button>
          <button
            type="button"
            onClick={() => setModalTab("privacy")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              modalTab === "privacy"
                ? "bg-white dark:bg-[#1c2136] text-[#0052cc] dark:text-blue-400 shadow-xs"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Shield size={15} />
            <span>Quyền riêng tư</span>
          </button>
        </div>

        {errors.general && (
          <div className="mb-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-3.5 flex items-start gap-2.5 text-xs font-medium text-rose-600 dark:text-rose-400 animate-in fade-in">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{errors.general}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* ================= TAB 1: INFO ================= */}
          {modalTab === "info" && (
            <div className="space-y-5 animate-in fade-in">
              {/* Avatar upload section */}
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="h-24 w-24 sm:h-28 sm:w-28 overflow-hidden rounded-full border-4 border-gray-100 dark:border-[#2d2f40] bg-gray-100 dark:bg-[#181C31] shadow-md">
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
                  <UserIcon className="absolute left-3.5 top-3 h-4 w-4 text-gray-400 dark:text-gray-400" />
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
            </div>
          )}

          {/* ================= TAB 2: PRIVACY ================= */}
          {modalTab === "privacy" && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-300 leading-relaxed">
                💡 Bạn có thể quyết định ai có thể thấy từng tab nội dung trong trang cá nhân của mình: <b>Tất cả mọi người</b>, <b>Chỉ người theo dõi</b> hoặc <b>Chỉ mình tôi</b>.
              </div>

              <div className="space-y-3.5">
                {privacyOptions.map((item) => (
                  <div
                    key={item.key}
                    className="p-4 rounded-2xl bg-gray-50/80 dark:bg-[#181C31] border border-gray-100 dark:border-[#2d2f40] space-y-2.5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-white dark:bg-[#252A42] border border-gray-100 dark:border-[#2d2f40] shrink-0 mt-0.5">
                        {item.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                          {item.label}
                        </h4>
                        <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Level Selector Buttons */}
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      {levels.map((lvl) => {
                        const isSelected = privacy[item.key] === lvl.value;
                        return (
                          <button
                            key={lvl.value}
                            type="button"
                            onClick={() =>
                              setPrivacy((prev) => ({
                                ...prev,
                                [item.key]: lvl.value,
                              }))
                            }
                            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-[11px] sm:text-xs font-bold transition cursor-pointer border ${
                              isSelected
                                ? "bg-[#0052cc] text-white border-[#0052cc] shadow-xs"
                                : "bg-white dark:bg-[#252A42] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-[#2d2f40] hover:border-[#0052cc]/40"
                            }`}
                          >
                            {lvl.icon}
                            <span className="truncate">{lvl.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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

