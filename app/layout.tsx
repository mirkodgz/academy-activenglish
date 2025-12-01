import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./(routes)/(root)/components";
import { Footer, Navbar } from "@/components/Shared";
import { Toaster } from "@/components/ui/sonner";

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
    <ClerkProvider>
      <html lang="it">
        <body className={`${spaceGrotesk.className} antialiased`}>
          <SidebarProvider>
            <AppSidebar />
            <div className="w-full bg-stone-100 flex flex-col min-h-screen">
              <Navbar />

              <main className="flex-1">{children}</main>
              <Toaster />

              <Footer />
            </div>
          </SidebarProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
