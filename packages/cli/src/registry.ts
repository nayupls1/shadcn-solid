// The component registry baked into the CLI. `scripts/build-registry.ts` generates it from
// `packages/{tailwind,stylex,icons,primitives}/src`; `bun build --compile` embeds the JSON.

export type Style = "tailwind" | "stylex"
export const STYLES: Style[] = ["tailwind", "stylex"]

/** Where a file goes in the user's project: the `ui`, `lib` or `hooks` directory, or next to the CSS file. */
export type Group = "ui" | "lib" | "hooks" | "css"

export type RegistryFile = {
  /** `<group>/<path>`, e.g. `ui/button.tsx`, `lib/markers/avatar.stylex.ts`, `css/shadcn.css`. */
  id: string
  /**
   * Source with every internal import specifier replaced by `@@<id>@@`. The CLI swaps those
   * placeholders for relative paths once it knows where each file goes.
   */
  content: string
}

export type RegistryComponent = {
  name: string
  /** Every file the component needs, itself included (`ui/<name>.tsx` first). */
  files: string[]
  /** npm packages, `name@range`. */
  dependencies: string[]
}

export type RegistryStyle = {
  files: Record<string, RegistryFile>
  components: Record<string, RegistryComponent>
  /** What `init` writes: the utils, theme and (for Tailwind) CSS files. */
  base: { files: string[]; dependencies: string[] }
  /** Tailwind only: the `globals.css` template `init` merges into the user's CSS file. */
  globalsCss?: string
  /** Packages the project must already have (`solid-js`, `@solidjs/web`, `tailwindcss`), `name@range`. */
  peerDependencies: string[]
}

export type Registry = {
  version: string
  styles: Record<Style, RegistryStyle>
}

export const PLACEHOLDER = /@@((?:ui|lib|hooks|css)\/[^@]+)@@/g

export function placeholder(id: string) {
  return `@@${id}@@`
}
