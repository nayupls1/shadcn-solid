import { Calculator, Calendar, CreditCard, Settings, Smile, User } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@shadcn-solid/tailwind/ui/command"

export default function CommandDemo() {
  return (
    <Command class="max-w-sm rounded-lg border">
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>
            <Icon icon={Calendar} />
            <span>Calendar</span>
          </CommandItem>
          <CommandItem>
            <Icon icon={Smile} />
            <span>Search Emoji</span>
          </CommandItem>
          <CommandItem disabled>
            <Icon icon={Calculator} />
            <span>Calculator</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem>
            <Icon icon={User} />
            <span>Profile</span>
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <Icon icon={CreditCard} />
            <span>Billing</span>
            <CommandShortcut>⌘B</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <Icon icon={Settings} />
            <span>Settings</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
