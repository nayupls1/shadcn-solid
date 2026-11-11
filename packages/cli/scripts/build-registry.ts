// Builds `src/registry.generated.json`, the component registry the CLI embeds.
//
// It reads the component source in `packages/{tailwind,stylex}/src` plus the shared
// `packages/icons` and `packages/primitives`, follows every import to work out which files and
// npm packages each component needs, and replaces internal import specifiers with placeholders
// (`@@lib/utils.ts@@`) that the CLI turns into relative paths in the user's project.
//
// Fails on any import it can't resolve, so `bun run check` catches a registry that is out of sync.
//
// Usage: bun scripts/build-registry.ts   (SHADCN_SOLID_VERSION overrides the embedded version)
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs"
import { dirname, join, relative, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"
import {
  placeholder,
  type Registry,
  type RegistryComponent,
  type RegistryFile,
  type RegistryStyle,
  type Style,
  STYLES,
} from "../src/registry.ts"

const cliDir = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const root = resolve(cliDir, "../..")
const pkgDir = (name: string) => join(root, "packages", name)
const readJson = (path: string) => JSON.parse(readFileSync(path, "utf8"))
const toPosix = (path: string) => path.split(sep).join("/")

const componentNames: string[] = readJson(join(root, "scripts/components.json"))

/** Packages a project must already have: never installed by `add`, only checked by `init`. */
const PEERS: Record<Style, string[]> = {
  tailwind: ["solid-js", "@solidjs/web", "tailwindcss"],
  stylex: ["solid-js", "@solidjs/web"],
}

/**
 * Files a component ships that none of its own files import (shadcn lists them in the registry
 * item): the code-block demo highlights code with this hook.
 */
const EXTRA_FILES: Record<string, string[]> = {
  "code-block": ["hooks/use-highlighted-code.ts"],
}

// ---------------------------------------------------------------------------------------------
// Source trees: which directory maps to which place in the user's project.

type Tree = { dir: string; toId: (rel: string) => string | null }

function styleTree(style: Style): Tree {
  return {
    dir: join(pkgDir(style), "src"),
    toId(rel) {
      const [top, ...restParts] = rel.split("/")
      const rest = restParts.join("/")
      if (top === "ui" || top === "lib" || top === "hooks") return `${top}/${rest}`
      if (rel === "tokens.stylex.ts") return "lib/tokens.stylex.ts"
      if (rel === "styles/shadcn.css") return "css/shadcn.css"
      return null
    },
  }
}

const iconsTree: Tree = {
  dir: join(pkgDir("icons"), "src"),
  toId: (rel) => (rel === "index.tsx" ? "ui/icon.tsx" : null),
}

const primitivesTree: Tree = {
  dir: join(pkgDir("primitives"), "src"),
  toId: (rel) => `lib/primitives/${rel}`,
}

/** `@shadcn-solid/*` workspace imports → absolute source file. */
function resolveWorkspaceImport(spec: string): string | null {
  if (spec === "@shadcn-solid/icons") return join(iconsTree.dir, "index.tsx")
  const m = spec.match(/^@shadcn-solid\/primitives\/(.+)$/)
  if (m) {
    const exports = readJson(join(pkgDir("primitives"), "package.json")).exports as Record<string, string>
    const target = exports[`./${m[1]}`]
    if (target) return join(pkgDir("primitives"), target)
  }
  return null
}

// ---------------------------------------------------------------------------------------------
// npm versions, from the source packages' package.json files.

const versions = new Map<string, string>()
for (const name of ["icons", "primitives", "tailwind", "stylex"]) {
  const pkg = readJson(join(pkgDir(name), "package.json"))
  for (const field of ["peerDependencies", "dependencies"] as const) {
    for (const [dep, range] of Object.entries<string>(pkg[field] ?? {})) {
      if (!range.startsWith("workspace:")) versions.set(dep, range)
    }
  }
}
// tw-animate-css and tailwindcss are imported from CSS; take tailwindcss' range from the peer.

function withVersion(name: string) {
  const range = versions.get(name)
  if (!range) throw new Error(`No version for npm package "${name}": add it to the source package's package.json`)
  return `${name}@${range}`
}

/** `shiki/langs/css.mjs` → `shiki`, `@stylexjs/stylex` → `@stylexjs/stylex`. */
function packageName(spec: string) {
  const parts = spec.split("/")
  return spec.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0]
}

// ---------------------------------------------------------------------------------------------
// Per-style processing.

type Processed = RegistryFile & { internal: string[]; external: string[] }

const SPECIFIER = /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+|@import\s+)(["'])([^"'\n]+)\2/g
const EXTENSIONS = ["", ".tsx", ".ts", "/index.tsx", "/index.ts"]

function buildStyle(style: Style): RegistryStyle {
  const trees = [styleTree(style), iconsTree, primitivesTree]
  const processed = new Map<string, Processed>()

  function idFor(abs: string): string {
    for (const tree of trees) {
      const rel = toPosix(relative(tree.dir, abs))
      if (rel.startsWith("..")) continue
      const id = tree.toId(rel)
      if (id) return id
    }
    throw new Error(`${toPosix(relative(root, abs))} is not part of the ${style} registry`)
  }

  function resolveFile(from: string, spec: string): string | null {
    if (spec.startsWith(".")) {
      const base = resolve(dirname(from), spec)
      for (const ext of EXTENSIONS) {
        const candidate = base + ext
        if (existsSync(candidate) && statSync(candidate).isFile()) return candidate
      }
      throw new Error(`Can't resolve "${spec}" from ${toPosix(relative(root, from))}`)
    }
    if (spec.startsWith("@shadcn-solid/")) {
      const abs = resolveWorkspaceImport(spec)
      if (!abs) throw new Error(`Unknown workspace import "${spec}" in ${toPosix(relative(root, from))}`)
      return abs
    }
    return null
  }

  function processFile(abs: string): Processed {
    const id = idFor(abs)
    const cached = processed.get(id)
    if (cached) return cached
    const internal = new Set<string>()
    const external = new Set<string>()
    const source = readFileSync(abs, "utf8")
    const content = source.replace(SPECIFIER, (match, prefix: string, quote: string, spec: string) => {
      const file = resolveFile(abs, spec)
      if (!file) {
        external.add(packageName(spec))
        return match
      }
      const target = idFor(file)
      internal.add(target)
      return `${prefix}${quote}${placeholder(target)}${quote}`
    })
    const entry: Processed = { id, content, internal: [...internal], external: [...external] }
    processed.set(id, entry)
    for (const dep of entry.internal) processFile(absFor(dep, abs))
    return entry
  }

  /** Reverse of `idFor`, only needed to recurse: find the file an id came from. */
  const idToAbs = new Map<string, string>()
  function absFor(id: string, from: string): string {
    const known = idToAbs.get(id)
    if (known) return known
    throw new Error(`Internal: no source for ${id} (from ${from})`)
  }
  // Index every source file up front so recursion can map ids back to files.
  for (const tree of trees) {
    for (const rel of walk(tree.dir)) {
      const id = tree.toId(rel)
      if (id) idToAbs.set(id, join(tree.dir, rel))
    }
  }

  function closure(ids: string[]) {
    const files: string[] = []
    const deps = new Set<string>()
    const visit = (id: string) => {
      if (files.includes(id)) return
      files.push(id)
      const entry = processed.get(id)!
      entry.external.forEach((d) => deps.add(d))
      entry.internal.forEach(visit)
    }
    ids.forEach(visit)
    return { files, dependencies: [...deps].filter((d) => !PEERS[style].includes(d)).sort().map(withVersion) }
  }

  const components: Record<string, RegistryComponent> = {}
  for (const name of componentNames) {
    const abs = join(styleTree(style).dir, "ui", `${name}.tsx`)
    if (!existsSync(abs)) throw new Error(`Missing ${style} component: ${toPosix(relative(root, abs))}`)
    processFile(abs)
    const extra = EXTRA_FILES[name] ?? []
    for (const id of extra) processFile(idToAbs.get(id) ?? absFor(id, name))
    components[name] = { name, ...closure([`ui/${name}.tsx`, ...extra]) }
  }

  // What `init` writes.
  const baseIds = style === "tailwind"
    ? ["lib/utils.ts", "ui/icon.tsx", "css/shadcn.css"]
    : ["lib/utils.ts", "lib/tokens.stylex.ts", "lib/theme.ts", "ui/icon.tsx"]
  for (const id of baseIds) processFile(idToAbs.get(id)!)
  const base = closure(baseIds)

  let globalsCss: string | undefined
  if (style === "tailwind") {
    // The demo's globals.css, minus the `@source` that points at the package's own components:
    // in a project, Tailwind detects the copied components on its own.
    globalsCss = readFileSync(join(styleTree(style).dir, "styles/globals.css"), "utf8")
      .replace(/\n\/\*[^*]*\*\/\n@source "[^"]*";\n/, "")
      .replace(/\n@source "[^"]*";\n/, "\n")
    if (globalsCss.includes("@source")) throw new Error("globals.css: couldn't strip @source")
    for (const m of globalsCss.matchAll(/@import\s+"([^".][^"]*)"/g)) {
      if (!PEERS[style].includes(m[1])) base.dependencies.push(withVersion(m[1]))
    }
    base.dependencies.sort()
  }

  // Every source file must reach users through some component (or init); otherwise it's dead
  // code or needs an EXTRA_FILES entry.
  const unreachable = [...idToAbs.keys()].filter((id) => !processed.has(id))
  if (unreachable.length) throw new Error(`${style}: not used by any component: ${unreachable.join(", ")}`)

  const files: Record<string, RegistryFile> = {}
  for (const [id, entry] of [...processed].sort(([a], [b]) => a.localeCompare(b))) {
    files[id] = { id, content: entry.content }
  }
  return { files, components, base, globalsCss, peerDependencies: PEERS[style].map(withVersion) }
}

function* walk(dir: string, prefix = ""): Generator<string> {
  for (const entry of readdirSync(join(dir, prefix), { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name
    if (entry.isDirectory()) yield* walk(dir, rel)
    else yield rel
  }
}

const version = (process.env.SHADCN_SOLID_VERSION || readJson(join(cliDir, "package.json")).version)
  .replace(/^v/, "")

const registry: Registry = {
  version,
  styles: Object.fromEntries(STYLES.map((style) => [style, buildStyle(style)])) as Record<Style, RegistryStyle>,
}

const out = join(cliDir, "src/registry.generated.json")
writeFileSync(out, JSON.stringify(registry))
const count = (s: Style) => Object.keys(registry.styles[s].files).length
console.log(
  `registry v${version}: ${componentNames.length} components, ` +
    `${count("tailwind")} tailwind files, ${count("stylex")} stylex files → ${toPosix(relative(root, out))}`,
)
