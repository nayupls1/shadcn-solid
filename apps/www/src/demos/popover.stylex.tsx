import * as stylex from "@stylexjs/stylex"
import { colors } from "@shadcn-solid/stylex/tokens.stylex"
import { Button, type ButtonProps } from "@shadcn-solid/stylex/ui/button"
import { Input } from "@shadcn-solid/stylex/ui/input"
import { Label } from "@shadcn-solid/stylex/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@shadcn-solid/stylex/ui/popover"

export default function PopoverDemo() {
  return (
    <Popover>
      <PopoverTrigger render={(p) => <Button {...(p as ButtonProps)} variant="outline" />}>Open popover</PopoverTrigger>
      <PopoverContent xstyle={styles.content}>
        <div {...stylex.attrs(styles.grid4)}>
          <div>
            <h4 {...stylex.attrs(styles.heading)}>Dimensions</h4>
            <p {...stylex.attrs(styles.text)}>Set the dimensions for the layer.</p>
          </div>
          <div {...stylex.attrs(styles.grid2)}>
            <div {...stylex.attrs(styles.row)}>
              <Label for="width">Width</Label>
              <Input id="width" defaultValue="100%" xstyle={styles.input} />
            </div>
            <div {...stylex.attrs(styles.row)}>
              <Label for="maxWidth">Max. width</Label>
              <Input id="maxWidth" defaultValue="300px" xstyle={styles.input} />
            </div>
            <div {...stylex.attrs(styles.row)}>
              <Label for="height">Height</Label>
              <Input id="height" defaultValue="25px" xstyle={styles.input} />
            </div>
            <div {...stylex.attrs(styles.row)}>
              <Label for="maxHeight">Max. height</Label>
              <Input id="maxHeight" defaultValue="none" xstyle={styles.input} />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

const styles = stylex.create({
  content: { width: "20rem" },
  grid4: { display: "grid", gap: "1rem" },
  grid2: { display: "grid", gap: "0.5rem" },
  heading: { lineHeight: 1, fontWeight: 500 },
  // `space-y-2` on the parent: margin above every child after the first.
  text: { marginTop: "0.5rem", fontSize: "0.875rem", lineHeight: "1.25rem", color: colors.mutedForeground },
  row: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", alignItems: "center", gap: "1rem" },
  input: { gridColumn: "span 2 / span 2", height: "2rem" },
})
