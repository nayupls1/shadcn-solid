import { Checkbox } from "@shadcn-solid/tailwind/ui/checkbox"
import { Label } from "@shadcn-solid/tailwind/ui/label"

export default function LabelDemo() {
  return (
    <div class="flex gap-2">
      <Checkbox id="terms" />
      <Label for="terms">Accept terms and conditions</Label>
    </div>
  )
}
