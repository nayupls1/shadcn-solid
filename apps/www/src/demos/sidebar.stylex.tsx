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
import * as stylex from "@stylexjs/stylex"
import { Icon } from "@shadcn-solid/icons"
import { a11y } from "@shadcn-solid/stylex/lib/a11y"
import { colors, radius } from "@shadcn-solid/stylex/tokens.stylex"
import { sidebarMarker } from "@shadcn-solid/stylex/lib/markers/sidebar.stylex"
import { Avatar, AvatarFallback, AvatarImage } from "@shadcn-solid/stylex/ui/avatar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@shadcn-solid/stylex/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@shadcn-solid/stylex/ui/dropdown-menu"
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
} from "@shadcn-solid/stylex/ui/sidebar"

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
                    xstyle={styles.popupOpen}
                  />
                )}
              >
                <div {...stylex.attrs(styles.logo)}>
                  <Icon icon={team().logo} />
                </div>
                <div {...stylex.attrs(styles.userText)}>
                  <span {...stylex.attrs(styles.truncate, styles.medium)}>{team().name}</span>
                  <span {...stylex.attrs(styles.truncate, styles.textXs)}>{team().plan}</span>
                </div>
                <Icon icon={ChevronsUpDown} {...stylex.attrs(styles.mlAuto, styles.shrink0)} />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                xstyle={styles.teamsContent}
                align="start"
                side={sidebar.isMobile ? "bottom" : "right"}
                sideOffset={4}
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel xstyle={styles.teamsLabel}>Teams</DropdownMenuLabel>
                  <For each={props.teams}>
                    {(item, index) => (
                      <DropdownMenuItem onClick={() => setActiveTeam(item)} xstyle={styles.teamItem}>
                        <div {...stylex.attrs(styles.teamLogo)}>
                          <Icon icon={item.logo} size={14} {...stylex.attrs(styles.shrink0)} />
                        </div>
                        {item.name}
                        <DropdownMenuShortcut>⌘{index() + 1}</DropdownMenuShortcut>
                      </DropdownMenuItem>
                    )}
                  </For>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem xstyle={styles.teamItem}>
                    <div {...stylex.attrs(styles.teamLogo)}>
                      <Icon icon={Plus} />
                    </div>
                    <div {...stylex.attrs(styles.medium, styles.muted)}>Add team</div>
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
            <Collapsible defaultOpen={item.isActive} class={stylex.attrs(stylex.defaultMarker()).class}>
              <SidebarMenuItem>
                <CollapsibleTrigger
                  render={(p) => <SidebarMenuButton {...(p as MenuButtonProps)} tooltip={item.title} />}
                >
                  <Show when={item.icon}>{(icon) => <Icon icon={icon()} {...stylex.attrs(styles.shrink0)} />}</Show>
                  <span>{item.title}</span>
                  <Icon icon={ChevronRight} {...stylex.attrs(styles.mlAuto, styles.shrink0, styles.chevron)} />
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
    <SidebarGroup xstyle={styles.projects}>
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <SidebarMenu>
        <For each={props.projects}>
          {(item) => (
            <SidebarMenuItem>
              <SidebarMenuButton render={<a href={item.url} />}>
                <Icon icon={item.icon} {...stylex.attrs(styles.shrink0)} />
                <span>{item.name}</span>
              </SidebarMenuButton>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={(p) => (
                    <SidebarMenuAction {...(p as ComponentProps<typeof SidebarMenuAction>)} showOnHover />
                  )}
                >
                  <Icon icon={MoreHorizontal} />
                  <span {...stylex.attrs(a11y.srOnly)}>More</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  xstyle={styles.projectsContent}
                  side={sidebar.isMobile ? "bottom" : "right"}
                  align={sidebar.isMobile ? "end" : "start"}
                >
                  <DropdownMenuItem>
                    <Icon icon={Folder} {...stylex.attrs(styles.muted)} />
                    <span>View Project</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Icon icon={Forward} {...stylex.attrs(styles.muted)} />
                    <span>Share Project</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Icon icon={Trash2} {...stylex.attrs(styles.muted)} />
                    <span>Delete Project</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          )}
        </For>
        <SidebarMenuItem>
          <SidebarMenuButton xstyle={styles.more}>
            <Icon icon={MoreHorizontal} {...stylex.attrs(styles.more, styles.shrink0)} />
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
                xstyle={styles.popupOpen}
              />
            )}
          >
            <Avatar xstyle={styles.avatar}>
              <AvatarImage src={props.user.avatar} alt={props.user.name} />
              <AvatarFallback xstyle={styles.rounded}>CN</AvatarFallback>
            </Avatar>
            <div {...stylex.attrs(styles.userText)}>
              <span {...stylex.attrs(styles.truncate, styles.medium)}>{props.user.name}</span>
              <span {...stylex.attrs(styles.truncate, styles.textXs)}>{props.user.email}</span>
            </div>
            <Icon icon={ChevronsUpDown} {...stylex.attrs(styles.mlAuto, styles.shrink0)} />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            xstyle={styles.teamsContent}
            side={sidebar.isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel xstyle={styles.userLabel}>
                <div {...stylex.attrs(styles.userLabelInner)}>
                  <Avatar xstyle={styles.avatar}>
                    <AvatarImage src={props.user.avatar} alt={props.user.name} />
                    <AvatarFallback xstyle={styles.rounded}>CN</AvatarFallback>
                  </Avatar>
                  <div {...stylex.attrs(styles.userText)}>
                    <span {...stylex.attrs(styles.truncate, styles.medium)}>{props.user.name}</span>
                    <span {...stylex.attrs(styles.truncate, styles.textXs)}>{props.user.email}</span>
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
    <div {...stylex.attrs(styles.frame)}>
      <SidebarProvider xstyle={[stylex.defaultMarker(), styles.provider]}>
        <Sidebar collapsible="icon" xstyle={styles.fullHeight}>
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
          <header {...stylex.attrs(styles.header)}>
            <div {...stylex.attrs(styles.headerInner)}>
              <SidebarTrigger xstyle={styles.trigger} />
            </div>
          </header>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}

const styles = stylex.create({
  frame: {
    height: "600px",
    width: "100%",
    overflow: "hidden",
    borderRadius: radius.lg,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: colors.border,
    transform: "translateZ(0)",
  },
  provider: { height: "100%", minHeight: 0 },
  fullHeight: { height: "100%" },
  popupOpen: {
    backgroundColor: { default: null, ":hover": colors.sidebarAccent, ":is([data-popup-open])": colors.sidebarAccent },
    color: { default: null, ":hover": colors.sidebarAccentForeground, ":is([data-popup-open])": colors.sidebarAccentForeground },
  },
  logo: {
    display: "flex",
    aspectRatio: "1 / 1",
    width: "2rem",
    height: "2rem",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.lg,
    backgroundColor: colors.sidebarPrimary,
    color: colors.sidebarPrimaryForeground,
  },
  userText: {
    display: "grid",
    flex: "1 1 0%",
    textAlign: "left",
    fontSize: "0.875rem",
    lineHeight: 1.25,
  },
  truncate: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  medium: { fontWeight: 500 },
  textXs: { fontSize: "0.75rem", lineHeight: "1rem" },
  mlAuto: { marginLeft: "auto" },
  shrink0: { flexShrink: 0 },
  muted: { color: colors.mutedForeground },
  teamsContent: { width: "var(--anchor-width)", minWidth: "14rem", borderRadius: radius.lg },
  teamsLabel: { fontSize: "0.75rem", lineHeight: "1rem", color: colors.mutedForeground },
  teamItem: { gap: "0.5rem", padding: "0.5rem" },
  teamLogo: {
    display: "flex",
    width: "1.5rem",
    height: "1.5rem",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: colors.border,
    backgroundColor: "transparent",
  },
  chevron: {
    transitionProperty: "transform",
    transitionDuration: "200ms",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    rotate: { default: null, [stylex.when.ancestor(":is([data-open])")]: "90deg" },
  },
  projects: {
    display: { default: "flex", [stylex.when.ancestor(":is([data-collapsible=icon])", sidebarMarker)]: "none" },
  },
  projectsContent: { width: "12rem", borderRadius: radius.lg },
  more: { color: `color-mix(in oklch, ${colors.sidebarForeground} 70%, transparent)` },
  avatar: { width: "2rem", height: "2rem", borderRadius: radius.lg },
  rounded: { borderRadius: radius.lg },
  userLabel: { padding: 0, fontWeight: 400 },
  userLabelInner: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    paddingInline: "0.25rem",
    paddingBlock: "0.375rem",
    textAlign: "left",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
  },
  header: {
    display: "flex",
    height: { default: "4rem", [stylex.when.ancestor(":has([data-collapsible=icon])")]: "3rem" },
    flexShrink: 0,
    alignItems: "center",
    gap: "0.5rem",
    transitionProperty: "width, height",
    transitionDuration: "150ms",
    transitionTimingFunction: "linear",
  },
  headerInner: { display: "flex", alignItems: "center", gap: "0.5rem", paddingInline: "1rem" },
  trigger: { marginLeft: "-0.25rem" },
})
