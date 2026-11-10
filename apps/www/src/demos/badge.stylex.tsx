import * as stylex from "@stylexjs/stylex"
import { Badge } from "@shadcn-solid/stylex/ui/badge"

export default function BadgeDemo() {
  return (
    <div {...stylex.attrs(styles.root)}>
      <Badge>Badge</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  )
}

const styles = stylex.create({
  root: { display: "flex", width: "100%", flexWrap: "wrap", justifyContent: "center", gap: "0.5rem" },
})
