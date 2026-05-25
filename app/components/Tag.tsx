type TagKind =
  | "default"
  | "queer"
  | "after-hours"
  | "sunset"
  | "day"
  | "locals"
  | "season-opener";

const STYLES: Record<TagKind, string> = {
  default: "border-hairline text-mute",
  queer: "border-queer text-queer",
  "after-hours": "border-ink text-ink",
  sunset: "border-hairline text-mute",
  day: "border-hairline text-mute",
  locals: "border-hairline text-mute",
  "season-opener": "border-accent text-accent",
};

export function Tag({
  kind = "default",
  size = "sm",
  children,
}: {
  kind?: TagKind;
  size?: "sm" | "lg";
  children: React.ReactNode;
}) {
  const sizeClass =
    size === "lg"
      ? "gap-1.5 px-3 py-1 text-[11px]"
      : "gap-1 px-2 py-0.5 text-[9px]";
  const dotSize = size === "lg" ? "w-2 h-2" : "w-1.5 h-1.5";
  return (
    <span
      className={`inline-flex items-center rounded-full border font-mono uppercase tracking-[0.12em] ${sizeClass} ${STYLES[kind]}`}
    >
      {kind === "queer" && (
        <span
          className={`${dotSize} rounded-full`}
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
