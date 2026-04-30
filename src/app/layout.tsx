import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { DataProvider } from "@/context/DataContext";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TEAM EGB Ganesha Chaturthi Celebrations",
  description: "Devotion • Faith • Unity - TEAM EGB",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col relative" suppressHydrationWarning>
        <Analytics />
        {/* Enhanced festive background elements */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none opacity-20 dark:opacity-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-saffron-500 blur-[100px] animate-float"></div>
          <div className="absolute top-[20%] right-[-5%] w-[30%] h-[50%] rounded-full bg-gold-400 blur-[120px] animate-float delay-500"></div>
          <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[40%] rounded-full bg-maroon-800 blur-[100px] animate-float delay-1000"></div>

          {/* Floating particles */}
          <div className="absolute top-[15%] left-[10%] w-2 h-2 bg-orange-400 rounded-full animate-particle-float delay-200 opacity-60"></div>
          <div className="absolute top-[35%] right-[15%] w-1.5 h-1.5 bg-yellow-400 rounded-full animate-particle-float delay-700 opacity-50"></div>
          <div className="absolute top-[60%] left-[25%] w-1 h-1 bg-red-400 rounded-full animate-particle-float delay-400 opacity-70"></div>
          <div className="absolute top-[45%] right-[30%] w-2.5 h-2.5 bg-gold-500 rounded-full animate-particle-float delay-900 opacity-40"></div>
          <div className="absolute bottom-[20%] left-[60%] w-1.5 h-1.5 bg-orange-300 rounded-full animate-particle-float delay-600 opacity-55"></div>
          <div className="absolute bottom-[35%] right-[20%] w-1 h-1 bg-maroon-400 rounded-full animate-particle-float delay-300 opacity-65"></div>
        </div>

        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <DataProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </DataProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
