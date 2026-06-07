import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap"
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={inter.className}>
      <div className="noise" />
      <div className="relative z-10 flex min-h-screen flex-col bg-ink">
        <SiteHeader />
        <main className="flex-1">
          <Component {...pageProps} />
        </main>
        <Footer />
      </div>
    </div>
  );
}
