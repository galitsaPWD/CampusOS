import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "98.css/dist/98.css";
import "./globals.css";

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start",
});

export const metadata: Metadata = {
  title: "CampusOS — Your Study Desktop",
  description: "The retro-OS student toolkit. Built by a student, for students.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${pressStart2P.variable} antialiased`}>
        <div className="campus-background" />
        <div className="campus-silhouette" />
        <div className="watermark">
          CampusOS
          <div className="watermark-sub">YOUR STUDY DESKTOP</div>
        </div>
        {children}
      </body>
    </html>
  );
}
