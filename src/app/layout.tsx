import "./globals.css";
import React from "react";

export const metadata = {
  title: "Password Vault",
  description: "Fast, simple and private password generator + vault",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50">
        <div className="app-root">
          
          {children}
        </div>
      </body>
    </html>
  );
}
