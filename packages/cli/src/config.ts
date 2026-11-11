// `components.json` and resolving its aliases to directories, like shadcn's CLI.
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, isAbsolute, join, resolve } from "node:path"
import type { Group, Style } from "./registry.ts"
import { STYLES } from "./registry.ts"

export const CONFIG_FILE = "components.json"

export type Config = {
  style: Style
  /** Tailwind only. */
  tailwind?: { css: string }
  /**
   * Where components go, as import aliases (`@/components/ui`, resolved through tsconfig `paths`)
   * or plain paths relative to the project (`src/components/ui`). Copied files import each
   * other with relative paths, so neither the bundler nor StyleX needs to know the alias.
   */
  aliases: { ui: string; lib: string; hooks: string }
}

export class CliError extends Error {}

export function readConfig(cwd: string): Config {
  const path = join(cwd, CONFIG_FILE)
  if (!existsSync(path)) {
    throw new CliError(`No ${CONFIG_FILE} in ${cwd}. Run \`shadcn-solid init\` first.`)
  }
  let config: Config
  try {
    config = JSON.parse(readFileSync(path, "utf8").replace(/^\uFEFF/, ""))
  } catch (error) {
    throw new CliError(`Invalid ${CONFIG_FILE}: ${(error as Error).message}`)
  }
  if (!STYLES.includes(config.style)) {
    throw new CliError(`${CONFIG_FILE}: "style" must be one of ${STYLES.join(", ")}`)
  }
  for (const key of ["ui", "lib", "hooks"] as const) {
    if (typeof config.aliases?.[key] !== "string") throw new CliError(`${CONFIG_FILE}: missing "aliases.${key}"`)
  }
  if (config.style === "tailwind" && typeof config.tailwind?.css !== "string") {
    throw new CliError(`${CONFIG_FILE}: missing "tailwind.css" (the CSS file that imports Tailwind)`)
  }
  return config
}

export function writeConfig(cwd: string, config: Config) {
  writeFileSync(join(cwd, CONFIG_FILE), JSON.stringify(config, null, 2) + "\n")
}

// ---------------------------------------------------------------------------------------------
// tsconfig paths

type PathMapping = { pattern: string; targets: string[]; baseDir: string }

/** Parses tsconfig's JSON-with-comments. */
export function parseJsonc(text: string): any {
  let out = ""
  let inString = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inString) {
      out += c
      if (c === "\\") out += text[++i] ?? ""
      else if (c === '"') inString = false
    } else if (c === '"') {
      inString = true
      out += c
    } else if (c === "/" && text[i + 1] === "/") {
      while (i < text.length && text[i] !== "\n") i++
      out += "\n"
    } else if (c === "/" && text[i + 1] === "*") {
      i += 2
      while (i < text.length && !(text[i] === "*" && text[i + 1] === "/")) i++
      i++
    } else {
      out += c
    }
  }
  return JSON.parse(out.replace(/,(\s*[}\]])/g, "$1"))
}

function readTsconfig(file: string, seen = new Set<string>()): { paths: PathMapping[]; references: string[] } {
  if (seen.has(file) || !existsSync(file)) return { paths: [], references: [] }
  seen.add(file)
  let json: any
  try {
    json = parseJsonc(readFileSync(file, "utf8").replace(/^\uFEFF/, ""))
  } catch {
    return { paths: [], references: [] }
  }
  const dir = dirname(file)
  const paths: PathMapping[] = []
  // Local `extends` first, so this file's own paths take precedence (they're checked last-in-first).
  const parents = [json.extends].flat().filter((e: unknown): e is string => typeof e === "string" && e.startsWith("."))
  for (const parent of parents) {
    const parentFile = resolve(dir, parent.endsWith(".json") ? parent : `${parent}.json`)
    paths.push(...readTsconfig(parentFile, seen).paths)
  }
  const options = json.compilerOptions ?? {}
  if (options.paths) {
    const baseDir = options.baseUrl ? resolve(dir, options.baseUrl) : dir
    for (const [pattern, targets] of Object.entries<string[]>(options.paths)) {
      paths.unshift({ pattern, targets, baseDir })
    }
  }
  const references = (json.references ?? [])
    .map((r: { path?: string }) => r.path)
    .filter(Boolean)
    .map((p: string) => {
      const abs = resolve(dir, p)
      return abs.endsWith(".json") ? abs : join(abs, "tsconfig.json")
    })
  return { paths, references }
}

/** `paths` from tsconfig.json, its local `extends` and its project references (Vite's tsconfig.app.json). */
export function loadPathMappings(cwd: string): PathMapping[] {
  const mappings: PathMapping[] = []
  for (const name of ["tsconfig.json", "jsconfig.json"]) {
    const { paths, references } = readTsconfig(join(cwd, name))
    mappings.push(...paths)
    for (const ref of references) mappings.push(...readTsconfig(ref).paths)
  }
  return mappings
}

/** Resolves an alias (`@/components/ui`) or project-relative path (`src/components/ui`) to a directory. */
export function resolveAlias(cwd: string, alias: string, mappings = loadPathMappings(cwd)): string {
  for (const { pattern, targets, baseDir } of mappings) {
    const target = targets[0]
    if (!target) continue
    if (pattern.endsWith("*")) {
      const prefix = pattern.slice(0, -1)
      if (alias.startsWith(prefix)) return resolve(baseDir, target.replace("*", alias.slice(prefix.length)))
      if (alias === prefix.replace(/\/$/, "")) return resolve(baseDir, target.replace(/\/?\*$/, ""))
    } else if (alias === pattern) {
      return resolve(baseDir, target)
    }
  }
  if (/^[@~#]/.test(alias)) {
    throw new CliError(
      `Can't resolve "${alias}": no matching "paths" entry in tsconfig.json. ` +
        `Add one (e.g. "@/*": ["./src/*"]) or use a plain path such as "src/components/ui" in ${CONFIG_FILE}.`,
    )
  }
  return isAbsolute(alias) ? alias : resolve(cwd, alias)
}

/** Absolute directory for each file group. */
export function groupDirs(cwd: string, config: Config): Record<Group, string> {
  const mappings = loadPathMappings(cwd)
  const lib = resolveAlias(cwd, config.aliases.lib, mappings)
  return {
    ui: resolveAlias(cwd, config.aliases.ui, mappings),
    lib,
    hooks: resolveAlias(cwd, config.aliases.hooks, mappings),
    // Tailwind's shadcn.css goes next to the CSS file that imports it.
    css: config.tailwind ? dirname(resolve(cwd, config.tailwind.css)) : lib,
  }
}
