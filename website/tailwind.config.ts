import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#030508",
        panel: "#080d14",
        glass: "rgba(255,255,255,0.07)",
        line: "rgba(255,255,255,0.12)",
        neon: "#4dff88",
        electric: "#31a8ff"
      },
      boxShadow: {
        glow: "0 0 40px rgba(77, 255, 136, 0.18)",
        blueglow: "0 0 40px rgba(49, 168, 255, 0.18)"
      },
      backgroundImage: {
        "radial-grid":
          "radial-gradient(circle at 20% 20%, rgba(77,255,136,0.18), transparent 30%), radial-gradient(circle at 80% 10%, rgba(49,168,255,0.16), transparent 28%), linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};

export default config;
