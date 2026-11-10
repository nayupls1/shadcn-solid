import { Bookmark } from "lucide"
import * as stylex from "@stylexjs/stylex"
import { Icon } from "@shadcn-solid/icons"
import { Toggle } from "@shadcn-solid/stylex/ui/toggle"
import { colors } from "@shadcn-solid/stylex/tokens.stylex"
import { toggleMarker } from "@shadcn-solid/stylex/lib/markers.stylex"

export default function ToggleDemo() {
  return (
    <Toggle aria-label="Toggle bookmark" size="sm" variant="outline">
      <Icon icon={Bookmark} {...stylex.attrs(styles.icon)} />
      Bookmark
    </Toggle>
  )
}

const styles = stylex.create({
  // `group-aria-pressed/toggle:fill-foreground`
  icon: { fill: { default: null, [stylex.when.ancestor(":is([aria-pressed=true])", toggleMarker)]: colors.foreground } },
})
