import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-5 py-8 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>Built by Marco Roberti.</p>
        <div className="flex flex-wrap gap-4">
          <Link className="transition hover:text-white" href="/projects">
            Projects
          </Link>
          <Link className="transition hover:text-white" href="/contact">
            Contact
          </Link>
          <Link className="transition hover:text-white" href="/privacy">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
