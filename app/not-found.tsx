import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-5 md:px-8 py-24 md:py-40 text-center">
      <div className="eyebrow eyebrow-accent mb-4">
        404 · Lost in the queue
      </div>
      <h1 className="display-h text-5xl md:text-7xl leading-[0.95] m-0 mb-4">
        This night is dark.
      </h1>
      <p className="display-h italic text-lg md:text-xl text-mute m-0 mb-8 max-w-md mx-auto">
        The page you were looking for isn&rsquo;t on the door list.
      </p>
      <Link
        href="/"
        className="inline-block px-5 py-3 bg-ink text-paper font-mono text-[11px] font-semibold uppercase tracking-[0.16em] hover:bg-accent hover:text-ink transition-colors"
      >
        Back to tonight
      </Link>
    </div>
  );
}
