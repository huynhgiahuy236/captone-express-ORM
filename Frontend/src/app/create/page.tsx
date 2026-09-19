"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { UploadCloud, Image as ImageIcon, Link as LinkIcon, Loader2, AlertCircle } from "lucide-react";
import { validatePinTitle, validatePinDescription, validateImageUrl } from "@/lib/validation";

export default function CreatePinPage() {
  const { user, openAuthModal, isLoading } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [imageUrl, setImageUrl] = useState("");
  const [useUrlMode, setUseUrlMode] = useState(false);
  const [errors, setErrors] = useState<{
    image?: string;
    title?: string;
    description?: string;
    general?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("auth_redirect", "/create");
      }
      router.push("/login?mode=login&redirect=/create");
    }
  }, [user, isLoading, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 20 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: "Dung lượng file ảnh vượt quá 20MB. Vui lòng chọn ảnh nhẹ hơn.",
        }));
        return;
      }
      setErrors((prev) => ({ ...prev, image: undefined }));
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type.startsWith("image/")) {
      if (droppedFile.size > 20 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: "Dung lượng file ảnh vượt quá 20MB. Vui lòng chọn ảnh nhẹ hơn.",
        }));
        return;
      }
      setErrors((prev) => ({ ...prev, image: undefined }));
      setFile(droppedFile);
      setPreviewUrl(URL.createObjectURL(droppedFile));
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (errors.title) {
      setErrors((prev) => ({ ...prev, title: undefined }));
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    if (errors.description) {
      setErrors((prev) => ({ ...prev, description: undefined }));
    }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    setPreviewUrl(url);
    if (errors.image) {
      setErrors((prev) => ({ ...prev, image: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {
      image?: string;
      title?: string;
      description?: string;
    } = {};

    const titleErr = validatePinTitle(title);
    if (titleErr) newErrors.title = titleErr;

    const descErr = validatePinDescription(description);
    if (descErr) newErrors.description = descErr;

    if (!useUrlMode) {
      if (!file) {
        newErrors.image = "Vui lòng tải lên một hình ảnh";
      }
    } else {
      const urlErr = validateImageUrl(imageUrl);
      if (urlErr) newErrors.image = urlErr;
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

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      if (description.trim()) {
        formData.append("description", description.trim());
      }

      if (file) {
        formData.append("file", file);
      } else if (imageUrl.trim()) {
        formData.append("imageUrl", imageUrl.trim());
      }

      const res = await api.post("/images", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Tạo Ghim thành công!");
      const newPin = res.data?.data;
      if (newPin?.hinh_id) {
        router.push(`/pin/${newPin.hinh_id}`);
      } else {
        router.push("/");
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Không thể tạo Ghim mới, vui lòng thử lại";
      setErrors({ general: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-[#0052cc]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Tạo Ghim Mới</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Chia sẻ hình ảnh và nguồn cảm hứng của bạn đến cộng đồng</p>
        </div>

        <button
          type="button"
          onClick={() => {
            setUseUrlMode(!useUrlMode);
            setErrors((prev) => ({ ...prev, image: undefined }));
          }}
          className="flex items-center gap-1.5 rounded-full bg-gray-100 dark:bg-[#1c2136] dark:ring-1 dark:ring-[#2d2f40] px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-[#252A42] transition cursor-pointer"
        >
          {useUrlMode ? <ImageIcon size={14} /> : <LinkIcon size={14} />}
          <span>{useUrlMode ? "Tải lên bằng File" : "Dán link ảnh trực tiếp"}</span>
        </button>
      </div>

      {errors.general && (
        <div className="mb-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-4 flex items-start gap-3 text-sm font-medium text-rose-600 dark:text-rose-400 animate-in fade-in">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span>{errors.general}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-3xl bg-white dark:bg-[#1c2136] border border-transparent dark:border-[#2d2f40] p-6 md:p-10 shadow-xl ring-1 ring-black/5 dark:ring-[#2d2f40] grid grid-cols-1 md:grid-cols-12 gap-8"
      >
        {/* Left Column: Image Upload Area */}
        <div className="md:col-span-5 flex flex-col items-center justify-center">
          {!useUrlMode ? (
            <div className="w-full">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className={`relative flex min-h-[380px] w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed ${
                  errors.image
                    ? "border-rose-500 bg-rose-50/20"
                    : "border-gray-300 dark:border-[#2d2f40] hover:border-[#0052cc] hover:bg-blue-50/20"
                } bg-gray-50 dark:bg-[#181C31] p-6 text-center transition overflow-hidden ${
                  previewUrl ? "border-solid border-transparent p-0" : ""
                }`}
              >
                {previewUrl ? (
                  <div className="relative h-full w-full group min-h-[380px]">
                    <img src={previewUrl} alt="Preview" className="h-full w-full object-cover rounded-3xl" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                      <label
                        htmlFor="pin-file"
                        className="cursor-pointer rounded-full bg-white dark:bg-[#1c2136] px-4 py-2 text-xs font-bold text-gray-800 dark:text-white shadow-md hover:bg-gray-100 dark:hover:bg-[#252A42] transition"
                      >
                        Đổi ảnh khác
                      </label>
                    </div>
                  </div>
                ) : (
                  <label htmlFor="pin-file" className="flex flex-col items-center cursor-pointer">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 dark:bg-[#252A42] text-[#0052cc] dark:text-blue-400 mb-4">
                      <UploadCloud size={28} />
                    </div>
                    <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">Kéo thả hoặc nhấn để tải ảnh lên</p>
                    <p className="mt-2 text-xs text-gray-400 dark:text-gray-400 max-w-[200px]">
                      Khuyến nghị file JPG, PNG, WEBP chất lượng cao dưới 20MB
                    </p>
                  </label>
                )}

                <input
                  id="pin-file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              {errors.image && (
                <p className="mt-2 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5 font-medium animate-in fade-in">
                  <AlertCircle size={13} className="shrink-0" />
                  <span>{errors.image}</span>
                </p>
              )}
            </div>
          ) : (
            <div className="w-full space-y-3">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                Đường dẫn ảnh trực tuyến <span className="text-rose-500">*</span>
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={handleImageUrlChange}
                className={`w-full rounded-2xl border ${
                  errors.image
                    ? "border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    : "border-gray-200 dark:border-[#2d2f40] focus:border-[#0052cc] focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-900/40"
                } bg-white dark:bg-[#181C31] p-3 text-sm text-gray-900 dark:text-white outline-hidden transition`}
              />
              {errors.image && (
                <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5 font-medium animate-in fade-in">
                  <AlertCircle size={13} className="shrink-0" />
                  <span>{errors.image}</span>
                </p>
              )}
              {previewUrl && (
                <div className="h-64 w-full overflow-hidden rounded-2xl border border-gray-200 dark:border-[#2d2f40]">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    onError={() => {
                      setErrors((prev) => ({
                        ...prev,
                        image: "Không thể tải ảnh từ đường dẫn này, vui lòng kiểm tra lại link",
                      }));
                    }}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Title & Description */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-gray-900 dark:text-white">
                  Tiêu đề Ghim <span className="text-rose-500">*</span>
                </label>
                <span className={`text-xs ${title.length > 0 && title.length < 10 ? "text-amber-500 font-semibold" : title.length > 150 ? "text-rose-500 font-bold" : "text-gray-400"}`}>
                  {title.length}/150 {title.length > 0 && title.length < 10 && "(tối thiểu 10 ký tự)"}
                </span>
              </div>
              <input
                type="text"
                placeholder="Thêm tiêu đề cho Ghim của bạn (tối thiểu 10 ký tự)..."
                value={title}
                onChange={handleTitleChange}
                className={`w-full rounded-2xl border ${
                  errors.title
                    ? "border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    : "border-gray-200 dark:border-[#2d2f40] focus:border-[#0052cc] focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-900/40"
                } bg-white dark:bg-[#181C31] px-4 py-3.5 text-base font-semibold text-gray-900 dark:text-white outline-hidden transition placeholder:text-gray-400 placeholder:font-normal`}
              />
              {errors.title && (
                <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5 font-medium animate-in fade-in">
                  <AlertCircle size={13} className="shrink-0" />
                  <span>{errors.title}</span>
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-gray-900 dark:text-white">
                  Mô tả chi tiết <span className="text-rose-500">*</span>
                </label>
                <span className={`text-xs ${description.length < 10 ? "text-amber-500 font-semibold" : description.length > 500 ? "text-rose-500 font-bold" : "text-gray-400"}`}>
                  {description.length}/500 {description.length < 10 && "(tối thiểu 10 ký tự)"}
                </span>
              </div>
              <textarea
                rows={5}
                placeholder="Mô tả nội dung, bối cảnh, cảm xúc hoặc phong cách nghệ thuật của tác phẩm (tối thiểu 10 ký tự)..."
                value={description}
                onChange={handleDescriptionChange}
                className={`w-full rounded-2xl border ${
                  errors.description
                    ? "border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    : "border-gray-200 dark:border-[#2d2f40] focus:border-[#0052cc] focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-900/40"
                } bg-white dark:bg-[#181C31] px-4 py-3 text-sm text-gray-900 dark:text-white outline-hidden transition placeholder:text-gray-400`}
              />
              {errors.description && (
                <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5 font-medium animate-in fade-in">
                  <AlertCircle size={13} className="shrink-0" />
                  <span>{errors.description}</span>
                </p>
              )}
            </div>

            {user && (
              <div className="flex items-center gap-3 rounded-2xl bg-gray-50 dark:bg-[#181C31] border border-transparent dark:border-[#2d2f40] p-4">
                <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-200 dark:bg-[#252A42] border border-gray-200 dark:border-[#2d2f40]">
                  {user.anh_dai_dien ? (
                    <img src={user.anh_dai_dien} alt="Author" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-blue-50 dark:bg-[#252A42] text-sm font-bold text-[#0052cc] dark:text-blue-400">
                      {(user.ho_ten || user.email)[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">Đăng với tư cách: {user.ho_ten || user.email}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">Tác phẩm sẽ hiển thị công khai trên trang chủ</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-[#2d2f40]">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="rounded-full bg-gray-100 dark:bg-[#181C31] px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-[#252A42] transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-[#0052cc] hover:bg-[#0041a8] px-8 py-3 text-sm font-bold text-white shadow-xs active:scale-98 transition disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Đang xuất bản..." : "Đăng Ghim"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
