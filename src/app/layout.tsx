import "./globals.css";
import React from "react";

export const metadata = {
  title: "Password Vault",
  description: "Fast, simple and private password generator + vault",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-black text-slate-900 dark:text-slate-50 antialiased">
        {/* full-bleed header/content/footer allowed by layout; children should handle inner max width */}
        <div className="w-full flex-1">{children}</div>
      </body>
    </html>
  );
}
