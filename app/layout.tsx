import type { Metadata } from "next";
import localFont from "next/font/local";
import Footer from "@/components/footer";
import ErrorBoundary from "@/components/error-boundary";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "MyDocs - Document Management System",
  description: "Manage, convert, and organize your documents with ease. Developed by Machaba Kaizer",
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
        <ErrorBoundary>
          {children}
          <Footer />
        </ErrorBoundary>
      </body>
    </html>
  );
}
