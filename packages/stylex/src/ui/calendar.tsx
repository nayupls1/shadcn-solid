import { omit } from "solid-js"
import * as stylex from "@stylexjs/stylex"
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide"
import type { Locale } from "date-fns"
import { Icon } from "@shadcn-solid/icons"
import { colors, radius } from "../tokens.stylex"
import { cx } from "../lib/utils"
import {
  CalendarCore,
  useFocusOnFocused,
  type CalendarDayButtonProps,
  type CalendarFormatters,
  type CalendarOptions,
  type CalendarSlot,
  type DayModifiers,
} from "../lib/calendar-core"
import { Button, buttonStyles, type ButtonVariant } from "./button"

// Port of shadcn/ui's base-vega `calendar` (see the Tailwind variant for the source classes).
// `CalendarCore` (lib/calendar-core.tsx) renders react-day-picker v9's DOM and behaviour; this
// file supplies the styles. The td's modifier classes become styles picked from the modifiers,
// and the td-dependent day-button styles (`group-data-[focused=true]/day:`,
// `[&:first-child[data-selected=true]_button]:`) become `:is(td… > *)` conditions on the button.
// `classNames` adds classes to a slot (StyleX styles can't be replaced by class names).

const focusRing = `0 0 0 3px color-mix(in oklch, ${colors.ring} 50%, transparent)`
const ghostHover = `light-dark(${colors.muted}, color-mix(in oklch, ${colors.muted} 50%, transparent))`
const notMarked =
  ":not([data-selected-single=true]):not([data-range-start=true]):not([data-range-end=true]):not([data-range-middle=true])"

const styles = stylex.create({
  root: {
    "--cell-radius": radius.md,
    "--cell-size": "2rem",
    width: "fit-content",
    backgroundColor: {
      default: colors.background,
      ":is([data-slot=card-content] *)": "transparent",
      ":is([data-slot=popover-content] *)": "transparent",
    },
    padding: "0.75rem",
  },
  months: {
    position: "relative",
    display: "flex",
    flexDirection: { default: "column", "@media (min-width: 48rem)": "row" },
    gap: "1rem",
  },
  month: { display: "flex", width: "100%", flexDirection: "column", gap: "1rem" },
  nav: {
    position: "absolute",
    insetInline: 0,
    top: 0,
    display: "flex",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "0.25rem",
  },
  navButton: {
    width: "var(--cell-size)",
    height: "var(--cell-size)",
    padding: 0,
    paddingLeft: 0,
    paddingRight: 0,
    userSelect: "none",
    opacity: { default: null, ":is([aria-disabled=true])": 0.5 },
  },
  monthCaption: {
    display: "flex",
    height: "var(--cell-size)",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingInline: "var(--cell-size)",
  },
  dropdowns: {
    display: "flex",
    height: "var(--cell-size)",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.375rem",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    fontWeight: 500,
  },
  dropdownRoot: { position: "relative", borderRadius: "var(--cell-radius)" },
  dropdown: {
    position: "absolute",
    inset: 0,
    backgroundColor: colors.popover,
    opacity: 0,
  },
  captionLabel: {
    fontWeight: 500,
    userSelect: "none",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
  },
  captionLabelDropdown: {
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
    borderRadius: "var(--cell-radius)",
  },
  captionChevron: { width: "0.875rem", height: "0.875rem", color: colors.mutedForeground },
  monthGrid: { width: "100%", borderCollapse: "collapse" },
  weekdays: { display: "flex" },
  weekday: {
    flex: "1 1 0%",
    borderRadius: "var(--cell-radius)",
    fontSize: "0.8rem",
    fontWeight: 400,
    color: colors.mutedForeground,
    userSelect: "none",
  },
  week: { marginTop: "0.5rem", display: "flex", width: "100%" },
  weekNumberHeader: { width: "var(--cell-size)", userSelect: "none" },
  weekNumber: { fontSize: "0.8rem", color: colors.mutedForeground, userSelect: "none" },
  weekNumberCell: {
    display: "flex",
    width: "var(--cell-size)",
    height: "var(--cell-size)",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },
  day: {
    position: "relative",
    aspectRatio: "1 / 1",
    height: "100%",
    width: "100%",
    borderRadius: "var(--cell-radius)",
    padding: 0,
    textAlign: "center",
    userSelect: "none",
  },
  rangeStart: {
    position: "relative",
    isolation: "isolate",
    zIndex: 0,
    borderTopLeftRadius: "var(--cell-radius)",
    borderBottomLeftRadius: "var(--cell-radius)",
    backgroundColor: colors.muted,
    "::after": {
      content: '""',
      position: "absolute",
      insetBlock: 0,
      right: 0,
      width: "1rem",
      backgroundColor: colors.muted,
    },
  },
  rangeMiddle: { borderRadius: 0 },
  rangeEnd: {
    position: "relative",
    isolation: "isolate",
    zIndex: 0,
    borderTopRightRadius: "var(--cell-radius)",
    borderBottomRightRadius: "var(--cell-radius)",
    backgroundColor: colors.muted,
    "::after": {
      content: '""',
      position: "absolute",
      insetBlock: 0,
      left: 0,
      width: "1rem",
      backgroundColor: colors.muted,
    },
  },
  today: {
    borderRadius: { default: "var(--cell-radius)", ":is([data-selected=true])": 0 },
    backgroundColor: colors.muted,
    color: colors.foreground,
  },
  outside: { color: colors.mutedForeground },
  disabled: { color: colors.mutedForeground, opacity: 0.5 },
  hidden: { visibility: "hidden" },
  dayButton: {
    position: "relative",
    isolation: "isolate",
    zIndex: 10,
    display: "flex",
    aspectRatio: "1 / 1",
    width: "100%",
    height: "auto",
    minWidth: "var(--cell-size)",
    flexDirection: "column",
    gap: "0.25rem",
    borderWidth: 0,
    lineHeight: 1,
    fontWeight: 400,
    borderRadius: {
      default: radius.md,
      ":is([data-range-start=true])": "var(--cell-radius)",
      ":is([data-range-end=true])": "var(--cell-radius)",
      ":is([data-range-middle=true])": 0,
    },
    // The td's `[&:first-child[data-selected=true]_button]` / `:last-child` corner rounding.
    borderTopLeftRadius: { default: null, ":is([data-selected=true]:first-child > *)": "var(--cell-radius)" },
    borderBottomLeftRadius: { default: null, ":is([data-selected=true]:first-child > *)": "var(--cell-radius)" },
    borderTopRightRadius: { default: null, ":is([data-selected=true]:last-child > *)": "var(--cell-radius)" },
    borderBottomRightRadius: { default: null, ":is([data-selected=true]:last-child > *)": "var(--cell-radius)" },
    backgroundColor: {
      default: "transparent",
      [`:hover${notMarked}`]: ghostHover,
      ":is([aria-expanded=true])": colors.muted,
      ":is([data-range-middle=true])": colors.muted,
      ":is([data-range-start=true])": colors.primary,
      ":is([data-range-end=true])": colors.primary,
      ":is([data-selected-single=true])": colors.primary,
    },
    color: {
      default: "inherit",
      [`:hover${notMarked}`]: colors.foreground,
      ":is([data-range-middle=true])": colors.foreground,
      ":is([data-range-start=true])": colors.primaryForeground,
      ":is([data-range-end=true])": colors.primaryForeground,
      ":is([data-selected-single=true])": colors.primaryForeground,
    },
    // `group-data-[focused=true]/day:` (the td is focused): ring + ring border.
    boxShadow: {
      default: null,
      ":focus-visible": focusRing,
      ":is([data-focused=true] > *)": focusRing,
    },
  },
  // With week numbers the first day is the td's second child.
  dayButtonWithWeekNumber: {
    borderTopLeftRadius: { default: null, ":is([data-selected=true]:nth-child(2) > *)": "var(--cell-radius)" },
    borderBottomLeftRadius: { default: null, ":is([data-selected=true]:nth-child(2) > *)": "var(--cell-radius)" },
  },
})

type ModifierClass = "range_start" | "range_middle" | "range_end" | "today" | "outside" | "disabled" | "hidden" | "selected"

type CalendarProps = CalendarOptions & {
  class?: string
  /** Extra classes per slot or modifier. */
  classNames?: Partial<Record<CalendarSlot | ModifierClass, string>>
  buttonVariant?: ButtonVariant | null
  /** StyleX overrides for the root, merged last. */
  xstyle?: stylex.StyleXStyles
}

function Calendar(props: CalendarProps) {
  const rest = omit(props, "class", "classNames", "buttonVariant", "formatters", "xstyle")
  const isLabel = () => (props.captionLayout ?? "label") === "label"
  const extra = (name: CalendarSlot | ModifierClass) => props.classNames?.[name]

  // Helpers keep the `stylex.attrs` calls to plain arguments (the compiler rejects inline logic).
  const navStyles = () => [...buttonStyles({ variant: props.buttonVariant ?? "ghost" }), styles.navButton]
  const captionStyles = () => (isLabel() ? [styles.captionLabel] : [styles.captionLabel, styles.captionLabelDropdown])
  const dayStyles = (m: DayModifiers) => {
    const list: stylex.StyleXStyles[] = [styles.day]
    if (m.disabled) list.push(styles.disabled)
    if (m.hidden) list.push(styles.hidden)
    if (m.outside) list.push(styles.outside)
    if (m.today) list.push(styles.today)
    if (m.range_start) list.push(styles.rangeStart)
    if (m.range_middle) list.push(styles.rangeMiddle)
    if (m.range_end) list.push(styles.rangeEnd)
    return list
  }
  const dayClasses = (m: DayModifiers) =>
    cx(
      extra("day"),
      m.selected && extra("selected"),
      m.disabled && extra("disabled"),
      m.hidden && extra("hidden"),
      m.outside && extra("outside"),
      m.today && extra("today"),
      m.range_start && extra("range_start"),
      m.range_middle && extra("range_middle"),
      m.range_end && extra("range_end")
    )

  const withClass = (a: ReturnType<typeof stylex.attrs>, ...classes: Array<string | false | undefined>) => ({
    class: cx(a.class, ...classes),
    style: a.style,
  })

  const slot = (name: CalendarSlot, modifiers?: DayModifiers) => {
    switch (name) {
      case "root":
        return withClass(stylex.attrs(styles.root, props.xstyle), extra("root"), props.class)
      case "months":
        return withClass(stylex.attrs(styles.months), extra("months"))
      case "month":
        return withClass(stylex.attrs(styles.month), extra("month"))
      case "nav":
        return withClass(stylex.attrs(styles.nav), extra("nav"))
      case "button_previous":
        return withClass(stylex.attrs(...navStyles()), extra("button_previous"))
      case "button_next":
        return withClass(stylex.attrs(...navStyles()), extra("button_next"))
      case "month_caption":
        return withClass(stylex.attrs(styles.monthCaption), extra("month_caption"))
      case "dropdowns":
        return withClass(stylex.attrs(styles.dropdowns), extra("dropdowns"))
      case "dropdown_root":
        return withClass(stylex.attrs(styles.dropdownRoot), extra("dropdown_root"))
      case "dropdown":
        return withClass(stylex.attrs(styles.dropdown), extra("dropdown"))
      case "caption_label":
        return withClass(stylex.attrs(...captionStyles()), extra("caption_label"))
      case "month_grid":
        return withClass(stylex.attrs(styles.monthGrid), extra("month_grid"))
      case "weekdays":
        return withClass(stylex.attrs(styles.weekdays), extra("weekdays"))
      case "weekday":
        return withClass(stylex.attrs(styles.weekday), extra("weekday"))
      case "week":
        return withClass(stylex.attrs(styles.week), extra("week"))
      case "week_number_header":
        return withClass(stylex.attrs(styles.weekNumberHeader), extra("week_number_header"))
      case "week_number":
        return withClass(stylex.attrs(styles.weekNumber), extra("week_number"))
      case "day":
        return modifiers ? withClass(stylex.attrs(...dayStyles(modifiers)), dayClasses(modifiers)) : {}
      default:
        return { class: extra(name) }
    }
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
          if (p.orientation === "left") return <Icon icon={ChevronLeft} class={p.class} />
          if (p.orientation === "right") return <Icon icon={ChevronRight} class={p.class} />
          return <Icon icon={ChevronDown} {...stylex.attrs(styles.captionChevron)} />
        },
        DayButton: (p) => <CalendarDayButton {...p} withWeekNumber={!!props.showWeekNumber} />,
        WeekNumber: (p) => <div {...stylex.attrs(styles.weekNumberCell)}>{p.children}</div>,
      }}
    />
  )
}

type CalendarDayButtonComponentProps = CalendarDayButtonProps & {
  class?: string
  locale?: Partial<Locale>
  withWeekNumber?: boolean
  /** StyleX overrides, merged last. */
  xstyle?: stylex.StyleXStyles
}

function CalendarDayButton(props: CalendarDayButtonComponentProps) {
  const rest = omit(props, "class", "day", "modifiers", "locale", "withWeekNumber", "xstyle")
  let element: HTMLButtonElement | undefined
  useFocusOnFocused(props.modifiers, () => element)
  const weekNumberStyle = () => (props.withWeekNumber ? styles.dayButtonWithWeekNumber : null)
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
      {...rest}
      class={props.class}
      xstyle={[styles.dayButton, weekNumberStyle(), props.xstyle]}
    />
  )
}

export { Calendar, CalendarDayButton, type CalendarProps }
export type { DateRange, Matcher } from "../lib/calendar-core"
