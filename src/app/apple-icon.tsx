import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
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
          background: "#F6F0E6",
          borderRadius: 40,
        }}
      >
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 28,
            background: "#294C60",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFFDF8",
            fontSize: 64,
            fontWeight: 700,
          }}
        >
          C
        </div>
      </div>
    ),
    { ...size }
  );
}
