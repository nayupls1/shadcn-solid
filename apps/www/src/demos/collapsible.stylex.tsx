import { createSignal } from "solid-js"
import * as stylex from "@stylexjs/stylex"
import { ChevronsUpDown } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { Button, type ButtonProps } from "@shadcn-solid/stylex/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@shadcn-solid/stylex/ui/collapsible"
import { colors, radius } from "@shadcn-solid/stylex/tokens.stylex"

export default function CollapsibleDemo() {
  const [isOpen, setIsOpen] = createSignal(false)

  return (
    <Collapsible open={isOpen()} onOpenChange={setIsOpen} xstyle={styles.root}>
      <div {...stylex.attrs(styles.header)}>
        <h4 {...stylex.attrs(styles.title)}>Order #4189</h4>
        <CollapsibleTrigger render={(p) => <Button {...(p as ButtonProps)} variant="ghost" size="icon" xstyle={styles.trigger} />}>
          <Icon icon={ChevronsUpDown} />
          <span {...stylex.attrs(styles.srOnly)}>Toggle details</span>
        </CollapsibleTrigger>
      </div>
      <div {...stylex.attrs(styles.row)}>
        <span {...stylex.attrs(styles.muted)}>Status</span>
        <span {...stylex.attrs(styles.medium)}>Shipped</span>
      </div>
      <CollapsibleContent xstyle={styles.content}>
        <div {...stylex.attrs(styles.box)}>
          <p {...stylex.attrs(styles.medium)}>Shipping address</p>
          <p {...stylex.attrs(styles.muted)}>100 Market St, San Francisco</p>
        </div>
        <div {...stylex.attrs(styles.box)}>
          <p {...stylex.attrs(styles.medium)}>Items</p>
          <p {...stylex.attrs(styles.muted)}>2x Studio Headphones</p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

const styles = stylex.create({
  root: { display: "flex", width: "350px", flexDirection: "column", gap: "0.5rem" },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
    paddingInline: "1rem",
  },
  title: { fontSize: "0.875rem", lineHeight: "1.25rem", fontWeight: 600 },
  trigger: { width: "2rem", height: "2rem" },
  srOnly: {
    position: "absolute",
    width: "1px",
    height: "1px",
    padding: 0,
    margin: "-1px",
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    borderWidth: 0,
  },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.border,
    paddingInline: "1rem",
    paddingBlock: "0.5rem",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
  },
  muted: { color: colors.mutedForeground },
  medium: { fontWeight: 500 },
  content: { display: "flex", flexDirection: "column", gap: "0.5rem" },
  box: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.border,
    paddingInline: "1rem",
    paddingBlock: "0.5rem",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
  },
})
