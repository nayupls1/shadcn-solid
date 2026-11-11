import { createSignal } from "solid-js"
import { Archive, ArrowLeft, CalendarPlus, Clock, Ellipsis, ListFilter, MailCheck, Tag, Trash2 } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { Button, type ButtonProps } from "@shadcn-solid/tailwind/ui/button"
import { ButtonGroup } from "@shadcn-solid/tailwind/ui/button-group"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@shadcn-solid/tailwind/ui/dropdown-menu"

export default function ButtonGroupDemo() {
  const [label, setLabel] = createSignal("personal")

  return (
    <ButtonGroup>
      <ButtonGroup class="hidden sm:flex">
        <Button variant="outline" size="icon" aria-label="Go Back">
          <Icon icon={ArrowLeft} />
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button variant="outline">Archive</Button>
        <Button variant="outline">Report</Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button variant="outline">Snooze</Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={(props) => (
              <Button variant="outline" size="icon" aria-label="More Options" {...(props as ButtonProps)} />
            )}
          >
            <Icon icon={Ellipsis} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-40">
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Icon icon={MailCheck} />
                Mark as Read
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Icon icon={Archive} />
                Archive
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Icon icon={Clock} />
                Snooze
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Icon icon={CalendarPlus} />
                Add to Calendar
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Icon icon={ListFilter} />
                Add to List
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Icon icon={Tag} />
                  Label As...
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup value={label()} onValueChange={(value) => setLabel(value as string)}>
                    <DropdownMenuRadioItem value="personal">Personal</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="work">Work</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="other">Other</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem variant="destructive">
                <Icon icon={Trash2} />
                Trash
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>
    </ButtonGroup>
  )
}
