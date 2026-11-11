import * as stylex from "@stylexjs/stylex"
import { Item, ItemContent, ItemMedia, ItemTitle } from "@shadcn-solid/stylex/ui/item"
import { Spinner } from "@shadcn-solid/stylex/ui/spinner"
import { radius } from "@shadcn-solid/stylex/tokens.stylex"

export default function SpinnerDemo() {
  return (
    <div {...stylex.attrs(radius1rem, styles.root)}>
      <Item variant="muted">
        <ItemMedia>
          <Spinner />
        </ItemMedia>
        <ItemContent>
          <ItemTitle xstyle={styles.lineClamp1}>Processing payment...</ItemTitle>
        </ItemContent>
        <ItemContent xstyle={styles.amountContent}>
          <span {...stylex.attrs(styles.amount)}>$100.00</span>
        </ItemContent>
      </Item>
    </div>
  )
}

// `[--radius:1rem]`: the radius scale recomputed from 1rem.
const radius1rem = stylex.createTheme(radius, {
  sm: "calc(1rem * 0.6)",
  md: "calc(1rem * 0.8)",
  lg: "1rem",
  xl: "calc(1rem * 1.4)",
  "2xl": "calc(1rem * 1.8)",
  "3xl": "calc(1rem * 2.2)",
  "4xl": "calc(1rem * 2.6)",
})

const styles = stylex.create({
  root: { display: "flex", width: "100%", maxWidth: "20rem", flexDirection: "column", gap: "1rem" },
  // `cn()` lets the demo's `line-clamp-1` replace ItemTitle's `flex` (tailwind-merge treats them as
  // conflicting `display` utilities).
  lineClamp1: { display: "-webkit-box" },
  amountContent: { flexGrow: 0, flexShrink: 0, flexBasis: "auto", justifyContent: "flex-end" },
  amount: { fontSize: "0.875rem", lineHeight: "1.25rem", fontVariantNumeric: "tabular-nums" },
})
