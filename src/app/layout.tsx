import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Apollo Care Hospitals — AI Appointment Management",
  description: "AI-powered appointment management system for Apollo Care Hospitals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <nav className="border-b bg-card sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-8">
                <a href="/dashboard" className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
                    <span className="text-white text-sm font-bold">AC</span>
                  </div>
                  <div className="hidden sm:block">
                    <p className="font-semibold text-sm leading-tight">
                      Apollo Care
                    </p>
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      Hospitals
                    </p>
                  </div>
                </a>
                <div className="flex items-center gap-1">
                  <a
                    href="/dashboard"
                    className="px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    Dashboard
                  </a>
                  <a
                    href="/doctors"
                    className="px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    Doctors
                  </a>
                  <a
                    href="/analytics"
                    className="px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    Analytics
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground bg-muted rounded-full px-3 py-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                  </span>
                  AI System Active
                </div>
              </div>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}