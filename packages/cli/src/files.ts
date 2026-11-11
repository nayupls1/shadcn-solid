// Writing registry files into the user's project.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join, relative, sep } from "node:path"
import type { Group, RegistryStyle } from "./registry.ts"
import { PLACEHOLDER } from "./registry.ts"

export type Planned = {
  id: string
  path: string
  content: string
  status: "create" | "unchanged" | "conflict"
}

export function destination(dirs: Record<Group, string>, id: string) {
  const slash = id.indexOf("/")
  const group = id.slice(0, slash) as Group
  return join(dirs[group], ...id.slice(slash + 1).split("/"))
}

/** Relative import specifier from one file to another, without the TS extension. */
export function importPath(fromFile: string, toFile: string) {
  let spec = relative(dirname(fromFile), toFile).split(sep).join("/")
  spec = spec.replace(/\.(tsx|ts)$/, "")
  return spec.startsWith(".") ? spec : `./${spec}`
}

/** Resolves placeholders and compares against what's on disk. */
export function plan(style: RegistryStyle, ids: string[], dirs: Record<Group, string>): Planned[] {
  return ids.map((id) => {
    const file = style.files[id]
    if (!file) throw new Error(`Registry is missing ${id}`)
    const path = destination(dirs, id)
    const content = file.content.replace(PLACEHOLDER, (_, target: string) => importPath(path, destination(dirs, target)))
    if (!existsSync(path)) return { id, path, content, status: "create" }
    const current = readFileSync(path, "utf8").replace(/\r\n/g, "\n")
    return { id, path, content, status: current === content ? "unchanged" : "conflict" }
  })
}

export function write(file: Planned) {
  mkdirSync(dirname(file.path), { recursive: true })
  writeFileSync(file.path, file.content)
}
