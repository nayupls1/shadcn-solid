#!/usr/bin/env node
// Reports which shadcn/ui components exist in each variant and have demos.
// Usage: node scripts/coverage.mjs [--strict]   (--strict exits 1 when anything is missing)
import { existsSync, readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

const root = fileURLToPath(new URL("..", import.meta.url))
const names = JSON.parse(readFileSync(new URL("./components.json", import.meta.url), "utf8"))
const checks = {
  tailwind: (n) => `packages/tailwind/src/ui/${n}.tsx`,
  stylex: (n) => `packages/stylex/src/ui/${n}.tsx`,
  "demo:tw": (n) => `apps/www/src/demos/${n}.tailwind.tsx`,
  "demo:sx": (n) => `apps/www/src/demos/${n}.stylex.tsx`,
}

let missing = 0
const rows = names.map((name) => {
  const cells = Object.values(checks).map((path) => {
    const ok = existsSync(root + path(name))
    if (!ok) missing++
    return ok ? "✓" : "·"
  })
  return [name.padEnd(18), ...cells.map((c) => c.padEnd(9))].join("")
})
console.log(["component".padEnd(18), ...Object.keys(checks).map((k) => k.padEnd(9))].join(""))
console.log(rows.join("\n"))
const total = names.length * Object.keys(checks).length
console.log(`\n${total - missing}/${total} present (${names.length} components)`)
if (process.argv.includes("--strict") && missing > 0) process.exit(1)
