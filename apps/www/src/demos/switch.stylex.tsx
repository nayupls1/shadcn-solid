import * as stylex from "@stylexjs/stylex"
import { Label } from "@shadcn-solid/stylex/ui/label"
import { Switch } from "@shadcn-solid/stylex/ui/switch"

export default function SwitchDemo() {
  return (
    <div {...stylex.attrs(styles.row)}>
      <Switch id="sx-airplane-mode" />
      <Label for="sx-airplane-mode" xstyle={styles.spaced}>
        Airplane Mode
      </Label>
    </div>
  )
}

const styles = stylex.create({
  row: { display: "flex", alignItems: "center" },
  // `space-x-2`
  spaced: { marginInlineStart: "0.5rem" },
})
