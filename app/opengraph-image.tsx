import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

// Social preview card (also used by X/Twitter, which falls back to og:image).
// Rendered once at build time; text and brand colours only.
export const alt = SITE.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const { paper, ink, red, gold } = SITE.colors;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: paper,
          color: ink,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 24, letterSpacing: 4 }}>
          <div style={{ width: 18, height: 18, borderRadius: 9, background: red }} />
          <span>CAPTAIN OF CODE / CREATIVE ENGINEER</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 96, fontWeight: 700, lineHeight: 1.02, letterSpacing: -3 }}>Ahmad Bhanvadiya</div>
          <div style={{ display: "flex", fontSize: 44, color: red }}>{SITE.jobTitle}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ width: 180, height: 6, background: gold }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26 }}>
            <span>Ideas into interfaces. Problems into products.</span>
            <span style={{ letterSpacing: 3 }}>HYDERABAD, INDIA</span>
          </div>
        </div>
      </div>
    ),
    size
  );
}
