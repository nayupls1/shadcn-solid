import type { Component } from "solid-js"

/**
 * Demos are discovered from the file system, so adding a component never touches a shared list:
 *
 *   src/demos/<name>.tailwind.tsx   export default function Demo() { ... }
 *   src/demos/<name>.stylex.tsx     export default function Demo() { ... }
 *
 * `<name>` is the shadcn registry name (`button`, `alert-dialog`, ...).
 */
const tailwind = import.meta.glob<{ default: Component }>("./demos/*.tailwind.tsx", { eager: true })
const stylex = import.meta.glob<{ default: Component }>("./demos/*.stylex.tsx", { eager: true })

export type DemoEntry = {
  name: string
  title: string
  tailwind?: Component
  stylex?: Component
}

function nameOf(path: string) {
  return path.replace(/^\.\/demos\//, "").replace(/\.(tailwind|stylex)\.tsx$/, "")
}

// Titles that aren't the name in title case (shadcn's docs spelling).
const titles: Record<string, string> = { "input-otp": "Input OTP" }

function titleOf(name: string) {
  if (titles[name]) return titles[name]
  return name
    .split("-")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ")
}

const byName = new Map<string, DemoEntry>()
for (const [path, mod] of Object.entries(tailwind)) {
  const name = nameOf(path)
  byName.set(name, { ...(byName.get(name) ?? { name, title: titleOf(name) }), tailwind: mod.default })
}
for (const [path, mod] of Object.entries(stylex)) {
  const name = nameOf(path)
  byName.set(name, { ...(byName.get(name) ?? { name, title: titleOf(name) }), stylex: mod.default })
}

export const demos: DemoEntry[] = [...byName.values()].sort((a, b) => a.name.localeCompare(b.name))
