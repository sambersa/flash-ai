import type { Metadata } from "next";
import { Mona_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const monaSans = Mona_Sans({
  variable: "--font-mona-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flash Interviewer AI",
  description: "An AI platform to prepare for interviews",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body 
        className={`${monaSans.className} antialiased pattern`}
        suppressHydrationWarning={true}
      >
        {children}

        <Toaster />
      </body>
    </html>
  )
}