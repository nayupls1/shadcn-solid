import { Search } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@shadcn-solid/tailwind/ui/input-group"

export default function InputGroupDemo() {
  return (
    <InputGroup class="max-w-xs">
      <InputGroupInput placeholder="Search..." />
      <InputGroupAddon>
        <Icon icon={Search} />
      </InputGroupAddon>
      <InputGroupAddon align="inline-end">12 results</InputGroupAddon>
    </InputGroup>
  )
}
