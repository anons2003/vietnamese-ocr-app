import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Image to Text Converter - OCR Tool",
  description: "Extract text from images using advanced OCR technology. Supports multiple languages and formats including JPG, PNG, GIF, BMP, TIFF, and WebP.",
  keywords: "OCR, image to text, text extraction, tesseract, image processing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Suppress hydration warnings caused by browser extensions
              if (typeof window !== 'undefined') {
                const originalError = console.error;
                console.error = (...args) => {
                  if (typeof args[0] === 'string' && args[0].includes('Hydration failed')) {
                    return;
                  }
                  if (typeof args[0] === 'string' && args[0].includes('hydrated but some attributes')) {
                    return;
                  }
                  originalError.apply(console, args);
                };
              }
            `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
