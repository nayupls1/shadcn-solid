// Headless month grid for `Calendar`, replacing react-day-picker (React-only). It renders
// react-day-picker v9's DOM (slots, `data-*` attributes, roles) and follows its behaviour for
// selection (single, multiple, range with `addToRange`), month navigation, caption dropdowns and
// keyboard navigation. Styling comes from the caller through `view`.
//
// The same file lives in both packages (`@shadcn-solid/tailwind` and `@shadcn-solid/stylex`).
import { createEffect, createMemo, createSignal, For, Show, untrack } from "solid-js"
import type { JSX } from "@solidjs/web"
import {
  addDays,
  addMonths,
  addYears,
  differenceInCalendarDays,
  differenceInCalendarMonths,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  getWeek,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  max as maxDate,
  min as minDate,
  setMonth,
  setYear,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  type Locale,
} from "date-fns"

export type DateRange = { from: Date | undefined; to?: Date | undefined }

export type DateBefore = { before: Date }
export type DateAfter = { after: Date }
export type DateInterval = { before: Date; after: Date }
export type DayOfWeek = { dayOfWeek: number | number[] }

/** react-day-picker's day matchers. */
export type Matcher =
  | boolean
  | Date
  | Date[]
  | DateRange
  | DateBefore
  | DateAfter
  | DateInterval
  | DayOfWeek
  | ((date: Date) => boolean)

export type CaptionLayout = "label" | "dropdown" | "dropdown-months" | "dropdown-years"

export type CalendarFormatters = {
  formatCaption?: (month: Date, options: { locale?: Partial<Locale> }) => string
  formatMonthDropdown?: (month: Date, options: { locale?: Partial<Locale> }) => string
  formatYearDropdown?: (year: Date, options: { locale?: Partial<Locale> }) => string
  formatWeekdayName?: (weekday: Date, options: { locale?: Partial<Locale> }) => string
  formatDay?: (date: Date, options: { locale?: Partial<Locale> }) => string
  formatWeekNumber?: (weekNumber: number) => string
}

type CalendarBaseProps = {
  /** The month to display when first rendered (uncontrolled). */
  defaultMonth?: Date
  /** The displayed month (controlled); use with `onMonthChange`. */
  month?: Date
  onMonthChange?: (month: Date) => void
  /** The earliest month that can be navigated to. */
  startMonth?: Date
  /** The latest month that can be navigated to. */
  endMonth?: Date
  numberOfMonths?: number
  showOutsideDays?: boolean
  fixedWeeks?: boolean
  showWeekNumber?: boolean
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  locale?: Partial<Locale>
  disabled?: Matcher | Matcher[]
  hidden?: Matcher | Matcher[]
  captionLayout?: CaptionLayout
  /** The date treated as today. */
  today?: Date
  /** Whether a selected value can't be cleared by clicking it again. */
  required?: boolean
  /** Focus the selected day (or today) when mounted. */
  autoFocus?: boolean
  formatters?: CalendarFormatters
}

export type CalendarSingleProps = CalendarBaseProps & {
  mode: "single"
  selected?: Date | undefined
  onSelect?: (date: Date | undefined) => void
}
export type CalendarMultipleProps = CalendarBaseProps & {
  mode: "multiple"
  selected?: Date[] | undefined
  onSelect?: (dates: Date[] | undefined) => void
}
export type CalendarRangeProps = CalendarBaseProps & {
  mode: "range"
  selected?: DateRange | undefined
  onSelect?: (range: DateRange | undefined) => void
}
export type CalendarNoSelectionProps = CalendarBaseProps & {
  mode?: undefined
  selected?: undefined
  onSelect?: undefined
}

export type CalendarOptions = CalendarSingleProps | CalendarMultipleProps | CalendarRangeProps | CalendarNoSelectionProps

export type DayModifiers = {
  selected: boolean
  range_start: boolean
  range_middle: boolean
  range_end: boolean
  today: boolean
  outside: boolean
  disabled: boolean
  hidden: boolean
  focused: boolean
}

export type CalendarDay = {
  date: Date
  /** The month this day is displayed in (an outside day belongs to a neighbouring month). */
  displayMonth: Date
  outside: boolean
}

export type CalendarSlot =
  | "root"
  | "months"
  | "month"
  | "nav"
  | "button_previous"
  | "button_next"
  | "month_caption"
  | "dropdowns"
  | "dropdown_root"
  | "dropdown"
  | "caption_label"
  | "month_grid"
  | "weekdays"
  | "weekday"
  | "weeks"
  | "week"
  | "week_number_header"
  | "week_number"
  | "day"

export type SlotAttrs = { class?: string; style?: string | JSX.CSSProperties }

export type CalendarDayButtonProps = {
  day: CalendarDay
  modifiers: DayModifiers
  locale?: Partial<Locale>
  tabindex: number
  disabled: boolean
  "aria-label": string
  onClick: (event: MouseEvent) => void
  onFocus: (event: FocusEvent) => void
  onBlur: (event: FocusEvent) => void
  onKeyDown: (event: KeyboardEvent) => void
  children: JSX.Element
}

export type CalendarView = {
  /** Class and style for a slot; `day` also receives the day's modifiers. */
  slot: (name: CalendarSlot, modifiers?: DayModifiers) => SlotAttrs
  Chevron: (props: { orientation: "left" | "right" | "down"; class?: string }) => JSX.Element
  DayButton: (props: CalendarDayButtonProps) => JSX.Element
  /** Contents of a week-number cell. */
  WeekNumber: (props: { children: JSX.Element }) => JSX.Element
}

function matches(date: Date, matcher: Matcher | Matcher[] | undefined): boolean {
  if (matcher == null) return false
  if (Array.isArray(matcher)) return matcher.some((m) => matchOne(date, m as Matcher))
  return matchOne(date, matcher)
}

function matchOne(date: Date, m: Matcher): boolean {
  if (typeof m === "boolean") return m
  if (typeof m === "function") return m(date)
  if (m instanceof Date) return isSameDay(date, m)
  if (Array.isArray(m)) return m.some((d) => isSameDay(date, d))
  if ("dayOfWeek" in m) {
    const days = Array.isArray(m.dayOfWeek) ? m.dayOfWeek : [m.dayOfWeek]
    return days.includes(date.getDay())
  }
  if ("before" in m && "after" in m) {
    // An interval when `after` is before `before`; otherwise outside both bounds.
    if (isAfter(m.before, m.after)) return isAfter(date, m.after) && isBefore(date, m.before)
    return isBefore(date, startOfDay(m.before)) || isAfter(date, m.after)
  }
  if ("before" in m) return differenceInCalendarDays(m.before, date) > 0
  if ("after" in m) return differenceInCalendarDays(date, m.after) > 0
  if ("from" in m) {
    const { from, to } = m
    if (from && to) {
      const [a, b] = isAfter(from, to) ? [to, from] : [from, to]
      return differenceInCalendarDays(date, a) >= 0 && differenceInCalendarDays(b, date) >= 0
    }
    if (from) return isSameDay(date, from)
    if (to) return isSameDay(date, to)
  }
  return false
}

/** react-day-picker's `addToRange` (with `min` = 0). */
function addToRange(date: Date, range: DateRange | undefined, required: boolean): DateRange | undefined {
  const { from, to } = range ?? {}
  if (!from && !to) return { from: date, to: date }
  if (from && !to) {
    if (isSameDay(from, date)) return { from, to: date }
    if (isBefore(date, from)) return { from: date, to: from }
    return { from, to: date }
  }
  if (from && to) {
    if (isSameDay(from, date) && isSameDay(to, date)) return required ? { from, to } : undefined
    if (isSameDay(from, date)) return { from, to: date }
    if (isSameDay(to, date)) return { from: date, to: date }
    if (isBefore(date, from)) return { from: date, to }
    return { from, to: date }
  }
  return { from: date, to: date }
}

const defaultFormatters: Required<CalendarFormatters> = {
  formatCaption: (month, { locale }) => format(month, "LLLL y", { locale: locale as Locale }),
  formatMonthDropdown: (month, { locale }) => format(month, "LLLL", { locale: locale as Locale }),
  formatYearDropdown: (year) => String(year.getFullYear()),
  formatWeekdayName: (weekday, { locale }) => format(weekday, "cccccc", { locale: locale as Locale }),
  formatDay: (date) => String(date.getDate()),
  formatWeekNumber: (week) => (week < 10 ? `0${week}` : String(week)),
}

export function CalendarCore(props: CalendarOptions & { view: CalendarView; rootAttrs?: Record<string, unknown> }) {
  // A partial locale is accepted like react-day-picker; date-fns reads only what it needs.
  const locale = () => props.locale as Locale | undefined
  const weekStartsOn = () => props.weekStartsOn ?? (props.locale?.options?.weekStartsOn as CalendarBaseProps["weekStartsOn"]) ?? 0
  const today = () => startOfDay(props.today ?? new Date())
  const numberOfMonths = () => Math.max(1, props.numberOfMonths ?? 1)
  const captionLayout = () => props.captionLayout ?? "label"
  const fmt = <K extends keyof CalendarFormatters>(key: K) =>
    (props.formatters?.[key] ?? defaultFormatters[key]) as Required<CalendarFormatters>[K]
  const hasYearDropdown = () => captionLayout() === "dropdown" || captionLayout() === "dropdown-years"

  // Navigation bounds. Like react-day-picker, year dropdowns default to a 100-year range.
  const startMonth = createMemo(() =>
    props.startMonth
      ? startOfMonth(props.startMonth)
      : hasYearDropdown()
        ? startOfYear(addYears(today(), -100))
        : undefined
  )
  const endMonth = createMemo(() =>
    props.endMonth ? startOfMonth(props.endMonth) : hasYearDropdown() ? startOfMonth(endOfYear(today())) : undefined
  )
  const clampMonth = (month: Date) => {
    let m = startOfMonth(month)
    const start = startMonth()
    const end = endMonth()
    if (end && differenceInCalendarMonths(end, m) < numberOfMonths() - 1) m = addMonths(end, -(numberOfMonths() - 1))
    if (start && isBefore(m, start)) m = start
    return m
  }

  // Displayed month: controlled through `month`, otherwise internal.
  const [internalMonth, setInternalMonth] = createSignal(
    untrack(() => clampMonth(props.month ?? props.defaultMonth ?? props.today ?? new Date()))
  )
  const firstMonth = createMemo(() => (props.month ? startOfMonth(props.month) : internalMonth()))
  const goToMonth = (month: Date) => {
    const next = clampMonth(month)
    setInternalMonth(next)
    props.onMonthChange?.(next)
  }

  // Selection: controlled when `selected` is passed, otherwise internal.
  const [internalSelected, setInternalSelected] = createSignal<Date | Date[] | DateRange | undefined>(
    untrack(() => props.selected)
  )
  const isControlled = () => "selected" in props && props.selected !== undefined
  const selected = () => (isControlled() ? props.selected : internalSelected())

  const isSelected = (date: Date) => {
    const s = selected()
    if (!s) return false
    if (props.mode === "single") return s instanceof Date && isSameDay(s, date)
    if (props.mode === "multiple") return Array.isArray(s) && s.some((d) => isSameDay(d, date))
    if (props.mode === "range") return matchOne(date, s as DateRange)
    return false
  }

  const select = (date: Date) => {
    const s = selected()
    let next: Date | Date[] | DateRange | undefined
    if (props.mode === "single") {
      next = s instanceof Date && isSameDay(s, date) && !props.required ? undefined : date
    } else if (props.mode === "multiple") {
      const list = Array.isArray(s) ? s : []
      if (list.some((d) => isSameDay(d, date))) {
        const rest = list.filter((d) => !isSameDay(d, date))
        next = props.required && rest.length === 0 ? list : rest
      } else {
        next = [...list, date]
      }
    } else if (props.mode === "range") {
      next = addToRange(date, s as DateRange | undefined, !!props.required)
    } else {
      return
    }
    setInternalSelected(() => next)
    ;(props.onSelect as ((value: unknown) => void) | undefined)?.(next)
  }

  const months = createMemo(() => {
    const first = firstMonth()
    return Array.from({ length: numberOfMonths() }, (_, i) => {
      const month = addMonths(first, i)
      const gridStart = startOfWeek(startOfMonth(month), { weekStartsOn: weekStartsOn() })
      let gridEnd = endOfWeek(endOfMonth(month), { weekStartsOn: weekStartsOn() })
      if (props.fixedWeeks) gridEnd = addDays(gridStart, 6 * 7 - 1)
      const weeks: CalendarDay[][] = []
      for (let day = gridStart; !isAfter(day, gridEnd); day = addDays(day, 7)) {
        weeks.push(
          Array.from({ length: 7 }, (_, d) => {
            const date = addDays(day, d)
            return { date, displayMonth: month, outside: !isSameMonth(date, month) }
          })
        )
      }
      return { month, weeks }
    })
  })

  const lastMonth = () => addMonths(firstMonth(), numberOfMonths() - 1)
  const canGoPrevious = () => !startMonth() || isAfter(firstMonth(), startMonth()!)
  const canGoNext = () => !endMonth() || isBefore(lastMonth(), endMonth()!)

  const isDisabled = (date: Date) => matches(date, props.disabled)
  const isHidden = (day: CalendarDay) =>
    (day.outside && props.showOutsideDays === false) || matches(day.date, props.hidden)

  // Keyboard focus.
  // Same-day equality: focusing a day button after a keyboard move writes the same day again.
  const [focusedDay, setFocusedDay] = createSignal<Date | undefined>(undefined, {
    equals: (a, b) => a === b || (!!a && !!b && isSameDay(a, b)),
  })
  const visibleDays = createMemo(() =>
    months().flatMap((m) => m.weeks.flat().filter((d) => !d.outside))
  )
  // The day that takes Tab focus: the focused day, else the first selected day, else today,
  // else the first enabled day.
  const tabTarget = createMemo(() => {
    const days = visibleDays().filter((d) => !isDisabled(d.date) && !isHidden(d))
    const focused = focusedDay()
    if (focused && days.some((d) => isSameDay(d.date, focused))) return focused
    const firstSelected = days.find((d) => isSelected(d.date))
    if (firstSelected) return firstSelected.date
    const todayDay = days.find((d) => isSameDay(d.date, today()))
    if (todayDay) return todayDay.date
    return days[0]?.date
  })

  const moveFocus = (from: Date, key: string, shift: boolean) => {
    const step = (date: Date): Date => {
      switch (key) {
        case "ArrowLeft":
          return addDays(date, -1)
        case "ArrowRight":
          return addDays(date, 1)
        case "ArrowUp":
          return addDays(date, -7)
        case "ArrowDown":
          return addDays(date, 7)
        case "PageUp":
          return shift ? addYears(date, -1) : addMonths(date, -1)
        case "PageDown":
          return shift ? addYears(date, 1) : addMonths(date, 1)
        case "Home":
          return startOfWeek(date, { weekStartsOn: weekStartsOn() })
        case "End":
          return endOfWeek(date, { weekStartsOn: weekStartsOn() })
        default:
          return date
      }
    }
    let target = step(from)
    // Skip disabled days, moving on in the same direction (Home/End step one day back/forward).
    for (let i = 0; i < 365 && isDisabled(target); i++) {
      const next = key === "Home" ? addDays(target, 1) : key === "End" ? addDays(target, -1) : step(target)
      if (isSameDay(next, target)) break
      target = next
    }
    const start = startMonth()
    const end = endMonth()
    if (start && isBefore(target, start)) target = maxDate([target, start])
    if (end && isAfter(target, endOfMonth(end))) target = minDate([target, endOfMonth(end)])
    if (isBefore(target, firstMonth())) goToMonth(startOfMonth(target))
    else if (isAfter(target, endOfMonth(lastMonth())))
      goToMonth(addMonths(startOfMonth(target), -(numberOfMonths() - 1)))
    setFocusedDay(target)
  }

  const onDayKeyDown = (day: CalendarDay, event: KeyboardEvent) => {
    const keys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"]
    if (!keys.includes(event.key)) return
    event.preventDefault()
    event.stopPropagation()
    moveFocus(day.date, event.key, event.shiftKey)
  }

  if (untrack(() => props.autoFocus)) {
    queueMicrotask(() => setFocusedDay(tabTarget()))
  }

  const modifiersFor = (day: CalendarDay): DayModifiers => {
    const range = props.mode === "range" ? (selected() as DateRange | undefined) : undefined
    const sel = isSelected(day.date)
    const rangeStart = !!(range?.from && sel && isSameDay(day.date, range.from))
    const rangeEnd = !!(range?.to && sel && isSameDay(day.date, range.to))
    return {
      selected: sel,
      range_start: rangeStart,
      range_end: rangeEnd,
      range_middle: !!(range && sel && !rangeStart && !rangeEnd),
      today: isSameDay(day.date, today()),
      outside: day.outside,
      disabled: isDisabled(day.date),
      hidden: isHidden(day),
      focused: !!focusedDay() && isSameDay(day.date, focusedDay()!),
    }
  }

  let rootElement: HTMLDivElement | undefined
  const v = props.view
  const attrs = (name: CalendarSlot, modifiers?: DayModifiers) => v.slot(name, modifiers)

  const monthOptions = (displayMonth: Date) =>
    Array.from({ length: 12 }, (_, i) => {
      const m = setMonth(startOfMonth(displayMonth), i)
      const start = startMonth()
      const end = endMonth()
      const disabled = (!!start && isBefore(endOfMonth(m), start)) || (!!end && isAfter(m, endOfMonth(end)))
      return { value: i, label: fmt("formatMonthDropdown")(m, { locale: locale() }), disabled }
    })
  const yearOptions = () => {
    const start = startMonth() ?? startOfYear(addYears(today(), -100))
    const end = endMonth() ?? endOfYear(today())
    const years: number[] = []
    for (let y = start.getFullYear(); y <= end.getFullYear(); y++) years.push(y)
    return years
  }

  const Dropdown = (dp: { kind: "month" | "year"; month: Date; index: number }) => {
    const value = () => (dp.kind === "month" ? dp.month.getMonth() : dp.month.getFullYear())
    const label = () =>
      dp.kind === "month"
        ? fmt("formatMonthDropdown")(dp.month, { locale: locale() })
        : fmt("formatYearDropdown")(dp.month, { locale: locale() })
    return (
      <span {...attrs("dropdown_root")} data-disabled={undefined}>
        <select
          {...attrs("dropdown")}
          aria-label={dp.kind === "month" ? "Choose the Month" : "Choose the Year"}
          value={value()}
          onChange={(e) => {
            const n = Number(e.currentTarget.value)
            const changed = dp.kind === "month" ? setMonth(dp.month, n) : setYear(dp.month, n)
            goToMonth(addMonths(changed, -dp.index))
          }}
        >
          <Show
            when={dp.kind === "month"}
            fallback={
              <For each={yearOptions()}>
                {(year) => (
                  <option value={year} selected={year === value()}>
                    {fmt("formatYearDropdown")(new Date(year, 0, 1), { locale: locale() })}
                  </option>
                )}
              </For>
            }
          >
            <For each={monthOptions(dp.month)}>
              {(option) => (
                <option value={option.value} disabled={option.disabled} selected={option.value === value()}>
                  {option.label}
                </option>
              )}
            </For>
          </Show>
        </select>
        <span {...attrs("caption_label")} aria-hidden="true">
          {label()}
          <v.Chevron orientation="down" />
        </span>
      </span>
    )
  }

  return (
    <div
      ref={(el: HTMLDivElement) => (rootElement = el)}
      data-mode={props.mode}
      data-multiple-months={numberOfMonths() > 1 ? "true" : undefined}
      data-week-numbers={props.showWeekNumber ? "true" : undefined}
      {...props.rootAttrs}
      {...attrs("root")}
    >
      <div {...attrs("months")}>
        <nav {...attrs("nav")} aria-label="Navigation bar">
          <button
            type="button"
            {...attrs("button_previous")}
            aria-label="Go to the Previous Month"
            aria-disabled={canGoPrevious() ? undefined : "true"}
            tabindex={canGoPrevious() ? undefined : -1}
            onClick={() => {
              if (canGoPrevious()) goToMonth(addMonths(firstMonth(), -1))
            }}
          >
            <v.Chevron orientation="left" />
          </button>
          <button
            type="button"
            {...attrs("button_next")}
            aria-label="Go to the Next Month"
            aria-disabled={canGoNext() ? undefined : "true"}
            tabindex={canGoNext() ? undefined : -1}
            onClick={() => {
              if (canGoNext()) goToMonth(addMonths(firstMonth(), 1))
            }}
          >
            <v.Chevron orientation="right" />
          </button>
        </nav>
        <For each={months()}>
          {(m, index) => (
            <div {...attrs("month")}>
              <div {...attrs("month_caption")}>
                <Show
                  when={captionLayout() !== "label"}
                  fallback={
                    <span {...attrs("caption_label")} role="status" aria-live="polite">
                      {fmt("formatCaption")(m.month, { locale: locale() })}
                    </span>
                  }
                >
                  <div {...attrs("dropdowns")}>
                    <Show
                      when={captionLayout() !== "dropdown-years"}
                      fallback={
                        <span {...attrs("caption_label")}>{format(m.month, "LLLL", { locale: locale() })}</span>
                      }
                    >
                      <Dropdown kind="month" month={m.month} index={index()} />
                    </Show>
                    <Show
                      when={captionLayout() !== "dropdown-months"}
                      fallback={<span {...attrs("caption_label")}>{m.month.getFullYear()}</span>}
                    >
                      <Dropdown kind="year" month={m.month} index={index()} />
                    </Show>
                  </div>
                </Show>
              </div>
              <table
                role="grid"
                {...attrs("month_grid")}
                aria-multiselectable={props.mode === "multiple" || props.mode === "range" ? "true" : undefined}
                aria-label={fmt("formatCaption")(m.month, { locale: locale() })}
              >
                <thead aria-hidden="true">
                  <tr {...attrs("weekdays")}>
                    <Show when={props.showWeekNumber}>
                      <th {...attrs("week_number_header")} aria-label="Week Number" scope="col" />
                    </Show>
                    <For each={m.weeks[0]}>
                      {(day) => (
                        <th {...attrs("weekday")} aria-label={format(day.date, "cccc", { locale: locale() })} scope="col">
                          {fmt("formatWeekdayName")(day.date, { locale: locale() })}
                        </th>
                      )}
                    </For>
                  </tr>
                </thead>
                <tbody {...attrs("weeks")}>
                  <For each={m.weeks}>
                    {(week) => (
                      <tr {...attrs("week")}>
                        <Show when={props.showWeekNumber}>
                          <td {...attrs("week_number")} role="rowheader">
                            <v.WeekNumber>
                              {fmt("formatWeekNumber")(
                                getWeek(week[0].date, { weekStartsOn: weekStartsOn(), locale: locale() as Locale })
                              )}
                            </v.WeekNumber>
                          </td>
                        </Show>
                        <For each={week}>
                          {(day) => {
                            const modifiers = createMemo(() => modifiersFor(day))
                            const mods: DayModifiers = {
                              get selected() {
                                return modifiers().selected
                              },
                              get range_start() {
                                return modifiers().range_start
                              },
                              get range_middle() {
                                return modifiers().range_middle
                              },
                              get range_end() {
                                return modifiers().range_end
                              },
                              get today() {
                                return modifiers().today
                              },
                              get outside() {
                                return modifiers().outside
                              },
                              get disabled() {
                                return modifiers().disabled
                              },
                              get hidden() {
                                return modifiers().hidden
                              },
                              get focused() {
                                return modifiers().focused
                              },
                            }
                            return (
                              <td
                                role="gridcell"
                                {...attrs("day", modifiers())}
                                data-day={format(day.date, "yyyy-MM-dd")}
                                data-month={day.outside ? format(day.displayMonth, "yyyy-MM") : undefined}
                                data-selected={modifiers().selected ? "true" : undefined}
                                data-disabled={modifiers().disabled ? "true" : undefined}
                                data-hidden={modifiers().hidden ? "true" : undefined}
                                data-outside={day.outside ? "true" : undefined}
                                data-focused={modifiers().focused ? "true" : undefined}
                                data-today={modifiers().today ? "true" : undefined}
                                aria-selected={modifiers().selected ? "true" : undefined}
                              >
                                <Show when={!modifiers().hidden}>
                                  <v.DayButton
                                    day={day}
                                    modifiers={mods}
                                    locale={locale()}
                                    tabindex={tabTarget() && isSameDay(tabTarget()!, day.date) ? 0 : -1}
                                    disabled={modifiers().disabled}
                                    aria-label={`${modifiers().today ? "Today, " : ""}${format(day.date, "PPPP", {
                                      locale: locale() as Locale,
                                    })}${modifiers().selected ? ", selected" : ""}`}
                                    onClick={() => {
                                      if (!modifiers().disabled) select(day.date)
                                    }}
                                    onFocus={() => {
                                      // A keyboard move already set it; focusing the button must not write again.
                                      const current = untrack(focusedDay)
                                      if (!current || !isSameDay(current, day.date)) setFocusedDay(day.date)
                                    }}
                                    onBlur={(event) => {
                                      // Keep the focused day while focus moves to another day, or when
                                      // the button goes away because the month changed.
                                      const stillShown = untrack(months).some((m) =>
                                        m.weeks.some((w) => w.some((d) => isSameDay(d.date, day.date)))
                                      )
                                      if (!stillShown || !(event.currentTarget as Element).isConnected) return
                                      const next = event.relatedTarget
                                      const toDay = next instanceof Element && !!rootElement?.contains(next) && !!next.closest("td")
                                      if (!toDay) setFocusedDay(undefined)
                                    }}
                                    onKeyDown={(event) => onDayKeyDown(day, event)}
                                  >
                                    {fmt("formatDay")(day.date, { locale: locale() })}
                                  </v.DayButton>
                                </Show>
                              </td>
                            )
                          }}
                        </For>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>
          )}
        </For>
      </div>
    </div>
  )
}

/** Focuses the day button when its day becomes the keyboard-focused day (react-day-picker's `modifiers.focused`). */
export function useFocusOnFocused(modifiers: DayModifiers, element: () => HTMLElement | undefined) {
  createEffect(
    () => modifiers.focused,
    (focused) => {
      if (focused && document.activeElement !== element()) element()?.focus()
    }
  )
}
