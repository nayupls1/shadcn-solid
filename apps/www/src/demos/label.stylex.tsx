import * as stylex from "@stylexjs/stylex"
import { Checkbox } from "@shadcn-solid/stylex/ui/checkbox"
import { Label } from "@shadcn-solid/stylex/ui/label"

export default function LabelDemo() {
  return (
    <div {...stylex.attrs(styles.root)}>
      <Checkbox id="terms-sx" />
      <Label for="terms-sx">Accept terms and conditions</Label>
    </div>
  )
}

const styles = stylex.create({
  root: { display: "flex", gap: "0.5rem" },
})
