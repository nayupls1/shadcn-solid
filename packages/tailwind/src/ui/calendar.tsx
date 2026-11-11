import { omit } from "solid-js"
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide"
import type { Locale } from "date-fns"
import { Icon } from "@shadcn-solid/icons"
import { cn } from "../lib/utils"
import {
  CalendarCore,
  useFocusOnFocused,
  type CalendarDayButtonProps,
  type CalendarFormatters,
  type CalendarOptions,
  type CalendarSlot,
  type DayModifiers,
} from "../lib/calendar-core"
import { Button, buttonVariants, type ButtonProps } from "./button"

// shadcn's Calendar without react-day-picker: `CalendarCore` (lib/calendar-core.tsx) renders
// react-day-picker v9's DOM and behaviour, and this file supplies shadcn's classes. `classNames`
// replaces a slot's (or modifier's) classes, like react-day-picker's prop.

type ModifierClass = "range_start" | "range_middle" | "range_end" | "today" | "outside" | "disabled" | "hidden" | "selected"

/** react-day-picker's `getDefaultClassNames()`: `rdp-<name>` marker classes. */
const rdp = (name: string) => `rdp-${name}`

type CalendarProps = CalendarOptions & {
  class?: string
  classNames?: Partial<Record<CalendarSlot | ModifierClass, string>>
  buttonVariant?: ButtonProps["variant"]
}

function Calendar(props: CalendarProps) {
  const rest = omit(props, "class", "classNames", "buttonVariant", "formatters")
  const captionLayout = () => props.captionLayout ?? "label"
  const buttonVariant = () => props.buttonVariant ?? "ghost"

  const defaults = (): Record<CalendarSlot | ModifierClass, string> => ({
    root: cn("w-fit", rdp("root")),
    months: cn("relative flex flex-col gap-4 md:flex-row", rdp("months")),
    month: cn("flex w-full flex-col gap-4", rdp("month")),
    nav: cn("absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1", rdp("nav")),
    button_previous: cn(
      buttonVariants({ variant: buttonVariant() }),
      "size-(--cell-size) p-0 select-none aria-disabled:opacity-50",
      rdp("button_previous")
    ),
    button_next: cn(
      buttonVariants({ variant: buttonVariant() }),
      "size-(--cell-size) p-0 select-none aria-disabled:opacity-50",
      rdp("button_next")
    ),
    month_caption: cn("flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)", rdp("month_caption")),
    dropdowns: cn("flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-sm font-medium", rdp("dropdowns")),
    dropdown_root: cn("cn-calendar-dropdown-root relative rounded-(--cell-radius)", rdp("dropdown_root")),
    dropdown: cn("absolute inset-0 bg-popover opacity-0", rdp("dropdown")),
    caption_label: cn(
      "font-medium select-none",
      captionLayout() === "label"
        ? "cn-calendar-caption text-sm"
        : "cn-calendar-caption-label flex items-center gap-1 rounded-(--cell-radius) text-sm [&>svg]:size-3.5 [&>svg]:text-muted-foreground",
      rdp("caption_label")
    ),
    month_grid: cn("w-full border-collapse", rdp("month_grid")),
    weekdays: cn("flex", rdp("weekdays")),
    weekday: cn(
      "flex-1 rounded-(--cell-radius) text-[0.8rem] font-normal text-muted-foreground select-none",
      rdp("weekday")
    ),
    weeks: rdp("weeks"),
    week: cn("mt-2 flex w-full", rdp("week")),
    week_number_header: cn("w-(--cell-size) select-none", rdp("week_number_header")),
    week_number: cn("text-[0.8rem] text-muted-foreground select-none", rdp("week_number")),
    day: cn(
      "group/day relative aspect-square h-full w-full rounded-(--cell-radius) p-0 text-center select-none [&:last-child[data-selected=true]_button]:rounded-r-(--cell-radius)",
      props.showWeekNumber
        ? "[&:nth-child(2)[data-selected=true]_button]:rounded-l-(--cell-radius)"
        : "[&:first-child[data-selected=true]_button]:rounded-l-(--cell-radius)",
      rdp("day")
    ),
    range_start: cn(
      "relative isolate z-0 rounded-l-(--cell-radius) bg-muted after:absolute after:inset-y-0 after:right-0 after:w-4 after:bg-muted",
      rdp("range_start")
    ),
    range_middle: cn("rounded-none", rdp("range_middle")),
    range_end: cn(
      "relative isolate z-0 rounded-r-(--cell-radius) bg-muted after:absolute after:inset-y-0 after:left-0 after:w-4 after:bg-muted",
      rdp("range_end")
    ),
    today: cn("rounded-(--cell-radius) bg-muted text-foreground data-[selected=true]:rounded-none", rdp("today")),
    outside: cn("text-muted-foreground aria-selected:text-muted-foreground", rdp("outside")),
    disabled: cn("text-muted-foreground opacity-50", rdp("disabled")),
    hidden: cn("invisible", rdp("hidden")),
    selected: rdp("selected"),
  })
  const cls = (name: CalendarSlot | ModifierClass) => props.classNames?.[name] ?? defaults()[name]

  const slot = (name: CalendarSlot, modifiers?: DayModifiers) => {
    if (name === "root") {
      return {
        class: cn(
          cls("root"),
          "group/calendar bg-background p-3 [--cell-radius:var(--radius-md)] [--cell-size:--spacing(8)] in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent",
          String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
          String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
          props.class
        ),
      }
    }
    if (name === "day" && modifiers) {
      return {
        class: cn(
          cls("day"),
          modifiers.selected && cls("selected"),
          modifiers.disabled && cls("disabled"),
          modifiers.hidden && cls("hidden"),
          modifiers.outside && cls("outside"),
          modifiers.today && cls("today"),
          modifiers.range_start && cls("range_start"),
          modifiers.range_middle && cls("range_middle"),
          modifiers.range_end && cls("range_end")
        ),
      }
    }
    return { class: cls(name) }
  }

  const formatters = (): CalendarFormatters => ({
    formatMonthDropdown: (date, { locale }) => date.toLocaleString(locale?.code, { month: "short" }),
    ...props.formatters,
  })

  return (
    <CalendarCore
      {...(rest as CalendarOptions)}
      formatters={formatters()}
      rootAttrs={{ "data-slot": "calendar" }}
      view={{
        slot,
        Chevron: (p) => {
          if (p.orientation === "left") return <Icon icon={ChevronLeft} class={cn("cn-rtl-flip size-4", p.class)} />
          if (p.orientation === "right") return <Icon icon={ChevronRight} class={cn("cn-rtl-flip size-4", p.class)} />
          return <Icon icon={ChevronDown} class={cn("size-4", p.class)} />
        },
        DayButton: (p) => <CalendarDayButton {...p} />,
        WeekNumber: (p) => <div class="flex size-(--cell-size) items-center justify-center text-center">{p.children}</div>,
      }}
    />
  )
}

type CalendarDayButtonComponentProps = CalendarDayButtonProps & { class?: string; locale?: Partial<Locale> }

function CalendarDayButton(props: CalendarDayButtonComponentProps) {
  const rest = omit(props, "class", "day", "modifiers", "locale")
  let element: HTMLButtonElement | undefined
  useFocusOnFocused(props.modifiers, () => element)
  return (
    <Button
      ref={(el: HTMLButtonElement) => (element = el)}
      variant="ghost"
      size="icon"
      data-day={props.day.date.toLocaleDateString(props.locale?.code)}
      data-selected-single={String(
        props.modifiers.selected &&
          !props.modifiers.range_start &&
          !props.modifiers.range_end &&
          !props.modifiers.range_middle
      )}
      data-range-start={String(props.modifiers.range_start)}
      data-range-end={String(props.modifiers.range_end)}
      data-range-middle={String(props.modifiers.range_middle)}
      class={cn(
        "relative isolate z-10 flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 border-0 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-[3px] group-data-[focused=true]/day:ring-ring/50 data-[range-end=true]:rounded-(--cell-radius) data-[range-end=true]:rounded-r-(--cell-radius) data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-muted data-[range-middle=true]:text-foreground data-[range-start=true]:rounded-(--cell-radius) data-[range-start=true]:rounded-l-(--cell-radius) data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground dark:hover:text-foreground [&>span]:text-xs [&>span]:opacity-70",
        rdp("day_button"),
        props.class
      )}
      {...rest}
    />
  )
}

export { Calendar, CalendarDayButton, type CalendarProps }
export type { DateRange, Matcher } from "../lib/calendar-core"
