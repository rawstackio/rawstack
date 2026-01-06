import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner"
import "./globals.css";
import {ThemeProvider} from "next-themes";
import AuthProvider from "@/lib/context/auth-context";

export const metadata: Metadata = {
  title: "Rawstack | Public Website",
  description: "The client facing website starter",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
      <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
      >
          <AuthProvider>
            {children}
          </AuthProvider>
      </ThemeProvider>
      <Toaster />
      </body>
    </html>
  );
}
