import { createEffect, createMemo, createSignal } from "solid-js"
import type { GrammarState } from "shiki/core"
import { loadHighlighter, type Highlighter, type HighlightedLine } from "../lib/highlighter"

/**
 * Port of shadcn's `use-highlighted-code`. Takes accessors (Solid) and returns an accessor of
 * lines: plain strings until the language has loaded, then the highlighted token spans.
 *
 *   const lines = useHighlightedCode(() => code, () => "ts")
 *   <For each={lines()}>{(line) => <CodeBlockLine>{line}</CodeBlockLine>}</For>
 */
export function useHighlightedCode(value: () => string, language: () => string) {
  const [loaded, setLoaded] = createSignal<{ language: string; highlighter: Highlighter | null } | null>(null)

  createEffect(language, (lang) => {
    let cancelled = false

    loadHighlighter(lang)
      .then((next) => {
        if (!cancelled) {
          setLoaded({ language: lang, highlighter: next })
        }
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  })

  // The complete lines, highlighted. While the code streams, only the new
  // lines are tokenized, starting from the grammar state of the last one.
  let done: {
    highlighter: Highlighter | null
    text: string
    lines: HighlightedLine[]
    state?: GrammarState
  } = { highlighter: null, text: "", lines: [] }

  return createMemo((): Array<HighlightedLine | string> => {
    const raw = value()
    // A trailing newline would render as an extra empty line.
    const code = raw.endsWith("\n") ? raw.slice(0, -1) : raw
    const current = loaded()
    const highlighter = current?.language === language() ? current.highlighter : null

    if (!highlighter) {
      return code.split("\n")
    }

    let next = done

    if (next.highlighter !== highlighter || !code.startsWith(next.text)) {
      next = { highlighter, text: "", lines: [] }
    }

    const end = code.lastIndexOf("\n") + 1

    if (end > next.text.length) {
      const result = highlighter.highlight(code.slice(next.text.length, end - 1), next.state)

      next = {
        highlighter,
        text: code.slice(0, end),
        lines: [...next.lines, ...result.lines],
        state: result.state,
      }
    }

    done = next

    // The last line is still being written, so it is tokenized on every change.
    const tail = code.slice(end)

    return [...next.lines, highlighter.highlight(tail, next.state).lines[0] ?? []]
  })
}
