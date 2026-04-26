import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
    >
      <body className="min-h-full flex flex-col relative">
        {/* Festive background elements */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none opacity-20 dark:opacity-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-saffron-500 blur-[100px]" />
          <div className="absolute top-[20%] right-[-5%] w-[30%] h-[50%] rounded-full bg-gold-400 blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[40%] rounded-full bg-maroon-800 blur-[100px]" />
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
