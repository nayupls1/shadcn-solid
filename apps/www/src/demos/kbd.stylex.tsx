import * as stylex from "@stylexjs/stylex"
import { Kbd, KbdGroup } from "@shadcn-solid/stylex/ui/kbd"

export default function KbdDemo() {
  return (
    <div {...stylex.attrs(styles.root)}>
      <KbdGroup>
        <Kbd>⌘</Kbd>
        <Kbd>⇧</Kbd>
        <Kbd>⌥</Kbd>
        <Kbd>⌃</Kbd>
      </KbdGroup>
      <KbdGroup>
        <Kbd>Ctrl</Kbd>
        <span>+</span>
        <Kbd>B</Kbd>
      </KbdGroup>
    </div>
  )
}

const styles = stylex.create({
  root: { display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" },
})
