import { createSignal, For } from "solid-js"
import * as stylex from "@stylexjs/stylex"
import { Download, FileCode, WrapText } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { useHighlightedCode } from "@shadcn-solid/stylex/hooks/use-highlighted-code"
import { Button } from "@shadcn-solid/stylex/ui/button"
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockLine,
  CodeBlockTitle,
} from "@shadcn-solid/stylex/ui/code-block"
import { colors } from "@shadcn-solid/stylex/tokens.stylex"

const code = `import { streamText } from "ai"

export async function POST(request: Request) {
  const { messages } = await request.json()

  const result = streamText({
    model: "anthropic/claude-sonnet-4.5",
    system: "You are a helpful assistant. Answer in one short paragraph.",
    messages,
  })

  return result.toUIMessageStreamResponse()
}`

function download(value: string, filename: string) {
  const url = URL.createObjectURL(new Blob([value], { type: "text/plain" }))
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export default function CodeBlockDemo() {
  const [wrap, setWrap] = createSignal(false)
  const lines = useHighlightedCode(
    () => code,
    () => "ts",
  )

  return (
    <div {...stylex.attrs(styles.root)}>
      <CodeBlock>
        <CodeBlockHeader>
          <CodeBlockTitle>
            <Icon icon={FileCode} {...stylex.attrs(styles.titleIcon)} />
            app/api/chat/route.ts
          </CodeBlockTitle>
          <CodeBlockActions>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="Wrap lines"
              aria-pressed={wrap() ? "true" : "false"}
              xstyle={styles.pressed}
              onClick={() => setWrap(!wrap())}
            >
              <Icon icon={WrapText} size={12} />
            </Button>
            <Button variant="ghost" size="icon-xs" aria-label="Download" onClick={() => download(code, "route.ts")}>
              <Icon icon={Download} size={12} />
            </Button>
            <CodeBlockCopyButton value={code} />
          </CodeBlockActions>
        </CodeBlockHeader>
        <CodeBlockContent wrap={wrap()} lineNumbers>
          <For each={lines()} keyed={false}>
            {(line, index) => (
              <CodeBlockLine variant={index >= 5 && index <= 9 ? "highlighted" : "default"}>{line()}</CodeBlockLine>
            )}
          </For>
        </CodeBlockContent>
      </CodeBlock>
    </div>
  )
}

const styles = stylex.create({
  root: { width: "100%", maxWidth: "32rem" },
  titleIcon: { display: "inline-block", verticalAlign: "middle", marginInlineEnd: "0.375rem" },
  pressed: { color: { default: null, ":is([aria-pressed=true])": colors.foreground } },
})
