import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#050545",
          borderRadius: 8,
        }}
      >
        <div
          style={{
            position: "relative",
            width: 14,
            height: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 2,
              height: 14,
              background: "#ffffff",
              borderRadius: 1,
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 14,
              height: 2,
              background: "#ffffff",
              borderRadius: 1,
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 2,
              height: 10,
              background: "#ffffff",
              borderRadius: 1,
              transform: "rotate(45deg)",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 2,
              height: 10,
              background: "#ffffff",
              borderRadius: 1,
              transform: "rotate(-45deg)",
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
