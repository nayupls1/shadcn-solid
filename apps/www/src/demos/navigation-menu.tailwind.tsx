import { For, omit } from "solid-js"
import type { ComponentProps, JSX } from "@solidjs/web"
import { CircleAlert, CircleCheck, CircleDashed } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@shadcn-solid/tailwind/ui/navigation-menu"

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
            <ul class="w-96">
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
        <NavigationMenuItem class="hidden md:flex">
          <NavigationMenuTrigger>Components</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul class="grid w-[400px] gap-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
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
            <ul class="grid w-[200px]">
              <li>
                <NavigationMenuLink
                  render={<a href="#" class="flex-row items-center gap-2" />}
                >
                  <Icon icon={CircleAlert} />
                  Backlog
                </NavigationMenuLink>
                <NavigationMenuLink
                  render={<a href="#" class="flex-row items-center gap-2" />}
                >
                  <Icon icon={CircleDashed} />
                  To Do
                </NavigationMenuLink>
                <NavigationMenuLink
                  render={<a href="#" class="flex-row items-center gap-2" />}
                >
                  <Icon icon={CircleCheck} />
                  Done
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink render={<a href="/docs" />} class={navigationMenuTriggerStyle()}>
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
        <div class="flex flex-col gap-1 text-sm">
          <div class="leading-none font-medium">{props.title}</div>
          <div class="line-clamp-2 text-muted-foreground">{props.children}</div>
        </div>
      </NavigationMenuLink>
    </li>
  )
}
