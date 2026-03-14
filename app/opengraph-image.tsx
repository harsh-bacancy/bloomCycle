import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(130deg, #F7F4FF 0%, #FFFFFF 42%, #ECF9F7 100%)",
          fontFamily: "Inter, Arial, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at 80% 10%, rgba(123,76,242,0.2), transparent 40%)",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 18,
            padding: "72px",
            width: "70%",
            zIndex: 1,
          }}
        >
          <div style={{ fontSize: 24, fontWeight: 700, color: "#4D2BA3" }}>BloomCycle</div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 62, lineHeight: 1.05, fontWeight: 800, color: "#111827" }}>
            <span>Cycle, Fertility & Pregnancy</span>
            <span>in one private app.</span>
          </div>
          <div style={{ fontSize: 30, color: "#4B5563" }}>
            Track patterns. Build confidence. Stay prepared.
          </div>
        </div>
        <div
          style={{
            width: "30%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: 210,
              height: 210,
              borderRadius: 52,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #8E5DFF 0%, #6F45DD 55%, #2E8F86 100%)",
              boxShadow: "0 20px 60px rgba(79,66,178,0.25)",
              color: "white",
              fontSize: 116,
              fontWeight: 700,
            }}
          >
            B
          </div>
        </div>
      </div>
    ),
    size,
  );
}
