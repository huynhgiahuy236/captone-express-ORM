export interface PrivacySettings {
  created: "PUBLIC" | "FOLLOWERS" | "PRIVATE";
  saved: "PUBLIC" | "FOLLOWERS" | "PRIVATE";
  liked_pins: "PUBLIC" | "FOLLOWERS" | "PRIVATE";
  liked_comments: "PUBLIC" | "FOLLOWERS" | "PRIVATE";
  followers?: "PUBLIC" | "FOLLOWERS" | "PRIVATE";
  following?: "PUBLIC" | "FOLLOWERS" | "PRIVATE";
}

export interface User {
  nguoi_dung_id: number;
  email: string;
  ho_ten?: string | null;
  tuoi?: number | null;
  anh_dai_dien?: string | null;
  mo_ta?: string | null;
  google_id?: string | null;
  quyen_rieng_tu?: string | null;
  privacySettings?: PrivacySettings;
  followersCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
  canViewCreated?: boolean;
  canViewSaved?: boolean;
  canViewLikedPins?: boolean;
  canViewLikedComments?: boolean;
  canViewFollowers?: boolean;
  canViewFollowing?: boolean;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    hinh_anh?: number;
    luu_anh?: number;
    tym_anh?: number;
  };
}

export interface ImageItem {
  hinh_id: number;
  ten_hinh: string;
  duong_dan: string;
  mo_ta?: string | null;
  the_loai?: string | null;
  nguoi_dung_id: number;
  createdAt: string;
  updatedAt: string;
  nguoi_dung?: User;
  isSaved?: boolean;
  isLiked?: boolean;
  likeCount?: number;
  saveCount?: number;
  commentCount?: number;
  _count?: {
    luu_anh?: number;
    binh_luan?: number;
    tym_anh?: number;
  };
}

export interface CommentItem {
  binh_luan_id: number;
  nguoi_dung_id: number;
  hinh_id: number;
  ngay_binh_luan: string;
  noi_dung: string;
  nguoi_dung?: User;
  hinh_anh?: ImageItem;
  isLiked?: boolean;
  likeCount?: number;
}

export interface NotificationItem {
  thong_bao_id: number;
  nguoi_gui_id: number;
  nguoi_nhan_id: number;
  hinh_id?: number | null;
  loai: "LIKE" | "COMMENT" | "FOLLOW";
  noi_dung: string;
  da_doc: boolean;
  createdAt: string;
  updatedAt: string;
  nguoi_gui?: User;
  hinh_anh?: ImageItem;
}

export interface ApiResponse<T = any> {
  status: "success" | "error";
  statusCode: number;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    pageSize: number;
    totalItem: number;
    totalPage: number;
  };
}
