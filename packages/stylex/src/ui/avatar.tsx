import { omit } from "solid-js"
import type { ComponentProps } from "@solidjs/web"
import * as stylex from "@stylexjs/stylex"
import { Avatar as AvatarPrimitive } from "base-ui-solidjs/avatar"
import { colors } from "../tokens.stylex"
import { avatarGroupMarker, avatarMarker } from "../lib/markers/avatar.stylex"
import { cx } from "../lib/utils"

// Port of shadcn/ui's base-vega `avatar` (see the Tailwind variant for the source classes).
// Tailwind's `group/avatar` and `group/avatar-group` become StyleX markers: `Avatar` and `AvatarGroup`
// carry them, and the parts read the group's `data-size` (or `:has([data-size])`) through
// `stylex.when.ancestor`. The group's child selectors (`-space-x-2`, `*:data-[slot=avatar]:ring-2`)
// are moved onto `Avatar`/`AvatarGroupCount` themselves, conditioned on being inside a group.

const RING_BACKGROUND = `0 0 0 2px ${colors.background}`

const styles = stylex.create({
  avatar: {
    position: "relative",
    display: "flex",
    width: { default: "2rem", ":is([data-size=lg])": "2.5rem", ":is([data-size=sm])": "1.5rem" },
    height: { default: "2rem", ":is([data-size=lg])": "2.5rem", ":is([data-size=sm])": "1.5rem" },
    flexShrink: 0,
    borderRadius: "9999px",
    userSelect: "none",
    // AvatarGroup's `-space-x-2` and `*:data-[slot=avatar]:ring-2 ring-background`.
    marginInlineEnd: { default: null, [stylex.when.ancestor(":is(*)", avatarGroupMarker)]: { default: null, ":not(:last-child)": "-0.5rem" } },
    boxShadow: { default: null, [stylex.when.ancestor(":is(*)", avatarGroupMarker)]: RING_BACKGROUND },
    "::after": {
      content: "''",
      position: "absolute",
      inset: 0,
      borderRadius: "9999px",
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: colors.border,
      // `mix-blend-darken dark:mix-blend-lighten`. `light-dark()` only takes colors, so this uses the
      // same switch lightningcss compiles `light-dark()` to (the `--lightningcss-light/dark` variables
      // that the theme's `color-scheme` styles set).
      mixBlendMode: "var(--lightningcss-light, darken) var(--lightningcss-dark, lighten)",
    },
  },
  image: {
    aspectRatio: "1 / 1",
    width: "100%",
    height: "100%",
    borderRadius: "9999px",
    objectFit: "cover",
  },
  fallback: {
    display: "flex",
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "9999px",
    backgroundColor: colors.muted,
    fontSize: { default: "0.875rem", [stylex.when.ancestor(":is([data-size=sm])", avatarMarker)]: "0.75rem" },
    lineHeight: { default: "1.25rem", [stylex.when.ancestor(":is([data-size=sm])", avatarMarker)]: "1rem" },
    color: colors.mutedForeground,
  },
  // `[&>svg]:size-2` / `group-data-[size=sm]/avatar:[&>svg]:hidden` style the consumer's icon, which
  // StyleX can't reach: pass `size={8}` to the `Icon` (and leave it out for small avatars).
  badge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    zIndex: 10,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "9999px",
    backgroundColor: colors.primary,
    color: colors.primaryForeground,
    backgroundBlendMode: "color",
    boxShadow: RING_BACKGROUND,
    userSelect: "none",
    width: { default: null, [stylex.when.ancestor(":is([data-size=sm])", avatarMarker)]: "0.5rem", [stylex.when.ancestor(":is([data-size=default])", avatarMarker)]: "0.625rem", [stylex.when.ancestor(":is([data-size=lg])", avatarMarker)]: "0.75rem" },
    height: { default: null, [stylex.when.ancestor(":is([data-size=sm])", avatarMarker)]: "0.5rem", [stylex.when.ancestor(":is([data-size=default])", avatarMarker)]: "0.625rem", [stylex.when.ancestor(":is([data-size=lg])", avatarMarker)]: "0.75rem" },
  },
  group: {
    display: "flex",
  },
  // `[&>svg]:size-4` (5 / 3 with lg / sm avatars): `Icon` defaults to 16px; size it yourself otherwise.
  groupCount: {
    position: "relative",
    display: "flex",
    width: { default: "2rem", [stylex.when.ancestor(":has([data-size=lg])", avatarGroupMarker)]: "2.5rem", [stylex.when.ancestor(":has([data-size=sm])", avatarGroupMarker)]: "1.5rem" },
    height: { default: "2rem", [stylex.when.ancestor(":has([data-size=lg])", avatarGroupMarker)]: "2.5rem", [stylex.when.ancestor(":has([data-size=sm])", avatarGroupMarker)]: "1.5rem" },
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "9999px",
    backgroundColor: colors.muted,
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    color: colors.mutedForeground,
    boxShadow: RING_BACKGROUND,
    marginInlineEnd: { default: null, [stylex.when.ancestor(":is(*)", avatarGroupMarker)]: { default: null, ":not(:last-child)": "-0.5rem" } },
  },
})

type XStyle = { class?: string; xstyle?: stylex.StyleXStyles }

type AvatarProps = Omit<AvatarPrimitive.Root.Props, "class"> &
  XStyle & {
    size?: "default" | "sm" | "lg"
  }

function Avatar(props: AvatarProps) {
  const rest = omit(props, "class", "xstyle", "size")
  const attrs = () => stylex.attrs(avatarMarker, styles.avatar, props.xstyle)
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={props.size ?? "default"}
      {...rest}
      class={cx(attrs().class, props.class)}
    />
  )
}

type AvatarImageProps = Omit<AvatarPrimitive.Image.Props, "class"> & XStyle

function AvatarImage(props: AvatarImageProps) {
  const rest = omit(props, "class", "xstyle")
  const attrs = () => stylex.attrs(styles.image, props.xstyle)
  return <AvatarPrimitive.Image data-slot="avatar-image" {...rest} class={cx(attrs().class, props.class)} />
}

type AvatarFallbackProps = Omit<AvatarPrimitive.Fallback.Props, "class"> & XStyle

function AvatarFallback(props: AvatarFallbackProps) {
  const rest = omit(props, "class", "xstyle")
  const attrs = () => stylex.attrs(styles.fallback, props.xstyle)
  return <AvatarPrimitive.Fallback data-slot="avatar-fallback" {...rest} class={cx(attrs().class, props.class)} />
}

type SpanProps = Omit<ComponentProps<"span">, "class"> & XStyle

function AvatarBadge(props: SpanProps) {
  const rest = omit(props, "class", "xstyle")
  const attrs = () => stylex.attrs(styles.badge, props.xstyle)
  return <span data-slot="avatar-badge" {...rest} class={cx(attrs().class, props.class)} />
}

type DivProps = Omit<ComponentProps<"div">, "class"> & XStyle

function AvatarGroup(props: DivProps) {
  const rest = omit(props, "class", "xstyle")
  const attrs = () => stylex.attrs(avatarGroupMarker, styles.group, props.xstyle)
  return <div data-slot="avatar-group" {...rest} class={cx(attrs().class, props.class)} />
}

function AvatarGroupCount(props: DivProps) {
  const rest = omit(props, "class", "xstyle")
  const attrs = () => stylex.attrs(styles.groupCount, props.xstyle)
  return <div data-slot="avatar-group-count" {...rest} class={cx(attrs().class, props.class)} />
}

export { Avatar, AvatarImage, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarBadge }
