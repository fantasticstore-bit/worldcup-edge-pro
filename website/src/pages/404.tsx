import Head from "next/head";
import Link from "next/link";
import { ArrowLeft, Radar } from "lucide-react";
import { site } from "@/lib/site";

export default function NotFoundPage() {
  return (
    <>
      <Head>
        <title>{`Not Found | ${site.name}`}</title>
        <meta name="robots" content="noindex" />
      </Head>
      <section className="relative grid min-h-[calc(100vh-8rem)] place-items-center overflow-hidden px-5 py-16">
        <div className="absolute inset-0 bg-radial-grid bg-[length:auto,auto,38px_38px,38px_38px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-ink" />
        <div className="relative w-full max-w-2xl rounded-lg border border-white/10 bg-white/[0.055] p-8 text-center shadow-blueglow backdrop-blur-xl">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded border border-electric/35 bg-electric/10 text-electric">
            <Radar className="h-7 w-7" />
          </div>
          <p className="mt-6 text-sm font-medium uppercase tracking-[0.24em] text-neon">
            Signal not found
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-white">
            This route is outside the product map.
          </h1>
          <p className="mt-4 text-white/60">
            Head back to the hub and pick up the active product stack.
          </p>
          <Link
            href="/"
            className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded bg-neon px-5 font-semibold text-black transition hover:bg-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to hub
          </Link>
        </div>
      </section>
    </>
  );
}
