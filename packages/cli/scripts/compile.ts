// Compiles the CLI into standalone executables (Bun's single-file executables, which embed the
// runtime and the registry). Run build-registry.ts first.
//
// Usage: bun scripts/compile.ts [target...]   (default: every target below; "host" = this machine)
import { spawnSync } from "node:child_process"
import { mkdirSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const TARGETS: Record<string, string> = {
  "linux-x64": "bun-linux-x64-baseline",
  "linux-arm64": "bun-linux-arm64",
  "windows-x64": "bun-windows-x64-baseline",
}

const cliDir = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const outDir = join(cliDir, "dist")
mkdirSync(outDir, { recursive: true })

const requested = process.argv.slice(2)
const targets = requested.length ? requested : Object.keys(TARGETS)
for (const name of targets) {
  const host = name === "host"
  if (!host && !TARGETS[name]) throw new Error(`Unknown target "${name}". Known: host, ${Object.keys(TARGETS).join(", ")}`)
  const outfile = join(outDir, host ? "shadcn-solid" : `shadcn-solid-${name}${name.startsWith("windows") ? ".exe" : ""}`)
  const args = ["build", "src/index.ts", "--compile", "--minify", "--outfile", outfile]
  if (!host) args.push(`--target=${TARGETS[name]}`)
  console.log(`bun ${args.join(" ")}`)
  const result = spawnSync(process.execPath, args, { cwd: cliDir, stdio: "inherit" })
  if (result.status !== 0) process.exit(result.status ?? 1)
}
