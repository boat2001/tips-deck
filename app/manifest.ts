import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tips Deck - Sports Tips & Predictions",
    short_name: "Tips Deck",
    description: "Free daily sports predictions, match analysis and premium picks.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f9f8",
    theme_color: "#062b25",
    icons: [
      { src: "/brand/tips-deck-favicon.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
