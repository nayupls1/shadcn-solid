import { Button, type ButtonProps } from "@shadcn-solid/tailwind/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@shadcn-solid/tailwind/ui/tooltip"

export default function TooltipDemo() {
  return (
    <Tooltip>
      <TooltipTrigger render={(p) => <Button {...(p as ButtonProps)} variant="outline" />}>Hover</TooltipTrigger>
      <TooltipContent>
        <p>Add to library</p>
      </TooltipContent>
    </Tooltip>
  )
}
