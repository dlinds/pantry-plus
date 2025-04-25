import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import JotaiProvider from "@/components/JotaiProvider";
import Navigation from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pantry Plus",
  description: "Your pantry management app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <JotaiProvider>
          <Navigation />
          {children}
        </JotaiProvider>
      </body>
    </html>
  );
}
