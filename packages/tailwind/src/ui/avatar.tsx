import { omit } from "solid-js"
import type { JSX } from "@solidjs/web"
import { Avatar as AvatarPrimitive } from "base-ui-solidjs/avatar"
import { cn } from "../lib/utils"

type AvatarProps = Omit<AvatarPrimitive.Root.Props, "class"> & {
  class?: string
  size?: "default" | "sm" | "lg"
}

function Avatar(props: AvatarProps) {
  const rest = omit(props, "class", "size")
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={props.size ?? "default"}
      class={cn(
        "group/avatar relative flex size-8 shrink-0 rounded-full select-none after:absolute after:inset-0 after:rounded-full after:border after:border-border after:mix-blend-darken data-[size=lg]:size-10 data-[size=sm]:size-6 dark:after:mix-blend-lighten",
        props.class,
      )}
      {...rest}
    />
  )
}

type AvatarImageProps = Omit<AvatarPrimitive.Image.Props, "class"> & { class?: string }

function AvatarImage(props: AvatarImageProps) {
  const rest = omit(props, "class")
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      class={cn("aspect-square size-full rounded-full object-cover", props.class)}
      {...rest}
    />
  )
}

type AvatarFallbackProps = Omit<AvatarPrimitive.Fallback.Props, "class"> & { class?: string }

function AvatarFallback(props: AvatarFallbackProps) {
  const rest = omit(props, "class")
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      class={cn(
        "flex size-full items-center justify-center rounded-full bg-muted text-sm text-muted-foreground group-data-[size=sm]/avatar:text-xs",
        props.class,
      )}
      {...rest}
    />
  )
}

type SpanProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "class"> & { class?: string }
type DivProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class"> & { class?: string }

function AvatarBadge(props: SpanProps) {
  const rest = omit(props, "class")
  return (
    <span
      data-slot="avatar-badge"
      class={cn(
        "absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground bg-blend-color ring-2 ring-background select-none",
        "group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden",
        "group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2",
        "group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2",
        props.class,
      )}
      {...rest}
    />
  )
}

function AvatarGroup(props: DivProps) {
  const rest = omit(props, "class")
  return (
    <div
      data-slot="avatar-group"
      class={cn(
        "group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background",
        props.class,
      )}
      {...rest}
    />
  )
}

function AvatarGroupCount(props: DivProps) {
  const rest = omit(props, "class")
  return (
    <div
      data-slot="avatar-group-count"
      class={cn(
        "relative flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm text-muted-foreground ring-2 ring-background group-has-data-[size=lg]/avatar-group:size-10 group-has-data-[size=sm]/avatar-group:size-6 [&>svg]:size-4 group-has-data-[size=lg]/avatar-group:[&>svg]:size-5 group-has-data-[size=sm]/avatar-group:[&>svg]:size-3",
        props.class,
      )}
      {...rest}
    />
  )
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
