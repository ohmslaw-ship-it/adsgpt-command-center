import { ImageResponse } from "next/og";

export const alt = "AdsGPT Command Center · Concept by Om Raje";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#050545",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "64px 80px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            textAlign: "center",
            gap: 24,
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
            }}
          >
            AdsGPT Command Center
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 400,
              color: "#b8a9fe",
              lineHeight: 1.35,
              maxWidth: 900,
            }}
          >
            Every client. Every rupee. One morning brief.
          </div>
        </div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 400,
            color: "rgba(255,255,255,0.72)",
          }}
        >
          Concept by Om Raje
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
