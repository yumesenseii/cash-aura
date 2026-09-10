import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
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
          background: "#F6F0E6",
        }}
      >
        <div
          style={{
            width: 360,
            height: 360,
            borderRadius: 80,
            background: "#294C60",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFFDF8",
            fontSize: 200,
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
