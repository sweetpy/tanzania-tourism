import { ImageResponse } from "next/og";
import { BokerCompass } from "@/components/BokerLogo";

export const alt = "Boker Adventures — Tanzania travel";
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
        <div style={{ display: "flex", alignItems: "center", gap: 32, color: "#F4F0E6" }}>
          <BokerCompass size={132} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 92, fontWeight: 700, letterSpacing: "0.18em", lineHeight: 1.1 }}>
              BOKER
            </div>
            <div style={{ marginTop: 16, fontSize: 32, fontWeight: 700, letterSpacing: "0.28em" }}>
              ADVENTURES
            </div>
          </div>
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
