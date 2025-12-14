import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import WalletModalProvider from "@/components/providers/WalletModalProvider";
import ConvexClientProvider from "@/components/providers/ConvexClientProvider";
import EmbeddedWalletProvider from "@/components/providers/EmbeddedWalletProvider";
import WalletDrawerProvider from "@/components/providers/WalletDrawerProvider";
import { NotificationPanelProvider } from "@/components/providers/NotificationPanelProvider";
import NotificationsPanel from "@/components/NotificationsPanel";
import { PrepStreamProvider } from "@/components/providers/PrepStreamProvider";
import { CameraPermissionsProvider } from "@/components/providers/CameraPermissionsProvider";
import { Toaster } from "sonner";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "OPNODE - Live Streaming with Lightning Payments",
    template: "%s | OPNODE",
  },
  description: "Stream live, earn sats. OPNODE is a decentralized live streaming platform powered by Lightning Network and Bitcoin payments.",
  keywords: ["live streaming", "bitcoin", "lightning network", "streaming", "crypto", "sats", "web3"],
  authors: [{ name: "OPNODE" }],
  creator: "OPNODE",
  publisher: "OPNODE",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  
  icons: {
    icon: [
      { url: "/images/Logo.svg", type: "image/svg+xml" },
      { url: "/images/Logo.png", type: "image/png" },
    ],
    apple: "/images/Logo.png",
    shortcut: "/images/Logo.png",
  },
  
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "OPNODE",
    title: "OPNODE - Live Streaming with Lightning Payments",
    description: "Stream live, earn sats. Decentralized live streaming platform powered by Lightning Network.",
    images: [
      {
        url: "/images/500l.png",
        width: 1200,
        height: 630,
        alt: "OPNODE Live Streaming Platform",
      },
    ],
  },
  
  twitter: {
    card: "summary_large_image",
    title: "OPNODE - Live Streaming with Lightning Payments",
    description: "Stream live, earn sats. Decentralized live streaming platform powered by Lightning Network.",
    images: ["/images/500l.png"],
    creator: "@opnode",
  },
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  
  verification: {
    // Add verification tokens when available
    // google: "your-google-verification-token",
    // yandex: "your-yandex-verification-token",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ConvexClientProvider>
          <EmbeddedWalletProvider>
            <WalletModalProvider>
              <WalletDrawerProvider>
                <NotificationPanelProvider>
                  <PrepStreamProvider>
                    <CameraPermissionsProvider>
                      {children}
                      <NotificationsPanel />
                    </CameraPermissionsProvider>
                  </PrepStreamProvider>
                </NotificationPanelProvider>
              </WalletDrawerProvider>
            </WalletModalProvider>
          </EmbeddedWalletProvider>
        </ConvexClientProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
