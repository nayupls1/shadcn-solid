#!/usr/bin/env bun
// shadcn-solid: copies shadcn/ui components for Solid 2.0 into your project, like shadcn's CLI.
// Every component's source is embedded (see scripts/build-registry.ts), so it works offline.
import { resolve } from "node:path"
import { parseArgs } from "node:util"
import { add, init, list, type Options } from "./commands.ts"
import { CliError } from "./config.ts"
import type { Registry } from "./registry.ts"
import registryJson from "./registry.generated.json"
import { bold, cyan, dim, log } from "./term.ts"

const registry = registryJson as Registry

const HELP = `${bold("shadcn-solid")} ${dim(`v${registry.version}`)}
Copy shadcn/ui components for Solid 2.0 (Tailwind or StyleX) into your project.

${bold("Usage")}
  shadcn-solid init [--style tailwind|stylex] [--css <file>]
  shadcn-solid add <component...> | --all
  shadcn-solid list

${bold("Commands")}
  init          Write ${cyan("components.json")}, the utils/theme files and the CSS theme; install base dependencies
  add           Copy components and the files they use into your project; install their dependencies
  list          Show available components (and which are installed)

${bold("Options")}
  -c, --cwd <dir>      Project directory (default: current directory)
  -s, --style <name>   init: tailwind or stylex. list: style to list
      --css <file>     init (tailwind): your global CSS file
  -a, --all            add: every component
  -o, --overwrite      Replace files that already exist and differ
  -y, --yes            Don't prompt; use defaults and skip conflicting files
      --no-install     Don't run the package manager; print the install command instead
  -v, --version        Print the version
  -h, --help           Show this help

${bold("Examples")}
  shadcn-solid init --style stylex
  shadcn-solid add button dialog dropdown-menu
`

async function main(argv: string[]) {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      cwd: { type: "string", short: "c" },
      style: { type: "string", short: "s" },
      css: { type: "string" },
      all: { type: "boolean", short: "a" },
      overwrite: { type: "boolean", short: "o" },
      yes: { type: "boolean", short: "y" },
      "no-install": { type: "boolean" },
      version: { type: "boolean", short: "v" },
      help: { type: "boolean", short: "h" },
    },
  })
  if (values.version) return log.info(registry.version)
  const [command, ...rest] = positionals
  if (values.help || !command || command === "help") return log.info(HELP)

  const options: Options = {
    cwd: resolve(values.cwd ?? process.cwd()),
    yes: values.yes ?? false,
    overwrite: values.overwrite ?? false,
    install: !values["no-install"],
    all: values.all ?? false,
    style: values.style,
    css: values.css,
  }
  switch (command) {
    case "init":
      return init(registry, options)
    case "add":
      return add(registry, rest, options)
    case "list":
    case "ls":
      return list(registry, options)
    default:
      throw new CliError(`Unknown command "${command}". Run \`shadcn-solid --help\`.`)
  }
}

main(process.argv.slice(2)).catch((error) => {
  if (error instanceof CliError || (error as { code?: string }).code?.startsWith("ERR_PARSE_ARGS")) {
    log.error(error.message)
  } else {
    log.error(error?.stack ?? String(error))
  }
  process.exit(1)
})
