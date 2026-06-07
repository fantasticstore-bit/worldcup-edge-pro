import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const navItems = [
  { href: "/projects", label: "Projects" },
  { href: "/contact", label: "Contact" }
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded border border-neon/40 bg-neon/10 text-sm font-bold text-neon shadow-glow">
            MR
          </span>
          <span>
            <span className="block text-sm font-semibold tracking-wide text-white">
              Marco Roberti
            </span>
            <span className="hidden text-[11px] uppercase tracking-[0.22em] text-white/40 sm:block">
              Product lab
            </span>
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded px-3 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/projects"
            className="ml-1 hidden items-center gap-2 rounded border border-electric/40 bg-electric/10 px-3 py-2 text-sm font-medium text-electric transition hover:border-electric/70 hover:bg-electric/15 sm:flex"
          >
            Explore
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
