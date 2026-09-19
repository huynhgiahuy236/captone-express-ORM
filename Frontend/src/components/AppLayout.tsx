"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/login-callback" ||
    pathname === "/auth/google-callback";

  return (
    <>
      {!isAuthPage && <Navbar />}
      <main className={isAuthPage ? "w-full h-screen overflow-hidden p-0 m-0" : "flex-1 px-4 md:px-6 py-4"}>
        {children}
      </main>
    </>
  );
};
