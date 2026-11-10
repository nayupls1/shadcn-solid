import * as stylex from "@stylexjs/stylex"
import { Label } from "@shadcn-solid/stylex/ui/label"
import { RadioGroup, RadioGroupItem } from "@shadcn-solid/stylex/ui/radio-group"

export default function RadioGroupDemo() {
  return (
    <RadioGroup defaultValue="comfortable" xstyle={styles.fit}>
      <div {...stylex.attrs(styles.row)}>
        <RadioGroupItem value="default" id="sx-r1" />
        <Label for="sx-r1">Default</Label>
      </div>
      <div {...stylex.attrs(styles.row)}>
        <RadioGroupItem value="comfortable" id="sx-r2" />
        <Label for="sx-r2">Comfortable</Label>
      </div>
      <div {...stylex.attrs(styles.row)}>
        <RadioGroupItem value="compact" id="sx-r3" />
        <Label for="sx-r3">Compact</Label>
      </div>
    </RadioGroup>
  )
}

const styles = stylex.create({
  fit: { width: "fit-content" },
  row: { display: "flex", alignItems: "center", gap: "0.75rem" },
})
