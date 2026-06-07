import Head from "next/head";
import { ArrowRight, Mail, Send, Sparkles } from "lucide-react";
import Link from "next/link";
import { FadeIn } from "@/components/Motion";
import { site } from "@/lib/site";

const contactReasons = [
  "Early access to a product",
  "Data or analytics collaboration",
  "Dashboard / BI system",
  "Product partnership"
];

export default function ContactPage() {
  return (
    <>
      <Head>
        <title>{`Contact | ${site.name}`}</title>
        <meta
          name="description"
          content="Contact Marco Roberti for product access, analytics collaborations and build notes."
        />
        <meta property="og:title" content={`Contact | ${site.name}`} />
        <meta
          property="og:description"
          content="Product access, analytics collaborations and build notes."
        />
      </Head>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-grid bg-[length:auto,auto,38px_38px,38px_38px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-ink" />
        <div className="relative mx-auto grid min-h-[calc(100vh-8rem)] w-full max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <FadeIn>
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-neon">
            Contact
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-white sm:text-6xl">
            Build notes, early access and serious conversations.
          </h1>
          <p className="mt-5 text-lg leading-8 text-white/70">
            Reach out for product access, analytics collaborations or dashboard
            systems. Short, specific messages get the fastest response.
          </p>
          <a
            className="mt-8 inline-flex items-center gap-3 text-white/70 transition hover:text-white"
            href={`mailto:${site.email}`}
          >
            <Mail className="h-5 w-5 text-electric" />
            {site.email}
          </a>
          <div className="mt-8 grid gap-3">
            {contactReasons.map((reason) => (
              <div
                key={reason}
                className="flex items-center gap-3 rounded border border-white/10 bg-black/25 p-3"
              >
                <Sparkles className="h-4 w-4 text-neon" />
                <p className="text-sm font-medium text-white/70">{reason}</p>
              </div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <form
            action={`mailto:${site.email}`}
            method="post"
            encType="text/plain"
            className="rounded-lg border border-white/10 bg-white/[0.055] p-6 shadow-glow backdrop-blur-xl sm:p-8"
          >
            <div className="grid gap-5">
              <div className="rounded border border-neon/20 bg-neon/10 p-4">
                <p className="text-sm font-semibold text-neon">
                  The form opens your email app for now.
                </p>
                <p className="mt-2 text-sm leading-6 text-white/60">
                  A proper email capture and CRM workflow will be connected
                  next; this keeps the public site live without fake promises.
                </p>
              </div>
              <div>
                <label
                  className="text-sm font-medium text-white/70"
                  htmlFor="name"
                >
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  className="mt-2 min-h-12 w-full rounded border border-white/10 bg-black/40 px-4 text-white outline-none transition placeholder:text-white/40 focus:border-neon/70 focus:ring-2 focus:ring-neon/20"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label
                  className="text-sm font-medium text-white/70"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="mt-2 min-h-12 w-full rounded border border-white/10 bg-black/40 px-4 text-white outline-none transition placeholder:text-white/40 focus:border-neon/70 focus:ring-2 focus:ring-neon/20"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label
                  className="text-sm font-medium text-white/70"
                  htmlFor="topic"
                >
                  Topic
                </label>
                <input
                  id="topic"
                  name="topic"
                  className="mt-2 min-h-12 w-full rounded border border-white/10 bg-black/40 px-4 text-white outline-none transition placeholder:text-white/40 focus:border-neon/70 focus:ring-2 focus:ring-neon/20"
                  placeholder="Early access, BI template, partnership..."
                />
              </div>
              <div>
                <label
                  className="text-sm font-medium text-white/70"
                  htmlFor="message"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  className="mt-2 w-full resize-none rounded border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition placeholder:text-white/40 focus:border-neon/70 focus:ring-2 focus:ring-neon/20"
                  placeholder="Tell me what you are interested in."
                />
              </div>
              <button
                type="submit"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded bg-neon px-5 font-semibold text-black transition hover:bg-white"
              >
                Send message
                <Send className="h-4 w-4" />
              </button>
              <Link
                href="/projects"
                className="inline-flex items-center justify-center gap-2 rounded border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Browse the product stack
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </form>
        </FadeIn>
        </div>
      </section>
    </>
  );
}
