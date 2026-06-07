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
          Privacy and data notes
        </h1>
        <div className="mt-6 space-y-6 text-white/60">
          <p>
            marcoroberti.it is a founder product hub for projects, launch
            updates and contact requests.
          </p>
          {[
            {
              title: "Information you send",
              body:
                "If you contact Marco Roberti by email or through a form, the information you provide is used to reply to your message and manage product access requests."
            },
            {
              title: "Email updates",
              body:
                "Newsletter and launch-update workflows are not connected to a production CRM yet. When they are connected, emails should only be sent to people who request them."
            },
            {
              title: "Analytics",
              body:
                "This site may later use privacy-conscious analytics to understand page performance and product interest. No analytics provider is intentionally configured in this codebase today."
            },
            {
              title: "Contact",
              body:
                "For privacy questions, use hello@marcoroberti.it."
            }
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-lg border border-white/10 bg-white/[0.045] p-5"
            >
              <h2 className="text-lg font-semibold text-white">
                {item.title}
              </h2>
              <p className="mt-2 leading-7">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
