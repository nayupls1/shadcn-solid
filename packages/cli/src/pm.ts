// Package manager detection and dependency installs.
import { spawnSync } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { CliError } from "./config.ts"

export type PackageManager = "bun" | "pnpm" | "yarn" | "npm"

const LOCKFILES: [string, PackageManager][] = [
  ["bun.lock", "bun"],
  ["bun.lockb", "bun"],
  ["pnpm-lock.yaml", "pnpm"],
  ["yarn.lock", "yarn"],
  ["package-lock.json", "npm"],
]

/** From `packageManager` in package.json or the nearest lockfile (walking up, for monorepos). */
export function detectPackageManager(cwd: string): PackageManager {
  const declared = readPackageJson(cwd)?.packageManager
  if (typeof declared === "string") {
    const name = declared.split("@")[0]
    if (name === "bun" || name === "pnpm" || name === "yarn" || name === "npm") return name
  }
  for (let dir = cwd; ; dir = dirname(dir)) {
    for (const [file, pm] of LOCKFILES) if (existsSync(join(dir, file))) return pm
    if (dirname(dir) === dir) break
  }
  const agent = process.env.npm_config_user_agent ?? ""
  for (const pm of ["bun", "pnpm", "yarn"] as const) if (agent.startsWith(pm)) return pm
  return "npm"
}

export function readPackageJson(cwd: string): Record<string, any> | null {
  const path = join(cwd, "package.json")
  if (!existsSync(path)) return null
  try {
    return JSON.parse(readFileSync(path, "utf8").replace(/^\uFEFF/, ""))
  } catch {
    throw new CliError(`Can't parse ${path}`)
  }
}

/** Every dependency the project declares, name → range. */
export function declaredDependencies(cwd: string): Map<string, string> {
  const pkg = readPackageJson(cwd) ?? {}
  const all = new Map<string, string>()
  for (const field of ["peerDependencies", "optionalDependencies", "devDependencies", "dependencies"]) {
    for (const [name, range] of Object.entries<string>(pkg[field] ?? {})) all.set(name, range)
  }
  return all
}

/** `name@range` specs → those whose package isn't declared in package.json yet. */
export function missingDependencies(cwd: string, specs: string[]): string[] {
  const declared = declaredDependencies(cwd)
  return [...new Set(specs)].filter((spec) => !declared.has(specName(spec)))
}

/** `@scope/name@^1.0.0` → `@scope/name`. */
export function specName(spec: string) {
  const at = spec.indexOf("@", 1)
  return at === -1 ? spec : spec.slice(0, at)
}

export function installCommand(pm: PackageManager, specs: string[]): [string, string[]] {
  return [pm, [pm === "npm" ? "install" : "add", ...specs]]
}

export function install(cwd: string, pm: PackageManager, specs: string[]) {
  const [command, args] = installCommand(pm, specs)
  const windows = process.platform === "win32"
  // On Windows npm/pnpm/yarn are .cmd shims that need a shell; quote args so cmd.exe keeps `^`.
  const result = spawnSync(command, windows ? args.map((a) => `"${a}"`) : args, {
    cwd,
    stdio: "inherit",
    shell: windows,
  })
  if (result.error || result.status !== 0) {
    const reason = result.error ? result.error.message : `exit code ${result.status}`
    throw new CliError(`\`${command} ${args.join(" ")}\` failed (${reason}). Install the packages manually and re-run.`)
  }
}
