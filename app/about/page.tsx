import type { Metadata } from "next";
import { getAllEvents, getVenues } from "@/lib/data";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ChromeOverlays } from "../components/ChromeOverlays";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "About",
  description:
    "A small editorial desk for the Greek islands. Dates, rooms, lineups, and island intel before plans get made.",
  alternates: { canonical: "/about" },
};

export default async function About() {
  const [events, venues] = await Promise.all([getAllEvents(), getVenues()]);

  return (
    <ChromeOverlays events={events} venues={venues}>
      <Header />
      <main className="mx-auto max-w-3xl px-5 md:px-8 py-10 md:py-16">
        <div className="eyebrow eyebrow-accent mb-3 inline-flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent" />
          About
        </div>
        <h1 className="display-h text-5xl md:text-7xl leading-[0.95] m-0 mb-8">
          Greek islands, <em className="not-italic text-accent">in the know.</em>
        </h1>

        <p className="display-h text-xl md:text-2xl leading-[1.32] m-0 mb-6">
          Nightly.gr is an editorial desk for the Greek islands. We tell you which dates matter,
          which rooms are worth the taxi, and where we&rsquo;d send our own friends.
        </p>

        <p className="text-base leading-relaxed text-ink-2 m-0 mb-10">
          The islands run on word of mouth. A pool party that wasn&rsquo;t on any flyer. A DJ who
          flew in for one set. A bar that&rsquo;s only worth it after 2am. Most of it never makes it
          past a Telegram thread or a hotel concierge&rsquo;s notebook. We write that part down.
        </p>

        <div className="eyebrow rule-label mb-3">What you&rsquo;ll find here</div>
        <p className="text-base leading-relaxed text-ink-2 m-0">
          A calendar built around real nights, not a scraped feed. Each event is checked by a human,
          written like a tip from a friend, and tagged with the practical stuff &mdash; door times,
          who&rsquo;s actually playing, whether you need to book a table, whether a taxi at 4am is a
          fool&rsquo;s errand. Tickets always link out to the venue or promoter; we don&rsquo;t
          touch payment.
        </p>

        <div className="eyebrow rule-label mt-10 mb-3">Coverage</div>
        <p className="text-base leading-relaxed text-ink-2 m-0">
          We start with Mykonos and grow island by island, only adding a destination once we have an
          editorial bench on the ground. We don&rsquo;t list something just to fill a date.
        </p>

        <div className="eyebrow rule-label mt-10 mb-3">Contact</div>
        <p className="text-base leading-relaxed text-ink-2 m-0">
          Tips, submissions, partnerships, corrections:{" "}
          <a
            href="mailto:nightlygreece@gmail.com"
            className="text-accent underline underline-offset-2"
          >
            nightlygreece@gmail.com
          </a>
          . We read everything; we reply to most of it.
        </p>

        <div id="privacy" className="eyebrow rule-label mt-10 mb-3 scroll-mt-20 md:scroll-mt-24">
          Privacy
        </div>
        <p className="text-base leading-relaxed text-ink-2 m-0 mb-4">
          This notice explains what data Nightly.gr collects and how we use it. Nightly.gr is the
          data controller for information we collect directly through this site. For privacy
          questions, rights requests, or corrections, contact{" "}
          <a
            href="mailto:nightlygreece@gmail.com"
            className="text-accent underline underline-offset-2"
          >
            nightlygreece@gmail.com
          </a>
          .
        </p>
        <p className="text-base leading-relaxed text-ink-2 m-0 mb-4">
          <strong>What we collect. </strong>Browsing Nightly.gr does not require an account. We may
          process technical data your browser sends automatically, such as IP address, device and
          browser type, referring page, and request logs. We may also process basic usage data from
          those logs, such as requested pages and error diagnostics, plus anything you choose to send
          us by email.
        </p>
        <p className="text-base leading-relaxed text-ink-2 m-0 mb-4">
          <strong>Cookies and local storage. </strong>Right now we do not set analytics or
          advertising cookies. We use one local storage entry to remember that you&rsquo;ve dismissed
          the cookie notice. If we add non-essential analytics, advertising, embeds, social widgets,
          or measurement tools later, we will ask for consent first where the law requires it and
          provide a way to change that choice.
        </p>
        <p className="text-base leading-relaxed text-ink-2 m-0 mb-4">
          <strong>Third parties. </strong>We use service providers for hosting, database, email, and
          site operations. Some providers may process data outside Greece or the European Economic
          Area under their own safeguards and contractual terms. Ticket links, venue links, maps,
          embeds, and similar features may take you to external services with their own terms and
          privacy policies. We don&rsquo;t control those services and aren&rsquo;t responsible for
          how they handle your data.
        </p>
        <p className="text-base leading-relaxed text-ink-2 m-0 mb-4">
          <strong>Legal basis and retention. </strong>We rely on legitimate interests to run,
          secure, debug, and improve the site, and to respond when you contact us. We rely on
          consent where required, including for any future non-essential cookies or similar
          technologies. We keep request logs and operational data only as long as needed for those
          purposes or as required by our service providers and applicable law. Emails and submissions
          are kept while we handle them and for a reasonable archive period unless you ask us to
          delete them sooner and we are allowed to do so.
        </p>
        <p className="text-base leading-relaxed text-ink-2 m-0 mb-4">
          <strong>Your rights. </strong>Under GDPR you may have the right to access, correct,
          delete, restrict, or object to processing of your personal data, and to data portability.
          Where processing is based on consent, you may withdraw that consent at any time. To
          exercise any of these rights, contact us at{" "}
          <a
            href="mailto:nightlygreece@gmail.com"
            className="text-accent underline underline-offset-2"
          >
            nightlygreece@gmail.com
          </a>
          . You also have the right to lodge a complaint with your local data protection authority,
          including the Hellenic Data Protection Authority in Greece.
        </p>
        <p className="text-base leading-relaxed text-ink-2 m-0">
          We may update this notice from time to time. Material changes will be reflected on this
          page.
        </p>

        <div id="terms" className="eyebrow rule-label mt-10 mb-3 scroll-mt-20 md:scroll-mt-24">
          Terms
        </div>
        <p className="text-base leading-relaxed text-ink-2 m-0 mb-4">
          By using Nightly.gr you agree to these terms. If you don&rsquo;t, please don&rsquo;t use
          the site.
        </p>
        <p className="text-base leading-relaxed text-ink-2 m-0 mb-4">
          <strong>Editorial content.</strong> Listings, lineups, schedules, opening hours, prices,
          and recommendations are provided for general information only. We try to keep them
          accurate but make no warranty &mdash; events are rescheduled, cancelled, oversold,
          relocated, or replaced without notice. Always confirm with the venue or promoter before
          you travel, buy a ticket, or rely on anything you read here.
        </p>
        <p className="text-base leading-relaxed text-ink-2 m-0 mb-4">
          <strong>Tickets and third-party services.</strong> Nightly.gr does not sell tickets,
          process payments, or operate any of the venues or events listed. Ticket links, embeds, and
          other outbound links take you to independent third parties with their own terms, pricing,
          refund policies, and conduct on site. Any transaction or interaction you have with them is
          solely between you and that third party.
        </p>
        <p className="text-base leading-relaxed text-ink-2 m-0 mb-4">
          <strong>Your conduct and safety.</strong> Nightlife is your own responsibility. You are
          responsible for complying with venue rules, local laws, age restrictions, and for your own
          health, safety, and behaviour while attending any event. Don&rsquo;t drink and drive;
          don&rsquo;t do anything illegal.
        </p>
        <p className="text-base leading-relaxed text-ink-2 m-0 mb-4">
          <strong>Intellectual property.</strong> The site, its design, text, and other original
          content are owned by Nightly.gr or its licensors. You may view and share links to public
          pages for personal, non-commercial use. Any other use &mdash; including scraping,
          republishing, or building derivative products &mdash; requires written permission.
          Trademarks, artist names, and venue names belong to their respective owners and are used
          for identification only.
        </p>
        <p className="text-base leading-relaxed text-ink-2 m-0 mb-4">
          <strong>Submissions.</strong> If you send us tips, corrections, or other material, you
          confirm you have the right to share it and grant Nightly.gr a non-exclusive, royalty-free,
          worldwide licence to use, edit, and publish it in connection with the site.
        </p>
        <p className="text-base leading-relaxed text-ink-2 m-0 mb-4">
          <strong>Disclaimer and liability.</strong> The site is provided &ldquo;as is&rdquo; and
          &ldquo;as available&rdquo; without warranties of any kind, whether express or implied. To
          the fullest extent permitted by law, Nightly.gr and its operators are not liable for any
          direct, indirect, incidental, consequential, or special damages arising from your use of
          the site, your reliance on its content, or your interaction with any venue, event,
          promoter, or other third party referenced on it. Nothing in these terms limits any rights
          you have under mandatory consumer law that cannot lawfully be excluded.
        </p>
        <p className="text-base leading-relaxed text-ink-2 m-0">
          <strong>Governing law and changes.</strong> These terms are governed by the laws of
          Greece, without regard to conflict of law rules. The courts of Greece have non-exclusive
          jurisdiction. We may update these terms at any time; continued use of the site after
          changes are posted means you accept the updated version.
        </p>
      </main>
      <Footer />
    </ChromeOverlays>
  );
}
