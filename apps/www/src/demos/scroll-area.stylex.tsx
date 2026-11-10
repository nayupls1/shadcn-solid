import { For } from "solid-js"
import * as stylex from "@stylexjs/stylex"
import { ScrollArea } from "@shadcn-solid/stylex/ui/scroll-area"
import { Separator } from "@shadcn-solid/stylex/ui/separator"
import { colors, radius } from "@shadcn-solid/stylex/tokens.stylex"

const tags = Array.from({ length: 50 }).map((_, i, a) => `v1.2.0-beta.${a.length - i}`)

export default function ScrollAreaDemo() {
  return (
    <ScrollArea xstyle={styles.root}>
      <div {...stylex.attrs(styles.content)}>
        <h4 {...stylex.attrs(styles.heading)}>Tags</h4>
        <For each={tags}>
          {(tag) => (
            <>
              <div {...stylex.attrs(styles.tag)}>{tag}</div>
              <Separator xstyle={styles.separator} />
            </>
          )}
        </For>
      </div>
    </ScrollArea>
  )
}

const styles = stylex.create({
  root: {
    height: "18rem",
    width: "12rem",
    borderRadius: radius.md,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: colors.border,
  },
  content: { padding: "1rem" },
  heading: {
    marginTop: 0,
    marginBottom: "1rem",
    fontSize: "0.875rem",
    lineHeight: 1,
    fontWeight: 500,
  },
  tag: { fontSize: "0.875rem", lineHeight: "1.25rem" },
  separator: { marginBlock: "0.5rem" },
})
