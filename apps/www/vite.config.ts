import { fileURLToPath } from "node:url"
import { defineConfig } from "vite"
import solid from "@solidjs/vite-plugin"
import tailwindcss from "@tailwindcss/vite"
import stylex from "@stylexjs/unplugin"

export default defineConfig({
  resolve: {
    conditions: ["development", "browser"],
  },
  plugins: [
    stylex.vite({
      // defineVars/createTheme live in `*.stylex.ts` files shared across packages.
      unstable_moduleResolution: { type: "commonJS", rootDir: fileURLToPath(new URL("../..", import.meta.url)) },
    }),
    tailwindcss(),
    solid(),
  ],
})
