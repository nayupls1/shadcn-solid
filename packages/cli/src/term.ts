// Terminal output and prompts, without dependencies.
import { createInterface } from "node:readline/promises"

const useColor = process.stdout.isTTY && !process.env.NO_COLOR
const paint = (code: number) => (text: string) => (useColor ? `\x1b[${code}m${text}\x1b[0m` : text)

export const bold = paint(1)
export const dim = paint(2)
export const red = paint(31)
export const green = paint(32)
export const yellow = paint(33)
export const cyan = paint(36)

export const log = {
  info: (message: string) => console.log(message),
  step: (message: string) => console.log(`${cyan("◆")} ${message}`),
  success: (message: string) => console.log(`${green("✔")} ${message}`),
  warn: (message: string) => console.warn(`${yellow("▲")} ${message}`),
  error: (message: string) => console.error(`${red("✖")} ${message}`),
}

export const isInteractive = () => Boolean(process.stdin.isTTY && process.stdout.isTTY)

async function ask(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  try {
    return (await rl.question(question)).trim()
  } finally {
    rl.close()
  }
}

export async function text(question: string, initial: string): Promise<string> {
  const answer = await ask(`${cyan("?")} ${question} ${initial ? `${dim(`(${initial})`)} ` : ""}`)
  return answer || initial
}

export async function confirm(question: string, initial = true): Promise<boolean> {
  const answer = (await ask(`${cyan("?")} ${question} ${dim(initial ? "(Y/n)" : "(y/N)")} `)).toLowerCase()
  if (!answer) return initial
  return answer === "y" || answer === "yes"
}

export async function select<T extends string>(question: string, options: T[], initial: T): Promise<T> {
  console.log(`${cyan("?")} ${question}`)
  options.forEach((option, i) => console.log(`  ${dim(`${i + 1})`)} ${option}${option === initial ? dim(" (default)") : ""}`))
  for (;;) {
    const answer = await ask(`  ${dim(">")} `)
    if (!answer) return initial
    const byIndex = options[Number(answer) - 1]
    if (byIndex) return byIndex
    const byName = options.find((o) => o === answer)
    if (byName) return byName
    console.log(`  ${red(`Pick 1-${options.length} or a name.`)}`)
  }
}

/** Prints names in columns that fit the terminal. */
export function columns(items: string[], mark?: (item: string) => string) {
  const width = Math.max(...items.map((i) => i.length)) + 4
  const perRow = Math.max(1, Math.floor((process.stdout.columns || 80) / width))
  for (let i = 0; i < items.length; i += perRow) {
    console.log(
      items
        .slice(i, i + perRow)
        .map((item) => (mark ? mark(item) : "  ") + item.padEnd(width - 2))
        .join("")
        .trimEnd(),
    )
  }
}
