import Head from "next/head";
import { site } from "@/lib/site";

export default function PrivacyPage() {
  return (
    <>
      <Head>
        <title>{`Privacy | ${site.name}`}</title>
        <meta name="description" content="Privacy notes for marcoroberti.it." />
      </Head>
      <section className="mx-auto min-h-[calc(100vh-8rem)] w-full max-w-3xl px-5 py-16 sm:px-8">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-neon">
          Privacy
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-white">
          Privacy notes
        </h1>
        <div className="mt-6 space-y-5 text-white/60">
          <p>
            marcoroberti.it is a founder product hub for projects, launch
            updates and contact requests.
          </p>
          <p>
            Contact and update forms are placeholders until a production email
            or CRM provider is connected. When connected, submitted information
            should only be used to respond to requests and send requested
            product updates.
          </p>
        </div>
      </section>
    </>
  );
}
