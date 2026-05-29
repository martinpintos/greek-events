import { ImageResponse } from "next/og";

// GET /api/og?title=&venue=&date=&time=
// Dynamic 1200x630 OpenGraph card. Reference design is 600x315, all sizes x2.

export const revalidate = 3600;

// Characters we need glyphs for. Google Fonts subsets to `text`, and
// textTransform: uppercase is applied after subsetting, so the uppercase
// alphabet must be present in the requested set too.
const BASE_CHARSET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,:&·-–—'!?/()@";

async function loadGoogleFont(axis: string, text: string): Promise<ArrayBuffer> {
  const url = `https://fonts.googleapis.com/css2?family=${axis}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url)).text();
  // Passing `text=` makes Google serve a truetype URL, which Satori can parse.
  const match = css.match(/src:\s*url\((.+?)\)\s*format\(['"]?(?:truetype|opentype)['"]?\)/);
  if (!match) throw new Error(`Failed to extract font URL for ${axis}`);
  const res = await fetch(match[1]);
  return res.arrayBuffer();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get("title") || "Tonight on the island";
    const venue = searchParams.get("venue") || "nightly.gr";
    const date = searchParams.get("date") || "";
    const time = searchParams.get("time") || "";

    const serifText = BASE_CHARSET + title + "nightly.gr";
    const monoText = BASE_CHARSET + venue + date + time + "nightly.gr";

    const [serif, mono] = await Promise.all([
      loadGoogleFont("Instrument+Serif:ital@1", serifText),
      loadGoogleFont("JetBrains+Mono:wght@400", monoText),
    ]);

    const titleSize = title.length > 32 ? 96 : title.length > 22 ? 116 : 136;

    const monoFamily = '"JetBrains Mono", monospace';
    const serifFamily = '"Instrument Serif", serif';

    return new ImageResponse(
      (
        <div
          style={{
            width: 1200,
            height: 630,
            background: "#181612",
            position: "relative",
            overflow: "hidden",
            display: "flex",
          }}
        >
          {/* glow */}
          <div
            style={{
              position: "absolute",
              width: 800,
              height: 800,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(255,77,46,0.16) 0%, transparent 70%)",
              top: -240,
              right: -200,
            }}
          />

          {/* content */}
          <div
            style={{
              padding: "56px 56px",
              height: "100%",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            {/* top */}
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: "#ff4d2e",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: monoFamily,
                  fontSize: 26,
                  letterSpacing: 2.6,
                  textTransform: "uppercase",
                  color: "#c8c2b8",
                }}
              >
                {venue}
              </span>
            </div>

            {/* middle */}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: "20px 0 12px",
              }}
            >
              <div
                style={{
                  fontFamily: serifFamily,
                  fontStyle: "italic",
                  fontSize: titleSize,
                  lineHeight: 1.0,
                  color: "#f4efe5",
                  letterSpacing: titleSize * -0.02,
                  maxWidth: 1120,
                }}
              >
                {title}
              </div>
            </div>

            {/* bottom */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div
                  style={{
                    fontFamily: monoFamily,
                    fontSize: 28,
                    letterSpacing: 2.24,
                    textTransform: "uppercase",
                    color: "#c8c2b8",
                  }}
                >
                  {date}
                </div>
                <div
                  style={{
                    fontFamily: monoFamily,
                    fontSize: 26,
                    letterSpacing: 2.08,
                    textTransform: "uppercase",
                    color: "#7a7470",
                  }}
                >
                  {time}
                </div>
              </div>
              <div
                style={{
                  fontFamily: serifFamily,
                  fontStyle: "italic",
                  fontSize: 52,
                  lineHeight: 1,
                  display: "flex",
                  alignItems: "baseline",
                }}
              >
                <span style={{ color: "#c8c2b8" }}>nightly</span>
                <span style={{ color: "#ff4d2e" }}>.gr</span>
              </div>
            </div>
          </div>

          {/* divider */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 6,
              background: "#ff4d2e",
              opacity: 0.7,
            }}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          { name: "Instrument Serif", data: serif, style: "italic", weight: 400 },
          { name: "JetBrains Mono", data: mono, style: "normal", weight: 400 },
        ],
      },
    );
  } catch (e) {
    console.error("OG image generation failed:", e);
    return new Response("Failed to generate the image", { status: 500 });
  }
}
