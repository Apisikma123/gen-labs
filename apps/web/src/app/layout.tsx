import type { Metadata } from "next";
import { Sora, Outfit, Space_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import { FeedbackProvider } from "@/components/feedback";
import { AppShell } from "@/components/app-shell";
import { SmoothScrollProvider } from "@/components/smooth-scroll-provider";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
  preload: true,
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  preload: true,
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "GEN LABS — Laboratorium Virtual & Simulasi Interaktif",
    template: "%s — GEN LABS",
  },
  description:
    "Platform laboratorium virtual dan simulasi sains interaktif: eksperimen fisika, kimia, matematika, dan komputasi didampingi Tanya AI.",
  applicationName: "GEN LABS",
  keywords: [
    "laboratorium virtual",
    "simulasi sains",
    "fisika",
    "kimia",
    "matematika",
    "informatika",
    "tanya ai",
    "eksperimen",
  ],
  authors: [{ name: "GEN LABS" }],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.svg",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: "GEN LABS",
    title: "GEN LABS — Laboratorium Virtual & Simulasi Interaktif",
    description:
      "Platform laboratorium virtual dan simulasi sains interaktif: eksperimen fisika, kimia, matematika, dan komputasi didampingi Tanya AI.",
    images: [
      {
        url: "/og-image.webp",
        width: 1200,
        height: 630,
        alt: "GEN LABS — Laboratorium Virtual & Sains Terapan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GEN LABS — Laboratorium Virtual & Simulasi Interaktif",
    description:
      "Platform laboratorium virtual dan simulasi sains interaktif: eksperimen fisika, kimia, matematika, dan komputasi didampingi Tanya AI.",
    images: ["/og-image.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`dark ${sora.variable} ${outfit.variable} ${spaceMono.variable}`}
      data-theme="dark"
      style={{ colorScheme: 'dark' }}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{document.documentElement.classList.add('dark');document.documentElement.setAttribute('data-theme','dark');document.documentElement.style.colorScheme='dark';localStorage.setItem('genlabs-theme','dark');localStorage.setItem('simula_theme','dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] antialiased selection:bg-[#3E8E75] selection:text-white">
        <ThemeProvider>
          <AuthProvider>
            <FeedbackProvider>
              <SmoothScrollProvider>
                <AppShell>{children}</AppShell>
              </SmoothScrollProvider>
            </FeedbackProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
