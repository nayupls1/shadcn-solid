import { Bookmark } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { Toggle } from "@shadcn-solid/tailwind/ui/toggle"

export default function ToggleDemo() {
  return (
    <Toggle aria-label="Toggle bookmark" size="sm" variant="outline">
      <Icon icon={Bookmark} class="group-aria-pressed/toggle:fill-foreground" />
      Bookmark
    </Toggle>
  )
}
