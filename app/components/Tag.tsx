type TagKind = "default" | "queer" | "after-hours" | "sunset" | "free" | "day" | "locals" | "season-opener";

const STYLES: Record<TagKind, string> = {
  default: "border-hairline text-mute",
  queer: "border-queer text-queer",
  "after-hours": "border-ink text-ink",
  sunset: "border-hairline text-mute",
  free: "border-ink text-ink font-semibold",
  day: "border-hairline text-mute",
  locals: "border-hairline text-mute",
  "season-opener": "border-accent text-accent",
};

export function Tag({
  kind = "default",
  children,
}: {
  kind?: TagKind;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-mono uppercase tracking-[0.12em] ${STYLES[kind]}`}
    >
      {kind === "queer" && (
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background:
              "linear-gradient(90deg, #e63946 0%, #f1a208 25%, #ffe066 50%, #2ec4b6 70%, #3a86ff 85%, #8338ec 100%)",
          }}
        />
      )}
      {kind === "sunset" && <span aria-hidden>◐</span>}
      {children}
    </span>
  );
}
