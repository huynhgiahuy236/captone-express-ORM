"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import api from "./api";
import { User } from "@/types";
import toast from "react-hot-toast";

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: "login" | "signup";
  openAuthModal: (mode?: "login" | "signup") => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, fullName: string, age?: number) => Promise<boolean>;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
  refreshUserInfo: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "signup">("login");

  const openAuthModal = (mode: "login" | "signup" = "login") => {
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname + window.location.search;
      // Do not save login page itself as redirect target
      if (!currentPath.startsWith("/login")) {
        sessionStorage.setItem("auth_redirect", currentPath);
        window.location.href = `/login?mode=${mode}&redirect=${encodeURIComponent(currentPath)}`;
      } else {
        window.location.href = `/login?mode=${mode}`;
      }
    }
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const refreshUserInfo = async () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setUser(null);
      setAccessToken(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.get("/auth/info");
      if (res.data?.data) {
        setUser(res.data.data);
        setAccessToken(token);
        localStorage.setItem("user", JSON.stringify(res.data.data));
      }
    } catch {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      setUser(null);
      setAccessToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("accessToken");
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
        setAccessToken(token);
      } catch (e) {
        console.error(e);
      }
    }
    refreshUserInfo();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await api.post("/auth/signin", { email, password });
      const { accessToken: newAccess, refreshToken: newRefresh, user: loggedUser } = res.data.data;

      localStorage.setItem("accessToken", newAccess);
      localStorage.setItem("refreshToken", newRefresh);
      localStorage.setItem("user", JSON.stringify(loggedUser));

      setAccessToken(newAccess);
      setUser(loggedUser);
      closeAuthModal();
      toast.success(`Chào mừng ${loggedUser.ho_ten || "bạn"} quay trở lại!`);
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Đăng nhập thất bại, vui lòng kiểm tra lại thông tin!";
      toast.error(msg);
      return false;
    }
  };

  const signup = async (
    email: string,
    password: string,
    fullName: string,
    age?: number
  ): Promise<boolean> => {
    try {
      await api.post("/auth/signup", {
        email,
        password,
        fullName,
        age: age ? Number(age) : undefined,
      });

      toast.success("Đăng ký tài khoản thành công! Đang tự động đăng nhập...");
      return await login(email, password);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Đăng ký thất bại, vui lòng thử lại!";
      toast.error(msg);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
    setAccessToken(null);
    setIsAuthModalOpen(false);
    toast.success("Đã đăng xuất");
  };

  const updateUser = (updatedFields: Partial<User>) => {
    if (!user) return;
    const newUser = { ...user, ...updatedFields };
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        login,
        signup,
        logout,
        updateUser,
        refreshUserInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
