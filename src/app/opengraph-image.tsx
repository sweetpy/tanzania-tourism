import { ImageResponse } from "next/og";

export const alt = "Wazi — Open Tanzania.";
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
          flexDirection: "column",
          justifyContent: "flex-end",
          background: "#0B1020",
          padding: "72px 80px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: "#E8A317",
            }}
          />
          <div
            style={{
              fontSize: 28,
              color: "#8B93A7",
              letterSpacing: "0.04em",
            }}
          >
            Open Tanzania.
          </div>
        </div>
        <div
          style={{
            fontSize: 112,
            fontWeight: 800,
            color: "#F4F0E6",
            letterSpacing: "-0.03em",
            lineHeight: 1,
          }}
        >
          Wazi
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 30,
            color: "#8B93A7",
            letterSpacing: "0.02em",
          }}
        >
          Wildlife. Peak. Shore.
        </div>
      </div>
    ),
    { ...size },
  );
}
