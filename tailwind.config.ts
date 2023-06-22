import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: "#23272A",
        "dark-legacy": "#4E5D94",
        blurple: "#5865F2",
        "blurple-dark": "#454FBF",
        "blurple-legacy": "#7289DA",
      },
      fontFamily: {
        sans: ["var(--font-poppins)", ...fontFamily.sans],
      },
    },
  },
  plugins: [require("@headlessui/tailwindcss")],
} satisfies Config;
