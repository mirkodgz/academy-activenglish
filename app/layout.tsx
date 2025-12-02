import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "@/components/Providers/SessionProvider";
import { LayoutWrapper } from "@/components/LayoutWrapper";

const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Active English - Piattaforma di apprendimento",
  description: "Piattaforma di apprendimento online per corsi di inglese",
  icons: {
    icon: "/logoactiveenglish.png",
    shortcut: "/logoactiveenglish.png",
    apple: "/logoactiveenglish.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body className={`${urbanist.variable} font-sans antialiased`} suppressHydrationWarning>
        <SessionProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
