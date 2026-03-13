import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";
import { AuthProvider } from "@/components/providers/SessionProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SyncUser } from "@/components/providers/SyncUser";
import { CartProvider } from "@/components/providers/CartProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ITZ-DONE TECH SOLUTION | Master Modern Tech Skills",
  description: "A premium platform for hosting and purchasing high-quality tech courses and mentorship.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <AuthProvider>
          <ThemeProvider>
            <ConvexClientProvider>
              <CartProvider>
                <SyncUser />
                <Navbar />
                <main className="flex-grow">
                  {children}
                </main>
                <Footer />
              </CartProvider>
            </ConvexClientProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
