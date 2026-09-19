import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import { AppLayout } from "@/components/AppLayout";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "HUKI Inspire - Discovery • Share • Inspire | Khám phá & Khơi nguồn cảm hứng",
  description: "HUKI Inspire - Nền tảng chia sẻ, khám phá và lưu lại những ý tưởng nghệ thuật và thiết kế sáng tạo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (saved === 'dark' || (!saved && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased bg-white dark:bg-[#181C31] text-gray-900 dark:text-white min-h-screen flex flex-col">
        <ThemeProvider>
          <AuthProvider>
            <Toaster
              position="bottom-center"
              toastOptions={{
                duration: 3500,
                style: {
                  background: "#1c2136",
                  color: "#ffffff",
                  borderRadius: "9999px",
                  padding: "12px 24px",
                  fontSize: "14px",
                  fontWeight: 600,
                  border: "1px solid #2d2f40",
                },
              }}
            />
            <Suspense fallback={<div className="min-h-screen bg-white dark:bg-[#181C31]" />}>
              <AppLayout>{children}</AppLayout>
            </Suspense>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

