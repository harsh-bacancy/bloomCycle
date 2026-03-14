import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BloomCycle",
    short_name: "BloomCycle",
    description: "Privacy-focused cycle, fertility, and pregnancy companion.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f4ff",
    theme_color: "#7b4cf2",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
