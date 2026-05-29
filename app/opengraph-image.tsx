import { ImageResponse } from "next/og";

export const alt = "nightly.gr. Greek islands, in the know.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "radial-gradient(circle at 12% 8%, #ff4d2e 0%, #58190f 34%, #0c0c0c 100%)",
        color: "#f6f4ee",
        padding: "72px",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          fontSize: 26,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          opacity: 0.92,
        }}
      >
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: 999,
            background: "#ff4d2e",
          }}
        />
        nightly.gr
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 104, lineHeight: 1.02, fontWeight: 700 }}>Greek islands,</div>
        <div
          style={{
            fontSize: 104,
            lineHeight: 1.02,
            fontWeight: 700,
            color: "#ff4d2e",
          }}
        >
          in the know.
        </div>
        <div style={{ marginTop: 28, fontSize: 32, opacity: 0.85, maxWidth: 900 }}>
          Dates, rooms, lineups, and island intel before plans get made.
        </div>
      </div>
    </div>,
    size,
  );
}
