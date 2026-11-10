import { Button, type ButtonProps } from "@shadcn-solid/tailwind/ui/button"
import { Input } from "@shadcn-solid/tailwind/ui/input"
import { Label } from "@shadcn-solid/tailwind/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@shadcn-solid/tailwind/ui/popover"

export default function PopoverDemo() {
  return (
    <Popover>
      <PopoverTrigger render={(p) => <Button {...(p as ButtonProps)} variant="outline" />}>Open popover</PopoverTrigger>
      <PopoverContent class="w-80">
        <div class="grid gap-4">
          <div class="space-y-2">
            <h4 class="leading-none font-medium">Dimensions</h4>
            <p class="text-sm text-muted-foreground">Set the dimensions for the layer.</p>
          </div>
          <div class="grid gap-2">
            <div class="grid grid-cols-3 items-center gap-4">
              <Label for="width">Width</Label>
              <Input id="width" defaultValue="100%" class="col-span-2 h-8" />
            </div>
            <div class="grid grid-cols-3 items-center gap-4">
              <Label for="maxWidth">Max. width</Label>
              <Input id="maxWidth" defaultValue="300px" class="col-span-2 h-8" />
            </div>
            <div class="grid grid-cols-3 items-center gap-4">
              <Label for="height">Height</Label>
              <Input id="height" defaultValue="25px" class="col-span-2 h-8" />
            </div>
            <div class="grid grid-cols-3 items-center gap-4">
              <Label for="maxHeight">Max. height</Label>
              <Input id="maxHeight" defaultValue="none" class="col-span-2 h-8" />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
