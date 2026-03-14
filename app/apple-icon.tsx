import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 36,
          background: "linear-gradient(135deg, #8E5DFF 0%, #6F45DD 55%, #2E8F86 100%)",
        }}
      >
        <div
          style={{
            width: 112,
            height: 112,
            borderRadius: 999,
            border: "8px solid rgba(255,255,255,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          B
        </div>
      </div>
    ),
    size,
  );
}
