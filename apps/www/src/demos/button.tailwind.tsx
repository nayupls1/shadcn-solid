import { ArrowRight, Plus } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { Button } from "@shadcn-solid/tailwind/ui/button"

export default function ButtonDemo() {
  return (
    <div class="flex flex-col items-center gap-4">
      <div class="flex flex-wrap items-center justify-center gap-2">
        <Button>Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="link">Link</Button>
      </div>
      <div class="flex flex-wrap items-center justify-center gap-2">
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
