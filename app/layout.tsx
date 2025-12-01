import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "@/components/Providers/SessionProvider";
import { LayoutWrapper } from "@/components/LayoutWrapper";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Active English - Piattaforma di apprendimento",
  description: "Piattaforma di apprendimento online per corsi di inglese",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={`${spaceGrotesk.className} antialiased`}>
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
