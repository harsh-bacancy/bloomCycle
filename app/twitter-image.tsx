import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "64px",
          background: "linear-gradient(130deg, #111827 0%, #4D2BA3 45%, #2E8F86 100%)",
          color: "#fff",
          fontFamily: "Inter, Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: "68%" }}>
          <div style={{ fontSize: 24, fontWeight: 700, opacity: 0.9 }}>BloomCycle</div>
          <div style={{ fontSize: 58, lineHeight: 1.06, fontWeight: 800 }}>
            Your modern companion for women&apos;s health tracking
          </div>
          <div style={{ fontSize: 28, opacity: 0.9 }}>
            Private. Stage-aware. Built for consistency.
          </div>
        </div>
        <div
          style={{
            width: 188,
            height: 188,
            borderRadius: 46,
            border: "2px solid rgba(255,255,255,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 102,
            fontWeight: 700,
          }}
        >
          B
        </div>
      </div>
    ),
    size,
  );
}
