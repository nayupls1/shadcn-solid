import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join, relative, resolve, sep } from "node:path"
import {
  CliError,
  CONFIG_FILE,
  type Config,
  groupDirs,
  loadPathMappings,
  readConfig,
  resolveAlias,
  writeConfig,
} from "./config.ts"
import { type Planned, plan, write } from "./files.ts"
import { declaredDependencies, detectPackageManager, install, installCommand, missingDependencies, readPackageJson, specName } from "./pm.ts"
import type { Registry, RegistryStyle, Style } from "./registry.ts"
import { STYLES } from "./registry.ts"
import { bold, columns, confirm, cyan, dim, green, isInteractive, log, select, text, yellow } from "./term.ts"

export type Options = {
  cwd: string
  yes: boolean
  overwrite: boolean
  install: boolean
  all: boolean
  style?: string
  css?: string
}

const display = (cwd: string, path: string) => relative(cwd, path).split(sep).join("/") || "."

// ---------------------------------------------------------------------------------------------
// init

const CSS_CANDIDATES = [
  "src/index.css",
  "src/app.css",
  "src/App.css",
  "src/styles.css",
  "src/global.css",
  "src/globals.css",
  "src/styles/globals.css",
  "src/styles/global.css",
  "app/globals.css",
  "index.css",
  "styles/globals.css",
]

function detectCss(cwd: string, srcPrefix: string) {
  const existing = CSS_CANDIDATES.filter((c) => existsSync(join(cwd, c)))
  const withTailwind = existing.find((c) => /@import\s+["']tailwindcss["']/.test(readFileSync(join(cwd, c), "utf8")))
  return withTailwind ?? existing[0] ?? `${srcPrefix}index.css`
}

/**
 * Puts shadcn's theme into the project's CSS file. Keeps whatever the file already has (minus its
 * own `@import "tailwindcss"`), with its `@import`s moved up next to ours. Returns null if the file
 * already imports shadcn.css.
 */
export function mergeCss(existing: string | null, globals: string): string | null {
  if (existing === null || !existing.trim()) return globals
  if (/@import\s+["']\.\/shadcn\.css["']/.test(existing)) return null
  const ours = new Set([...globals.matchAll(/^@import\s+["']([^"']+)["'].*$/gm)].map((m) => m[1]))
  const imports: string[] = []
  const body: string[] = []
  for (const line of existing.replace(/\r\n/g, "\n").split("\n")) {
    const m = line.match(/^\s*@import\s+(?:url\()?["']([^"']+)["']/)
    if (m) {
      if (!ours.has(m[1])) imports.push(line.trim())
    } else {
      body.push(line)
    }
  }
  const lines = globals.split("\n")
  let lastImport = -1
  lines.forEach((line, i) => {
    if (line.startsWith("@import")) lastImport = i
  })
  lines.splice(lastImport + 1, 0, ...imports)
  const rest = body.join("\n").trim()
  return lines.join("\n").trimEnd() + "\n" + (rest ? `\n${rest}\n` : "")
}

export async function init(registry: Registry, options: Options) {
  const { cwd } = options
  const interactive = isInteractive() && !options.yes
  if (!readPackageJson(cwd)) {
    throw new CliError(`No package.json in ${cwd}. Run init in your project's root (or pass --cwd).`)
  }
  if (existsSync(join(cwd, CONFIG_FILE)) && !options.overwrite) {
    if (!interactive || !(await confirm(`${CONFIG_FILE} already exists. Overwrite it?`, false))) {
      throw new CliError(`${CONFIG_FILE} already exists. Pass --overwrite to replace it.`)
    }
  }

  let style: Style
  if (options.style) {
    if (!STYLES.includes(options.style as Style)) throw new CliError(`--style must be one of ${STYLES.join(", ")}`)
    style = options.style as Style
  } else {
    style = interactive ? await select("Which styling do you want?", STYLES, "tailwind") : "tailwind"
  }

  const srcPrefix = existsSync(join(cwd, "src")) ? "src/" : ""
  const hasAtAlias = loadPathMappings(cwd).some((m) => m.pattern === "@/*")
  let tailwind: Config["tailwind"]
  if (style === "tailwind") {
    const detected = options.css ?? detectCss(cwd, srcPrefix)
    const css = interactive && !options.css ? await text("Where is your global CSS file?", detected) : detected
    tailwind = { css: css.split(sep).join("/") }
  }
  const config: Config = {
    style,
    tailwind,
    aliases: hasAtAlias
      ? { ui: "@/components/ui", lib: "@/lib", hooks: "@/hooks" }
      : { ui: `${srcPrefix}components/ui`, lib: `${srcPrefix}lib`, hooks: `${srcPrefix}hooks` },
  }
  // Validate the aliases before writing anything.
  for (const alias of Object.values(config.aliases)) resolveAlias(cwd, alias)
  writeConfig(cwd, config)
  log.success(`Wrote ${CONFIG_FILE} ${dim(`(style: ${style})`)}`)

  const styleRegistry = registry.styles[style]
  const dirs = groupDirs(cwd, config)
  await writeFiles(cwd, plan(styleRegistry, styleRegistry.base.files, dirs), options)

  if (style === "tailwind") {
    const cssPath = resolve(cwd, config.tailwind!.css)
    const existed = existsSync(cssPath)
    const merged = mergeCss(existed ? readFileSync(cssPath, "utf8") : null, styleRegistry.globalsCss!)
    if (merged === null) {
      log.info(`  ${dim("unchanged")} ${dim(display(cwd, cssPath))}`)
    } else {
      mkdirSync(dirname(cssPath), { recursive: true })
      writeFileSync(cssPath, merged)
      log.info(`  ${existed ? yellow("updated  ") : green("created  ")} ${display(cwd, cssPath)}`)
    }
  }

  checkPeers(cwd, styleRegistry)
  installDependencies(cwd, [...styleRegistry.base.dependencies, ...styleRegistry.peerDependencies], options)

  const lib = config.aliases.lib
  log.info("")
  log.info(bold("Next steps"))
  if (style === "tailwind") {
    log.info(`  • Tailwind CSS v4 has to run in your build (Vite: ${cyan("@tailwindcss/vite")}), and your entry has to`)
    log.info(`    import ${cyan(config.tailwind!.css)}. Dark mode: add the ${cyan("dark")} class to <html>.`)
  } else {
    log.info(`  • Compile StyleX in your build. With Vite (${cyan("@stylexjs/unplugin")}):`)
    log.info(dim(`      import stylex from "@stylexjs/unplugin"`))
    log.info(dim(`      plugins: [stylex.vite({ unstable_moduleResolution: { type: "commonJS", rootDir: process.cwd() } }), solid()]`))
    log.info(`  • Put ${cyan("lightMode")} or ${cyan("darkMode")} from ${cyan(`${lib}/theme`)} on your root element:`)
    log.info(dim(`      document.documentElement.className = stylex.attrs(isDark ? darkMode : lightMode).class ?? ""`))
    log.info(`  • Like shadcn's, the components expect a CSS reset such as Tailwind's Preflight`)
    log.info(`    (no default heading/paragraph margins, \`box-sizing: border-box\`, buttons inherit fonts).`)
  }
  log.info(`  • Add components: ${cyan("shadcn-solid add button")}`)
  log.info(`    Icons: ${cyan(`<Icon icon={ChevronDown} />`)} with ${cyan("Icon")} from ${cyan(`${config.aliases.ui}/icon`)} and icons from ${cyan("lucide")}.`)
}

function checkPeers(cwd: string, style: RegistryStyle) {
  const declared = declaredDependencies(cwd)
  for (const peer of style.peerDependencies) {
    const name = specName(peer)
    const range = declared.get(name)
    const wanted = peer.slice(name.length + 1)
    if (range && (name === "solid-js" || name === "@solidjs/web") && !/^[\^~]?2\./.test(range)) {
      log.warn(`${name}@${range} is installed; the components need Solid 2.0 (${wanted}).`)
    }
  }
}

// ---------------------------------------------------------------------------------------------
// add

export async function add(registry: Registry, names: string[], options: Options) {
  const { cwd } = options
  const config = readConfig(cwd)
  const style = registry.styles[config.style]
  const available = Object.keys(style.components)
  const interactive = isInteractive() && !options.yes

  if (options.all) names = available
  if (!names.length) {
    if (!interactive) throw new CliError("Name the components to add (e.g. `shadcn-solid add button`) or pass --all.")
    log.info(bold("Components"))
    columns(available)
    const answer = await text("Which components? (space-separated, or 'all')", "")
    names = answer === "all" ? available : answer.split(/[\s,]+/).filter(Boolean)
    if (!names.length) return
  }
  const unknown = names.filter((n) => !style.components[n])
  if (unknown.length) {
    const hints = unknown.map((n) => {
      const close = available.filter((a) => a.includes(n) || n.includes(a) || distance(a, n) <= 2)
      return close.length ? `${n} (did you mean ${close.join(", ")}?)` : n
    })
    throw new CliError(`Unknown component${unknown.length > 1 ? "s" : ""}: ${hints.join("; ")}. Run \`shadcn-solid list\`.`)
  }

  const components = names.map((n) => style.components[n])
  const ids = [...new Set(components.flatMap((c) => c.files))]
  const what = names.length > 6 ? `${names.length} components` : names.join(", ")
  log.step(`Adding ${what} ${dim(`(${config.style}, ${ids.length} files)`)}`)
  await writeFiles(cwd, plan(style, ids, groupDirs(cwd, config)), options)
  installDependencies(cwd, components.flatMap((c) => c.dependencies), options)
}

/** Levenshtein distance, for "did you mean". */
function distance(a: string, b: string) {
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const row = [i]
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
    }
    prev = row
  }
  return prev[b.length]
}

async function writeFiles(cwd: string, files: Planned[], options: Options) {
  const conflicts = files.filter((f) => f.status === "conflict")
  let overwrite = options.overwrite
  if (conflicts.length && !overwrite && isInteractive() && !options.yes) {
    log.warn(`These files already exist and differ from the registry:`)
    for (const f of conflicts) log.info(`    ${display(cwd, f.path)}`)
    overwrite = await confirm("Overwrite them?", false)
  }
  for (const file of files) {
    const path = display(cwd, file.path)
    if (file.status === "create") {
      write(file)
      log.info(`  ${green("created")}   ${path}`)
    } else if (file.status === "conflict" && overwrite) {
      write(file)
      log.info(`  ${yellow("overwrote")} ${path}`)
    } else if (file.status === "conflict") {
      log.info(`  ${yellow("skipped")}   ${path} ${dim("(exists and differs; --overwrite to replace)")}`)
    } else {
      log.info(`  ${dim("unchanged")} ${dim(path)}`)
    }
  }
}

function installDependencies(cwd: string, specs: string[], options: Options) {
  const missing = missingDependencies(cwd, specs).sort()
  if (!missing.length) return
  const pm = detectPackageManager(cwd)
  const [command, args] = installCommand(pm, missing)
  if (!options.install) {
    log.warn(`Skipped installing dependencies. Run: ${cyan(`${command} ${args.join(" ")}`)}`)
    return
  }
  log.step(`Installing ${missing.map(specName).join(", ")} with ${pm}`)
  install(cwd, pm, missing)
}

// ---------------------------------------------------------------------------------------------
// list

export function list(registry: Registry, options: Options) {
  let style: Style = (options.style as Style) ?? "tailwind"
  let installed = (_: string) => false
  if (existsSync(join(options.cwd, CONFIG_FILE))) {
    const config = readConfig(options.cwd)
    style = (options.style as Style) ?? config.style
    const dirs = groupDirs(options.cwd, config)
    installed = (name) => existsSync(join(dirs.ui, `${name}.tsx`))
  }
  const names = Object.keys(registry.styles[style].components)
  log.info(`${bold(`${names.length} components`)} ${dim(`(${style}; ${green("●")} installed)`)}`)
  columns(names, (name) => (installed(name) ? `${green("●")} ` : "  "))
}
