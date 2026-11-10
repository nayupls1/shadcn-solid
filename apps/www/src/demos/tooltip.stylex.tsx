import { Button, type ButtonProps } from "@shadcn-solid/stylex/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@shadcn-solid/stylex/ui/tooltip"

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
