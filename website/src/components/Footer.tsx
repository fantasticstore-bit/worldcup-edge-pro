import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-neon">
            Marco Roberti
          </p>
          <p className="mt-3 max-w-xl text-lg leading-7 text-white/70">
            Building focused tools at the intersection of AI, analytics,
            operations and alternative investment signals.
          </p>
          <p className="mt-5 text-sm text-white/45">
            Built by Marco Roberti.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          {[
            { href: "/projects", label: "Projects" },
            { href: "/contact", label: "Contact" },
            { href: "/privacy", label: "Privacy" }
          ].map((item) => (
            <Link
              key={item.href}
              className="inline-flex items-center gap-2 rounded border border-white/10 bg-white/[0.04] px-4 py-2 text-white/70 transition hover:border-neon/40 hover:text-white"
              href={item.href}
            >
              {item.label}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
