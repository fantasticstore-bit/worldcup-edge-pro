import { ArrowRight } from "lucide-react";

export function EmailCapture() {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8">
      <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.055] p-6 shadow-glow backdrop-blur-xl sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-neon">
              Launch notes
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
              Get updates when new tools launch.
            </h2>
            <p className="mt-3 max-w-2xl text-white/60">
              Product drops, early access notes and behind-the-scenes progress
              across AI, analytics and investment tools.
            </p>
          </div>
          <form className="flex flex-col gap-3 sm:flex-row" action="/contact">
            <label className="sr-only" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="you@example.com"
              className="min-h-12 flex-1 rounded border border-white/10 bg-black/40 px-4 text-white outline-none transition placeholder:text-white/40 focus:border-neon/70 focus:ring-2 focus:ring-neon/20"
            />
            <button
              type="submit"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded bg-neon px-5 font-semibold text-black transition hover:bg-white"
            >
              Get updates
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
