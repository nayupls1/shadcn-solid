import { ArrowRight, Plus } from "lucide"
import * as stylex from "@stylexjs/stylex"
import { Icon } from "@shadcn-solid/icons"
import { Button } from "@shadcn-solid/stylex/ui/button"

export default function ButtonDemo() {
  return (
    <div {...stylex.attrs(styles.column)}>
      <div {...stylex.attrs(styles.row)}>
        <Button>Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="link">Link</Button>
      </div>
      <div {...stylex.attrs(styles.row)}>
        <Button size="xs">Extra small</Button>
        <Button size="sm">Small</Button>
        <Button size="lg">
          Large <Icon icon={ArrowRight} data-icon="inline-end" />
        </Button>
        <Button size="icon" variant="outline" aria-label="Add">
          <Icon icon={Plus} />
        </Button>
        <Button disabled>Disabled</Button>
      </div>
    </div>
  )
}

const styles = stylex.create({
  column: { display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" },
  row: { display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "0.5rem" },
})
