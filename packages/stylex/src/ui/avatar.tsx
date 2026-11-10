import { createContext, omit, useContext } from "solid-js"
import type { JSX } from "@solidjs/web"
import * as stylex from "@stylexjs/stylex"
import { Avatar as AvatarPrimitive } from "base-ui-solidjs/avatar"
import { colors } from "../tokens.stylex"
import { avatarGroupMarker, avatarMarker } from "../lib/markers.stylex"
import { sxMerge } from "../lib/sx"

// Port of shadcn/ui's base-vega `avatar` (see the Tailwind variant for the source classes).
// `group/avatar` and `group/avatar-group` become named markers. The group's
// `-space-x-2 *:data-[slot=avatar]:ring-2` is applied by the avatars themselves through context.
// `[&>svg]` sizes in the badge and count apply to `Icon`s passed with `xstyle`/`size` instead.
// The ring's `mix-blend-darken`/`dark:mix-blend-lighten` is left out: StyleX has no dark-mode
// selector for non-color values, and the plain border overlay looks the same at this size.

const InGroupContext = createContext(false)


const styles = stylex.create({
  avatar: {
    position: "relative",
    display: "flex",
    width: { default: "2rem", ":is([data-size=lg])": "2.5rem", ":is([data-size=sm])": "1.5rem" },
    height: { default: "2rem", ":is([data-size=lg])": "2.5rem", ":is([data-size=sm])": "1.5rem" },
    flexShrink: 0,
    borderRadius: "9999px",
    userSelect: "none",
    "::after": {
      content: "''",
      position: "absolute",
      inset: 0,
      borderRadius: "9999px",
      borderWidth: 1,
      borderStyle: "solid",
      borderColor: colors.border,
    },
  },
  avatarInGroup: {
    marginInlineEnd: { default: "-0.5rem", ":last-child": 0 },
    boxShadow: `0 0 0 2px ${colors.background}`,
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
    fontSize: { default: "0.875rem", [stylex.when.ancestor("[data-size=sm]", avatarMarker)]: "0.75rem" },
    lineHeight: { default: "1.25rem", [stylex.when.ancestor("[data-size=sm]", avatarMarker)]: "1rem" },
    color: colors.mutedForeground,
  },
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
    boxShadow: `0 0 0 2px ${colors.background}`,
    userSelect: "none",
    width: { default: null, [stylex.when.ancestor("[data-size=sm]", avatarMarker)]: "0.5rem", [stylex.when.ancestor("[data-size=default]", avatarMarker)]: "0.625rem", [stylex.when.ancestor("[data-size=lg]", avatarMarker)]: "0.75rem" },
    height: { default: null, [stylex.when.ancestor("[data-size=sm]", avatarMarker)]: "0.5rem", [stylex.when.ancestor("[data-size=default]", avatarMarker)]: "0.625rem", [stylex.when.ancestor("[data-size=lg]", avatarMarker)]: "0.75rem" },
  },
  group: { display: "flex" },
  count: {
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
    boxShadow: `0 0 0 2px ${colors.background}`,
  },
})

type XStyle = { class?: string; xstyle?: stylex.StyleXStyles }

type AvatarProps = Omit<AvatarPrimitive.Root.Props, "class"> & XStyle & { size?: "default" | "sm" | "lg" }

function Avatar(props: AvatarProps) {
  const rest = omit(props, "class", "style", "size", "xstyle")
  const inGroup = useContext(InGroupContext)
  const a = () =>
    sxMerge([avatarMarker, styles.avatar, inGroup && styles.avatarInGroup, props.xstyle], props.class, props.style)
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={props.size ?? "default"}
      {...rest}
      class={a().class}
      style={a().style}
    />
  )
}

type AvatarImageProps = Omit<AvatarPrimitive.Image.Props, "class"> & XStyle

function AvatarImage(props: AvatarImageProps) {
  const rest = omit(props, "class", "style", "xstyle")
  const a = () => sxMerge([styles.image, props.xstyle], props.class, props.style)
  return <AvatarPrimitive.Image data-slot="avatar-image" {...rest} class={a().class} style={a().style} />
}

type AvatarFallbackProps = Omit<AvatarPrimitive.Fallback.Props, "class"> & XStyle

function AvatarFallback(props: AvatarFallbackProps) {
  const rest = omit(props, "class", "style", "xstyle")
  const a = () => sxMerge([styles.fallback, props.xstyle], props.class, props.style)
  return <AvatarPrimitive.Fallback data-slot="avatar-fallback" {...rest} class={a().class} style={a().style} />
}

type SpanProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "class"> & XStyle
type DivProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class"> & XStyle

function AvatarBadge(props: SpanProps) {
  const rest = omit(props, "class", "style", "xstyle")
  const a = () => sxMerge([styles.badge, props.xstyle], props.class, props.style)
  return <span data-slot="avatar-badge" {...rest} class={a().class} style={a().style} />
}

function AvatarGroup(props: DivProps) {
  const rest = omit(props, "class", "style", "xstyle")
  const a = () => sxMerge([avatarGroupMarker, styles.group, props.xstyle], props.class, props.style)
  return (
    <InGroupContext value={true}>
      <div data-slot="avatar-group" {...rest} class={a().class} style={a().style} />
    </InGroupContext>
  )
}

function AvatarGroupCount(props: DivProps) {
  const rest = omit(props, "class", "style", "xstyle")
  const a = () => sxMerge([styles.count, props.xstyle], props.class, props.style)
  return <div data-slot="avatar-group-count" {...rest} class={a().class} style={a().style} />
}

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarBadge,
  type AvatarProps,
  type AvatarImageProps,
  type AvatarFallbackProps,
}
