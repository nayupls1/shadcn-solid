import { For, omit } from "solid-js"
import type { ComponentProps, JSX } from "@solidjs/web"
import { CircleAlert, CircleCheck, CircleDashed } from "lucide"
import * as stylex from "@stylexjs/stylex"
import { Icon } from "@shadcn-solid/icons"
import { colors } from "@shadcn-solid/stylex/tokens.stylex"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@shadcn-solid/stylex/ui/navigation-menu"

const components: { title: string; href: string; description: string }[] = [
  {
    title: "Alert Dialog",
    href: "/docs/primitives/alert-dialog",
    description: "A modal dialog that interrupts the user with important content and expects a response.",
  },
  {
    title: "Hover Card",
    href: "/docs/primitives/hover-card",
    description: "For sighted users to preview content available behind a link.",
  },
  {
    title: "Progress",
    href: "/docs/primitives/progress",
    description: "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
  },
  {
    title: "Scroll-area",
    href: "/docs/primitives/scroll-area",
    description: "Visually or semantically separates content.",
  },
  {
    title: "Tabs",
    href: "/docs/primitives/tabs",
    description: "A set of layered sections of content—known as tab panels—that are displayed one at a time.",
  },
  {
    title: "Tooltip",
    href: "/docs/primitives/tooltip",
    description:
      "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.",
  },
]

export default function NavigationMenuDemo() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul {...stylex.attrs(styles.w96)}>
              <ListItem href="/docs" title="Introduction">
                Re-usable components built with Tailwind CSS.
              </ListItem>
              <ListItem href="/docs/installation" title="Installation">
                How to install dependencies and structure your app.
              </ListItem>
              <ListItem href="/docs/primitives/typography" title="Typography">
                Styles for headings, paragraphs, lists...etc
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem xstyle={styles.mdFlex}>
          <NavigationMenuTrigger>Components</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul {...stylex.attrs(styles.componentsGrid)}>
              <For each={components}>
                {(component) => (
                  <ListItem title={component.title} href={component.href}>
                    {component.description}
                  </ListItem>
                )}
              </For>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>With Icon</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul {...stylex.attrs(styles.iconGrid)}>
              <li>
                <NavigationMenuLink
                  render={<a href="#" />} xstyle={styles.iconLink}
                >
                  <Icon icon={CircleAlert} />
                  Backlog
                </NavigationMenuLink>
                <NavigationMenuLink
                  render={<a href="#" />} xstyle={styles.iconLink}
                >
                  <Icon icon={CircleDashed} />
                  To Do
                </NavigationMenuLink>
                <NavigationMenuLink
                  render={<a href="#" />} xstyle={styles.iconLink}
                >
                  <Icon icon={CircleCheck} />
                  Done
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink render={<a href="/docs" />} xstyle={navigationMenuTriggerStyle()}>
            Docs
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

function ListItem(props: Omit<ComponentProps<"li">, "title"> & { title: JSX.Element; href: string }) {
  const rest = omit(props, "title", "children", "href")
  return (
    <li {...rest}>
      <NavigationMenuLink render={<a href={props.href} />}>
        <div {...stylex.attrs(styles.itemBody)}>
          <div {...stylex.attrs(styles.itemTitle)}>{props.title}</div>
          <div {...stylex.attrs(styles.itemDescription)}>{props.children}</div>
        </div>
      </NavigationMenuLink>
    </li>
  )
}

const styles = stylex.create({
  w96: { width: "24rem" },
  mdFlex: { display: { default: "none", "@media (min-width: 48rem)": "flex" } },
  componentsGrid: {
    display: "grid",
    width: { default: "400px", "@media (min-width: 48rem)": "500px", "@media (min-width: 64rem)": "600px" },
    gap: "0.5rem",
    gridTemplateColumns: { default: null, "@media (min-width: 48rem)": "repeat(2, minmax(0, 1fr))" },
  },
  iconGrid: { display: "grid", width: "200px" },
  iconLink: { flexDirection: "row", alignItems: "center", gap: "0.5rem" },
  itemBody: { display: "flex", flexDirection: "column", gap: "0.25rem", fontSize: "0.875rem", lineHeight: "1.25rem" },
  itemTitle: { lineHeight: 1, fontWeight: 500 },
  itemDescription: {
    overflow: "hidden",
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
    color: colors.mutedForeground,
  },
})
