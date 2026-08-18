import { ImageResponse } from "next/og";

export const alt = "Tips Deck - Smarter sports picks, every day";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "76px 88px", color: "white", background: "linear-gradient(135deg, #032d20 0%, #075d40 65%, #9de52d 160%)", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", color: "#bef264", fontSize: 30, fontWeight: 800, letterSpacing: 4, textTransform: "uppercase" }}>TIPS DECK</div>
      <div style={{ display: "flex", maxWidth: 960, marginTop: 34, fontSize: 76, lineHeight: 1.03, fontWeight: 900, letterSpacing: -4 }}>Smarter sports picks, every day.</div>
      <div style={{ display: "flex", marginTop: 34, fontSize: 30, color: "#d1fae5" }}>Free predictions · Clear analysis · Premium selections</div>
    </div>,
    size,
  );
}
