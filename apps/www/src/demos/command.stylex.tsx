import { Calculator, Calendar, CreditCard, Settings, Smile, User } from "lucide"
import * as stylex from "@stylexjs/stylex"
import { Icon } from "@shadcn-solid/icons"
import { colors, radius } from "@shadcn-solid/stylex/tokens.stylex"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@shadcn-solid/stylex/ui/command"

export default function CommandDemo() {
  return (
    <Command xstyle={styles.command}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>
            <Icon icon={Calendar} {...stylex.attrs(styles.icon)} />
            <span>Calendar</span>
          </CommandItem>
          <CommandItem>
            <Icon icon={Smile} {...stylex.attrs(styles.icon)} />
            <span>Search Emoji</span>
          </CommandItem>
          <CommandItem disabled>
            <Icon icon={Calculator} {...stylex.attrs(styles.icon)} />
            <span>Calculator</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem>
            <Icon icon={User} {...stylex.attrs(styles.icon)} />
            <span>Profile</span>
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <Icon icon={CreditCard} {...stylex.attrs(styles.icon)} />
            <span>Billing</span>
            <CommandShortcut>⌘B</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <Icon icon={Settings} {...stylex.attrs(styles.icon)} />
            <span>Settings</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  )
}

const styles = stylex.create({
  command: {
    maxWidth: "24rem",
    borderRadius: radius.lg,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: colors.border,
  },
  // shadcn's item styles its icons with `[&_svg]:shrink-0`; StyleX can't reach descendants.
  icon: { flexShrink: 0, pointerEvents: "none" },
})
