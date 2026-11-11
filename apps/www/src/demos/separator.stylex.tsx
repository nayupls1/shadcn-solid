import * as stylex from "@stylexjs/stylex"
import { Separator } from "@shadcn-solid/stylex/ui/separator"
import { colors } from "@shadcn-solid/stylex/tokens.stylex"

export default function SeparatorDemo() {
  return (
    <div {...stylex.attrs(styles.root)}>
      <div {...stylex.attrs(styles.header)}>
        <div {...stylex.attrs(styles.title)}>shadcn/ui</div>
        <div {...stylex.attrs(styles.muted)}>The Foundation for your Design System</div>
      </div>
      <Separator />
      <div>A set of beautifully designed components that you can customize, extend, and build on.</div>
    </div>
  )
}

const styles = stylex.create({
  root: {
    display: "flex",
    maxWidth: "24rem",
    flexDirection: "column",
    gap: "1rem",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
  },
  header: { display: "flex", flexDirection: "column", gap: "0.375rem" },
  title: { lineHeight: 1, fontWeight: 500 },
  muted: { color: colors.mutedForeground },
})
