import * as stylex from "@stylexjs/stylex"
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@shadcn-solid/stylex/ui/context-menu"
import { colors, radius } from "@shadcn-solid/stylex/tokens.stylex"

export default function ContextMenuDemo() {
  return (
    <ContextMenu>
      <ContextMenuTrigger xstyle={styles.trigger}>
        <span {...stylex.attrs(styles.fine)}>Right click here</span>
        <span {...stylex.attrs(styles.coarse)}>Long press here</span>
      </ContextMenuTrigger>
      <ContextMenuContent xstyle={styles.w48}>
        <ContextMenuGroup>
          <ContextMenuItem>
            Back
            <ContextMenuShortcut>⌘[</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem disabled>
            Forward
            <ContextMenuShortcut>⌘]</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem>
            Reload
            <ContextMenuShortcut>⌘R</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger>More Tools</ContextMenuSubTrigger>
            <ContextMenuSubContent xstyle={styles.w44}>
              <ContextMenuGroup>
                <ContextMenuItem>Save Page...</ContextMenuItem>
                <ContextMenuItem>Create Shortcut...</ContextMenuItem>
                <ContextMenuItem>Name Window...</ContextMenuItem>
              </ContextMenuGroup>
              <ContextMenuSeparator />
              <ContextMenuGroup>
                <ContextMenuItem>Developer Tools</ContextMenuItem>
              </ContextMenuGroup>
              <ContextMenuSeparator />
              <ContextMenuGroup>
                <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
              </ContextMenuGroup>
            </ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuGroup>
          <ContextMenuCheckboxItem checked>Show Bookmarks</ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem>Show Full URLs</ContextMenuCheckboxItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuGroup>
          <ContextMenuRadioGroup value="pedro">
            <ContextMenuLabel>People</ContextMenuLabel>
            <ContextMenuRadioItem value="pedro">Pedro Duarte</ContextMenuRadioItem>
            <ContextMenuRadioItem value="colm">Colm Tuite</ContextMenuRadioItem>
          </ContextMenuRadioGroup>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  )
}

const styles = stylex.create({
  trigger: {
    display: "flex",
    aspectRatio: "16 / 9",
    width: "100%",
    maxWidth: "20rem",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.xl,
    borderWidth: "1px",
    borderStyle: "dashed",
    borderColor: colors.border,
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
  },
  fine: { display: { default: "none", "@media (pointer: fine)": "inline-block" } },
  coarse: { display: { default: "none", "@media (pointer: coarse)": "inline-block" } },
  w48: { width: "12rem" },
  w44: { width: "11rem" },
})
