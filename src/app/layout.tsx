import type { Metadata } from "next";
import "./globals.css";
import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";
import { AuthProvider } from "@/components/providers/SessionProvider";
import { SyncUser } from "@/components/providers/SyncUser";
import { CartProvider } from "@/components/providers/CartProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: {
    template: "%s | ITS-DONE TECH SOLUTION",
    default: "ITS-DONE TECH SOLUTION | Master Modern Tech Skills",
  },
  description: "A premium platform for hosting and purchasing high-quality tech courses and mentorship.",
  openGraph: {
    title: "ITS-DONE TECH SOLUTION",
    description: "Master Modern Tech Skills with our premium courses.",
    url: "https://its-done-tech.vercel.app/",
    siteName: "ITS-DONE TECH SOLUTION",
    images: [
      {
        url: "/og-image.jpg", // Placeholder for actual OG image
        width: 1200,
        height: 630,
        alt: "ITS-DONE TECH SOLUTION Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ITS-DONE TECH SOLUTION",
    description: "Master Modern Tech Skills with our premium courses.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased min-h-screen flex flex-col font-sans"
      >
        <AuthProvider>
          <ConvexClientProvider>
            <CartProvider>
              <SyncUser />
              <Navbar />
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
              <Toaster richColors position="top-right" />
            </CartProvider>
          </ConvexClientProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
