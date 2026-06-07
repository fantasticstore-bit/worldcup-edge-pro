import Head from "next/head";
import { Mail, Send } from "lucide-react";
import { FadeIn } from "@/components/Motion";
import { site } from "@/lib/site";

export default function ContactPage() {
  return (
    <>
      <Head>
        <title>{`Contact | ${site.name}`}</title>
        <meta
          name="description"
          content="Contact Marco Roberti and get product launch updates."
        />
      </Head>
      <section className="mx-auto grid min-h-[calc(100vh-8rem)] w-full max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <FadeIn>
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-neon">
            Contact
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-white sm:text-6xl">
            Follow the next launch.
          </h1>
          <p className="mt-5 text-lg leading-8 text-white/70">
            Get updates on new tools, MVP launches and early access windows
            across the Marco Roberti product hub.
          </p>
          <a
            className="mt-8 inline-flex items-center gap-3 text-white/70 transition hover:text-white"
            href={`mailto:${site.email}`}
          >
            <Mail className="h-5 w-5 text-electric" />
            {site.email}
          </a>
        </FadeIn>

        <FadeIn delay={0.1}>
          <form className="rounded-lg border border-white/10 bg-white/[0.055] p-6 shadow-glow backdrop-blur-xl sm:p-8">
            <div className="grid gap-5">
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
            </div>
          </form>
        </FadeIn>
      </section>
    </>
  );
}
