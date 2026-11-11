import { createSignal, For, Show, type ComponentProps } from "solid-js"
import {
  AudioWaveform,
  BadgeCheck,
  Bell,
  BookOpen,
  Bot,
  ChevronRight,
  ChevronsUpDown,
  Command,
  CreditCard,
  Folder,
  Forward,
  Frame,
  GalleryVerticalEnd,
  LogOut,
  Map,
  MoreHorizontal,
  PieChart,
  Plus,
  Settings2,
  Sparkles,
  SquareTerminal,
  Trash2,
  type IconNode,
} from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { Avatar, AvatarFallback, AvatarImage } from "@shadcn-solid/tailwind/ui/avatar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@shadcn-solid/tailwind/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@shadcn-solid/tailwind/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@shadcn-solid/tailwind/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    { name: "Acme Inc", logo: GalleryVerticalEnd, plan: "Enterprise" },
    { name: "Acme Corp.", logo: AudioWaveform, plan: "Startup" },
    { name: "Evil Corp.", logo: Command, plan: "Free" },
  ],
  navMain: [
    {
      title: "Playground",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        { title: "History", url: "#" },
        { title: "Starred", url: "#" },
        { title: "Settings", url: "#" },
      ],
    },
    {
      title: "Models",
      url: "#",
      icon: Bot,
      items: [
        { title: "Genesis", url: "#" },
        { title: "Explorer", url: "#" },
        { title: "Quantum", url: "#" },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        { title: "Introduction", url: "#" },
        { title: "Get Started", url: "#" },
        { title: "Tutorials", url: "#" },
        { title: "Changelog", url: "#" },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        { title: "General", url: "#" },
        { title: "Team", url: "#" },
        { title: "Billing", url: "#" },
        { title: "Limits", url: "#" },
      ],
    },
  ],
  projects: [
    { name: "Design Engineering", url: "#", icon: Frame },
    { name: "Sales & Marketing", url: "#", icon: PieChart },
    { name: "Travel", url: "#", icon: Map },
  ],
}

type MenuButtonProps = ComponentProps<typeof SidebarMenuButton>

function TeamSwitcher(props: { teams: { name: string; logo: IconNode; plan: string }[] }) {
  const sidebar = useSidebar()
  const [activeTeam, setActiveTeam] = createSignal(props.teams[0])

  return (
    <Show when={activeTeam()}>
      {(team) => (
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={(p) => (
                  <SidebarMenuButton
                    {...(p as MenuButtonProps)}
                    size="lg"
                    class="data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground"
                  />
                )}
              >
                <div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Icon icon={team().logo} class="size-4" />
                </div>
                <div class="grid flex-1 text-left text-sm leading-tight">
                  <span class="truncate font-medium">{team().name}</span>
                  <span class="truncate text-xs">{team().plan}</span>
                </div>
                <Icon icon={ChevronsUpDown} class="ml-auto" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                class="w-(--anchor-width) min-w-56 rounded-lg"
                align="start"
                side={sidebar.isMobile ? "bottom" : "right"}
                sideOffset={4}
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel class="text-xs text-muted-foreground">Teams</DropdownMenuLabel>
                  <For each={props.teams}>
                    {(item, index) => (
                      <DropdownMenuItem onClick={() => setActiveTeam(item)} class="gap-2 p-2">
                        <div class="flex size-6 items-center justify-center rounded-md border">
                          <Icon icon={item.logo} class="size-3.5 shrink-0" />
                        </div>
                        {item.name}
                        <DropdownMenuShortcut>⌘{index() + 1}</DropdownMenuShortcut>
                      </DropdownMenuItem>
                    )}
                  </For>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem class="gap-2 p-2">
                    <div class="flex size-6 items-center justify-center rounded-md border bg-transparent">
                      <Icon icon={Plus} class="size-4" />
                    </div>
                    <div class="font-medium text-muted-foreground">Add team</div>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      )}
    </Show>
  )
}

function NavMain(props: {
  items: {
    title: string
    url: string
    icon?: IconNode
    isActive?: boolean
    items?: { title: string; url: string }[]
  }[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        <For each={props.items}>
          {(item) => (
            <Collapsible defaultOpen={item.isActive} class="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger
                  render={(p) => <SidebarMenuButton {...(p as MenuButtonProps)} tooltip={item.title} />}
                >
                  <Show when={item.icon}>{(icon) => <Icon icon={icon()} />}</Show>
                  <span>{item.title}</span>
                  <Icon
                    icon={ChevronRight}
                    class="ml-auto transition-transform duration-200 group-data-open/collapsible:rotate-90"
                  />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <For each={item.items}>
                      {(subItem) => (
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton render={<a href={subItem.url} />}>
                            <span>{subItem.title}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )}
                    </For>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )}
        </For>
      </SidebarMenu>
    </SidebarGroup>
  )
}

function NavProjects(props: { projects: { name: string; url: string; icon: IconNode }[] }) {
  const sidebar = useSidebar()

  return (
    <SidebarGroup class="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <SidebarMenu>
        <For each={props.projects}>
          {(item) => (
            <SidebarMenuItem>
              <SidebarMenuButton render={<a href={item.url} />}>
                <Icon icon={item.icon} />
                <span>{item.name}</span>
              </SidebarMenuButton>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={(p) => (
                    <SidebarMenuAction {...(p as ComponentProps<typeof SidebarMenuAction>)} showOnHover />
                  )}
                >
                  <Icon icon={MoreHorizontal} />
                  <span class="sr-only">More</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  class="w-48 rounded-lg"
                  side={sidebar.isMobile ? "bottom" : "right"}
                  align={sidebar.isMobile ? "end" : "start"}
                >
                  <DropdownMenuItem>
                    <Icon icon={Folder} class="text-muted-foreground" />
                    <span>View Project</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Icon icon={Forward} class="text-muted-foreground" />
                    <span>Share Project</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Icon icon={Trash2} class="text-muted-foreground" />
                    <span>Delete Project</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          )}
        </For>
        <SidebarMenuItem>
          <SidebarMenuButton class="text-sidebar-foreground/70">
            <Icon icon={MoreHorizontal} class="text-sidebar-foreground/70" />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}

function NavUser(props: { user: { name: string; email: string; avatar: string } }) {
  const sidebar = useSidebar()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={(p) => (
              <SidebarMenuButton
                {...(p as MenuButtonProps)}
                size="lg"
                class="data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground"
              />
            )}
          >
            <Avatar class="h-8 w-8 rounded-lg">
              <AvatarImage src={props.user.avatar} alt={props.user.name} />
              <AvatarFallback class="rounded-lg">CN</AvatarFallback>
            </Avatar>
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-medium">{props.user.name}</span>
              <span class="truncate text-xs">{props.user.email}</span>
            </div>
            <Icon icon={ChevronsUpDown} class="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            class="w-(--anchor-width) min-w-56 rounded-lg"
            side={sidebar.isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel class="p-0 font-normal">
                <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar class="h-8 w-8 rounded-lg">
                    <AvatarImage src={props.user.avatar} alt={props.user.name} />
                    <AvatarFallback class="rounded-lg">CN</AvatarFallback>
                  </Avatar>
                  <div class="grid flex-1 text-left text-sm leading-tight">
                    <span class="truncate font-medium">{props.user.name}</span>
                    <span class="truncate text-xs">{props.user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Icon icon={Sparkles} />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Icon icon={BadgeCheck} />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Icon icon={CreditCard} />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Icon icon={Bell} />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Icon icon={LogOut} />
                Log out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

/**
 * shadcn shows this demo full-page in an iframe. Here it sits in a box: `transform` makes the box the
 * containing block of the sidebar's `position: fixed` container, and the provider/sidebar fill its height.
 */
export default function AppSidebar() {
  return (
    <div class="h-[600px] w-full overflow-hidden rounded-lg border [transform:translateZ(0)]">
      <SidebarProvider class="h-full min-h-0">
        <Sidebar collapsible="icon" class="h-full">
          <SidebarHeader>
            <TeamSwitcher teams={data.teams} />
          </SidebarHeader>
          <SidebarContent>
            <NavMain items={data.navMain} />
            <NavProjects projects={data.projects} />
          </SidebarContent>
          <SidebarFooter>
            <NavUser user={data.user} />
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
        <SidebarInset>
          <header class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div class="flex items-center gap-2 px-4">
              <SidebarTrigger class="-ml-1" />
            </div>
          </header>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
