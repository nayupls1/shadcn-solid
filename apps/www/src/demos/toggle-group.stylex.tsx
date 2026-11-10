import { Bold, Italic, Underline } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { ToggleGroup, ToggleGroupItem } from "@shadcn-solid/stylex/ui/toggle-group"

export default function ToggleGroupDemo() {
  return (
    <ToggleGroup variant="outline" multiple>
      <ToggleGroupItem value="bold" aria-label="Toggle bold">
        <Icon icon={Bold} />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Toggle italic">
        <Icon icon={Italic} />
      </ToggleGroupItem>
      <ToggleGroupItem value="strikethrough" aria-label="Toggle strikethrough">
        <Icon icon={Underline} />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
