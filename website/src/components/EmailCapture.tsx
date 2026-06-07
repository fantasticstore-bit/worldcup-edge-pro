import { ArrowRight } from "lucide-react";

export function EmailCapture() {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8">
      <div className="relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.055] p-6 shadow-glow backdrop-blur-xl sm:p-8">
        <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_70%_50%,rgba(49,168,255,0.24),transparent_35%)] lg:block" />
        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div className="relative">
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-neon">
              Launch notes
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
              Get the private build notes.
            </h2>
            <p className="mt-3 max-w-2xl text-white/60">
              Early access, product drops and sharp notes on the systems I am
              building across AI, analytics and alternative investments.
            </p>
          </div>
          <form className="relative flex flex-col gap-3 sm:flex-row" action="/contact">
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
              Join updates
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
